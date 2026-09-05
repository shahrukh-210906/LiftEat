import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import type { Profile } from '@/lib/types';
import { toast } from 'sonner';
type User = { id: string; email: string; fullName: string };
type Result = Promise<{ error: Error | null }>;
interface AuthContextType {
  user: User | null; profile: Profile | null; loading: boolean;
  signUp: (email: string, password: string, name: string) => Result;
  signIn: (email: string, password: string) => Result;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Result;
  refreshProfile: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const failure = (error: any) => ({ error: new Error(error.response?.data?.error || error.message || 'Authentication failed') });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const signingIn = useRef(false);
  const refreshProfile = async () => {
    const identity = auth.currentUser;
    if (!identity) return;
    const { data } = await api.get<Profile>('/profile');
    if (auth.currentUser?.uid !== identity.uid) return;
    setProfile(data);
    setUser({ id: data.user, email: identity.email || '', fullName: data.full_name || identity.displayName || 'Athlete' });
  };
  useEffect(() => onAuthStateChanged(auth, identity => {
    if (signingIn.current) return;
    setUser(null); setProfile(null);
    if (!identity) { setLoading(false); return; }
    setLoading(true);
    refreshProfile().catch(error => toast.error(failure(error).error.message)).finally(() => setLoading(false));
  }), []);
  const signUp = async (email: string, password: string, name: string) => {
    signingIn.current = true;
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateFirebaseProfile(result.user, { displayName: name.trim() });
      await result.user.getIdToken(true);
      await api.put('/profile', { full_name: name.trim() });
      await refreshProfile();
      return { error: null };
    } catch (error) { return failure(error); }
    finally { signingIn.current = false; setLoading(false); }
  };
  const signIn = async (email: string, password: string) => {
    signingIn.current = true;
    setLoading(true);
    try { await signInWithEmailAndPassword(auth, email.trim(), password); await refreshProfile(); return { error: null }; }
    catch (error) { return failure(error); }
    finally { signingIn.current = false; setLoading(false); }
  };
  const signOut = async () => {
    try { await firebaseSignOut(auth); setUser(null); setProfile(null); localStorage.removeItem('token'); localStorage.removeItem('user'); }
    catch { toast.error('Could not sign out'); }
  };
  const updateProfile = async (updates: Partial<Profile>) => {
    try { const { data } = await api.put<Profile>('/profile', updates); setProfile(data); return { error: null }; }
    catch (error) { return failure(error); }
  };
  return <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile, refreshProfile }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

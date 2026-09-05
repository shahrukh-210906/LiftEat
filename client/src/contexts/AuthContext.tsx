import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { Profile } from '@/lib/types';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setProfile(data);
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  useEffect(() => {
    const clearSession = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
    };
    const interceptor = api.interceptors.response.use(response => response, error => {
      if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) clearSession();
      return Promise.reject(error);
    });
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      try {
        if (token && storedUser) {
          const parsed = JSON.parse(storedUser);
          if (!parsed?.id || !parsed?.email) throw new Error('Invalid saved session');
          const { data } = await api.get('/profile');
          setProfile(data);
          setUser(parsed);
        }
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data } = await api.post('/auth/signup', { email, password, fullName });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      await refreshProfile();
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.response?.data?.error || 'Signup failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/signin', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      await refreshProfile();
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.response?.data?.error || 'Login failed') };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
    toast.success('Signed out successfully');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data } = await api.put('/profile', updates);
      setProfile(data);
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.response?.data?.error || 'Update failed') };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

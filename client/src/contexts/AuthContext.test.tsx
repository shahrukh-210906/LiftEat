// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
const mocks = vi.hoisted(() => ({ auth: { currentUser: null as any }, get: vi.fn(), put: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), observer: null as any }));
vi.mock('@/lib/firebase', () => ({ auth: mocks.auth }));
vi.mock('@/lib/api', () => ({ default: { get: mocks.get, put: mocks.put } }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, cb: any) => { mocks.observer = cb; cb(null); return () => {}; },
  signInWithEmailAndPassword: mocks.signIn, signOut: mocks.signOut,
  createUserWithEmailAndPassword: vi.fn(), updateProfile: vi.fn(),
}));
beforeEach(() => { vi.clearAllMocks(); mocks.auth.currentUser = null; });
afterEach(cleanup);
it('Firebase signin exposes the MongoDB user ID and profile expected by app screens', async () => {
  mocks.signIn.mockImplementation(async () => { mocks.auth.currentUser = { uid: 'firebase-uid', email: 'alice@example.com' }; mocks.observer(mocks.auth.currentUser); });
  mocks.get.mockResolvedValue({ data: { user: 'mongo-id', full_name: 'Alice', daily_protein_goal: 150 } });
  mocks.signOut.mockImplementation(async () => { mocks.auth.currentUser = null; mocks.observer(null); });
  const { result } = renderHook(useAuth, { wrapper: AuthProvider });
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => { expect((await result.current.signIn('alice@example.com', 'password')).error).toBeNull(); });
  expect(result.current.user?.id).toBe('mongo-id');
  expect(result.current.profile?.daily_protein_goal).toBe(150);
  expect(mocks.get).toHaveBeenCalledTimes(1);
  await act(async () => result.current.signOut());
  expect(result.current.user).toBeNull();
  expect(result.current.profile).toBeNull();
});
it('backend account sync failure is reported instead of presenting a successful login', async () => {
  mocks.signIn.mockImplementation(async () => { mocks.auth.currentUser = { uid: 'firebase-uid' }; });
  mocks.get.mockRejectedValue({ response: { data: { error: 'Account sync unavailable' } } });
  const { result } = renderHook(useAuth, { wrapper: AuthProvider });
  await act(async () => { expect((await result.current.signIn('alice@example.com', 'password')).error?.message).toBe('Account sync unavailable'); });
  expect(result.current.user).toBeNull();
  expect(result.current.loading).toBe(false);
});

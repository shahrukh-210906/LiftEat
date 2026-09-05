// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useDiet } from './useDiet';
import { useWorkoutSession } from './useWorkoutSession';
import AIChat from '@/pages/AIChat';
import Diet from '@/pages/Diet';

const { get, post, put, remove, user } = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), remove: vi.fn(), user: { id: 'user-1' },
}));
vi.mock('@/lib/api', () => ({ default: { get, post, put, delete: remove } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user, profile: null }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/components/layout/AppLayout', () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
beforeEach(() => { vi.resetAllMocks(); Element.prototype.scrollIntoView = vi.fn(); });
afterEach(cleanup);
const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{children}</MemoryRouter>;

describe('nutrition data flow', () => {
  it('loads food choices and existing meals from the mounted routes', async () => {
    get.mockImplementation(async (path: string) => ({ data: path === '/diet/foods'
      ? [{ _id: 'food-1', name: 'Rice' }]
      : [{ _id: 'log-1', calories: 130, protein: 3, carbs: 28, fat: 1 }] }));
    const { result } = renderHook(() => useDiet());
    await waitFor(() => expect(result.current.foodItems).toHaveLength(1));
    expect(get).toHaveBeenCalledWith('/diet/foods');
    expect(result.current.totals.calories).toBe(130);
    await act(() => result.current.deleteLog('log-1'));
    expect(remove).toHaveBeenCalledWith('/diet/log/log-1');
  });
});
describe('workout session flow', () => {
  it('keeps completed workout duration fixed', async () => {
    get.mockResolvedValue({ data: { session: { _id: 'session', name: 'Legs', is_active: false,
      started_at: '2026-01-01T10:00:00Z', completed_at: '2026-01-01T10:30:00Z' }, exercises: [] } });
    const { result } = renderHook(() => useWorkoutSession('session'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.elapsedTime).toBe(1800);
  });
  it('adds an exercise to a quick workout', async () => {
    get.mockResolvedValue({ data: { session: { _id: 'session', name: 'Quick', is_active: true }, exercises: [] } });
    post.mockResolvedValue({ data: { _id: 'exercise-1', exercise_name: 'Squat', sets: [] } });
    const { result } = renderHook(() => useWorkoutSession('session'), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.addExercise('base-1'));
    expect(post).toHaveBeenCalledWith('/workouts/session/exercises', { exerciseId: 'base-1' });
    expect(result.current.exercises[0].exercise_name).toBe('Squat');
  });
});
it('renders saved assistant markdown without an unsupported prop', async () => {
  get.mockResolvedValue({ data: [{ id: 'message-1', role: 'assistant', content: '**Welcome back**' }] });
  render(<AIChat />);
  await waitFor(() => expect(screen.getByText('Welcome back').tagName).toBe('STRONG'));
});
it('nutrition buttons open the food picker and delete an existing meal', async () => {
  get.mockImplementation(async (path: string) => ({ data: path === '/diet/foods'
    ? [{ _id: 'food-1', name: 'Rice', calories_per_100g: 130 }]
    : [{ _id: 'log-1', food_name: 'Lunch', quantity_g: 100, calories: 130, protein: 3 }] }));
  render(<Diet />);
  await waitFor(() => expect(screen.getByText('Lunch')).toBeTruthy());
  fireEvent.click(screen.getByRole('button', { name: 'Delete Lunch' }));
  await waitFor(() => expect(remove).toHaveBeenCalledWith('/diet/log/log-1'));
  fireEvent.click(screen.getByRole('button', { name: 'Add Food' }));
  expect(screen.getByRole('dialog')).toBeTruthy();
  fireEvent.click(screen.getByText('Rice'));
  fireEvent.click(screen.getByRole('button', { name: 'Add Log' }));
  await waitFor(() => expect(post).toHaveBeenCalledWith('/diet/log', expect.objectContaining({ food_name: 'Rice', quantity_g: 100, calories: 130 })));
});

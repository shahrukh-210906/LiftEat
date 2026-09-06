// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { GenerateWorkout } from './GenerateWorkout';
const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/lib/api', () => ({ default: { post } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
it('requires review before saving and displays prescription targets', async () => {
  post.mockResolvedValueOnce({ data: { _id: 'draft', name: 'Leg day', ai: { rationale: 'Recent training' }, exercises: [{ exercise: { _id: 'squat', name: 'Squat' }, sets: 3, reps: 8, rest_seconds: 90 }] } }).mockResolvedValueOnce({ data: {} });
  const saved = vi.fn();
  render(<GenerateWorkout onSaved={saved} />);
  fireEvent.click(screen.getByText('Generate workout'));
  await screen.findByText('Leg day');
  expect(post).toHaveBeenCalledTimes(1);
  expect(screen.getByText('3 sets × 8 reps · Rest 90s')).toBeTruthy();
  fireEvent.click(screen.getByText('Save to my routines'));
  await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
  expect(post).toHaveBeenLastCalledWith('/workouts/ai/draft/save');
});
it('shows generation errors without presenting a save action', async () => {
  post.mockRejectedValue({ response: { data: { error: 'Could not generate a valid workout.' } } });
  render(<GenerateWorkout onSaved={() => {}} />);
  fireEvent.click(screen.getByText('Generate workout'));
  await screen.findByRole('alert');
  expect(screen.queryByText('Save to my routines')).toBeNull();
});

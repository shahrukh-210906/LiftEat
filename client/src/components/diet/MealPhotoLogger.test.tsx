// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MealPhotoLogger } from './MealPhotoLogger';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/lib/api', () => ({ default: { post } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('analyzes a photo, requires review, and saves the confirmed meal', async () => {
  post.mockResolvedValueOnce({ data: { id: 'photo-draft', items: [{ name: 'Chicken', quantity_g: 100, calories: 165, protein: 31, carbs: 0, fat: 4 }], assumptions: ['Grilled without visible sauce.'] } }).mockResolvedValueOnce({ data: {} });
  const saved = vi.fn();
  render(<MealPhotoLogger onSaved={saved} />);
  const file = new File([new Uint8Array([137, 80, 78, 71])], 'meal.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('Meal photo'), { target: { files: [file] } });
  fireEvent.click(screen.getByText('Analyze photo'));
  await screen.findByText('Review detected foods');
  expect(post.mock.calls[0][0]).toBe('/diet/photo/estimate');
  expect(post.mock.calls[0][1]).toBeInstanceOf(FormData);
  fireEvent.change(screen.getByLabelText('Photo quantity_g 1'), { target: { value: '200' } });
  expect((screen.getByLabelText('Photo calories 1') as HTMLInputElement).value).toBe('330');
  fireEvent.click(screen.getByText('Confirm photo meal'));
  await waitFor(() => expect(saved).toHaveBeenCalledOnce());
  expect(post.mock.calls[1][0]).toBe('/diet/estimate/photo-draft/save');
  expect(post.mock.calls[1][1].items[0].calories).toBe(330);
});

it('rejects unsupported or oversized files before upload', () => {
  render(<MealPhotoLogger onSaved={() => {}} />);
  fireEvent.change(screen.getByLabelText('Meal photo'), { target: { files: [new File(['x'], 'meal.txt', { type: 'text/plain' })] } });
  expect(screen.getByRole('alert').textContent).toMatch(/JPEG/);
  expect(post).not.toHaveBeenCalled();
});

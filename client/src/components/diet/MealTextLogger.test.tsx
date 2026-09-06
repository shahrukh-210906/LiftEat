// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { it, expect, vi, afterEach } from 'vitest';
import { MealTextLogger } from './MealTextLogger';
const {post}=vi.hoisted(()=>({post:vi.fn()}));
vi.mock('@/lib/api',()=>({default:{post}}));
afterEach(()=>{cleanup();vi.resetAllMocks();});
it('reviews and scales portions before explicitly saving',async()=>{
 post.mockResolvedValueOnce({data:{id:'draft',items:[{name:'Rice',quantity_g:100,calories:130,protein:3,carbs:28,fat:1}],assumptions:['Cooked rice']}}).mockResolvedValueOnce({data:{}});
 const saved=vi.fn();render(<MealTextLogger onSaved={saved}/>);
 fireEvent.change(screen.getByLabelText('Meal description'),{target:{value:'Rice'}});fireEvent.click(screen.getByText('Estimate meal'));await screen.findByText('Cooked rice');expect(post).toHaveBeenCalledTimes(1);
 fireEvent.change(screen.getByLabelText('quantity_g 1'),{target:{value:'200'}});
 expect((screen.getByLabelText('calories 1') as HTMLInputElement).value).toBe('260');
 fireEvent.click(screen.getByText('Confirm and log meal'));await waitFor(()=>expect(saved).toHaveBeenCalledOnce());
 expect(post.mock.calls[1][1].items[0].calories).toBe(260);
});
it('shows an estimate failure without a save button',async()=>{
 post.mockRejectedValue({response:{data:{error:'Please describe a food'}}});render(<MealTextLogger onSaved={()=>{}}/>);
 fireEvent.change(screen.getByLabelText('Meal description'),{target:{value:'hello'}});fireEvent.click(screen.getByText('Estimate meal'));await screen.findByRole('alert');expect(screen.queryByText('Confirm and log meal')).toBeNull();
});

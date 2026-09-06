// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { it, expect, vi, afterEach } from 'vitest';
import { ProactiveInsights } from './ProactiveInsights';
const {get,post}=vi.hoisted(()=>({get:vi.fn(),post:vi.fn()}));
vi.mock('@/lib/api',()=>({default:{get,post}}));
vi.mock('@/contexts/AuthContext',()=>({useAuth:()=>({user:{id:'u'}})}));
afterEach(()=>{cleanup();vi.resetAllMocks();});
it('loads without prompting and dismisses only after server success',async()=>{
 get.mockResolvedValue({data:{computed_at:new Date().toISOString(),cards:[{id:'card',title:'Your training week',body:'One logged session',action:'Review',href:'/workout'}],refreshing:false}});post.mockResolvedValue({});
 render(<MemoryRouter><ProactiveInsights/></MemoryRouter>);await screen.findByText('Your training week');
 expect(get).toHaveBeenCalledWith('/dashboard/insights',expect.anything());fireEvent.click(screen.getByLabelText('Dismiss Your training week'));await waitFor(()=>expect(screen.queryByText('Your training week')).toBeNull());
 expect(post).toHaveBeenCalledWith('/dashboard/insights/card/dismiss');
});
it('reports network failure without inventing activity insights',async()=>{
 get.mockRejectedValue(Error());render(<MemoryRouter><ProactiveInsights/></MemoryRouter>);await screen.findByRole('status');expect(screen.queryByText('Your training week')).toBeNull();
});

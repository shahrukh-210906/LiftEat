// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { it, expect, vi, afterEach } from 'vitest';
import { ProgressionHint } from './ProgressionHint';
const {get}=vi.hoisted(()=>({get:vi.fn()}));
vi.mock('@/lib/api',()=>({default:{get}}));
afterEach(()=>{cleanup();vi.resetAllMocks();});
it('applies a suggested load only after explicit review',async()=>{
 get.mockResolvedValue({data:{decision:'increase',weight_kg:52.5,reps:8,reason:'Two consistent sessions.',evidence:[]}});
 const apply=vi.fn();render(<ProgressionHint exerciseId="ex" onApply={apply}/>);
 fireEvent.click(screen.getByText('Check progression'));await screen.findByText('Ready for a small increase');expect(apply).not.toHaveBeenCalled();
 fireEvent.click(screen.getByText('Use 52.5 kg × 8 reps'));expect(apply).toHaveBeenCalledWith('52.5','8');
 fireEvent.change(screen.getByLabelText('Equipment increment in kg'),{target:{value:'1'}});await waitFor(()=>expect(screen.queryByText('Use 52.5 kg × 8 reps')).toBeNull());
});

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AIChatMessage } from '@/lib/types';
import { toast } from 'sonner';

export function useChat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) fetchHistory(); }, [user]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchHistory = async () => {
    try { const { data } = await api.get('/chat/history'); setMessages(data); } 
    catch { console.error('Failed to load history'); }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    
    // Optimistic UI
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      user_id: user?.id || '', 
      role: 'user', 
      content: text, 
      created_at: new Date().toISOString() 
    }]);

    try {
      const { data } = await api.post('/chat', {
        message: text,
        profile: profile ? { 
           fitness_goal: profile.fitness_goal, 
           weight: profile.weight_kg 
        } : null
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        user_id: 'ai',
        role: 'assistant',
        content: data.reply,
        created_at: new Date().toISOString()
      }]);
    } catch {
      setMessages(prev => prev.slice(0, -1));
      toast.error('AI failed to respond');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (isLoading) return;
    try {
      await api.delete('/chat/history');
      setMessages([]);
    } catch { toast.error('Could not clear chat'); }
  };

  return { messages, sendMessage, clearChat, isLoading, endRef };
}

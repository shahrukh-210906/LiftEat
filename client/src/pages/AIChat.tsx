import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AIChatMessage } from '@/lib/types';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIChat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/chat/history');
      setMessages(data);
    } catch (error) {
      console.error('Failed to load chat history');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Optimistic Update
    const tempId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { 
        id: tempId, 
        user_id: user?.id || '', 
        role: 'user', 
        content: userMessage,
        created_at: new Date().toISOString()
      }
    ]);

    try {
      // Send to your backend
      const { data } = await api.post('/chat', {
        message: userMessage,
        profile: profile 
          ? {
              body_type: profile.body_type,
              fitness_goal: profile.fitness_goal,
              weight_kg: profile.weight_kg,
              height_cm: profile.height_cm,
              age: profile.age,
              gender: profile.gender,
            }
          : null,
      });

      // Add AI Response
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          user_id: 'ai',
          role: 'assistant',
          content: data.reply, // <--- ✅ CHANGED to matches backend
          created_at: new Date().toISOString()
        }
      ]);
      
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await api.delete('/chat/history');
      setMessages([]);
      toast.success('Chat cleared');
    } catch (error) {
      toast.error('Failed to clear chat');
    }
  };

  const quickPrompts = [
    "Create a workout plan for muscle building",
    "What should I eat before a workout?",
    "How can I improve my squat form?",
    "Design a diet plan for weight loss",
  ];

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-lg mx-auto">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Coach</h1>
              <p className="text-xs text-muted-foreground">Your fitness assistant</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="space-y-6 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Ask me anything about fitness!</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  I can create workout plans, diet recommendations, and answer your fitness questions.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">Try these:</p>
                <div className="grid gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setInput(prompt);
                      }}
                      className="glass-card p-3 text-left text-sm hover:bg-muted transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-primary'
                      : 'bg-gradient-to-br from-primary to-accent'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div
                  className={`flex-1 p-3 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'glass-card mr-12'
                  }`}
                >
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="glass-card p-3 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 glass-card border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask your AI coach..."
              className="bg-secondary border-border"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="btn-primary-gradient px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
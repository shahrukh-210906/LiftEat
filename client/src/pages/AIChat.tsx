import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Trash2, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChat } from "@/hooks/useChat";

export default function AIChat() {
  const { messages, sendMessage, clearChat, isLoading, endRef } = useChat();
  const [input, setInput] = useState("");

  const handleSend = () => {
    sendMessage(input);
    setInput("");
  };

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
              <p className="text-xs text-muted-foreground">
                Your fitness assistant
              </p>
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
          {messages.length === 0 && (
            <div className="text-center mt-8 space-y-4">
              <Sparkles className="w-12 h-12 mx-auto text-primary" />
              <p className="text-muted-foreground">
                Ask me for a workout plan!
              </p>
              <Button
                variant="outline"
                onClick={() => setInput("Plan a leg workout")}
              >
                "Plan a leg workout"
              </Button>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary" : "bg-white/10"}`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`p-3 rounded-xl max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"}`}
              >
                <ReactMarkdown className="prose prose-invert prose-sm">
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <Loader2 className="w-6 h-6 animate-spin mx-auto opacity-50" />
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-4 glass-card border-t border-border flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask your coach..."
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input}
            className="btn-primary-gradient px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

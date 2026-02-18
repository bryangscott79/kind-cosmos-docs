import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Eye, Trash2, Minimize2 } from "lucide-react";
import { useArgus } from "@/contexts/ArgusContext";

function ArgusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function ArgusChat() {
  const { isOpen, messages, contextLabel, sending, open, close, toggle, sendMessage, clear } = useArgus();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // FAB button (always visible when chat is closed)
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          if (messages.length === 0) {
            open("", "", "Hey — I'm Argus, your market intelligence analyst. Ask me anything about your signals, prospects, or industries. You can also start a conversation from any report, prospect card, or signal.");
          } else {
            toggle();
          }
        }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 transition-all"
        title="Chat with Argus"
      >
        <ArgusIcon className="h-7 w-7" />
      </button>
    );
  }

  // Chat panel
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[380px] h-[520px] max-h-[80vh] rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-700 text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <ArgusIcon className="h-5 w-5" />
          <div>
            <h3 className="text-sm font-bold leading-none">Argus</h3>
            <p className="text-[9px] text-white/70 mt-0.5">
              {contextLabel || "Market Intelligence Assistant"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <button onClick={clear} className="rounded-md p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Clear chat">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={close} className="rounded-md p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Minimize">
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => { close(); clear(); }} className="rounded-md p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="Close">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Context badge */}
      {contextLabel && (
        <div className="px-4 py-2 bg-violet-50 border-b border-violet-100 flex items-center gap-1.5">
          <Eye className="h-3 w-3 text-violet-600 shrink-0" />
          <span className="text-[10px] text-violet-700 font-medium truncate">Viewing: {contextLabel}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary text-foreground rounded-bl-md"
            }`}>
              <div className="text-[12px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-violet-600" />
                <span className="text-[11px] text-muted-foreground">Argus is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (when conversation just started) */}
      {messages.length <= 1 && !sending && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {[
            "What should I prioritize this week?",
            "Which prospects are hottest right now?",
            "Summarize the top signals",
          ].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Argus anything..."
            disabled={sending}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-700 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

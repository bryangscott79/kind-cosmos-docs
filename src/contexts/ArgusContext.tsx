import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { track, EVENTS } from "@/lib/analytics";

interface ArgusMessage {
  role: "user" | "assistant";
  content: string;
}

interface ArgusContextType {
  isOpen: boolean;
  messages: ArgusMessage[];
  context: string;
  contextLabel: string;
  open: (context?: string, label?: string, greeting?: string) => void;
  close: () => void;
  toggle: () => void;
  sendMessage: (message: string) => Promise<void>;
  sending: boolean;
  clear: () => void;
}

const ArgusContext = createContext<ArgusContextType>({
  isOpen: false,
  messages: [],
  context: "",
  contextLabel: "",
  open: () => {},
  close: () => {},
  toggle: () => {},
  sendMessage: async () => {},
  sending: false,
  clear: () => {},
});

export function ArgusProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ArgusMessage[]>([]);
  const [context, setContext] = useState("");
  const [contextLabel, setContextLabel] = useState("");
  const [sending, setSending] = useState(false);
  const { persona } = useAuth();

  const open = useCallback((ctx?: string, label?: string, greeting?: string) => {
    if (ctx) setContext(ctx);
    if (label) setContextLabel(label);
    setIsOpen(true);
    if (greeting) {
      // If opening with new context, reset conversation and add greeting
      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const clear = useCallback(() => {
    setMessages([]);
    setContext("");
    setContextLabel("");
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    const userMsg: ArgusMessage = { role: "user", content: message };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    track(EVENTS.ARGUS_ASKED, { contextLabel: contextLabel || undefined });

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const { data: result, error } = await supabase.functions.invoke("argus-chat", {
        body: { messages: allMessages, context, persona: persona.key },
      });

      if (error) throw new Error(error.message);
      if (!result?.success) throw new Error(result?.error || "Failed to get response");

      setMessages(prev => [...prev, { role: "assistant", content: result.message }]);
    } catch (err: any) {
      console.error("Argus error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I hit a snag processing that. Could you try rephrasing, or try again in a moment?",
      }]);
    } finally {
      setSending(false);
    }
  }, [messages, context, persona]);

  return (
    <ArgusContext.Provider value={{ isOpen, messages, context, contextLabel, open, close, toggle, sendMessage, sending, clear }}>
      {children}
    </ArgusContext.Provider>
  );
}

export function useArgus() {
  return useContext(ArgusContext);
}

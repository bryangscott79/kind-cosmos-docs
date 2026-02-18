import { MessageCircle } from "lucide-react";
import { useArgus } from "@/contexts/ArgusContext";

interface AskArgusProps {
  context: string;
  label: string;
  greeting?: string;
  compact?: boolean;
}

export default function AskArgus({ context, label, greeting, compact }: AskArgusProps) {
  const { open } = useArgus();

  const defaultGreeting = `I'm looking at ${label}. What would you like to know? I can help with strategy, next steps, talking points, competitive analysis, or anything else you need.`;

  if (compact) {
    return (
      <button
        onClick={() => open(context, label, greeting || defaultGreeting)}
        className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700 hover:bg-violet-100 transition-colors"
      >
        <MessageCircle className="h-3 w-3" />
        Ask Argus
      </button>
    );
  }

  return (
    <button
      onClick={() => open(context, label, greeting || defaultGreeting)}
      className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5 text-xs font-semibold text-violet-700 hover:from-violet-100 hover:to-indigo-100 hover:border-violet-300 transition-all group"
    >
      <MessageCircle className="h-4 w-4 text-violet-600 group-hover:scale-110 transition-transform" />
      Start a conversation about this
    </button>
  );
}

import { MessageCircle } from "lucide-react";
import { useArgus } from "@/contexts/ArgusContext";
import { useAuth } from "@/contexts/AuthContext";

interface AskArgusProps {
  context: string;
  label: string;
  greeting?: string;
  compact?: boolean;
}

export default function AskArgus({ context, label, greeting, compact }: AskArgusProps) {
  const { open } = useArgus();
  const { persona } = useAuth();

  // Inject persona context so Argus adapts its recommendations
  const personaPrefix = `User Role: ${persona.label}\nPerspective: ${
    persona.key === "job_seeker" ? "Help this user find career opportunities and prepare applications. Frame prospects as potential employers, not sales targets."
    : persona.key === "hr" ? "Help this user understand workforce implications and hiring trends. Focus on talent strategy."
    : persona.key === "investor" ? "Help this user evaluate market opportunities and investment potential. Focus on trends and risk/reward."
    : persona.key === "lobbyist" ? "Help this user understand policy implications and stakeholder dynamics."
    : "Help this user identify sales and business development opportunities."
  }\n\n`;
  
  const fullContext = personaPrefix + context;

  const defaultGreeting = `I'm looking at ${label}. What would you like to know? I can help with ${
    persona.key === "job_seeker" ? "career strategy, interview prep, industry trends, or application tips"
    : persona.key === "hr" ? "workforce trends, hiring strategy, talent signals, or competitive analysis"
    : persona.key === "investor" ? "market analysis, risk assessment, trend evaluation, or due diligence"
    : "strategy, next steps, talking points, competitive analysis, or outreach"
  }.`;

  if (compact) {
    return (
      <button
        onClick={() => open(fullContext, label, greeting || defaultGreeting)}
        className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700 hover:bg-violet-100 transition-colors"
      >
        <MessageCircle className="h-3 w-3" />
        Ask Argus
      </button>
    );
  }

  return (
    <button
      onClick={() => open(fullContext, label, greeting || defaultGreeting)}
      className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5 text-xs font-semibold text-violet-700 hover:from-violet-100 hover:to-indigo-100 hover:border-violet-300 transition-all group"
    >
      <MessageCircle className="h-4 w-4 text-violet-600 group-hover:scale-110 transition-transform" />
      Start a conversation about this
    </button>
  );
}

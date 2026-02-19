// Persona-adaptive configuration layer
// Same data engine, different presentation per user type

export type PersonaKey = "sales" | "founder" | "executive" | "hr" | "job_seeker" | "investor" | "consultant" | "analyst" | "lobbyist";

export interface PersonaConfig {
  key: PersonaKey;
  label: string;
  navGroupLabel: string;        // replaces "Sales" in sidebar
  prospectLabel: string;        // replaces "Prospects"
  prospectLabelSingular: string;
  pipelineLabel: string;        // replaces "Pipeline"
  outreachLabel: string;        // replaces "Outreach"
  scoreLabel: string;           // replaces "VIGYL Score"
  scoreTip: string;             // tooltip for the score
  primaryView: string;          // default landing page after onboarding
  heroFeature: "briefing" | "ai_impact" | "prospects" | "signals";
  signalPriority: string[];     // signal types to prioritize
  whyNowLabel: string;          // replaces "Why Now"
  addToPipelineLabel: string;   // replaces "Add to Pipeline"
  outreachCTA: string;          // replaces "Generate Outreach"
  dossierLabel: string;         // replaces "Dossier"
  welcomeMessage: string;       // first-run greeting
  emptyProspectsMessage: string;
}

export const PERSONA_CONFIGS: Record<string, PersonaConfig> = {
  sales: {
    key: "sales",
    label: "Sales",
    navGroupLabel: "Sales",
    prospectLabel: "Prospects",
    prospectLabelSingular: "Prospect",
    pipelineLabel: "Pipeline",
    outreachLabel: "Outreach",
    scoreLabel: "VIGYL Score",
    scoreTip: "Composite score based on industry health, service alignment, spending signals, timing, and accessibility.",
    primaryView: "/industries",
    heroFeature: "briefing",
    signalPriority: ["regulatory", "economic", "hiring", "tech", "competitive"],
    whyNowLabel: "Why Now",
    addToPipelineLabel: "Add to Pipeline",
    outreachCTA: "Generate Outreach",
    dossierLabel: "Full Dossier",
    welcomeMessage: "Your market intelligence is ready. Start by exploring your top-scored prospects or check today's signals.",
    emptyProspectsMessage: "No prospects matched your filters. Try broadening your search.",
  },
  founder: {
    key: "founder",
    label: "Founder / CEO",
    navGroupLabel: "Strategy",
    prospectLabel: "Opportunities",
    prospectLabelSingular: "Opportunity",
    pipelineLabel: "Deal Tracker",
    outreachLabel: "Outreach",
    scoreLabel: "Opportunity Score",
    scoreTip: "How strong this opportunity is based on market timing, company health, and alignment with your capabilities.",
    primaryView: "/industries",
    heroFeature: "briefing",
    signalPriority: ["economic", "competitive", "tech", "regulatory", "supply_chain"],
    whyNowLabel: "Why Now",
    addToPipelineLabel: "Track This",
    outreachCTA: "Draft Message",
    dossierLabel: "Full Profile",
    welcomeMessage: "Your market overview is ready. See which industries are moving and where the biggest opportunities are.",
    emptyProspectsMessage: "No opportunities matched your filters. Try broadening your search.",
  },
  executive: {
    key: "executive",
    label: "Executive",
    navGroupLabel: "Strategy",
    prospectLabel: "Market Targets",
    prospectLabelSingular: "Target",
    pipelineLabel: "Pipeline",
    outreachLabel: "Outreach",
    scoreLabel: "VIGYL Score",
    scoreTip: "Composite score: industry health, alignment, spending signals, timing, and accessibility.",
    primaryView: "/industries",
    heroFeature: "briefing",
    signalPriority: ["economic", "regulatory", "political", "competitive", "tech"],
    whyNowLabel: "Why Now",
    addToPipelineLabel: "Add to Pipeline",
    outreachCTA: "Generate Outreach",
    dossierLabel: "Full Dossier",
    welcomeMessage: "Your intelligence briefing is ready. Review critical alerts and industry health trends.",
    emptyProspectsMessage: "No targets matched your filters.",
  },
  hr: {
    key: "hr",
    label: "HR / People Ops",
    navGroupLabel: "Workforce",
    prospectLabel: "Companies",
    prospectLabelSingular: "Company",
    pipelineLabel: "Watchlist",
    outreachLabel: "Talent Brief",
    scoreLabel: "Market Score",
    scoreTip: "How active this company is in hiring, workforce transformation, and market positioning.",
    primaryView: "/ai-impact",
    heroFeature: "ai_impact",
    signalPriority: ["hiring", "tech", "economic", "regulatory", "social"],
    whyNowLabel: "Talent Signal",
    addToPipelineLabel: "Watch This",
    outreachCTA: "Generate Brief",
    dossierLabel: "Company Profile",
    welcomeMessage: "Your workforce intelligence is ready. Start with AI Impact to see where jobs are shifting.",
    emptyProspectsMessage: "No companies matched your filters.",
  },
  job_seeker: {
    key: "job_seeker",
    label: "Job Seeker",
    navGroupLabel: "Career",
    prospectLabel: "Target Companies",
    prospectLabelSingular: "Company",
    pipelineLabel: "Applications",
    outreachLabel: "Application Strategy",
    scoreLabel: "Opportunity Score",
    scoreTip: "How likely this company is to hire in areas where humans are still essential, based on growth signals, AI adoption, and industry health.",
    primaryView: "/ai-impact",
    heroFeature: "ai_impact",
    signalPriority: ["hiring", "tech", "economic", "competitive", "regulatory"],
    whyNowLabel: "Why Apply Now",
    addToPipelineLabel: "Track Application",
    outreachCTA: "Draft Application",
    dossierLabel: "Company Intel",
    welcomeMessage: "Your career intelligence is ready. Start with AI Impact to see which industries still need humans.",
    emptyProspectsMessage: "No companies matched your filters. Try broadening your search.",
  },
  investor: {
    key: "investor",
    label: "Investor",
    navGroupLabel: "Research",
    prospectLabel: "Market Movers",
    prospectLabelSingular: "Company",
    pipelineLabel: "Watch List",
    outreachLabel: "Outreach",
    scoreLabel: "Signal Score",
    scoreTip: "Composite score based on industry momentum, market signals, and company positioning.",
    primaryView: "/industries",
    heroFeature: "signals",
    signalPriority: ["economic", "tech", "regulatory", "supply_chain", "competitive"],
    whyNowLabel: "Investment Signal",
    addToPipelineLabel: "Add to Watch List",
    outreachCTA: "Draft Outreach",
    dossierLabel: "Full Analysis",
    welcomeMessage: "Your market intelligence is ready. Review industry health scores and signal trends.",
    emptyProspectsMessage: "No companies matched your filters.",
  },
  consultant: {
    key: "consultant",
    label: "Consultant",
    navGroupLabel: "Client Intel",
    prospectLabel: "Prospects",
    prospectLabelSingular: "Prospect",
    pipelineLabel: "Pipeline",
    outreachLabel: "Outreach",
    scoreLabel: "VIGYL Score",
    scoreTip: "Composite score: industry health, service alignment, spending signals, timing, and accessibility.",
    primaryView: "/industries",
    heroFeature: "briefing",
    signalPriority: ["regulatory", "economic", "tech", "competitive", "hiring"],
    whyNowLabel: "Why Now",
    addToPipelineLabel: "Add to Pipeline",
    outreachCTA: "Generate Outreach",
    dossierLabel: "Full Dossier",
    welcomeMessage: "Your intelligence is ready. Explore prospects and signals to find your next engagement.",
    emptyProspectsMessage: "No prospects matched your filters.",
  },
  analyst: {
    key: "analyst",
    label: "Analyst",
    navGroupLabel: "Research",
    prospectLabel: "Companies",
    prospectLabelSingular: "Company",
    pipelineLabel: "Tracking",
    outreachLabel: "Reports",
    scoreLabel: "Signal Score",
    scoreTip: "Composite score based on signal density, market momentum, and industry health.",
    primaryView: "/industries",
    heroFeature: "signals",
    signalPriority: ["economic", "regulatory", "tech", "political", "supply_chain"],
    whyNowLabel: "Key Signal",
    addToPipelineLabel: "Track This",
    outreachCTA: "Generate Report",
    dossierLabel: "Full Analysis",
    welcomeMessage: "Your market data is ready. Dive into industry health scores and signal analysis.",
    emptyProspectsMessage: "No companies matched your filters.",
  },
  lobbyist: {
    key: "lobbyist",
    label: "Policy / Government Affairs",
    navGroupLabel: "Policy Intel",
    prospectLabel: "Stakeholders",
    prospectLabelSingular: "Stakeholder",
    pipelineLabel: "Engagement Tracker",
    outreachLabel: "Position Brief",
    scoreLabel: "Relevance Score",
    scoreTip: "How relevant this stakeholder is based on policy signals, regulatory activity, and industry positioning.",
    primaryView: "/signals",
    heroFeature: "signals",
    signalPriority: ["political", "regulatory", "economic", "environmental", "social"],
    whyNowLabel: "Policy Signal",
    addToPipelineLabel: "Track Engagement",
    outreachCTA: "Draft Position",
    dossierLabel: "Stakeholder Profile",
    welcomeMessage: "Your policy intelligence is ready. Review regulatory and political signals affecting your sectors.",
    emptyProspectsMessage: "No stakeholders matched your filters.",
  },
};

// Map onboarding user_persona values to persona keys
const PERSONA_MAP: Record<string, PersonaKey> = {
  sales: "sales",
  founder: "founder",
  executive: "executive",
  hr: "hr",
  job_seeker: "job_seeker",
  investor: "investor",
  consultant: "consultant",
  analyst: "analyst",
  lobbyist: "lobbyist",
};

export function getPersonaConfig(userPersona: string | null | undefined): PersonaConfig {
  if (!userPersona) return PERSONA_CONFIGS.sales;
  const key = PERSONA_MAP[userPersona] || "sales";
  return PERSONA_CONFIGS[key];
}

// Pipeline stage labels can also adapt per persona
export function getStageLabels(persona: PersonaConfig): Record<string, string> {
  if (persona.key === "job_seeker") {
    return {
      researching: "Researching",
      contacted: "Applied",
      meeting_scheduled: "Interview",
      proposal_sent: "Final Round",
      won: "Offer Received",
      lost: "Passed",
    };
  }
  if (persona.key === "investor") {
    return {
      researching: "Researching",
      contacted: "Contacted",
      meeting_scheduled: "Due Diligence",
      proposal_sent: "Term Sheet",
      won: "Invested",
      lost: "Passed",
    };
  }
  // Default (sales, founder, consultant, etc.)
  return {
    researching: "Researching",
    contacted: "Contacted",
    meeting_scheduled: "Meeting Scheduled",
    proposal_sent: "Proposal Sent",
    won: "Won",
    lost: "Lost",
  };
}

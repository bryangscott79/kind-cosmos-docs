export interface Industry {
  id: string;
  name: string;
  slug: string;
  healthScore: number;
  trendDirection: "improving" | "declining" | "stable";
  topSignals: string[];
  scoreHistory: { date: string; score: number }[];
}

export interface SignalSource {
  name: string;
  url: string;
  publishedAt: string;
}

export interface Signal {
  id: string;
  title: string;
  summary: string;
  industryTags: string[];
  signalType: "political" | "regulatory" | "economic" | "hiring" | "tech" | "supply_chain";
  sentiment: "positive" | "negative" | "neutral";
  severity: number;
  salesImplication: string;
  sourceUrl: string;
  publishedAt: string;
  sources: SignalSource[];
}

function generateScoreHistory(base: number): { date: string; score: number }[] {
  const history: { date: string; score: number }[] = [];
  let score = base - 10 + Math.random() * 20;
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    score = Math.max(5, Math.min(95, score + (Math.random() - 0.45) * 6));
    history.push({ date: date.toISOString().split("T")[0], score: Math.round(score) });
  }
  return history;
}

export const industries: Industry[] = [
  { id: "1", name: "Cybersecurity", slug: "cybersecurity", healthScore: 88, trendDirection: "improving", topSignals: ["Federal cyber mandate expands to contractors", "AI-driven threat detection funding +40%", "Critical infrastructure attacks up 65% YoY"], scoreHistory: generateScoreHistory(88) },
  { id: "2", name: "Healthcare IT", slug: "healthcare-it", healthScore: 76, trendDirection: "improving", topSignals: ["CMS interoperability rules take effect", "Telehealth reimbursement made permanent", "EHR modernization wave accelerates"], scoreHistory: generateScoreHistory(76) },
  { id: "3", name: "Clean Energy", slug: "clean-energy", healthScore: 72, trendDirection: "stable", topSignals: ["IRA tax credits driving adoption", "Grid modernization spending surges", "Solar supply chain stabilizing"], scoreHistory: generateScoreHistory(72) },
  { id: "4", name: "Logistics & Supply Chain", slug: "logistics-supply-chain", healthScore: 45, trendDirection: "declining", topSignals: ["Tariff escalation disrupts trade routes", "Freight rates volatile amid uncertainty", "Automation investment accelerating"], scoreHistory: generateScoreHistory(45) },
  { id: "5", name: "FinTech", slug: "fintech", healthScore: 64, trendDirection: "stable", topSignals: ["Embedded finance adoption growing", "Regulatory scrutiny on BNPL intensifies", "Open banking APIs expanding"], scoreHistory: generateScoreHistory(64) },
  { id: "6", name: "Defense & Aerospace", slug: "defense-aerospace", healthScore: 91, trendDirection: "improving", topSignals: ["NATO defense spending surge", "Space economy contracts expanding", "Autonomous systems budget +$12B"], scoreHistory: generateScoreHistory(91) },
  { id: "7", name: "Commercial Real Estate", slug: "commercial-real-estate", healthScore: 28, trendDirection: "declining", topSignals: ["Office vacancy at historic highs", "Conversion to residential accelerates", "REITs under pressure from rate environment"], scoreHistory: generateScoreHistory(28) },
  { id: "8", name: "EdTech", slug: "edtech", healthScore: 55, trendDirection: "stable", topSignals: ["AI tutoring platforms gaining traction", "Corporate L&D budgets shifting online", "Student loan policy changes impact demand"], scoreHistory: generateScoreHistory(55) },
  { id: "9", name: "AI & Machine Learning", slug: "ai-machine-learning", healthScore: 95, trendDirection: "improving", topSignals: ["Enterprise AI adoption at inflection point", "GPU demand outstripping supply", "Regulatory frameworks emerging globally"], scoreHistory: generateScoreHistory(95) },
  { id: "10", name: "Manufacturing", slug: "manufacturing", healthScore: 52, trendDirection: "stable", topSignals: ["Reshoring incentives boost domestic ops", "Labor shortage persists in skilled roles", "Smart factory adoption accelerating"], scoreHistory: generateScoreHistory(52) },
  { id: "11", name: "Pharmaceuticals", slug: "pharmaceuticals", healthScore: 69, trendDirection: "improving", topSignals: ["GLP-1 market explosion continues", "Drug pricing reform takes shape", "AI drug discovery cuts timelines 40%"], scoreHistory: generateScoreHistory(69) },
  { id: "12", name: "Retail & E-Commerce", slug: "retail-ecommerce", healthScore: 41, trendDirection: "declining", topSignals: ["Consumer spending softening", "Returns management costs surge", "Social commerce reshaping acquisition"], scoreHistory: generateScoreHistory(41) },
];

export const signals: Signal[] = [
  { id: "s1", title: "White House Issues Executive Order on AI Safety Standards", summary: "New federal requirements mandate AI risk assessments for companies serving government agencies. Compliance deadlines set for Q3 2026, creating immediate demand for AI governance solutions.", industryTags: ["9", "1"], signalType: "regulatory", sentiment: "positive", severity: 5, salesImplication: "Companies without AI governance frameworks will need to purchase compliance solutions immediately. Priority targets: federal contractors and their supply chain.", sourceUrl: "#", publishedAt: "2026-02-10", sources: [{ name: "Reuters", url: "https://reuters.com", publishedAt: "2026-02-10" }, { name: "The Verge", url: "https://theverge.com", publishedAt: "2026-02-10" }, { name: "Federal Register", url: "https://federalregister.gov", publishedAt: "2026-02-09" }] },
  { id: "s2", title: "Major Shipping Routes Disrupted by Geopolitical Tensions", summary: "Escalating conflicts in key maritime corridors force rerouting of 30% of global container traffic. Transit times and costs increasing significantly.", industryTags: ["4", "10"], signalType: "political", sentiment: "negative", severity: 4, salesImplication: "Logistics companies facing margin pressure will seek automation and route optimization tools. Urgency is high — pitch operational efficiency solutions now.", sourceUrl: "#", publishedAt: "2026-02-09", sources: [{ name: "Bloomberg", url: "https://bloomberg.com", publishedAt: "2026-02-09" }, { name: "Financial Times", url: "https://ft.com", publishedAt: "2026-02-08" }, { name: "Lloyd's List", url: "https://lloydslist.com", publishedAt: "2026-02-09" }] },
  { id: "s3", title: "Federal Cybersecurity Mandate Expands to All Government Contractors", summary: "CMMC 2.0 compliance now required for all tiers of government contracting. An estimated 300,000 companies must achieve certification by 2027.", industryTags: ["1", "6"], signalType: "regulatory", sentiment: "positive", severity: 5, salesImplication: "Massive addressable market opening up. SMBs in the government supply chain need managed security services and compliance consulting.", sourceUrl: "#", publishedAt: "2026-02-08", sources: [{ name: "CyberScoop", url: "https://cyberscoop.com", publishedAt: "2026-02-08" }, { name: "Federal News Network", url: "https://federalnewsnetwork.com", publishedAt: "2026-02-07" }, { name: "Defense One", url: "https://defenseone.com", publishedAt: "2026-02-08" }] },
  { id: "s4", title: "Healthcare Systems Accelerating EHR Modernization", summary: "Major health systems announcing $2B+ in combined IT spending to replace legacy EHR systems. Interoperability and AI integration are top priorities.", industryTags: ["2"], signalType: "economic", sentiment: "positive", severity: 4, salesImplication: "IT services firms should target mid-size health systems planning migrations. Decision cycles are 6-12 months — start conversations now.", sourceUrl: "#", publishedAt: "2026-02-07", sources: [{ name: "Modern Healthcare", url: "https://modernhealthcare.com", publishedAt: "2026-02-07" }, { name: "Health Affairs", url: "https://healthaffairs.org", publishedAt: "2026-02-06" }] },
  { id: "s5", title: "Commercial Office Vacancy Hits 22% Nationally", summary: "Office vacancy rates reach historic highs as remote work permanence settles in. REITs reporting significant write-downs on commercial portfolios.", industryTags: ["7"], signalType: "economic", sentiment: "negative", severity: 4, salesImplication: "Property management firms and REITs are under pressure to convert or optimize. Sell workspace analytics, conversion consulting, or tenant experience platforms.", sourceUrl: "#", publishedAt: "2026-02-06", sources: [{ name: "Wall Street Journal", url: "https://wsj.com", publishedAt: "2026-02-06" }, { name: "CoStar Group", url: "https://costar.com", publishedAt: "2026-02-05" }, { name: "CBRE Research", url: "https://cbre.com", publishedAt: "2026-02-06" }] },
  { id: "s6", title: "NATO Members Commit to 3% GDP Defense Spending", summary: "Alliance members agree to raise defense spending floors, unlocking an estimated $100B in new procurement budgets across member nations.", industryTags: ["6"], signalType: "political", sentiment: "positive", severity: 5, salesImplication: "Defense contractors and technology providers should prepare proposals for expanded procurement cycles. Focus on autonomous systems and cyber defense.", sourceUrl: "#", publishedAt: "2026-02-05", sources: [{ name: "NATO Press Office", url: "https://nato.int", publishedAt: "2026-02-05" }, { name: "Defense News", url: "https://defensenews.com", publishedAt: "2026-02-05" }, { name: "Jane's Defence", url: "https://janes.com", publishedAt: "2026-02-04" }, { name: "Reuters", url: "https://reuters.com", publishedAt: "2026-02-05" }] },
];

export type PressureResponse = "contracting" | "strategic_investment" | "growth_mode";
export type PipelineStage = "researching" | "contacted" | "meeting_scheduled" | "proposal_sent" | "won" | "lost";

export interface Prospect {
  id: string;
  companyName: string;
  industryId: string;
  vigylScore: number;
  pressureResponse: PressureResponse;
  whyNow: string;
  decisionMakers: { name: string; title: string; linkedinUrl: string }[];
  relatedSignals: string[];
  pipelineStage: PipelineStage;
  lastContacted: string | null;
  notes: string;
}

export interface OutreachContent {
  id: string;
  prospectId: string;
  contentType: "cold_email" | "follow_up" | "linkedin_message" | "meeting_brief" | "engagement_post";
  subject: string;
  body: string;
  createdAt: string;
}

export const prospects: Prospect[] = [
  { id: "p1", companyName: "ShieldNet Systems", industryId: "1", vigylScore: 92, pressureResponse: "growth_mode", whyNow: "Federal cybersecurity mandates are expanding and ShieldNet is actively hiring compliance architects. Their recent Series C positions them to invest in new vendor partnerships.", decisionMakers: [{ name: "Sarah Chen", title: "VP of Partnerships", linkedinUrl: "#" }, { name: "David Reeves", title: "CTO", linkedinUrl: "#" }], relatedSignals: ["s1", "s3"], pipelineStage: "researching", lastContacted: null, notes: "" },
  { id: "p2", companyName: "MedFlow Health", industryId: "2", vigylScore: 85, pressureResponse: "strategic_investment", whyNow: "MedFlow is migrating from a legacy EHR system and has an active RFP for integration partners. CMS interoperability deadlines are driving urgency.", decisionMakers: [{ name: "Dr. James Patel", title: "Chief Digital Officer", linkedinUrl: "#" }, { name: "Linda Torres", title: "Director of IT", linkedinUrl: "#" }], relatedSignals: ["s4"], pipelineStage: "contacted", lastContacted: "2026-02-08", notes: "Initial email sent, awaiting response." },
  { id: "p3", companyName: "GlobalFreight Corp", industryId: "4", vigylScore: 71, pressureResponse: "strategic_investment", whyNow: "Shipping disruptions are squeezing margins. GlobalFreight posted a job for 'Supply Chain Automation Lead' last week — they're actively looking for solutions.", decisionMakers: [{ name: "Marcus Webb", title: "COO", linkedinUrl: "#" }], relatedSignals: ["s2"], pipelineStage: "meeting_scheduled", lastContacted: "2026-02-10", notes: "Meeting set for Feb 15. Prepare automation ROI deck." },
  { id: "p4", companyName: "Apex Defense Technologies", industryId: "6", vigylScore: 88, pressureResponse: "growth_mode", whyNow: "NATO spending commitments are unlocking massive procurement budgets. Apex just won a $50M autonomous systems contract and needs subcontractors.", decisionMakers: [{ name: "Col. Rita Hernandez (Ret.)", title: "SVP Business Development", linkedinUrl: "#" }, { name: "Tom Fischer", title: "Program Manager", linkedinUrl: "#" }], relatedSignals: ["s6"], pipelineStage: "proposal_sent", lastContacted: "2026-02-09", notes: "Proposal for sensor integration submitted." },
  { id: "p5", companyName: "UrbanCore Properties", industryId: "7", vigylScore: 45, pressureResponse: "contracting", whyNow: "Vacancy rates hitting 22% — UrbanCore announced cost-cutting measures but is evaluating tenant experience platforms to retain remaining tenants.", decisionMakers: [{ name: "Angela Kim", title: "VP Operations", linkedinUrl: "#" }], relatedSignals: ["s5"], pipelineStage: "researching", lastContacted: null, notes: "" },
  { id: "p6", companyName: "NeuralPath AI", industryId: "9", vigylScore: 94, pressureResponse: "growth_mode", whyNow: "AI safety executive order creates compliance demand. NeuralPath is building governance tooling and needs integration partners for enterprise deployment.", decisionMakers: [{ name: "Alex Moreau", title: "CEO", linkedinUrl: "#" }, { name: "Priya Sharma", title: "Head of Partnerships", linkedinUrl: "#" }], relatedSignals: ["s1"], pipelineStage: "researching", lastContacted: null, notes: "" },
  { id: "p7", companyName: "SolGrid Energy", industryId: "3", vigylScore: 78, pressureResponse: "growth_mode", whyNow: "IRA tax credits are driving rapid solar adoption. SolGrid expanding into commercial installations and needs project management software.", decisionMakers: [{ name: "Michael Ortiz", title: "Director of Operations", linkedinUrl: "#" }], relatedSignals: [], pipelineStage: "contacted", lastContacted: "2026-02-07", notes: "LinkedIn message sent." },
  { id: "p8", companyName: "FinEdge Solutions", industryId: "5", vigylScore: 62, pressureResponse: "strategic_investment", whyNow: "Regulatory scrutiny on BNPL is pushing FinEdge to invest in compliance infrastructure. They posted for a Head of Regulatory Affairs.", decisionMakers: [{ name: "Rachel Nguyen", title: "CPO", linkedinUrl: "#" }], relatedSignals: [], pipelineStage: "researching", lastContacted: null, notes: "" },
  { id: "p9", companyName: "PharmaVista Labs", industryId: "11", vigylScore: 73, pressureResponse: "strategic_investment", whyNow: "AI drug discovery is cutting timelines 40%. PharmaVista is investing in ML pipeline tooling after their latest trial success.", decisionMakers: [{ name: "Dr. Elena Vasquez", title: "VP R&D", linkedinUrl: "#" }, { name: "Ken Watanabe", title: "Head of Data Science", linkedinUrl: "#" }], relatedSignals: [], pipelineStage: "won", lastContacted: "2026-02-01", notes: "Contract signed for ML pipeline integration." },
  { id: "p10", companyName: "SmartMake Industries", industryId: "10", vigylScore: 58, pressureResponse: "strategic_investment", whyNow: "Reshoring incentives pushing SmartMake to modernize. Labor shortage is accelerating their smart factory timeline.", decisionMakers: [{ name: "Robert Chang", title: "Plant Director", linkedinUrl: "#" }], relatedSignals: ["s2"], pipelineStage: "lost", lastContacted: "2026-01-20", notes: "Went with competitor. Re-engage in Q3." },
];

export const outreachContent: OutreachContent[] = [
  { id: "o1", prospectId: "p1", contentType: "cold_email", subject: "Helping ShieldNet Navigate the New CMMC Requirements", body: "Hi Sarah,\n\nWith the CMMC 2.0 mandate now extending to all government contractor tiers, I imagine ShieldNet is seeing increased demand from your supply chain partners for compliance support.\n\nWe help cybersecurity firms like yours scale their compliance consulting capacity without adding headcount. Our platform automates 60% of the CMMC assessment workflow.\n\nWould you be open to a 15-minute call next week to explore how this could support your growth?\n\nBest,\n[Your Name]", createdAt: "2026-02-10" },
  { id: "o2", prospectId: "p3", contentType: "meeting_brief", subject: "GlobalFreight Meeting Prep — Feb 15", body: "**Meeting Context:**\nGlobalFreight Corp is experiencing significant margin pressure from shipping route disruptions. They've posted for a Supply Chain Automation Lead, signaling active investment in automation.\n\n**Key Talking Points:**\n1. ROI of automation in disrupted shipping environments (30% cost reduction case study)\n2. Integration with their existing TMS (likely Oracle or SAP)\n3. Timeline: they need results before Q3 tariff escalations\n\n**Decision Maker Profile:**\nMarcus Webb, COO — operations-focused, will want to see hard numbers. Prepare the logistics automation ROI calculator.\n\n**Relevant Signals:**\n- Major shipping routes disrupted by geopolitical tensions\n- 30% of container traffic rerouted", createdAt: "2026-02-11" },
];

export function getPressureLabel(pr: PressureResponse): string {
  const labels: Record<PressureResponse, string> = { contracting: "Contracting", strategic_investment: "Strategic Investment", growth_mode: "Growth Mode" };
  return labels[pr];
}

export function getPressureColor(pr: PressureResponse): string {
  const colors: Record<PressureResponse, string> = { contracting: "score-red", strategic_investment: "score-yellow", growth_mode: "score-green" };
  return colors[pr];
}

export const pipelineStageLabels: Record<PipelineStage, string> = {
  researching: "Researching",
  contacted: "Contacted",
  meeting_scheduled: "Meeting Scheduled",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

export function getScoreColor(score: number): string {
  if (score >= 70) return "score-green";
  if (score >= 40) return "score-yellow";
  return "score-red";
}

export function getScoreColorHsl(score: number): string {
  if (score >= 70) return "hsl(var(--score-green))";
  if (score >= 40) return "hsl(var(--score-yellow))";
  return "hsl(var(--score-red))";
}

export function getTrendIcon(direction: "improving" | "declining" | "stable"): string {
  if (direction === "improving") return "↑";
  if (direction === "declining") return "↓";
  return "→";
}

export function getSignalTypeLabel(type: Signal["signalType"]): string {
  const labels: Record<Signal["signalType"], string> = {
    political: "Political",
    regulatory: "Regulatory",
    economic: "Economic",
    hiring: "Hiring",
    tech: "Technology",
    supply_chain: "Supply Chain",
  };
  return labels[type];
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  healthScore: number;
  trendDirection: "improving" | "declining" | "stable";
  topSignals: string[];
  scoreHistory: { date: string; score: number }[];
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
  { id: "s1", title: "White House Issues Executive Order on AI Safety Standards", summary: "New federal requirements mandate AI risk assessments for companies serving government agencies. Compliance deadlines set for Q3 2026, creating immediate demand for AI governance solutions.", industryTags: ["9", "1"], signalType: "regulatory", sentiment: "positive", severity: 5, salesImplication: "Companies without AI governance frameworks will need to purchase compliance solutions immediately. Priority targets: federal contractors and their supply chain.", sourceUrl: "#", publishedAt: "2026-02-10" },
  { id: "s2", title: "Major Shipping Routes Disrupted by Geopolitical Tensions", summary: "Escalating conflicts in key maritime corridors force rerouting of 30% of global container traffic. Transit times and costs increasing significantly.", industryTags: ["4", "10"], signalType: "political", sentiment: "negative", severity: 4, salesImplication: "Logistics companies facing margin pressure will seek automation and route optimization tools. Urgency is high — pitch operational efficiency solutions now.", sourceUrl: "#", publishedAt: "2026-02-09" },
  { id: "s3", title: "Federal Cybersecurity Mandate Expands to All Government Contractors", summary: "CMMC 2.0 compliance now required for all tiers of government contracting. An estimated 300,000 companies must achieve certification by 2027.", industryTags: ["1", "6"], signalType: "regulatory", sentiment: "positive", severity: 5, salesImplication: "Massive addressable market opening up. SMBs in the government supply chain need managed security services and compliance consulting.", sourceUrl: "#", publishedAt: "2026-02-08" },
  { id: "s4", title: "Healthcare Systems Accelerating EHR Modernization", summary: "Major health systems announcing $2B+ in combined IT spending to replace legacy EHR systems. Interoperability and AI integration are top priorities.", industryTags: ["2"], signalType: "economic", sentiment: "positive", severity: 4, salesImplication: "IT services firms should target mid-size health systems planning migrations. Decision cycles are 6-12 months — start conversations now.", sourceUrl: "#", publishedAt: "2026-02-07" },
  { id: "s5", title: "Commercial Office Vacancy Hits 22% Nationally", summary: "Office vacancy rates reach historic highs as remote work permanence settles in. REITs reporting significant write-downs on commercial portfolios.", industryTags: ["7"], signalType: "economic", sentiment: "negative", severity: 4, salesImplication: "Property management firms and REITs are under pressure to convert or optimize. Sell workspace analytics, conversion consulting, or tenant experience platforms.", sourceUrl: "#", publishedAt: "2026-02-06" },
  { id: "s6", title: "NATO Members Commit to 3% GDP Defense Spending", summary: "Alliance members agree to raise defense spending floors, unlocking an estimated $100B in new procurement budgets across member nations.", industryTags: ["6"], signalType: "political", sentiment: "positive", severity: 5, salesImplication: "Defense contractors and technology providers should prepare proposals for expanded procurement cycles. Focus on autonomous systems and cyber defense.", sourceUrl: "#", publishedAt: "2026-02-05" },
];

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

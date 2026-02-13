import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("authorization");
    const { profile } = await req.json();
    if (!profile) throw new Error("Profile required");

    // Fetch user's prospect feedback to personalize results
    let feedbackContext = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: feedback } = await supabase
        .from("prospect_feedback")
        .select("*")
        .eq("user_id", profile.user_id)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (feedback && feedback.length > 0) {
        const moreCompanies = feedback.filter((f: any) => f.feedback_type === "more").map((f: any) => `${f.prospect_company_name} (${f.prospect_industry})`);
        const lessCompanies = feedback.filter((f: any) => f.feedback_type === "less").map((f: any) => `${f.prospect_company_name} (${f.prospect_industry})`);
        
        if (moreCompanies.length > 0) {
          feedbackContext += `\n\nIMPORTANT - The user has indicated they want MORE prospects similar to these companies: ${moreCompanies.join(", ")}. Generate prospects with similar characteristics (industry, size, revenue range, location type).`;
        }
        if (lessCompanies.length > 0) {
          feedbackContext += `\n\nIMPORTANT - The user has indicated they want FEWER prospects like these companies: ${lessCompanies.join(", ")}. Avoid generating prospects with similar characteristics.`;
        }
      }
    } catch (e) {
      console.log("Could not fetch feedback, continuing without it:", e);
    }

    const {
      company_name,
      business_summary,
      ai_summary,
      target_industries,
      location_city,
      location_state,
      location_country,
      website_url,
    } = profile;

    const today = new Date().toISOString().split("T")[0];
    const locationStr = [location_city, location_state, location_country].filter(Boolean).join(", ") || "United States";

    const systemPrompt = `You are an elite B2B sales intelligence analyst with deep knowledge of EVERY industry globally. You track companies of all sizes from Fortune 500 to emerging startups across every sector. You generate realistic, actionable market intelligence. All data must be grounded in real market dynamics and plausible. Today is ${today}.`;

    const userPrompt = `Generate comprehensive, personalized sales intelligence for this user:

Company: ${company_name || "Unknown"}
Website: ${website_url || "Not provided"}
Business Summary: ${business_summary || ai_summary || "Not provided"}
Target Industries: ${target_industries?.join(", ") || "All industries - cast a wide net"}
Location: ${locationStr}
${feedbackContext}

Generate intelligence across a WIDE range of industries. Think globally and across ALL major sectors including but NOT limited to:
- Technology & SaaS
- Healthcare & Life Sciences
- Financial Services & Banking
- Food & Beverage
- Automotive & Transportation
- Airlines & Aviation
- Electronics & Consumer Tech
- Retail & E-Commerce
- Manufacturing & Industrial
- Energy & Utilities
- Real Estate & Construction
- Media & Entertainment
- Telecommunications
- Agriculture & AgTech
- Hospitality & Tourism
- Education & EdTech
- Defense & Aerospace
- Pharmaceuticals
- Insurance
- Professional Services
- Logistics & Supply Chain
- Mining & Natural Resources

Generate:

1. **10-14 industries** most relevant to this user's sales targets. Include DIVERSE industries - don't just pick obvious ones. Include both the user's stated targets AND adjacent/unexpected industries where they could sell. Include health scores (0-100), trend direction, and top market signals for each.

2. **25-35 market signals** across ALL these industries. Signal types MUST include:
   - political: government policy, trade deals, sanctions, elections
   - regulatory: compliance mandates, new laws, enforcement actions
   - economic: spending trends, market shifts, rate changes, M&A
   - hiring: talent wars, layoffs, executive moves, workforce shifts
   - tech: platform shifts, AI adoption, infrastructure investments
   - supply_chain: disruptions, reshoring, logistics changes
   - social: brand sentiment changes, viral trends, social media shifts, influencer impacts, PR crises, consumer behavior changes
   - competitive: competitor launches, market share shifts, strategic pivots, acquisitions
   - environmental: climate policy, ESG mandates, sustainability shifts, green transitions
   
   Each signal needs a clear sales implication. Use recent dates near ${today}. Include REAL publication sources with realistic URLs.

3. **20-30 prospect companies** that would be ideal customers. CRITICAL REQUIREMENTS:
   - Include a MIX of company sizes: small brands ($1M-$50M), mid-market ($50M-$500M), large enterprises ($500M-$5B), and major corporations ($5B+)
   - Geographic diversity: ~40% local/regional (near ${locationStr}), ~35% national, ~25% international
   - Industry diversity: spread across at least 8 different industries
   - Include companies from sectors like food & beverage, automotive, airlines, electronics, hospitality, agriculture — not just tech!
   - Real-seeming companies with plausible names, revenue figures, employee counts
   - Each with a compelling "Why Now" reason linked to current market signals
   - Include realistic decision maker names and titles
   - For each prospect, include 2-4 **recommended services** the user could sell them based on their specific situation
   - Annual revenue should use realistic formats: "$2.3M", "$145M", "$3.8B", etc.

Make everything specific to the user's business capabilities and geography. No generic examples. Think about what this specific company could ACTUALLY sell to each prospect.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "deliver_intelligence",
          description: "Deliver the generated sales intelligence data",
          parameters: {
            type: "object",
            properties: {
              industries: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    slug: { type: "string" },
                    healthScore: { type: "number" },
                    trendDirection: { type: "string", enum: ["improving", "declining", "stable"] },
                    topSignals: { type: "array", items: { type: "string" } },
                  },
                  required: ["id", "name", "slug", "healthScore", "trendDirection", "topSignals"],
                  additionalProperties: false,
                },
              },
              signals: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    summary: { type: "string" },
                    industryTags: { type: "array", items: { type: "string" } },
                    signalType: { type: "string", enum: ["political", "regulatory", "economic", "hiring", "tech", "supply_chain", "social", "competitive", "environmental"] },
                    sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
                    severity: { type: "number" },
                    salesImplication: { type: "string" },
                    sourceUrl: { type: "string" },
                    publishedAt: { type: "string" },
                    sources: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          url: { type: "string" },
                          publishedAt: { type: "string" },
                        },
                        required: ["name", "url", "publishedAt"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["id", "title", "summary", "industryTags", "signalType", "sentiment", "severity", "salesImplication", "sourceUrl", "publishedAt", "sources"],
                  additionalProperties: false,
                },
              },
              prospects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    companyName: { type: "string" },
                    industryId: { type: "string" },
                    vigylScore: { type: "number" },
                    pressureResponse: { type: "string", enum: ["contracting", "strategic_investment", "growth_mode"] },
                    whyNow: { type: "string" },
                    decisionMakers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          title: { type: "string" },
                          linkedinUrl: { type: "string" },
                        },
                        required: ["name", "title", "linkedinUrl"],
                        additionalProperties: false,
                      },
                    },
                    relatedSignals: { type: "array", items: { type: "string" } },
                    recommendedServices: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          service: { type: "string" },
                          rationale: { type: "string" },
                          linkedSignalId: { type: "string" },
                        },
                        required: ["service", "rationale"],
                        additionalProperties: false,
                      },
                    },
                    pipelineStage: { type: "string", enum: ["researching", "contacted", "meeting_scheduled", "proposal_sent", "won", "lost"] },
                    lastContacted: { type: "string" },
                    notes: { type: "string" },
                    location: {
                      type: "object",
                      properties: {
                        city: { type: "string" },
                        state: { type: "string" },
                        country: { type: "string" },
                      },
                      required: ["city", "state", "country"],
                      additionalProperties: false,
                    },
                    annualRevenue: { type: "string" },
                    employeeCount: { type: "number" },
                  },
                  required: ["id", "companyName", "industryId", "vigylScore", "pressureResponse", "whyNow", "decisionMakers", "relatedSignals", "pipelineStage", "lastContacted", "notes", "location", "annualRevenue", "employeeCount"],
                  additionalProperties: false,
                },
              },
            },
            required: ["industries", "signals", "prospects"],
            additionalProperties: false,
          },
        },
      },
    ];

    console.log("Generating intelligence for:", company_name, "industries:", target_industries);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "deliver_intelligence" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const intelligence = JSON.parse(toolCall.function.arguments);

    // Post-process: add score history to industries
    intelligence.industries = intelligence.industries.map((ind: any) => ({
      ...ind,
      scoreHistory: generateScoreHistory(ind.healthScore),
    }));

    // Ensure all prospects default to "researching" pipeline stage
    intelligence.prospects = intelligence.prospects.map((p: any) => ({
      ...p,
      pipelineStage: p.pipelineStage || "researching",
      lastContacted: p.lastContacted || null,
      notes: p.notes || "",
      recommendedServices: p.recommendedServices || [],
    }));

    console.log(
      "Generated:",
      intelligence.industries.length, "industries,",
      intelligence.signals.length, "signals,",
      intelligence.prospects.length, "prospects"
    );

    return new Response(JSON.stringify({ success: true, data: intelligence }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating intelligence:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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

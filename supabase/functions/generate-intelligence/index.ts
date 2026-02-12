import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { profile } = await req.json();
    if (!profile) throw new Error("Profile required");

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

    const systemPrompt = `You are a B2B sales intelligence analyst. Generate realistic, actionable market intelligence for a sales professional. All data must be realistic and grounded — use real-seeming company names, plausible financials, and current market dynamics. Today is ${today}.`;

    const userPrompt = `Generate personalized sales intelligence for this user:

Company: ${company_name || "Unknown"}
Website: ${website_url || "Not provided"}
Business Summary: ${business_summary || ai_summary || "Not provided"}
Target Industries: ${target_industries?.join(", ") || "General"}
Location: ${locationStr}

Generate:
1. **6-8 industries** relevant to this user's target market. Include health scores (0-100), trend direction, and top market signals.
2. **15-20 market signals** across these industries. Include real-seeming regulatory changes, economic shifts, hiring trends, tech disruptions, political developments, and supply chain events. Each signal needs a clear sales implication explaining how it creates an opportunity for the user's business. Use recent dates near ${today}.
3. **10-15 prospect companies** that would be ideal customers for this user. Companies should be:
   - Located in ${locationStr} and surrounding regions (within reasonable sales territory)
   - In the user's target industries
   - Real-seeming companies with plausible names, revenue, employee counts
   - Each with a compelling "Why Now" reason linked to current market signals
   - Include realistic decision maker names and titles

Make everything specific to the user's business and geography. No generic examples.`;

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
                    signalType: { type: "string", enum: ["political", "regulatory", "economic", "hiring", "tech", "supply_chain"] },
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

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

    const { industries, profile } = await req.json();
    if (!industries || industries.length === 0) throw new Error("Industries required");

    const today = new Date().toISOString().split("T")[0];
    const entityContext = profile?.entity_type ? `\nThe user's business model is: ${profile.entity_type.toUpperCase()}.` : "";
    const personaContext = profile?.user_persona ? ` Their role focus is: ${profile.user_persona}.` : "";
    const maturityContext = profile?.ai_maturity_self ? ` Their AI maturity level is: ${profile.ai_maturity_self}.` : "";
    const businessContext = profile?.business_summary || profile?.ai_summary || "";

    const industryNames = industries.map((i: any) => `${i.name} (ID: ${i.id})`).join(", ");

    const systemPrompt = `You are an expert AI industry analyst specializing in how artificial intelligence is transforming business functions across every sector. You classify business functions into three zones based on AI automation levels, and you understand value chains deeply. Today is ${today}.`;

    const userPrompt = `Analyze AI's impact on these industries: ${industryNames}
${entityContext}${personaContext}${maturityContext}
${businessContext ? `\nThe user's business: ${businessContext}` : ""}

For EACH industry, generate a comprehensive AI impact analysis:

**THREE ZONES** — classify 2-4 business functions into each zone:
- **AI-Led** (zone: "ai_led", automationLevel 60-95): Functions where AI handles most work. Examples: data entry, basic customer service, inventory tracking, fraud detection, document processing.
- **Human-Led** (zone: "human_led", automationLevel 5-20): Functions where humans are essential. Examples: executive leadership, complex negotiations, creative direction, crisis management, relationship building.
- **Collaborative Edge** (zone: "collaborative", automationLevel 25-55): THE HIGHEST OPPORTUNITY ZONE. AI augments humans. Examples: sales forecasting + human judgment, AI-drafted + human-edited content, diagnostic AI + doctor review.

Each function needs:
- name: short function name
- description: 1-2 sentences on how AI impacts this function
- automationLevel: 0-100 number matching the zone
- zone: must match the array it's in ("ai_led", "human_led", or "collaborative")
- jobsAffected: array of 2-4 specific job titles affected
- opportunityType: one of "cost_reduction", "revenue_growth", "efficiency", "new_capability", "risk_reduction"
- timeline: "now", "6_months", "1_year", or "2_plus_years"

**AGGREGATE SCORES** (all 0-100):
- automationRate: overall industry automation level
- jobDisplacementIndex: how many roles are at risk of displacement
- humanResilienceScore: how resilient human roles are in this industry
- collaborativeOpportunityIndex: how much opportunity in the collaborative zone

**VALUE CHAIN** — 4-7 stages showing how AI penetrates the industry value chain:
Each stage: id, name, zone ("ai_led"/"human_led"/"collaborative"), automationLevel (0-100), aiTools (2-3 tool names), humanRoles (2-3 role titles), opportunity (one sentence)

**KPIs** — 4-6 key metrics showing AI's impact:
Each: name, value (number), unit (%, $M, x, months, etc.), trend ("up"/"down"/"stable"), context (one sentence)

Make this specific and realistic. Use real AI tools (ChatGPT, Copilot, Salesforce Einstein, etc.) and real job titles.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "deliver_ai_impact",
          description: "Deliver AI impact analysis for all industries",
          parameters: {
            type: "object",
            properties: {
              analyses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    industryId: { type: "string" },
                    industryName: { type: "string" },
                    aiLedFunctions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                          automationLevel: { type: "number" },
                          zone: { type: "string", enum: ["ai_led"] },
                          jobsAffected: { type: "array", items: { type: "string" } },
                          opportunityType: { type: "string", enum: ["cost_reduction", "revenue_growth", "efficiency", "new_capability", "risk_reduction"] },
                          timeline: { type: "string", enum: ["now", "6_months", "1_year", "2_plus_years"] },
                        },
                        required: ["name", "description", "automationLevel", "zone", "jobsAffected", "opportunityType", "timeline"],
                        additionalProperties: false,
                      },
                    },
                    humanLedFunctions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                          automationLevel: { type: "number" },
                          zone: { type: "string", enum: ["human_led"] },
                          jobsAffected: { type: "array", items: { type: "string" } },
                          opportunityType: { type: "string", enum: ["cost_reduction", "revenue_growth", "efficiency", "new_capability", "risk_reduction"] },
                          timeline: { type: "string", enum: ["now", "6_months", "1_year", "2_plus_years"] },
                        },
                        required: ["name", "description", "automationLevel", "zone", "jobsAffected", "opportunityType", "timeline"],
                        additionalProperties: false,
                      },
                    },
                    collaborativeFunctions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                          automationLevel: { type: "number" },
                          zone: { type: "string", enum: ["collaborative"] },
                          jobsAffected: { type: "array", items: { type: "string" } },
                          opportunityType: { type: "string", enum: ["cost_reduction", "revenue_growth", "efficiency", "new_capability", "risk_reduction"] },
                          timeline: { type: "string", enum: ["now", "6_months", "1_year", "2_plus_years"] },
                        },
                        required: ["name", "description", "automationLevel", "zone", "jobsAffected", "opportunityType", "timeline"],
                        additionalProperties: false,
                      },
                    },
                    automationRate: { type: "number" },
                    jobDisplacementIndex: { type: "number" },
                    humanResilienceScore: { type: "number" },
                    collaborativeOpportunityIndex: { type: "number" },
                    valueChain: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          zone: { type: "string", enum: ["ai_led", "human_led", "collaborative"] },
                          automationLevel: { type: "number" },
                          aiTools: { type: "array", items: { type: "string" } },
                          humanRoles: { type: "array", items: { type: "string" } },
                          opportunity: { type: "string" },
                        },
                        required: ["id", "name", "zone", "automationLevel", "aiTools", "humanRoles", "opportunity"],
                        additionalProperties: false,
                      },
                    },
                    kpis: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          value: { type: "number" },
                          unit: { type: "string" },
                          trend: { type: "string", enum: ["up", "down", "stable"] },
                          context: { type: "string" },
                        },
                        required: ["name", "value", "unit", "trend", "context"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["industryId", "industryName", "aiLedFunctions", "humanLedFunctions", "collaborativeFunctions", "automationRate", "jobDisplacementIndex", "humanResilienceScore", "collaborativeOpportunityIndex", "valueChain", "kpis"],
                  additionalProperties: false,
                },
              },
            },
            required: ["analyses"],
            additionalProperties: false,
          },
        },
      },
    ];

    console.log("Generating AI impact for industries:", industryNames);

    const MAX_RETRIES = 2;
    let analyses: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
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
            tool_choice: { type: "function", function: { name: "deliver_ai_impact" } },
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
          if (attempt < MAX_RETRIES) continue;
          throw new Error(`AI error: ${response.status}`);
        }

        const data = await response.json();

        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          const parsed = JSON.parse(toolCall.function.arguments);
          analyses = parsed.analyses || parsed;
          if (Array.isArray(analyses)) break;
        }

        // Fallback: try to extract from content
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            analyses = parsed.analyses || parsed;
            if (Array.isArray(analyses)) break;
          }
        }

        console.log(`Attempt ${attempt + 1}: No parseable response`);
        if (attempt < MAX_RETRIES) continue;
      } catch (parseErr) {
        console.error(`Attempt ${attempt + 1} parse error:`, parseErr);
        if (attempt < MAX_RETRIES) continue;
      }
    }

    if (!analyses || !Array.isArray(analyses)) {
      throw new Error("Could not generate AI impact analysis. Please try again.");
    }

    // Ensure defaults
    analyses = analyses.map((a: any) => ({
      ...a,
      aiLedFunctions: a.aiLedFunctions || [],
      humanLedFunctions: a.humanLedFunctions || [],
      collaborativeFunctions: a.collaborativeFunctions || [],
      valueChain: a.valueChain || [],
      kpis: a.kpis || [],
      automationRate: a.automationRate || 0,
      jobDisplacementIndex: a.jobDisplacementIndex || 0,
      humanResilienceScore: a.humanResilienceScore || 0,
      collaborativeOpportunityIndex: a.collaborativeOpportunityIndex || 0,
    }));

    console.log("Generated AI impact for", analyses.length, "industries");

    // Update the cached intelligence with aiImpact data
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get auth user
      const authHeader = req.headers.get("authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          // Read existing cached intelligence and merge aiImpact into it
          const { data: cached } = await supabase
            .from("cached_intelligence")
            .select("intelligence_data")
            .eq("user_id", user.id)
            .maybeSingle();

          if (cached?.intelligence_data) {
            const existing = cached.intelligence_data as any;
            existing.aiImpact = analyses;

            await supabase
              .from("cached_intelligence")
              .upsert(
                {
                  user_id: user.id,
                  intelligence_data: existing,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
              );
            console.log("AI impact merged into cached intelligence for user:", user.id);
          }
        }
      }
    } catch (cacheErr) {
      console.error("Failed to cache AI impact (non-fatal):", cacheErr);
    }

    return new Response(JSON.stringify({ success: true, data: analyses }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating AI impact:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

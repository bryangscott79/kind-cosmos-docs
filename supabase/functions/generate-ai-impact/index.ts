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

    const { industry, profile, saveToCache } = await req.json();
    if (!industry || !industry.id || !industry.name) throw new Error("Single industry object required");

    const today = new Date().toISOString().split("T")[0];
    const entityContext = profile?.entity_type ? `\nThe user's business model is: ${profile.entity_type.toUpperCase()}.` : "";
    const personaContext = profile?.user_persona ? ` Their role focus is: ${profile.user_persona}.` : "";
    const maturityContext = profile?.ai_maturity_self ? ` Their AI maturity level is: ${profile.ai_maturity_self}.` : "";
    const businessContext = profile?.business_summary || profile?.ai_summary || "";

    const systemPrompt = `You are an expert AI industry analyst specializing in how artificial intelligence is transforming business functions across every sector. You classify business functions into three zones based on AI automation levels, and you understand value chains deeply. Today is ${today}.`;

    const userPrompt = `Analyze AI's impact on this industry: ${industry.name}
${entityContext}${personaContext}${maturityContext}
${businessContext ? `\nThe user's business: ${businessContext}` : ""}

Generate a comprehensive AI impact analysis:

**THREE ZONES** — classify 2-4 business functions into each zone:
- **AI-Led** (zone: "ai_led", automationLevel 60-95): Functions where AI handles most work.
- **Human-Led** (zone: "human_led", automationLevel 5-20): Functions where humans are essential.
- **Collaborative Edge** (zone: "collaborative", automationLevel 25-55): THE HIGHEST OPPORTUNITY ZONE. AI augments humans.

Each function needs: name, description (1-2 sentences), automationLevel (0-100), zone, jobsAffected (2-4 job titles), opportunityType (one of "cost_reduction", "revenue_growth", "efficiency", "new_capability", "risk_reduction"), timeline ("now", "6_months", "1_year", "2_plus_years").

**AGGREGATE SCORES** (all 0-100): automationRate, jobDisplacementIndex, humanResilienceScore, collaborativeOpportunityIndex

**VALUE CHAIN** — 4-7 stages: id, name, zone, automationLevel (0-100), aiTools (2-3), humanRoles (2-3), opportunity (one sentence)

**KPIs** — 4-6 metrics: name, value (number), unit (%, $M, x, etc.), trend ("up"/"down"/"stable"), context (one sentence)

Make this specific and realistic. Use real AI tools and real job titles.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "deliver_ai_impact",
          description: "Deliver AI impact analysis for a single industry",
          parameters: {
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
    ];

    console.log("Generating AI impact for industry:", industry.name);

    const MAX_RETRIES = 2;
    let analysis: any = null;

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
          if (response.status === 402) {
            return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (attempt < MAX_RETRIES) continue;
          throw new Error(`AI error: ${response.status}`);
        }

        const data = await response.json();

        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          analysis = JSON.parse(toolCall.function.arguments);
          // Ensure industryId/Name are set
          analysis.industryId = analysis.industryId || industry.id;
          analysis.industryName = analysis.industryName || industry.name;
          break;
        }

        // Fallback: try content
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
            analysis.industryId = analysis.industryId || industry.id;
            analysis.industryName = analysis.industryName || industry.name;
            break;
          }
        }

        console.log(`Attempt ${attempt + 1}: No parseable response`);
      } catch (parseErr) {
        console.error(`Attempt ${attempt + 1} parse error:`, parseErr);
        if (attempt < MAX_RETRIES) continue;
      }
    }

    if (!analysis) {
      throw new Error("Could not generate AI impact analysis for " + industry.name);
    }

    // Ensure defaults
    analysis = {
      ...analysis,
      aiLedFunctions: analysis.aiLedFunctions || [],
      humanLedFunctions: analysis.humanLedFunctions || [],
      collaborativeFunctions: analysis.collaborativeFunctions || [],
      valueChain: analysis.valueChain || [],
      kpis: analysis.kpis || [],
      automationRate: analysis.automationRate || 0,
      jobDisplacementIndex: analysis.jobDisplacementIndex || 0,
      humanResilienceScore: analysis.humanResilienceScore || 0,
      collaborativeOpportunityIndex: analysis.collaborativeOpportunityIndex || 0,
    };

    console.log("Generated AI impact for:", industry.name);

    // Always save this industry result incrementally to cache
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseKey);

      const authHeader = req.headers.get("authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await sb.auth.getUser(token);

        if (user) {
          const { data: cached } = await sb
            .from("cached_intelligence")
            .select("intelligence_data")
            .eq("user_id", user.id)
            .maybeSingle();

          if (cached?.intelligence_data) {
            const existing = cached.intelligence_data as any;
            const currentAiImpact: any[] = existing.aiImpact || [];
            // Replace if this industry already exists, otherwise append
            const idx = currentAiImpact.findIndex((a: any) => a.industryId === analysis.industryId);
            if (idx >= 0) {
              currentAiImpact[idx] = analysis;
            } else {
              currentAiImpact.push(analysis);
            }
            existing.aiImpact = currentAiImpact;
            await sb
              .from("cached_intelligence")
              .upsert(
                { user_id: user.id, intelligence_data: existing, updated_at: new Date().toISOString() },
                { onConflict: "user_id" }
              );
            console.log("AI impact cached incrementally for:", industry.name);
          }
        }
      }
    } catch (cacheErr) {
      console.error("Cache error (non-fatal):", cacheErr);
    }

    return new Response(JSON.stringify({ success: true, data: analysis }), {
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

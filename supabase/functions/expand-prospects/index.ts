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
    const {
      profile,
      verticalName,       // e.g. "Fast Casual & QSR Dining"
      verticalId,         // e.g. "fast-casual-qsr"
      scope,              // "local" | "national" | "international" | "all"
      existingCompanyNames, // to avoid duplicates
      exampleCompanies,   // hint companies from taxonomy
    } = await req.json();

    if (!profile) throw new Error("Profile required");
    if (!verticalName) throw new Error("verticalName required");

    const {
      company_name,
      business_summary,
      ai_summary,
      location_city,
      location_state,
      location_country,
      entity_type,
    } = profile;

    const today = new Date().toISOString().split("T")[0];
    const locationStr = [location_city, location_state, location_country].filter(Boolean).join(", ") || "United States";
    const avoidList = (existingCompanyNames || []).join(", ");
    const examplesHint = (exampleCompanies || []).slice(0, 6).join(", ");

    const scopeInstructions = {
      local: `Generate ONLY companies near ${location_city || "the user's city"}, ${location_state || "the user's state"} (within ~150 miles). All scope values must be "local".`,
      national: `Generate ONLY companies in the United States but OUTSIDE ${location_state || "GA"} and its immediate neighbors. Spread across diverse US states. All scope values must be "national".`,
      international: `Generate ONLY companies OUTSIDE the United States. Include companies from UK, Germany, Japan, Canada, Australia, France, Singapore, Brazil, India, etc. All scope values must be "international".`,
      all: `Generate a MIX: ~4 local (near ${locationStr}), ~4 national (other US states), ~4 international (outside US). Set scope correctly for each.`,
    };

    const systemPrompt = `You are an elite B2B market intelligence analyst specializing in the ${verticalName} industry. You have encyclopedic knowledge of companies in this space globally — from Fortune 500 leaders to fast-growing challengers. Today is ${today}.`;

    const userPrompt = `Generate 10-14 high-quality prospect companies in the "${verticalName}" vertical for this user:

Company: ${company_name || "Unknown"}
Business: ${business_summary || ai_summary || "B2B services provider"}
Location: ${locationStr}
Business Type: ${entity_type || "b2b"}

GEOGRAPHIC SCOPE:
${scopeInstructions[scope as keyof typeof scopeInstructions] || scopeInstructions.all}

IMPORTANT RULES:
1. DO NOT include these companies (already in pipeline): ${avoidList || "none"}
2. Companies similar to: ${examplesHint || verticalName} — but DIFFERENT specific companies
3. Include a DIVERSE mix of company sizes: some enterprise ($1B+), some mid-market ($50M-$1B), some growth-stage ($5M-$50M)
4. Every company must be a REAL, verifiable company that actually operates in ${verticalName}
5. Each company needs:
   - A specific "Why Now" sales trigger (recent event, growth signal, strategic shift)
   - 3-4 decision maker contacts (use real names when confident, functional titles when not)
   - 2-3 recommended services to pitch
   - 2-3 competitors
   - Website URL
6. For decision makers: generate LinkedIn SEARCH URLs (not fake profile URLs)
7. Industry ID for all prospects should be: "${verticalId || verticalName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}"

Think carefully about what companies actually exist in this industry and would be valuable sales targets.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "deliver_prospects",
          description: "Deliver the expanded prospect list",
          parameters: {
            type: "object",
            properties: {
              prospects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    companyName: { type: "string" },
                    industryId: { type: "string" },
                    industryName: { type: "string" },
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
                          verified: { type: "boolean" },
                          source: { type: "string" },
                          relevance: { type: "string" },
                        },
                        required: ["name", "title", "linkedinUrl", "verified"],
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
                        },
                        required: ["service", "rationale"],
                        additionalProperties: false,
                      },
                    },
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
                    scope: { type: "string", enum: ["local", "national", "international"] },
                    websiteUrl: { type: "string" },
                    competitors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                        },
                        required: ["name", "description"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["id", "companyName", "industryId", "industryName", "vigylScore", "pressureResponse", "whyNow", "decisionMakers", "location", "annualRevenue", "employeeCount", "scope"],
                  additionalProperties: false,
                },
              },
            },
            required: ["prospects"],
            additionalProperties: false,
          },
        },
      },
    ];

    console.log(`Expanding prospects for vertical: "${verticalName}" scope: ${scope}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "deliver_prospects" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    let prospects: any[] = [];

    // Try tool_calls first
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      prospects = parsed.prospects || [];
    } else {
      // Fallback: extract from content
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          prospects = parsed.prospects || [];
        }
      }
    }

    // Add defaults
    prospects = prospects.map((p: any) => ({
      ...p,
      id: p.id || `exp-${verticalId}-${crypto.randomUUID().slice(0, 8)}`,
      pipelineStage: "researching",
      lastContacted: null,
      notes: "",
      relatedSignals: p.relatedSignals || [],
      recommendedServices: p.recommendedServices || [],
      websiteUrl: p.websiteUrl || "",
      relatedLinks: p.relatedLinks || [],
      competitors: p.competitors || [],
      scope: p.scope || scope === "all" ? undefined : scope,
      _expandedFrom: verticalId,
      _expandedAt: new Date().toISOString(),
    }));

    // Save to expanded_prospects table
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const rows = prospects.map((p: any) => ({
        user_id: profile.user_id,
        prospect_id: p.id,
        vertical_id: verticalId,
        vertical_name: verticalName,
        scope: p.scope || "national",
        prospect_data: p,
      }));

      const { error: insertError } = await supabase
        .from("expanded_prospects")
        .insert(rows);

      if (insertError) {
        console.error("Failed to save expanded prospects:", insertError);
      } else {
        console.log(`Saved ${rows.length} expanded prospects for vertical "${verticalName}"`);
      }
    } catch (dbErr) {
      console.error("DB save error (non-fatal):", dbErr);
    }

    console.log(`Generated ${prospects.length} expanded prospects for "${verticalName}" (${scope})`);

    return new Response(
      JSON.stringify({ success: true, prospects, count: prospects.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error expanding prospects:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

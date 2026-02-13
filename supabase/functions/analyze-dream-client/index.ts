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

    const { companyName, profile } = await req.json();
    if (!companyName || !profile) throw new Error("Company name and profile required");

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = `You are an elite B2B sales intelligence analyst. You research companies deeply, identifying divisions, subsidiaries, and business units that could be potential customers. Today is ${today}.`;

    const userPrompt = `The user sells: ${profile.business_summary || profile.ai_summary || "business services"}
Company: ${profile.company_name || "Unknown"}

The user wants to sell to "${companyName}" or any of its divisions/subsidiaries.

Research this company and:
1. Identify 2-5 divisions, subsidiaries, or business units within "${companyName}" that would be the BEST fit for what the user sells
2. For each division, explain WHY NOW is a good time to approach them (recent news, leadership changes, strategic shifts, pain points)
3. Identify key decision makers at each division
4. Recommend specific services the user could sell to each division
5. Provide a fit score (0-100) for each division

If the company doesn't have clear divisions, analyze the company as a whole and identify 2-3 different angles/departments to approach.

Be specific, realistic, and actionable. Use real division names when possible.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "deliver_dream_client_analysis",
          description: "Deliver the dream client analysis",
          parameters: {
            type: "object",
            properties: {
              companyOverview: { type: "string" },
              divisions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    divisionName: { type: "string" },
                    parentCompany: { type: "string" },
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
                  },
                  required: ["id", "divisionName", "parentCompany", "companyName", "industryId", "vigylScore", "pressureResponse", "whyNow", "decisionMakers", "recommendedServices", "location", "annualRevenue", "employeeCount"],
                  additionalProperties: false,
                },
              },
            },
            required: ["companyOverview", "divisions"],
            additionalProperties: false,
          },
        },
      },
    ];

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
        tool_choice: { type: "function", function: { name: "deliver_dream_client_analysis" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("No structured response from AI");

    const analysis = JSON.parse(toolCall.function.arguments);

    // Convert divisions to prospect format
    const prospects = analysis.divisions.map((div: any) => ({
      ...div,
      companyName: `${div.parentCompany} — ${div.divisionName}`,
      relatedSignals: [],
      pipelineStage: "researching",
      lastContacted: null,
      notes: "",
      scope: "national",
      isDreamClient: true,
    }));

    return new Response(JSON.stringify({
      success: true,
      data: { companyOverview: analysis.companyOverview, prospects },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error analyzing dream client:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

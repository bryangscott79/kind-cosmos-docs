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

    const { companyName, industryContext, whyNow, userServices, existingContacts } = await req.json();
    if (!companyName) throw new Error("Company name required");

    const existingNames = (existingContacts || []).map((c: any) => c.name).filter(Boolean);

    const systemPrompt = `You are a business intelligence researcher specializing in identifying corporate leadership and key decision makers. You research companies using your knowledge of publicly available information including company websites, SEC filings, press releases, news articles, and industry publications.

CRITICAL RULES:
- ONLY return people you are CONFIDENT currently hold the role at this company based on your training data
- For each person, cite your source of knowledge (company website, SEC filing, press release, news, public knowledge)
- If you cannot confidently identify a specific person for a key role, still include the role with verified=false and the title as the name
- Generate LinkedIn SEARCH URLs (not profile URLs): https://www.linkedin.com/search/results/people/?keywords=PersonName%20CompanyName
- Include 6-10 key contacts, prioritizing roles that align with the user's services and the prospect's current situation
- Include C-suite, SVPs, VPs, and Directors — focus on the decision-making chain for the specific opportunity
- For each contact, explain their RELEVANCE to the opportunity in one sentence`;

    const userPrompt = `Research the leadership team at "${companyName}".

${industryContext ? `Industry context: ${industryContext}` : ""}
${whyNow ? `Current opportunity: ${whyNow}` : ""}
${userServices ? `The user sells: ${userServices}` : ""}
${existingNames.length > 0 ? `Already identified (verify and supplement): ${existingNames.join(", ")}` : ""}

Find the key leadership and decision makers at this company. Prioritize:
1. C-suite executives (CEO, CFO, CTO, CMO, COO, CDO, CHRO)
2. VPs and SVPs in departments most relevant to the opportunity
3. Directors who would influence purchasing decisions for the user's services
4. Any recently appointed leaders (new hires are often change agents)

For each person, indicate whether you're confident they currently hold this role (verified=true) or if it's a suggested role to target (verified=false).`;

    const tools = [
      {
        type: "function",
        function: {
          name: "deliver_contacts",
          description: "Deliver the enriched contact list",
          parameters: {
            type: "object",
            properties: {
              companyInfo: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  headquarters: { type: "string" },
                  website: { type: "string" },
                  employeeEstimate: { type: "string" },
                },
                required: ["fullName"],
                additionalProperties: false,
              },
              contacts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Real name if verified, functional title if not" },
                    title: { type: "string", description: "Full job title" },
                    department: { type: "string", description: "Department or function area" },
                    linkedinUrl: { type: "string", description: "LinkedIn search URL" },
                    verified: { type: "boolean", description: "true only if confident this person currently holds this role" },
                    source: { type: "string", description: "How you know: 'Company leadership page', 'SEC filing', 'Press release', 'News article', 'Public knowledge'" },
                    relevance: { type: "string", description: "Why this person matters for the specific opportunity" },
                    recentActivity: { type: "string", description: "Any recent news, quotes, or actions by this person (optional)" },
                  },
                  required: ["name", "title", "linkedinUrl", "verified", "relevance"],
                  additionalProperties: false,
                },
              },
              researchNotes: { type: "string", description: "Brief notes on data quality, gaps, or suggestions for the user" },
            },
            required: ["contacts", "researchNotes"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "deliver_contacts" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} — ${errText}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Post-process: ensure all LinkedIn URLs are proper search URLs
    if (result.contacts) {
      result.contacts = result.contacts.map((c: any) => {
        if (!c.linkedinUrl || c.linkedinUrl === "#" || !c.linkedinUrl.includes("linkedin.com")) {
          const searchTerms = c.verified && c.name ? `${c.name} ${companyName}` : `${c.title} ${companyName}`;
          c.linkedinUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchTerms)}`;
        }
        return c;
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Contact enrichment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

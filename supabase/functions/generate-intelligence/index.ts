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
      entity_type,
      user_persona,
      ai_maturity_self,
    } = profile;

    const today = new Date().toISOString().split("T")[0];
    const locationStr = [location_city, location_state, location_country].filter(Boolean).join(", ") || "United States";

    const entityContext = entity_type ? `\nBusiness Model: ${entity_type.toUpperCase()}` : "";
    const personaContext = user_persona ? `\nUser Persona: ${user_persona}` : "";
    const maturityContext = ai_maturity_self ? `\nAI Maturity: ${ai_maturity_self}` : "";

    const systemPrompt = `You are an elite B2B sales intelligence analyst with deep knowledge of EVERY industry globally. You track companies of all sizes from Fortune 500 to emerging startups across every sector. You generate realistic, actionable market intelligence. Today is ${today}.`;

    const userPrompt = `Generate comprehensive, personalized sales intelligence for this user:

Company: ${company_name || "Unknown"}
Website: ${website_url || "Not provided"}
Business Summary: ${business_summary || ai_summary || "Not provided"}
Target Industries: ${target_industries?.join(", ") || "All industries - cast a wide net"}
Location: ${locationStr}${entityContext}${personaContext}${maturityContext}
${feedbackContext}

Generate intelligence across a WIDE range of industries. Think globally and across ALL major sectors including but NOT limited to:
- Technology & SaaS, Cybersecurity, AI & ML
- Healthcare & Life Sciences, Medical Devices, Digital Health
- Financial Services, Banking, Insurance, FinTech, Payments
- Food & Beverage, Fast Casual & QSR Dining, C-Store/Convenience, CPG
- Craft & Artisan Brands, Beverage Companies, Restaurant Chains
- Automotive & Transportation, EV & Battery, Fleet Management
- Airlines & Aviation, Logistics & Supply Chain, Last-Mile Delivery
- Electronics & Consumer Tech, Semiconductors
- Retail & E-Commerce, DTC Brands, Marketplaces
- Manufacturing & Industrial, Controls & Automation Companies
- 3D Printing, Packaging, Chemicals & Materials
- Aerospace & Defense
- Energy & Utilities, Clean Energy, EV Charging
- Real Estate & Construction, PropTech
- Media & Entertainment, Production Studios, Streaming, Gaming
- Advertising & Media Buying, MarTech & AdTech
- Music & Audio, Publishing & News
- Telecommunications, 5G, Satellite & Space Tech
- Agriculture & AgTech, Food Processing
- Hospitality & Tourism, Hotels
- Education & EdTech, Corporate Training
- Professional Services, Legal, Consulting, Staffing
- Government & GovTech, Nonprofit
- Pet Care, Fitness & Wellness
- Waste Management, Water & Wastewater
- Carbon & Sustainability

Generate diverse, high-quality intelligence. Be concise but specific.

1. **16-20 industries** most relevant to this user's sales targets. Include DIVERSE industries — not just obvious ones. Cover at least 8 different sectors. Include health scores (0-100), trend direction, and top market signals for each.

2. **25-35 market signals** across these industries. Signal types: political, regulatory, economic, hiring, tech, supply_chain, social, competitive, environmental.
   Each signal needs a clear sales implication. Use recent dates near ${today}. Include REAL publication sources with realistic URLs.
   For each signal, include 2-3 "impactedEntities" with name, type (industry/company), impact (positive/negative), action (engage/avoid/monitor), and reason.

3. **45-60 prospect companies** in THREE BATCHES:

   **BATCH A — LOCAL (15-20 prospects, scope: "local"):**
   Companies near ${location_city || "the user's city"}, ${location_state || "the user's state"} (within ~150 miles).
   Include a MIX: well-known regional employers, fast-growing startups, mid-market companies, and local operations of national brands.
   
   **BATCH B — NATIONAL (18-25 prospects, scope: "national"):**
   Companies in OTHER US states far from ${location_state || "GA"}.
   Spread across at least 8 different states and 10+ different industries. Include Fortune 500s, mid-market leaders, and growth-stage companies.
   
   **BATCH C — INTERNATIONAL (12-15 prospects, scope: "international"):**
   Companies in OTHER COUNTRIES (UK, Germany, Japan, Canada, Australia, Singapore, France, Brazil, India, etc.).
   Cover at least 5 different countries and diverse industries.

    CRITICAL RULES:
    - Each prospect's "industryId" MUST match an industry you generated. An airline is NOT "Education". Match the prospect's ACTUAL business to the correct industry.
    - Include a MIX of company sizes and spread across at least 12 different industries
    - REQUIRED: Include companies from food & beverage (QSR, CPG, craft brands), manufacturing (controls, automation), media (production studios, streaming), retail (DTC, marketplaces), and healthcare — not just tech!
    - Think about REAL companies the user might recognize — well-known brands, regional leaders, and fast-growing challengers across the FULL BREADTH of the economy
    - Each with a "Why Now" reason, key contacts, 2-3 recommended services, websiteUrl, 2-3 relatedLinks, and 2-3 competitors

    DECISION MAKER RULES (CRITICAL):
    - For each prospect, include 3-5 key contacts who would be relevant to the opportunity
    - ONLY use names of real, publicly verifiable executives (C-suite, SVPs, VPs) you are CONFIDENT exist at this company from public knowledge
    - If you are NOT confident a specific person holds a role, set name to the functional title (e.g. "Chief Digital Officer") and set verified to false
    - For verified contacts, set verified to true and include a source (e.g. "Company leadership page", "SEC filing", "Press release")
    - For linkedinUrl: generate a LinkedIn SEARCH URL like "https://www.linkedin.com/search/results/people/?keywords=Chief%20Digital%20Officer%20CompanyName" — NEVER use "#" or fake profile URLs
    - Include a brief "relevance" explaining why this person matters for the specific opportunity
    - Prioritize roles that align with the user's services and the prospect's "Why Now" trigger

Make everything specific to the user's business capabilities and geography.`;



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
                    impactedEntities: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          type: { type: "string", enum: ["industry", "company"] },
                          impact: { type: "string", enum: ["positive", "negative"] },
                          action: { type: "string", enum: ["engage", "avoid", "monitor"] },
                          reason: { type: "string" },
                        },
                        required: ["name", "type", "impact", "action", "reason"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["id", "title", "summary", "industryTags", "signalType", "sentiment", "severity", "salesImplication", "sourceUrl", "publishedAt", "sources", "impactedEntities"],
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
                          name: { type: "string", description: "Real name if verified, or functional title if not (e.g. 'Chief Digital Officer')" },
                          title: { type: "string", description: "Job title / role" },
                          linkedinUrl: { type: "string", description: "LinkedIn SEARCH URL for this person/role at the company. Format: https://www.linkedin.com/search/results/people/?keywords=Title%20CompanyName" },
                          verified: { type: "boolean", description: "true if you are confident this is a real person from public knowledge" },
                          source: { type: "string", description: "Where you know this person from: 'Company website', 'SEC filing', 'Press release', 'Public knowledge', or empty if not verified" },
                          relevance: { type: "string", description: "Brief reason why this person matters for this specific opportunity" },
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
                    scope: { type: "string", enum: ["local", "national", "international"] },
                    websiteUrl: { type: "string" },
                    relatedLinks: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          url: { type: "string" },
                        },
                        required: ["title", "url"],
                        additionalProperties: false,
                      },
                    },
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
                  required: ["id", "companyName", "industryId", "vigylScore", "pressureResponse", "whyNow", "decisionMakers", "relatedSignals", "pipelineStage", "lastContacted", "notes", "location", "annualRevenue", "employeeCount", "scope"],
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

    const MAX_RETRIES = 2;
    let intelligence: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-5-mini",
            max_completion_tokens: 16384,
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
          if (attempt < MAX_RETRIES) {
            console.log(`Attempt ${attempt + 1} failed with status ${response.status}, retrying...`);
            continue;
          }
          throw new Error(`AI error: ${response.status}`);
        }

        const data = await response.json();
        
        // Try tool_calls first
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          intelligence = JSON.parse(toolCall.function.arguments);
          break;
        }

        // Fallback: try to extract JSON from message content
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log("No tool_calls, attempting to parse from content...");
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.industries && parsed.signals && parsed.prospects) {
              intelligence = parsed;
              break;
            }
          }
        }

        const rawMessage = JSON.stringify(data.choices?.[0]?.message ?? data);
        console.log(`Attempt ${attempt + 1}: No parseable response, raw choice:`, rawMessage.substring(0, 500));
        if (attempt < MAX_RETRIES) {
          console.log("Retrying...");
          continue;
        }
      } catch (parseErr) {
        console.error(`Attempt ${attempt + 1} parse error:`, parseErr);
        if (attempt < MAX_RETRIES) continue;
      }
    }

    if (!intelligence) {
      throw new Error("Could not generate intelligence after multiple attempts. Please try again.");
    }

    // Safety: ensure required arrays exist
    if (!Array.isArray(intelligence.industries)) intelligence.industries = [];
    if (!Array.isArray(intelligence.signals)) intelligence.signals = [];
    if (!Array.isArray(intelligence.prospects)) intelligence.prospects = [];

    if (intelligence.industries.length === 0) {
      throw new Error("AI returned empty intelligence. Please try again.");
    }

    // Post-process: add score history to industries
    intelligence.industries = intelligence.industries.map((ind: any, idx: number) => ({
      ...ind,
      scoreHistory: generateScoreHistory(ind.healthScore, ind.trendDirection || "stable", idx + 100),
    }));

    // Build industry lookup for validation
    const industryMap = new Map<string, any>();
    intelligence.industries.forEach((ind: any) => {
      industryMap.set(ind.id, ind);
    });

    // Post-process: validate prospect-industry assignments
    // Keywords that should NEVER appear in certain industries
    const industryKeywordBlacklist: Record<string, RegExp[]> = {
      "education": [/airline/i, /aviation/i, /restaurant/i, /mining/i, /petroleum/i, /oil\b/i, /gas\b/i],
      "edtech": [/airline/i, /aviation/i, /restaurant/i, /mining/i, /petroleum/i],
      "healthcare": [/airline/i, /aviation/i, /mining/i],
      "defense": [/restaurant/i, /bakery/i, /cafe/i, /food\b/i],
    };

    // Keywords that indicate what industry a company SHOULD be in
    const industryIndicators: { pattern: RegExp; keywords: string[] }[] = [
      { pattern: /airline|aviation|airways|air\s?lines/i, keywords: ["airline", "aviation", "transport", "aerospace"] },
      { pattern: /restaurant|food|beverage|cafe|bakery|brewing|distill/i, keywords: ["food", "beverage", "hospitality"] },
      { pattern: /bank|financial|capital|wealth|insurance|credit/i, keywords: ["financial", "banking", "insurance"] },
      { pattern: /pharma|biotech|therapeutics|medical|health/i, keywords: ["pharma", "health", "life science", "biotech"] },
      { pattern: /mining|petroleum|oil|energy|solar|wind/i, keywords: ["energy", "mining", "natural resource"] },
      { pattern: /auto|motor|vehicle|car\b/i, keywords: ["auto", "transport", "vehicle"] },
      { pattern: /tech|software|digital|cloud|data|cyber/i, keywords: ["tech", "saas", "software", "digital"] },
      { pattern: /retail|store|shop|commerce/i, keywords: ["retail", "commerce", "consumer"] },
      { pattern: /construct|building|real estate|property/i, keywords: ["real estate", "construct"] },
      { pattern: /hotel|resort|tourism|hospitality|travel/i, keywords: ["hospitality", "tourism", "travel"] },
      { pattern: /school|university|education|learning|academy/i, keywords: ["education", "edtech", "learning"] },
      { pattern: /logistic|shipping|freight|supply chain/i, keywords: ["logistic", "supply chain", "shipping"] },
      { pattern: /media|entertainment|broadcast|streaming|film/i, keywords: ["media", "entertainment"] },
      { pattern: /telecom|wireless|mobile|network/i, keywords: ["telecom", "communication"] },
      { pattern: /agri|farm|crop|seed/i, keywords: ["agri", "agtech", "farm"] },
    ];

    function findBestIndustry(companyName: string, industries: any[]): string | null {
      for (const indicator of industryIndicators) {
        if (indicator.pattern.test(companyName)) {
          // Find an industry whose name matches one of the keywords
          const match = industries.find((ind: any) =>
            indicator.keywords.some((kw) => ind.name.toLowerCase().includes(kw))
          );
          if (match) return match.id;
        }
      }
      return null;
    }

    function isIndustryMismatch(companyName: string, industryName: string): boolean {
      const indLower = industryName.toLowerCase();
      for (const [indKey, patterns] of Object.entries(industryKeywordBlacklist)) {
        if (indLower.includes(indKey)) {
          if (patterns.some((p) => p.test(companyName))) return true;
        }
      }
      return false;
    }

    // Ensure all prospects have proper defaults and infer scope if missing
    const STATE_ABBREV: Record<string, string> = {
      alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
      colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
      hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
      kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
      massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
      montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
      "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND",
      ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI",
      "south carolina": "SC", "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT",
      vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV",
      wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
    };
    function normState(raw: string): string {
      const trimmed = raw.trim();
      const upper = trimmed.toUpperCase();
      if (upper.length === 2) return upper;
      return STATE_ABBREV[trimmed.toLowerCase()] || upper;
    }
    const NEIGHBORING: Record<string, string[]> = {
      GA: ["AL", "FL", "SC", "NC", "TN"], FL: ["GA", "AL"], AL: ["GA", "FL", "TN", "MS"],
      SC: ["GA", "NC"], NC: ["GA", "SC", "TN", "VA"], TN: ["GA", "AL", "NC", "VA", "KY", "MS"],
      CA: ["OR", "NV", "AZ"], TX: ["NM", "OK", "AR", "LA"], NY: ["NJ", "CT", "PA", "MA", "VT"],
      VA: ["NC", "TN", "KY", "WV", "MD", "DC"], PA: ["NY", "NJ", "DE", "MD", "OH", "WV"],
    };
    const userStateNorm = normState(location_state || "");
    const userCity = (location_city || "").trim().toLowerCase();
    const userCountry = (location_country || "US").trim().toUpperCase();

    // Also do a broad mismatch check: if company name contains indicator keywords but industry name doesn't
    function isBroadMismatch(companyName: string, industryName: string): boolean {
      const indLower = industryName.toLowerCase();
      for (const indicator of industryIndicators) {
        if (indicator.pattern.test(companyName)) {
          // Check if the industry name contains ANY of the expected keywords
          const matchesExpectedIndustry = indicator.keywords.some((kw) => indLower.includes(kw));
          if (!matchesExpectedIndustry) {
            console.log(`Broad mismatch: "${companyName}" matches pattern ${indicator.pattern} but industry "${industryName}" doesn't contain any of [${indicator.keywords.join(", ")}]`);
            return true;
          }
        }
      }
      return false;
    }

    intelligence.prospects = intelligence.prospects.filter((p: any) => {
      // Validate industry assignment
      const currentIndustry = industryMap.get(p.industryId);
      
      // Check if industry ID even exists
      if (!currentIndustry) {
        console.log(`Removing "${p.companyName}" — industryId "${p.industryId}" not found`);
        return false;
      }

      const hasMismatch = isIndustryMismatch(p.companyName, currentIndustry.name) || isBroadMismatch(p.companyName, currentIndustry.name);
      
      if (hasMismatch) {
        const betterIndustryId = findBestIndustry(p.companyName, intelligence.industries);
        if (betterIndustryId) {
          console.log(`Reassigned "${p.companyName}" from "${currentIndustry.name}" to "${industryMap.get(betterIndustryId)?.name}"`);
          p.industryId = betterIndustryId;
          return true;
        } else {
          console.log(`Removing "${p.companyName}" — mismatched with "${currentIndustry.name}" and no better industry found`);
          return false;
        }
      }
      return true;
    }).map((p: any) => {

      let scope = p.scope;
      if (!scope) {
        const pCountry = (p.location?.country || "").trim().toUpperCase();
        const pState = normState(p.location?.state || "");
        const isIntl = pCountry && pCountry !== userCountry && pCountry !== "US" && pCountry !== "UNITED STATES";
        if (isIntl) {
          scope = "international";
        } else if (pState === userStateNorm) {
          scope = "local";
        } else if (NEIGHBORING[userStateNorm]?.includes(pState)) {
          scope = "local";
        } else {
          scope = "national";
        }
      }
      return {
        ...p,
        scope,
        pipelineStage: p.pipelineStage || "researching",
        lastContacted: p.lastContacted || null,
        notes: p.notes || "",
        recommendedServices: p.recommendedServices || [],
        websiteUrl: p.websiteUrl || "",
        relatedLinks: p.relatedLinks || [],
        competitors: p.competitors || [],
      };
    });

    // Validate scope distribution — log warnings if skewed
    const scopeCounts = { local: 0, national: 0, international: 0 };
    intelligence.prospects.forEach((p: any) => {
      if (p.scope in scopeCounts) scopeCounts[p.scope as keyof typeof scopeCounts]++;
    });
    console.log("Prospect scope distribution:", scopeCounts);
    if (scopeCounts.national === 0 && intelligence.prospects.length > 10) {
      console.warn("WARNING: No national prospects generated — scope inference may need attention");
    }
    if (scopeCounts.international === 0 && intelligence.prospects.length > 10) {
      console.warn("WARNING: No international prospects generated — scope inference may need attention");
    }

    console.log(
      "Generated:",
      intelligence.industries.length, "industries,",
      intelligence.signals.length, "signals,",
      intelligence.prospects.length, "prospects"
    );

    // Preserve any existing aiImpact from cache (generated by dedicated function)
    intelligence.aiImpact = intelligence.aiImpact || [];

    // Cache the intelligence data in the database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase
        .from("cached_intelligence")
        .upsert(
          {
            user_id: profile.user_id,
            intelligence_data: intelligence,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      console.log("Intelligence cached successfully for user:", profile.user_id);
    } catch (cacheErr) {
      console.error("Failed to cache intelligence (non-fatal):", cacheErr);
    }

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

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateScoreHistory(
  base: number,
  trendDirection: string = "stable",
  seed: number = 42
): { date: string; score: number }[] {
  const rng = seededRandom(seed + base * 1000);
  const history: { date: string; score: number }[] = [];

  let phase1Bias: number, phase2Bias: number, phase3Bias: number;
  if (trendDirection === "improving") {
    phase1Bias = -0.15; phase2Bias = 0.05; phase3Bias = 0.25;
  } else if (trendDirection === "declining") {
    phase1Bias = 0.1; phase2Bias = -0.1; phase3Bias = -0.2;
  } else {
    phase1Bias = 0.05; phase2Bias = -0.05; phase3Bias = 0.02;
  }

  let score = base - (phase1Bias + phase2Bias + phase3Bias) * 30;
  score = Math.max(10, Math.min(95, score));

  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const daysAgo = i;
    let bias: number;
    if (daysAgo >= 60) bias = phase1Bias;
    else if (daysAgo >= 30) bias = phase2Bias;
    else bias = phase3Bias;
    const noise = (rng() - 0.5) * 5;
    score = Math.max(5, Math.min(98, score + bias + noise));
    history.push({ date: date.toISOString().split("T")[0], score: Math.round(score) });
  }
  return history;
}

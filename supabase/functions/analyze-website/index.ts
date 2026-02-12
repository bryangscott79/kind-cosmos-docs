import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL is required");

    // Step 1: Scrape the website
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) throw new Error("FIRECRAWL_API_KEY not configured");

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Scraping:", formattedUrl);
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: formattedUrl, formats: ["markdown", "summary"], onlyMainContent: true }),
    });

    const scrapeData = await scrapeRes.json();
    if (!scrapeRes.ok) {
      console.error("Scrape error:", scrapeData);
      throw new Error("Failed to scrape website");
    }

    const summary = scrapeData?.data?.summary || scrapeData?.summary || "";
    const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";
    const pageTitle = scrapeData?.data?.metadata?.title || scrapeData?.metadata?.title || "";

    // Step 2: AI analysis to determine target industries
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const content = `Website: ${formattedUrl}\nTitle: ${pageTitle}\nSummary: ${summary}\n\nContent (first 3000 chars):\n${markdown.slice(0, 3000)}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a B2B sales intelligence analyst. Given a company's website content, analyze what the company does and determine which industries would be ideal targets for their products/services.

Return a JSON response using the tool provided.`
          },
          { role: "user", content }
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_industries",
            description: "Return industry analysis results",
            parameters: {
              type: "object",
              properties: {
                company_summary: { type: "string", description: "2-3 sentence summary of what the company does" },
                target_industries: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      match_score: { type: "number", description: "0-100 score of how good a fit this industry is" },
                      reasoning: { type: "string", description: "Why this industry is a good target" }
                    },
                    required: ["name", "match_score", "reasoning"]
                  }
                },
                selling_angles: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 key selling angles based on current market conditions"
                }
              },
              required: ["company_summary", "target_industries", "selling_angles"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_industries" } }
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiRes.text();
      console.error("AI error:", aiRes.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiRes.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      throw new Error("AI did not return structured analysis");
    }

    console.log("Analysis complete");
    return new Response(JSON.stringify({ success: true, analysis, website_title: pageTitle }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

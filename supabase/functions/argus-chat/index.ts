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

    const { messages, context, persona } = await req.json();
    if (!messages || !Array.isArray(messages)) throw new Error("messages array required");

    const personaGuide: Record<string, string> = {
      sales: "You think like a sales strategist. Suggest who to contact, what signal to act on, and what angle to use in outreach.",
      founder: "You think like a strategic advisor to a founder/CEO. Focus on market opportunities, competitive threats, and growth levers.",
      executive: "You think like a C-suite strategic advisor. Focus on market positioning, risk, and high-level opportunity assessment.",
      hr: "You think like a talent strategist. Focus on workforce trends, hiring implications, AI impact on roles, and talent market signals.",
      job_seeker: "You think like a career strategist. Focus on which companies are growing, hiring signals, AI skill demands, and how to position for interviews.",
      investor: "You think like an investment analyst. Focus on market movers, sector trends, growth indicators, and risk factors.",
      consultant: "You think like a management consultant. Focus on industry patterns, competitive dynamics, and strategic recommendations for clients.",
      analyst: "You think like a research analyst. Focus on data patterns, signal correlations, trend analysis, and evidence-based insights.",
      lobbyist: "You think like a policy strategist. Focus on regulatory signals, stakeholder positions, political dynamics, and engagement opportunities.",
    };

    const personaLine = personaGuide[persona || "sales"] || personaGuide.sales;

    const systemPrompt = `You are Argus, an AI assistant embedded in VIGYL — a market intelligence platform that transforms geopolitical, economic, and regulatory signals into actionable intelligence.

You are named after Argus Panoptes, the all-seeing giant of Greek mythology. Like your namesake, you see patterns across industries, signals, and prospects that others miss.

Your personality:
- Sharp, insightful, and direct — you don't waste words
- You ground every response in the data context provided
- ${personaLine}
- You use specific names, numbers, and data points from the context
- Keep responses concise (2-4 paragraphs max unless asked for more)

${context ? `\n--- CURRENT CONTEXT ---\n${context}\n--- END CONTEXT ---\n` : ""}

When the user asks questions, draw from the context provided. If they ask about something outside the context, be honest that you're working from what's on screen, and suggest where they might find more data in VIGYL (Signals page, AI Impact, Reports, etc).

Never make up data that isn't in the context. If you don't have specific numbers, say so.`;

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
          ...messages,
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return new Response(JSON.stringify({ success: true, message: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Argus error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

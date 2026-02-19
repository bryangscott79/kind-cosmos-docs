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

    const { prospect, industry, signals, contentType, userProfile, persona } = await req.json();
    if (!prospect || !contentType) throw new Error("prospect and contentType required");

    const signalContext = signals?.length
      ? signals.map((s: any) => `- ${s.title}: ${s.salesImplication || s.summary}`).join("\n")
      : "No specific signals available.";

    const decisionMakers = prospect.decisionMakers?.length
      ? prospect.decisionMakers.map((d: any) => `${d.name} (${d.title})`).join(", ")
      : "Unknown contacts";

    const userContext = userProfile
      ? `\nSender company: ${userProfile.company_name || "Unknown"}\nSender role: ${userProfile.role_title || "Unknown"}\nSender business: ${userProfile.business_summary || userProfile.ai_summary || "Not provided"}`
      : "";

    const personaContext = persona || "sales";

    // Map content types to their generation instructions
    const contentInstructions: Record<string, string> = {
      cold_email: `Write a cold email. Include a subject line on the first line as "Subject: ...". The email should:
- Open with a specific, research-backed hook referencing current signals or company events
- Connect their situation to the sender's capabilities naturally (no generic pitches)
- Reference the specific decision maker by first name
- Include one clear CTA
- Be 4-6 short paragraphs max
- Sound like a real human wrote it — no corporate buzzwords, no "I hope this email finds you well"`,

      follow_up: `Write a follow-up email for a prospect who hasn't responded to initial outreach. Include "Subject: ..." on the first line.
- Lead with new value (a fresh signal, insight, or relevant development)
- Be shorter than a cold email (3-4 paragraphs)
- Reference the previous outreach obliquely without being pushy
- Close with a soft CTA that gives them an easy out`,

      linkedin_message: `Write a LinkedIn connection/message request.
- Must be under 300 characters for connection request, or under 500 for InMail
- No subject line needed
- Open with something specific about them or their company
- Be conversational, not salesy
- End with a question or soft CTA`,

      meeting_brief: `Write a pre-meeting preparation brief. Structure it as:
**Company Overview** - key facts (revenue, size, industry position)
**Why This Meeting Matters** - current pressures, opportunities, signals
**Key Decision Maker** - who they are, their priorities, communication style hints
**Recommended Approach** - what angle to lead with based on their pressure response
**Questions to Ask** - 3-4 smart questions that demonstrate market awareness
**Things to Avoid** - potential landmines based on their current situation`,

      engagement_post: `Write a LinkedIn engagement post or comment that would resonate with this prospect.
- Reference an industry trend or signal that affects their company
- Show thought leadership without being self-promotional
- End with a question or perspective that invites discussion
- Keep it under 200 words`,

      cover_letter: `Write a cover letter for someone applying to this company. Include a greeting line.
- Open with a specific hook about why THIS company at THIS moment (reference signals)
- Connect the applicant's experience to the company's current needs
- Reference industry trends that make this role timely
- Show awareness of the company's market position and challenges
- Close with enthusiasm and a clear ask for an interview
- 3-4 paragraphs, professional but with personality`,

      interview_prep: `Write an interview preparation brief for someone interviewing at this company. Structure it as:
**Company Snapshot** - what they do, their market position, recent developments
**Why They're Hiring Now** - connect to signals and market pressures
**Key Themes to Emphasize** - what this company values based on their situation
**Smart Questions to Ask** - 4-5 questions that show market awareness
**Industry Context** - trends affecting their sector that you should reference
**Potential Red Flags** - things to watch for based on their pressure response`,
    };

    const instruction = contentInstructions[contentType] || contentInstructions.cold_email;

    const systemPrompt = `You are an expert ${personaContext === "job_seeker" ? "career strategist and application writer" : "B2B sales copywriter and strategist"}. You write high-converting, personalized content that sounds human and references specific market intelligence.

You never use:
- "I hope this email finds you well" or any generic opener
- Corporate jargon like "synergy", "leverage", "circle back"
- Fake urgency or manipulative language
- Generic compliments ("I've been following your impressive work...")

You always:
- Lead with a specific, researched insight
- Reference real signals and market events
- Write like a smart person having a conversation, not a salesperson reading a script
- Keep paragraphs short (2-3 sentences max)
- Use the prospect's actual name, company name, and situation`;

    const userPrompt = `Generate content for this ${contentType.replace(/_/g, " ")}:

TARGET COMPANY: ${prospect.companyName}
INDUSTRY: ${industry?.name || "Unknown"}
WHY NOW: ${prospect.whyNow}
PRESSURE RESPONSE: ${prospect.pressureResponse} (${prospect.pressureResponse === "growth_mode" ? "they're expanding, lead with opportunity" : prospect.pressureResponse === "contracting" ? "they're cutting costs, lead with efficiency/savings" : "they're investing strategically, show clear ROI"})
DECISION MAKERS: ${decisionMakers}
REVENUE: ${prospect.annualRevenue || "Unknown"}
EMPLOYEES: ${prospect.employeeCount?.toLocaleString() || "Unknown"}
LOCATION: ${prospect.location?.city || "Unknown"}, ${prospect.location?.state || ""}

RELEVANT MARKET SIGNALS:
${signalContext}
${userContext}

INSTRUCTIONS:
${instruction}

Write the content now. Do not include any meta-commentary or explanation — just the content itself.`;

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
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI generation failed (${response.status})`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Extract subject line if present
    let subject = "";
    let body = content;
    const subjectMatch = content.match(/^Subject:\s*(.+?)[\n\r]/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = content.slice(subjectMatch[0].length).trim();
    }

    return new Response(JSON.stringify({ subject, body }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Outreach generation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

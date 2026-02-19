import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user using anon client with auth header passed through
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) throw new Error("Invalid auth token");

    const user = { id: claimsData.claims.sub as string, email: (claimsData.claims.email || "") as string };

    const body = await req.json();
    const { action } = body;

    if (action === "subscribe") {
      const { email, frequency = "daily" } = body;
      if (!email) throw new Error("Email required");

      const { data, error } = await supabase
        .from("digest_subscriptions")
        .upsert({
          user_id: user.id,
          email,
          frequency,
          active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, subscription: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update") {
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (body.frequency !== undefined) updates.frequency = body.frequency;
      if (body.include_industry_health !== undefined) updates.include_industry_health = body.include_industry_health;
      if (body.include_signals !== undefined) updates.include_signals = body.include_signals;
      if (body.include_prospect_updates !== undefined) updates.include_prospect_updates = body.include_prospect_updates;
      if (body.include_pipeline_reminders !== undefined) updates.include_pipeline_reminders = body.include_pipeline_reminders;
      if (body.email !== undefined) updates.email = body.email;

      const { data, error } = await supabase
        .from("digest_subscriptions")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, subscription: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "unsubscribe") {
      const { data, error } = await supabase
        .from("digest_subscriptions")
        .update({ active: false, frequency: "never", updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, subscription: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "status") {
      const { data } = await supabase
        .from("digest_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return new Response(JSON.stringify({ subscription: data || null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    console.error("Digest subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

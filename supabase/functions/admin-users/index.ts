import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "list-users") {
      const { data: users, error } = await supabase.auth.admin.listUsers({ perPage: 100 });
      if (error) throw error;

      const { data: profiles } = await supabase.from("profiles").select("*");
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      const result = users.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        profile: profileMap.get(u.id) || null,
      }));

      return new Response(JSON.stringify({ users: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "set-tier") {
      const { userEmail, productId } = body;
      if (!userEmail) throw new Error("userEmail is required");

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

      // Find or create Stripe customer
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      let customerId: string;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: userEmail });
        customerId = customer.id;
      }

      // Cancel existing subscriptions
      const existingSubs = await stripe.subscriptions.list({ customer: customerId, status: "active" });
      for (const sub of existingSubs.data) {
        await stripe.subscriptions.cancel(sub.id);
      }

      // If productId is null (free tier), we're done
      if (!productId) {
        return new Response(JSON.stringify({ success: true, tier: "free" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find the price for this product
      const prices = await stripe.prices.list({ product: productId, active: true, limit: 1 });
      if (prices.data.length === 0) throw new Error("No active price found for product");

      // Create a subscription with a trial (so no payment needed for testing)
      await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: prices.data[0].id }],
        trial_period_days: 30,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

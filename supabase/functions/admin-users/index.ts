import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

      // Fetch current Stripe subscriptions for each user to determine tier
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
      const emailToProductId = new Map<string, string | null>();

      for (const u of users.users) {
        if (!u.email) continue;
        try {
          const customers = await stripe.customers.list({ email: u.email, limit: 1 });
          if (customers.data.length > 0) {
            const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 1 });
            const trialSubs = subs.data.length === 0
              ? await stripe.subscriptions.list({ customer: customers.data[0].id, status: "trialing", limit: 1 })
              : { data: [] };
            const activeSub = subs.data[0] || trialSubs.data[0];
            if (activeSub) {
              emailToProductId.set(u.email, activeSub.items.data[0]?.price?.product as string || null);
            }
          }
        } catch (e) {
          console.error(`Error fetching Stripe data for ${u.email}:`, e);
        }
      }

      const result = users.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        profile: profileMap.get(u.id) || null,
        product_id: emailToProductId.get(u.email) || null,
      }));

      return new Response(JSON.stringify({ users: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "invite-user") {
      const { email } = body;
      if (!email) throw new Error("email is required");

      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
      if (inviteError) throw inviteError;

      return new Response(JSON.stringify({ success: true, user: inviteData.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "set-tier") {
      const { userEmail, productId } = body;
      if (!userEmail) throw new Error("userEmail is required");

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      let customerId: string;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: userEmail });
        customerId = customer.id;
      }

      const existingSubs = await stripe.subscriptions.list({ customer: customerId, status: "active" });
      for (const sub of existingSubs.data) {
        await stripe.subscriptions.cancel(sub.id);
      }

      if (!productId) {
        return new Response(JSON.stringify({ success: true, tier: "free" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const prices = await stripe.prices.list({ product: productId, active: true, limit: 1 });
      if (prices.data.length === 0) throw new Error("No active price found for product");

      await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: prices.data[0].id }],
        trial_period_days: 30,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update-profile") {
      const { userId, updates } = body;
      if (!userId) throw new Error("userId is required");

      const allowedFields = [
        "company_name", "role_title", "website_url", "company_size",
        "location_city", "location_state", "location_country",
        "target_industries", "customer_industries", "user_persona",
        "ai_maturity_self", "entity_type", "business_summary"
      ];
      const safeUpdates: Record<string, any> = {};
      for (const key of allowedFields) {
        if (key in updates) safeUpdates[key] = updates[key];
      }

      const { error } = await supabase
        .from("profiles")
        .update(safeUpdates)
        .eq("user_id", userId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete-user") {
      const { userId } = body;
      if (!userId) throw new Error("userId is required");

      // Don't allow deleting yourself
      if (userId === userData.user.id) throw new Error("Cannot delete yourself");

      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-user-detail") {
      const { userId } = body;
      if (!userId) throw new Error("userId is required");

      const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId);
      if (authErr) throw authErr;

      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      const { data: signals } = await supabase.from("saved_signals").select("*").eq("user_id", userId);
      const { data: feedback } = await supabase.from("prospect_feedback").select("*").eq("user_id", userId);
      const { data: intelligence } = await supabase.from("cached_intelligence").select("id, created_at, updated_at").eq("user_id", userId);

      return new Response(JSON.stringify({
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          created_at: authUser.user.created_at,
          last_sign_in_at: authUser.user.last_sign_in_at,
          email_confirmed_at: authUser.user.email_confirmed_at,
        },
        profile,
        saved_signals: signals || [],
        prospect_feedback: feedback || [],
        cached_intelligence: intelligence || [],
      }), {
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

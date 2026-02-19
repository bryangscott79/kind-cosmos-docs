import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const log = (step: string, details?: any) => {
  const d = details ? ` — ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

// Product ID → tier key mapping (mirrors src/lib/tiers.ts)
const PRODUCT_TIER_MAP: Record<string, string> = {
  prod_Txyq2ciN3TGH2L: "starter",
  prod_TxyrkYcF0qmuhU: "pro",
  prod_TxyrhISvPjfGkD: "enterprise",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!stripeKey || !webhookSecret) {
    log("ERROR", { message: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" });
    return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(supabaseUrl, serviceKey);

  // Read raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    log("ERROR", { message: "Missing stripe-signature header" });
    return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("Signature verification failed", { message: msg });
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  log("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      // ── New subscription created via Checkout ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const customerEmail = session.customer_details?.email || session.customer_email;
        const subscriptionId = session.subscription as string;

        if (!customerEmail || !subscriptionId) {
          log("Missing email or subscription ID", { customerEmail, subscriptionId });
          break;
        }

        // Fetch subscription to get product ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const productId = subscription.items.data[0]?.price?.product as string;
        const tier = PRODUCT_TIER_MAP[productId] || "starter";

        log("Checkout completed", { email: customerEmail, tier, productId });

        // Find user by email and update their tier
        const { data: users } = await supabase.auth.admin.listUsers();
        const matchedUser = users?.users?.find(
          (u: any) => u.email?.toLowerCase() === customerEmail.toLowerCase()
        );

        if (matchedUser) {
          const { error: updateErr } = await supabase
            .from("profiles")
            .update({
              subscription_tier: tier,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
              subscription_status: "active",
              subscription_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            })
            .eq("id", matchedUser.id);

          if (updateErr) {
            log("Profile update failed", { error: updateErr.message });
          } else {
            log("Profile updated", { userId: matchedUser.id, tier });
          }

          // Track SUBSCRIPTION_STARTED via PostHog (server-side capture)
          const posthogKey = Deno.env.get("POSTHOG_API_KEY");
          if (posthogKey) {
            try {
              await fetch("https://us.i.posthog.com/capture/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  api_key: posthogKey,
                  event: "subscription_started",
                  distinct_id: matchedUser.id,
                  properties: {
                    tier,
                    product_id: productId,
                    amount: subscription.items.data[0]?.price?.unit_amount,
                    currency: subscription.items.data[0]?.price?.currency,
                    interval: subscription.items.data[0]?.price?.recurring?.interval,
                    $set: { subscription_tier: tier, email: customerEmail },
                  },
                }),
              });
              log("PostHog event sent");
            } catch {
              log("PostHog capture failed (non-fatal)");
            }
          }
        } else {
          log("No matching user found for email", { email: customerEmail });
        }
        break;
      }

      // ── Subscription updated (plan change, renewal) ──
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const productId = subscription.items.data[0]?.price?.product as string;
        const tier = PRODUCT_TIER_MAP[productId] || "starter";
        const customerId = subscription.customer as string;

        log("Subscription updated", { customerId, tier, status: subscription.status });

        // Look up user by stripe_customer_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              subscription_tier: subscription.status === "active" || subscription.status === "trialing" ? tier : "free",
              subscription_status: subscription.status,
              subscription_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            })
            .eq("id", profile.id);
          log("Profile tier updated", { userId: profile.id, tier });
        } else {
          // Fallback: look up by customer email
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          if (customer.email) {
            const { data: users } = await supabase.auth.admin.listUsers();
            const matched = users?.users?.find(
              (u: any) => u.email?.toLowerCase() === customer.email?.toLowerCase()
            );
            if (matched) {
              await supabase
                .from("profiles")
                .update({
                  subscription_tier: subscription.status === "active" ? tier : "free",
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscription.id,
                  subscription_status: subscription.status,
                })
                .eq("id", matched.id);
              log("Profile updated via email fallback", { userId: matched.id });
            }
          }
        }
        break;
      }

      // ── Subscription canceled / expired ──
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        log("Subscription deleted", { customerId });

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              subscription_tier: "free",
              subscription_status: "canceled",
              stripe_subscription_id: null,
            })
            .eq("id", profile.id);
          log("Downgraded to free", { userId: profile.id });
        }
        break;
      }

      // ── Invoice payment failed ──
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        log("Payment failed", { customerId, amount: invoice.amount_due });

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          await supabase
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", profile.id);
        }
        break;
      }

      default:
        log("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("Handler error", { message: msg, eventType: event.type });
    // Return 200 to prevent Stripe retries for handler errors
    return new Response(JSON.stringify({ received: true, error: msg }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

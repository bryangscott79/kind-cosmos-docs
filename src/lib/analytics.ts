/**
 * Lightweight analytics abstraction for VIGYL.
 * 
 * Supports:
 * - PostHog (preferred, if VITE_POSTHOG_KEY is set)
 * - Console logging in development
 * 
 * Usage:
 *   import { track, identify, page } from "@/lib/analytics";
 *   track("prospect_viewed", { companyName: "Olipop", score: 90 });
 *   identify(userId, { email, company, tier });
 *   page("Dashboard");
 */

type Properties = Record<string, string | number | boolean | null | undefined>;

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";
const IS_DEV = import.meta.env.DEV;

let posthog: any = null;

// Lazy-load PostHog only when key is configured
async function getPostHog() {
  if (posthog) return posthog;
  if (!POSTHOG_KEY) return null;

  try {
    const mod = await import("posthog-js");
    posthog = mod.default;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (ph: any) => { if (IS_DEV) ph.debug(); },
      capture_pageview: false, // We'll do this manually
      capture_pageleave: true,
      autocapture: false, // We track explicitly for signal quality
    });
    return posthog;
  } catch {
    return null;
  }
}

// Initialize on import if key exists
if (POSTHOG_KEY) getPostHog();

/**
 * Track a custom event.
 */
export function track(event: string, properties?: Properties) {
  if (IS_DEV && !POSTHOG_KEY) {
    console.log(`📊 [analytics] ${event}`, properties || "");
    return;
  }
  getPostHog().then(ph => ph?.capture(event, properties));
}

/**
 * Identify a user (call on login/signup).
 */
export function identify(userId: string, traits?: Properties) {
  if (IS_DEV && !POSTHOG_KEY) {
    console.log(`📊 [analytics] identify`, userId, traits);
    return;
  }
  getPostHog().then(ph => {
    ph?.identify(userId, traits);
  });
}

/**
 * Track a page view.
 */
export function page(name: string, properties?: Properties) {
  if (IS_DEV && !POSTHOG_KEY) {
    console.log(`📊 [analytics] page: ${name}`, properties || "");
    return;
  }
  getPostHog().then(ph => ph?.capture("$pageview", { $current_url: window.location.href, page_name: name, ...properties }));
}

/**
 * Reset analytics on logout.
 */
export function resetAnalytics() {
  getPostHog().then(ph => ph?.reset());
}

// ── Pre-defined event names for consistency ──
export const EVENTS = {
  // Auth
  SIGNED_UP: "signed_up",
  SIGNED_IN: "signed_in",
  SIGNED_OUT: "signed_out",
  ONBOARDING_COMPLETED: "onboarding_completed",

  // Intelligence
  INTELLIGENCE_GENERATED: "intelligence_generated",
  INTELLIGENCE_REFRESHED: "intelligence_refreshed",

  // Prospects
  PROSPECT_VIEWED: "prospect_viewed",
  PROSPECT_ADDED_TO_PIPELINE: "prospect_added_to_pipeline",
  PROSPECT_STAGE_CHANGED: "prospect_stage_changed",
  PROSPECT_DELETED: "prospect_deleted",
  DREAM_CLIENT_ANALYZED: "dream_client_analyzed",
  CONTACTS_ENRICHED: "contacts_enriched",

  // Outreach
  OUTREACH_GENERATED: "outreach_generated",
  OUTREACH_COPIED: "outreach_copied",
  OUTREACH_MARKED_SENT: "outreach_marked_sent",

  // Reports
  REPORT_GENERATED: "report_generated",
  REPORT_SHARED: "report_shared",
  REPORT_EXPORTED: "report_exported",

  // Signals
  SIGNAL_SAVED: "signal_saved",
  SIGNAL_WATCHLIST_ADDED: "signal_watchlist_added",
  SIGNALS_EXPORTED: "signals_exported",

  // Digest
  DIGEST_SUBSCRIBED: "digest_subscribed",
  DIGEST_UNSUBSCRIBED: "digest_unsubscribed",

  // Argus
  ARGUS_ASKED: "argus_asked",

  // Pipeline
  PIPELINE_EXPORTED: "pipeline_exported",

  // Subscription
  UPGRADE_CLICKED: "upgrade_clicked",
  SUBSCRIPTION_STARTED: "subscription_started",
} as const;

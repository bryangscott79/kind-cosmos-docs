import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { track, EVENTS } from "@/lib/analytics";

export interface DigestSubscription {
  id: string;
  user_id: string;
  email: string;
  frequency: "daily" | "weekly" | "monthly" | "never";
  include_industry_health: boolean;
  include_signals: boolean;
  include_prospect_updates: boolean;
  include_pipeline_reminders: boolean;
  active: boolean;
  last_sent_at: string | null;
  send_count: number;
}

export function useDigestSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<DigestSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load current subscription
  const loadSubscription = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error } = await supabase.functions.invoke("subscribe-digest", {
        body: { action: "status" },
      });
      if (!error && data?.subscription) {
        setSubscription(data.subscription);
      }
    } catch (e) {
      console.error("Failed to load digest subscription:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadSubscription(); }, [loadSubscription]);

  // Subscribe
  const subscribe = useCallback(async (email: string, frequency: "daily" | "weekly" | "monthly" = "daily") => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("subscribe-digest", {
        body: { action: "subscribe", email, frequency },
      });
      if (error) throw error;
      if (data?.subscription) setSubscription(data.subscription);
      track(EVENTS.DIGEST_SUBSCRIBED, { frequency });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSaving(false);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<Pick<DigestSubscription, "frequency" | "email" | "include_industry_health" | "include_signals" | "include_prospect_updates" | "include_pipeline_reminders">>) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("subscribe-digest", {
        body: { action: "update", ...updates },
      });
      if (error) throw error;
      if (data?.subscription) setSubscription(data.subscription);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSaving(false);
    }
  }, []);

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("subscribe-digest", {
        body: { action: "unsubscribe" },
      });
      if (error) throw error;
      if (data?.subscription) setSubscription(data.subscription);
      track(EVENTS.DIGEST_UNSUBSCRIBED);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    subscription,
    loading,
    saving,
    isSubscribed: subscription?.active === true && subscription?.frequency !== "never",
    subscribe,
    updatePreferences,
    unsubscribe,
    refresh: loadSubscription,
  };
}

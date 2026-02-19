import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Prospect } from "@/data/mockData";
import { track, EVENTS } from "@/lib/analytics";

export interface CrmConnection {
  id: string;
  user_id: string;
  provider: "hubspot" | "salesforce";
  api_key: string;
  instance_url: string | null;
  is_active: boolean;
  field_mapping: Record<string, string>;
  default_pipeline_mapping: Record<string, string>;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmSyncLog {
  id: string;
  prospect_id: string;
  company_name: string;
  provider: string;
  action: string;
  status: "pending" | "success" | "failed";
  crm_record_id: string | null;
  crm_record_url: string | null;
  error_message: string | null;
  created_at: string;
}

export function useCrmConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<CrmConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error } = await (supabase
        .from("crm_connections" as any) as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at");
      if (error) throw error;
      setConnections(data || []);
    } catch (e) {
      console.error("Failed to load CRM connections:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addConnection = useCallback(async (
    provider: "hubspot" | "salesforce",
    apiKey: string,
    instanceUrl?: string
  ) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await (supabase
      .from("crm_connections" as any) as any)
      .upsert({
        user_id: user.id,
        provider,
        api_key: apiKey,
        instance_url: instanceUrl || null,
        is_active: true,
      }, { onConflict: "user_id,provider" })
      .select()
      .single();

    if (error) throw error;
    setConnections(prev => {
      const existing = prev.findIndex(c => c.provider === provider);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = data;
        return updated;
      }
      return [...prev, data];
    });
    return data as CrmConnection;
  }, [user]);

  const removeConnection = useCallback(async (id: string) => {
    const { error } = await (supabase
      .from("crm_connections" as any) as any)
      .delete()
      .eq("id", id);
    if (error) throw error;
    setConnections(prev => prev.filter(c => c.id !== id));
  }, []);

  const toggleConnection = useCallback(async (id: string, active: boolean) => {
    const { error } = await (supabase
      .from("crm_connections" as any) as any)
      .update({ is_active: active })
      .eq("id", id);
    if (error) throw error;
    setConnections(prev => prev.map(c => c.id === id ? { ...c, is_active: active } : c));
  }, []);

  const updateStageMapping = useCallback(async (id: string, mapping: Record<string, string>) => {
    const { error } = await (supabase
      .from("crm_connections" as any) as any)
      .update({ default_pipeline_mapping: mapping })
      .eq("id", id);
    if (error) throw error;
    setConnections(prev => prev.map(c => c.id === id ? { ...c, default_pipeline_mapping: mapping } : c));
  }, []);

  // Active connection for quick access
  const activeConnection = connections.find(c => c.is_active) || null;
  const hasActiveConnection = !!activeConnection;

  return {
    connections,
    loading,
    activeConnection,
    hasActiveConnection,
    addConnection,
    removeConnection,
    toggleConnection,
    updateStageMapping,
    refresh: load,
  };
}

export function useCrmSync() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [syncResults, setSyncResults] = useState<Record<string, CrmSyncLog>>({});

  // Sync a single prospect to CRM
  const syncProspect = useCallback(async (
    connectionId: string,
    prospect: Prospect,
    industryName?: string
  ): Promise<{ success: boolean; crmRecordUrl?: string; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" };

    setSyncing(prev => ({ ...prev, [prospect.id]: true }));

    try {
      const payload = {
        id: prospect.id,
        companyName: prospect.companyName,
        industryName: industryName || "",
        vigylScore: prospect.vigylScore,
        pressureResponse: prospect.pressureResponse,
        whyNow: prospect.whyNow,
        decisionMakers: prospect.decisionMakers,
        pipelineStage: prospect.pipelineStage,
        annualRevenue: prospect.annualRevenue,
        employeeCount: prospect.employeeCount,
        location: prospect.location,
        notes: prospect.notes || "",
      };

      const { data: result, error } = await supabase.functions.invoke("sync-to-crm", {
        body: { connectionId, prospect: payload },
      });

      if (error) throw new Error(error.message);
      if (!result?.success) throw new Error(result?.error || "Sync failed");

      const logEntry: CrmSyncLog = {
        id: "",
        prospect_id: prospect.id,
        company_name: prospect.companyName,
        provider: result.provider,
        action: "create",
        status: "success",
        crm_record_id: result.dealId || result.opportunityId || null,
        crm_record_url: result.dealUrl || result.opportunityUrl || null,
        error_message: null,
        created_at: new Date().toISOString(),
      };

      setSyncResults(prev => ({ ...prev, [prospect.id]: logEntry }));
      track(EVENTS.CRM_PROSPECT_SYNCED, { provider: result.provider, companyName: prospect.companyName, prospectId: prospect.id });
      return { success: true, crmRecordUrl: logEntry.crm_record_url || undefined };
    } catch (e: any) {
      const logEntry: CrmSyncLog = {
        id: "",
        prospect_id: prospect.id,
        company_name: prospect.companyName,
        provider: "unknown",
        action: "create",
        status: "failed",
        crm_record_id: null,
        crm_record_url: null,
        error_message: e.message,
        created_at: new Date().toISOString(),
      };

      setSyncResults(prev => ({ ...prev, [prospect.id]: logEntry }));
      track(EVENTS.CRM_SYNC_FAILED, { companyName: prospect.companyName, error: e.message });
      return { success: false, error: e.message };
    } finally {
      setSyncing(prev => ({ ...prev, [prospect.id]: false }));
    }
  }, [user]);

  // Load sync history for a prospect
  const getSyncHistory = useCallback(async (prospectId: string): Promise<CrmSyncLog[]> => {
    if (!user) return [];
    const { data } = await (supabase
      .from("crm_sync_log" as any) as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("prospect_id", prospectId)
      .order("created_at", { ascending: false })
      .limit(10);
    return data || [];
  }, [user]);

  return {
    syncing,
    syncResults,
    syncProspect,
    getSyncHistory,
  };
}

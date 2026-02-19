import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Prospect, PipelineStage } from "@/data/mockData";

/**
 * Loads all pipeline_items from DB and converts them to Prospect shape.
 * This bridges the gap between DB-persisted prospects and the intelligence context.
 * 
 * Returns both the raw DB items and a merged list that combines intelligence + DB prospects.
 */
export function usePipelineProspects(intelligenceProspects: Prospect[]) {
  const { user } = useAuth();
  const [dbItems, setDbItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data: items } = await supabase
        .from("pipeline_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }) as any;
      if (items) setDbItems(items);
    } catch (e) {
      console.error("Failed to load pipeline items:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Convert DB items to Prospect shape
  const dbProspects: Prospect[] = useMemo(() => dbItems.map((item: any) => {
    const pd = item.prospect_data || {};
    return {
      id: `db-${item.id}`,
      _dbId: item.id,
      companyName: item.company_name,
      industryId: item.industry_name || "",
      vigylScore: item.vigyl_score || 0,
      pipelineStage: (item.pipeline_stage || "researching") as PipelineStage,
      whyNow: pd.whyNow || "",
      annualRevenue: pd.annualRevenue || "Unknown",
      employeeCount: pd.employeeCount || 0,
      location: pd.location || { city: "", state: "", country: "" },
      pressureResponse: pd.pressureResponse || "selective_investing",
      decisionMakers: pd.decisionMakers || [],
      relatedSignals: pd.relatedSignals || [],
      notes: item.notes || "",
      lastContacted: item.last_contacted || undefined,
      isDreamClient: pd.isDreamClient || false,
    } as Prospect;
  }), [dbItems]);

  // Merge intelligence prospects + DB prospects, deduplicating by company name
  const allProspects = useMemo(() => {
    const dbNames = new Set(dbProspects.map(p => p.companyName.toLowerCase()));
    const intelligenceOnly = intelligenceProspects.filter(p => !dbNames.has(p.companyName.toLowerCase()));
    return [...dbProspects, ...intelligenceOnly];
  }, [dbProspects, intelligenceProspects]);

  // Find a prospect by ID from either source
  const findProspect = useCallback((id: string | undefined): Prospect | undefined => {
    if (!id) return undefined;
    // Check intelligence data first (fast)
    const fromIntel = intelligenceProspects.find(p => p.id === id);
    if (fromIntel) return fromIntel;
    // Check DB prospects
    return dbProspects.find(p => p.id === id);
  }, [intelligenceProspects, dbProspects]);

  return {
    dbProspects,
    allProspects,
    findProspect,
    loading,
    refresh: load,
  };
}

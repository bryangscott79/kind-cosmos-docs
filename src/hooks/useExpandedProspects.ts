import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { supabase } from "@/integrations/supabase/client";
import { track, EVENTS } from "@/lib/analytics";
import type { Prospect } from "@/data/mockData";

interface ExpandRequest {
  verticalId: string;
  verticalName: string;
  sectorName: string;
  scope: "local" | "national" | "international" | "all";
  exampleCompanies?: string[];
}

interface ExploredVertical {
  vertical_id: string;
  vertical_name: string;
  sector_name: string;
  times_expanded: number;
  last_expanded_at: string;
}

/**
 * Manages expanded prospects — additional prospects generated on demand
 * beyond the initial intelligence generation.
 */
export function useExpandedProspects(existingProspects: Prospect[]) {
  const { user, profile } = useAuth();
  const { effectiveUserId, isTeamMember } = useIntelligence();
  const [expandedProspects, setExpandedProspects] = useState<Prospect[]>([]);
  const [exploredVerticals, setExploredVerticals] = useState<ExploredVertical[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanding, setExpanding] = useState<string | null>(null); // verticalId being expanded
  const [expandingScope, setExpandingScope] = useState<string | null>(null); // scope being expanded
  const [error, setError] = useState<string | null>(null);

  // Use owner's ID for data access (team members see owner's data)
  const dataUserId = effectiveUserId || user?.id;

  // Load existing expanded prospects from DB
  const loadExpanded = useCallback(async () => {
    if (!dataUserId) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await (supabase
        .from("expanded_prospects" as any)
        .select("prospect_data")
        .eq("user_id", dataUserId)
        .order("created_at", { ascending: false }) as any);

      if (fetchError) throw fetchError;
      
      const prospects = (data || []).map((row: any) => row.prospect_data as Prospect);
      setExpandedProspects(prospects);

      // Also load explored verticals
      const { data: verticals } = await (supabase
        .from("explored_verticals" as any)
        .select("*")
        .eq("user_id", dataUserId)
        .order("last_expanded_at", { ascending: false }) as any);

      setExploredVerticals(verticals || []);
    } catch (e) {
      console.error("Failed to load expanded prospects:", e);
    } finally {
      setLoading(false);
    }
  }, [dataUserId]);

  useEffect(() => { loadExpanded(); }, [loadExpanded]);

  // Expand prospects for a specific vertical
  const expandVertical = useCallback(async (request: ExpandRequest) => {
    if (!user || !profile || expanding) return;
    setExpanding(request.verticalId);
    setExpandingScope(request.scope);
    setError(null);

    try {
      // Collect existing company names to avoid dupes
      const allExisting = [
        ...existingProspects.map(p => p.companyName),
        ...expandedProspects.map(p => p.companyName),
      ];

      const { data, error: fnError } = await supabase.functions.invoke("expand-prospects", {
        body: {
          profile: {
            user_id: user.id,
            company_name: profile.company_name,
            business_summary: profile.business_summary,
            ai_summary: profile.ai_summary,
            location_city: profile.location_city,
            location_state: profile.location_state,
            location_country: "US",
            entity_type: (profile as any).entity_type,
          },
          verticalName: request.verticalName,
          verticalId: request.verticalId,
          scope: request.scope,
          existingCompanyNames: allExisting,
          exampleCompanies: request.exampleCompanies,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || "Failed to expand prospects");

      const newProspects = (data.prospects || []) as Prospect[];
      setExpandedProspects(prev => [...newProspects, ...prev]);

      // Track explored vertical
      await (supabase.from("explored_verticals" as any).upsert({
        user_id: user.id,
        vertical_id: request.verticalId,
        vertical_name: request.verticalName,
        sector_name: request.sectorName,
        times_expanded: (exploredVerticals.find(v => v.vertical_id === request.verticalId)?.times_expanded || 0) + 1,
        last_expanded_at: new Date().toISOString(),
      }, { onConflict: "user_id,vertical_id" }) as any);

      setExploredVerticals(prev => {
        const existing = prev.find(v => v.vertical_id === request.verticalId);
        if (existing) {
          return prev.map(v => v.vertical_id === request.verticalId
            ? { ...v, times_expanded: v.times_expanded + 1, last_expanded_at: new Date().toISOString() }
            : v
          );
        }
        return [{ vertical_id: request.verticalId, vertical_name: request.verticalName, sector_name: request.sectorName, times_expanded: 1, last_expanded_at: new Date().toISOString() }, ...prev];
      });

      track(EVENTS.INTELLIGENCE_GENERATED, {
        type: "expand",
        vertical: request.verticalName,
        scope: request.scope,
        count: newProspects.length,
      });

      return newProspects;
    } catch (e: any) {
      console.error("Expand failed:", e);
      setError(e.message || "Failed to load more prospects");
      return [];
    } finally {
      setExpanding(null);
      setExpandingScope(null);
    }
  }, [user, profile, expanding, existingProspects, expandedProspects, exploredVerticals]);

  // Delete an expanded prospect
  const removeExpanded = useCallback(async (prospectId: string) => {
    if (!user) return;
    setExpandedProspects(prev => prev.filter(p => p.id !== prospectId));
    await (supabase
      .from("expanded_prospects" as any)
      .delete()
      .eq("user_id", user.id)
      .eq("prospect_id", prospectId) as any);
  }, [user]);

  // All prospects merged: core intelligence + expanded
  const allProspects = [...existingProspects, ...expandedProspects];

  // Scope counts
  const scopeCounts = {
    local: allProspects.filter(p => p.scope === "local").length,
    national: allProspects.filter(p => p.scope === "national").length,
    international: allProspects.filter(p => p.scope === "international").length,
  };

  return {
    expandedProspects,
    allProspects,
    exploredVerticals,
    scopeCounts,
    loading,
    expanding,
    expandingScope,
    error,
    expandVertical,
    removeExpanded,
    refresh: loadExpanded,
  };
}

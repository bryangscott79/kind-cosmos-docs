import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Industry, Signal, Prospect } from "@/data/mockData";

interface IntelligenceData {
  industries: Industry[];
  signals: Signal[];
  prospects: Prospect[];
}

interface IntelligenceContextType {
  data: IntelligenceData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasData: boolean;
  isBackgroundRefreshing: boolean;
}

const emptyData: IntelligenceData = { industries: [], signals: [], prospects: [] };

const IntelligenceContext = createContext<IntelligenceContextType>({
  data: emptyData,
  loading: false,
  error: null,
  refresh: async () => {},
  hasData: false,
  isBackgroundRefreshing: false,
});

export function IntelligenceProvider({ children }: { children: ReactNode }) {
  const { profile, session } = useAuth();
  const [data, setData] = useState<IntelligenceData>(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

  // Load cached data from database on mount
  const loadCachedData = useCallback(async () => {
    if (!session?.user?.id) return false;
    try {
      const { data: cached, error: cacheError } = await supabase
        .from("cached_intelligence")
        .select("intelligence_data, updated_at")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (cacheError) {
        console.error("Error loading cached intelligence:", cacheError);
        return false;
      }

      if (cached?.intelligence_data) {
        const intelligenceData = cached.intelligence_data as any;
        if (intelligenceData.industries?.length > 0) {
          setData({
            industries: intelligenceData.industries || [],
            signals: intelligenceData.signals || [],
            prospects: intelligenceData.prospects || [],
          });
          console.log("Loaded cached intelligence from", cached.updated_at);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Failed to load cached intelligence:", err);
      return false;
    }
  }, [session?.user?.id]);

  // Generate fresh intelligence from AI
  const generateFresh = useCallback(async (isBackground: boolean) => {
    if (!profile || !session) return;
    if (!profile.target_industries?.length && !profile.business_summary && !profile.ai_summary) return;

    if (isBackground) {
      setIsBackgroundRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("generate-intelligence", {
        body: { profile },
      });

      if (fnError) throw new Error(fnError.message);
      if (!result?.success) throw new Error(result?.error || "Failed to generate intelligence");

      setData(result.data);
    } catch (err: any) {
      console.error("Intelligence generation error:", err);
      // Only set error if we don't already have cached data
      if (!isBackground) {
        setError(err.message || "Failed to generate intelligence");
      }
    } finally {
      if (isBackground) {
        setIsBackgroundRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [profile, session]);

  // On mount: load cache first, then refresh in background
  useEffect(() => {
    if (!profile || !session || initialized) return;

    const init = async () => {
      setInitialized(true);
      setLoading(true);

      const hasCached = await loadCachedData();

      if (hasCached) {
        // We have cached data — show it immediately, refresh in background
        setLoading(false);
        generateFresh(true);
      } else {
        // No cache — do a foreground generation
        setLoading(false);
        await generateFresh(false);
      }
    };

    init();
  }, [profile, session, initialized, loadCachedData, generateFresh]);

  const refresh = useCallback(async () => {
    const hasExistingData = data.industries.length > 0;
    await generateFresh(hasExistingData);
  }, [generateFresh, data.industries.length]);

  return (
    <IntelligenceContext.Provider
      value={{
        data,
        loading,
        error,
        refresh,
        hasData: data.industries.length > 0,
        isBackgroundRefreshing,
      }}
    >
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence() {
  return useContext(IntelligenceContext);
}

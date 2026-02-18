import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Industry, Signal, Prospect, AIImpactAnalysis } from "@/data/mockData";
import { industries as seedIndustries, signals as seedSignals, prospects as seedProspects } from "@/data/mockData";

interface IntelligenceData {
  industries: Industry[];
  signals: Signal[];
  prospects: Prospect[];
  aiImpact: AIImpactAnalysis[];
}

interface AiImpactGenState {
  generating: boolean;
  progress: { current: number; total: number; industryName: string };
  error: string | null;
}

interface IntelligenceContextType {
  data: IntelligenceData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasData: boolean;
  isBackgroundRefreshing: boolean;
  isUsingSeedData: boolean;
  // AI Impact generation (lives in context so it survives navigation)
  aiImpactGen: AiImpactGenState;
  generateAiImpact: (industriesToProcess?: { id: string; name: string }[]) => void;
}

const emptyData: IntelligenceData = { industries: [], signals: [], prospects: [], aiImpact: [] };
const seedData: IntelligenceData = {
  industries: seedIndustries,
  signals: seedSignals,
  prospects: seedProspects,
  aiImpact: [],
};

const IntelligenceContext = createContext<IntelligenceContextType>({
  data: emptyData,
  loading: false,
  error: null,
  refresh: async () => {},
  hasData: false,
  isBackgroundRefreshing: false,
  isUsingSeedData: false,
  aiImpactGen: { generating: false, progress: { current: 0, total: 0, industryName: "" }, error: null },
  generateAiImpact: () => {},
});

export function IntelligenceProvider({ children }: { children: ReactNode }) {
  const { profile, session } = useAuth();
  const [data, setData] = useState<IntelligenceData>(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const [isUsingSeedData, setIsUsingSeedData] = useState(false);

  // AI Impact generation state (persists across navigation)
  const [aiImpactGen, setAiImpactGen] = useState<AiImpactGenState>({
    generating: false,
    progress: { current: 0, total: 0, industryName: "" },
    error: null,
  });
  const genRunningRef = useRef(false);

  // Activate seed data fallback — ensures user always sees content
  const activateSeedFallback = useCallback(() => {
    if (data.industries.length === 0) {
      console.log("Activating seed data fallback — user will see content immediately");
      setData(seedData);
      setIsUsingSeedData(true);
    }
  }, [data.industries.length]);

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
            aiImpact: intelligenceData.aiImpact || [],
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
      setIsUsingSeedData(false);
    } catch (err: any) {
      console.error("Intelligence generation error:", err);
      if (!isBackground) {
        setError(err.message || "Failed to generate intelligence");
        activateSeedFallback();
      }
    } finally {
      if (isBackground) {
        setIsBackgroundRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [profile, session, activateSeedFallback]);

  // AI Impact generation — runs in context, survives page navigation
  const generateAiImpact = useCallback((industriesToProcess?: { id: string; name: string }[]) => {
    if (genRunningRef.current) return; // already running

    const run = async () => {
      genRunningRef.current = true;

      // Determine which industries to process
      const allIndustries = data.industries.map((i) => ({ id: i.id, name: i.name }));
      const industries = industriesToProcess || allIndustries;
      if (industries.length === 0) { genRunningRef.current = false; return; }

      // If doing a full refresh, clear existing AI impact; if resuming, keep them
      const isResume = !!industriesToProcess;

      setAiImpactGen({ generating: true, progress: { current: 0, total: industries.length, industryName: "" }, error: null });

      const results: AIImpactAnalysis[] = isResume ? [...(data.aiImpact || [])] : [];

      for (let idx = 0; idx < industries.length; idx++) {
        const ind = industries[idx];
        setAiImpactGen((prev) => ({ ...prev, progress: { current: idx + 1, total: industries.length, industryName: ind.name } }));

        try {
          const { data: result, error } = await supabase.functions.invoke("generate-ai-impact", {
            body: { industry: ind, profile: profile || {} },
          });

          if (error) throw new Error(error.message);
          if (!result?.success) throw new Error(result?.error || `Failed for ${ind.name}`);

          const existingIdx = results.findIndex((r) => r.industryId === result.data.industryId);
          if (existingIdx >= 0) {
            results[existingIdx] = result.data;
          } else {
            results.push(result.data);
          }
          // Update data immediately so UI shows progressive results
          setData((prev) => ({ ...prev, aiImpact: [...results] }));
        } catch (err: any) {
          console.error(`AI impact error for ${ind.name}:`, err);
        }
      }

      if (results.length === 0) {
        setAiImpactGen({ generating: false, progress: { current: 0, total: 0, industryName: "" }, error: "Failed to generate AI impact analysis. Please try again." });
      } else {
        setAiImpactGen({ generating: false, progress: { current: 0, total: 0, industryName: "" }, error: null });
      }
      genRunningRef.current = false;
    };

    run();
  }, [data.industries, data.aiImpact, profile]);

  // On mount: load cache first, then refresh in background
  useEffect(() => {
    if (!profile || !session || initialized) return;

    const init = async () => {
      setInitialized(true);
      setLoading(true);

      const hasCached = await loadCachedData();

      if (hasCached) {
        setLoading(false);
        setIsUsingSeedData(false);
        generateFresh(true);
      } else {
        activateSeedFallback();
        setLoading(false);
        await generateFresh(false);
      }
    };

    init();
  }, [profile, session, initialized, loadCachedData, generateFresh, activateSeedFallback]);

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
        isUsingSeedData,
        aiImpactGen,
        generateAiImpact,
      }}
    >
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence() {
  return useContext(IntelligenceContext);
}

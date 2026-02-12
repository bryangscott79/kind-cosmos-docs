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
}

const emptyData: IntelligenceData = { industries: [], signals: [], prospects: [] };

const IntelligenceContext = createContext<IntelligenceContextType>({
  data: emptyData,
  loading: false,
  error: null,
  refresh: async () => {},
  hasData: false,
});

export function IntelligenceProvider({ children }: { children: ReactNode }) {
  const { profile, session } = useAuth();
  const [data, setData] = useState<IntelligenceData>(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const generate = useCallback(async () => {
    if (!profile || !session) return;
    // Only generate if user has completed onboarding with some profile info
    if (!profile.target_industries?.length && !profile.business_summary && !profile.ai_summary) return;

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("generate-intelligence", {
        body: { profile },
      });

      if (fnError) throw new Error(fnError.message);
      if (!result?.success) throw new Error(result?.error || "Failed to generate intelligence");

      setData(result.data);
      setGenerated(true);
    } catch (err: any) {
      console.error("Intelligence generation error:", err);
      setError(err.message || "Failed to generate intelligence");
    } finally {
      setLoading(false);
    }
  }, [profile, session]);

  // Auto-generate when profile is available and data hasn't been generated yet
  useEffect(() => {
    if (profile && session && !generated && !loading) {
      generate();
    }
  }, [profile, session, generated, loading, generate]);

  const refresh = useCallback(async () => {
    setGenerated(false);
    await generate();
  }, [generate]);

  return (
    <IntelligenceContext.Provider
      value={{
        data,
        loading,
        error,
        refresh,
        hasData: data.industries.length > 0,
      }}
    >
      {children}
    </IntelligenceContext.Provider>
  );
}

export function useIntelligence() {
  return useContext(IntelligenceContext);
}

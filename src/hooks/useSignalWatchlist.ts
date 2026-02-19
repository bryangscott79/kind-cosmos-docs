import { useState, useCallback, useEffect } from "react";

export interface WatchRule {
  id: string;
  signalType: string;
  industryId?: string; // if null, applies to all industries
  createdAt: string;
}

const STORAGE_KEY = "vigyl_signal_watchlist";

function loadRules(): WatchRule[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRules(rules: WatchRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

export function useSignalWatchlist() {
  const [rules, setRules] = useState<WatchRule[]>(loadRules);

  useEffect(() => { saveRules(rules); }, [rules]);

  const addRule = useCallback((signalType: string, industryId?: string) => {
    const exists = rules.some(r => r.signalType === signalType && r.industryId === (industryId || undefined));
    if (exists) return;
    setRules(prev => [...prev, {
      id: `wr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      signalType,
      industryId: industryId || undefined,
      createdAt: new Date().toISOString(),
    }]);
  }, [rules]);

  const removeRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  }, []);

  const isWatching = useCallback((signalType: string, industryId?: string) => {
    return rules.some(r =>
      r.signalType === signalType && (!r.industryId || r.industryId === industryId)
    );
  }, [rules]);

  // Check if a signal matches any watch rule
  const isSignalWatched = useCallback((signalType: string, industryIds: string[]) => {
    return rules.some(r => {
      if (r.signalType !== signalType) return false;
      if (!r.industryId) return true; // watching this type across all industries
      return industryIds.includes(r.industryId);
    });
  }, [rules]);

  return { rules, addRule, removeRule, isWatching, isSignalWatched };
}

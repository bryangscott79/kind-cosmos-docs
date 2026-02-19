import { useState, useCallback, useEffect } from "react";

export interface ReportHistoryEntry {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  params: {
    industryId?: string;
    prospectId?: string;
  };
}

const STORAGE_KEY = "vigyl_report_history";
const MAX_ENTRIES = 20;

function load(): ReportHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(entries: ReportHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function useReportHistory() {
  const [entries, setEntries] = useState<ReportHistoryEntry[]>(load);

  useEffect(() => { save(entries); }, [entries]);

  const addEntry = useCallback((type: string, title: string, params: ReportHistoryEntry["params"] = {}) => {
    const entry: ReportHistoryEntry = {
      id: `rh_${Date.now()}`,
      type,
      title,
      createdAt: new Date().toISOString(),
      params,
    };
    setEntries(prev => [entry, ...prev].slice(0, MAX_ENTRIES));
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { entries, addEntry, clearHistory };
}

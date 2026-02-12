import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface SavedSignal {
  id: string;
  user_id: string;
  signal_id: string;
  opportunity_name: string;
  prospect_id: string | null;
  notes: string | null;
  created_at: string;
}

export function useSavedSignals() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedSignals = [], isLoading } = useQuery({
    queryKey: ["saved-signals", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from("saved_signals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SavedSignal[];
    },
    enabled: !!session?.user?.id,
  });

  const saveSignal = useMutation({
    mutationFn: async ({
      signalId,
      opportunityName,
      prospectId,
      notes,
    }: {
      signalId: string;
      opportunityName: string;
      prospectId?: string;
      notes?: string;
    }) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("saved_signals").insert({
        user_id: session.user.id,
        signal_id: signalId,
        opportunity_name: opportunityName,
        prospect_id: prospectId || null,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-signals"] });
      toast({ title: "Signal saved", description: "Signal linked to opportunity." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const unsaveSignal = useMutation({
    mutationFn: async (savedSignalId: string) => {
      const { error } = await supabase
        .from("saved_signals")
        .delete()
        .eq("id", savedSignalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-signals"] });
      toast({ title: "Removed", description: "Signal removed from opportunity." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const isSignalSaved = (signalId: string) =>
    savedSignals.some((s) => s.signal_id === signalId);

  const getSavedForSignal = (signalId: string) =>
    savedSignals.filter((s) => s.signal_id === signalId);

  const getSavedForProspect = (prospectId: string) =>
    savedSignals.filter((s) => s.prospect_id === prospectId);

  const getSavedForOpportunity = (opportunityName: string) =>
    savedSignals.filter((s) => s.opportunity_name === opportunityName);

  return {
    savedSignals,
    isLoading,
    saveSignal,
    unsaveSignal,
    isSignalSaved,
    getSavedForSignal,
    getSavedForProspect,
    getSavedForOpportunity,
  };
}

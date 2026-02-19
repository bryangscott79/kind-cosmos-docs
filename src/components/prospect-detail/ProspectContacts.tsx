import { useState, useCallback } from "react";
import { Users, Search, Loader2, ExternalLink, CheckCircle2, CircleDashed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { track, EVENTS } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h2>
      {badge && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{badge}</span>}
    </div>
  );
}

interface Contact {
  name: string;
  title: string;
  linkedinUrl: string;
  verified?: boolean;
  source?: string;
  relevance?: string;
  recentActivity?: string;
}

interface ProspectContactsProps {
  companyName: string;
  industryName?: string;
  whyNow: string;
  contacts: Contact[];
}

export default function ProspectContacts({ companyName, industryName, whyNow, contacts }: ProspectContactsProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [enrichedContacts, setEnrichedContacts] = useState<Contact[] | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichNotes, setEnrichNotes] = useState<string | null>(null);

  const displayContacts = enrichedContacts || contacts.map(dm => ({
    ...dm,
    linkedinUrl: dm.linkedinUrl && dm.linkedinUrl !== "#"
      ? dm.linkedinUrl
      : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${dm.title} ${companyName}`)}`,
  }));

  const enrichContacts = useCallback(async () => {
    if (enriching) return;
    setEnriching(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("enrich-contacts", {
        body: {
          companyName,
          industryContext: industryName,
          whyNow,
          userServices: profile?.business_summary || profile?.ai_summary || "",
          existingContacts: contacts,
        },
      });
      if (error) throw error;
      if (result?.contacts) {
        setEnrichedContacts(result.contacts);
        setEnrichNotes(result.researchNotes || null);
        track(EVENTS.CONTACTS_ENRICHED, { company: companyName, count: result.contacts.length });
        toast({ title: "Contacts enriched", description: `Found ${result.contacts.length} key contacts at ${companyName}.` });
      }
    } catch (err: any) {
      console.error("Enrichment failed:", err);
      toast({ title: "Enrichment failed", description: err.message || "Could not enrich contacts. Try again.", variant: "destructive" });
    } finally {
      setEnriching(false);
    }
  }, [enriching, companyName, industryName, whyNow, contacts, profile, toast]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader icon={<Users className="h-4 w-4 text-primary" />} title="Key Contacts" badge={`${displayContacts.length}`} />
        <button
          onClick={enrichContacts}
          disabled={enriching}
          className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          {enriching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
          {enriching ? "Researching..." : enrichedContacts ? "Re-enrich" : "Find Real Contacts"}
        </button>
      </div>

      {enrichNotes && (
        <div className="mb-3 rounded-md bg-amber-500/5 border border-amber-500/10 px-3 py-2">
          <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">{enrichNotes}</p>
        </div>
      )}

      <div className="space-y-2">
        {displayContacts.map((dm, i) => {
          const isVerified = dm.verified === true;
          const linkedinUrl = dm.linkedinUrl && dm.linkedinUrl !== "#"
            ? dm.linkedinUrl
            : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${dm.name} ${companyName}`)}`;

          return (
            <div key={i} className={`rounded-lg border p-3 transition-colors ${isVerified ? "border-emerald-500/20 bg-emerald-500/[0.02]" : "border-border"} hover:border-primary/20`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-foreground">{dm.name}</p>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[8px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-2 w-2" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary border border-border px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground">
                        <CircleDashed className="h-2 w-2" /> Suggested
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{dm.title}</p>
                  {dm.relevance && (
                    <p className="text-[10px] text-muted-foreground/80 mt-1 leading-relaxed italic">
                      {dm.relevance}
                    </p>
                  )}
                  {dm.source && isVerified && (
                    <p className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                      Source: {dm.source}
                    </p>
                  )}
                  {dm.recentActivity && (
                    <p className="text-[9px] text-primary/70 mt-0.5">
                      Recent: {dm.recentActivity}
                    </p>
                  )}
                </div>
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-2.5 py-1.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors shrink-0">
                  {isVerified ? "LinkedIn" : "Search"} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {displayContacts.length === 0 && (
        <div className="text-center py-6">
          <Users className="mx-auto h-6 w-6 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">No contacts identified yet.</p>
          <button onClick={enrichContacts} disabled={enriching} className="mt-2 text-xs font-medium text-primary hover:text-primary/80">
            {enriching ? "Researching..." : "Find contacts at this company"}
          </button>
        </div>
      )}
    </div>
  );
}

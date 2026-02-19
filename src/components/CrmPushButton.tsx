import { useState } from "react";
import { Loader2, ExternalLink, Check, AlertTriangle, Upload } from "lucide-react";
import { useCrmConnections, useCrmSync } from "@/hooks/useCrmSync";
import { Prospect } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

interface CrmPushButtonProps {
  prospect: Prospect;
  industryName?: string;
  variant?: "compact" | "full";
  className?: string;
}

export default function CrmPushButton({ prospect, industryName, variant = "compact", className = "" }: CrmPushButtonProps) {
  const { activeConnection, hasActiveConnection } = useCrmConnections();
  const { syncing, syncResults, syncProspect } = useCrmSync();
  const { toast } = useToast();
  const [crmUrl, setCrmUrl] = useState<string | null>(null);

  const isSyncing = syncing[prospect.id];
  const result = syncResults[prospect.id];
  const isSuccess = result?.status === "success";
  const isFailed = result?.status === "failed";

  if (!hasActiveConnection) return null;

  const providerName = activeConnection?.provider === "hubspot" ? "HubSpot" : "Salesforce";
  const providerLogo = activeConnection?.provider === "hubspot" ? "🟠" : "☁️";

  const handlePush = async () => {
    if (!activeConnection) return;
    const result = await syncProspect(activeConnection.id, prospect, industryName);

    if (result.success) {
      if (result.crmRecordUrl) setCrmUrl(result.crmRecordUrl);
      toast({
        title: `Pushed to ${providerName}`,
        description: `${prospect.companyName} synced with contacts and deal.`,
      });
    } else {
      toast({
        title: "Sync failed",
        description: result.error || "Check your CRM connection in Settings.",
        variant: "destructive",
      });
    }
  };

  if (variant === "compact") {
    if (isSuccess && crmUrl) {
      return (
        <a
          href={crmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1 text-[10px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors ${className}`}
        >
          <Check className="h-2.5 w-2.5" /> In {providerName} <ExternalLink className="h-2 w-2" />
        </a>
      );
    }

    if (isSuccess) {
      return (
        <span className={`flex items-center gap-1 text-[10px] font-medium text-emerald-600 ${className}`}>
          <Check className="h-2.5 w-2.5" /> Synced
        </span>
      );
    }

    return (
      <button
        onClick={handlePush}
        disabled={isSyncing}
        className={`flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors ${className}`}
        title={`Push to ${providerName}`}
      >
        {isSyncing ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        ) : isFailed ? (
          <AlertTriangle className="h-2.5 w-2.5 text-rose-500" />
        ) : (
          <span className="text-xs">{providerLogo}</span>
        )}
        {isFailed ? "Retry" : providerName}
      </button>
    );
  }

  // Full variant (for ProspectDetail)
  if (isSuccess && crmUrl) {
    return (
      <a
        href={crmUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors ${className}`}
      >
        <Check className="h-3.5 w-3.5" /> View in {providerName} <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  if (isSuccess) {
    return (
      <span className={`inline-flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 ${className}`}>
        <Check className="h-3.5 w-3.5" /> Synced to {providerName}
      </span>
    );
  }

  return (
    <button
      onClick={handlePush}
      disabled={isSyncing}
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors ${className}`}
    >
      {isSyncing ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing to {providerName}…
        </>
      ) : isFailed ? (
        <>
          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Retry {providerName} Sync
        </>
      ) : (
        <>
          <Upload className="h-3.5 w-3.5" /> Push to {providerName}
        </>
      )}
    </button>
  );
}

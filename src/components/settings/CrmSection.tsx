import { useState } from "react";
import {
  Plug, Plus, Trash2, Loader2, Check, X, ExternalLink,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Clock, AlertTriangle
} from "lucide-react";
import { useCrmConnections, CrmConnection } from "@/hooks/useCrmSync";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/tiers";
import { track, EVENTS } from "@/lib/analytics";

const CRM_PROVIDERS = [
  {
    id: "hubspot" as const,
    name: "HubSpot",
    logo: "🟠",
    description: "Sync prospects as Companies, Contacts, and Deals",
    docsUrl: "https://developers.hubspot.com/docs/api/private-apps",
    keyLabel: "Private App Access Token",
    keyPlaceholder: "pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    needsInstanceUrl: false,
  },
  {
    id: "salesforce" as const,
    name: "Salesforce",
    logo: "☁️",
    description: "Sync prospects as Leads and Opportunities",
    docsUrl: "https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/",
    keyLabel: "Access Token",
    keyPlaceholder: "00Dxx0000001gPL!AQcAQH...",
    needsInstanceUrl: true,
    instanceUrlPlaceholder: "https://yourorg.my.salesforce.com",
  },
];

const STAGE_OPTIONS: Record<string, { hubspot: string[]; salesforce: string[] }> = {
  researching: {
    hubspot: ["appointmentscheduled", "qualifiedtobuy"],
    salesforce: ["Prospecting", "Qualification"],
  },
  contacted: {
    hubspot: ["qualifiedtobuy", "presentationscheduled"],
    salesforce: ["Qualification", "Needs Analysis"],
  },
  meeting_scheduled: {
    hubspot: ["presentationscheduled", "decisionmakerboughtin"],
    salesforce: ["Needs Analysis", "Value Proposition"],
  },
  proposal_sent: {
    hubspot: ["decisionmakerboughtin", "contractsent"],
    salesforce: ["Proposal/Price Quote", "Negotiation/Review"],
  },
  won: {
    hubspot: ["closedwon"],
    salesforce: ["Closed Won"],
  },
  lost: {
    hubspot: ["closedlost"],
    salesforce: ["Closed Lost"],
  },
};

function ConnectionCard({
  connection,
  onRemove,
  onToggle,
  onUpdateMapping,
}: {
  connection: CrmConnection;
  onRemove: () => void;
  onToggle: (active: boolean) => void;
  onUpdateMapping: (mapping: Record<string, string>) => void;
}) {
  const provider = CRM_PROVIDERS.find(p => p.id === connection.provider);
  const [showMapping, setShowMapping] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <div className={`rounded-lg border bg-card p-5 transition-colors ${connection.is_active ? "border-emerald-200 dark:border-emerald-800" : "border-border opacity-60"}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{provider?.logo || "🔗"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">{provider?.name || connection.provider}</h4>
            {connection.is_active ? (
              <span className="text-[9px] font-medium uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-full px-1.5 py-0.5">Connected</span>
            ) : (
              <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground bg-secondary rounded-full px-1.5 py-0.5">Paused</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Key: ••••{connection.api_key.slice(-8)}
            {connection.instance_url && <> · {connection.instance_url.replace("https://", "")}</>}
          </p>
          {connection.last_synced_at && (
            <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Last synced {new Date(connection.last_synced_at).toLocaleDateString()} at {new Date(connection.last_synced_at).toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggle(!connection.is_active)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title={connection.is_active ? "Pause sync" : "Resume sync"}
          >
            {connection.is_active ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5" />}
          </button>
          {confirmRemove ? (
            <div className="flex items-center gap-1 rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-2 py-1">
              <span className="text-[10px] text-rose-600 font-medium">Remove?</span>
              <button onClick={onRemove} className="text-[10px] font-semibold text-white bg-rose-500 rounded px-1.5 py-0.5 hover:bg-rose-600">Yes</button>
              <button onClick={() => setConfirmRemove(false)} className="text-[10px] font-medium text-muted-foreground hover:text-foreground">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmRemove(true)} className="p-1.5 text-muted-foreground/40 hover:text-rose-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Stage Mapping */}
      <button
        onClick={() => setShowMapping(!showMapping)}
        className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {showMapping ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Pipeline Stage Mapping
      </button>

      {showMapping && (
        <div className="mt-2 space-y-2 rounded-md border border-border bg-secondary/30 p-3">
          <p className="text-[10px] text-muted-foreground mb-2">
            Map VIGYL pipeline stages to your {provider?.name} stages:
          </p>
          {Object.entries(STAGE_OPTIONS).map(([vigylStage, options]) => {
            const providerOptions = options[connection.provider as keyof typeof options] || [];
            const currentMapping = connection.default_pipeline_mapping?.[vigylStage] || providerOptions[0] || "";
            return (
              <div key={vigylStage} className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-foreground w-28 capitalize">{vigylStage.replace(/_/g, " ")}</span>
                <span className="text-[10px] text-muted-foreground">→</span>
                <select
                  value={currentMapping}
                  onChange={(e) => onUpdateMapping({ ...connection.default_pipeline_mapping, [vigylStage]: e.target.value })}
                  className="flex-1 rounded border border-border bg-background px-2 py-1 text-[10px] text-foreground"
                >
                  {providerOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddConnectionForm({ onAdd, existingProviders }: {
  onAdd: (provider: "hubspot" | "salesforce", key: string, instanceUrl?: string) => Promise<void>;
  existingProviders: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof CRM_PROVIDERS[0] | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const availableProviders = CRM_PROVIDERS.filter(p => !existingProviders.includes(p.id));

  const handleTest = async () => {
    if (!selectedProvider || !apiKey.trim()) return;
    setTesting(true);
    setTestResult(null);

    try {
      if (selectedProvider.id === "hubspot") {
        const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=1", {
          headers: { Authorization: `Bearer ${apiKey.trim()}` },
        });
        if (res.ok) {
          setTestResult({ ok: true, message: "Connected to HubSpot!" });
        } else {
          const err = await res.text();
          setTestResult({ ok: false, message: `HubSpot ${res.status}: Invalid token` });
        }
      } else if (selectedProvider.id === "salesforce") {
        if (!instanceUrl.trim()) {
          setTestResult({ ok: false, message: "Instance URL required" });
          return;
        }
        const res = await fetch(`${instanceUrl.trim()}/services/data/v59.0/`, {
          headers: { Authorization: `Bearer ${apiKey.trim()}` },
        });
        if (res.ok) {
          setTestResult({ ok: true, message: "Connected to Salesforce!" });
        } else {
          setTestResult({ ok: false, message: `Salesforce ${res.status}: Check your token and instance URL` });
        }
      }
    } catch (e: any) {
      setTestResult({ ok: false, message: e.message || "Connection failed" });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProvider || !apiKey.trim()) return;
    setSaving(true);
    try {
      await onAdd(selectedProvider.id, apiKey.trim(), instanceUrl.trim() || undefined);
      setApiKey("");
      setInstanceUrl("");
      setSelectedProvider(null);
      setTestResult(null);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    if (availableProviders.length === 0 && existingProviders.length >= 2) return null;
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-5 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-primary/[0.02] transition-colors"
      >
        <Plus className="h-4 w-4" /> Connect CRM
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/[0.02] p-5 space-y-4">
      <p className="text-sm font-semibold text-foreground">Connect your CRM</p>

      {/* Provider selection */}
      {!selectedProvider ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableProviders.map(provider => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider)}
              className="flex items-start gap-3 rounded-lg border border-border p-4 text-left hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
            >
              <span className="text-2xl">{provider.logo}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{provider.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{provider.description}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{selectedProvider.logo}</span>
            <span className="text-sm font-semibold text-foreground">{selectedProvider.name}</span>
            <button onClick={() => { setSelectedProvider(null); setApiKey(""); setInstanceUrl(""); setTestResult(null); }} className="text-[10px] text-muted-foreground hover:text-foreground ml-auto">
              Change
            </button>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">{selectedProvider.keyLabel}</label>
            <input
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setTestResult(null); }}
              placeholder={selectedProvider.keyPlaceholder}
              type="password"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {selectedProvider.needsInstanceUrl && (
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Instance URL</label>
              <input
                value={instanceUrl}
                onChange={(e) => { setInstanceUrl(e.target.value); setTestResult(null); }}
                placeholder={selectedProvider.instanceUrlPlaceholder}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {testResult && (
            <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${
              testResult.ok
                ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                : "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300"
            }`}>
              {testResult.ok ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              {testResult.message}
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <a href={selectedProvider.docsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <ExternalLink className="h-3 w-3" /> How to get your {selectedProvider.keyLabel.toLowerCase()}
            </a>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleTest}
              disabled={testing || !apiKey.trim()}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
            >
              {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plug className="h-3 w-3" />}
              Test Connection
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !apiKey.trim()}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Save Connection
            </button>
            <button
              onClick={() => { setOpen(false); setSelectedProvider(null); setApiKey(""); setInstanceUrl(""); setTestResult(null); }}
              className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CrmSection() {
  const { tier } = useAuth();
  const { connections, loading, addConnection, removeConnection, toggleConnection, updateStageMapping, refresh } = useCrmConnections();
  const { toast } = useToast();

  const canUseCrm = hasAccess(tier, "enterprise");

  const handleAdd = async (provider: "hubspot" | "salesforce", key: string, instanceUrl?: string) => {
    try {
      await addConnection(provider, key, instanceUrl);
      track(EVENTS.CRM_CONNECTED, { provider });
      toast({ title: "CRM connected", description: `${provider === "hubspot" ? "HubSpot" : "Salesforce"} is now connected. Push prospects from your Pipeline.` });
    } catch (err: any) {
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    }
  };

  const handleRemove = async (conn: CrmConnection) => {
    try {
      await removeConnection(conn.id);
      toast({ title: "Disconnected", description: `${conn.provider === "hubspot" ? "HubSpot" : "Salesforce"} connection removed.` });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleToggle = async (conn: CrmConnection, active: boolean) => {
    try {
      await toggleConnection(conn.id, active);
      toast({ title: active ? "Resumed" : "Paused", description: `${conn.provider === "hubspot" ? "HubSpot" : "Salesforce"} sync ${active ? "resumed" : "paused"}.` });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateMapping = async (conn: CrmConnection, mapping: Record<string, string>) => {
    try {
      await updateStageMapping(conn.id, mapping);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  if (!canUseCrm) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <Plug className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground">CRM Integrations</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Push prospects directly to HubSpot or Salesforce with one click.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            CRM integrations are available on the <span className="font-semibold text-primary">Team plan</span>.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading integrations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Plug className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">CRM Integrations</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Connect your CRM to push prospects, contacts, and deals directly from your VIGYL pipeline.
          Each sync creates a Company (or Lead), associated Contacts, and a Deal (or Opportunity) with VIGYL intelligence data.
        </p>
      </div>

      {/* Existing connections */}
      {connections.map(conn => (
        <ConnectionCard
          key={conn.id}
          connection={conn}
          onRemove={() => handleRemove(conn)}
          onToggle={(active) => handleToggle(conn, active)}
          onUpdateMapping={(mapping) => handleUpdateMapping(conn, mapping)}
        />
      ))}

      {/* Add connection */}
      <AddConnectionForm
        onAdd={handleAdd}
        existingProviders={connections.map(c => c.provider)}
      />

      {/* What gets synced */}
      {connections.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h4 className="text-xs font-semibold text-foreground mb-3">What gets synced</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">HubSpot</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✓ <strong className="text-foreground">Company</strong> — name, revenue, employees, location, industry</li>
                <li>✓ <strong className="text-foreground">Contacts</strong> — each decision maker as a linked contact</li>
                <li>✓ <strong className="text-foreground">Deal</strong> — stage, amount, VIGYL score + "why now" in description</li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Salesforce</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✓ <strong className="text-foreground">Leads</strong> — each decision maker as a Lead with company info</li>
                <li>✓ <strong className="text-foreground">Opportunity</strong> — stage, amount, close date, VIGYL intelligence</li>
                <li>✓ <strong className="text-foreground">Lead Source</strong> — tagged "VIGYL" for attribution</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

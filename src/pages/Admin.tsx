import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { TIERS, TierKey } from "@/lib/tiers";
import { Loader2, Shield, Crown, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  profile: {
    company_name: string | null;
    onboarding_completed: boolean;
    target_industries: string[] | null;
  } | null;
}

export default function Admin() {
  const { session, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "list-users" },
      });
      if (error) throw error;
      setUsers(data.users || []);
    } catch (err: any) {
      toast({ title: "Error loading users", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const setTier = async (userEmail: string, tierKey: TierKey) => {
    setUpdating(userEmail);
    try {
      const tierConfig = TIERS[tierKey];
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: {
          action: "set-tier",
          userEmail,
          productId: tierConfig.product_id,
        },
      });
      if (error) throw error;
      toast({ title: "Tier updated", description: `${userEmail} set to ${tierConfig.name}` });
    } catch (err: any) {
      toast({ title: "Error updating tier", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  if (!session) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/industries" replace />;

  const tierKeys = Object.keys(TIERS) as TierKey[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage user tiers for testing</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <ArrowUpDown className="h-3 w-3" /> Set Tier
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground">{user.profile?.company_name || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {tierKeys.map((tk) => (
                          <button
                            key={tk}
                            onClick={() => setTier(user.email, tk)}
                            disabled={updating === user.email}
                            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                              tk === "free"
                                ? "bg-secondary text-muted-foreground hover:text-foreground"
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                            } disabled:opacity-50`}
                          >
                            {updating === user.email ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              TIERS[tk].name
                            )}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

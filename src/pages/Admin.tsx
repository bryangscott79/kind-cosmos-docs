import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { TIERS, TierKey, getTierFromProductId } from "@/lib/tiers";
import {
  Loader2, Shield, ArrowUpDown, UserPlus, Send, Search, Eye, Trash2,
  Users, BarChart3, TrendingUp, Activity, X, Save, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  product_id: string | null;
  profile: {
    company_name: string | null;
    onboarding_completed: boolean;
    target_industries: string[] | null;
    customer_industries: string[] | null;
    role_title: string | null;
    website_url: string | null;
    company_size: string | null;
    location_city: string | null;
    location_state: string | null;
    location_country: string | null;
    user_persona: string | null;
    ai_maturity_self: string | null;
    entity_type: string | null;
    business_summary: string | null;
  } | null;
}

interface UserDetail {
  user: { id: string; email: string; created_at: string; last_sign_in_at: string | null; email_confirmed_at: string | null };
  profile: any;
  saved_signals: any[];
  prospect_feedback: any[];
  cached_intelligence: any[];
}

export default function Admin() {
  const { session, isAdmin, refreshSubscription, user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editProfile, setEditProfile] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; email: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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
        body: { action: "set-tier", userEmail, productId: tierConfig.product_id },
      });
      if (error) throw error;
      toast({ title: "Tier updated", description: `${userEmail} set to ${tierConfig.name}` });
      await fetchUsers();
      if (user?.email === userEmail) await refreshSubscription();
    } catch (err: any) {
      toast({ title: "Error updating tier", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const inviteUser = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "invite-user", email: inviteEmail.trim() },
      });
      if (error) throw error;
      toast({ title: "Invitation sent", description: `Invite email sent to ${inviteEmail}` });
      setInviteEmail("");
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const openUserDetail = async (userId: string) => {
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "get-user-detail", userId },
      });
      if (error) throw error;
      setSelectedUser(data);
      setEditProfile(data.profile || {});
    } catch (err: any) {
      toast({ title: "Error loading user", description: err.message, variant: "destructive" });
      setShowDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke("admin-users", {
        body: { action: "update-profile", userId: selectedUser.user.id, updates: editProfile },
      });
      if (error) throw error;
      toast({ title: "Profile updated" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("admin-users", {
        body: { action: "delete-user", userId: deleteConfirm.id },
      });
      if (error) throw error;
      toast({ title: "User deleted", description: `${deleteConfirm.email} has been removed` });
      setDeleteConfirm(null);
      setShowDetail(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      (u.profile?.company_name || "").toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const tierDistribution: Record<string, number> = {};
    const tierKeys = Object.keys(TIERS) as TierKey[];
    tierKeys.forEach(k => tierDistribution[TIERS[k].name] = 0);

    users.forEach(u => {
      const tier = getTierFromProductId(u.product_id);
      tierDistribution[TIERS[tier].name]++;
    });

    const onboarded = users.filter(u => u.profile?.onboarding_completed).length;
    const recent7 = users.filter(u => {
      const d = new Date(u.created_at);
      return d > new Date(Date.now() - 7 * 86400000);
    }).length;
    const recent30 = users.filter(u => {
      const d = new Date(u.created_at);
      return d > new Date(Date.now() - 30 * 86400000);
    }).length;
    const activeRecently = users.filter(u => {
      if (!u.last_sign_in_at) return false;
      return new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 86400000);
    }).length;

    // Signups by day (last 30 days)
    const signupsByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      signupsByDay[d.toISOString().slice(0, 10)] = 0;
    }
    users.forEach(u => {
      const day = new Date(u.created_at).toISOString().slice(0, 10);
      if (day in signupsByDay) signupsByDay[day]++;
    });

    return { tierDistribution, onboarded, recent7, recent30, activeRecently, signupsByDay, total: users.length };
  }, [users]);

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
            <p className="text-sm text-muted-foreground">Manage users, tiers & platform analytics</p>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
          </TabsList>

          {/* ===== USERS TAB ===== */}
          <TabsContent value="users" className="space-y-4 mt-4">
            {/* Invite */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Invite User</h2>
              </div>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && inviteUser()}
                  className="flex-1"
                />
                <Button onClick={inviteUser} disabled={inviting || !inviteEmail.trim()} size="sm">
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" /> Send Invite</>}
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or company…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Users table */}
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Joined</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /> Tier</div>
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((u) => {
                      const userTier = getTierFromProductId(u.product_id);
                      return (
                        <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{u.email}</p>
                            {u.profile?.onboarding_completed === false && (
                              <Badge variant="outline" className="mt-0.5 text-[10px]">Not onboarded</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <p className="text-sm text-muted-foreground">{u.profile?.company_name || "—"}</p>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {tierKeys.map((tk) => {
                                const isActive = tk === userTier;
                                return (
                                  <button
                                    key={tk}
                                    onClick={() => setTier(u.email, tk)}
                                    disabled={updating === u.email}
                                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                      isActive
                                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                        : tk === "free"
                                          ? "bg-secondary text-muted-foreground hover:text-foreground"
                                          : "bg-primary/10 text-primary hover:bg-primary/20"
                                    } disabled:opacity-50`}
                                  >
                                    {updating === u.email ? <Loader2 className="h-3 w-3 animate-spin" /> : TIERS[tk].name}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openUserDetail(u.id)}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => setDeleteConfirm({ id: u.id, email: u.email })}
                                disabled={u.email === user?.email}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <p className="text-center py-8 text-sm text-muted-foreground">No users found</p>
                )}
              </div>
            )}
          </TabsContent>

          {/* ===== ANALYTICS TAB ===== */}
          <TabsContent value="analytics" className="space-y-6 mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={<Users className="h-4 w-4" />} label="Total Users" value={analytics.total} />
                  <StatCard icon={<TrendingUp className="h-4 w-4" />} label="New (7d)" value={analytics.recent7} />
                  <StatCard icon={<TrendingUp className="h-4 w-4" />} label="New (30d)" value={analytics.recent30} />
                  <StatCard icon={<Activity className="h-4 w-4" />} label="Active (7d)" value={analytics.activeRecently} />
                </div>

                {/* Tier Distribution */}
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Tier Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.tierDistribution).map(([name, count]) => {
                      const pct = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                      return (
                        <div key={name}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-foreground font-medium">{name}</span>
                            <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Onboarding Completion */}
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Onboarding Completion</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20">
                      <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          strokeDasharray={`${analytics.total > 0 ? (analytics.onboarded / analytics.total) * 100 : 0}, 100`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                        {analytics.total > 0 ? Math.round((analytics.onboarded / analytics.total) * 100) : 0}%
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">{analytics.onboarded} / {analytics.total} users</p>
                      <p className="text-xs text-muted-foreground">completed onboarding</p>
                    </div>
                  </div>
                </div>

                {/* Signup Trend (text-based simple chart) */}
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Signups — Last 30 Days</h3>
                  <div className="flex items-end gap-[2px] h-24">
                    {Object.entries(analytics.signupsByDay).map(([day, count]) => {
                      const max = Math.max(...Object.values(analytics.signupsByDay), 1);
                      const h = (count / max) * 100;
                      return (
                        <div
                          key={day}
                          className="flex-1 bg-primary/70 rounded-t hover:bg-primary transition-colors"
                          style={{ height: `${Math.max(h, 2)}%` }}
                          title={`${day}: ${count} signup${count !== 1 ? "s" : ""}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">30d ago</span>
                    <span className="text-[10px] text-muted-foreground">Today</span>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ===== USER DETAIL DIALOG ===== */}
      <Dialog open={showDetail} onOpenChange={(o) => { if (!o) { setShowDetail(false); setSelectedUser(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> User Detail
            </DialogTitle>
            <DialogDescription>{selectedUser?.user.email}</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : selectedUser ? (
            <div className="space-y-5">
              {/* Auth info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Email Confirmed</span>
                  <p className="text-foreground">{selectedUser.user.email_confirmed_at ? new Date(selectedUser.user.email_confirmed_at).toLocaleDateString() : "Not confirmed"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Last Sign In</span>
                  <p className="text-foreground">{selectedUser.user.last_sign_in_at ? new Date(selectedUser.user.last_sign_in_at).toLocaleString() : "Never"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Created</span>
                  <p className="text-foreground">{new Date(selectedUser.user.created_at).toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              {/* Editable profile fields */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Profile</h4>
                <div className="grid grid-cols-2 gap-3">
                  <ProfileField label="Company" field="company_name" state={editProfile} setState={setEditProfile} />
                  <ProfileField label="Role" field="role_title" state={editProfile} setState={setEditProfile} />
                  <ProfileField label="Website" field="website_url" state={editProfile} setState={setEditProfile} />
                  <ProfileField label="Company Size" field="company_size" state={editProfile} setState={setEditProfile} />
                  <ProfileField label="City" field="location_city" state={editProfile} setState={setEditProfile} />
                  <ProfileField label="State" field="location_state" state={editProfile} setState={setEditProfile} />
                  <ProfileField label="Country" field="location_country" state={editProfile} setState={setEditProfile} />
                  <ProfileField label="Persona" field="user_persona" state={editProfile} setState={setEditProfile} />
                  <ProfileField label="AI Maturity" field="ai_maturity_self" state={editProfile} setState={setEditProfile} />
                  <ProfileField label="Entity Type" field="entity_type" state={editProfile} setState={setEditProfile} />
                </div>
                <div className="mt-3">
                  <label className="text-xs text-muted-foreground">Business Summary</label>
                  <textarea
                    value={editProfile.business_summary || ""}
                    onChange={(e) => setEditProfile(p => ({ ...p, business_summary: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                  />
                </div>
                <Button size="sm" onClick={saveProfile} disabled={saving} className="mt-3">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                  Save Changes
                </Button>
              </div>

              <Separator />

              {/* Data summary */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">User Data</h4>
                <div className="grid grid-cols-3 gap-3">
                  <DataBadge label="Saved Signals" count={selectedUser.saved_signals.length} />
                  <DataBadge label="Prospect Feedback" count={selectedUser.prospect_feedback.length} />
                  <DataBadge label="Intelligence Cache" count={selectedUser.cached_intelligence.length} />
                </div>
              </div>

              {/* Saved Signals list */}
              {selectedUser.saved_signals.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Saved Signals</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedUser.saved_signals.map((s: any) => (
                      <div key={s.id} className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2 text-xs">
                        <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-foreground font-medium truncate">{s.opportunity_name}</span>
                        {s.notes && <span className="text-muted-foreground truncate ml-auto">{s.notes}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Delete */}
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-medium text-destructive">Danger Zone</p>
                  <p className="text-xs text-muted-foreground">Permanently delete this user and all their data</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirm({ id: selectedUser.user.id, email: selectedUser.user.email })}
                  disabled={selectedUser.user.id === user?.id}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete User
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIRM DIALOG ===== */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <strong>{deleteConfirm?.email}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={deleteUser} disabled={deleting}>
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

/* ---- Helper components ---- */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">{icon}<span className="text-xs">{label}</span></div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function ProfileField({ label, field, state, setState }: { label: string; field: string; state: Record<string, any>; setState: React.Dispatch<React.SetStateAction<Record<string, any>>> }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input
        value={state[field] || ""}
        onChange={(e) => setState(p => ({ ...p, [field]: e.target.value }))}
        className="mt-1 h-8 text-sm"
      />
    </div>
  );
}

function DataBadge({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-md bg-secondary/50 p-3 text-center">
      <p className="text-lg font-bold text-foreground">{count}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { track, EVENTS } from "@/lib/analytics";

export interface TeamMember {
  id: string;
  owner_id: string;
  name: string;
  title: string;
  email: string;
  avatar_url: string | null;
  role: "owner" | "admin" | "member";
  invite_status: "pending" | "accepted" | "declined";
  invited_user_id: string | null;
  bio: string | null;
  linkedin_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type TeamMemberInput = Pick<TeamMember, "name" | "title" | "email"> & {
  bio?: string;
  linkedin_url?: string;
  role?: TeamMember["role"];
};

export function useTeamMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error } = await (supabase
        .from("team_members" as any)
        .select("*")
        .eq("owner_id", user.id)
        .order("display_order", { ascending: true }) as any);
      if (error) throw error;
      setMembers(data || []);
    } catch (e) {
      console.error("Failed to load team:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addMember = useCallback(async (input: TeamMemberInput) => {
    if (!user) throw new Error("Not authenticated");
    const maxOrder = members.length > 0
      ? Math.max(...members.map(m => m.display_order)) + 1
      : 0;

    const { data, error } = await (supabase
      .from("team_members" as any)
      .insert({
        owner_id: user.id,
        name: input.name,
        title: input.title,
        email: input.email,
        bio: input.bio || null,
        linkedin_url: input.linkedin_url || null,
        role: input.role || "member",
        display_order: maxOrder,
      } as any)
      .select()
      .single()) as any;

    if (error) throw error;
    setMembers(prev => [...prev, data]);
    return data as TeamMember;
  }, [user, members]);

  const updateMember = useCallback(async (id: string, updates: Partial<TeamMemberInput & { avatar_url: string | null }>) => {
    const { data, error } = await (supabase
      .from("team_members" as any)
      .update(updates as any)
      .eq("id", id)
      .select()
      .single()) as any;

    if (error) throw error;
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    return data as TeamMember;
  }, []);

  const removeMember = useCallback(async (id: string) => {
    const { error } = await (supabase
      .from("team_members" as any)
      .delete()
      .eq("id", id)) as any;

    if (error) throw error;
    setMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  const uploadAvatar = useCallback(async (memberId: string, file: File): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${memberId}.${ext}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    // Add cache-buster to force refresh
    const url = `${publicUrl}?t=${Date.now()}`;

    // Update member record
    await updateMember(memberId, { avatar_url: url });
    return url;
  }, [user, updateMember]);

  const reorder = useCallback(async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, i) => ({ id, display_order: i }));
    // Optimistic update
    setMembers(prev => {
      const map = new Map(prev.map(m => [m.id, m]));
      return orderedIds.map((id, i) => ({ ...map.get(id)!, display_order: i }));
    });
    // Persist
    for (const { id, display_order } of updates) {
      await (supabase.from("team_members" as any) as any).update({ display_order } as any).eq("id", id);
    }
  }, []);

  // For prompt/presentation context
  const teamSummary = members.map(m =>
    `${m.name} — ${m.title}${m.bio ? ` (${m.bio})` : ""}`
  ).join("\n");

  return {
    members,
    loading,
    addMember,
    updateMember,
    removeMember,
    uploadAvatar,
    reorder,
    refresh: load,
    teamSummary,
  };
}

import { useState, useRef, useCallback } from "react";
import {
  Users, Plus, Trash2, Camera, Loader2, Mail, Send,
  Linkedin, Check, X, ChevronDown, ChevronUp, User, Copy, Link as LinkIcon
} from "lucide-react";
import { useTeamMembers, TeamMember, TeamMemberInput } from "@/hooks/useTeamMembers";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

function AvatarUpload({ member, onUpload }: { member: TeamMember; onUpload: (file: File) => Promise<void> }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative group flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border bg-secondary/50 hover:border-primary/40 hover:bg-primary/5 transition-colors overflow-hidden"
    >
      {member.avatar_url ? (
        <img
          src={member.avatar_url}
          alt={member.name}
          className="h-full w-full object-cover rounded-full"
        />
      ) : (
        <User className="h-5 w-5 text-muted-foreground" />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
        {uploading ? (
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        ) : (
          <Camera className="h-4 w-4 text-white" />
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </button>
  );
}

function TeamMemberCard({
  member,
  onUpdate,
  onRemove,
  onUploadAvatar,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  member: TeamMember;
  onUpdate: (id: string, updates: Partial<TeamMemberInput & { avatar_url: string | null }>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [title, setTitle] = useState(member.title);
  const [email, setEmail] = useState(member.email);
  const [bio, setBio] = useState(member.bio || "");
  const [linkedinUrl, setLinkedinUrl] = useState(member.linkedin_url || "");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(member.id, { name, title, email, bio: bio || undefined, linkedin_url: linkedinUrl || undefined });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(member.name);
    setTitle(member.title);
    setEmail(member.email);
    setBio(member.bio || "");
    setLinkedinUrl(member.linkedin_url || "");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/[0.02] p-4 space-y-3">
        <div className="flex items-start gap-3">
          <AvatarUpload member={member} onUpload={onUploadAvatar} />
          <div className="flex-1 space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job title (e.g. VP of Sales)"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              type="email"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">LinkedIn URL</label>
            <input
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Short Bio (used in presentations)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief description of role and expertise — this shows up in AI-generated presentations and outreach"
            rows={2}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !title.trim()}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onMoveUp} disabled={isFirst} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30">
            <ChevronUp className="h-3 w-3" />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30">
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        {/* Avatar */}
        <AvatarUpload member={member} onUpload={onUploadAvatar} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
            {member.role !== "member" && (
              <span className="text-[9px] font-medium uppercase tracking-wider text-primary bg-primary/10 rounded-full px-1.5 py-0.5">{member.role}</span>
            )}
            {member.invite_status === "pending" && member.email && (
              <span className="text-[9px] font-medium uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-full px-1.5 py-0.5">Invite Pending</span>
            )}
            {member.invite_status === "accepted" && (
              <span className="text-[9px] font-medium uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-full px-1.5 py-0.5">Active</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{member.title}</p>
          {member.email && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{member.email}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {member.linkedin_url && (
            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-[#0A66C2] transition-colors">
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          )}
          <button onClick={() => setEditing(true)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium">
            Edit
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1 rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-2 py-1">
              <span className="text-[10px] text-rose-600 font-medium">Remove?</span>
              <button onClick={() => onRemove(member.id)} className="text-[10px] font-semibold text-white bg-rose-500 rounded px-1.5 py-0.5 hover:bg-rose-600">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="text-[10px] font-medium text-muted-foreground hover:text-foreground">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-muted-foreground/40 hover:text-rose-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {member.bio && (
        <p className="mt-2 ml-[88px] text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{member.bio}</p>
      )}
    </div>
  );
}

function AddMemberForm({ onAdd }: { onAdd: (input: TeamMemberInput) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !title.trim()) return;
    setSaving(true);
    try {
      await onAdd({ name: name.trim(), title: title.trim(), email: email.trim() });
      setName("");
      setTitle("");
      setEmail("");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-primary/[0.02] transition-colors"
      >
        <Plus className="h-4 w-4" /> Add Team Member
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/[0.02] p-4 space-y-3">
      <p className="text-xs font-semibold text-foreground">Add Team Member</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name *"
          autoFocus
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Job title *"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (for inviting to collaborate)"
        type="email"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving || !name.trim() || !title.trim()}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Add Member
        </button>
        <button
          onClick={() => { setOpen(false); setName(""); setTitle(""); setEmail(""); }}
          className="rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function TeamSection() {
  const { members, loading, addMember, updateMember, removeMember, uploadAvatar, reorder, refresh } = useTeamMembers();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [inviting, setInviting] = useState<string | null>(null);

  const handleAdd = async (input: TeamMemberInput) => {
    try {
      await addMember(input);
      toast({ title: "Team member added", description: `${input.name} added to your team.` });
    } catch (err: any) {
      toast({ title: "Failed to add", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdate = async (id: string, updates: Partial<TeamMemberInput & { avatar_url: string | null }>) => {
    try {
      await updateMember(id, updates);
      toast({ title: "Updated", description: "Team member profile updated." });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeMember(id);
      toast({ title: "Removed", description: "Team member removed." });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleUploadAvatar = useCallback(async (memberId: string, file: File) => {
    try {
      await uploadAvatar(memberId, file);
      toast({ title: "Photo updated" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  }, [uploadAvatar, toast]);

  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleInvite = async (member: TeamMember) => {
    if (!member.email) {
      toast({ title: "No email", description: "Add an email address to send an invite.", variant: "destructive" });
      return;
    }
    setInviting(member.id);
    setInviteLink(null);
    try {
      const { data: result, error } = await supabase.functions.invoke("invite-team-member", {
        body: { teamMemberId: member.id, appUrl: window.location.origin },
      });

      if (error) throw new Error(error.message);
      if (!result?.success) throw new Error(result?.error || "Failed to send invite");

      if (result.emailSent) {
        toast({
          title: "Invite sent!",
          description: `Email sent to ${member.email}. They'll get a link to accept and join your team.`,
        });
      } else if (result.inviteUrl) {
        // Resend not configured — show copyable link
        setInviteLink(result.inviteUrl);
        toast({
          title: "Invite created",
          description: result.message || "Copy the invite link to share with your team member.",
        });
      }

      // Refresh to pick up status change
      refresh();
    } catch (err: any) {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    } finally {
      setInviting(null);
    }
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast({ title: "Link copied", description: "Share this link with your team member." });
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const ids = members.map(m => m.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    reorder(ids);
  };

  const handleMoveDown = (index: number) => {
    if (index >= members.length - 1) return;
    const ids = members.map(m => m.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorder(ids);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Your Team</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Add the people on your team. Their names, titles, and bios are used in AI-generated presentations and outreach
          (e.g. the "Meet The Team" slide). Add their email to invite them to collaborate on shared intelligence.
        </p>
      </div>

      {/* You (owner) */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Account Owner</p>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{profile?.company_name ? `You · ${profile.company_name}` : user?.email}</p>
            <p className="text-xs text-muted-foreground">{profile?.role_title || "Owner"}</p>
            <p className="text-[10px] text-muted-foreground/70">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Team members */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Team Members ({members.length})</p>
        </div>

        {members.length === 0 && (
          <div className="text-center py-6">
            <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No team members yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Add your colleagues — their info powers the "Meet The Team" slide in presentations and personalizes outreach.
            </p>
          </div>
        )}

        {members.map((member, i) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            onUploadAvatar={(file) => handleUploadAvatar(member.id, file)}
            onMoveUp={() => handleMoveUp(i)}
            onMoveDown={() => handleMoveDown(i)}
            isFirst={i === 0}
            isLast={i === members.length - 1}
          />
        ))}

        <AddMemberForm onAdd={handleAdd} />
      </div>

      {/* Collaboration Invite Banner */}
      {members.filter(m => m.email && m.invite_status !== "accepted").length > 0 && (
        <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-800">
              <Send className="h-4 w-4 text-violet-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">Invite your team to collaborate</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Team members with email addresses can be invited to access shared intelligence, signals, and pipeline data.
                Collaboration requires a Team plan.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {members.filter(m => m.email && m.invite_status !== "accepted").map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleInvite(m)}
                    disabled={inviting === m.id}
                    className="flex items-center gap-1.5 rounded-md border border-violet-200 dark:border-violet-700 bg-white dark:bg-violet-800/30 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-800/50 disabled:opacity-50 transition-colors"
                  >
                    {inviting === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                    {m.invite_status === "pending" ? "Resend" : "Invite"} {m.name.split(" ")[0]}
                  </button>
                ))}
              </div>
              {inviteLink && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-violet-300 dark:border-violet-700 bg-white dark:bg-violet-900/40 px-3 py-2">
                  <LinkIcon className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                  <code className="flex-1 text-[11px] text-foreground truncate">{inviteLink}</code>
                  <button
                    onClick={copyInviteLink}
                    className="flex items-center gap-1 rounded-md bg-violet-100 dark:bg-violet-800 px-2 py-1 text-[10px] font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-700 transition-colors shrink-0"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Plus, X, Edit, Lock, Link as LinkIcon, Copy, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { TravelPartyMember, AccessLink } from "@/data/mockClients";

interface Props {
  members: TravelPartyMember[];
  onChange: (members: TravelPartyMember[]) => void;
  showHelperNote?: boolean;
}

export default function TravelPartySection({ members, onChange, showHelperNote }: Props) {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Edit-email confirmation flow
  const [editingMember, setEditingMember] = useState<TravelPartyMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);

  const partyFull = members.length >= 2;

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    onChange([
      ...members,
      { id: Math.random().toString(36).slice(2, 9), name: newName.trim(), email: newEmail.trim() },
    ]);
    setNewName("");
    setNewEmail("");
    setAddOpen(false);
    toast({ title: "Travel party member added" });
  };

  const handleRemove = (id: string) => {
    onChange(members.filter((m) => m.id !== id));
  };

  const handleGenerateLink = (id: string) => {
    const slug = Math.random().toString(36).slice(2, 10);
    const link: AccessLink = {
      url: `https://app.pocketguide-namibia.com/share-trip/${slug}`,
      generatedAt: new Date().toISOString(),
      activated: false,
    };
    onChange(members.map((m) => (m.id === id ? { ...m, link } : m)));
    toast({ title: "Access link generated" });
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  const openEdit = (m: TravelPartyMember) => {
    setEditingMember(m);
    setEditName(m.name);
    setEditEmail(m.email);
    if (m.link && !m.link.activated) {
      setConfirmEditOpen(true);
    }
  };

  const closeEdit = () => {
    setEditingMember(null);
    setEditName("");
    setEditEmail("");
    setConfirmEditOpen(false);
  };

  const saveEdit = () => {
    if (!editingMember) return;
    const emailChanged = editEmail.trim() !== editingMember.email;
    onChange(
      members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: editName.trim() || m.name,
              email: editEmail.trim() || m.email,
              // invalidate link when email changes
              link: emailChanged ? undefined : m.link,
            }
          : m
      )
    );
    if (emailChanged && editingMember.link) {
      toast({ title: "Access link invalidated", description: "Email changed — generate a new link." });
    } else {
      toast({ title: "Member updated" });
    }
    closeEdit();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold">Travel Party</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add up to 2 additional members to share this client's premium app access. Travel party members are sub-accounts linked to this client and do not count toward your agency's client limit.
        </p>
      </div>

      {showHelperNote && (
        <p className="text-xs text-muted-foreground bg-accent/60 border border-primary/15 rounded-lg px-4 py-2.5">
          Travel party members share this client's trip, premium access, and expiry date. Each member requires their own access link to activate their account.
        </p>
      )}

      {members.length > 0 ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {members.map((m) => {
            const locked = m.link?.activated;
            return (
              <li key={m.id} className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      {m.name}
                      {locked && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              This email address is locked because the client has already activated their account. Contact PGN Super Admin if a change is required.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!m.link && (
                      <Button variant="outline" size="sm" onClick={() => handleGenerateLink(m.id)}>
                        <LinkIcon className="h-3.5 w-3.5 mr-1.5" /> Generate Link
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(m)} disabled={locked}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(m.id)} disabled={locked}>
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
                {m.link && (
                  <div className="flex items-center justify-between gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs">
                    <span className="font-mono truncate flex-1">{m.link.url}</span>
                    <Badge
                      variant="outline"
                      className={
                        m.link.activated
                          ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/15"
                          : "bg-warning/15 text-warning border-warning/30 hover:bg-warning/15"
                      }
                    >
                      {m.link.activated ? "Account activated" : "Awaiting activation"}
                    </Badge>
                    <button
                      onClick={() => handleCopy(m.link!.url)}
                      className="text-primary hover:text-primary/80"
                      title="Copy link"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground italic">No travel party members yet.</p>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button variant="outline" size="sm" disabled={partyFull} onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Member
              </Button>
            </span>
          </TooltipTrigger>
          {partyFull && (
            <TooltipContent>Maximum of 2 additional travel party members reached.</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Add modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Travel Party Member</DialogTitle>
            <DialogDescription>This person will share the same trip and premium access window.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newName.trim() || !newEmail.trim()}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit modal */}
      <Dialog open={!!editingMember && !confirmEditOpen} onOpenChange={(v) => !v && closeEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Travel Party Member</DialogTitle>
            <DialogDescription>
              {editingMember?.link
                ? "Changing the email will invalidate the existing access link."
                : "Update this member's details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            {editingMember?.link?.generatedAt && (
              <p className="text-[11px] text-muted-foreground">
                Link generated on {format(parseISO(editingMember.link.generatedAt), "MMM d, yyyy 'at' HH:mm")}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm-invalidate-on-edit modal (shown when opening edit on member with active link) */}
      <Dialog open={confirmEditOpen} onOpenChange={(v) => { if (!v) closeEdit(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" /> Invalidate access link?
            </DialogTitle>
            <DialogDescription>
              Editing this email address will invalidate the existing access link. A new link will need to be generated. The previously generated link will no longer work. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>Cancel</Button>
            <Button onClick={() => setConfirmEditOpen(false)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

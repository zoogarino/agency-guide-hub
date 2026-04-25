import { useState } from "react";
import { Plus, X, Edit, Mail, RefreshCw } from "lucide-react";
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
import CredentialsEmailModal from "@/components/CredentialsEmailModal";
import {
  resolveCredentialsStatus, credentialsBadgeClass,
  type TravelPartyMember,
} from "@/data/mockClients";

interface Props {
  members: TravelPartyMember[];
  onChange: (members: TravelPartyMember[]) => void;
  showHelperNote?: boolean;
  onCredentialsEvent?: (memberName: string, isResend: boolean) => void;
  /** Plan-based travel party allowance, configured by Pocket Guide Namibia Super Admin. */
  maxMembers?: number;
}

export default function TravelPartySection({
  members, onChange, showHelperNote, onCredentialsEvent, maxMembers = 2,
}: Props) {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [editingMember, setEditingMember] = useState<TravelPartyMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [emailingMember, setEmailingMember] = useState<TravelPartyMember | null>(null);
  const [isResend, setIsResend] = useState(false);

  const partyFull = members.length >= maxMembers;

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

  const openEdit = (m: TravelPartyMember) => {
    setEditingMember(m);
    setEditName(m.name);
    setEditEmail(m.email);
  };

  const closeEdit = () => {
    setEditingMember(null);
    setEditName("");
    setEditEmail("");
  };

  const saveEdit = () => {
    if (!editingMember) return;
    onChange(
      members.map((m) =>
        m.id === editingMember.id
          ? { ...m, name: editName.trim() || m.name, email: editEmail.trim() || m.email }
          : m
      )
    );
    toast({ title: "Member updated" });
    closeEdit();
  };

  const openEmailModal = (m: TravelPartyMember, resend: boolean) => {
    setEmailingMember(m);
    setIsResend(resend);
  };

  const handleSendCredentials = (note: string) => {
    if (!emailingMember) return;
    const wasResend = isResend;
    onChange(
      members.map((m) =>
        m.id === emailingMember.id
          ? {
              ...m,
              credentials: {
                sentAt: new Date().toISOString(),
                resentCount: (m.credentials?.resentCount ?? 0) + (wasResend ? 1 : 0),
                activated: m.credentials?.activated ?? false,
              },
            }
          : m
      )
    );
    toast({
      title: wasResend ? "Credentials resent" : "Credentials sent",
      description: `Email delivered to ${emailingMember.email}${note ? " with personal note" : ""}.`,
    });
    onCredentialsEvent?.(emailingMember.name, wasResend);
    setEmailingMember(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold">Travel Party</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add additional members to share this client's premium app access. The number of members allowed is determined by your subscription plan. Travel party members are sub-accounts linked to this client and do not count toward your agency's client limit.
        </p>
      </div>

      {showHelperNote && (
        <p className="text-xs text-muted-foreground bg-accent/60 border border-primary/15 rounded-lg px-4 py-2.5">
          Travel party members share this client's trip, premium access, and expiry date. Each member receives their own credentials email to activate their account.
        </p>
      )}

      {members.length > 0 ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {members.map((m) => {
            const credStatus = resolveCredentialsStatus(m);
            const hasSent = !!m.credentials;
            return (
              <li key={m.id} className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEmailModal(m, hasSent)}
                    >
                      {hasSent ? (
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      {hasSent ? "Resend Credentials" : "Send Credentials"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(m.id)}>
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs">
                  <Badge variant="outline" className={credentialsBadgeClass[credStatus]}>
                    {credStatus}
                  </Badge>
                  {m.credentials && (
                    <span className="text-muted-foreground">
                      {credStatus === "Account Activated" ? "Activated" : "Sent"} on{" "}
                      {format(parseISO(m.credentials.sentAt), "MMM d, yyyy 'at' HH:mm")}
                    </span>
                  )}
                </div>
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
            <TooltipContent className="max-w-xs">
              You have reached the travel party limit for your current plan. Contact Pocket Guide Namibia to upgrade your plan and allow additional members.
            </TooltipContent>
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
      <Dialog open={!!editingMember} onOpenChange={(v) => !v && closeEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Travel Party Member</DialogTitle>
            <DialogDescription>Update this member's details.</DialogDescription>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Email Modal */}
      {emailingMember && (
        <CredentialsEmailModal
          open={!!emailingMember}
          onOpenChange={(v) => !v && setEmailingMember(null)}
          recipientName={emailingMember.name}
          recipientEmail={emailingMember.email}
          isResend={isResend}
          onSend={handleSendCredentials}
        />
      )}
    </div>
  );
}

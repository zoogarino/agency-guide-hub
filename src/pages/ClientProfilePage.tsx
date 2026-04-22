import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Mail, Map as MapIcon, Copy, Link as LinkIcon, Plus, X, Send } from "lucide-react";
import { format, addDays, addMonths, parseISO } from "date-fns";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  mockClients, statusBadgeClass, resolveClientStatus, type TravelPartyMember,
} from "@/data/mockClients";

interface ActivityEvent {
  date: string;
  description: string;
  agent: string;
}

export default function ClientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const client = mockClients.find((c) => String(c.id) === id);

  const [accessLink, setAccessLink] = useState(client?.link || "");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [travelParty, setTravelParty] = useState<TravelPartyMember[]>(client?.travelParty || []);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const status = useMemo(() => client ? resolveClientStatus(client) : "Unscheduled", [client]);

  if (!client) {
    return (
      <PortalLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Client not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clients
          </Button>
        </div>
      </PortalLayout>
    );
  }

  // Compute timeline points
  const accountCreated = parseISO(client.date);
  const activeFrom = client.activeFrom ? parseISO(client.activeFrom) : null;
  const tripEnd = client.tripEndDate ? parseISO(client.tripEndDate) : null;
  const premiumUnlocks = activeFrom ? addDays(activeFrom, -7) : null;
  const premiumExpires = tripEnd && client.durationMonths ? addMonths(tripEnd, client.durationMonths) : null;
  const today = new Date();

  type Milestone = { label: string; date: Date | null; key: string };
  const milestones: Milestone[] = [
    { key: "created", label: "Account Created", date: accountCreated },
    { key: "unlock", label: "Premium Unlocks", date: premiumUnlocks },
    { key: "trip-start", label: "Trip Starts", date: activeFrom },
    { key: "trip-end", label: "Trip Ends", date: tripEnd },
    { key: "expires", label: "Premium Expires", date: premiumExpires },
  ];

  const nextIdx = milestones.findIndex((m) => m.date && m.date > today);
  const colorFor = (m: Milestone, idx: number) => {
    if (!m.date) return "bg-muted text-muted-foreground border-border";
    if (m.date <= today) return "bg-primary text-primary-foreground border-primary";
    if (idx === nextIdx) return "bg-warning text-warning-foreground border-warning";
    return "bg-muted text-muted-foreground border-border";
  };

  const activity: ActivityEvent[] = [
    { date: client.date, description: "Account created", agent: "Jane Smith" },
    ...(client.trip !== "—" ? [{ date: client.date, description: `Trip assigned: ${client.trip}`, agent: "Jane Smith" }] : []),
    ...(status === "Active" ? [{ date: format(today, "yyyy-MM-dd"), description: "Premium access activated", agent: "System" }] : []),
    { date: client.date, description: "Welcome email sent", agent: "Jane Smith" },
  ];

  const handleGenerateLink = () => {
    const id = Math.random().toString(36).substring(2, 10);
    const link = `app.pocketguide-namibia.com/share-trip/${id}`;
    setAccessLink(link);
    toast({ title: "Access link generated" });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(`https://${text}`);
    toast({ title: "Link copied to clipboard" });
  };

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    setTravelParty([
      ...travelParty,
      { id: Math.random().toString(36).slice(2, 9), name: newMemberName.trim(), email: newMemberEmail.trim() },
    ]);
    setNewMemberName("");
    setNewMemberEmail("");
    setAddMemberOpen(false);
    toast({ title: "Travel party member added" });
  };

  const handleRemoveMember = (id: string) => {
    setTravelParty(travelParty.filter((m) => m.id !== id));
  };

  const canActivate = status === "Pending" || status === "Unscheduled";
  const partyFull = travelParty.length >= 2;

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/clients")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Clients
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">{client.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs ${statusBadgeClass[status]}`}>
                  {status}
                </Badge>
                <span className="text-sm text-muted-foreground">{client.email}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(`/clients?edit=${client.id}`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit Client Details
          </Button>
        </div>

        {/* Quick Actions */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex flex-wrap gap-2 items-start">
            <Button variant="outline" size="sm" onClick={() => setEmailOpen(true)}>
              <Mail className="h-4 w-4 mr-1.5" /> Send Email
            </Button>
            {client.tripId && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/trip-manager?edit=${client.tripId}`)}>
                <MapIcon className="h-4 w-4 mr-1.5" /> View/Edit Trip
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleGenerateLink}>
              <LinkIcon className="h-4 w-4 mr-1.5" /> Generate Access Link
            </Button>
            {accessLink && (
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs font-mono">
                <span className="truncate max-w-[260px]">{accessLink}</span>
                <button onClick={() => handleCopy(accessLink)} className="text-primary hover:text-primary/80">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {canActivate && (
              <div className="flex flex-col gap-1 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast({ title: "Premium access activated", description: `${client.name} now has premium access.` })}
                >
                  Activate Early
                </Button>
                <p className="text-[11px] text-muted-foreground leading-tight max-w-[260px]">
                  Use only if the automated activation date needs to be bypassed. This will immediately grant this client premium access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Details */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-lg font-semibold">Client Details</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Detail label="Title" value={client.title} />
                <Detail label="Username" value={client.username} />
                <Detail label="Date of Birth" value={client.dob} />
                <Detail label="Country" value={client.country} />
                <Detail label="Email" value={client.email} />
                <Detail label="Phone Number" value={client.phone} />
                <Detail label="Account Created" value={client.date} />
              </dl>
            </CardContent>
          </Card>

          {/* Trip Timeline */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-lg font-semibold">Trip Timeline</h2>
              {client.trip !== "—" ? (
                <>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Trip: </span>
                      <Link to={`/trip-manager?edit=${client.tripId}`} className="text-primary hover:underline font-medium">
                        {client.trip}
                      </Link>
                    </div>
                    {activeFrom && <div><span className="text-muted-foreground">Active From: </span><span className="font-medium">{format(activeFrom, "PP")}</span></div>}
                    {tripEnd && <div><span className="text-muted-foreground">Trip End: </span><span className="font-medium">{format(tripEnd, "PP")}</span></div>}
                    {client.durationMonths && <div><span className="text-muted-foreground">Agent Client Duration: </span><span className="font-medium">{client.durationMonths} months</span></div>}
                  </div>

                  {/* Visual timeline */}
                  <div className="pt-4">
                    <div className="relative flex items-start justify-between">
                      <div className="absolute left-0 right-0 top-3 h-0.5 bg-border" />
                      {milestones.map((m, idx) => (
                        <div key={m.key} className="relative flex flex-col items-center text-center w-1/5 px-1">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center z-10 ${colorFor(m, idx)}`}>
                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                          </div>
                          <p className="mt-2 text-[11px] font-medium leading-tight">{m.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {m.date ? format(m.date, "MMM d, yyyy") : "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No trip assigned yet. Assign a trip via the Trip Manager to activate the premium lifecycle.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Travel Party */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="font-heading text-lg font-semibold">Travel Party</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add up to 2 additional members to share this client's premium app access. Travel party members are sub-accounts linked to this client and do not count toward your agency's client limit.
              </p>
            </div>

            {travelParty.length > 0 ? (
              <ul className="divide-y divide-border rounded-md border border-border">
                {travelParty.map((m) => (
                  <li key={m.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(m.id)}>
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">No travel party members yet.</p>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={partyFull}
                      onClick={() => setAddMemberOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Add Member
                    </Button>
                  </span>
                </TooltipTrigger>
                {partyFull && (
                  <TooltipContent>Maximum of 2 additional travel party members reached.</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-heading text-lg font-semibold">Activity Log</h2>
            <ul className="space-y-3">
              {activity.map((e, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p>{e.description}</p>
                    <p className="text-xs text-muted-foreground">{e.date} · by {e.agent}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Send Email modal */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Email to {client.name}</DialogTitle>
            <DialogDescription>Add a personalized message below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <Label className="text-xs">Personalized message</Label>
            <Textarea
              rows={6}
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder={`Hi ${client.name.split(" ")[0]}, …`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toast({ title: "Email sent", description: `Sent to ${client.email}` });
                setEmailMessage("");
                setEmailOpen(false);
              }}
            >
              <Send className="h-4 w-4 mr-2" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Travel Party Member modal */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Travel Party Member</DialogTitle>
            <DialogDescription>This person will share the same trip and premium access window.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Name</Label>
              <Input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="email@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={!newMemberName.trim() || !newMemberEmail.trim()}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

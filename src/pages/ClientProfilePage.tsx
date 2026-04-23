import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Map as MapIcon, Copy, Link as LinkIcon, Lock, AlertTriangle } from "lucide-react";
import { format, addDays, addMonths, parseISO } from "date-fns";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  mockClients, statusBadgeClass, resolveClientStatus,
  type TravelPartyMember, type AccessLink,
} from "@/data/mockClients";
import TravelPartySection from "@/components/TravelPartySection";

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

  const [accessLink, setAccessLink] = useState<AccessLink | undefined>(client?.accessLink);
  const [travelParty, setTravelParty] = useState<TravelPartyMember[]>(client?.travelParty || []);

  // Email lock-edit confirmation flow (acknowledgment only — read-only display in this view)
  const [confirmEmailEditOpen, setConfirmEmailEditOpen] = useState(false);

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
    ...(accessLink ? [{ date: format(parseISO(accessLink.generatedAt), "yyyy-MM-dd"), description: "Access link generated", agent: "Jane Smith" }] : []),
    ...(accessLink?.activated ? [{ date: format(today, "yyyy-MM-dd"), description: "Client activated their account", agent: "System" }] : []),
    ...(status === "Active" ? [{ date: format(today, "yyyy-MM-dd"), description: "Premium access activated", agent: "System" }] : []),
  ];

  const handleGenerateLink = () => {
    const slug = Math.random().toString(36).substring(2, 10);
    setAccessLink({
      url: `https://app.pocketguide-namibia.com/share-trip/${slug}`,
      generatedAt: new Date().toISOString(),
      activated: false,
    });
    toast({ title: "Access link generated" });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Link copied to clipboard" });
  };

  const canActivate = status === "Pending" || status === "Unscheduled";
  const emailLocked = accessLink?.activated;

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
            {client.tripId && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/trip-manager?edit=${client.tripId}`)}>
                <MapIcon className="h-4 w-4 mr-1.5" /> View/Edit Trip
              </Button>
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

        {/* Client App Access Link — primary deliverable */}
        <Card className="border-2 border-primary/20 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-heading text-lg font-semibold">Client App Access Link</h2>
              {accessLink && (
                <Badge
                  variant="outline"
                  className={
                    accessLink.activated
                      ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/15"
                      : "bg-warning/15 text-warning border-warning/30 hover:bg-warning/15"
                  }
                >
                  {accessLink.activated ? "Account activated" : "Awaiting activation"}
                </Badge>
              )}
            </div>

            {!accessLink ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Button size="lg" onClick={handleGenerateLink}>
                  <LinkIcon className="h-4 w-4 mr-2" /> Generate Access Link
                </Button>
                <p className="text-sm text-muted-foreground max-w-md">
                  Generate a unique access link to share with your client. They will use this to access their premium PGN experience.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex-1 min-w-[260px] rounded-md bg-muted px-4 py-3 text-sm font-mono break-all">
                    {accessLink.url}
                  </div>
                  <Button size="lg" onClick={() => handleCopy(accessLink.url)}>
                    <Copy className="h-4 w-4 mr-2" /> Copy Link
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generated on {format(parseISO(accessLink.generatedAt), "MMM d, yyyy 'at' HH:mm")}
                </p>
                <p className="text-[11px] text-muted-foreground italic">
                  Each link can only be used to create one account. Editing the client's email will invalidate this link.
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
                <div>
                  <dt className="text-xs text-muted-foreground flex items-center gap-1">
                    Email
                    {emailLocked && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            This email address is locked because the client has already activated their account. Contact PGN Super Admin if a change is required.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </dt>
                  <dd className="font-medium flex items-center gap-2">
                    {client.email}
                    {accessLink && !accessLink.activated && (
                      <button
                        onClick={() => setConfirmEmailEditOpen(true)}
                        className="text-[11px] text-primary hover:underline"
                        title="Edit email"
                      >
                        Edit
                      </button>
                    )}
                  </dd>
                </div>
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
          <CardContent className="p-6">
            <TravelPartySection members={travelParty} onChange={setTravelParty} />
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

      {/* Confirm-invalidate-on-email-edit modal (primary client) */}
      <Dialog open={confirmEmailEditOpen} onOpenChange={setConfirmEmailEditOpen}>
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
            <Button variant="outline" onClick={() => setConfirmEmailEditOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setAccessLink(undefined);
              setConfirmEmailEditOpen(false);
              navigate(`/clients?edit=${client.id}`);
            }}>Confirm</Button>
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

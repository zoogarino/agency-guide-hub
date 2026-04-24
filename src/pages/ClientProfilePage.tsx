import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Map as MapIcon, Mail, RefreshCw } from "lucide-react";
import { format, addDays, addMonths, parseISO } from "date-fns";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  mockClients, statusBadgeClass, resolveClientStatus,
  resolveCredentialsStatus, credentialsBadgeClass,
  type TravelPartyMember, type CredentialsState,
} from "@/data/mockClients";
import TravelPartySection from "@/components/TravelPartySection";
import CredentialsEmailModal from "@/components/CredentialsEmailModal";

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

  const [credentials, setCredentials] = useState<CredentialsState | undefined>(client?.credentials);
  const [travelParty, setTravelParty] = useState<TravelPartyMember[]>(client?.travelParty || []);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [isResend, setIsResend] = useState(false);
  const [extraActivity, setExtraActivity] = useState<ActivityEvent[]>([]);

  // Editable client details (local-only mock)
  const [editOpen, setEditOpen] = useState(false);
  const [details, setDetails] = useState(() => ({
    firstName: client?.firstName ?? client?.name.split(" ")[0] ?? "",
    lastName: client?.lastName ?? client?.name.split(" ").slice(1).join(" ") ?? "",
    title: client?.title ?? "",
    username: client?.username ?? "",
    dob: client?.dob ?? "",
    country: client?.country ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
  }));
  const [editDraft, setEditDraft] = useState(details);

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

  type Milestone = { label: string; date: Date | null; key: string; note?: string };
  const milestones: Milestone[] = [
    { key: "created", label: "Account Created", date: accountCreated },
    { key: "unlock", label: "Premium Unlocks", date: premiumUnlocks },
    { key: "trip-start", label: "Trip Starts", date: activeFrom },
    { key: "trip-end", label: "Trip Ends", date: tripEnd },
    {
      key: "expires",
      label: "Premium Expires",
      date: premiumExpires,
      note: client.durationMonths ? `Calculated as ${client.durationMonths} months after Trip End date.` : undefined,
    },
  ];

  const nextIdx = milestones.findIndex((m) => m.date && m.date > today);
  const colorFor = (m: Milestone, idx: number) => {
    if (!m.date) return "bg-muted text-muted-foreground border-border";
    if (m.date <= today) return "bg-primary text-primary-foreground border-primary";
    if (idx === nextIdx) return "bg-warning text-warning-foreground border-warning";
    return "bg-muted text-muted-foreground border-border";
  };

  const credStatus = resolveCredentialsStatus({ credentials });

  const baseActivity: ActivityEvent[] = [
    { date: client.date, description: "Account created", agent: "Jane Smith" },
    ...(client.trip !== "—" ? [{ date: client.date, description: `Trip assigned: ${client.trip}`, agent: "Jane Smith" }] : []),
    ...(credentials ? [{
      date: format(parseISO(credentials.sentAt), "yyyy-MM-dd"),
      description: (credentials.resentCount && credentials.resentCount > 0)
        ? "Credentials email resent"
        : "Credentials email sent",
      agent: "Jane Smith",
    }] : []),
    ...(credentials?.activated ? [{ date: format(today, "yyyy-MM-dd"), description: "Client activated their account", agent: "System" }] : []),
    ...(status === "Active" ? [{ date: format(today, "yyyy-MM-dd"), description: "Premium access activated", agent: "System" }] : []),
  ];
  const activity = [...baseActivity, ...extraActivity];

  const openEmail = (resend: boolean) => {
    setIsResend(resend);
    setEmailModalOpen(true);
  };

  const handleSendCredentials = (note: string) => {
    const wasResend = isResend;
    setCredentials({
      sentAt: new Date().toISOString(),
      resentCount: (credentials?.resentCount ?? 0) + (wasResend ? 1 : 0),
      activated: credentials?.activated ?? false,
    });
    setExtraActivity((prev) => [
      ...prev,
      {
        date: format(new Date(), "yyyy-MM-dd"),
        description: wasResend ? "Credentials email resent" : "Credentials email sent",
        agent: "Jane Smith",
      },
    ]);
    toast({
      title: wasResend ? "Credentials resent" : "Credentials sent",
      description: `Email delivered to ${client.email}${note ? " with personal note" : ""}.`,
    });
  };

  const handleTravelPartyCredEvent = (memberName: string, resend: boolean) => {
    setExtraActivity((prev) => [
      ...prev,
      {
        date: format(new Date(), "yyyy-MM-dd"),
        description: resend
          ? `Credentials email resent to travel party member ${memberName}`
          : `Credentials email sent to travel party member ${memberName}`,
        agent: "Jane Smith",
      },
    ]);
  };

  const canActivate = status === "Pending" || status === "Unscheduled";

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
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={`text-xs ${statusBadgeClass[status]}`}>
                  {status}
                </Badge>
                <Badge variant="outline" className={`text-xs ${credentialsBadgeClass[credStatus]}`}>
                  Credentials: {credStatus}
                </Badge>
                <span className="text-sm text-muted-foreground">{client.email}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => { setEditDraft(details); setEditOpen(true); }}>
            <Edit className="h-4 w-4 mr-2" /> Edit Client Details
          </Button>
        </div>

        {/* Quick Actions — compact balanced row */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {client.tripId ? (
                <Button variant="default" size="sm" onClick={() => navigate(`/trip-manager?edit=${client.tripId}`)}>
                  <MapIcon className="h-4 w-4 mr-1.5" /> View/Edit Trip
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <Button variant="default" size="sm" disabled className="pointer-events-none opacity-50">
                          <MapIcon className="h-4 w-4 mr-1.5" /> View/Edit Trip
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>No trip assigned yet — go to Trip Manager to create and assign a trip.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {credentials ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm">
                      <Mail className="h-4 w-4 mr-1.5" /> Email Client
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => openEmail(false)}>
                      <Mail className="h-3.5 w-3.5 mr-2" /> Send Credentials
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEmail(true)}>
                      <RefreshCw className="h-3.5 w-3.5 mr-2" /> Resend Credentials
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="default" size="sm" onClick={() => openEmail(false)}>
                  <Mail className="h-4 w-4 mr-1.5" /> Email Client
                </Button>
              )}
            </div>

            {canActivate && (
              <div className="flex flex-col gap-1">
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
                <Detail label="First Name" value={details.firstName} />
                <Detail label="Last Name" value={details.lastName} />
                <Detail label="Title" value={details.title} />
                <Detail label="Username" value={details.username} />
                <Detail label="Date of Birth" value={details.dob} />
                <Detail label="Country" value={details.country} />
                <Detail label="Email" value={details.email} />
                <Detail label="Phone Number" value={details.phone} />
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
                          {m.note && (
                            <p className="text-[10px] text-muted-foreground/80 italic mt-0.5 leading-tight">
                              {m.note}
                            </p>
                          )}
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
            <TravelPartySection
              members={travelParty}
              onChange={setTravelParty}
              onCredentialsEvent={handleTravelPartyCredEvent}
            />
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

      {/* Credentials email modal — primary client */}
      <CredentialsEmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        recipientName={client.name}
        recipientEmail={client.email}
        isResend={isResend}
        onSend={handleSendCredentials}
      />
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

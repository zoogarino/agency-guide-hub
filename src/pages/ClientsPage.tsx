import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, CalendarIcon, Mail, RefreshCw, AlertTriangle, MoreHorizontal, Trash2 } from "lucide-react";
import { format } from "date-fns";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import CredentialsEmailModal from "@/components/CredentialsEmailModal";
import CredentialsRecipientModal, { type RecipientChoice } from "@/components/CredentialsRecipientModal";

import {
  mockClients, statusBadgeClass, resolveClientStatus,
  resolveCredentialsStatus, credentialsBadgeClass,
  type MockClient, type CredentialsState,
} from "@/data/mockClients";

type CredOverrides = Record<number, CredentialsState | undefined>;

export default function ClientsPage() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dob, setDob] = useState<Date | undefined>();
  const [credOverrides, setCredOverrides] = useState<CredOverrides>({});
  const [clientToDelete, setClientToDelete] = useState<MockClient | null>(null);

  // Create client form — email duplicate check
  const [newEmail, setNewEmail] = useState("");
  const emailExists = newEmail.trim().length > 0 &&
    mockClients.some((c) => c.email.toLowerCase() === newEmail.trim().toLowerCase());

  // Email flow state
  const [recipientPickerClient, setRecipientPickerClient] = useState<MockClient | null>(null);
  const [emailingClient, setEmailingClient] = useState<MockClient | null>(null);
  const [emailRecipients, setEmailRecipients] = useState<RecipientChoice>("primary");
  const [isResend, setIsResend] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "1") {
      setSheetOpen(true);
      navigate("/clients", { replace: true });
    }
  }, [location.search, navigate]);

  const filtered = mockClients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const getCreds = (c: MockClient): CredentialsState | undefined =>
    credOverrides[c.id] !== undefined ? credOverrides[c.id] : c.credentials;

  const handleCreate = () => {
    if (emailExists) return;
    toast({ title: "Client created", description: "Use the Send Credentials action to send their login credentials." });
    setNewEmail("");
    setSheetOpen(false);
  };

  const openRecipientPicker = (c: MockClient, resend: boolean) => {
    setIsResend(resend);
    setRecipientPickerClient(c);
  };

  const handleRecipientChoice = (choice: RecipientChoice) => {
    if (!recipientPickerClient) return;
    setEmailRecipients(choice);
    setEmailingClient(recipientPickerClient);
    setRecipientPickerClient(null);
  };

  const handleSendCredentials = (note: string) => {
    if (!emailingClient) return;
    const existing = getCreds(emailingClient);
    const wasResend = isResend;
    setCredOverrides((prev) => ({
      ...prev,
      [emailingClient.id]: {
        sentAt: new Date().toISOString(),
        resentCount: (existing?.resentCount ?? 0) + (wasResend ? 1 : 0),
        activated: existing?.activated ?? false,
      },
    }));
    const partyCount = emailingClient.travelParty?.length ?? 0;
    const scopeText =
      emailRecipients === "primary"
        ? `Email delivered to ${emailingClient.email}`
        : emailRecipients === "party"
          ? `Email delivered to ${partyCount} travel party member${partyCount === 1 ? "" : "s"}`
          : `Email delivered to ${emailingClient.email} and ${partyCount} travel party member${partyCount === 1 ? "" : "s"}`;
    toast({
      title: wasResend ? "Credentials resent" : "Credentials sent",
      description: `${scopeText}${note ? " with personal note" : ""}.`,
    });
    setEmailingClient(null);
  };

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your client accounts and trip access</p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Create New Client</Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-heading">New Client</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select a title" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr</SelectItem>
                      <SelectItem value="mrs">Mrs</SelectItem>
                      <SelectItem value="ms">Ms</SelectItem>
                      <SelectItem value="dr">Dr</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>First Name</Label><Input placeholder="Jane" /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input placeholder="Smith" /></div>
                </div>
                <div className="space-y-2"><Label>Username</Label><Input placeholder="janesmith" /></div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dob && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={setDob}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    aria-invalid={emailExists}
                    className={emailExists ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {emailExists && (
                    <p className="text-xs text-destructive flex items-start gap-1.5 leading-tight">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>This email address is already registered in the Pocket Guide Namibia system. Please use a different email address.</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2"><Label>Phone Number</Label><Input placeholder="+32 470 123 456" /></div>
                <div className="space-y-2"><Label>Country</Label><Input placeholder="Belgium" /></div>
                <p className="text-xs text-muted-foreground">
                  Account status is determined automatically once an "Active From" date is set in the Trip Builder. Once created, use the Email Client action in the table to send the client their login credentials.
                </p>
                <Button onClick={handleCreate} disabled={emailExists} className="w-full">Create Client</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Client Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Trip Assigned</th>
                  <th className="px-6 py-3 font-medium">Date Created</th>
                  <th className="px-6 py-3 font-medium">Credentials</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, i) => {
                  const creds = getCreds(client);
                  const credStatus = resolveCredentialsStatus({ credentials: creds });
                  const status = resolveClientStatus(client);
                  const hasSent = !!creds;
                  return (
                    <tr key={client.id} className={`border-b last:border-0 transition-colors ${i % 2 === 1 ? "bg-card" : ""}`}>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="text-foreground hover:text-primary hover:underline transition-colors text-left"
                        >
                          {client.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{client.email}</td>
                      <td className="px-6 py-4 text-sm">{client.trip}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{client.date}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={`text-xs ${credentialsBadgeClass[credStatus]}`}>
                            {credStatus}
                          </Badge>
                          {credStatus === "Not Sent" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="h-4 w-4 text-warning cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  Credentials not sent — this client cannot access the app yet.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {credStatus === "Sent" && status === "Active" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="h-4 w-4 text-warning cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  Client has not activated their account yet — their premium window is open but they cannot access the app. Consider following up directly.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className={`text-xs w-fit ${statusBadgeClass[status]}`}>
                            {status}
                          </Badge>
                          {status === "Unscheduled" && (
                            <p className="text-[11px] text-muted-foreground leading-tight max-w-[220px]">
                              No trip assigned — go to Trip Builder to assign a trip and set an Active From date.
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRecipientPicker(client, hasSent)}
                          >
                            {hasSent ? (
                              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            ) : (
                              <Mail className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            {hasSent ? "Resend Credentials" : "Send Credentials"}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setClientToDelete(client)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recipient choice modal */}
      <CredentialsRecipientModal
        open={!!recipientPickerClient}
        onOpenChange={(v) => !v && setRecipientPickerClient(null)}
        hasTravelParty={(recipientPickerClient?.travelParty?.length ?? 0) > 0}
        isResend={isResend}
        onSelect={handleRecipientChoice}
      />

      {/* Credentials email modal */}
      {emailingClient && (
        <CredentialsEmailModal
          open={!!emailingClient}
          onOpenChange={(v) => !v && setEmailingClient(null)}
          recipientName={emailingClient.name}
          recipientEmail={emailingClient.email}
          isResend={isResend}
          onSend={handleSendCredentials}
        />
      )}

      {/* Delete client confirmation */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(v) => !v && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{clientToDelete?.name}</span> from your agency portal? This will permanently remove them from your client list. Their Pocket Guide Namibia app account will not be deleted — it will be downgraded to a standard free account and all their data, saved itineraries, and account history will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                toast({ title: "Client deleted", description: `${clientToDelete?.name} was removed from your client list.` });
                setClientToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalLayout>
  );
}

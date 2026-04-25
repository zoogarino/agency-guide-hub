import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical, Search, MapPin, Tent, Coffee, Heart, AlertTriangle, Wrench,
  Plus, Eye, Save, Edit, Trash2, Globe, ArrowLeft, Copy, Info,
  Users, FileText, AlertCircle, CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import TravelPartySection from "@/components/TravelPartySection";
import type { TravelPartyMember } from "@/data/mockClients";

const categoryIcons: Record<string, React.ElementType> = {
  Activities: Coffee, Accommodation: Tent, Sites: MapPin,
  "Support Namibia": Heart, Support: Wrench, Emergencies: AlertTriangle,
};

const mockPins = [
  { id: 1, name: "Etosha National Park", category: "Activities" },
  { id: 2, name: "Sossusvlei", category: "Sites" },
  { id: 3, name: "Swakopmund", category: "Activities" },
  { id: 4, name: "Fish River Canyon", category: "Sites" },
  { id: 5, name: "Skeleton Coast", category: "Sites" },
  { id: 6, name: "Windhoek City Center", category: "Activities" },
  { id: 7, name: "Namib Desert Lodge", category: "Accommodation" },
  { id: 8, name: "Okaukuejo Camp", category: "Accommodation" },
  { id: 9, name: "Spitzkoppe", category: "Sites" },
  { id: 10, name: "Damaraland", category: "Activities" },
];

interface Stop { id: number; name: string; category: string; }

interface Trip {
  id: number; name: string; type: "Template" | "Custom"; client: string;
  status: string; duration: string; distance: string; stops: number; lastUpdated: string;
  usageCount?: number; // templates only — number of client trips created from this template
}

// Varied template examples: short / medium / long
const mockTemplates: Trip[] = [
  { id: 1, name: "Sossusvlei Quick Escape", type: "Template", client: "", status: "", duration: "5 days", distance: "520 km", stops: 4, lastUpdated: "2 days ago", usageCount: 3 },
  { id: 2, name: "Etosha Explorer", type: "Template", client: "", status: "", duration: "12 days", distance: "1,200 km", stops: 8, lastUpdated: "1 week ago", usageCount: 7 },
  { id: 4, name: "Grand Namibia Expedition", type: "Template", client: "", status: "", duration: "21 days", distance: "2,400 km", stops: 15, lastUpdated: "3 days ago", usageCount: 1 },
];

// Naming convention: "Template Name (Client First Name)"
const mockClientTrips: Trip[] = [
  { id: 3, name: "Sossusvlei Quick Escape (Sarah)", type: "Custom", client: "Sarah Miller", status: "Active", duration: "5 days", distance: "520 km", stops: 4, lastUpdated: "1 day ago" },
  { id: 5, name: "Etosha Explorer (Marie)", type: "Custom", client: "Marie Dupont", status: "Pending", duration: "12 days", distance: "1,200 km", stops: 8, lastUpdated: "5 days ago" },
  { id: 6, name: "Etosha Explorer (Hans)", type: "Custom", client: "Hans Weber", status: "Expired", duration: "12 days", distance: "1,200 km", stops: 8, lastUpdated: "2 days ago" },
  { id: 7, name: "Southern Namibia Draft", type: "Custom", client: "Unassigned", status: "Draft", duration: "8 days", distance: "700 km", stops: 5, lastUpdated: "1 week ago" },
];

const mockClients = [
  { id: 1, name: "Sarah Miller", email: "sarah@example.com" },
  { id: 2, name: "Hans Weber", email: "hans@example.com" },
  { id: 3, name: "Marie Dupont", email: "marie@example.com" },
  { id: 4, name: "John Doe", email: "john@example.com" },
];

const defaultStops: Stop[] = [
  { id: 6, name: "Windhoek City Center", category: "Activities" },
  { id: 7, name: "Namib Desert Lodge", category: "Accommodation" },
  { id: 2, name: "Sossusvlei", category: "Sites" },
  { id: 8, name: "Okaukuejo Camp", category: "Accommodation" },
  { id: 1, name: "Etosha National Park", category: "Activities" },
];

type Tab = "templates" | "client-trips";
type View = "list" | "editor";
type EditorMode = "template" | "client" | "customize" | "copy";

/* ───────── Copy Trip Modal ───────── */
function CopyTripModal({
  open, onClose, originalTripName, onCopy,
}: { open: boolean; onClose: () => void; originalTripName: string; onCopy: (clientName: string) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const filtered = mockClients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Trip</DialogTitle>
          <DialogDescription>Choose a client to assign this copy to.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground">
            Original: <span className="font-medium text-foreground">{originalTripName}</span>
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clients..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="max-h-56 overflow-y-auto space-y-1 rounded-md border border-border">
            {filtered.length > 0 ? filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.name)}
                className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                  selected === c.name ? "bg-accent" : ""
                }`}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.email}</span>
              </button>
            )) : (
              <p className="text-xs text-muted-foreground italic px-3 py-3">No clients match your search.</p>
            )}
          </div>
          <button className="text-xs text-primary underline underline-offset-2 font-medium">
            + Create new client
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!selected} onClick={() => { onCopy(selected); onClose(); }}>Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Use for Client Modal ───────── */
function UseForClientModal({
  open, onClose, templateName, onSelect,
}: { open: boolean; onClose: () => void; templateName: string; onSelect: (clientName: string) => void }) {
  const [selected, setSelected] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign "{templateName}" to a Client</DialogTitle>
          <DialogDescription>Select an existing client or create a new one. A customizable copy of this template will be created.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Select Client</Label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger><SelectValue placeholder="Choose a client..." /></SelectTrigger>
              <SelectContent>
                {mockClients.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name} — {c.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Client not listed? <button className="text-primary underline underline-offset-2 font-medium">Create a new client</button>
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={!selected} onClick={() => { onSelect(selected); onClose(); }}>
              Continue to Trip Builder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Create Client Trip Modal ───────── */
function CreateClientTripModal({
  open, onClose, onFromTemplate, onFromScratch,
}: { open: boolean; onClose: () => void; onFromTemplate: () => void; onFromScratch: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Client Trip</DialogTitle>
          <DialogDescription>Choose how to start building this trip.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => { onFromTemplate(); onClose(); }}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center hover:border-primary/50 hover:bg-accent/50 transition-all"
          >
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-sm font-semibold">Start from Template</span>
            <span className="text-xs text-muted-foreground">Choose from your saved templates</span>
          </button>
          <button
            onClick={() => { onFromScratch(); onClose(); }}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 text-center hover:border-primary/50 hover:bg-accent/50 transition-all"
          >
            <Plus className="h-8 w-8 text-primary" />
            <span className="text-sm font-semibold">Build from Scratch</span>
            <span className="text-xs text-muted-foreground">Start with a blank itinerary</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Select Template Modal ───────── */
function SelectTemplateModal({
  open, onClose, onSelect,
}: { open: boolean; onClose: () => void; onSelect: (template: Trip) => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select a Template</DialogTitle>
          <DialogDescription>Choose a template to use as the starting point for this client trip.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-2 max-h-64 overflow-y-auto">
          {mockTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => { onSelect(t); onClose(); }}
              className="flex items-center justify-between w-full rounded-lg border border-border px-4 py-3 text-left hover:border-primary/50 hover:bg-accent/50 transition-all"
            >
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.duration} · {t.distance} · {t.stops} stops</p>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Trip List (Tabbed) ───────── */
function TripList({
  onEditTemplate, onEditClient, onCreateTemplate, onCreateClientFromScratch,
  onUseForClient, onCreateClientFromTemplate, onCopyTrip, autoOpenCreate,
}: {
  onEditTemplate: (id: number) => void;
  onEditClient: (id: number) => void;
  onCreateTemplate: () => void;
  onCreateClientFromScratch: () => void;
  onUseForClient: (template: Trip) => void;
  onCreateClientFromTemplate: () => void;
  onCopyTrip: (trip: Trip) => void;
  autoOpenCreate?: boolean;
}) {
  const { toast } = useToast();
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [tab, setTab] = useState<Tab>("templates");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Auto-open the Create Client Trip modal when navigated with ?new=1 from the dashboard
  useEffect(() => {
    if (autoOpenCreate) {
      setTab("client-trips");
      setShowCreateModal(true);
    }
  }, [autoOpenCreate]);

  const handleCreate = () => {
    if (tab === "templates") {
      onCreateTemplate();
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Trip Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your template library and client itineraries</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Create Trip
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "templates" as Tab, label: "Templates", icon: FileText },
          { key: "client-trips" as Tab, label: "Client Trips", icon: Users },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === "templates" ? (
          <motion.div key="templates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <p className="text-xs text-muted-foreground bg-accent/60 border border-primary/15 rounded-lg px-4 py-2.5">
              💡 Templates are your reusable master itineraries. Use <strong>"Use for Client"</strong> to create a customized copy for a specific client without affecting the original.
            </p>
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Trip Name</th>
                      <th className="px-6 py-3 font-medium">Usage</th>
                      <th className="px-6 py-3 font-medium">Duration</th>
                      <th className="px-6 py-3 font-medium">Distance</th>
                      <th className="px-6 py-3 font-medium">Stops</th>
                      <th className="px-6 py-3 font-medium">Last Updated</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTemplates.map((trip, i) => (
                      <tr key={trip.id} className={`border-b last:border-0 transition-colors ${i % 2 === 1 ? "bg-card" : ""}`}>
                        <td className="px-6 py-4 text-sm font-medium">{trip.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            Used {trip.usageCount ?? 0} {trip.usageCount === 1 ? "time" : "times"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{trip.duration}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{trip.distance}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{trip.stops}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{trip.lastUpdated}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Preview">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Preview — read-only client view</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditTemplate(trip.id)} aria-label="Edit">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit — open backend editor</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete template</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button size="sm" className="ml-2 h-8 text-xs" onClick={() => onUseForClient(trip)}>
                              <Users className="h-3.5 w-3.5 mr-1.5" /> Use for Client
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="client-trips" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Trip Name</th>
                      <th className="px-6 py-3 font-medium">Assigned Client</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Last Updated</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockClientTrips.map((trip, i) => (
                      <tr key={trip.id} className={`border-b last:border-0 transition-colors ${i % 2 === 1 ? "bg-card" : ""}`}>
                        <td className="px-6 py-4 text-sm font-medium">{trip.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {trip.client === "Unassigned" ? <span className="italic text-muted-foreground/60">Unassigned</span> : trip.client}
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const cls = trip.status === "Active"
                              ? "bg-primary/15 text-primary border-primary/30"
                              : trip.status === "Pending"
                                ? "bg-warning/15 text-warning border-warning/30"
                                : trip.status === "Expired"
                                  ? "bg-muted text-muted-foreground border-border"
                                  : "bg-muted text-muted-foreground border-border";
                            return <Badge variant="outline" className={`text-xs ${cls}`}>{trip.status}</Badge>;
                          })()}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{trip.lastUpdated}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Preview"><Eye className="h-4 w-4" /></Button>
                                </TooltipTrigger>
                                <TooltipContent>Preview — read-only client view</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditClient(trip.id)} aria-label="Edit"><Edit className="h-4 w-4" /></Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit — open backend editor</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopyTrip(trip)} aria-label="Copy"><Copy className="h-4 w-4" /></Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy trip — assign to another client</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View in Web"><Globe className="h-4 w-4" /></Button>
                                </TooltipTrigger>
                                <TooltipContent>View in Web — web preview as the client sees it</TooltipContent>
                              </Tooltip>
                              {trip.status === "Active" ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span tabIndex={0}>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 pointer-events-none" aria-label="Delete disabled" disabled>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    This trip cannot be deleted while the client is active. Go to the Trip Builder and set the trip status to Inactive first.
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTripToDelete(trip)} aria-label="Delete">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete trip</TooltipContent>
                                </Tooltip>
                              )}
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateClientTripModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onFromTemplate={onCreateClientFromTemplate}
        onFromScratch={onCreateClientFromScratch}
      />

      <AlertDialog open={!!tripToDelete} onOpenChange={(v) => !v && setTripToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete trip?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{tripToDelete?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                toast({ title: "Trip deleted", description: `${tripToDelete?.name} was removed.` });
                setTripToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </motion.div>
  );
}

/* ───────── Trip Editor ───────── */
function TripEditor({
  onBack, editorMode, templateName, clientName, originalTripName,
}: {
  onBack: () => void;
  editorMode: EditorMode;
  templateName?: string;
  clientName?: string;
  /** When editorMode === "copy", the name of the trip being duplicated. */
  originalTripName?: string;
}) {
  const { toast } = useToast();
  const initialName =
    editorMode === "customize" && templateName
      ? `${templateName} (${clientName})`
      : editorMode === "copy" && originalTripName && clientName
        ? (() => {
            // Strip any "(OldName)" suffix from the original then append new client first name
            const base = originalTripName.replace(/\s*\([^)]*\)\s*$/, "").trim();
            const firstName = clientName.split(" ")[0];
            return `${base} (${firstName})`;
          })()
        : "";
  const [tripName, setTripName] = useState(initialName);
  const [description, setDescription] = useState("");
  const [stops, setStops] = useState<Stop[]>(
    editorMode === "customize" || editorMode === "copy" ? [...defaultStops] : []
  );
  const [pinSearch, setPinSearch] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [activeFrom, setActiveFrom] = useState<Date | undefined>();
  const [tripEndDate, setTripEndDate] = useState<Date | undefined>();
  const [activeFromError, setActiveFromError] = useState<string | null>(null);
  const [travelParty, setTravelParty] = useState<TravelPartyMember[]>([]);

  const validateActiveFrom = (date: Date | undefined) => {
    if (!date) {
      setActiveFromError(null);
      return;
    }
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (date < sixMonthsAgo) {
      setActiveFromError(
        "The trip start date cannot be more than 6 months in the past. Please update the Active From date to reflect the current travel plans."
      );
    } else {
      setActiveFromError(null);
    }
  };

  const handleActiveFromChange = (date: Date | undefined) => {
    setActiveFrom(date);
    validateActiveFrom(date);
  };

  const showClientFields = editorMode === "client" || editorMode === "customize" || editorMode === "copy";

  const filteredPins = mockPins.filter(
    (p) => p.name.toLowerCase().includes(pinSearch.toLowerCase()) && !stops.some((s) => s.name === p.name)
  );

  const addStop = (pin: Stop) => { setStops([...stops, pin]); setPinSearch(""); };
  const removeStop = (index: number) => { setStops(stops.filter((_, i) => i !== index)); };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newStops = [...stops];
    const [moved] = newStops.splice(dragIndex, 1);
    newStops.splice(index, 0, moved);
    setStops(newStops);
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);

  const subtitleMap: Record<EditorMode, string> = {
    template: "Build a reusable template itinerary",
    client: "Build a custom itinerary for your client",
    customize: `Customizing for ${clientName}`,
    copy: `Copying to ${clientName}`,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold">
            {editorMode === "template" ? "Create / Edit Template" : "Create / Edit Trip"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{subtitleMap[editorMode]}</p>
        </div>
      </div>

      {/* Amber banner for customize mode */}
      {editorMode === "customize" && templateName && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 px-5 py-3.5 text-sm text-foreground">
          <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <span>
            You are customizing a copy of <strong>'{templateName}'</strong> — changes here will not affect the original template.
          </span>
        </div>
      )}

      {/* Blue informational banner for copy mode (permanent, non-dismissible) */}
      {editorMode === "copy" && originalTripName && clientName && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 px-5 py-3.5 text-sm text-foreground">
          <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <span>
            You are creating a copy of <strong>'{originalTripName}'</strong> for <strong>{clientName}</strong>. Changes here will not affect the original trip.
          </span>
        </div>
      )}

      <div className="grid grid-cols-5 gap-6">
        {/* Left panel */}
        <div className="col-span-2 space-y-5">
          <Card className="border-none shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label>Trip Name</Label>
                <Input value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="e.g. Etosha Explorer" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the trip highlights..." rows={4} />
              </div>
            </CardContent>
          </Card>

          {/* Customer Details — only for client / customize modes */}
          {showClientFields && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-5 space-y-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Customer Details</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Name</Label>
                    <Input placeholder="Client name" defaultValue={clientName || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input type="email" placeholder="client@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Phone Number</Label>
                    <Input placeholder="+32 470 123 456" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Country</Label>
                    <Input placeholder="Belgium" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <TravelPartySection
                    members={travelParty}
                    onChange={setTravelParty}
                    showHelperNote
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trip Status — separated section */}
          {showClientFields && (
            <Card className="border-none shadow-sm">
              <CardContent className="p-5 space-y-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Trip Status</Label>
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Active From:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !activeFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {activeFrom ? format(activeFrom, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={activeFrom}
                        onSelect={handleActiveFromChange}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {activeFromError && (
                    <p className="text-xs text-destructive flex items-start gap-1.5 leading-tight">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{activeFromError}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Trip End Date:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tripEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tripEndDate ? format(tripEndDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tripEndDate}
                        onSelect={setTripEndDate}
                        disabled={(date) => activeFrom ? date < activeFrom : false}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-[11px] text-muted-foreground">Records when your client's trip ends. Used to track clients who are currently traveling in Namibia.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search pins */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-5 space-y-3">
              <Label className="text-xs text-muted-foreground">Add Stops</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search Pocket Guide Namibia pins..." className="pl-9" value={pinSearch} onChange={(e) => setPinSearch(e.target.value)} />
              </div>
              {pinSearch && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredPins.map((pin) => {
                    const Icon = categoryIcons[pin.category] || MapPin;
                    return (
                      <button key={pin.id} onClick={() => addStop(pin)} className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span>{pin.name}</span>
                        <Plus className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                      </button>
                    );
                  })}
                  {filteredPins.length === 0 && <p className="text-xs text-muted-foreground px-3 py-2">No pins found</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stops list */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-5 space-y-3">
              <Label className="text-xs text-muted-foreground">Route Stops ({stops.length})</Label>
              <div className="space-y-1">
                {stops.map((stop, i) => {
                  const Icon = categoryIcons[stop.category] || MapPin;
                  return (
                    <div
                      key={`${stop.name}-${i}`}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm bg-muted/50 cursor-grab active:cursor-grabbing transition-colors ${dragIndex === i ? "opacity-50" : ""}`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="flex-1">{stop.name}</span>
                      <button onClick={() => removeStop(i)} className="text-muted-foreground hover:text-destructive text-xs">×</button>
                    </div>
                  );
                })}
                {stops.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No stops added yet. Use the search above or tap pins on the map.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel — Map */}
        <div className="col-span-3 space-y-5">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-[480px] bg-accent/50 flex items-center justify-center">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300BCD4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
                <div className="relative z-10 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 flex-wrap max-w-md">
                    {stops.map((_, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
                          {i + 1}
                        </div>
                        {i < stops.length - 1 && <div className="w-8 h-0.5 bg-primary/40" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Interactive map preview</p>
                  <p className="text-xs text-muted-foreground/70">Connect your map provider to see the full route</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Distance</p>
                    <p className="text-lg font-bold font-heading">~1,450 km</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Drive Duration</p>
                    <p className="text-lg font-bold font-heading">~18 hours</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Stops</p>
                    <p className="text-lg font-bold font-heading">{stops.length}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline"><Eye className="h-4 w-4 mr-2" /> Preview Trip</Button>
                  <Button onClick={() => toast({ title: "Trip saved" })}><Save className="h-4 w-4 mr-2" /> Save Trip</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-accent/60 border border-primary/20 px-5 py-3 text-sm text-accent-foreground">
            <span className="font-medium">💡 Tip:</span> Tap pins on the map to add stops, or use the search field.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────── Main Page ───────── */
export default function TripManagerPage() {
  const [view, setView] = useState<View>("list");
  const [editorMode, setEditorMode] = useState<EditorMode>("template");
  const [customizeTemplateName, setCustomizeTemplateName] = useState("");
  const [customizeClientName, setCustomizeClientName] = useState("");

  // Use for Client flow
  const [useForClientModal, setUseForClientModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Trip | null>(null);

  // Create from template flow
  const [selectTemplateModal, setSelectTemplateModal] = useState(false);

  // Copy Trip flow
  const [copyModalTrip, setCopyModalTrip] = useState<Trip | null>(null);
  const [copyOriginalName, setCopyOriginalName] = useState("");
  const [copyClientName, setCopyClientName] = useState("");

  // Auto-open create flow when navigated with ?new=1
  const location = useLocation();
  const navigate = useNavigate();
  const [autoOpenCreate, setAutoOpenCreate] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "1") {
      setAutoOpenCreate(true);
      navigate("/trip-manager", { replace: true });
    } else if (params.get("edit")) {
      setEditorMode("client");
      setView("editor");
      navigate("/trip-manager", { replace: true });
    }
  }, [location.search, navigate]);

  const handleUseForClient = (template: Trip) => {
    setSelectedTemplate(template);
    setUseForClientModal(true);
  };

  const handleClientSelected = (clientName: string) => {
    if (!selectedTemplate) return;
    setCustomizeTemplateName(selectedTemplate.name);
    setCustomizeClientName(clientName);
    setEditorMode("customize");
    setView("editor");
  };

  const handleCreateClientFromTemplate = () => {
    setSelectTemplateModal(true);
  };

  const handleTemplateSelectedForClient = (template: Trip) => {
    setSelectedTemplate(template);
    setUseForClientModal(true);
  };

  const handleCopyTrip = (trip: Trip) => {
    setCopyModalTrip(trip);
  };

  const handleCopyClientChosen = (clientName: string) => {
    if (!copyModalTrip) return;
    setCopyOriginalName(copyModalTrip.name);
    setCopyClientName(clientName);
    setCopyModalTrip(null);
    setEditorMode("copy");
    setView("editor");
  };

  return (
    <PortalLayout>
      {view === "list" ? (
        <>
          <TripList
            onEditTemplate={(id) => { setEditorMode("template"); setView("editor"); }}
            onEditClient={(id) => { setEditorMode("client"); setView("editor"); }}
            onCreateTemplate={() => { setEditorMode("template"); setView("editor"); }}
            onCreateClientFromScratch={() => { setEditorMode("client"); setView("editor"); }}
            onUseForClient={handleUseForClient}
            onCreateClientFromTemplate={handleCreateClientFromTemplate}
            onCopyTrip={handleCopyTrip}
            autoOpenCreate={autoOpenCreate}
          />
          <UseForClientModal
            open={useForClientModal}
            onClose={() => setUseForClientModal(false)}
            templateName={selectedTemplate?.name || ""}
            onSelect={handleClientSelected}
          />
          <SelectTemplateModal
            open={selectTemplateModal}
            onClose={() => setSelectTemplateModal(false)}
            onSelect={handleTemplateSelectedForClient}
          />
          <CopyTripModal
            open={!!copyModalTrip}
            onClose={() => setCopyModalTrip(null)}
            originalTripName={copyModalTrip?.name || ""}
            onCopy={handleCopyClientChosen}
          />
        </>
      ) : (
        <TripEditor
          onBack={() => setView("list")}
          editorMode={editorMode}
          templateName={editorMode === "customize" ? customizeTemplateName : undefined}
          clientName={
            editorMode === "customize"
              ? customizeClientName
              : editorMode === "copy"
                ? copyClientName
                : undefined
          }
          originalTripName={editorMode === "copy" ? copyOriginalName : undefined}
        />
      )}
    </PortalLayout>
  );
}

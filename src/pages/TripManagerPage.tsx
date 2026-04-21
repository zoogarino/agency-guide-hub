import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical, Search, MapPin, Tent, Coffee, Heart, AlertTriangle, Wrench,
  Plus, Eye, Save, Edit, Trash2, Mail, MessageCircle, Globe, ArrowLeft,
  Users, FileText, X, AlertCircle, CalendarIcon, Send,
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
}

const mockTemplates: Trip[] = [
  { id: 1, name: "Etosha Explorer", type: "Template", client: "", status: "", duration: "12 days", distance: "1,200 km", stops: 8, lastUpdated: "2 days ago" },
  { id: 2, name: "Skeleton Coast Adventure", type: "Template", client: "", status: "", duration: "15 days", distance: "1,800 km", stops: 10, lastUpdated: "1 week ago" },
  { id: 4, name: "Fish River Canyon", type: "Template", client: "", status: "", duration: "7 days", distance: "650 km", stops: 5, lastUpdated: "3 days ago" },
];

const mockClientTrips: Trip[] = [
  { id: 3, name: "Sossusvlei Dunes (Sarah)", type: "Custom", client: "Sarah Miller", status: "Active", duration: "10 days", distance: "900 km", stops: 6, lastUpdated: "1 day ago" },
  { id: 5, name: "Windhoek City Tour (Marie)", type: "Custom", client: "Marie Dupont", status: "Active", duration: "3 days", distance: "120 km", stops: 3, lastUpdated: "5 days ago" },
  { id: 6, name: "Etosha Custom (Hans)", type: "Custom", client: "Hans Weber", status: "Active", duration: "14 days", distance: "1,400 km", stops: 9, lastUpdated: "2 days ago" },
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
type EditorMode = "template" | "client" | "customize";

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
  onUseForClient, onCreateClientFromTemplate,
}: {
  onEditTemplate: (id: number) => void;
  onEditClient: (id: number) => void;
  onCreateTemplate: () => void;
  onCreateClientFromScratch: () => void;
  onUseForClient: (template: Trip) => void;
  onCreateClientFromTemplate: () => void;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("templates");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [emailTarget, setEmailTarget] = useState<string | null>(null);
  const [whatsappTarget, setWhatsappTarget] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");

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
                        <td className="px-6 py-4 text-sm text-muted-foreground">{trip.duration}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{trip.distance}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{trip.stops}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{trip.lastUpdated}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditTemplate(trip.id)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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
                          <Badge variant={trip.status === "Active" ? "default" : "secondary"} className="text-xs">{trip.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{trip.lastUpdated}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditClient(trip.id)} title="Edit"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Send Email" onClick={() => setEmailTarget(trip.client)}><Mail className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Send WhatsApp" onClick={() => setWhatsappTarget(trip.client)}><MessageCircle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View in Web"><Globe className="h-4 w-4" /></Button>
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

      {/* Send Email modal */}
      <Dialog open={!!emailTarget} onOpenChange={(v) => !v && setEmailTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Email{emailTarget ? ` to ${emailTarget}` : ""}</DialogTitle>
            <DialogDescription>Add a personalized message to include with the trip details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <Label className="text-xs">Personalized message</Label>
            <Textarea
              rows={6}
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Hi, here are the latest details for your trip…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailTarget(null)}>Cancel</Button>
            <Button
              onClick={() => {
                toast({ title: "Email sent", description: emailTarget ? `Sent to ${emailTarget}` : undefined });
                setEmailMessage("");
                setEmailTarget(null);
              }}
            >
              <Send className="h-4 w-4 mr-2" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send WhatsApp modal */}
      <Dialog open={!!whatsappTarget} onOpenChange={(v) => !v && setWhatsappTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send WhatsApp{whatsappTarget ? ` to ${whatsappTarget}` : ""}</DialogTitle>
            <DialogDescription>Add a personalized message to include with the trip details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <Label className="text-xs">Personalized message</Label>
            <Textarea
              rows={6}
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              placeholder="Hi, here are the latest details for your trip…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsappTarget(null)}>Cancel</Button>
            <Button
              onClick={() => {
                toast({ title: "WhatsApp Sent", description: whatsappTarget ? `Sent to ${whatsappTarget}` : undefined });
                setWhatsappMessage("");
                setWhatsappTarget(null);
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Sent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ───────── Trip Editor ───────── */
function TripEditor({
  onBack, editorMode, templateName, clientName,
}: {
  onBack: () => void; editorMode: EditorMode; templateName?: string; clientName?: string;
}) {
  const { toast } = useToast();
  const [tripName, setTripName] = useState(editorMode === "customize" && templateName ? `${templateName} (${clientName})` : "");
  const [description, setDescription] = useState("");
  const [stops, setStops] = useState<Stop[]>(editorMode === "customize" ? [...defaultStops] : []);
  const [pinSearch, setPinSearch] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [activeFrom, setActiveFrom] = useState<Date | undefined>();

  const showClientFields = editorMode === "client" || editorMode === "customize";

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
        <div className="flex items-start gap-3 rounded-lg border border-amber-300/50 bg-amber-50 px-5 py-3.5 text-sm text-amber-900">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <span>
            You are customizing a copy of <strong>'{templateName}'</strong> — changes here will not affect the original template.
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
                        onSelect={setActiveFrom}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
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
                <Input placeholder="Search PGN pins..." className="pl-9" value={pinSearch} onChange={(e) => setPinSearch(e.target.value)} />
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
        </>
      ) : (
        <TripEditor
          onBack={() => setView("list")}
          editorMode={editorMode}
          templateName={editorMode === "customize" ? customizeTemplateName : undefined}
          clientName={editorMode === "customize" ? customizeClientName : undefined}
        />
      )}
    </PortalLayout>
  );
}

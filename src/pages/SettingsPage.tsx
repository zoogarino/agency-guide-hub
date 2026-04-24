import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Pencil, Power, Plus, CreditCard, Hotel, Eye, Info } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

type AccommodationMode = "show_all" | "custom";
const DEFAULT_MAP_MODE: AccommodationMode = "custom";

const mockAgencyUsers = [
  { id: 1, name: "Jan Peeters", email: "jan@jokertravel.be", status: "Active" },
  { id: 2, name: "Sophie Claes", email: "sophie@jokertravel.be", status: "Active" },
  { id: 3, name: "Marc Willems", email: "marc@jokertravel.be", status: "Disabled" },
];

// Mock subscription details (read-only)
const subscription = {
  planName: "Agency Pro",
  duration: "Yearly",
  customTripLimit: 200,
  customTripsUsed: 112,
  clientLevel: "Premium",
  agentClientDuration: "6 months",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [agencyName, setAgencyName] = useState("Joker Travel");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [users, setUsers] = useState(mockAgencyUsers);
  const [editingUser, setEditingUser] = useState<typeof mockAgencyUsers[number] | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [mapMode, setMapMode] = useState<AccommodationMode>(DEFAULT_MAP_MODE);

  const usagePct = Math.round((subscription.customTripsUsed / subscription.customTripLimit) * 100);

  const mapOptions: { value: AccommodationMode; label: string; desc: string; icon: React.ElementType }[] = [
    { value: "show_all", label: "Show All", desc: "Clients see all accommodation pins on the map.", icon: Eye },
    { value: "custom", label: "Custom Selection", desc: "Clients see only the specific accommodations you choose.", icon: Hotel },
  ];

  const openEdit = (u: typeof mockAgencyUsers[number]) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
  };

  const saveEdit = () => {
    if (!editingUser) return;
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, name: editName, email: editEmail } : u)));
    toast({ title: "Agency-user updated" });
    setEditingUser(null);
  };

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "Active" ? "Disabled" : "Active" } : u))
    );
    toast({ title: "Status updated" });
  };

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your subscription, branding and team</p>
        </div>

        {/* Subscription (read-only) */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-heading text-lg font-semibold">Subscription</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Subscription Plan Name</p>
                <p className="text-sm font-semibold mt-1">{subscription.planName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subscription Duration</p>
                <p className="text-sm font-semibold mt-1">{subscription.duration}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Client Level</p>
                <p className="text-sm font-semibold mt-1">{subscription.clientLevel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Agent Client Duration</p>
                <p className="text-sm font-semibold mt-1">{subscription.agentClientDuration}</p>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Custom Trips Used</p>
                <p className="text-xs font-medium">
                  {subscription.customTripsUsed} / {subscription.customTripLimit}
                </p>
              </div>
              <Progress value={usagePct} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {subscription.customTripLimit - subscription.customTripsUsed} custom trips remaining on your current plan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Map Settings */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Hotel className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold">Client Map Settings — Pin Visibility</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Control what your clients see on their map. These settings apply to all clients created under your account.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mapOptions.map((opt) => {
                const isActive = mapMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setMapMode(opt.value)}
                    className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      isActive ? "border-primary bg-accent/40" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`rounded-lg p-2 ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <opt.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{opt.label}</span>
                        <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isActive ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}>
                          {isActive && <div className="h-1 w-1 rounded-full bg-primary-foreground" />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {mapMode === "custom" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">
                      When Custom Selection is active, each client will automatically see only the accommodation pins that are included as stops in their assigned trip. No manual configuration is needed — the map updates automatically based on each client's itinerary. Clients without an assigned trip will see no accommodation pins until a trip is assigned to their account.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-1">
              <Button onClick={() => toast({ title: "Map settings saved", description: "Client map settings have been updated." })}>
                Save Settings
              </Button>
              <Button variant="outline" onClick={() => { setMapMode(DEFAULT_MAP_MODE); toast({ title: "Map settings reset to default" }); }}>
                Reset to Default
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-5">
            <h2 className="font-heading text-lg font-semibold">Branding</h2>
            <div className="space-y-2">
              <Label>Agency Name</Label>
              <Input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Agency Logo</Label>
              <p className="text-xs text-muted-foreground">This logo is used for co-branding throughout the portal and in the client-facing app.</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold font-heading text-xl">
                  JT
                </div>
                <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" /> Upload New Logo</Button>
              </div>
            </div>
            <Button onClick={() => toast({ title: "Branding updated" })}>Save Branding</Button>
          </CardContent>
        </Card>

        {/* Agency-User Management */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Agency-User Management</h2>
              <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Agency-User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-heading">Add Agency-User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2"><Label>Name</Label><Input placeholder="Agent name" /></div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="agent@agency.com" /></div>
                    <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
                    <Button className="w-full" onClick={() => { setAddUserOpen(false); toast({ title: "Agency-user created" }); }}>
                      Create Agency-User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const isActive = user.status === "Active";
                  return (
                    <tr key={user.id} className={`border-b last:border-0 transition-colors ${i % 2 === 1 ? "bg-card" : ""}`}>
                      <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={isActive ? "default" : "secondary"} className="text-xs">{user.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)} aria-label="Edit user">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit user details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleStatus(user.id)}
                                  aria-label={isActive ? "Disable user" : "Enable user"}
                                >
                                  <Power className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{isActive ? "Disable account" : "Enable account"}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Edit Agency-User dialog */}
        <Dialog open={!!editingUser} onOpenChange={(v) => !v && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Edit Agency-User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </PortalLayout>
  );
}

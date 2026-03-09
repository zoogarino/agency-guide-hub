import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Eye, Edit, Ban, Save, Send, Search,
  LayoutDashboard, Building2, CreditCard, LogOut,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import pgnLogo from "@/assets/pgn-logo.png";

const mockAgencies = [
  { serial: 1, name: "Joker Travel", phone: "+32 2 123 4567", email: "info@jokertravel.be", status: "Active" },
  { serial: 2, name: "Desert Adventures", phone: "+264 61 234 567", email: "hello@desertadv.com", status: "Active" },
  { serial: 3, name: "Safari Kings", phone: "+44 20 7946 0958", email: "admin@safarikings.uk", status: "De-Activated" },
  { serial: 4, name: "Namibia Direct", phone: "+264 61 987 654", email: "ops@namibiadirect.com", status: "De-Active" },
];


function AdminSidebar({ section, setSection }: { section: string; setSection: (s: string) => void }) {
  const navigate = useNavigate();
  const items = [
    { label: "Agency Management", icon: Building2, key: "agencies" },
  ];
  return (
    <aside className="flex flex-col bg-sidebar text-sidebar-foreground w-[250px]">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img src={pgnLogo} alt="PGN" className="h-9 w-9 rounded-md object-cover" />
        <span className="font-heading text-sm font-bold text-sidebar-accent-foreground whitespace-nowrap">PGN Super Admin</span>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              section === item.key ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <button onClick={() => navigate("/")} className="flex w-full items-center gap-2 rounded-lg py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent transition-colors justify-center">
          <LogOut className="h-4 w-4" /><span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

function AgencyManagement() {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [tripSharing, setTripSharing] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [emailSharing, setEmailSharing] = useState(false);

  const statusColor = (s: string) => {
    if (s === "Active") return "default";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Agency Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all registered agencies</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add New Agency</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Add New Agency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Business Name</Label><Input placeholder="Agency name" /></div>
              <div className="space-y-2"><Label>Business Logo</Label><Input type="file" accept="image/*" /></div>
              <div className="space-y-2"><Label>Business Address</Label><Input placeholder="123 Main St" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Business Registration No.</Label><Input placeholder="REG-123456" /></div>
                <div className="space-y-2"><Label>Country</Label><Input placeholder="Belgium" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Phone (with country code)</Label><Input placeholder="+32 2 123 4567" /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="info@agency.com" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-heading text-sm font-semibold">Plan Assignment</h3>
                <div className="space-y-2">
                  <Label>Select Existing Plan</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Choose plan or configure manually" /></SelectTrigger>
                    <SelectContent>
                      {mockPlans.map((p) => <SelectItem key={p.name} value={p.name}>{p.name} — {p.price}</SelectItem>)}
                      <SelectItem value="manual">Configure Manual Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Plan Name</Label><Input placeholder="Custom Plan" /></div>
                  <div className="space-y-2"><Label>Amount (€)</Label><Input type="number" placeholder="199" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Cycle (days)</Label>
                    <Select defaultValue="30">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">365 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Start Date</Label><Input type="date" /></div>
                  <div className="space-y-2"><Label>Trip Limit</Label><Input type="number" placeholder="30" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Renewal Buffer Days</Label><Input type="number" placeholder="7" /></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Trip Sharing</Label>
                    <Switch checked={tripSharing} onCheckedChange={setTripSharing} />
                  </div>
                  {tripSharing && (
                    <div className="ml-4 space-y-3 border-l-2 border-primary/20 pl-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">WhatsApp</Label>
                        <Switch checked={whatsapp} onCheckedChange={setWhatsapp} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Email</Label>
                        <Switch checked={emailSharing} onCheckedChange={setEmailSharing} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={() => { setAddOpen(false); toast({ title: "Agency saved" }); }}>
                  <Save className="h-4 w-4 mr-2" /> Save
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => { setAddOpen(false); toast({ title: "Agency saved & credentials sent" }); }}>
                  <Send className="h-4 w-4 mr-2" /> Save & Send Credentials
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-6 py-3 font-medium">S/N</th>
                <th className="px-6 py-3 font-medium">Business Name</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Subscription Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockAgencies.map((a, i) => (
                <tr key={a.serial} className={`border-b last:border-0 transition-colors ${i % 2 === 1 ? "bg-card" : ""}`}>
                  <td className="px-6 py-4 text-sm">{a.serial}</td>
                  <td className="px-6 py-4 text-sm font-medium">{a.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{a.phone}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{a.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusColor(a.status)} className={`text-xs ${a.status === "De-Activated" ? "bg-destructive/10 text-destructive" : ""}`}>
                      {a.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Ban className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionPlans() {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState(false);
  const [emailMsg, setEmailMsg] = useState(false);
  const [customInvite, setCustomInvite] = useState(false);
  const [passwordLocked, setPasswordLocked] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage available subscription plans</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Plan</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Add Subscription Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Plan Name</Label><Input placeholder="Growth — 50 clients" /></div>
              <div className="space-y-2"><Label>Amount (€)</Label><Input type="number" placeholder="299" /></div>
              <div className="space-y-2">
                <Label>Subscription Type</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Custom Trip Limit</Label><Input type="number" placeholder="50" /></div>
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>WhatsApp Messaging</Label>
                    <p className="text-xs text-muted-foreground">Enable WhatsApp trip sharing</p>
                  </div>
                  <Switch checked={whatsappMsg} onCheckedChange={setWhatsappMsg} />
                </div>
                {whatsappMsg && (
                  <div className="ml-4 space-y-2">
                    <Label className="text-xs">Credit Limit</Label>
                    <Input type="number" placeholder="100" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Messaging</Label>
                    <p className="text-xs text-muted-foreground">Enable email trip sharing</p>
                  </div>
                  <Switch checked={emailMsg} onCheckedChange={setEmailMsg} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Custom Client Invitation</Label>
                    <p className="text-xs text-muted-foreground">Allow custom invitation messages</p>
                  </div>
                  <Switch checked={customInvite} onCheckedChange={setCustomInvite} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Password-Locked Web View</Label>
                    <p className="text-xs text-muted-foreground">Require password to view trips</p>
                  </div>
                  <Switch checked={passwordLocked} onCheckedChange={setPasswordLocked} />
                </div>
              </div>
              <Button className="w-full" onClick={() => { setAddOpen(false); toast({ title: "Plan created" }); }}>
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-6 py-3 font-medium">Plan Name</th>
                <th className="px-6 py-3 font-medium">Active Subscriptions</th>
                <th className="px-6 py-3 font-medium">Expired</th>
                <th className="px-6 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {mockPlans.map((plan, i) => (
                <tr key={plan.name} className={`border-b last:border-0 transition-colors ${i % 2 === 1 ? "bg-card" : ""}`}>
                  <td className="px-6 py-4 text-sm font-medium">{plan.name}</td>
                  <td className="px-6 py-4 text-sm">{plan.active}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{plan.expired}</td>
                  <td className="px-6 py-4 text-sm font-medium">{plan.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuperAdminPage() {
  const [section, setSection] = useState("agencies");

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar section={section} setSection={setSection} />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-3">
            <img src={pgnLogo} alt="PGN" className="h-8 w-8 rounded object-cover" />
            <span className="font-heading text-sm font-semibold">PGN Super Admin</span>
          </div>
        </header>
        <div className="p-8">
          <motion.div key={section} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {section === "agencies" ? <AgencyManagement /> : <SubscriptionPlans />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

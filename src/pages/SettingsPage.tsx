import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Edit, UserX, Plus, CreditCard } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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

  const usagePct = Math.round((subscription.customTripsUsed / subscription.customTripLimit) * 100);

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
                {mockAgencyUsers.map((user, i) => (
                  <tr key={user.id} className={`border-b last:border-0 transition-colors ${i % 2 === 1 ? "bg-card" : ""}`}>
                    <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.status === "Active" ? "default" : "secondary"} className="text-xs">{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Disable">
                          <UserX className="h-4 w-4 text-destructive" />
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
    </PortalLayout>
  );
}

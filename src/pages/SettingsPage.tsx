import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Edit, UserX, Plus } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const mockSubUsers = [
  { id: 1, name: "Jan Peeters", email: "jan@jokertravel.be", permission: "Edit", status: "Active" },
  { id: 2, name: "Sophie Claes", email: "sophie@jokertravel.be", permission: "View Only", status: "Active" },
  { id: 3, name: "Marc Willems", email: "marc@jokertravel.be", permission: "Edit", status: "Disabled" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [agencyName, setAgencyName] = useState("Joker Travel");
  const [addUserOpen, setAddUserOpen] = useState(false);

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your agency branding and team</p>
        </div>

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

        {/* Sub-User Management */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Sub-User Management</h2>
              <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Sub-User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-heading">Add Sub-User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2"><Label>Name</Label><Input placeholder="Agent name" /></div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="agent@agency.com" /></div>
                    <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
                    <div className="space-y-2">
                      <Label>Permission Level</Label>
                      <Select defaultValue="view">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View Only</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={() => { setAddUserOpen(false); toast({ title: "Sub-user created" }); }}>
                      Create Sub-User
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
                  <th className="px-4 py-3 font-medium">Permission</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockSubUsers.map((user, i) => (
                  <tr key={user.id} className={`border-b last:border-0 transition-colors ${i % 2 === 1 ? "bg-card" : ""}`}>
                    <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.permission === "Edit" ? "default" : "secondary"} className="text-xs">{user.permission}</Badge>
                    </td>
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

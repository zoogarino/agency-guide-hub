import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, CheckCircle, Eye } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const categories = ["Activities", "Accommodation", "Sites", "Support Namibia", "Support", "Emergencies"];

type PinStatus = "Pending" | "In Progress" | "Completed" | "Denied";

interface PinRequest {
  id: number;
  name: string;
  category: string;
  submitted: string;
  status: PinStatus;
  notes: string;
  coordinates: string;
  description: string;
  additionalNotes: string;
  submittedBy: string;
  email: string;
}

const mockRequests: PinRequest[] = [
  {
    id: 1,
    name: "Waterberg Plateau Viewpoint",
    category: "Sites",
    submitted: "2026-04-15",
    status: "Pending",
    notes: "—",
    coordinates: "-20.4928, 17.2712",
    description: "A scenic viewpoint atop the Waterberg Plateau offering panoramic views of the surrounding bushveld.",
    additionalNotes: "Best visited at sunrise. Access via guided hike only.",
    submittedBy: "Jane Smith",
    email: "agent@jokertravel.be",
  },
  {
    id: 2,
    name: "Spitzkoppe Rock Arch",
    category: "Sites",
    submitted: "2026-03-28",
    status: "Completed",
    notes: "Pin live in app since 2026-04-10.",
    coordinates: "-21.8333, 15.1833",
    description: "Iconic natural rock arch formation in the Spitzkoppe granite peaks.",
    additionalNotes: "Open daily. Entry fee applies.",
    submittedBy: "Jane Smith",
    email: "agent@jokertravel.be",
  },
  {
    id: 3,
    name: "Kolmanskop Private Tour Office",
    category: "Support",
    submitted: "2026-03-10",
    status: "Denied",
    notes: "Duplicate of existing pin — see 'Kolmanskop Visitor Centre' already in database.",
    coordinates: "-26.7050, 15.2306",
    description: "Office for booking private guided ghost-town tours of Kolmanskop.",
    additionalNotes: "Open 09:00–13:00.",
    submittedBy: "Jane Smith",
    email: "agent@jokertravel.be",
  },
];

const statusBadgeClass: Record<PinStatus, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30 hover:bg-warning/15",
  "In Progress": "bg-info/15 text-info border-info/30 hover:bg-info/15",
  Completed: "bg-primary/15 text-primary border-primary/30 hover:bg-primary/15",
  Denied: "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/15",
};

export default function RequestPinPage() {
  const [submitted, setSubmitted] = useState(false);
  const [viewing, setViewing] = useState<PinRequest | null>(null);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl space-y-8">
        {submitted ? (
          <div className="flex items-center justify-center py-12">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 max-w-md">
              <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="font-heading text-xl font-bold">Request Submitted</h2>
              <p className="text-sm text-muted-foreground">Thank you — we'll review your request and aim to add this pin within 2 business days.</p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another Request</Button>
            </motion.div>
          </div>
        ) : (
          <div className="max-w-xl space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold">Request a New Pin</h1>
              <p className="text-muted-foreground text-sm mt-1">Can't find a location in our database? Submit a request and our team will add it as soon as possible.</p>
            </div>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2"><Label>Location Name</Label><Input placeholder="e.g. Waterberg Plateau Viewpoint" /></div>
                  <div className="space-y-2">
                    <Label>Pin Category</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>GPS Coordinates or Address</Label><Input placeholder="e.g. -20.4928, 17.2712 or physical address" /></div>
                  <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Describe the location and what visitors can expect..." rows={3} /></div>
                  <div className="space-y-2"><Label>Additional Notes</Label><Textarea placeholder="Any extra details (opening hours, access info, etc.)" rows={2} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Your Name</Label><Input placeholder="Jane Smith" /></div>
                    <div className="space-y-2"><Label>Your Email</Label><Input type="email" defaultValue="agent@jokertravel.be" /></div>
                  </div>
                  <Button type="submit" className="w-full"><MapPin className="h-4 w-4 mr-2" />Submit Pin Request</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status tracker */}
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-xl font-bold">Your Pin Requests</h2>
            <p className="text-muted-foreground text-sm mt-1">Track the status of your submitted pin requests below.</p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Location Name</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Date Submitted</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Notes</th>
                    <th className="px-6 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockRequests.map((req, i) => (
                    <tr key={req.id} className={`border-b last:border-0 ${i % 2 === 1 ? "bg-card" : ""}`}>
                      <td className="px-6 py-4 text-sm font-medium">{req.name}</td>
                      <td className="px-6 py-4 text-sm">{req.category}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{req.submitted}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`text-xs ${statusBadgeClass[req.status]}`}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs">{req.notes}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setViewing(req)}>
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Detail dialog */}
        <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">{viewing?.name}</DialogTitle>
              <DialogDescription>Submitted {viewing?.submitted}</DialogDescription>
            </DialogHeader>
            {viewing && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={`text-xs ${statusBadgeClass[viewing.status]}`}>{viewing.status}</Badge>
                </div>
                <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{viewing.category}</span></div>
                <div><span className="text-muted-foreground">Coordinates / Address:</span> <span className="font-medium">{viewing.coordinates}</span></div>
                <div>
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p>{viewing.description}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Additional Notes</p>
                  <p>{viewing.additionalNotes}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Pocket Guide Namibia Notes</p>
                  <p>{viewing.notes}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">Submitted by {viewing.submittedBy} ({viewing.email})</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </PortalLayout>
  );
}

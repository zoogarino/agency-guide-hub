import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, CheckCircle } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const categories = ["Activities", "Accommodation", "Sites", "Support Namibia", "Support", "Emergencies"];

export default function RequestPinPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  if (submitted) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center py-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 max-w-md">
            <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="font-heading text-xl font-bold">Request Submitted</h2>
            <p className="text-sm text-muted-foreground">Thank you — we'll review your request and aim to add this pin within 2 business days.</p>
            <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another Request</Button>
          </motion.div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-6">
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
      </motion.div>
    </PortalLayout>
  );
}

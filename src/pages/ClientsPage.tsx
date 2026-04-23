import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Copy, Mail, Search, ExternalLink, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

import { mockClients, statusBadgeClass, resolveClientStatus } from "@/data/mockClients";

export default function ClientsPage() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dob, setDob] = useState<Date | undefined>();

  // Open the New Client sheet automatically when navigated with ?new=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "1") {
      setSheetOpen(true);
      // clean the query param so refreshes don't re-open
      navigate("/clients", { replace: true });
    }
  }, [location.search, navigate]);

  const filtered = mockClients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const id = Math.random().toString(36).substring(2, 10);
    setGeneratedLink(`app.pocketguide-namibia.com/share-trip/${id}`);
    toast({ title: "Client created" });
  };

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(`https://${link}`);
    toast({ title: "Link copied to clipboard" });
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
                <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="jane@example.com" /></div>
                <div className="space-y-2"><Label>Phone Number</Label><Input placeholder="+32 470 123 456" /></div>
                <div className="space-y-2"><Label>Country</Label><Input placeholder="Belgium" /></div>
                <p className="text-xs text-muted-foreground">
                  Account status is determined automatically once an "Active From" date is set in the Trip Builder.
                </p>
                <Button onClick={handleCreate} className="w-full">Create Client</Button>

                {generatedLink && (
                  <Card className="border-none">
                    <CardContent className="p-4 space-y-3">
                      <Label className="text-xs text-muted-foreground">Shareable Link</Label>
                      <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm font-mono break-all">
                        <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                        {generatedLink}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCopy(generatedLink)}>
                          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Link
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Mail className="h-3.5 w-3.5 mr-1.5" /> Send via Email
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The client will use this link to access the agency-branded version of the PGN app with their itinerary pre-loaded.
                      </p>
                    </CardContent>
                  </Card>
                )}
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
                  <th className="px-6 py-3 font-medium">App Access Link</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, i) => (
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
                      {(() => {
                        const al = client.accessLink;
                        if (!al) {
                          return <span className="text-xs text-muted-foreground">Not generated</span>;
                        }
                        if (al.activated) {
                          return (
                            <Badge variant="outline" className="text-xs bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
                              Active
                            </Badge>
                          );
                        }
                        return (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-warning/15 text-warning border-warning/30 hover:bg-warning/15">
                              Awaiting activation
                            </Badge>
                            <button
                              onClick={() => handleCopy(al.url.replace(/^https?:\/\//, ""))}
                              className="flex items-center gap-1 text-primary hover:underline text-xs"
                              title="Copy link"
                            >
                              <Copy className="h-3 w-3" /> Copy
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const status = resolveClientStatus(client);
                        return (
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
                        );
                      })()}
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

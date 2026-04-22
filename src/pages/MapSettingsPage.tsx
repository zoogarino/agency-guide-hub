import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hotel, Eye, Info } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type AccommodationMode = "show_all" | "custom";

const DEFAULT_MODE: AccommodationMode = "custom";

export default function MapSettingsPage() {
  const { toast } = useToast();
  const [mode, setMode] = useState<AccommodationMode>(DEFAULT_MODE);

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Client map settings have been updated." });
  };

  const handleReset = () => {
    setMode(DEFAULT_MODE);
    toast({ title: "Settings reset to default" });
  };

  const options: { value: AccommodationMode; label: string; desc: string; icon: React.ElementType }[] = [
    { value: "show_all", label: "Show All", desc: "Clients see all accommodation pins on the map.", icon: Eye },
    { value: "custom", label: "Custom Selection", desc: "Clients see only the specific accommodations you choose.", icon: Hotel },
  ];

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl font-bold">Client Map Settings – Pin Visibility</h1>
          <p className="text-muted-foreground text-sm mt-1">
            These settings control what your clients see on their map. They apply to all clients created under your account.
          </p>
        </div>

        {/* Accommodation card */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Hotel className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-heading text-lg font-semibold">Accommodation</h2>
            </div>

            {/* Radio options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt) => {
                const isActive = mode === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      isActive ? "border-primary bg-accent/40" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-2 ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <opt.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{opt.label}</span>
                        <div
                          className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isActive ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        >
                          {isActive && <div className="h-1 w-1 rounded-full bg-primary-foreground" />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom selection explanation */}
            <AnimatePresence>
              {mode === "custom" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
                    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground leading-relaxed">
                        When Custom Selection is active, each client will automatically see only the accommodation pins that are included as stops in their assigned trip. No manual configuration is needed — the map updates automatically based on each client's itinerary. Clients without an assigned trip will see no accommodation pins until a trip is assigned to their account.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSave}>Save Settings</Button>
          <Button variant="outline" onClick={handleReset}>Reset to Default</Button>
        </div>
      </motion.div>
    </PortalLayout>
  );
}

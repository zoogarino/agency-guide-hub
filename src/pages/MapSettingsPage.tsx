import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Hotel, MapPin, Landmark, HeadphonesIcon,
  Building2, ShieldAlert, Lock, ChevronDown, Eye, EyeOff,
} from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type PinMode = "show_all" | "hide_all" | "show_selected";

const mockDatabase: Record<string, string[]> = {
  accommodation: [
    "Namib Desert Lodge", "Okaukuejo Camp", "Sossusvlei Lodge", "Etosha Safari Camp",
    "Swakopmund Hotel", "Kalahari Red Dunes Lodge", "Skeleton Coast Camp",
    "Damaraland Camp", "Omaanda Lodge", "Zannier Hotels Sonop",
  ],
  activities: [
    "Sossusvlei Dune Climb", "Etosha Game Drive", "Sandwich Harbour Tour",
    "Swakopmund Skydiving", "Quad Biking Walvis Bay", "Kayak with Seals",
    "Fish River Canyon Hike", "Twyfelfontein Rock Engravings", "Cheetah Conservation Tour",
    "Sundowner Cruise Walvis Bay",
  ],
  sites: [
    "Deadvlei", "Spitzkoppe", "Twyfelfontein", "Kolmanskop Ghost Town",
    "Cape Cross Seal Reserve", "Brandberg White Lady", "Quiver Tree Forest",
    "Hoba Meteorite", "Petrified Forest", "Moon Landscape",
  ],
  support: [
    "PGN Office Windhoek", "PGN Office Swakopmund", "Tourism Info Centre Windhoek",
    "Tourism Info Centre Sossusvlei", "Roadside Assistance Hub Etosha",
    "Client Support Walvis Bay", "Partner Office Lüderitz",
  ],
  cities: [
    "Windhoek", "Swakopmund", "Walvis Bay", "Lüderitz", "Sossusvlei",
    "Etosha", "Keetmanshoop", "Otjiwarongo", "Rundu", "Katima Mulilo",
  ],
};

interface CategoryConfig {
  key: string;
  label: string;
  icon: React.ElementType;
  defaultMode: PinMode;
}

const categories: CategoryConfig[] = [
  { key: "accommodation", label: "Accommodation", icon: Hotel, defaultMode: "hide_all" },
  { key: "activities", label: "Activities", icon: MapPin, defaultMode: "show_all" },
  { key: "sites", label: "Sites", icon: Landmark, defaultMode: "show_all" },
  { key: "support", label: "Support", icon: HeadphonesIcon, defaultMode: "show_all" },
  { key: "cities", label: "Cities & Towns", icon: Building2, defaultMode: "show_all" },
];

function getStatusLabel(mode: PinMode, selectedCount: number): string {
  if (mode === "show_all") return "Show All";
  if (mode === "hide_all") return "Hide All";
  return `${selectedCount} Selected`;
}

function getStatusVariant(mode: PinMode): "default" | "secondary" | "outline" {
  if (mode === "show_all") return "default";
  if (mode === "hide_all") return "secondary";
  return "outline";
}

const modeOptions: { value: PinMode; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "show_all", label: "Show All", icon: Eye, desc: "Clients see all pins on the map." },
  { value: "hide_all", label: "Hide All", icon: EyeOff, desc: "No pins of this type are shown." },
  { value: "show_selected", label: "Show Selected Only", icon: MapPin, desc: "Only chosen pins are visible." },
];

export default function MapSettingsPage() {
  const { toast } = useToast();

  const defaultState = Object.fromEntries(
    categories.map((c) => [c.key, { mode: c.defaultMode, pins: [] as string[] }])
  );

  const [settings, setSettings] = useState<Record<string, { mode: PinMode; pins: string[] }>>(defaultState);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [searches, setSearches] = useState<Record<string, string>>({});

  const setMode = (key: string, mode: PinMode) => {
    setSettings((s) => ({ ...s, [key]: { ...s[key], mode } }));
  };

  const setPins = (key: string, pins: string[]) => {
    setSettings((s) => ({ ...s, [key]: { ...s[key], pins } }));
  };

  const toggleExpand = (key: string) => {
    setExpandedCard((prev) => (prev === key ? null : key));
  };

  const showAllCount = categories.filter((c) => settings[c.key]?.mode === "show_all").length;
  const selectedCount = categories.filter((c) => settings[c.key]?.mode === "show_selected").length;
  const hideAllCount = categories.filter((c) => settings[c.key]?.mode === "hide_all").length;

  const summaryParts: string[] = [];
  if (showAllCount > 0) summaryParts.push(`${showAllCount} of 5 categories showing all pins`);
  if (selectedCount > 0) summaryParts.push(`${selectedCount} ${selectedCount === 1 ? "category" : "categories"} using selected pins only`);
  if (hideAllCount > 0) summaryParts.push(`${hideAllCount} ${hideAllCount === 1 ? "category" : "categories"} hidden`);
  summaryParts.push("Emergencies always visible");

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Client map settings have been updated." });
  };

  const handleReset = () => {
    setSettings(
      Object.fromEntries(categories.map((c) => [c.key, { mode: c.defaultMode, pins: [] as string[] }]))
    );
    setExpandedCard(null);
    toast({ title: "Settings reset to default" });
  };

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl font-bold">Client Map Settings – Pin Visibility</h1>
          <p className="text-muted-foreground text-sm mt-1">
            These settings control what your clients see on their map. They apply to all clients created under your account.
          </p>
          <p className="text-muted-foreground/70 text-xs mt-2">
            {summaryParts.join(" · ")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const isExpanded = expandedCard === cat.key;
            const catSettings = settings[cat.key];
            const search = searches[cat.key] || "";
            const db = mockDatabase[cat.key] || [];
            const filtered = db.filter(
              (p) => p.toLowerCase().includes(search.toLowerCase()) && !catSettings.pins.includes(p)
            );

            return (
              <Card
                key={cat.key}
                className={`border transition-all ${
                  isExpanded ? "border-primary shadow-md md:col-span-2" : "border-border hover:border-primary/30 cursor-pointer"
                }`}
              >
                <CardContent className="p-0">
                  {/* Card header — always visible */}
                  <button
                    onClick={() => toggleExpand(cat.key)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <cat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold">{cat.label}</span>
                      <div className="mt-1">
                        <Badge variant={getStatusVariant(catSettings.mode)} className="text-[10px] px-2 py-0">
                          {getStatusLabel(catSettings.mode, catSettings.pins.length)}
                        </Badge>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t pt-4">
                          {/* Mode options */}
                          {modeOptions.map((m) => (
                            <button
                              key={m.value}
                              onClick={() => setMode(cat.key, m.value)}
                              className={`w-full flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                                catSettings.mode === m.value
                                  ? "border-primary bg-accent/50"
                                  : "border-border hover:border-primary/30"
                              }`}
                            >
                              <div
                                className={`rounded-lg p-1.5 ${
                                  catSettings.mode === m.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <m.icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium">{m.label}</span>
                                <p className="text-xs text-muted-foreground">{m.desc}</p>
                              </div>
                              <div
                                className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                                  catSettings.mode === m.value ? "border-primary bg-primary" : "border-muted-foreground"
                                }`}
                              >
                                {catSettings.mode === m.value && (
                                  <div className="h-1 w-1 rounded-full bg-primary-foreground" />
                                )}
                              </div>
                            </button>
                          ))}

                          {/* Whitelist interface */}
                          {catSettings.mode === "show_selected" && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="space-y-3 pt-2"
                            >
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder={`Search ${cat.label.toLowerCase()}...`}
                                  className="pl-9"
                                  value={search}
                                  onChange={(e) =>
                                    setSearches((s) => ({ ...s, [cat.key]: e.target.value }))
                                  }
                                />
                              </div>
                              {search && (
                                <div className="max-h-36 overflow-y-auto space-y-1 rounded-lg border p-2">
                                  {filtered.map((p) => (
                                    <button
                                      key={p}
                                      onClick={() => {
                                        setPins(cat.key, [...catSettings.pins, p]);
                                        setSearches((s) => ({ ...s, [cat.key]: "" }));
                                      }}
                                      className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                                    >
                                      <cat.icon className="h-3.5 w-3.5 text-primary" />
                                      {p}
                                    </button>
                                  ))}
                                  {filtered.length === 0 && (
                                    <p className="text-xs text-muted-foreground px-3 py-2">No results</p>
                                  )}
                                </div>
                              )}
                              {catSettings.pins.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {catSettings.pins.map((pin) => (
                                    <div
                                      key={pin}
                                      className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm"
                                    >
                                      <cat.icon className="h-3.5 w-3.5 text-primary" />
                                      <span>{pin}</span>
                                      <button
                                        onClick={() =>
                                          setPins(cat.key, catSettings.pins.filter((p) => p !== pin))
                                        }
                                        className="text-muted-foreground hover:text-destructive"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Only the pins listed here will be visible to your clients on their map.
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            );
          })}

          {/* Emergencies — Locked */}
          <Card className="border border-border bg-muted/30">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-muted p-2.5">
                  <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-muted-foreground">Emergencies</span>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-[10px] px-2 py-0">
                      Always Visible
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <p className="text-xs text-muted-foreground">
                  Emergency pins are always visible to your clients and cannot be hidden. This ensures client safety while traveling.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSave}>Save Settings</Button>
          <Button variant="outline" onClick={handleReset}>Reset to Default</Button>
        </div>
      </motion.div>
    </PortalLayout>
  );
}

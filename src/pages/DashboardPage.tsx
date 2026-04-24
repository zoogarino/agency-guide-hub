import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Map, MapPin, Plus, ArrowRight, ChevronDown, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { differenceInDays, parseISO, format, addDays } from "date-fns";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockClients, resolveClientStatus } from "@/data/mockClients";

const recentActivity = [
  { text: "New client account created for Sarah Miller", time: "2 hours ago", type: "client" },
  { text: "Credentials sent to John Doe", time: "5 hours ago", type: "trip" },
  { text: "Pin request submitted: Waterberg Plateau", time: "8 hours ago", type: "pin" },
  { text: "New client account created for Hans Weber", time: "1 day ago", type: "client" },
  { text: "Credentials sent to Marie Dupont", time: "1 day ago", type: "trip" },
  { text: "Pin request submitted: Fish River Canyon Viewpoint", time: "2 days ago", type: "pin" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [clientsExpanded, setClientsExpanded] = useState(false);

  const today = new Date();

  const outdatedClients = useMemo(() => {
    return mockClients.filter((c) => {
      if (!c.activeFrom || c.tripCompleted) return false;
      const days = differenceInDays(today, parseISO(c.activeFrom));
      return days > 150; // > 5 months
    });
  }, []);

  // Status breakdown across all clients
  const statusCounts = useMemo(() => {
    const counts = { Active: 0, Pending: 0, Expired: 0, Unscheduled: 0 } as Record<string, number>;
    mockClients.forEach((c) => {
      const s = resolveClientStatus(c);
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return counts;
  }, []);

  const totalClients = mockClients.length;

  // Active trips: clients with trips assigned & not Expired/Unscheduled
  const activeTripsCount = useMemo(
    () => mockClients.filter((c) => c.tripId && ["Active", "Pending"].includes(resolveClientStatus(c))).length,
    []
  );

  // "Starting soon" — clients whose Premium Unlock date (Active From - 7 days) falls in the next 14 days
  const startingSoonCount = useMemo(() => {
    return mockClients.filter((c) => {
      if (!c.activeFrom) return false;
      const unlock = addDays(parseISO(c.activeFrom), -7);
      const diff = differenceInDays(unlock, today);
      return diff >= 0 && diff <= 14;
    }).length;
  }, []);

  const stats = [
    {
      label: "Total Clients",
      value: String(totalClients),
      icon: Users,
      change: `+${Math.min(3, totalClients)} this week`,
      expandable: true,
    },
    {
      label: "Active Trips",
      value: String(activeTripsCount),
      icon: Map,
      change: startingSoonCount > 0 ? `${startingSoonCount} starting soon` : "No trips starting soon",
      expandable: false,
    },
    {
      label: "Pending Pin Requests",
      value: "3",
      icon: MapPin,
      change: "1 under review",
      expandable: false,
    },
  ];

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, Joker Travel</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`border-none shadow-sm ${stat.expandable ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
                onClick={stat.expandable ? () => setClientsExpanded((v) => !v) : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold font-heading mt-1">{stat.value}</p>
                      <p className="text-xs mt-2 text-primary">
                        {stat.change}
                      </p>
                    </div>
                    <div className="rounded-xl p-3 bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  {stat.expandable && (
                    <div className="mt-4 flex items-center justify-end text-xs text-muted-foreground">
                      <span className="mr-1">{clientsExpanded ? "Hide breakdown" : "Show breakdown"}</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${clientsExpanded ? "rotate-180" : ""}`} />
                    </div>
                  )}

                  <AnimatePresence>
                    {stat.expandable && clientsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Total Clients</span>
                            <span className="text-sm font-semibold">24</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Active Clients (premium)</span>
                            <span className="text-sm font-semibold">8</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            onClick={() => navigate("/clients?new=1")}
            className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Create New Client</p>
                <p className="text-xs text-muted-foreground">Set up a client account and assign a trip</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
          <Card
            onClick={() => navigate("/trip-manager?new=1")}
            className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Map className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Build a Trip</p>
                <p className="text-xs text-muted-foreground">Create a custom itinerary for your clients</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </div>

        {/* Attention Required */}
        {outdatedClients.length > 0 && (
          <div>
            <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Attention Required
            </h2>
            <Card className="border-warning/30 bg-warning/5 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <p className="text-sm">
                  The following clients have trip start dates that may be outdated. Please review and update their Active From date to avoid automatic premium expiry.
                </p>
                <ul className="divide-y divide-warning/20 rounded-md border border-warning/20 bg-background">
                  {outdatedClients.map((c) => (
                    <li key={c.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Active From: {c.activeFrom ? format(parseISO(c.activeFrom), "PP") : "—"}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/clients/${c.id}`)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Review Client →
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="font-heading text-lg font-semibold mb-4">Recent Activity</h2>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-6 py-4 ${
                    i < recentActivity.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        item.type === "client"
                          ? "bg-primary"
                          : item.type === "trip"
                          ? "bg-success"
                          : "bg-warning"
                      }`}
                    />
                    <p className="text-sm">{item.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{item.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </PortalLayout>
  );
}

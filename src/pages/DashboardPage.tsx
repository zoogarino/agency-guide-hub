import { motion } from "framer-motion";
import { Users, Map, MapPin, Plus, ArrowRight } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Total Clients", value: "24", icon: Users, change: "+3 this week", warning: false },
  { label: "Active Trips", value: "12", icon: Map, change: "2 starting soon", warning: false },
  { label: "Pending Pin Requests", value: "3", icon: MapPin, change: "1 under review", warning: false },
];

const recentActivity = [
  { text: "New client account created for Sarah Miller", time: "2 hours ago", type: "client" },
  { text: "Etosha Explorer trip shared with John Doe", time: "5 hours ago", type: "trip" },
  { text: "Pin request submitted: Waterberg Plateau", time: "8 hours ago", type: "pin" },
  { text: "New client account created for Hans Weber", time: "1 day ago", type: "client" },
  { text: "Skeleton Coast Adventure trip updated", time: "1 day ago", type: "trip" },
  { text: "Pin request submitted: Fish River Canyon Viewpoint", time: "2 days ago", type: "pin" },
];

export default function DashboardPage() {
  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, Joker Travel</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold font-heading mt-1">{stat.value}</p>
                      <p className={`text-xs mt-2 flex items-center gap-1 ${stat.warning ? "text-warning" : "text-primary"}`}>
                        {stat.warning && <AlertTriangle className="h-3 w-3" />}
                        {stat.change}
                      </p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.warning ? "bg-warning/10" : "bg-primary/10"}`}>
                      <stat.icon className={`h-5 w-5 ${stat.warning ? "text-warning" : "text-primary"}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
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
          <Card className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
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

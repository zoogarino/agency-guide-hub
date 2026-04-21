import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Map,
  Settings,
  MapPin,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Cog,
} from "lucide-react";
import pgnLogo from "@/assets/pgn-logo.png";
import agencyLogo from "@/assets/agency-logo.png";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Clients", icon: Users, path: "/clients" },
  { label: "Trip Manager", icon: Map, path: "/trip-manager" },
  { label: "Map Settings", icon: Settings, path: "/map-settings" },
  { label: "Request a Pin", icon: MapPin, path: "/request-pin" },
  { label: "Settings", icon: Cog, path: "/settings" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-[250px]"
        }`}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <img src={pgnLogo} alt="PGN" className="h-9 w-9 rounded-md object-cover shrink-0" />
          {!collapsed && (
            <span className="font-heading text-sm font-bold text-sidebar-accent-foreground whitespace-nowrap">
              Pocket Guide Namibia
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Agency logo placeholder */}
        <div className="px-4 pb-3 flex items-center justify-center">
          <img
            src={agencyLogo}
            alt="Agency logo"
            loading="lazy"
            width={collapsed ? 36 : 96}
            height={collapsed ? 36 : 96}
            className={`object-contain transition-all ${collapsed ? "h-9 w-9" : "h-20 w-20"}`}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          {!collapsed && (
            <div className="mb-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-primary shrink-0">
                JT
              </div>
              <div className="text-xs">
                <p className="font-medium text-sidebar-accent-foreground">Joker Travel</p>
                <p className="text-sidebar-foreground">Belgium</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-4">
            <img src={pgnLogo} alt="PGN" className="h-8 w-8 rounded object-cover" />
            <span className="text-muted-foreground text-sm">×</span>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                JT
              </div>
              <span className="font-heading text-sm font-semibold">Joker Travel</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

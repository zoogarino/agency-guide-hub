import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Eye, CreditCard } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "payasyougo",
    name: "Pay As You Go",
    price: "€40",
    unit: "per client activated",
    subtitle: "No minimum commitment, no monthly fee",
    description: "Perfect for agencies wanting to try PGN with their first clients before committing to a plan. Upgrade to any plan at any time.",
    badge: "Get Started",
    badgeVariant: "outline" as const,
    elevated: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "€35",
    unit: "per client activated",
    subtitle: "Minimum 10 clients (€350 to get started)",
    description: "Best for agencies with smaller Namibia client volumes who want a lower per-client rate in exchange for a minimum commitment.",
    badge: null,
    badgeVariant: "default" as const,
    elevated: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "€99 / €199 / €349",
    unit: "/month",
    subtitle: "Three sub-tiers based on active client volume — up to 10 / up to 30 / unlimited",
    description: "Best for agencies with consistent Namibia client volume who want predictable monthly billing.",
    badge: "Most Popular",
    badgeVariant: "default" as const,
    elevated: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "€49/mo + €15",
    unit: "per client",
    subtitle: "Base fee plus per-client activation",
    description: "Base fee keeps your portal and branding active year-round. Per-client fee scales with usage. Best for established agencies with moderate to high volume.",
    badge: "Best Value",
    badgeVariant: "secondary" as const,
    elevated: false,
  },
];

const transactions = [
  { serial: 1, plan: "Subscription (Growth) — 30 clients", date: "2026-02-01", amount: "€199.00" },
  { serial: 2, plan: "Subscription (Growth) — 30 clients", date: "2026-01-01", amount: "€199.00" },
  { serial: 3, plan: "Subscription (Growth) — 30 clients", date: "2025-12-01", amount: "€199.00" },
  { serial: 4, plan: "Subscription (Growth) — 10 clients", date: "2025-11-01", amount: "€99.00" },
];

export default function SubscriptionPage() {
  const { toast } = useToast();
  const [activePlan] = useState("growth");

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Subscription</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your plan and billing</p>
        </div>

        {/* Current Plan */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-bold font-heading">Subscription (Growth) — up to 30 clients</p>
                  <p className="text-xs text-muted-foreground mt-1">Renews on March 1, 2026 · €199/month</p>
                </div>
              </div>
              <Badge className="text-xs">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Plan Tiers */}
        <div>
          <h2 className="font-heading text-lg font-semibold mb-4">Available Plans</h2>
          <div className="grid grid-cols-4 gap-5">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`border-2 flex flex-col transition-all ${
                  plan.id === activePlan
                    ? "border-primary"
                    : "border-border hover:border-primary/30"
                } ${plan.elevated ? "shadow-lg relative -mt-2 mb-[-8px] z-10" : "shadow-sm"}`}
              >
                {plan.elevated && (
                  <div className="bg-primary text-primary-foreground text-center text-xs font-semibold py-2 rounded-t-[calc(var(--radius)-2px)]">
                    Recommended for most agencies
                  </div>
                )}
                <CardContent className={`p-5 space-y-4 flex flex-col flex-1 ${plan.elevated ? "" : "pt-5"}`}>
                  <div className="flex items-center gap-2">
                    {plan.badge && (
                      <Badge
                        variant={plan.badgeVariant}
                        className={
                          plan.badgeVariant === "secondary"
                            ? "bg-sidebar text-sidebar-foreground border-transparent text-xs"
                            : "text-xs"
                        }
                      >
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold font-heading">{plan.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">{plan.unit}</span>
                    </div>
                    <p className="text-xs font-medium text-foreground/70 mt-1">{plan.subtitle}</p>
                  </div>
                  <p className="text-xs text-muted-foreground flex-1">{plan.description}</p>
                  <Button
                    variant={plan.id === activePlan ? "default" : "outline"}
                    className="w-full mt-auto"
                    onClick={() =>
                      toast({
                        title:
                          plan.id === activePlan
                            ? "This is your current plan"
                            : "Plan selection saved",
                      })
                    }
                  >
                    {plan.id === activePlan ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => toast({ title: "Deactivation request submitted" })}>
            Deactivate Plan
          </Button>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="font-heading text-lg font-semibold mb-4">Transaction History</h2>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Serial No.</th>
                    <th className="px-6 py-3 font-medium">Plan Name</th>
                    <th className="px-6 py-3 font-medium">Payment Date</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <tr key={tx.serial} className={`border-b last:border-0 transition-colors ${i % 2 === 1 ? "bg-card" : ""}`}>
                      <td className="px-6 py-4 text-sm">{tx.serial}</td>
                      <td className="px-6 py-4 text-sm font-medium">{tx.plan}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{tx.date}</td>
                      <td className="px-6 py-4 text-sm font-medium">{tx.amount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Download Invoice">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </PortalLayout>
  );
}

import { User, Users, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type RecipientChoice = "primary" | "party" | "all";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  hasTravelParty: boolean;
  isResend: boolean;
  onSelect: (choice: RecipientChoice) => void;
}

export default function CredentialsRecipientModal({
  open, onOpenChange, hasTravelParty, isResend, onSelect,
}: Props) {
  const partyDisabled = !hasTravelParty;

  const options: {
    key: RecipientChoice;
    label: string;
    desc: string;
    icon: React.ElementType;
    disabled: boolean;
  }[] = [
    {
      key: "primary",
      label: "Email Primary Client Only",
      desc: "Send credentials to the primary client's email address only.",
      icon: User,
      disabled: false,
    },
    {
      key: "party",
      label: "Email Travel Party Only",
      desc: "Send credentials to all travel party members on this client's record.",
      icon: Users,
      disabled: partyDisabled,
    },
    {
      key: "all",
      label: "Email All",
      desc: "Send credentials to the primary client and every travel party member.",
      icon: MailCheck,
      disabled: partyDisabled,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isResend ? "Resend Credentials" : "Send Credentials"}</DialogTitle>
          <DialogDescription>Choose who should receive the credentials email.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <TooltipProvider>
            {options.map((o) => {
              const button = (
                <button
                  key={o.key}
                  onClick={() => !o.disabled && onSelect(o.key)}
                  disabled={o.disabled}
                  className={`w-full flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    o.disabled
                      ? "border-border bg-muted/40 opacity-60 cursor-not-allowed"
                      : "border-border hover:border-primary/40 hover:bg-accent/40"
                  }`}
                >
                  <div className="rounded-lg p-2 bg-primary/10 text-primary">
                    <o.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{o.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{o.desc}</p>
                  </div>
                </button>
              );

              if (o.disabled) {
                return (
                  <Tooltip key={o.key}>
                    <TooltipTrigger asChild>
                      <span className="block">{button}</span>
                    </TooltipTrigger>
                    <TooltipContent>No travel party members have been added to this client.</TooltipContent>
                  </Tooltip>
                );
              }
              return button;
            })}
          </TooltipProvider>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

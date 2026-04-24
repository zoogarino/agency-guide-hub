import { useState, useEffect, useMemo } from "react";
import { Mail, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recipientName: string;
  recipientEmail: string;
  isResend?: boolean;
  onSend: (note: string) => void;
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export default function CredentialsEmailModal({
  open, onOpenChange, recipientName, recipientEmail, isResend, onSend,
}: Props) {
  const { toast } = useToast();
  const [note, setNote] = useState("");
  // Regenerate password each time the modal opens
  const password = useMemo(() => generatePassword(), [open, recipientEmail]);

  useEffect(() => {
    if (!open) setNote("");
  }, [open]);

  const handleCopyPwd = () => {
    navigator.clipboard.writeText(password);
    toast({ title: "Password copied" });
  };

  const handleSend = () => {
    onSend(note.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {isResend ? "Resend Credentials Email" : "Send Credentials Email"}
          </DialogTitle>
          <DialogDescription>
            {isResend
              ? `Resend the login credentials to ${recipientName}. A new password will be generated.`
              : `Send login credentials and app access instructions to ${recipientName}.`}
          </DialogDescription>
        </DialogHeader>

        {/* Fixed Pocket Guide Namibia-controlled preview */}
        <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3 text-sm">
          <div className="border-b border-border pb-2 mb-2">
            <p className="font-heading font-bold text-primary">Pocket Guide Namibia</p>
            <p className="text-[11px] text-muted-foreground">no-reply@pocketguide-namibia.com → {recipientEmail}</p>
          </div>

          <p className="font-medium">Welcome to your Pocket Guide Namibia experience, {recipientName}!</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Your travel agency has set up your personal Pocket Guide Namibia app access. Use the credentials below to log in and unlock your premium itinerary, offline maps, and exclusive travel content.
          </p>

          <div className="rounded-md bg-background border border-border p-3 space-y-1.5">
            <div className="flex justify-between gap-2 text-xs">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-mono">{recipientEmail}</span>
            </div>
            <div className="flex justify-between gap-2 text-xs items-center">
              <span className="text-muted-foreground">Password:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono">{password}</span>
                <button onClick={handleCopyPwd} className="text-primary hover:text-primary/80" title="Copy password">
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Get the app:</p>
            <p>1. Download "Pocket Guide Namibia" from the App Store or Google Play.</p>
            <p>2. Log in with the credentials above.</p>
            <p>3. Your trip will be ready to explore.</p>
          </div>

          <p className="text-[10px] text-muted-foreground italic border-t border-border pt-2">
            This is an automated message from Pocket Guide Namibia. Please do not reply.
          </p>
        </div>

        {/* Optional personal note */}
        <div className="space-y-2">
          <Label htmlFor="agent-note" className="text-sm">
            Personal note from your travel consultant <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="agent-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a short personalized message for your client..."
            rows={3}
          />
          <p className="text-[11px] text-muted-foreground">
            If left blank, the email will send without a personal note.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend}>
            <Mail className="h-4 w-4 mr-1.5" /> Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

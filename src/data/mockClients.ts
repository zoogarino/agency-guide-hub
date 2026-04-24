import { addDays, addMonths, differenceInDays, isAfter } from "date-fns";

export type ClientStatus = "Pending" | "Active" | "Expired" | "Unscheduled";

export type CredentialsStatus = "Not Sent" | "Sent" | "Account Activated";

export interface CredentialsState {
  sentAt: string; // ISO datetime — most recent send
  resentCount?: number;
  activated: boolean;
}

// Legacy — retained for compatibility with any remaining references; no longer used in UI.
export interface AccessLink {
  url: string;
  generatedAt: string;
  activated: boolean;
}

export interface TravelPartyMember {
  id: string;
  name: string;
  email: string;
  credentials?: CredentialsState;
}

export interface MockClient {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  title: string;
  username: string;
  dob: string;
  email: string;
  phone: string;
  country: string;
  trip: string;
  tripId?: string;
  date: string;
  link: string; // legacy plain URL fallback
  accessLink?: AccessLink; // legacy
  credentials?: CredentialsState;
  activeFrom?: string;
  tripEndDate?: string;
  durationMonths?: 3 | 6 | 12;
  tripCompleted?: boolean;
  travelParty?: TravelPartyMember[];
}

export function resolveCredentialsStatus(c: { credentials?: CredentialsState }): CredentialsStatus {
  if (!c.credentials) return "Not Sent";
  if (c.credentials.activated) return "Account Activated";
  return "Sent";
}

export const credentialsBadgeClass: Record<CredentialsStatus, string> = {
  "Not Sent": "bg-muted text-muted-foreground border-border hover:bg-muted",
  "Sent": "bg-warning/15 text-warning border-warning/30 hover:bg-warning/15",
  "Account Activated": "bg-primary/15 text-primary border-primary/30 hover:bg-primary/15",
};

// Resolved status: includes derived state that depends on dates and the
// 6-month loophole rule (auto-suspend back to Unscheduled if Active From
// is more than 6 months in the past and the trip is not marked complete).
export function resolveClientStatus(client: {
  activeFrom?: string;
  tripEndDate?: string;
  durationMonths?: 3 | 6 | 12;
  tripCompleted?: boolean;
}): ClientStatus {
  if (!client.activeFrom) return "Unscheduled";

  const today = new Date();
  const activeFrom = new Date(client.activeFrom);

  // 6-month loophole: trip start more than 6 months ago and not completed → Unscheduled
  if (!client.tripCompleted && differenceInDays(today, activeFrom) > 183) {
    // Will only fall through to expiry calc if tripEndDate exists below
    const endDate = client.tripEndDate ? new Date(client.tripEndDate) : null;
    const expiry = endDate && client.durationMonths ? addMonths(endDate, client.durationMonths) : null;
    if (!expiry || isAfter(today, expiry)) {
      // If past expiry, expired wins; otherwise loophole suspension
      if (expiry && isAfter(today, expiry)) return "Expired";
      return "Unscheduled";
    }
  }

  const unlock = addDays(activeFrom, -7);
  const endDate = client.tripEndDate ? new Date(client.tripEndDate) : null;
  const expiry = endDate && client.durationMonths ? addMonths(endDate, client.durationMonths) : null;

  if (expiry && isAfter(today, expiry)) return "Expired";
  if (isAfter(today, unlock) || today.getTime() === unlock.getTime()) return "Active";
  return "Pending";
}

export const mockClients: MockClient[] = [
  // Active + Account Activated
  {
    id: 1, name: "Sarah Miller", firstName: "Sarah", lastName: "Miller",
    title: "Ms", username: "sarahm", dob: "1988-06-12",
    email: "sarah@example.com", phone: "+44 7700 900123", country: "United Kingdom",
    trip: "Sossusvlei Quick Escape (Sarah)", tripId: "trip-sossus-sarah", date: "2026-04-15",
    link: "",
    credentials: { sentAt: "2026-04-15T14:32:00Z", activated: true },
    activeFrom: "2026-04-25", tripEndDate: "2026-04-30", durationMonths: 6,
    travelParty: [{
      id: "tp1", name: "James Miller", email: "james@example.com",
      credentials: { sentAt: "2026-04-15T14:35:00Z", activated: false },
    }],
  },
  // Pending + Sent
  {
    id: 2, name: "John Doe", firstName: "John", lastName: "Doe",
    title: "Mr", username: "johnd", dob: "1979-11-03",
    email: "john@example.com", phone: "+1 415 555 0143", country: "United States",
    trip: "Etosha Explorer (John)", tripId: "trip-etosha-john", date: "2026-04-18",
    link: "",
    credentials: { sentAt: "2026-04-19T09:15:00Z", activated: false },
    activeFrom: "2026-05-20", tripEndDate: "2026-06-01", durationMonths: 3,
  },
  // Expired
  {
    id: 3, name: "Hans Weber", firstName: "Hans", lastName: "Weber",
    title: "Dr", username: "hansw", dob: "1965-03-22",
    email: "hans@example.com", phone: "+49 30 1234 5678", country: "Germany",
    trip: "Etosha Explorer (Hans)", tripId: "trip-etosha-hans", date: "2025-09-10",
    link: "",
    credentials: { sentAt: "2025-09-12T11:00:00Z", activated: true },
    activeFrom: "2025-09-20", tripEndDate: "2025-10-02", durationMonths: 3,
  },
  // Active (recent)
  {
    id: 4, name: "Marie Dupont", firstName: "Marie", lastName: "Dupont",
    title: "Mrs", username: "maried", dob: "1982-09-30",
    email: "marie@example.com", phone: "+33 6 12 34 56 78", country: "France",
    trip: "Sossusvlei Quick Escape (Marie)", tripId: "trip-sossus-marie", date: "2026-04-10",
    link: "",
    credentials: { sentAt: "2026-04-11T10:00:00Z", activated: false },
    activeFrom: "2026-04-22", tripEndDate: "2026-04-28", durationMonths: 12,
  },
  // Unscheduled — no trip yet
  {
    id: 5, name: "Tom Brown", firstName: "Tom", lastName: "Brown",
    title: "Mr", username: "tomb", dob: "1990-01-14",
    email: "tom@example.com", phone: "+44 7700 900456", country: "United Kingdom",
    trip: "—", date: "2026-04-21", link: "",
  },
  // Pending + Not Sent — most common state right after client creation
  {
    id: 6, name: "Anna Schmidt", firstName: "Anna", lastName: "Schmidt",
    title: "Ms", username: "annas", dob: "1985-04-08",
    email: "anna@example.com", phone: "+49 151 9876 5432", country: "Germany",
    trip: "Grand Namibia Expedition (Anna)", tripId: "trip-grand-anna", date: "2026-04-23",
    link: "",
    activeFrom: "2026-06-15", tripEndDate: "2026-07-06", durationMonths: 6,
  },
];

export const statusBadgeClass: Record<ClientStatus, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30 hover:bg-warning/15",
  Active: "bg-primary/15 text-primary border-primary/30 hover:bg-primary/15",
  Expired: "bg-muted text-muted-foreground border-border hover:bg-muted",
  Unscheduled: "bg-muted text-muted-foreground border-border hover:bg-muted",
};

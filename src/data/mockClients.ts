import { addDays, addMonths, differenceInDays, isAfter } from "date-fns";

export type ClientStatus = "Pending" | "Active" | "Expired" | "Unscheduled";

export interface AccessLink {
  url: string;
  generatedAt: string; // ISO datetime
  activated: boolean;
}

export interface TravelPartyMember {
  id: string;
  name: string;
  email: string;
  link?: AccessLink;
}

export interface MockClient {
  id: number;
  name: string;
  title: string;
  username: string;
  dob: string;
  email: string;
  phone: string;
  country: string;
  trip: string;
  tripId?: string;
  date: string;
  link: string;
  activeFrom?: string;
  tripEndDate?: string;
  durationMonths?: 3 | 6 | 12;
  tripCompleted?: boolean;
  travelParty?: TravelPartyMember[];
}

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
  {
    id: 1, name: "Sarah Miller", title: "Ms", username: "sarahm", dob: "1988-06-12",
    email: "sarah@example.com", phone: "+44 7700 900123", country: "United Kingdom",
    trip: "Etosha Explorer", tripId: "trip-etosha", date: "2026-02-20",
    link: "app.pocketguide-namibia.com/share-trip/abc123",
    activeFrom: "2026-04-25", tripEndDate: "2026-05-07", durationMonths: 6,
    travelParty: [{ id: "tp1", name: "James Miller", email: "james@example.com" }],
  },
  {
    id: 2, name: "John Doe", title: "Mr", username: "johnd", dob: "1979-11-03",
    email: "john@example.com", phone: "+1 415 555 0143", country: "United States",
    trip: "Skeleton Coast Adventure", tripId: "trip-skeleton", date: "2026-02-18",
    link: "app.pocketguide-namibia.com/share-trip/def456",
    activeFrom: "2026-05-10", tripEndDate: "2026-05-25", durationMonths: 3,
  },
  {
    id: 3, name: "Hans Weber", title: "Dr", username: "hansw", dob: "1965-03-22",
    email: "hans@example.com", phone: "+49 30 1234 5678", country: "Germany",
    trip: "Sossusvlei Dunes", tripId: "trip-sossus", date: "2025-07-15",
    link: "app.pocketguide-namibia.com/share-trip/ghi789",
    activeFrom: "2025-08-01", tripEndDate: "2025-08-14", durationMonths: 6,
  },
  {
    id: 4, name: "Marie Dupont", title: "Mrs", username: "maried", dob: "1982-09-30",
    email: "marie@example.com", phone: "+33 6 12 34 56 78", country: "France",
    trip: "Fish River Canyon", tripId: "trip-fish", date: "2025-10-10",
    link: "app.pocketguide-namibia.com/share-trip/jkl012",
    activeFrom: "2025-10-18", tripEndDate: "2025-10-30", durationMonths: 12,
  },
  {
    id: 5, name: "Tom Brown", title: "Mr", username: "tomb", dob: "1990-01-14",
    email: "tom@example.com", phone: "+44 7700 900456", country: "United Kingdom",
    trip: "—", date: "2026-02-08", link: "",
  },
];

export const statusBadgeClass: Record<ClientStatus, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30 hover:bg-warning/15",
  Active: "bg-primary/15 text-primary border-primary/30 hover:bg-primary/15",
  Expired: "bg-muted text-muted-foreground border-border hover:bg-muted",
  Unscheduled: "bg-muted text-muted-foreground border-border hover:bg-muted",
};

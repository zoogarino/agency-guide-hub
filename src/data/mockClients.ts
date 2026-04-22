export type ClientStatus = "Pending" | "Active" | "Expired" | "Unscheduled";

export interface MockClient {
  id: number;
  name: string;
  title: string;
  username: string;
  dob: string;
  email: string;
  phone: string;
  country: string;
  whatsappUsage: "Yes" | "No";
  trip: string;
  tripId?: string;
  date: string;
  link: string;
  status: ClientStatus;
  activeFrom?: string;
  durationMonths?: 3 | 6 | 12;
}

export const mockClients: MockClient[] = [
  {
    id: 1, name: "Sarah Miller", title: "Ms", username: "sarahm", dob: "1988-06-12",
    email: "sarah@example.com", phone: "+44 7700 900123", country: "United Kingdom", whatsappUsage: "Yes",
    trip: "Etosha Explorer", tripId: "trip-etosha", date: "2026-02-20",
    link: "app.pocketguide-namibia.com/share-trip/abc123", status: "Active",
    activeFrom: "2026-04-25", durationMonths: 6,
  },
  {
    id: 2, name: "John Doe", title: "Mr", username: "johnd", dob: "1979-11-03",
    email: "john@example.com", phone: "+1 415 555 0143", country: "United States", whatsappUsage: "No",
    trip: "Skeleton Coast Adventure", tripId: "trip-skeleton", date: "2026-02-18",
    link: "app.pocketguide-namibia.com/share-trip/def456", status: "Pending",
    activeFrom: "2026-05-10", durationMonths: 3,
  },
  {
    id: 3, name: "Hans Weber", title: "Dr", username: "hansw", dob: "1965-03-22",
    email: "hans@example.com", phone: "+49 30 1234 5678", country: "Germany", whatsappUsage: "Yes",
    trip: "Sossusvlei Dunes", tripId: "trip-sossus", date: "2026-02-15",
    link: "app.pocketguide-namibia.com/share-trip/ghi789", status: "Expired",
    activeFrom: "2025-08-01", durationMonths: 6,
  },
  {
    id: 4, name: "Marie Dupont", title: "Mrs", username: "maried", dob: "1982-09-30",
    email: "marie@example.com", phone: "+33 6 12 34 56 78", country: "France", whatsappUsage: "Yes",
    trip: "Fish River Canyon", tripId: "trip-fish", date: "2026-02-10",
    link: "app.pocketguide-namibia.com/share-trip/jkl012", status: "Active",
    activeFrom: "2026-04-18", durationMonths: 12,
  },
  {
    id: 5, name: "Tom Brown", title: "Mr", username: "tomb", dob: "1990-01-14",
    email: "tom@example.com", phone: "+44 7700 900456", country: "United Kingdom", whatsappUsage: "No",
    trip: "—", date: "2026-02-08", link: "", status: "Unscheduled",
  },
];

export const statusBadgeClass: Record<ClientStatus, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30 hover:bg-warning/15",
  Active: "bg-primary/15 text-primary border-primary/30 hover:bg-primary/15",
  Expired: "bg-muted text-muted-foreground border-border hover:bg-muted",
  Unscheduled: "bg-muted text-muted-foreground border-border hover:bg-muted",
};

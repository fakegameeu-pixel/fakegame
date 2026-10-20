export type UserRole = "admin" | "manager" | "guest";

export type Profile = {
  email: string;
  name: string;
  role: UserRole;
  eventId?: string;
  clientId?: string;
};

export type Guest = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  guestsCount: number;
  checkedIn: boolean;
  checkedInAt?: { toDate: () => Date };
};

export type WeddingEvent = { id: string; title: string; date?: string; location?: string; isActive?: boolean; guestAccessEnabled?: boolean; clientIds?: string[]; roleCount?: number; participantCount?: number };
export type Client = { id: string; name: string; email?: string; phone?: string; eventId?: string; eventIds?: string[]; source?: "invitation" | "manual" };
export type WeddingRole = { id: string; title: string; description?: string; gender: "male" | "female" | "any"; photoPath?: string; isActive?: boolean; eventId?: string };
export type Participant = { id: string; name: string; gender: "male" | "female"; photoPath?: string; roleId?: string; eventId?: string; clientId?: string };

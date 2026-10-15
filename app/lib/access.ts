export type UserRole = "admin" | "manager";

export type Profile = {
  email: string;
  name: string;
  role: UserRole;
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

export type WeddingRole = { id: string; title: string; description?: string; gender: "male" | "female" | "any"; isActive?: boolean };

export type Participant = { id: string; name: string; gender: "male" | "female"; photoPath: string; roleId: string };

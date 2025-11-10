
export enum UserRole {
  Admin = "Admin",
  Technician = "Technician",
  Supervisor = "Supervisor",
  HelpDesk = "Help Desk",
}
export type UserAvailability = 'Available' | 'On Leave';

export interface User {
  id: string; // This will be the document ID from Firestore
  uid: string; // This is the Firebase Auth user ID
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  availability: UserAvailability;
  persalNumber?: string;
  phoneNumber?: string;
  disabled?: boolean; // Add disabled flag
}

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Escalated' | 'Closed';

export enum TicketPriority {
    Low = "Low",
    Medium = "Medium",
    High = "High",
    Critical = "Critical"
}

export interface TicketSubmitter {
  persalNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  cellphone: string;
  jobTitle: string;
  location: string;
  district: string;
  facilityName: string;
}

export interface Ticket {
  id: string; // This will be the document ID from Firestore
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority?: TicketPriority;
  category: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  resolvedAt?: any; // Firestore Timestamp
  assignedToId?: string; // User document ID
  assignedById?: string; // User ID of who assigned it
  escalatedById?: string; // User ID of who escalated it
  loggedById?: string; // User document ID, if logged in
  submittedBy?: TicketSubmitter; // Details from public form
  escalationLevel: 'Technician' | 'Supervisor' | null;
  resolutionComment?: string;
  escalationReason?: string;
}

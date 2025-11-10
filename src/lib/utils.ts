
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// This function is no longer reliable as it uses static data.
// We will fetch users directly from Firestore in the components.
export function getUserById(id: string, users: User[]): User | undefined {
  if (!users) return undefined;
  return users.find(user => user.id === id);
}

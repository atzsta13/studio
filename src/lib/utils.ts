import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface TimeSlot {
  startTime?: string | null;
  endTime?: string | null;
}

export function areSlotsOverlapping(a: TimeSlot, b: TimeSlot): boolean {
  if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) return false;
  const startA = new Date(a.startTime).getTime();
  const endA = new Date(a.endTime).getTime();
  const startB = new Date(b.startTime).getTime();
  const endB = new Date(b.endTime).getTime();
  return startA < endB && startB < endA;
}

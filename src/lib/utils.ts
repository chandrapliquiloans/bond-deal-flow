import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Adds the specified number of working days (business days) to a given date.
 * Working days are Monday to Friday, excluding weekends.
 * @param date The starting date
 * @param days The number of working days to add
 * @returns The new date after adding the working days
 */
export function addWorkingDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    // Check if it's a weekday (Monday = 1, Tuesday = 2, ..., Friday = 5)
    if (result.getDay() >= 1 && result.getDay() <= 5) {
      addedDays++;
    }
  }

  return result;
}

/**
 * Returns true if the date is a working day (Monday–Friday).
 */
export function isWorkingDay(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * Returns the next working day (Mon–Fri) on or after the given date.
 */
export function nextWorkingDay(date: Date): Date {
  const result = new Date(date);
  while (!isWorkingDay(result)) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

/**
 * Formats a date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}


/**
 * Gets today's date in YYYY-MM-DD format in the current timezone
 * Uses Swedish locale format which produces YYYY-MM-DD
 */
export const getToday = (): string => {
  return new Date().toLocaleDateString('sv-SE');
};

/**
 * Ensures a date string is in the correct YYYY-MM-DD format expected by react-native-calendars
 * @param date - The date string to format
 * @param fallback - Optional fallback date (defaults to today)
 * @returns A properly formatted date string in YYYY-MM-DD format
 */
export const formatDate = (date: string, fallback?: string): string => {
  const defaultFallback = fallback || getToday();
  
  if (!date) return defaultFallback;
  
  // If date is already in YYYY-MM-DD format, return as is
  if (isValidDateFormat(date)) return date;
  
  // Otherwise, try to parse and format it
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return defaultFallback;
    return parsedDate.toLocaleDateString('sv-SE');
  } catch {
    return defaultFallback;
  }
};

/**
 * Validates if a string is in YYYY-MM-DD format
 * @param date - The date string to validate
 * @returns true if the date is in the correct format
 */
export const isValidDateFormat = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};


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

/**
 * Gets the day of the week for a date string in YYYY-MM-DD format
 * Handles timezone correctly by parsing the date in local timezone
 * @param dateString - The date string in YYYY-MM-DD format
 * @param locale - The locale for formatting (defaults to 'en-US')
 * @param options - Intl.DateTimeFormatOptions for formatting (defaults to { weekday: 'short' })
 * @returns The formatted day of the week string
 */
export const getDayOfWeek = (
  dateString: string, 
  locale: string = 'en-US', 
  options: Intl.DateTimeFormatOptions = { weekday: 'short' }
): string => {
  // Parse the date string in local timezone to avoid UTC midnight issues
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day); // month is 0-indexed
  return localDate.toLocaleDateString(locale, options);
};

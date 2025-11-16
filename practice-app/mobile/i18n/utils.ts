import i18n from './index';
export const getLocaleCode = (): string => {
  const language = i18n.language || 'en-US';
  
  const localeMap: Record<string, string> = {
    'en-US': 'en-US',
    'en': 'en-US',
    'tr-TR': 'tr-TR',
    'tr': 'tr-TR',
  };

  return localeMap[language] || 'en-US';
};

/**
 * Format a date according to the current locale
 * @param date - Date object or date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getLocaleCode();
  
  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Format a date with a standard format (short date)
 * Example: "15 Jan 2024" (en-US) or "15 Oca 2024" (tr-TR)
 */
export const formatDateShort = (date: Date | string): string => {
  return formatDate(date, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format a date with full date format
 * Example: "15 January 2024" (en-US) or "15 Ocak 2024" (tr-TR)
 */
export const formatDateLong = (date: Date | string): string => {
  return formatDate(date, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Format a date for display (default date format)
 * Example: "15/01/2024" (en-GB) or "15.01.2024" (tr-TR)
 */
export const formatDateDisplay = (date: Date | string): string => {
  const locale = getLocaleCode();
  // Use appropriate locale format (en-GB uses DD/MM/YYYY, tr-TR uses DD.MM.YYYY)
  const options: Intl.DateTimeFormatOptions = locale === 'tr-TR' 
    ? { day: '2-digit', month: '2-digit', year: 'numeric' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' };
  
  const formatted = formatDate(date, options);
  // Convert to DD.MM.YYYY for Turkish if needed
  if (locale === 'tr-TR') {
    return formatted.replace(/\//g, '.');
  }
  return formatted;
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 * This format is locale-independent
 */
export const formatDateInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


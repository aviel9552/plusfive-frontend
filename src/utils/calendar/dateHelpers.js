/**
 * Date helper functions for calendar operations
 */

/**
 * Format date to YYYY-MM-DD in LOCAL timezone (not UTC)
 * This prevents timezone shifts that cause dates to appear one day earlier
 */
export const formatDateLocal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display in calendar header
 */
export const formatDateDisplay = (date, locale = "he-IL") => {
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format date for booking label
 */
export const formatBookingDateLabel = (date, language) => {
  if (!date) return "";
  const locale = language === "he" ? "he-IL" : "en-US";
  // Ensure date is a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";
  // Use same format as calendar header (day view format)
  return dateObj.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Get start of week (Sunday)
 */
export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

/**
 * Add days to a date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if two dates are the same calendar day
 */
export const isSameCalendarDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() === d2.getTime();
};

/**
 * Convert date to date-only (remove time component)
 */
export const toDateOnly = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Check if date is within range
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  const d = toDateOnly(date).getTime();
  const s = toDateOnly(startDate).getTime();
  const e = toDateOnly(endDate).getTime();
  return d >= s && d <= e;
};

/**
 * Format header label based on view type
 */
export const formatHeaderLabel = (view, currentDate, weekStart, language) => {
  const locale = language === "he" ? "he-IL" : "en-US";

  if (view === "day") {
    return currentDate.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (view === "month") {
    return currentDate.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
  }

  // week
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(start.getDate() + 6);

  const startMonth = start.toLocaleDateString(locale, { month: "short" });
  const endMonth = end.toLocaleDateString(locale, { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();
  const endYear = end.getFullYear();

  if (startMonth === endMonth && year === endYear) {
    return `${startDay}-${endDay} ${startMonth} ${year}`;
  }

  return `${startDay} ${startMonth} ${year} - ${endDay} ${endMonth} ${endYear}`;
};

/**
 * Format day label (day name + day number)
 */
export const formatDayLabel = (date, language) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return { dayName: '', dayNum: '' };
  }
  const locale = language === "he" ? "he-IL" : "en-US";
  const dayName = date.toLocaleDateString(locale, { weekday: "short" });
  const dayNum = date.getDate();
  return { dayName, dayNum };
};


/**
 * Check if date is between two dates (inclusive)
 */
export const isBetweenInclusive = (day, start, end) => {
  if (!day || !start || !end) return false;
  const d = toDateOnly(day).getTime();
  const s = toDateOnly(start).getTime();
  const e = toDateOnly(end).getTime();
  const min = Math.min(s, e);
  const max = Math.max(s, e);
  return d >= min && d <= max;
};

/**
 * Check if date range covers a full month
 */
export const isFullMonthRange = (start, end) => {
  if (!start || !end) return false;
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Check if start is first day of month
  const firstDayIsFirst = startDate.getDate() === 1;
  
  // Check if end is last day of month
  const lastDay = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
  const lastDayIsLast = endDate.getDate() === lastDay.getDate();
  
  return firstDayIsFirst && lastDayIsLast;
};


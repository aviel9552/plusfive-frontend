/**
 * Time helper functions for calendar operations
 */

/**
 * Parse time string (HH:MM) to decimal hours
 * @param {string} time - Time string in format "HH:MM"
 * @returns {number} - Decimal hours (e.g., "13:30" -> 13.5)
 */
export const parseTime = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
};

/**
 * Format hour to time string
 * @param {number} hour - Hour (0-23)
 * @returns {string} - Time string in format "HH:00"
 */
export const formatHour = (hour) => `${hour.toString().padStart(2, "0")}:00`;

/**
 * Convert total minutes to time label
 * @param {number} totalMinutes - Total minutes
 * @returns {string} - Time string in format "HH:MM"
 */
export const minutesToLabel = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

/**
 * Generate time slots for a given range
 * @param {number} startHour - Start hour (0-23)
 * @param {number} endHour - End hour (0-23)
 * @param {number} intervalMinutes - Interval in minutes (default: 30)
 * @returns {string[]} - Array of time strings in format "HH:MM"
 */
export const generateTimeSlots = (startHour = 10, endHour = 20, intervalMinutes = 30) => {
  const slots = [];
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  for (let minute = startMinutes; minute < endMinutes; minute += intervalMinutes) {
    const startLabel = minutesToLabel(minute);
    // For 5-minute intervals, return just the start time (e.g., "10:00")
    // For larger intervals, return a range (e.g., "10:00-10:30")
    if (intervalMinutes <= 5) {
      slots.push(startLabel);
    } else {
      const endLabel = minutesToLabel(minute + intervalMinutes);
      slots.push(`${startLabel}-${endLabel}`);
    }
  }

  return slots;
};

/**
 * Parse service duration string (e.g., "45 דק'" or "60 דק'") to minutes
 * @param {string} durationStr - Duration string
 * @returns {number} - Duration in minutes
 */
export const parseServiceDuration = (durationStr) => {
  if (!durationStr) return 30; // Default to 30 minutes if no duration
  // Extract number from string like "45 דק'" -> 45
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
};

/**
 * Calculate end time from start time and duration in minutes
 * @param {string} startTime - Start time in format "HH:MM"
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} - End time in format "HH:MM"
 */
export const calculateEndTime = (startTime, durationMinutes) => {
  const [h, m] = startTime.split(":").map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
};

/**
 * Check if two time ranges overlap
 * Returns true if [start1, end1) overlaps with [start2, end2)
 * @param {string} start1 - Start time of first range
 * @param {string} end1 - End time of first range
 * @param {string} start2 - Start time of second range
 * @param {string} end2 - End time of second range
 * @returns {boolean} - True if ranges overlap
 */
export const timeRangesOverlap = (start1, end1, start2, end2) => {
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);
  // Two ranges overlap if: start1 < end2 AND start2 < end1
  return s1 < e2 && s2 < e1;
};

/**
 * SINGLE SOURCE OF TRUTH: Extract the exact start time from bookingSelectedTime
 * This function ensures we use the EXACT value stored in bookingSelectedTime without any modification
 * Input: bookingSelectedTime (can be "13:05" or "10:00-10:30")
 * Output: The exact start time string (e.g., "13:05")
 * CRITICAL: This is the ONLY place where we extract/process the time - use this everywhere
 * CRITICAL: NO rounding, NO adjustment, NO recalculation - use the stored value exactly as-is
 */
export const getExactStartTime = (bookingSelectedTime) => {
  if (!bookingSelectedTime) {
    return "00:00"; // Fallback only if time is not set
  }
  
  // CRITICAL: For single time format (e.g., "13:05"), return it EXACTLY as-is without any processing
  // This is the most common case when clicking on calendar slots
  if (typeof bookingSelectedTime === "string" && bookingSelectedTime.includes(":") && !bookingSelectedTime.includes("-")) {
    // Return the exact value - no String() conversion, no trimming, no modification
    // This ensures "13:05" stays exactly "13:05"
    return bookingSelectedTime;
  }
  
  // Convert to string if not already (for edge cases)
  const timeStr = String(bookingSelectedTime);
  
  // If it's a range (format "HH:MM-HH:MM"), extract ONLY the start part
  if (timeStr.includes("-")) {
    // Split on "-" and take the first part (start time)
    // CRITICAL: Only trim whitespace from the split result, don't modify the time itself
    const startPart = timeStr.split("-")[0].trim();
    return startPart; // Should be in "HH:MM" format
  }
  
  // Fallback: return as string (should rarely reach here for booking flow)
  return timeStr;
};


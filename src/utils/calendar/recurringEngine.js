/**
 * Recurring appointment engine
 * Handles calculation and validation of recurring appointment dates
 */

import { formatDateLocal } from './dateHelpers';
import { timeRangesOverlap } from './timeHelpers';

/**
 * Calculate recurring appointment dates based on service type and duration
 * Duration Period defines TOTAL number of appointments to create, not end date
 * 
 * @param {Date|string} startDate - Start date for recurring appointments
 * @param {string} serviceType - Type of recurrence (e.g., "Every Day", "Every Week", "Regular Appointment")
 * @param {string} duration - Duration period (e.g., "1 Week", "2 Months", "1 Year")
 * @returns {Date[]} - Array of dates for recurring appointments
 */
export const calculateRecurringDates = (startDate, serviceType, duration) => {
  const dates = [];
  // CRITICAL: Parse the date correctly to avoid timezone issues
  // If startDate is a string in YYYY-MM-DD format, create date in local timezone
  let start;
  if (typeof startDate === 'string' && startDate.includes('-')) {
    // Parse YYYY-MM-DD format correctly in local timezone
    const [year, month, day] = startDate.split('-').map(Number);
    start = new Date(year, month - 1, day, 0, 0, 0, 0); // month is 0-indexed, local timezone
  } else {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
  }
  
  // If Regular Appointment, return only the start date
  if (serviceType === "Regular Appointment") {
    return [start];
  }
  
  /**
   * UNIVERSAL FORMULA FOR RECURRING APPOINTMENTS
   * 
   * For day-based calculations (Every Day, Every Week, Every X Days):
   * - Formula: totalAppointments = (totalDurationInDays / intervalDays) + 1
   * - Constants: Week = 7 days
   * 
   * For month-based calculations (Every Month, Every X Months):
   * - Uses calendar months to preserve day of month (e.g., 15.1 -> 15.2 -> 15.3)
   * - Formula: totalAppointments = (totalDurationInMonths / monthInterval) + 1
   * - Example: "Every Month" for "2 Months" duration = 3 appointments (start + 2 more)
   * 
   * Steps:
   * 1. Determine if calculation is month-based or day-based
   * 2. Calculate total appointments based on duration period
   * 3. Generate dates using appropriate method (setMonth for months, setDate for days)
   */

  // Step 1: Determine if we're using month-based calculation or day-based calculation
  // Month-based: "Every Month", "Every 2 Months", etc. - uses setMonth() to preserve day of month
  // Day-based: "Every Day", "Every Week", "Every 2 Days", etc. - uses setDate() to add days
  let isMonthBased = false;
  let monthInterval = 0; // For month-based calculations
  let intervalDays = 0; // For day-based calculations
  
  if (serviceType === "Regular Appointment") {
    intervalDays = 0; // Will be handled separately
  } else if (serviceType === "Every Day") {
    intervalDays = 1;
  } else if (serviceType === "Every Week") {
    intervalDays = 7; // Week = 7 days
  } else if (serviceType === "Every Month") {
    isMonthBased = true;
    monthInterval = 1;
  } else if (serviceType.startsWith("Every ")) {
    // Parse patterns like "Every 2 Days", "Every 3 Weeks", "Every 4 Months"
    const match = serviceType.match(/Every\s+(\d+)\s*(Day|Week|Month|Days|Weeks|Months)/i);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase().replace(/s$/, ''); // Remove plural 's'
      
      if (unit === "day") {
        intervalDays = amount;
      } else if (unit === "week") {
        intervalDays = amount * 7; // Week = 7 days
      } else if (unit === "month") {
        isMonthBased = true;
        monthInterval = amount;
      }
    }
  }

  // Step 2: Calculate total duration and total appointments
  let totalAppointments = 1; // Default to 1 if calculation fails
  
  if (isMonthBased) {
    // For month-based calculations, calculate based on months
    const durationMatch = duration.match(/(\d+(?:\.\d+)?)\s*(Week|Month|Year|Weeks|Months|Years)/i);
    if (durationMatch) {
      const amount = parseFloat(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase().replace(/s$/, ''); // Remove plural 's'
      
      if (unit === "month") {
        // If duration is in months and service type is monthly, calculate directly
        totalAppointments = Math.floor(amount / monthInterval) + 1;
      } else if (unit === "year") {
        // If duration is in years, convert to months (12 months per year)
        totalAppointments = Math.floor((amount * 12) / monthInterval) + 1;
      } else if (unit === "week") {
        // If duration is in weeks, convert to months (approximately 4.33 weeks per month)
        // But for simplicity, we'll use 4 weeks = 1 month
        totalAppointments = Math.floor((amount / 4) / monthInterval) + 1;
      }
    }
  } else {
    // For day-based calculations, use the original formula
    let totalDurationInDays = 0;
    
    const durationMatch = duration.match(/(\d+(?:\.\d+)?)\s*(Week|Month|Year|Weeks|Months|Years)/i);
    if (durationMatch) {
      const amount = parseFloat(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase().replace(/s$/, ''); // Remove plural 's'
      
      if (unit === "week") {
        totalDurationInDays = amount * 7; // Week = 7 days
      } else if (unit === "month") {
        totalDurationInDays = amount * 28; // Month = 28 days (for day-based calculations)
      } else if (unit === "year") {
        totalDurationInDays = amount * 365; // Year = 365 days
      }
    }
    
    if (intervalDays > 0 && totalDurationInDays > 0) {
      // Use Math.floor to ensure we don't exceed the duration period
      // Then add 1 for the first appointment
      totalAppointments = Math.floor(totalDurationInDays / intervalDays) + 1;
    }
  }
  
  if (serviceType === "Regular Appointment") {
    totalAppointments = 1; // Single appointment
  }
  
  // DEBUG: Log the calculation
  console.log("[calculateRecurringDates] Input:", { serviceType, duration, startDate });
  console.log("[calculateRecurringDates] Calculated:", { totalAppointments, intervalDays });
  
  // Generate appointments: first one at start date, then add interval for each subsequent appointment
  // CRITICAL: The first appointment MUST be exactly on the selected date - no shifting, no timezone issues
  // Always add the first date as-is (the exact selected date)
  const firstDate = new Date(start);
  dates.push(firstDate);
  
  // DEBUG: Verify first date matches selected date (using LOCAL timezone format)
  const firstDateIso = formatDateLocal(firstDate);
  const startDateIso = typeof startDate === 'string' ? startDate : formatDateLocal(new Date(startDate));
  console.log("[calculateRecurringDates] First appointment date:", {
    selectedDate: startDateIso,
    firstAppointmentDate: firstDateIso,
    match: firstDateIso === startDateIso
  });
  
  // Then generate subsequent appointments by adding intervals
  if (totalAppointments > 1) {
    const current = new Date(start);
    // Start from i=1 because we already added the first appointment
    for (let i = 1; i < totalAppointments; i++) {
      if (isMonthBased) {
        // For month-based: add months to preserve day of month (e.g., 15.1 -> 15.2 -> 15.3)
        const originalDay = current.getDate();
        current.setMonth(current.getMonth() + monthInterval);
        
        // Handle edge case: if the day doesn't exist in the new month (e.g., 31 Jan -> Feb)
        // JavaScript automatically adjusts, but we want to ensure we don't skip months
        // If the day changed, it means we went to a month with fewer days
        // In that case, we keep the adjusted date (e.g., 31 Jan -> 28/29 Feb -> 31 Mar)
        // This is the expected behavior for monthly appointments
      } else {
        // For day-based: add days
        current.setDate(current.getDate() + intervalDays);
      }
      
      // CRITICAL: Ensure we never go backward - only add dates that are >= start date
      if (current.getTime() >= start.getTime()) {
        dates.push(new Date(current));
      }
    }
  }
  
  // DEBUG: Log the generated dates (using LOCAL timezone format)
  console.log("[calculateRecurringDates] Generated dates:", {
    count: dates.length,
    dates: dates.map(d => formatDateLocal(d)),
    intervalDays,
    firstDate: dates[0] ? formatDateLocal(dates[0]) : null,
    selectedDate: startDateIso
  });
  
  return dates;
};

/**
 * Check if a date is a non-working day for a specific service
 * Checks if the service is available on this day based on availableDays
 * 
 * @param {Date} date - Date to check
 * @param {Object} service - Service object with availableDays property
 * @returns {boolean} - True if the date is a non-working day for this service
 */
const isNonWorkingDay = (date, service = null) => {
  // If service is provided, check availableDays
  if (service && service.availableDays !== undefined && service.availableDays !== null) {
    const DAYS_OF_WEEK = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];
    const dayOfWeek = date.getDay();
    // JavaScript day: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    // Hebrew array:   0=א' (Sunday), 1=ב' (Monday), 2=ג' (Tuesday), 3=ד' (Wednesday), 4=ה' (Thursday), 5=ו' (Friday), 6=ש' (Saturday)
    // So the mapping is direct: dayIndex = dayOfWeek
    const dayIndex = dayOfWeek;
    const dayKey = DAYS_OF_WEEK[dayIndex];
    
    // If availableDays is an empty array, all days are unavailable
    if (Array.isArray(service.availableDays) && service.availableDays.length === 0) {
      return true; // Service is not available on any day
    }
    
    // Check if this day is in the availableDays array
    if (Array.isArray(service.availableDays)) {
      return !service.availableDays.includes(dayKey);
    }
    
    // If availableDays is not an array, default to all days available
    return false;
  }
  
  // If no service provided or availableDays is undefined/null, default to all days available
  // (Don't block based on day of week - let the service settings control this)
  return false;
};

/**
 * Check if a staff member is not working on a specific date
 * 
 * @param {string} staffId - Staff member ID
 * @param {Date} date - Date to check
 * @param {Array} staffDayCalendars - Array of staff members from localStorage
 * @returns {boolean} - True if the staff member is not working on this date
 */
const isStaffNotWorking = (staffId, date, staffDayCalendars = []) => {
  const staff = staffDayCalendars.find(s => s.id === staffId);
  if (!staff) {
    return true; // If staff not found, consider them not working
  }
  
  // Check working hours for the specific date
  if (staff.workingHours) {
    const dayNames = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Convert Sunday=0 to Sunday=6
    const dayKey = dayNames[dayIndex];
    const dayHours = staff.workingHours[dayKey] || {};
    const isActive = dayHours.active !== false; // Default to true
    
    if (!isActive) {
      return true; // Staff is not active on this day
    }
  }
  
  // Check if staff status is "offline" or "not-working"
  if (staff.status === "offline" || staff.status === "not-working") {
    return true;
  }
  
  return false;
};

/**
 * UNIVERSAL CONFLICT DETECTION FORMULA FOR RECURRING APPOINTMENTS
 * 
 * This function works with ANY combination of service type and duration period.
 * 
 * Formula:
 * 1. Calculate all recurring dates using calculateRecurringDates()
 * 2. For each date, check if:
 *    - Business is closed (non-working day)
 *    - Staff member is not working
 *    - There's an existing appointment conflict (same staff, same date, overlapping time)
 * 
 * @param {Date|string} startDate - Start date for recurring appointments
 * @param {string} serviceType - Type of recurrence (e.g., "Every Day", "Every Week", "Every 3 Days", etc.)
 * @param {string} duration - Duration period (e.g., "1 Week", "2 Months", "1 Year", etc.)
 * @param {Object[]} existingAppointments - Array of existing appointments to check against
 * @param {string} timeStr - Start time for the appointments (e.g., "17:00")
 * @param {string} endTimeStr - End time for the appointments (e.g., "18:00")
 * @param {string} staffId - Staff member ID
 * @param {string} firstSelectedDateIso - First selected date (to skip dates before it)
 * @param {Array} staffDayCalendars - Array of staff members from localStorage
 * @param {Object} service - Service object with availableDays, earliestBookingTime, latestBookingTime
 * @returns {Object|null} - First conflicting appointment with date info, or null if no conflicts
 */
export const checkRecurringConflicts = (
  startDate,
  serviceType,
  duration,
  existingAppointments,
  timeStr,
  endTimeStr,
  staffId,
  firstSelectedDateIso = null,
  staffDayCalendars = [],
  service = null
) => {
  // Step 1: Calculate all recurring dates using the universal formula
  const recurringDates = calculateRecurringDates(startDate, serviceType, duration);
  
  // Step 2: Get current date and time for filtering past appointments
  const now = new Date();
  const currentDateIso = formatDateLocal(now);
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Step 3: Filter to get ALL future events (from today forward) for conflict checking
  const relevantEvents = existingAppointments.filter((event) => {
    // Only consider events from today forward (future appointments)
    if (event.date < currentDateIso) {
      return false; // Past appointments - ignore
    }
    
    // If the event is today, check if it's already ended
    if (event.date === currentDateIso) {
      const [eventEndHour, eventEndMinute] = event.end.split(':').map(Number);
      const [currentHour, currentMinute] = currentTimeStr.split(':').map(Number);
      const eventEndTimeMinutes = eventEndHour * 60 + eventEndMinute;
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      
      // If the event END time is in the past, the appointment has already ended - ignore it
      if (eventEndTimeMinutes <= currentTimeMinutes) {
        return false;
      }
    }
    
    return true; // This is a future appointment - include it in conflict check
  });
  
  // Step 4: Check each recurring date for conflicts
  // This works for ANY combination: Every 3 Days for 1 Year, Every Week for 2 Months, etc.
  for (const appointmentDate of recurringDates) {
    const appointmentDateIso = formatDateLocal(appointmentDate);
    
    // Skip dates before first selected date (if provided)
    if (firstSelectedDateIso && appointmentDateIso < firstSelectedDateIso) {
      continue;
    }
    
    // Skip past dates
    if (appointmentDateIso < currentDateIso) {
      continue;
    }
    
    // Check if service is available on this date (based on availableDays)
    if (isNonWorkingDay(appointmentDate, service)) {
      return {
        conflictingEvent: {
          client: "העסק לא פעיל",
          clientName: "העסק לא פעיל",
          start: timeStr,
          end: endTimeStr,
        },
        date: appointmentDateIso,
        reason: "non-working-day",
      };
    }
    
    // Check if staff member is not working on this date
    if (isStaffNotWorking(staffId, appointmentDate, staffDayCalendars)) {
      const staff = staffDayCalendars.find(s => s.id === staffId);
      const staffName = staff?.name || "עובד";
      return {
        conflictingEvent: {
          client: `${staffName} לא פעיל`,
          clientName: `${staffName} לא פעיל`,
          start: timeStr,
          end: endTimeStr,
        },
        date: appointmentDateIso,
        reason: "staff-not-working",
      };
    }
    
    // Check for conflicts with existing appointments on this specific date
    const conflictingEvent = relevantEvents.find((event) => {
      // Must be same staff member and same date
      if (event.staff !== staffId || event.date !== appointmentDateIso) {
        return false;
      }
      
      // Check if time ranges overlap
      return timeRangesOverlap(timeStr, endTimeStr, event.start, event.end);
    });
    
    // If conflict found, return immediately with conflict details
    if (conflictingEvent) {
      return {
        conflictingEvent,
        date: appointmentDateIso,
        reason: "appointment-conflict",
      };
    }
  }
  
  // No conflicts found
  return null;
};

/**
 * Validate recurring dates against existing appointments
 * @param {Date[]} recurringDates - Array of dates to validate
 * @param {Object[]} existingAppointments - Array of existing appointments
 * @param {string} timeStr - Start time for the appointments
 * @param {string} endTimeStr - End time for the appointments
 * @param {string} staffId - Staff member ID
 * @returns {Object|null} - First conflicting appointment or null
 */
export const validateRecurringDates = (recurringDates, existingAppointments, timeStr, endTimeStr, staffId) => {
  const now = new Date();
  const currentDateIso = now.toISOString().slice(0, 10);
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Filter to get ALL future events (from today forward) for conflict checking
  const relevantEvents = existingAppointments.filter((event) => {
    // Only consider events from today forward (future appointments)
    if (event.date < currentDateIso) {
      return false; // Past appointments - ignore
    }
    
    // If the event is today, check if it's already ended
    if (event.date === currentDateIso) {
      const [eventEndHour, eventEndMinute] = event.end.split(':').map(Number);
      const [currentHour, currentMinute] = currentTimeStr.split(':').map(Number);
      const eventEndTimeMinutes = eventEndHour * 60 + eventEndMinute;
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      
      // If the event END time is in the past, the appointment has already ended - ignore it
      if (eventEndTimeMinutes <= currentTimeMinutes) {
        return false;
      }
    }
    
    return true; // This is a future appointment - include it in conflict check
  });
  
  // Check each recurring date for conflicts
  for (const appointmentDate of recurringDates) {
    const appointmentDateIso = formatDateLocal(appointmentDate);
    
    // Skip past dates
    if (appointmentDateIso < currentDateIso) {
      continue;
    }
    
    // Check for conflicts on this date
    const conflictingEvent = relevantEvents.find((event) => {
      // Only check events for the same staff member and same date
      if (event.staff !== staffId || event.date !== appointmentDateIso) {
        return false;
      }
      
      // Check if time ranges overlap
      return timeRangesOverlap(timeStr, endTimeStr, event.start, event.end);
    });
    
    if (conflictingEvent) {
      return {
        conflictingEvent,
        date: appointmentDateIso,
      };
    }
  }
  
  return null; // No conflicts found
};


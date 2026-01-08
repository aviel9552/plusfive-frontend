/**
 * Conflict detection utilities for calendar appointments
 */

import { parseTime, timeRangesOverlap } from './timeHelpers';
import { formatDateLocal } from './dateHelpers';

/**
 * Check if a time range overlaps with an existing appointment
 * @param {Object[]} events - Array of all events
 * @param {string} dateIso - Date in ISO format (YYYY-MM-DD)
 * @param {string} staffId - Staff member ID
 * @param {string} startTime - Start time in format "HH:MM"
 * @param {string} endTime - End time in format "HH:MM"
 * @param {string|null} excludeEventId - Event ID to exclude from check (for updates)
 * @returns {boolean} - True if there's an overlap
 */
export const checkTimeOverlap = (events, dateIso, staffId, startTime, endTime, excludeEventId = null) => {
  const dayEvents = events.filter((e) => e.date === dateIso);
  const staffEvents = dayEvents.filter((e) => e.staff === staffId && e.id !== excludeEventId);
  
  const newStart = parseTime(startTime);
  const newEnd = parseTime(endTime);
  
  return staffEvents.some((event) => {
    const eventStart = parseTime(event.start);
    const eventEnd = parseTime(event.end);
    // Two ranges overlap if: start1 < end2 AND start2 < end1
    return newStart < eventEnd && eventStart < newEnd;
  });
};

/**
 * Find conflicts for a new appointment against existing appointments
 * Only checks FUTURE appointments (from today forward)
 * 
 * @param {Object} newAppointment - New appointment object
 * @param {Object[]} existingAppointments - Array of existing appointments
 * @returns {Object|null} - First conflicting appointment or null
 */
export const findConflicts = (newAppointment, existingAppointments) => {
  const { date, start, end, staff } = newAppointment;
  const appointmentDateIso = typeof date === 'string' ? date : formatDateLocal(new Date(date));
  
  const now = new Date();
  const currentDateIso = now.toISOString().slice(0, 10);
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Skip checking conflicts for past dates
  if (appointmentDateIso < currentDateIso) {
    return null;
  }
  
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
  
  // Check for conflicts
  const conflictingEvent = relevantEvents.find((event) => {
    // Only check events for the same staff member and same date
    if (event.staff !== staff || event.date !== appointmentDateIso) {
      return false;
    }
    
    // Check if time ranges overlap
    return timeRangesOverlap(start, end, event.start, event.end);
  });
  
  return conflictingEvent || null;
};

/**
 * Check for conflicts in a batch of appointments (for recurring appointments)
 * @param {Object[]} newAppointments - Array of new appointments to check
 * @param {Object[]} existingAppointments - Array of existing appointments
 * @returns {Object|null} - First conflicting appointment with date info or null
 */
export const findBatchConflicts = (newAppointments, existingAppointments) => {
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
  
  // Check each new appointment for conflicts
  for (const newAppointment of newAppointments) {
    const appointmentDateIso = typeof newAppointment.date === 'string' 
      ? newAppointment.date 
      : formatDateLocal(new Date(newAppointment.date));
    
    // Skip past dates
    if (appointmentDateIso < currentDateIso) {
      continue;
    }
    
    const conflictingEvent = relevantEvents.find((event) => {
      // Only check events for the same staff member and same date
      if (event.staff !== newAppointment.staff || event.date !== appointmentDateIso) {
        return false;
      }
      
      // Check if time ranges overlap
      return timeRangesOverlap(newAppointment.start, newAppointment.end, event.start, event.end);
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


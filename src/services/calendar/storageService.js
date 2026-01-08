/**
 * Storage service - localStorage wrapper for calendar data
 * Provides fallback/backup functionality when server is unavailable
 */

import { CALENDAR_EVENTS_STORAGE_KEY } from '../../utils/calendar/constants';

/**
 * Load appointments from localStorage
 * @returns {Array} - Array of appointments or empty array
 */
export const loadAppointmentsFromStorage = () => {
  try {
    const stored = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that it's an array
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Failed to load calendar events from localStorage:", error);
  }
  return [];
};

/**
 * Save appointments to localStorage
 * @param {Array} appointments - Array of appointments
 */
export const saveAppointmentsToStorage = (appointments) => {
  try {
    localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.warn("Failed to save calendar events to localStorage:", error);
  }
};

/**
 * Clear appointments from localStorage
 */
export const clearAppointmentsFromStorage = () => {
  try {
    localStorage.removeItem(CALENDAR_EVENTS_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear calendar events from localStorage:", error);
  }
};

/**
 * Sync appointments between server data and localStorage
 * @param {Array} serverAppointments - Appointments from server
 * @param {Array} localAppointments - Appointments from localStorage
 * @returns {Array} - Merged appointments (server takes priority)
 */
export const syncAppointments = (serverAppointments, localAppointments) => {
  // Server data takes priority
  // In a real implementation, you might want more sophisticated merging logic
  if (serverAppointments && serverAppointments.length > 0) {
    return serverAppointments;
  }
  return localAppointments || [];
};


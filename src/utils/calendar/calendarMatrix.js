/**
 * Calendar matrix generation utilities
 * Handles generation of day/week/month matrices for calendar views
 */

import { getStartOfWeek } from './dateHelpers';

/**
 * Generate month matrix (42 days: 6 weeks x 7 days)
 * @param {Date} date - Date in the month to generate matrix for
 * @returns {Date[]} - Array of 42 dates
 */
export const getMonthMatrix = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const start = getStartOfWeek(firstOfMonth);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
};

/**
 * Generate week days array (7 days starting from weekStart)
 * @param {Date} weekStart - Start date of the week (Sunday)
 * @returns {Date[]} - Array of 7 dates
 */
export const getWeekDays = (weekStart) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
};

/**
 * Generate time slots for a day
 * @param {number} startHour - Start hour (0-23)
 * @param {number} endHour - End hour (0-23)
 * @param {number} slotHeight - Height of each slot in pixels
 * @returns {Array} - Array of time slot objects
 */
export const generateTimeSlots = (startHour = 0, endHour = 23, slotHeight = 130) => {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push({
      hour,
      time: `${hour.toString().padStart(2, "0")}:00`,
      height: slotHeight,
    });
  }
  return slots;
};


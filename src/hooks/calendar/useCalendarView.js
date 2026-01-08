/**
 * Hook for managing calendar view state
 * Handles view type (day/week/month), current date, navigation, and zoom
 */

import { useState, useMemo } from 'react';
import { getStartOfWeek } from '../../utils/calendar/dateHelpers';
import { SLOT_HEIGHT_MIN, SLOT_HEIGHT_MAX } from '../../utils/calendar/constants';

export const useCalendarView = () => {
  // Initialize to today's date (normalized to start of day) and day view on mount
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  
  const [view, setView] = useState("day");
  
  // Zoom state for calendar slots
  const [slotHeight, setSlotHeight] = useState(SLOT_HEIGHT_MIN);
  const [appliedSlotHeight, setAppliedSlotHeight] = useState(SLOT_HEIGHT_MIN);
  
  // Week start for custom week view
  const [customWeekStart, setCustomWeekStart] = useState(null);
  
  // Calculate week start based on current date and view
  const weekStart = useMemo(() => {
    if (customWeekStart) {
      return customWeekStart;
    }
    return getStartOfWeek(currentDate);
  }, [customWeekStart, currentDate]);
  
  // Navigation handlers
  const handlePrev = () => {
    if (view === "day") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    } else if (view === "week") {
      if (customWeekStart) {
        const d = new Date(customWeekStart);
        d.setDate(d.getDate() - 7);
        setCustomWeekStart(d);
        setCurrentDate(d);
      } else {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
      }
    } else {
      // month
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - 1);
      setCurrentDate(d);
    }
  };
  
  const handleNext = () => {
    if (view === "day") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    } else if (view === "week") {
      if (customWeekStart) {
        const d = new Date(customWeekStart);
        d.setDate(d.getDate() + 7);
        setCustomWeekStart(d);
        setCurrentDate(d);
      } else {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
      }
    } else {
      // month
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() + 1);
      setCurrentDate(d);
    }
  };
  
  // Jump to today
  const jumpToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentDate(today);
    setView("day");
    setCustomWeekStart(null);
  };
  
  // Change view
  const changeView = (newView) => {
    setView(newView);
    setCustomWeekStart(null);
  };
  
  // Apply zoom (slot height)
  const applyZoom = () => {
    setAppliedSlotHeight(slotHeight);
  };
  
  // Reset zoom
  const resetZoom = () => {
    setSlotHeight(SLOT_HEIGHT_MIN);
    setAppliedSlotHeight(SLOT_HEIGHT_MIN);
  };
  
  return {
    // State
    currentDate,
    view,
    weekStart,
    slotHeight,
    appliedSlotHeight,
    customWeekStart,
    
    // Setters
    setCurrentDate,
    setView: changeView,
    setSlotHeight,
    setAppliedSlotHeight,
    setCustomWeekStart,
    
    // Actions
    handlePrev,
    handleNext,
    jumpToToday,
    applyZoom,
    resetZoom,
  };
};


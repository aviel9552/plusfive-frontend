/**
 * Hook for managing waitlist
 */

import { useState } from 'react';
import { DEMO_WAITLIST } from '../../data/calendar/demoData';
import { uuid } from '../../utils/calendar/constants';

export const useWaitlist = () => {
  const [waitlistItems, setWaitlistItems] = useState(DEMO_WAITLIST || []);
  
  // Filter state
  const [waitlistFilter, setWaitlistFilter] = useState("waiting"); // "waiting" | "expired" | "booked" | "all"
  const [waitlistRange, setWaitlistRange] = useState("30days");
  
  // Sort state
  const [waitlistSort, setWaitlistSort] = useState("created-oldest");
  const [isWaitlistRangeOpen, setIsWaitlistRangeOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  // Actions dropdown state
  const [openWaitlistActionId, setOpenWaitlistActionId] = useState(null);
  
  // Panel open state
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  
  /**
   * Add item to waitlist
   */
  const addWaitlistItem = (itemData) => {
    const newItem = {
      id: uuid(),
      ...itemData,
      createdAt: new Date().toISOString(),
    };
    setWaitlistItems((prev) => [...prev, newItem]);
    return newItem;
  };
  
  /**
   * Update waitlist item
   */
  const updateWaitlistItem = (itemId, updates) => {
    setWaitlistItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };
  
  /**
   * Delete waitlist item
   */
  const deleteWaitlistItem = (itemId) => {
    setWaitlistItems((prev) => prev.filter((item) => item.id !== itemId));
  };
  
  /**
   * Convert waitlist item to appointment
   */
  const convertToAppointment = (itemId) => {
    const item = waitlistItems.find((i) => i.id === itemId);
    if (!item) return null;
    
    // Update item status
    updateWaitlistItem(itemId, { status: "booked" });
    
    return item;
  };
  
  return {
    // State
    waitlistItems,
    waitlistFilter,
    waitlistRange,
    waitlistSort,
    isWaitlistRangeOpen,
    isSortDropdownOpen,
    openWaitlistActionId,
    isWaitlistOpen,
    
    // Setters
    setWaitlistItems,
    setWaitlistFilter,
    setWaitlistRange,
    setWaitlistSort,
    setIsWaitlistRangeOpen,
    setIsSortDropdownOpen,
    setOpenWaitlistActionId,
    setIsWaitlistOpen,
    
    // Actions
    addWaitlistItem,
    updateWaitlistItem,
    deleteWaitlistItem,
    convertToAppointment,
  };
};


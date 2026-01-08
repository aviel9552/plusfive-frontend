/**
 * Hook for managing booking flow state machine
 * Handles the multi-step process of creating appointments
 */

import { useState } from 'react';

export const useBookingFlow = () => {
  // Flow mode: "waitlist" or "booking"
  const [addFlowMode, setAddFlowMode] = useState("waitlist");
  
  // Current step in the flow
  const [waitlistAddStep, setWaitlistAddStep] = useState("date");
  
  // Panel open state
  const [isWaitlistAddOpen, setIsWaitlistAddOpen] = useState(false);
  
  // Selected values
  const [selectedWaitlistClient, setSelectedWaitlistClient] = useState(null);
  const [bookingSelectedDate, setBookingSelectedDate] = useState(null);
  const [bookingSelectedTime, setBookingSelectedTime] = useState("any");
  const [bookingSelectedService, setBookingSelectedService] = useState(null);
  const [bookingSelectedStaff, setBookingSelectedStaff] = useState(null);
  const [selectedStaffForBooking, setSelectedStaffForBooking] = useState(null);
  
  // Search states
  const [waitlistClientSearch, setWaitlistClientSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  
  // Dropdown states
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  
  // Recurring appointment settings
  const [recurringServiceType, setRecurringServiceType] = useState("Regular Appointment");
  const [recurringDuration, setRecurringDuration] = useState("1 Month");
  const [isServiceTypeDropdownOpen, setIsServiceTypeDropdownOpen] = useState(false);
  const [isRepeatDurationDropdownOpen, setIsRepeatDurationDropdownOpen] = useState(false);
  
  // Date picker state
  const [bookingMonth, setBookingMonth] = useState(() => new Date());
  
  /**
   * Navigate to next step
   */
  const nextStep = () => {
    const steps = ["date", "time", "service", "client"];
    const currentIndex = steps.indexOf(waitlistAddStep);
    if (currentIndex < steps.length - 1) {
      setWaitlistAddStep(steps[currentIndex + 1]);
    }
  };
  
  /**
   * Navigate to previous step
   */
  const prevStep = () => {
    const steps = ["date", "time", "service", "client"];
    const currentIndex = steps.indexOf(waitlistAddStep);
    if (currentIndex > 0) {
      setWaitlistAddStep(steps[currentIndex - 1]);
    }
  };
  
  /**
   * Jump to specific step
   */
  const goToStep = (step) => {
    setWaitlistAddStep(step);
  };
  
  /**
   * Reset flow to initial state
   */
  const resetFlow = () => {
    setWaitlistAddStep("date");
    setSelectedWaitlistClient(null);
    setBookingSelectedDate(null);
    setBookingSelectedTime("any");
    setBookingSelectedService(null);
    setBookingSelectedStaff(null);
    setSelectedStaffForBooking(null);
    setWaitlistClientSearch("");
    setServiceSearch("");
    setIsTimeDropdownOpen(false);
    setRecurringServiceType("Regular Appointment");
    setRecurringDuration("1 Month");
  };
  
  /**
   * Open flow in booking mode
   */
  const openBookingFlow = (initialData = {}) => {
    setAddFlowMode("booking");
    setIsWaitlistAddOpen(true);
    if (initialData.date) setBookingSelectedDate(initialData.date);
    if (initialData.time) setBookingSelectedTime(initialData.time);
    if (initialData.staff) setBookingSelectedStaff(initialData.staff);
    if (initialData.step) setWaitlistAddStep(initialData.step);
  };
  
  /**
   * Open flow in waitlist mode
   */
  const openWaitlistFlow = () => {
    setAddFlowMode("waitlist");
    setIsWaitlistAddOpen(true);
    resetFlow();
  };
  
  /**
   * Close flow
   */
  const closeFlow = () => {
    setIsWaitlistAddOpen(false);
    resetFlow();
  };
  
  return {
    // State
    addFlowMode,
    waitlistAddStep,
    isWaitlistAddOpen,
    selectedWaitlistClient,
    bookingSelectedDate,
    bookingSelectedTime,
    bookingSelectedService,
    bookingSelectedStaff,
    selectedStaffForBooking,
    waitlistClientSearch,
    serviceSearch,
    isTimeDropdownOpen,
    recurringServiceType,
    recurringDuration,
    isServiceTypeDropdownOpen,
    isRepeatDurationDropdownOpen,
    bookingMonth,
    
    // Setters
    setAddFlowMode,
    setWaitlistAddStep: goToStep,
    setIsWaitlistAddOpen,
    setSelectedWaitlistClient,
    setBookingSelectedDate,
    setBookingSelectedTime,
    setBookingSelectedService,
    setBookingSelectedStaff,
    setSelectedStaffForBooking,
    setWaitlistClientSearch,
    setServiceSearch,
    setIsTimeDropdownOpen,
    setRecurringServiceType,
    setRecurringDuration,
    setIsServiceTypeDropdownOpen,
    setIsRepeatDurationDropdownOpen,
    setBookingMonth,
    
    // Actions
    nextStep,
    prevStep,
    goToStep,
    resetFlow,
    openBookingFlow,
    openWaitlistFlow,
    closeFlow,
  };
};


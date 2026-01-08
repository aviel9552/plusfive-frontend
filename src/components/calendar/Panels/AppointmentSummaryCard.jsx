/**
 * AppointmentSummaryCard Component
 * Displays appointment details after booking is created
 * Uses the same design language as Fresha - 1:1 copy
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiX, FiChevronDown, FiUser, FiMail, FiPhone, FiMoreVertical, FiEye, FiCheck, FiCheckCircle, FiDollarSign, FiPlay, FiXCircle, FiCalendar, FiAlertTriangle, FiEdit, FiCreditCard, FiFileText, FiLock, FiChevronLeft, FiChevronRight, FiClock, FiPlus, FiFile } from "react-icons/fi";
import { FaPhoneAlt } from "react-icons/fa";
import { formatBookingDateLabel, isSameCalendarDay, formatDateLocal } from "../../../utils/calendar/dateHelpers";
import { BRAND_COLOR } from "../../../utils/calendar/constants";
import grassBg from "../../../assets/grass.png";
import whatsappIcon from "../../../assets/whatsappicon.png";
import bitLogo from "../../../assets/Bit-logo2024.png";
import payboxLogo from "../../../assets/paybox.png";
import { useTheme } from "../../../context/ThemeContext";
import { parseServiceDuration, calculateEndTime, generateTimeSlots } from "../../../utils/calendar/timeHelpers";
import { formatPhoneForDisplay, formatPhoneToWhatsapp } from "../../../utils/phoneHelpers";
import { getMonthMatrix } from "../../../utils/calendar/calendarMatrix";

const SERVICES_STORAGE_KEY = "services";
const PRODUCTS_STORAGE_KEY = "products";

export const AppointmentSummaryCard = ({
  isOpen,
  onClose,
  appointment,
  language = "he",
  onStatusChange,
  onServiceChange,
  onCreateAppointment,
  onDateChange,
  onTimeChange,
  onDurationChange,
  onSaveChanges,
  onConflictDetected,
  onViewClient,
}) => {
  // Load services from localStorage only (no demo services)
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    const loadServices = () => {
      const storedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (storedServices) {
        try {
          const parsedServices = JSON.parse(storedServices);
          setServices(parsedServices);
        } catch (error) {
          console.error("Error loading services from localStorage:", error);
          setServices([]);
        }
      } else {
        setServices([]);
      }
    };
    
    loadServices();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === SERVICES_STORAGE_KEY) {
        loadServices();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for changes
    const intervalId = setInterval(() => {
      loadServices();
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Load products from localStorage
  const [products, setProducts] = useState([]);
  const [selectedProductsForPayment, setSelectedProductsForPayment] = useState([]);
  
  useEffect(() => {
    const loadProducts = () => {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts);
          // Filter only active products
          const activeProducts = parsedProducts.filter(p => p.status === "פעיל" || !p.status);
          setProducts(activeProducts);
        } catch (error) {
          console.error("Error loading products from localStorage:", error);
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    };
    
    loadProducts();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === PRODUCTS_STORAGE_KEY) {
        loadProducts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for changes
    const intervalId = setInterval(() => {
      loadProducts();
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isServiceEditDropdownOpen, setIsServiceEditDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(appointment?.status || "נקבע תור");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null); // null = no tip, number = percentage, 'custom' = custom amount
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [customTipType, setCustomTipType] = useState("amount"); // "amount" or "percentage"
  const [isEditingCustomTip, setIsEditingCustomTip] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [datePickerMonth, setDatePickerMonth] = useState(() => {
    if (appointment?.date) {
      const date = appointment.date instanceof Date ? appointment.date : new Date(appointment.date);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date();
  });
  const statusDropdownRef = useRef(null);
  const dateDropdownRef = useRef(null);
  const timeDropdownRef = useRef(null);
  const timeDropdownContainerRef = useRef(null);
  const actionsDropdownRef = useRef(null);
  const serviceEditDropdownRef = useRef(null);
  const durationDropdownContainerRef = useRef(null);
  const serviceEditButtonRef = useRef(null);
  const durationDropdownRef = useRef(null);
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [showSaveChangesModal, setShowSaveChangesModal] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Keep an immutable snapshot of the original appointment when panel opens
  const originalAppointmentRef = useRef(null);
  
  // Update original snapshot when appointment changes (panel opens or appointment prop updates)
  useEffect(() => {
    if (appointment && isOpen) {
      // Create a deep copy of the appointment to use as immutable snapshot
      originalAppointmentRef.current = JSON.parse(JSON.stringify(appointment));
    }
  }, [appointment, isOpen]);
  
  // Expose function to reset pending changes (for conflict modal)
  useEffect(() => {
    if (onSaveChanges && typeof onSaveChanges === 'object' && onSaveChanges.resetPendingChanges) {
      // This is a ref object, not a function
      onSaveChanges.resetPendingChanges.current = () => {
        setPendingChanges(null);
        setShowSaveChangesModal(false);
      };
    }
  }, [onSaveChanges]);

  // Update selectedStatus when appointment changes
  useEffect(() => {
    if (appointment?.status) {
      setSelectedStatus(appointment.status);
    }
  }, [appointment?.status]);

  // Update selectedStatus when appointment changes
  useEffect(() => {
    if (appointment?.status) {
      setSelectedStatus(appointment.status);
    }
  }, [appointment?.status]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setIsDateDropdownOpen(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setIsTimeDropdownOpen(false);
      }
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target)) {
        setIsActionsDropdownOpen(false);
      }
      if (serviceEditDropdownRef.current && !serviceEditDropdownRef.current.contains(event.target)) {
        setIsServiceEditDropdownOpen(false);
      }
      if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target)) {
        setIsDurationDropdownOpen(false);
      }
    };

    if (isStatusDropdownOpen || isDateDropdownOpen || isTimeDropdownOpen || isActionsDropdownOpen || isServiceEditDropdownOpen || isDurationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStatusDropdownOpen, isDateDropdownOpen, isTimeDropdownOpen, isActionsDropdownOpen, isServiceEditDropdownOpen, isDurationDropdownOpen]);

  const statusOptions = [
    { value: "נקבע תור", label: "נקבע תור", icon: FiCalendar },
    { value: "אושר", label: "אושר", icon: FiCheckCircle },
    { value: "שולם", label: "שולם", icon: FiDollarSign },
    { value: "לא הגיע", label: "לא הגיע", icon: FiXCircle },
    { value: "בוטל", label: "בוטל", icon: FiX },
  ];

  if (!isOpen || !appointment) return null;

  // Get the original appointment snapshot (immutable copy from when panel opened)
  // This ensures we can always revert to the exact state when the panel was first opened
  const originalAppointment = originalAppointmentRef.current || appointment;
  
  // Use original appointment for destructuring to ensure we always have the base values
  // When pendingChanges is null (after cancel), we use originalAppointment values
  const baseAppointment = originalAppointment || appointment;

  const {
    eventId,
    client: originalClient,
    service: originalService,
    date: originalDate,
    time: originalTime,
    staff: originalStaff,
    price: originalPrice,
    duration: originalDuration,
    recurringType,
    recurringDuration,
    _pendingAppointmentData,
  } = baseAppointment;

  // Show status button only if appointment is already created (has eventId) and not pending
  const showStatusButton = eventId && !_pendingAppointmentData;

  // Use pending changes if available (draft state), otherwise use original values from snapshot
  // When pendingChanges is null (after cancel), we revert to originalAppointment snapshot
  const currentDate = pendingChanges?.date !== undefined 
    ? pendingChanges.date 
    : originalDate;
  const currentTime = pendingChanges?.time !== undefined 
    ? pendingChanges.time 
    : originalTime;
  const currentDuration = pendingChanges?.duration !== undefined 
    ? pendingChanges.duration 
    : originalDuration;
  
  // Use pending changes for service/price if available, otherwise use original values
  const currentClient = originalClient;
  const currentService = pendingChanges?.service !== undefined 
    ? pendingChanges.service 
    : originalService;
  const currentStaff = originalStaff;
  const currentPrice = pendingChanges?.price !== undefined 
    ? pendingChanges.price 
    : originalPrice;
  
  const bookingDateLabel = formatBookingDateLabel(currentDate, language);
  // Handle both em dash (–) and regular hyphen (-) for time ranges
  const timeStart = currentTime ? currentTime.split(/[–-]/)[0].trim() : "";
  let timeEnd = currentTime && (currentTime.includes('–') || currentTime.includes('-')) 
    ? currentTime.split(/[–-]/)[1]?.trim() || "" 
    : "";
  
  // If timeEnd is not provided but we have timeStart and duration, calculate it
  if (!timeEnd && timeStart && currentDuration) {
    const minutes = typeof currentDuration === 'number' 
      ? currentDuration 
      : parseServiceDuration(currentDuration);
    if (!isNaN(minutes) && minutes > 0) {
      timeEnd = calculateEndTime(timeStart, minutes);
    }
  }
  
  // Format duration (minutes to "דק'" or "שעות")
  const formatDuration = (durationValue) => {
    if (!durationValue) return "";
    // If duration is a number (minutes), format it
    const minutes = typeof durationValue === 'number' 
      ? durationValue 
      : parseServiceDuration(durationValue);
    
    if (isNaN(minutes) || minutes <= 0) return "";
    
    if (minutes < 60) {
      return `${minutes} דק'`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} שעות`;
      }
      return `${hours} שעות ${remainingMinutes} דק'`;
    }
  };
  
  const formattedDuration = formatDuration(currentDuration);
  
  // Handle save changes
  const handleSaveChanges = () => {
    if (!pendingChanges || !eventId) {
      setPendingChanges(null);
      setShowSaveChangesModal(false);
      onClose();
      return;
    }
    
    // Call onSaveChanges callback which will check for conflicts and save all changes at once
    // Only close if save was successful (no conflict)
    if (onSaveChanges && typeof onSaveChanges === 'object' && onSaveChanges.save) {
      const saveResult = onSaveChanges.save(eventId, pendingChanges);
      // If save was successful (no conflict), clear pending changes and close the card
      if (saveResult !== false) {
        setPendingChanges(null);
        setShowSaveChangesModal(false);
        onClose(); // Close the appointment summary card after saving
      } else {
        // Conflict detected - close the save changes modal
        // The conflict modal will be shown, and pending changes will be reset by the conflict modal handler
        setShowSaveChangesModal(false);
      }
    } else if (typeof onSaveChanges === 'function') {
      // Fallback for direct function callback
      const saveResult = onSaveChanges(eventId, pendingChanges);
      if (saveResult !== false) {
        setPendingChanges(null);
        setShowSaveChangesModal(false);
        onClose();
      } else {
        setShowSaveChangesModal(false);
      }
    } else {
      // Fallback: Call individual callbacks (they will check for conflicts)
      if (pendingChanges.date !== undefined && onDateChange) {
        onDateChange(eventId, pendingChanges.date);
      }
      if (pendingChanges.time !== undefined && pendingChanges.startTime && pendingChanges.endTime && onTimeChange) {
        onTimeChange(eventId, pendingChanges.time, pendingChanges.startTime, pendingChanges.endTime);
      }
      if (pendingChanges.duration !== undefined && pendingChanges.time && pendingChanges.startTime && pendingChanges.endTime && onDurationChange) {
        onDurationChange(eventId, pendingChanges.duration, pendingChanges.time, pendingChanges.endTime);
      }
      
      // Clear pending changes
      setPendingChanges(null);
      setShowSaveChangesModal(false);
      onClose();
    }
  };
  
  // Handle discard changes - revert to original, keep panel open, close only modal
  const handleDiscardChanges = () => {
    // Revert all pending changes to original appointment data
    setPendingChanges(null);
    // Close only the confirm popup, keep the panel open
    setShowSaveChangesModal(false);
    // Do NOT call onClose() - panel must remain open
    // Do NOT update central appointments store - changes are discarded
  };
  
  // Handle close with pending changes check
  const handleClose = () => {
    if (pendingChanges && eventId) {
      // Check for conflicts BEFORE showing "Save Changes" modal
      if (onConflictDetected) {
        // Calculate final values from pendingChanges
        const finalDate = pendingChanges.date !== undefined 
          ? (typeof pendingChanges.date === 'string' ? pendingChanges.date : formatDateLocal(new Date(pendingChanges.date)))
          : undefined;
        
        // Calculate startTime and endTime from pendingChanges
        // Use pendingChanges values if available, otherwise fall back to current values
        let finalStartTime = pendingChanges.startTime;
        let finalEndTime = pendingChanges.endTime;
        
        // If startTime not in pendingChanges, calculate from time string
        if (!finalStartTime) {
          if (pendingChanges.time) {
            finalStartTime = pendingChanges.time.split(/[–-]/)[0].trim();
          } else if (currentTime) {
            finalStartTime = currentTime.split(/[–-]/)[0].trim();
          }
        }
        
        // Calculate endTime if not provided
        if (!finalEndTime && finalStartTime) {
          const durationToUse = pendingChanges.duration !== undefined 
            ? pendingChanges.duration 
            : currentDuration;
          if (durationToUse) {
            const durationMinutes = typeof durationToUse === 'number' 
              ? durationToUse 
              : parseServiceDuration(durationToUse);
            if (!isNaN(durationMinutes) && durationMinutes > 0) {
              finalEndTime = calculateEndTime(finalStartTime, durationMinutes);
            }
          }
        }
        
        // Build changeData from pendingChanges
        const changeData = {
          eventId,
          date: finalDate,
          startTime: finalStartTime,
          endTime: finalEndTime,
          duration: pendingChanges.duration,
          time: pendingChanges.time,
        };
        
        // Check for conflicts - if conflict detected, onConflictDetected will show the conflict modal
        const hasConflict = onConflictDetected(changeData);
        
        if (hasConflict) {
          // Conflict detected - conflict modal will be shown by onConflictDetected
          // Don't show "Save Changes" modal
          return;
        }
      }
      
      // No conflict - show "Save Changes" modal
      setShowSaveChangesModal(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <style>{`
        @keyframes gentleGradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 30% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .apply-button-gradient {
          background: #000000 !important;
          background-size: auto !important;
          animation: none !important;
        }
        html.dark .apply-button-gradient {
          background: linear-gradient(315deg, #FF257C 0%, #FF257C 25%, #FF257C 50%, #FF8FC0 75%, #FFE7F3 100%) !important;
          background-size: 130% 130% !important;
          animation: gentleGradientShift 10s ease-in-out infinite !important;
        }
        .calendar-slide-in {
          animation: calendarSlideIn 260ms ease-out forwards;
        }
        @keyframes calendarSlideIn {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      
      {/* קליק על הרקע – סוגר את הכרטיס */}
      <div className="flex-1 bg-black/0" onClick={handleClose} style={{ zIndex: 40 }} />

      <div
        dir="rtl"
        className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
             border-l border-gray-200 dark:border-commonBorder shadow-2xl
             flex flex-col calendar-slide-in text-right"
        onClick={(e) => e.stopPropagation()}
      >
            {/* X מחוץ לפופ בצד שמאל למעלה */}
            <button
              className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              onClick={handleClose}
            >
              <FiX className="text-[16px]" />
            </button>

        {/* HEADER - כמו Fresha */}
        <div className="px-5 py-7 min-h-[125px] relative overflow-visible">
          {/* Background image - flipped */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              backgroundImage: `url(${grassBg})`,
              backgroundSize: 'cover',
              backgroundPosition: '40% 16%',
              backgroundRepeat: 'no-repeat',
              transform: 'scaleX(-1)',
            }}
          />
          {/* Content - not flipped */}
          <div className="relative z-10 flex items-center justify-end">
            {showStatusButton && (
              <div className="relative" ref={statusDropdownRef}>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] text-[14px] font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  <span>{selectedStatus}</span>
                  <FiChevronDown className="text-[15px] text-gray-400" />
                </button>

                {/* Status Dropdown */}
                {isStatusDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] z-30 py-1 text-[11px]"
                    style={{
                      boxShadow:
                        "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                    dir="rtl"
                  >
                    {statusOptions.map((option, index) => {
                      const Icon = option.icon;
                      const isSelected = selectedStatus === option.value;
                      const isLast = index === statusOptions.length - 1;
                      const isCancel = option.value === "בוטל";
                      
                      return (
                        <React.Fragment key={option.value}>
                          <button
                            type="button"
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition ${
                              isCancel ? "text-red-500" : ""
                            }`}
                            onClick={() => {
                              if (isCancel) {
                                setShowCancelConfirm(true);
                                setIsStatusDropdownOpen(false);
                              } else {
                                const newStatus = option.value;
                                setSelectedStatus(newStatus);
                                setIsStatusDropdownOpen(false);
                                if (onStatusChange && eventId) {
                                  onStatusChange(eventId, newStatus);
                                }
                                // Close the card immediately when status changes
                                if (newStatus === "בוטל") {
                                  onClose();
                                }
                              }
                            }}
                          >
                            <span className={`flex items-center gap-2 ${
                              isCancel 
                                ? "text-red-500" 
                                : "text-gray-800 dark:text-gray-100"
                            } text-[13px]`}>
                              <Icon 
                                className={`${
                                  isCancel 
                                    ? "text-[16px] text-red-500" 
                                    : "text-[15px] text-gray-700 dark:text-gray-200"
                                }`} 
                              />
                              {option.label}
                            </span>
                            {isSelected && !isCancel && (
                              <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BRAND_COLOR }}>
                                <FiCheck className="text-white text-[10px]" />
                              </span>
                            )}
                          </button>
                          {!isLast && (
                            <div className="my-1 border-t border-gray-200 dark:border-gray-700 mx-3" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 text-sm text-gray-800 dark:text-gray-100">
          <div className="space-y-6">
            {/* Client Information - כמו Fresha */}
            {currentClient?.name ? (
              <div className="space-y-4">
                {/* Avatar and Name */}
                <div className="flex items-start gap-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-black text-white overflow-hidden"
                  >
                    {currentClient?.profileImage ? (
                      <img 
                        src={currentClient.profileImage} 
                        alt={currentClient?.name || "לקוח"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentClient?.initials || currentClient?.name?.charAt(0)?.toUpperCase() || "ל"
                    )}
                  </div>
                  <div className="flex-1 flex flex-col relative">
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1.5">
                      {currentClient.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {currentClient?.phone ? formatPhoneForDisplay(currentClient.phone) : "050-0000000"}
                      </span>
                      {(currentClient?.phone || true) && (
                        <>
                          <button
                            type="button"
                            className="inline-block hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
                            title="התקשר"
                            onClick={(e) => {
                              e.stopPropagation();
                              const phoneToUse = currentClient?.phone || "050-0000000";
                              window.location.href = `tel:${phoneToUse}`;
                            }}
                          >
                            <FaPhoneAlt className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            type="button"
                            className="inline-block hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
                            title="פתח שיחה ב-WhatsApp"
                            onClick={(e) => {
                              e.stopPropagation();
                              const phoneToUse = currentClient?.phone || "050-0000000";
                              const whatsappUrl = formatPhoneToWhatsapp(phoneToUse);
                              window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <img 
                              src={whatsappIcon} 
                              alt="WhatsApp" 
                              className="w-7 h-7"
                              style={{ filter: 'brightness(0)' }}
                            />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-6">
                  <div className="relative" ref={actionsDropdownRef}>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] flex items-center gap-1"
                      onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                    >
                      פעולות
                      <FiChevronDown className="text-[12px]" />
                    </button>

                    {/* Actions Dropdown */}
                    {isActionsDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] z-30 py-1 text-[11px]"
                        style={{
                          boxShadow:
                            "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                        dir="rtl"
                      >
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                          onClick={() => {
                            setIsActionsDropdownOpen(false);
                            // TODO: Handle "הערה על הלקוח"
                          }}
                        >
                          <span className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-[13px]">
                            <FiFileText className="text-[15px] text-gray-700 dark:text-gray-200" />
                            הערה על הלקוח
                          </span>
                        </button>
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700 mx-3" />
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                          onClick={() => {
                            setIsActionsDropdownOpen(false);
                            // TODO: Handle "ערוך כרטיס לקוח"
                          }}
                        >
                          <span className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-[13px]">
                            <FiEdit className="text-[15px] text-gray-700 dark:text-gray-200" />
                            ערוך כרטיס לקוח
                          </span>
                        </button>
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700 mx-3" />
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                          onClick={() => {
                            setIsActionsDropdownOpen(false);
                            // TODO: Handle "חסימת לקוח"
                          }}
                        >
                          <span className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-[13px]">
                            <FiLock className="text-[15px] text-gray-700 dark:text-gray-200" />
                            חסימת לקוח
                          </span>
                        </button>
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700 mx-3" />
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition text-red-500"
                          onClick={() => {
                            setIsActionsDropdownOpen(false);
                            // TODO: Handle "מחיקת לקוח"
                          }}
                        >
                          <span className="flex items-center gap-2 text-red-500 text-[13px]">
                            <FiX className="text-[16px] text-red-500" />
                            מחיקת לקוח
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewClient && currentClient) {
                        onViewClient(currentClient);
                      }
                    }}
                  >
                    <FiEye className="text-[14px]" />
                    צפה בפרופיל
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-base">+</span>
                  <span>הוסף לקוח</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  או השאר ריק ללקוחות מזדמנים
                </div>
              </div>
            )}

            {/* Date, Time, Duration Section - עם קו ורוד */}
            <div className="space-y-2 overflow-visible mt-4">
                <div className="group relative flex items-center justify-between px-3 py-2.5 bg-white dark:bg-[#181818] border-r-4 rounded hover:bg-gray-50 dark:hover:bg-[#222] transition" style={{ borderRightColor: BRAND_COLOR }}>
                <div className="flex items-center justify-between w-full text-lg text-gray-600 dark:text-gray-400">
                      {/* Date */}
                      <div className="flex items-center gap-1.5">
                        <div>
                          {bookingDateLabel}
                    </div>
                        {onDateChange && (
                          <div className="relative" ref={dateDropdownRef}>
                            <button
                              type="button"
                              className="w-5 h-5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsDateDropdownOpen(!isDateDropdownOpen);
                              }}
                              title="ערוך תאריך"
                            >
                              <FiEdit className="text-[11px]" />
                            </button>
                            
                            {/* Date Picker Dropdown */}
                            {isDateDropdownOpen && (
                              <div
                                className="fixed w-[360px] sm:w-[460px] rounded-2xl border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] z-[100] p-4"
                                style={{
                                  boxShadow: "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  top: dateDropdownRef.current ? 
                                    `${dateDropdownRef.current.getBoundingClientRect().bottom + 20}px` : 'auto',
                                }}
                                onClick={(e) => e.stopPropagation()}
                                dir="rtl"
                              >
                                {(() => {
                                  const locale = language === "he" ? "he-IL" : "en-US";
                                  const days = getMonthMatrix(datePickerMonth);
                                  const currentMonth = datePickerMonth.getMonth();
                                  const monthLabel = datePickerMonth.toLocaleDateString(locale, {
                                    month: "long",
                                    year: "numeric",
                                  });
                                  const dayNames = Array.from({ length: 7 }, (_, i) => {
                                    const d = new Date(2025, 0, 5 + i);
                                    return d.toLocaleDateString(locale, { weekday: "short" });
                                  });
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  // Use currentDate from outer scope (the appointment date)
                                  const dateForPicker = currentDate instanceof Date ? currentDate : new Date(currentDate);
                                  dateForPicker.setHours(0, 0, 0, 0);
                                  
                                  return (
                                    <div className="w-full">
                                      {/* Month navigation */}
                                      <div className="flex items-center justify-between mb-3">
                                        <button
                                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-300"
                                          onClick={() => {
                                            const d = new Date(datePickerMonth);
                                            d.setMonth(d.getMonth() - 1);
                                            setDatePickerMonth(d);
                                          }}
                                        >
                                          <span dir="ltr">
                                            <FiChevronRight />
                                          </span>
                                        </button>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                          {monthLabel}
                                        </span>
                                        <button
                                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-300"
                                          onClick={() => {
                                            const d = new Date(datePickerMonth);
                                            d.setMonth(d.getMonth() + 1);
                                            setDatePickerMonth(d);
                                          }}
                                        >
                                          <span dir="ltr">
                                            <FiChevronLeft />
                                          </span>
                                        </button>
                    </div>
                                      
                                      {/* Day names */}
                                      <div className="grid grid-cols-7 gap-[4px] text-[11px] text-gray-500 dark:text-gray-300 mb-1">
                                        {dayNames.map((name) => (
                                          <div key={name} className="h-7 flex items-center justify-center">
                                            {name}
                                          </div>
                                        ))}
                                      </div>
                                      
                                      {/* Days */}
                                      <div className="grid grid-cols-7 grid-rows-6 gap-[4px]">
                                        {days.map((day) => {
                                          const isCurrentMonth = day.getMonth() === currentMonth;
                                          const isSelected = isSameCalendarDay(day, currentDate);
                                          const isToday = isSameCalendarDay(day, today);
                                          
                                          // Ensure perfect circle by using same width/height and flex-shrink-0
                                          let className = "relative z-10 w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] rounded-full flex items-center justify-center text-xs transition-colors flex-shrink-0";
                                          let style = {};
                                          
                                          if (isSelected) {
                                            // תאריך נבחר - עיגול ורוד
                                            className += " font-semibold bg-[rgba(255,37,124,0.08)] text-gray-900 dark:text-white";
                                            style = {
                                              borderWidth: 2,
                                              borderStyle: "solid",
                                              borderColor: BRAND_COLOR,
                                              color: BRAND_COLOR,
                                            };
                                          } else if (isToday && isCurrentMonth) {
                                            // היום (אבל לא נבחר) - עיגול אפור
                                            className += " font-semibold text-gray-900 dark:text-white";
                                            style = {
                                              borderWidth: 2,
                                              borderStyle: "solid",
                                              borderColor: "#9ca3af", // gray-400
                                              color: "#374151", // gray-700
                                            };
                                          } else if (!isCurrentMonth) {
                                            className += " text-gray-400 dark:text-gray-600";
                                          } else {
                                            className += " text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]";
                                          }
                                          
                                          return (
                                            <div key={day.toISOString()} className="flex items-center justify-center">
                                              <button
                                                type="button"
                                                className={className}
                                                style={style}
                                                onClick={() => {
                                                  const newDateIso = formatDateLocal(day);
                                                  setPendingChanges((prev) => ({
                                                    ...prev,
                                                    date: newDateIso,
                                                  }));
                                                  setIsDateDropdownOpen(false);
                                                }}
                                              >
                                                {day.getDate()}
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Start Time */}
                      <div className="flex items-center gap-1.5">
                        <div>
                          {timeStart || "כל שעה"}
                        </div>
                        {onTimeChange && (
                          <div className="relative" ref={timeDropdownRef}>
                            <button
                              type="button"
                              className="w-5 h-5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsTimeDropdownOpen(!isTimeDropdownOpen);
                              }}
                              title="ערוך שעה"
                            >
                              <FiClock className="text-[11px]" />
                            </button>
                            
                            {/* Time Picker Dropdown */}
                            {isTimeDropdownOpen && (
                              <div
                                ref={timeDropdownContainerRef}
                                className="fixed w-48 rounded-2xl border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] z-[150] py-2 max-h-64 overflow-y-auto"
                                style={{
                                  boxShadow: "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                                  right: timeDropdownRef.current ? 
                                    `${window.innerWidth - timeDropdownRef.current.getBoundingClientRect().right - (timeDropdownRef.current.getBoundingClientRect().width / 2) + 96 - 190}px` : 'auto', // 96px = half of dropdown width (192px / 2), 190px = 5cm
                                  top: timeDropdownRef.current ? 
                                    `${timeDropdownRef.current.getBoundingClientRect().bottom + 8}px` : 'auto',
                                  pointerEvents: 'auto',
                                }}
                                onClick={(e) => e.stopPropagation()}
                                dir="rtl"
                              >
                                {(() => {
                                  // Generate time slots (5-minute intervals from 00:00 to 23:55)
                                  const timeSlots = generateTimeSlots(0, 24, 5);
                                  
                                  // Sort so selected option appears first (without scrolling)
                                  const normalizedTimeStart = timeStart ? timeStart.trim() : "";
                                  const sortedSlots = [...timeSlots].sort((a, b) => {
                                    const aNormalized = a.trim();
                                    const bNormalized = b.trim();
                                    if (aNormalized === normalizedTimeStart) return -1;
                                    if (bNormalized === normalizedTimeStart) return 1;
                                    return 0;
                                  });
                                  
                                  return sortedSlots.map((slot) => {
                                    // Normalize both values for comparison (trim whitespace, ensure same format)
                                    const normalizedSlot = slot.trim();
                                    const normalizedTimeStart = timeStart ? timeStart.trim() : "";
                                    const isSelected = normalizedSlot === normalizedTimeStart;
                                    return (
                                      <button
                                        key={slot}
                                        data-time-slot={slot}
                                        type="button"
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${isSelected ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                                        onClick={() => {
                                          // Calculate new end time based on current duration
                                          const durationMinutes = typeof currentDuration === 'number' 
                                            ? currentDuration 
                                            : parseServiceDuration(currentDuration);
                                          const newEndTime = calculateEndTime(slot, durationMinutes);
                                          const newTimeRange = `${slot}–${newEndTime}`;
                                          setPendingChanges((prev) => ({
                                            ...prev,
                                            time: newTimeRange,
                                            startTime: slot,
                                            endTime: newEndTime,
                                          }));
                                          setIsTimeDropdownOpen(false);
                                        }}
                                      >
                                        <span className="text-gray-800 dark:text-gray-100 text-[13px]">
                                          {slot}
                                        </span>
                                        {isSelected && (
                                          <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BRAND_COLOR }}>
                                            <FiCheck className="text-white text-[10px]" />
                                          </span>
                                        )}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Duration */}
                      <div className="flex items-center gap-1.5">
                        <div>
                          {formattedDuration || ""}
                        </div>
                        {onDurationChange && (
                          <div className="relative" ref={durationDropdownRef}>
                            <button
                              type="button"
                              className="w-5 h-5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsDurationDropdownOpen(!isDurationDropdownOpen);
                              }}
                              title="ערוך משך זמן"
                            >
                              <FiEdit className="text-[11px]" />
                            </button>
                            
                            {/* Duration Picker Dropdown */}
                            {isDurationDropdownOpen && (
                              <div
                                ref={durationDropdownContainerRef}
                                className="fixed w-48 rounded-2xl border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] z-[150] py-2 max-h-64 overflow-y-auto"
                                style={{
                                  boxShadow: "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                                  right: durationDropdownRef.current ? 
                                    `${window.innerWidth - durationDropdownRef.current.getBoundingClientRect().right - 152}px` : 'auto', // 152px = 4cm
                                  top: durationDropdownRef.current ? 
                                    `${durationDropdownRef.current.getBoundingClientRect().bottom + 8}px` : 'auto',
                                  pointerEvents: 'auto',
                                }}
                                onClick={(e) => e.stopPropagation()}
                                dir="rtl"
                              >
                                {(() => {
                                  // Generate duration options from 10 minutes to 5 hours in 5-minute intervals
                                  const durations = [];
                                  for (let minutes = 10; minutes <= 300; minutes += 5) {
                                    durations.push(minutes);
                                  }
                                  
                                  // Use currentDuration (from pendingChanges or original) for comparison
                                  const currentDurationMinutes = typeof currentDuration === 'number' 
                                    ? currentDuration 
                                    : parseServiceDuration(currentDuration);
                                  
                                  // Sort so selected option appears first (without scrolling)
                                  const sortedDurations = [...durations].sort((a, b) => {
                                    if (Number(a) === Number(currentDurationMinutes)) return -1;
                                    if (Number(b) === Number(currentDurationMinutes)) return 1;
                                    return 0;
                                  });
                                  
                                  return sortedDurations.map((minutes) => {
                                    // Compare as numbers to avoid type issues
                                    const isSelected = Number(currentDurationMinutes) === Number(minutes);
                                    const formatted = formatDuration(minutes);
                                    return (
                                      <button
                                        key={minutes}
                                        data-duration-minutes={minutes}
                                        type="button"
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${isSelected ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                                        onClick={() => {
                                          if (timeStart) {
                                            // Calculate new end time based on new duration
                                            const newEndTime = calculateEndTime(timeStart, minutes);
                                            const newTimeRange = `${timeStart}–${newEndTime}`;
                                            setPendingChanges((prev) => ({
                                              ...prev,
                                              duration: minutes,
                                              time: newTimeRange,
                                              startTime: timeStart,
                                              endTime: newEndTime,
                                            }));
                                            setIsDurationDropdownOpen(false);
                                          }
                                        }}
                                      >
                                        <span className="text-gray-800 dark:text-gray-100 text-[13px]">
                                          {formatted}
                                        </span>
                                        {isSelected && (
                                          <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BRAND_COLOR }}>
                                            <FiCheck className="text-white text-[10px]" />
                                          </span>
                                        )}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                    </div>
                  </div>
                </div>
              
              {/* Service Name Section - עם קו צבעוני של השירות */}
              <div className="group relative flex items-center justify-between px-3 py-2.5 bg-white dark:bg-[#181818] border-r-4 rounded hover:bg-gray-50 dark:hover:bg-[#222] transition" style={{ borderRightColor: currentService?.color || BRAND_COLOR }}>
                <div className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                  {currentService?.name || "שירות לא זמין"}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center min-w-[24px]" ref={serviceEditDropdownRef}>
                      {currentPrice && (
                        <span className="absolute text-base font-semibold text-gray-900 dark:text-gray-100 opacity-100 group-hover:opacity-0 transition-opacity whitespace-nowrap">
                          ₪{currentPrice}
                        </span>
                      )}
                      <button 
                        ref={serviceEditButtonRef}
                        type="button"
                        className="absolute opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-[#333] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsServiceEditDropdownOpen(!isServiceEditDropdownOpen);
                        }}
                      >
                        <FiEdit className="text-[14px]" />
                      </button>

                      {/* Service Edit Dropdown */}
                      {isServiceEditDropdownOpen && (
                        <div
                          className="fixed w-[360px] sm:w-[460px] rounded-2xl border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] z-[100] p-4 max-h-80 overflow-y-auto"
                          style={{
                            boxShadow:
                              "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                            left: '50%',
                            transform: 'translateX(-50%)',
                            top: serviceEditButtonRef.current ? 
                              `${serviceEditButtonRef.current.getBoundingClientRect().bottom + 20}px` : 'auto',
                          }}
                          onClick={(e) => e.stopPropagation()}
                          dir="rtl"
                        >
                          {services.map((serviceOption) => {
                            // Format duration for this service option
                            const optionFormattedDuration = formatDuration(serviceOption.duration);
                            
                            return (
                            <button
                              key={serviceOption.id}
                              type="button"
                              className="group relative w-full flex items-center justify-between px-3 py-3 text-left text-xs sm:text-sm transition rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30"
                              onClick={() => {
                                if (eventId) {
                                  // Calculate new end time based on new service duration
                                  const durationMinutes = typeof serviceOption.duration === 'number' 
                                    ? serviceOption.duration 
                                    : parseServiceDuration(serviceOption.duration);
                                  
                                  // Use current timeStart if available, otherwise keep current time
                                  const newStartTime = timeStart || (currentTime ? currentTime.split(/[–-]/)[0].trim() : "");
                                  const newEndTime = newStartTime ? calculateEndTime(newStartTime, durationMinutes) : "";
                                  const newTimeRange = newStartTime && newEndTime ? `${newStartTime}–${newEndTime}` : currentTime;
                                  
                                  // Update pendingChanges (draft state) instead of calling onServiceChange directly
                                  setPendingChanges((prev) => ({
                                    ...prev,
                                    service: serviceOption,
                                    serviceId: serviceOption.id,
                                    serviceName: serviceOption.name,
                                    price: serviceOption.price,
                                    duration: durationMinutes,
                                    time: newTimeRange,
                                    startTime: newStartTime || undefined,
                                    endTime: newEndTime || undefined,
                                  }));
                                }
                                setIsServiceEditDropdownOpen(false);
                              }}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                <div
                                  className="w-[4px] h-10 rounded-full"
                                  style={{ backgroundColor: serviceOption.color || BRAND_COLOR }}
                                />
                                  <div className="flex flex-col items-start flex-1">
                                  <span className="font-medium text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200">
                                    {serviceOption.name}
                                  </span>
                                    {optionFormattedDuration && (
                                  <span className="text-[11px] text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400">
                                        {optionFormattedDuration}
                                  </span>
                                    )}
                                </div>
                              </div>
                                <span className="ml-4 text-[13px] font-semibold text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200 whitespace-nowrap">
                                  ₪{serviceOption.price}
                              </span>
                            </button>
                            );
                          })}
                        </div>
                      )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER - Total and Checkout/Book Appointment */}
        {appointment?._pendingAppointmentData ? (
          <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder bg-white dark:bg-[#111]">
            <button
              type="button"
              className="w-full h-[48px] rounded-full text-md font-semibold flex items-center justify-center gap-2 bg-black text-white hover:opacity-90 transition"
              onClick={() => {
                if (onCreateAppointment) {
                  onCreateAppointment(appointment._pendingAppointmentData);
                }
              }}
            >
              <FiCalendar className="text-[16px]" />
              קבע תור
            </button>
          </div>
        ) : (
          <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder bg-white dark:bg-[#111]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">סה״כ</span>
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {currentPrice ? `₪${currentPrice}` : "₪0"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-[#222]">
                <FiMoreVertical className="text-[18px]" />
              </button>
              <button
                type="button"
                className="flex-1 h-[48px] rounded-full text-md font-semibold flex items-center justify-center gap-2 bg-black text-white hover:opacity-90 transition"
                onClick={() => setShowPaymentModal(true)}
              >
                <FiCreditCard className="text-[16px]" />
                לתשלום
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Modal */}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* קליק על הרקע – סוגר את כל הפופ-אפים וכרטיס התור */}
          <div 
            className="flex-1 bg-transparent" 
            onClick={() => {
              setShowProductsModal(false);
              setShowPaymentModal(false);
              setShowTipModal(false);
              setShowPaymentMethodModal(false);
              onClose();
            }} 
            style={{ zIndex: 40 }} 
          />

          <div
            dir="rtl"
            className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
                 border-l border-gray-200 dark:border-commonBorder shadow-2xl
                 flex flex-col text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* X מחוץ לפופ בצד שמאל למעלה */}
            <button
              className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              onClick={() => setShowPaymentModal(false)}
            >
              <FiX className="text-[16px]" />
            </button>

            {/* Back button - Left side of popup */}
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] z-50"
            >
              <FiChevronRight className="text-[16px]" />
            </button>

            {/* HEADER - כמו Fresha */}
            <div className="px-5 py-7 min-h-[125px] relative overflow-visible">
              {/* Background image - flipped */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  backgroundImage: `url(${grassBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: '40% 16%',
                  backgroundRepeat: 'no-repeat',
                  transform: 'scaleX(-1)',
                }}
              />
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 text-sm text-gray-800 dark:text-gray-100">
              <div className="space-y-6">
                {/* Client Name */}
                {currentClient?.name && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">שם הלקוח</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {currentClient.name}
                    </div>
                  </div>
                )}

                {/* Staff Name */}
                {currentStaff?.name && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">איש צוות</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {currentStaff.name}
                    </div>
                  </div>
                )}

                {/* Service Name and Price */}
                {currentService && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">שירות</div>
                    <div className="group relative flex items-center justify-between px-3 py-2.5 bg-white dark:bg-[#181818] border-r-4 rounded hover:bg-gray-50 dark:hover:bg-[#222] transition" style={{ borderRightColor: currentService?.color || BRAND_COLOR }}>
                      <div className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                        {currentService?.name || "שירות לא זמין"}
                      </div>
                      {currentPrice && (
                        <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          ₪{currentPrice}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Add Product Button */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">מוצרים</div>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded hover:bg-gray-50 dark:hover:bg-[#222] transition"
                    onClick={() => {
                      // TODO: Add product selection logic here without opening a modal
                    }}
                  >
                    <FiPlus className="text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">הוסף מוצר</span>
                  </button>
                  
                  {/* Selected Products List */}
                  {selectedProductsForPayment.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {selectedProductsForPayment.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">{product.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              ₪{product.customerPrice || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProductsForPayment(prev => 
                                  prev.filter(p => p.id !== product.id)
                                );
                              }}
                              className="text-gray-400 hover:text-red-500 transition"
                            >
                              <FiX className="text-[14px]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder bg-white dark:bg-[#111]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">סה״כ</span>
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {(() => {
                    const servicePrice = currentPrice ? parseFloat(currentPrice) : 0;
                    const productsTotal = selectedProductsForPayment.reduce((sum, p) => {
                      return sum + (parseFloat(p.customerPrice) || 0);
                    }, 0);
                    const total = servicePrice + productsTotal;
                    return `₪${total.toFixed(2)}`;
                  })()}
                </span>
              </div>
              <button
                type="button"
                className="w-full h-[48px] rounded-full text-md font-semibold flex items-center justify-center gap-2 bg-black text-white hover:opacity-90 transition"
                onClick={() => {
                  setShowTipModal(true);
                }}
              >
                <FiCreditCard className="text-[16px]" />
                שלם
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowCancelConfirm(false)}>
          <div
            className="relative w-[90%] max-w-sm rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder p-6 shadow-2xl"
            style={{
              boxShadow: "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
            }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Close button */}
            <button
              className="absolute -left-10 top-6 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              onClick={() => setShowCancelConfirm(false)}
            >
              <FiX className="text-[20px]" />
            </button>

            {/* Warning icon - centered at top */}
            <div className="flex items-center justify-center mb-4 pt-2">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" style={{ color: BRAND_COLOR }}>
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Question text - centered */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
              האם את/ה בטוח/ה?
            </h3>

            {/* Buttons - at bottom */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                className="flex-1 px-8 py-3 rounded-full text-sm font-semibold text-white hover:opacity-90 transition apply-button-gradient"
                onClick={() => {
                  const newStatus = "בוטל";
                  setSelectedStatus(newStatus);
                  setShowCancelConfirm(false);
                  if (onStatusChange && eventId) {
                    onStatusChange(eventId, newStatus);
                  }
                  // Close the appointment summary card immediately
                  onClose();
                }}
              >
                כן
              </button>
              <button
                type="button"
                className="flex-1 px-8 py-3 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                onClick={() => setShowCancelConfirm(false)}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Changes Modal */}
      {showSaveChangesModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowSaveChangesModal(false)}>
          <div
            className="relative w-[90%] max-w-sm rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder p-6 shadow-2xl"
            style={{
              boxShadow: "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
            }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Close button */}
            <button
              className="absolute -left-10 top-6 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              onClick={() => setShowSaveChangesModal(false)}
            >
              <FiX className="text-[20px]" />
            </button>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              יש שינויים שלא נשמרו
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              האם תרצה לשמור את השינויים לפני סגירה?
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                className="flex-1 px-8 py-3 rounded-full text-sm font-semibold text-white hover:opacity-90 transition apply-button-gradient"
                onClick={handleSaveChanges}
              >
                שמור שינויים
              </button>
              <button
                type="button"
                className="flex-1 px-8 py-3 rounded-full border border-red-300 dark:border-red-700 bg-white dark:bg-[#181818] text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                onClick={handleDiscardChanges}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tip Selection Modal */}
      {showTipModal && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          {/* קליק על הרקע – סוגר את כל הפופ-אפים וכרטיס התור */}
          <div 
            className="flex-1 bg-transparent" 
            onClick={() => {
              setShowProductsModal(false);
              setShowPaymentModal(false);
              setShowTipModal(false);
              setShowPaymentMethodModal(false);
              onClose();
            }} 
            style={{ zIndex: 40 }} 
          />

          <div
            dir="rtl"
            className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
                 border-l border-gray-200 dark:border-commonBorder shadow-2xl
                 flex flex-col text-right"
            onClick={(e) => {
              if (isEditingCustomTip) {
                setIsEditingCustomTip(false);
              }
              e.stopPropagation();
            }}
          >
            {/* X מחוץ לפופ בצד שמאל למעלה */}
            <button
              className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              onClick={() => setShowTipModal(false)}
            >
              <FiX className="text-[16px]" />
            </button>

            {/* Back button - Left side of popup */}
            <button
              type="button"
              onClick={() => {
                setShowTipModal(false);
                setShowPaymentModal(true);
              }}
              className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] z-50"
            >
              <FiChevronRight className="text-[16px]" />
            </button>

            {/* HEADER - כמו Fresha */}
            <div className="px-5 py-7 min-h-[125px] relative overflow-visible">
              {/* Background image - flipped */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  backgroundImage: `url(${grassBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: '40% 16%',
                  backgroundRepeat: 'no-repeat',
                  transform: 'scaleX(-1)',
                }}
              />
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 text-sm text-gray-800 dark:text-gray-100">

              {/* Tip Options Grid */}
              <div className="grid grid-cols-2 gap-4">
              {/* No Tip - Default */}
              <button
                type="button"
                onClick={() => setSelectedTip(null)}
                className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all hover:shadow-xl hover:scale-[1.02] ${
                  selectedTip === null
                    ? 'border-2'
                    : 'border-gray-200/50 dark:border-gray-700/50'
                }`}
                style={selectedTip === null ? { borderColor: BRAND_COLOR } : {}}
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  בלי טיפ
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₪0
                </div>
              </button>

              {/* 5% */}
              <button
                type="button"
                onClick={() => setSelectedTip(5)}
                className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all hover:shadow-xl hover:scale-[1.02] ${
                  selectedTip === 5
                    ? 'border-2'
                    : 'border-gray-200/50 dark:border-gray-700/50'
                }`}
                style={selectedTip === 5 ? { borderColor: BRAND_COLOR } : {}}
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  5%
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const servicePrice = currentPrice ? parseFloat(currentPrice) : 0;
                    const productsTotal = selectedProductsForPayment.reduce((sum, p) => {
                      return sum + (parseFloat(p.customerPrice) || 0);
                    }, 0);
                    const total = servicePrice + productsTotal;
                    return `₪${(total * 0.05).toFixed(2)}`;
                  })()}
                </div>
              </button>

              {/* 10% */}
              <button
                type="button"
                onClick={() => setSelectedTip(10)}
                className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all hover:shadow-xl hover:scale-[1.02] ${
                  selectedTip === 10
                    ? 'border-2'
                    : 'border-gray-200/50 dark:border-gray-700/50'
                }`}
                style={selectedTip === 10 ? { borderColor: BRAND_COLOR } : {}}
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  10%
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const servicePrice = currentPrice ? parseFloat(currentPrice) : 0;
                    const productsTotal = selectedProductsForPayment.reduce((sum, p) => {
                      return sum + (parseFloat(p.customerPrice) || 0);
                    }, 0);
                    const total = servicePrice + productsTotal;
                    return `₪${(total * 0.10).toFixed(2)}`;
                  })()}
                </div>
              </button>

              {/* 12% */}
              <button
                type="button"
                onClick={() => setSelectedTip(12)}
                className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all hover:shadow-xl hover:scale-[1.02] ${
                  selectedTip === 12
                    ? 'border-2'
                    : 'border-gray-200/50 dark:border-gray-700/50'
                }`}
                style={selectedTip === 12 ? { borderColor: BRAND_COLOR } : {}}
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  12%
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const servicePrice = currentPrice ? parseFloat(currentPrice) : 0;
                    const productsTotal = selectedProductsForPayment.reduce((sum, p) => {
                      return sum + (parseFloat(p.customerPrice) || 0);
                    }, 0);
                    const total = servicePrice + productsTotal;
                    return `₪${(total * 0.12).toFixed(2)}`;
                  })()}
                </div>
              </button>

              {/* 15% */}
              <button
                type="button"
                onClick={() => setSelectedTip(15)}
                className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all hover:shadow-xl hover:scale-[1.02] ${
                  selectedTip === 15
                    ? 'border-2'
                    : 'border-gray-200/50 dark:border-gray-700/50'
                }`}
                style={selectedTip === 15 ? { borderColor: BRAND_COLOR } : {}}
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  15%
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const servicePrice = currentPrice ? parseFloat(currentPrice) : 0;
                    const productsTotal = selectedProductsForPayment.reduce((sum, p) => {
                      return sum + (parseFloat(p.customerPrice) || 0);
                    }, 0);
                    const total = servicePrice + productsTotal;
                    return `₪${(total * 0.15).toFixed(2)}`;
                  })()}
                </div>
              </button>

              {/* 20% */}
              <button
                type="button"
                onClick={() => setSelectedTip(20)}
                className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all hover:shadow-xl hover:scale-[1.02] ${
                  selectedTip === 20
                    ? 'border-2'
                    : 'border-gray-200/50 dark:border-gray-700/50'
                }`}
                style={selectedTip === 20 ? { borderColor: BRAND_COLOR } : {}}
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  20%
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const servicePrice = currentPrice ? parseFloat(currentPrice) : 0;
                    const productsTotal = selectedProductsForPayment.reduce((sum, p) => {
                      return sum + (parseFloat(p.customerPrice) || 0);
                    }, 0);
                    const total = servicePrice + productsTotal;
                    return `₪${(total * 0.20).toFixed(2)}`;
                  })()}
                </div>
              </button>

              {/* Custom Tip Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTip('custom');
                  setIsEditingCustomTip(true);
                }}
                className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all hover:shadow-xl hover:scale-[1.02] ${
                  selectedTip === 'custom'
                    ? 'border-2'
                    : 'border-gray-200/50 dark:border-gray-700/50'
                }`}
                style={selectedTip === 'custom' ? { borderColor: BRAND_COLOR } : {}}
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  עריכת סכום טיפ
                </div>
                {selectedTip === 'custom' && isEditingCustomTip ? (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomTipType("amount");
                        }}
                        className={`px-2 py-1 rounded text-xs ${
                          customTipType === "amount"
                            ? "bg-black text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        ₪
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomTipType("percentage");
                        }}
                        className={`px-2 py-1 rounded text-xs ${
                          customTipType === "percentage"
                            ? "bg-black text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        %
                      </button>
                    </div>
                    <input
                      type="number"
                      value={customTipAmount}
                      onChange={(e) => setCustomTipAmount(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setIsEditingCustomTip(false);
                        }
                      }}
                      placeholder={customTipType === "amount" ? "₪0" : "0%"}
                      className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none w-full"
                      dir="rtl"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    {customTipType === "percentage" && customTipAmount && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        = ₪{(() => {
                          const servicePrice = currentPrice ? parseFloat(currentPrice) : 0;
                          const productsTotal = selectedProductsForPayment.reduce((sum, p) => {
                            return sum + (parseFloat(p.customerPrice) || 0);
                          }, 0);
                          const total = servicePrice + productsTotal;
                          const percentage = parseFloat(customTipAmount) || 0;
                          return (total * (percentage / 100)).toFixed(2);
                        })()}
                      </div>
                    )}
                  </div>
                ) : selectedTip === 'custom' ? (
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customTipAmount ? (
                      customTipType === "amount" ? `₪${customTipAmount}` : `${customTipAmount}%`
                    ) : (
                      <FiEdit className="inline-block" />
                    )}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    <FiEdit className="inline-block" />
                  </div>
                )}
              </button>
            </div>

            </div>

            {/* FOOTER */}
            <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder bg-white dark:bg-[#111]">
              <button
                type="button"
                className="w-full h-[48px] rounded-full text-md font-semibold flex items-center justify-center gap-2 bg-black text-white hover:opacity-90 transition"
                onClick={() => {
                  // Save custom tip if editing
                  if (isEditingCustomTip) {
                    setIsEditingCustomTip(false);
                  }
                  // Open payment method modal
                  setShowTipModal(false);
                  setShowPaymentMethodModal(true);
                }}
              >
                <FiCreditCard className="text-[16px]" />
                המשך לתשלום
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      {showPaymentMethodModal && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          {/* קליק על הרקע – סוגר את כל הפופ-אפים וכרטיס התור */}
          <div 
            className="flex-1 bg-transparent" 
            onClick={() => {
              setShowProductsModal(false);
              setShowPaymentModal(false);
              setShowTipModal(false);
              setShowPaymentMethodModal(false);
              onClose();
            }} 
            style={{ zIndex: 40 }} 
          />

          <div
            dir="rtl"
            className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
                 border-l border-gray-200 dark:border-commonBorder shadow-2xl
                 flex flex-col text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* X מחוץ לפופ בצד שמאל למעלה */}
            <button
              className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              onClick={() => setShowPaymentMethodModal(false)}
            >
              <FiX className="text-[16px]" />
            </button>

            {/* Back button - Left side of popup */}
            <button
              type="button"
              onClick={() => {
                setShowPaymentMethodModal(false);
                setShowTipModal(true);
              }}
              className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] z-50"
            >
              <FiChevronRight className="text-[16px]" />
            </button>

            {/* HEADER - כמו Fresha */}
            <div className="px-5 py-7 min-h-[125px] relative overflow-visible">
              {/* Background image - flipped */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  backgroundImage: `url(${grassBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: '40% 16%',
                  backgroundRepeat: 'no-repeat',
                  transform: 'scaleX(-1)',
                }}
              />
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 text-sm text-gray-800 dark:text-gray-100">
              {/* Payment Methods Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* EMV */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMethod('EMV');
                    // TODO: Handle payment processing with selected method
                    setShowPaymentMethodModal(false);
                    setShowPaymentModal(false);
                  }}
                  className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl hover:scale-[1.05] hover:-translate-y-1 ${
                    selectedPaymentMethod === 'EMV'
                      ? 'border-2'
                      : 'border-gray-200/50 dark:border-gray-700/50'
                  }`}
                  style={selectedPaymentMethod === 'EMV' ? { borderColor: BRAND_COLOR } : {}}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2 animate-pulse">
                      <FiCreditCard className="text-gray-600 dark:text-gray-300 text-xl" />
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      EMV
                    </div>
                  </div>
                </button>

                {/* אשראי ידני */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMethod('אשראי ידני');
                    // TODO: Handle payment processing with selected method
                    setShowPaymentMethodModal(false);
                    setShowPaymentModal(false);
                  }}
                  className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl hover:scale-[1.05] hover:-translate-y-1 ${
                    selectedPaymentMethod === 'אשראי ידני'
                      ? 'border-2'
                      : 'border-gray-200/50 dark:border-gray-700/50'
                  }`}
                  style={selectedPaymentMethod === 'אשראי ידני' ? { borderColor: BRAND_COLOR } : {}}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2 animate-pulse">
                      <FiEdit className="text-gray-600 dark:text-gray-300 text-xl" />
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                      אשראי ידני
                    </div>
                  </div>
                </button>

                {/* מזומן */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMethod('מזומן');
                    // TODO: Handle payment processing with selected method
                    setShowPaymentMethodModal(false);
                    setShowPaymentModal(false);
                  }}
                  className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl hover:scale-[1.05] hover:-translate-y-1 ${
                    selectedPaymentMethod === 'מזומן'
                      ? 'border-2'
                      : 'border-gray-200/50 dark:border-gray-700/50'
                  }`}
                  style={selectedPaymentMethod === 'מזומן' ? { borderColor: BRAND_COLOR } : {}}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2 animate-pulse">
                      <FiDollarSign className="text-gray-600 dark:text-gray-300 text-xl" />
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      מזומן
                    </div>
                  </div>
                </button>

                {/* פייבוקס */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMethod('פייבוקס');
                    // TODO: Handle payment processing with selected method
                    setShowPaymentMethodModal(false);
                    setShowPaymentModal(false);
                  }}
                  className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl hover:scale-[1.05] hover:-translate-y-1 ${
                    selectedPaymentMethod === 'פייבוקס'
                      ? 'border-2'
                      : 'border-gray-200/50 dark:border-gray-700/50'
                  }`}
                  style={selectedPaymentMethod === 'פייבוקס' ? { borderColor: BRAND_COLOR } : {}}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-12 mb-2 flex items-center justify-center">
                      <img 
                        src={payboxLogo} 
                        alt="Paybox" 
                        className="max-w-full max-h-full object-contain rounded-lg animate-pulse"
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      פייבוקס
                    </div>
                  </div>
                </button>

                {/* ביט */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMethod('ביט');
                    // TODO: Handle payment processing with selected method
                    setShowPaymentMethodModal(false);
                    setShowPaymentModal(false);
                  }}
                  className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl hover:scale-[1.05] hover:-translate-y-1 ${
                    selectedPaymentMethod === 'ביט'
                      ? 'border-2'
                      : 'border-gray-200/50 dark:border-gray-700/50'
                  }`}
                  style={selectedPaymentMethod === 'ביט' ? { borderColor: BRAND_COLOR } : {}}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-12 mb-2 flex items-center justify-center">
                      <img 
                        src={bitLogo} 
                        alt="Bit" 
                        className="max-w-full max-h-full object-contain rounded-lg animate-pulse"
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ביט
                    </div>
                  </div>
                </button>

                {/* העברה בנקאית */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMethod('העברה בנקאית');
                    // TODO: Handle payment processing with selected method
                    setShowPaymentMethodModal(false);
                    setShowPaymentModal(false);
                  }}
                  className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl hover:scale-[1.05] hover:-translate-y-1 ${
                    selectedPaymentMethod === 'העברה בנקאית'
                      ? 'border-2'
                      : 'border-gray-200/50 dark:border-gray-700/50'
                  }`}
                  style={selectedPaymentMethod === 'העברה בנקאית' ? { borderColor: BRAND_COLOR } : {}}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2 animate-pulse">
                      <FiFileText className="text-gray-600 dark:text-gray-300 text-xl" />
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                      העברה בנקאית
                    </div>
                  </div>
                </button>

                {/* צ'ק */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMethod('צ\'ק');
                    // TODO: Handle payment processing with selected method
                    setShowPaymentMethodModal(false);
                    setShowPaymentModal(false);
                  }}
                  className={`bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl hover:scale-[1.05] hover:-translate-y-1 ${
                    selectedPaymentMethod === 'צ\'ק'
                      ? 'border-2'
                      : 'border-gray-200/50 dark:border-gray-700/50'
                  }`}
                  style={selectedPaymentMethod === 'צ\'ק' ? { borderColor: BRAND_COLOR } : {}}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2 animate-pulse">
                      <FiFile className="text-gray-600 dark:text-gray-300 text-xl" />
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      צ'ק
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

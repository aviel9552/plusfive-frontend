/**
 * Calendar Page - Refactored Version
 * Orchestrator component that uses all the new modular components, hooks, and services
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  FiPhone, FiSearch, FiEdit, FiTrash2, FiEye, 
  FiPlus, FiChevronDown, FiFilter, FiX, FiUpload, FiDownload, FiMail, FiUser, FiDollarSign, FiMapPin, FiHome, FiCheckCircle,
  FiCalendar, FiTrendingUp, FiClock, FiStar, FiAlertCircle, FiRefreshCw, FiGlobe, FiLink, FiTarget, FiBarChart2, FiSave
} from "react-icons/fi";
import { FaStar, FaPhoneAlt } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

// Hooks
import { useCalendarView } from "../../hooks/calendar/useCalendarView";
import { useAppointments } from "../../hooks/calendar/useAppointments";
import { useBookingFlow } from "../../hooks/calendar/useBookingFlow";
import { useWaitlist } from "../../hooks/calendar/useWaitlist";
import { useCalendarData } from "../../hooks/calendar/useCalendarData";
import { useCustomerCreation } from "../../hooks/calendar/useCustomerCreation";
import { useEventFiltering } from "../../hooks/calendar/useEventFiltering";
import { useStaffTransformation } from "../../hooks/calendar/useStaffTransformation";
import { useSubscriptionCheck } from "../../hooks/useSubscriptionCheck";

// Components
import { CalendarHeader } from "../../components/calendar/CalendarHeader";
import { CalendarStaffBar } from "../../components/calendar/CalendarStaffBar";
import { TimeGrid } from "../../components/calendar/CalendarGrid/TimeGrid";
import { MonthGrid } from "../../components/calendar/CalendarGrid/MonthGrid";
import { SettingsPanel } from "../../components/calendar/Panels/SettingsPanel";
import { WaitlistPanel } from "../../components/calendar/Panels/WaitlistPanel";
import { BookingFlowPanel } from "../../components/calendar/Panels/BookingFlowPanel";
import { AppointmentSummaryCard } from "../../components/calendar/Panels/AppointmentSummaryCard";
import { ClientSummaryCard } from "../../components/calendar/Panels/ClientSummaryCard";
import { ConflictModal } from "../../components/calendar/Modals/ConflictModal";
import { OverlapModal } from "../../components/calendar/Modals/OverlapModal";
import { NewClientModal } from "../../components/calendar/Modals/NewClientModal";

// Utils & Constants
import { BRAND_COLOR, HOURS, START_HOUR, END_HOUR, SLOT_HEIGHT_MIN, uuid, CALENDAR_EVENTS_STORAGE_KEY } from "../../utils/calendar/constants";
import { CUSTOMER_STATUS } from "../../config/constants";
import gradientImage from "../../assets/gradientteam.jpg";
import whatsappIcon from "../../assets/whatsappicon.png";
import { Area, AreaChart, Tooltip, ResponsiveContainer } from 'recharts';
import { formatHeaderLabel, formatDateLocal, isSameCalendarDay, toDateOnly, isFullMonthRange, formatBookingDateLabel, formatDayLabel } from "../../utils/calendar/dateHelpers";
import { formatPhoneForBackend, formatPhoneForDisplay, formatPhoneToWhatsapp, formatPhoneForBackend as formatPhoneForBackendUtil } from "../../utils/phoneHelpers";
// Note: addCalendarClient is no longer needed - customers are managed via Redux
import { parseTime, minutesToLabel, calculateEndTime, parseServiceDuration, timeRangesOverlap, getExactStartTime, generateTimeSlots } from "../../utils/calendar/timeHelpers";
import { calculateRecurringDates, checkRecurringConflicts } from "../../utils/calendar/recurringEngine";
import { findBatchConflicts } from "../../utils/calendar/conflictDetection";
// Note: createAppointment is imported from useAppointments hook, not directly from service

// Data
import { 
  createDemoEvents 
} from "../../data/calendar/demoData";

// Redux
import { useDispatch } from "react-redux";

export default function CalendarPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  // Client profile state - using same structure as calendarClients
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [selectedClientForProfile, setSelectedClientForProfile] = useState(null);
  const [clientViewTab, setClientViewTab] = useState("details"); // "details", "appointments", or "data"
  const [dataCategoryTab, setDataCategoryTab] = useState("revenue"); // "revenue", "activity", "satisfaction", "lastVisit", "marketing"
  const [editingField, setEditingField] = useState(null); // "name", "phone", "email", "city", "address", or null
  const [editedClientData, setEditedClientData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: ""
  });
  const profileImageInputRef = useRef(null);

  // Update edited data when client changes
  useEffect(() => {
    if (selectedClientForProfile) {
      setEditedClientData({
        name: selectedClientForProfile.name || "",
        phone: selectedClientForProfile.phone || "",
        email: selectedClientForProfile.email || "",
        city: selectedClientForProfile.city || "",
        address: selectedClientForProfile.address || ""
      });
      setEditingField(null);
      setClientViewTab("details");
    }
  }, [selectedClientForProfile]);

  // Handle profile image upload
  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedClientForProfile) return;

    if (!file.type.startsWith('image/')) {
      alert('אנא בחר קובץ תמונה');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('גודל הקובץ גדול מדי. מקסימום 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      
      const updatedClients = clients.map(client => {
        if (client.id === selectedClientForProfile.id) {
          return {
            ...client,
            profileImage: base64String
          };
        }
        return client;
      });

      setClients(updatedClients);
      localStorage.setItem("calendar_clients", JSON.stringify(updatedClients));
      
      const updatedClient = updatedClients.find(c => c.id === selectedClientForProfile.id);
      setSelectedClientForProfile(updatedClient);
    };
    reader.onerror = () => {
      alert('שגיאה בקריאת הקובץ');
    };
    reader.readAsDataURL(file);
  };

  // Save edited field
  const handleSaveField = (fieldName) => {
    if (!selectedClientForProfile) return;

    const updatedClients = clients.map(client => {
      if (client.id === selectedClientForProfile.id) {
        const updates = { ...client };
        
        if (fieldName === "name") {
          updates.name = editedClientData.name;
        } else if (fieldName === "phone") {
          updates.phone = formatPhoneForBackendUtil(editedClientData.phone);
        } else if (fieldName === "email") {
          updates.email = editedClientData.email;
        } else if (fieldName === "city") {
          updates.city = editedClientData.city;
        } else if (fieldName === "address") {
          updates.address = editedClientData.address;
        }
        
        return updates;
      }
      return client;
    });

    setClients(updatedClients);
    localStorage.setItem("calendar_clients", JSON.stringify(updatedClients));
    
    const updatedClient = updatedClients.find(c => c.id === selectedClientForProfile.id);
    setSelectedClientForProfile(updatedClient);
    
    if (fieldName === "name" && updatedClient) {
      try {
        const storedAppointments = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
        if (storedAppointments) {
          const appointments = JSON.parse(storedAppointments);
          const updatedAppointments = appointments.map(appointment => {
            if (appointment.clientId === updatedClient.id) {
              const newName = updatedClient.name;
              const serviceName = appointment.serviceName || appointment.title?.split(/[–-]/)[0]?.trim() || "";
              const newTitle = serviceName ? `${serviceName} – ${newName}` : newName;
              
              return {
                ...appointment,
                client: newName,
                clientName: newName,
                title: newTitle,
              };
            }
            return appointment;
          });
          localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(updatedAppointments));
        }
      } catch (error) {
        console.error("Error updating appointments after client name change:", error);
      }
    }
    
    setEditingField(null);
  };

  // Cancel editing field
  const handleCancelEditField = (fieldName) => {
    if (selectedClientForProfile) {
      if (fieldName === "name") {
        setEditedClientData({ ...editedClientData, name: selectedClientForProfile.name || "" });
      } else if (fieldName === "phone") {
        setEditedClientData({ ...editedClientData, phone: selectedClientForProfile.phone || "" });
      } else if (fieldName === "email") {
        setEditedClientData({ ...editedClientData, email: selectedClientForProfile.email || "" });
      } else if (fieldName === "city") {
        setEditedClientData({ ...editedClientData, city: selectedClientForProfile.city || "" });
      } else if (fieldName === "address") {
        setEditedClientData({ ...editedClientData, address: selectedClientForProfile.address || "" });
      }
    }
    setEditingField(null);
  };

  // Get client appointments info
  const getClientAppointmentsInfo = (client) => {
    try {
      const storedAppointments = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
      const allAppointments = storedAppointments ? JSON.parse(storedAppointments) : [];
      
      const clientAppointments = allAppointments.filter(apt => {
        return apt.clientId === client.id || 
               apt.client === client.name ||
               (apt.clientName && apt.clientName === client.name);
      });

      if (clientAppointments.length === 0) {
        return { 
          count: 0, 
          lastVisit: null,
          lastAppointmentDate: null,
          lastAppointmentTime: null,
          lastService: "-",
          lastStaff: "-",
          lastRating: "-",
          totalRevenue: 0,
          avgRevenuePerVisit: 0,
          lostRevenue: 0,
          recoveredRevenue: 0,
          avgVisitsPerYear: null,
          daysSinceLastAppointment: null,
          avgTimeBetweenVisits: null,
          avgTimeFromBookingToAppointment: null,
          avgRating: "-",
        };
      }

      const sortedAppointments = [...clientAppointments].sort((a, b) => {
        const dateA = new Date(a.date || a.start || 0);
        const dateB = new Date(b.date || b.start || 0);
        return dateB - dateA;
      });

      const lastAppointment = sortedAppointments[0];
      
      let lastAppointmentDate = null;
      let lastAppointmentTime = null;
      if (lastAppointment.date) {
        const appointmentDate = new Date(lastAppointment.date + 'T00:00:00');
        lastAppointmentDate = appointmentDate;
      }
      if (lastAppointment.start) {
        lastAppointmentTime = lastAppointment.start;
      }
      
      // Format last visit like in client card: date + time
      let lastVisit = null;
      if (lastAppointmentDate) {
        lastVisit = formatDate(lastAppointmentDate);
        if (lastAppointmentTime) {
          lastVisit += ` ${lastAppointmentTime}`;
        }
      }

      let lastService = "-";
      if (lastAppointment.serviceName) {
        lastService = lastAppointment.serviceName;
      } else if (lastAppointment.serviceId) {
        lastService = lastAppointment.title?.split(/[–-]/)[0]?.trim() || "-";
      }

      let lastStaff = "-";
      if (lastAppointment.staffName) {
        lastStaff = lastAppointment.staffName;
      } else if (lastAppointment.staff) {
        lastStaff = lastAppointment.staff;
      }

      let lastRating = "-";
      const rating = lastAppointment.rating || lastAppointment.clientRating;
      if (rating && rating !== "-" && !isNaN(parseFloat(rating))) {
        lastRating = rating;
      }
      if (lastRating === "-") {
        lastRating = client.rating || "-";
      }

      const sortedByDate = [...clientAppointments].sort((a, b) => {
        const dateA = new Date(a.date || a.start || 0);
        const dateB = new Date(b.date || b.start || 0);
        return dateA - dateB;
      });

      const totalRevenue = sortedByDate.reduce((sum, apt) => {
        const price = apt.price || apt.servicePrice || 0;
        return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
      }, 0) || client.totalRevenue || 0;

      const avgRevenuePerVisit = clientAppointments.length > 0 ? Math.round(totalRevenue / clientAppointments.length) : 0;

      const lostRevenue = sortedByDate
        .filter(apt => {
          const status = apt.status || "";
          return status === "אבוד" || status === CUSTOMER_STATUS.LOST || status === "Lost";
        })
        .reduce((sum, apt) => {
          const price = apt.price || apt.servicePrice || 0;
          return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
        }, 0);

      const recoveredRevenue = sortedByDate
        .filter(apt => {
          const status = apt.status || "";
          return status === "התאושש" || status === CUSTOMER_STATUS.RECOVERED || status === "Recovered";
        })
        .reduce((sum, apt) => {
          const price = apt.price || apt.servicePrice || 0;
          return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
        }, 0);

      let avgVisitsPerYear = null;
      if (sortedByDate.length > 0) {
        const firstAppointment = sortedByDate[0];
        const lastAppointment = sortedByDate[sortedByDate.length - 1];
        const firstDate = new Date(firstAppointment.date || firstAppointment.start);
        const lastDate = new Date(lastAppointment.date || lastAppointment.start);
        const diffTime = lastDate - firstDate;
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        if (diffYears > 0) {
          avgVisitsPerYear = Math.round((clientAppointments.length / diffYears) * 10) / 10;
        }
      }

      let daysSinceLastAppointment = null;
      if (lastAppointmentDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastDate = new Date(lastAppointmentDate);
        lastDate.setHours(0, 0, 0, 0);
        const diffTime = today - lastDate;
        daysSinceLastAppointment = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      let avgTimeBetweenVisits = null;
      if (sortedByDate.length > 1) {
        const timeDifferences = [];
        for (let i = 1; i < sortedByDate.length; i++) {
          const date1 = new Date(sortedByDate[i - 1].date || sortedByDate[i - 1].start);
          const date2 = new Date(sortedByDate[i].date || sortedByDate[i].start);
          const diffTime = date2 - date1;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            timeDifferences.push(diffDays);
          }
        }
        if (timeDifferences.length > 0) {
          avgTimeBetweenVisits = Math.round(
            timeDifferences.reduce((sum, val) => sum + val, 0) / timeDifferences.length
          );
        }
      }

      // Average time from booking to appointment
      let avgTimeFromBookingToAppointment = null;
      if (sortedByDate.length > 0) {
        const bookingToAppointmentDifferences = [];
        sortedByDate.forEach(apt => {
          if (apt.createdAt && apt.date) {
            const bookingDate = new Date(apt.createdAt);
            const appointmentDate = new Date(apt.date || apt.start);
            const diffTime = appointmentDate - bookingDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0) {
              bookingToAppointmentDifferences.push(diffDays);
            }
          }
        });
        if (bookingToAppointmentDifferences.length > 0) {
          avgTimeFromBookingToAppointment = Math.round(
            bookingToAppointmentDifferences.reduce((sum, val) => sum + val, 0) / bookingToAppointmentDifferences.length
          );
        }
      }

      // Average rating
      let avgRating = "-";
      const ratings = sortedByDate
        .map(apt => apt.rating || apt.clientRating)
        .filter(r => r && r !== "-" && !isNaN(parseFloat(r)));
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, r) => acc + parseFloat(r), 0);
        avgRating = (sum / ratings.length).toFixed(1);
      } else {
        avgRating = client.rating || "-";
      }

      return {
        count: clientAppointments.length,
        lastVisit,
        lastAppointmentDate,
        lastAppointmentTime,
        lastService,
        lastStaff,
        lastRating,
        totalRevenue,
        avgRevenuePerVisit,
        lostRevenue,
        recoveredRevenue,
        avgVisitsPerYear,
        daysSinceLastAppointment,
        avgTimeBetweenVisits,
        avgTimeFromBookingToAppointment,
        avgRating,
        visitCount: clientAppointments.length,
        avgTimeBetweenVisitsChart: [],
        avgTimeFromBookingToAppointmentChart: [],
        avgRatingChart: [],
      };
    } catch (error) {
      console.error("Error getting client appointments info:", error);
      return { 
        count: 0, 
        lastVisit: null,
        lastAppointmentDate: null,
        lastAppointmentTime: null,
        lastService: "-",
        lastStaff: "-",
        lastRating: "-",
        totalRevenue: 0,
        avgRevenuePerVisit: 0,
        lostRevenue: 0,
        recoveredRevenue: 0,
        avgVisitsPerYear: null,
        daysSinceLastAppointment: null,
        avgTimeBetweenVisits: null,
        avgTimeFromBookingToAppointment: null,
        avgRating: "-",
        visitCount: 0,
        avgTimeBetweenVisitsChart: [],
        avgTimeFromBookingToAppointmentChart: [],
        avgRatingChart: [],
      };
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Calendar View Hook
  const {
    currentDate,
    view,
    weekStart,
    slotHeight,
    appliedSlotHeight,
    customWeekStart,
    setCurrentDate,
    setView: changeView,
    setSlotHeight,
    setAppliedSlotHeight,
    setCustomWeekStart,
    handlePrev,
    handleNext,
    jumpToToday,
    applyZoom,
    resetZoom,
  } = useCalendarView();

  // Appointments Hook
  const {
    appointments: customEvents,
    loadAppointments,
    createAppointment: createAppointmentHook, // Rename to avoid conflict
    createAppointments,
    updateAppointment: updateAppointmentOriginal,
    deleteAppointment: deleteAppointmentOriginal,
    setAppointments: setCustomEvents,
    getHasConflict,
    resetConflict,
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useAppointments();

  // Wrapper for updateAppointment with subscription check
  const updateAppointment = (eventId, updateData) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי לעדכן תורים. אנא הירשם למנוי כדי להמשיך.');
      return;
    }
    return updateAppointmentOriginal(eventId, updateData);
  };

  // Wrapper for deleteAppointment with subscription check
  const deleteAppointment = (eventId) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי למחוק תורים. אנא הירשם למנוי כדי להמשיך.');
      return;
    }
    return deleteAppointmentOriginal(eventId);
  };

  // Refs for request deduplication and cancellation
  const inFlightRef = useRef(false);
  const lastRangeKeyRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Calculate stable date range (memoized to prevent recreation)
  // IMPORTANT: Compute range in local time (Jerusalem), then convert to UTC ISO for API
  // This ensures we request the correct UTC range that corresponds to the local date range
  const dateRange = useMemo(() => {
    // Calculate date range based on current view
    let startDate, endDate;
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    
    if (view === 'day') {
      // For day view, load appointments for the selected day ± 1 day for buffer
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      // For week view, load appointments for the week
      const weekStartDate = new Date(weekStart);
      weekStartDate.setHours(0, 0, 0, 0);
      startDate = new Date(weekStartDate);
      endDate = new Date(weekStartDate);
      endDate.setDate(endDate.getDate() + 7);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // For month view, load appointments for the entire month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Convert to UTC ISO strings for API (single conversion, no double shifting)
    // The Date object represents local time, toISOString() converts to UTC
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();
    const rangeKey = `${startISO}|${endISO}`;
    
    if (import.meta.env.DEV) {
      // Log both local and UTC for debugging - ENHANCED
      // console.log('[CALENDAR] 📅 Date range computed:', {
      //   view,
      //   currentDate: currentDate.toISOString(),
      //   localStart: startDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
      //   localEnd: endDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
      //   utcStart: startISO,
      //   utcEnd: endISO,
      //   startDateObj: startDate.toString(),
      //   endDateObj: endDate.toString(),
      //   // Verify: parse back from ISO to check for timezone shifts
      //   parsedStart: new Date(startISO).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
      //   parsedEnd: new Date(endISO).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
      // });
    }
    
    return { rangeKey, startISO, endISO, startDate, endDate };
  }, [currentDate, view, weekStart]);

  // Extract stable rangeKey for dependency tracking
  const rangeKey = dateRange.rangeKey;
  const startISO = dateRange.startISO;
  const endISO = dateRange.endISO;

  // Load appointments from server on mount and when date/view changes
  useEffect(() => {
    // Deduplication: Skip if same range is already in-flight
    if (rangeKey === lastRangeKeyRef.current && inFlightRef.current) {
      if (import.meta.env.DEV) {
        console.log('[CALENDAR] Skipping duplicate request for range:', rangeKey);
      }
      return;
    }
    
    // Cancel previous request if range changed
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Mark as in-flight and update last range key
    inFlightRef.current = true;
    lastRangeKeyRef.current = rangeKey;
    
    const fetchAppointmentsForDateRange = async () => {
      try {
        const filters = {
          start: startISO,
          end: endISO,
        };
        
        if (import.meta.env.DEV) {
          // Log range in both ISO and local time for debugging
          const startDateLocal = new Date(startISO);
          const endDateLocal = new Date(endISO);
          // console.log('[CALENDAR] Loading appointments for date range:', {
          //   startISO,
          //   endISO,
          //   startLocal: startDateLocal.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
          //   endLocal: endDateLocal.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
          //   view,
          //   currentDate: currentDate.toISOString(),
          //   weekStart: weekStart?.toISOString(),
          // });
        }
        
        await loadAppointments(filters, abortController.signal);
      } catch (error) {
        // Ignore abort errors
        if (error.name === 'AbortError' || error.name === 'CanceledError' || abortController.signal.aborted) {
          return;
        }
        console.error('[CALENDAR] Failed to load appointments:', error);
        // Error will be handled by useAppointments hook and shown to user
      } finally {
        // Only clear in-flight flag if this was the current request
        if (abortControllerRef.current === abortController) {
          inFlightRef.current = false;
        }
      }
    };
    
    fetchAppointmentsForDateRange();
    
    // Cleanup: abort request on unmount or when dependencies change
    return () => {
      if (abortControllerRef.current === abortController) {
        abortController.abort();
        abortControllerRef.current = null;
        inFlightRef.current = false;
      }
    };
  }, [rangeKey, startISO, endISO, loadAppointments]); // Only depend on stable primitive values

  // Calculate advanced statistics for selected client (after customEvents is defined)
  // Calculate advanced statistics for selected client (matching calendarClients logic)
  const clientAdvancedStats = useMemo(() => {
    if (!selectedClientForProfile) {
      return null;
    }

    try {
      // Load appointments from localStorage
      const storedAppointments = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
      const allAppointments = storedAppointments ? JSON.parse(storedAppointments) : [];
      
      // Filter appointments for this client
      const clientAppointments = allAppointments.filter(apt => {
        return apt.clientId === selectedClientForProfile.id || 
               apt.client === selectedClientForProfile.name ||
               (apt.clientName && apt.clientName === selectedClientForProfile.name);
      });

      if (clientAppointments.length === 0) {
        return {
          totalRevenue: selectedClientForProfile.totalRevenue || 0,
          visitCount: 0,
          avgVisitsPerYear: null,
          avgRevenuePerVisit: 0,
          avgTimeBetweenVisits: null,
          avgTimeBetweenVisitsChart: [],
          avgRating: selectedClientForProfile.rating || "-",
          avgRatingChart: [],
          lastRating: selectedClientForProfile.rating || "-",
          lastAppointmentDate: null,
          lastAppointmentTime: null,
          lastService: "-",
          lastStaff: "-",
          lostRevenue: 0,
          recoveredRevenue: 0,
          daysSinceLastAppointment: null,
          timeToConversion: null,
          avgTimeFromBookingToAppointment: null,
          avgTimeFromBookingToAppointmentChart: [],
        };
      }

      // Sort appointments by date
      const sortedAppointments = [...clientAppointments].sort((a, b) => {
        const dateA = new Date(a.date || a.start || 0);
        const dateB = new Date(b.date || b.start || 0);
        return dateA - dateB;
      });

      // Calculate total revenue
      const totalRevenue = sortedAppointments.reduce((sum, apt) => {
        const price = apt.price || apt.servicePrice || 0;
        return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
      }, 0) || selectedClientForProfile.totalRevenue || 0;

      // Visit count
      const visitCount = sortedAppointments.length;

      // Average visits per year
      let avgVisitsPerYear = null;
      if (sortedAppointments.length > 0) {
        const firstAppointment = sortedAppointments[0];
        const lastAppointment = sortedAppointments[sortedAppointments.length - 1];
        const firstDate = new Date(firstAppointment.date || firstAppointment.start);
        const lastDate = new Date(lastAppointment.date || lastAppointment.start);
        
        // Calculate difference in years
        const diffTime = lastDate - firstDate;
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25); // Account for leap years
        
        if (diffYears > 0) {
          avgVisitsPerYear = Math.round((visitCount / diffYears) * 10) / 10; // Round to 1 decimal place
        } else {
          // If all appointments are on the same day or very close, calculate based on days since first appointment
          const today = new Date();
          const daysSinceFirst = (today - firstDate) / (1000 * 60 * 60 * 24);
          if (daysSinceFirst > 0) {
            const yearsSinceFirst = daysSinceFirst / 365.25;
            avgVisitsPerYear = Math.round((visitCount / yearsSinceFirst) * 10) / 10;
          } else {
            avgVisitsPerYear = visitCount; // If it's the same day, just use visit count
          }
        }
      }

      // Average revenue per visit
      const avgRevenuePerVisit = visitCount > 0 ? Math.round(totalRevenue / visitCount) : 0;

      // Average time between visits (in days) and chart data
      let avgTimeBetweenVisits = null;
      const avgTimeBetweenVisitsChart = [];
      if (sortedAppointments.length > 1) {
        const timeDifferences = [];
        for (let i = 1; i < sortedAppointments.length; i++) {
          const date1 = new Date(sortedAppointments[i - 1].date || sortedAppointments[i - 1].start);
          const date2 = new Date(sortedAppointments[i].date || sortedAppointments[i].start);
          const diffDays = Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            timeDifferences.push(diffDays);
            avgTimeBetweenVisitsChart.push({
              name: `${i}`,
              value: diffDays,
            });
          }
        }
        if (timeDifferences.length > 0) {
          avgTimeBetweenVisits = Math.round(
            timeDifferences.reduce((sum, val) => sum + val, 0) / timeDifferences.length
          );
        }
      }

      // Average rating and chart data
      const ratings = sortedAppointments
        .map(apt => apt.rating || apt.clientRating)
        .filter(r => r && r !== "-" && !isNaN(parseFloat(r)));
      
      let avgRating = "-";
      const avgRatingChart = [];
      if (ratings.length > 0) {
        const numericRatings = ratings.map(r => parseFloat(r));
        avgRating = (numericRatings.reduce((sum, r) => sum + r, 0) / numericRatings.length).toFixed(1);
        
        // Create chart data for ratings over time
        sortedAppointments.forEach((apt, index) => {
          const rating = apt.rating || apt.clientRating;
          if (rating && rating !== "-" && !isNaN(parseFloat(rating))) {
            avgRatingChart.push({
              name: `${index + 1}`,
              value: parseFloat(rating),
            });
          }
        });
      } else {
        avgRating = selectedClientForProfile.rating || "-";
      }

      // Last visit details (from most recent appointment)
      let lastAppointmentDate = null;
      let lastAppointmentTime = null;
      let lastService = "-";
      let lastStaff = "-";
      let lastRating = "-";
      
      if (sortedAppointments.length > 0) {
        // Get the most recent appointment (last in sorted array)
        const lastAppointment = sortedAppointments[sortedAppointments.length - 1];
        
        // Last appointment date and time
        if (lastAppointment.date) {
          const appointmentDate = new Date(lastAppointment.date + 'T00:00:00');
          lastAppointmentDate = appointmentDate;
        }
        if (lastAppointment.start) {
          lastAppointmentTime = lastAppointment.start;
        }
        
        // Last service
        if (lastAppointment.serviceName) {
          lastService = lastAppointment.serviceName;
        } else if (lastAppointment.serviceId) {
          // Try to find service name from serviceId if needed
          lastService = lastAppointment.title?.split(/[–-]/)[0]?.trim() || "-";
        }
        
        // Last staff
        if (lastAppointment.staffName) {
          lastStaff = lastAppointment.staffName;
        } else if (lastAppointment.staff) {
          lastStaff = lastAppointment.staff;
        }
        
        // Last rating
        const rating = lastAppointment.rating || lastAppointment.clientRating;
        if (rating && rating !== "-" && !isNaN(parseFloat(rating))) {
          lastRating = rating;
        }
      }
      
      // If no rating found in appointments, use client's rating
      if (lastRating === "-") {
        lastRating = selectedClientForProfile.rating || "-";
      }

      // Lost revenue (appointments with status "אבוד" or "lost")
      const lostRevenue = sortedAppointments
        .filter(apt => {
          const status = apt.status || "";
          return status === "אבוד" || status === CUSTOMER_STATUS.LOST || status === "Lost";
        })
        .reduce((sum, apt) => {
          const price = apt.price || apt.servicePrice || 0;
          return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
        }, 0);

      // Recovered revenue (appointments with status "התאושש" or "recovered")
      const recoveredRevenue = sortedAppointments
        .filter(apt => {
          const status = apt.status || "";
          return status === "התאושש" || status === CUSTOMER_STATUS.RECOVERED || status === "Recovered";
        })
        .reduce((sum, apt) => {
          const price = apt.price || apt.servicePrice || 0;
          return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
        }, 0);

      // Days since last appointment
      let daysSinceLastAppointment = null;
      if (sortedAppointments.length > 0) {
        const lastAppointment = sortedAppointments[sortedAppointments.length - 1];
        const lastDate = new Date(lastAppointment.date || lastAppointment.start);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);
        const diffTime = today - lastDate;
        daysSinceLastAppointment = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      // Time to Conversion (from lead date to first appointment)
      let timeToConversion = null;
      if (sortedAppointments.length > 0) {
        const leadDate = selectedClientForProfile.leadDate 
          ? new Date(selectedClientForProfile.leadDate)
          : selectedClientForProfile.createdAt
          ? new Date(selectedClientForProfile.createdAt)
          : null;
          
        if (leadDate) {
          const firstAppointment = sortedAppointments[0];
          const firstAppointmentDate = new Date(firstAppointment.date || firstAppointment.start);
          
          const diffTime = firstAppointmentDate - leadDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0) {
            timeToConversion = diffDays;
          }
        }
      }

      // Average time between booking and appointment (in days)
      let avgTimeFromBookingToAppointment = null;
      const avgTimeFromBookingToAppointmentChart = [];
      if (sortedAppointments.length > 0) {
        const bookingToAppointmentDifferences = [];
        sortedAppointments.forEach((apt, index) => {
          const appointmentDate = new Date(apt.date || apt.start);
          // Try to get booking date from createdAt, or use appointment date as fallback
          let bookingDate;
          if (apt.createdAt) {
            bookingDate = new Date(apt.createdAt);
          } else if (apt.bookingDate) {
            bookingDate = new Date(apt.bookingDate);
          } else {
            // If no booking date exists, we can't calculate this metric accurately
            // For now, we'll skip appointments without booking dates
            return;
          }
          
          appointmentDate.setHours(0, 0, 0, 0);
          bookingDate.setHours(0, 0, 0, 0);
          const diffDays = Math.round((appointmentDate - bookingDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0) { // Only count if appointment is after booking
            bookingToAppointmentDifferences.push(diffDays);
            avgTimeFromBookingToAppointmentChart.push({
              name: `${index + 1}`,
              value: diffDays,
            });
          }
        });
        
        if (bookingToAppointmentDifferences.length > 0) {
          avgTimeFromBookingToAppointment = Math.round(
            bookingToAppointmentDifferences.reduce((sum, val) => sum + val, 0) / bookingToAppointmentDifferences.length
          );
        }
      }

      return {
        totalRevenue,
        visitCount,
        avgVisitsPerYear,
        avgRevenuePerVisit,
        avgTimeBetweenVisits,
        avgTimeBetweenVisitsChart,
        avgRating,
        avgRatingChart,
        lastRating,
        lastAppointmentDate,
        lastAppointmentTime,
        lastService,
        lastStaff,
        lostRevenue,
        recoveredRevenue,
        daysSinceLastAppointment,
        timeToConversion,
        avgTimeFromBookingToAppointment,
        avgTimeFromBookingToAppointmentChart,
      };
    } catch (error) {
      console.error("Error calculating advanced stats:", error);
      return null;
    }
  }, [selectedClientForProfile, customEvents]);

  // Booking Flow Hook
  const bookingFlow = useBookingFlow();

  // Check subscription status using custom hook
  const { hasActiveSubscription, subscriptionLoading } = useSubscriptionCheck({
    pageName: 'CALENDAR PAGE',
    enableLogging: false
  });
  const {
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
    setWaitlistAddStep,
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
    setIsWaitlistAddOpen,
    openBookingFlow,
    openWaitlistFlow,
    closeFlow,
  } = bookingFlow;

  // Waitlist Hook
  const waitlist = useWaitlist();
  const {
    waitlistItems,
    waitlistFilter,
    waitlistRange,
    waitlistSort,
    isWaitlistRangeOpen,
    isSortDropdownOpen,
    openWaitlistActionId,
    isWaitlistOpen,
    setWaitlistItems,
    setWaitlistFilter,
    setWaitlistRange,
    setWaitlistSort,
    setIsWaitlistRangeOpen,
    setIsSortDropdownOpen,
    setOpenWaitlistActionId,
    setIsWaitlistOpen,
    addWaitlistItem,
    updateWaitlistItem,
    deleteWaitlistItem,
    convertToAppointment,
  } = waitlist;

  // Use calendar data hook
  const {
    staffFromStorage,
    services,
    clients,
    setClients,
    isLoadingStaff,
    isLoadingServices,
    isLoadingCustomers,
  } = useCalendarData();

  // Use staff transformation hook
  const { STAFF_DAY_CALENDARS, ALL_STAFF_IDS } = useStaffTransformation(staffFromStorage);

  // Update selectedTeamMembers when ALL_STAFF_IDS changes
  const [selectedStaff, setSelectedStaff] = useState("all-business");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  useEffect(() => {
    // Only update selectedTeamMembers if we're in "all-business" mode
    // Don't override if user has selected a specific staff member
    if (selectedStaff === "all-business" && ALL_STAFF_IDS && ALL_STAFF_IDS.length > 0) {
      setSelectedTeamMembers(ALL_STAFF_IDS);
    } else if (selectedStaff === "all-business" && (!ALL_STAFF_IDS || ALL_STAFF_IDS.length === 0)) {
      // If no staff, set to empty array to prevent errors
      setSelectedTeamMembers([]);
    }
  }, [ALL_STAFF_IDS, selectedStaff]);

  // Local state for UI
  const [hoverPreview, setHoverPreview] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [rangeStartDate, setRangeStartDate] = useState(null);
  const [rangeEndDate, setRangeEndDate] = useState(null);
  const [rangeHoverDate, setRangeHoverDate] = useState(null);
  const [showOverlapModal, setShowOverlapModal] = useState(false);
  const [showBookingConflictModal, setShowBookingConflictModal] = useState(false);
  const [conflictingAppointment, setConflictingAppointment] = useState(null);
  const [showAppointmentSummary, setShowAppointmentSummary] = useState(false);
  const [appointmentSummaryData, setAppointmentSummaryData] = useState(null);
  const hasConflictRef = useRef(false);
  const resetPendingChangesRef = useRef(null);

  // Drag & Drop state
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ dateIso: null, staffId: null, y: 0, time: null });
  const [dragClickOffsetY, setDragClickOffsetY] = useState(0);
  const [activeDraggedAppointmentId, setActiveDraggedAppointmentId] = useState(null);
  const [hoveredAppointmentId, setHoveredAppointmentId] = useState(null);

  // Listen for storage changes to update appointments when client names are updated
  const appointmentsRef = useRef(customEvents);
  useEffect(() => {
    appointmentsRef.current = customEvents;
  }, [customEvents]);

  // Sync appointmentSummaryData with customEvents when it changes
  // This ensures both the calendar card and appointment panel stay in sync
  useEffect(() => {
    if (showAppointmentSummary && appointmentSummaryData?.eventId) {
      const updatedEvent = customEvents.find(e => e.id === appointmentSummaryData.eventId);
      if (updatedEvent) {
        // Re-derive appointmentSummaryData from the updated event in customEvents
        // This ensures both views always use the same source of truth
        
        // Find client from current clients list (from Redux store)
        let client = null;
        
        if (updatedEvent.clientId) {
          client = clients.find(c => c.id === updatedEvent.clientId);
        }
        
        // If not found, create from event data
        if (!client) {
          client = { 
            name: updatedEvent.client || updatedEvent.clientName || "לקוח מזדמן", 
            initials: (updatedEvent.client || updatedEvent.clientName || "ל").charAt(0) 
          };
        }
        
        if (!client.phone && (updatedEvent.phone || updatedEvent.clientPhone)) {
          client = { ...client, phone: updatedEvent.phone || updatedEvent.clientPhone };
        }
        
        // Find service
        const service = updatedEvent.serviceId
          ? services.find(s => s.id === updatedEvent.serviceId)
          : { name: updatedEvent.serviceName || updatedEvent.title?.split(/[–-]/)[0]?.trim() || "שירות לא זמין", duration: updatedEvent.duration || "", price: updatedEvent.price || "" };
        
        // Find staff
        const staff = STAFF_DAY_CALENDARS.find(s => s.id === updatedEvent.staff) || { 
          name: updatedEvent.staffName || "איש צוות לא זמין", 
          id: updatedEvent.staff,
          initials: (updatedEvent.staffName || "א").charAt(0)
        };
        
        // Format date
        const appointmentDate = updatedEvent.date ? new Date(updatedEvent.date + 'T00:00:00') : new Date();
        
        // Format time - show start and end if both available
        const timeStr = updatedEvent.start 
          ? (updatedEvent.end ? `${updatedEvent.start}–${updatedEvent.end}` : updatedEvent.start)
          : "";
        
        // Use duration from event if available, otherwise from service
        const eventDuration = updatedEvent.duration || service.duration || "";
        
        setAppointmentSummaryData({
          eventId: updatedEvent.id,
          client,
          service: {
            ...service,
            duration: eventDuration, // Use event duration (may be different from service default)
          },
          date: appointmentDate,
          time: timeStr,
          staff,
          price: updatedEvent.price || service.price || "",
          duration: eventDuration,
          recurringType: null,
          recurringDuration: null,
          status: updatedEvent.status || "נקבע תור",
        });
      }
    }
  }, [customEvents, showAppointmentSummary, services]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CALENDAR_EVENTS_STORAGE_KEY && e.newValue) {
        try {
          const updatedAppointments = JSON.parse(e.newValue);
          setCustomEvents(updatedAppointments);
        } catch (error) {
          console.error("Error updating appointments from storage change:", error);
        }
      }
    };

    // Listen for storage events (works when changes come from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Also check localStorage periodically for changes (works for same-tab updates)
    // Use a ref to track the last known appointments to avoid unnecessary updates
    let lastAppointmentsString = JSON.stringify(appointmentsRef.current);
    
    const intervalId = setInterval(() => {
      try {
        const stored = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
        if (stored && stored !== lastAppointmentsString) {
          const parsed = JSON.parse(stored);
          lastAppointmentsString = stored;
          setCustomEvents(parsed);
        }
      } catch (error) {
        // Ignore errors in interval check
      }
    }, 500); // Check every 500ms

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [setCustomEvents]); // Remove customEvents from dependencies to avoid infinite loop

  // New client modal state
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // Use customer creation hook
  const customerCreation = useCustomerCreation((newClient) => {
    // On success callback
    setSelectedWaitlistClient(newClient);
    setIsNewClientModalOpen(false);
    // If we have service and date already selected, proceed directly to appointment summary
    setTimeout(() => {
      if (bookingSelectedService && bookingSelectedDate) {
        handleFlowApply(newClient);
      }
    }, 100);
  });

  const {
    newClientName,
    setNewClientName,
    newClientPhone,
    setNewClientPhone,
    newClientEmail,
    setNewClientEmail,
    newClientCity,
    setNewClientCity,
    newClientAddress,
    setNewClientAddress,
    newClientErrors,
    setNewClientErrors,
    handleCreateNewClient,
    resetForm: resetCustomerForm,
  } = customerCreation;

  // Calculate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });
  }, [weekStart]);

  // Header label
  const headerLabel = useMemo(
    () => formatHeaderLabel(view, currentDate, weekStart, language),
    [view, currentDate, weekStart, language]
  );

  // Demo events + real events
  const demoEvents = useMemo(() => {
    const base = createDemoEvents(weekDays);
    const combined = [...base, ...customEvents];
    
    if (import.meta.env.DEV) {
      // console.log('[CAL_EVENTS] 📅 Combined events:', {
      //   demoCount: base.length,
      //   customCount: customEvents.length,
      //   totalCount: combined.length,
      //   customEvents: customEvents.map(e => ({
      //     id: e.id,
      //     date: e.date,
      //     start: e.start,
      //     end: e.end,
      //     staff: e.staff,
      //     staffId: e.staffId,
      //     status: e.status,
      //     hasDate: !!e.date,
      //     hasStart: !!e.start,
      //     hasEnd: !!e.end,
      //   })),
      //   // Check for appointments without required fields
      //   invalidEvents: customEvents.filter(e => !e.date || !e.start).map(e => ({
      //     id: e.id,
      //     date: e.date,
      //     start: e.start,
      //     staff: e.staff,
      //   })),
      // });
    }
    
    return combined;
  }, [weekDays, customEvents]);

  // Use event filtering hook
  const { filteredEvents: filteredDemoEvents, filterEvents } = useEventFiltering(
    demoEvents,
    selectedStaff,
    selectedTeamMembers
  );

  const filteredEvents = useMemo(() => {
    const filtered = filterEvents(demoEvents);

    if (import.meta.env.DEV) {
      // console.log("[FILTERED_EVENTS] 🎯 Final filtered events for rendering:", {
      //   totalDemoEvents: demoEvents.length,
      //   totalCustomEvents: customEvents.length,
      //   totalFiltered: filtered.length,
      //   view,
      //   selectedStaff,
      //   selectedTeamMembers,
      //   dateRange: {
      //     start: dateRange.startISO,
      //     end: dateRange.endISO,
      //     startLocal: new Date(dateRange.startISO).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }),
      //     endLocal: new Date(dateRange.endISO).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }),
      //   },
      //   customEventIds: customEvents.map((e) => e.id),
      //   filteredEventIds: filtered.map((e) => e.id),
      //   customEventsInFiltered: customEvents.map((custom) => ({
      //     id: custom.id,
      //     date: custom.date,
      //     start: custom.start,
      //     staff: custom.staff,
      //     inFiltered: filtered.some((f) => f.id === custom.id),
      //   })),
      // });
    }

    return filtered;
  }, [demoEvents, selectedStaff, selectedTeamMembers, STAFF_DAY_CALENDARS, view, currentDate, customEvents, dateRange, filterEvents]);

  // Check for conflicts immediately when recurring settings change
  // This triggers after completing selection in either dropdown (service type or duration)
  useEffect(() => {
    // Only check if we have all required data and it's a recurring appointment
    // Check immediately when either recurringServiceType or recurringDuration changes
    // Both must be set (not "Regular Appointment" and duration must exist)
    if (
      recurringServiceType !== "Regular Appointment" &&
      recurringDuration &&
      bookingSelectedDate &&
      bookingSelectedTime &&
      bookingSelectedService &&
      (selectedStaffForBooking || bookingSelectedStaff)
    ) {
      // Find service object
      const selectedServiceObj = services.find(
        (s) => s.id === bookingSelectedService
      );

      if (!selectedServiceObj) {
        return;
      }

      // Get staff ID
      let staffId;
      if (selectedStaffForBooking) {
        const selectedStaffObj = STAFF_DAY_CALENDARS.find(s => s.id === selectedStaffForBooking);
        staffId = selectedStaffObj?.id || selectedStaffForBooking;
      } else if (bookingSelectedStaff) {
        staffId = bookingSelectedStaff.id;
      } else {
        return; // No staff selected
      }

      // Calculate time strings
      const dateIso = bookingSelectedDate instanceof Date 
        ? formatDateLocal(bookingSelectedDate)
        : bookingSelectedDate;
      
      const timeStr = getExactStartTime(bookingSelectedTime);
      // duration is stored as a number (minutes), not a string
      const durationMinutes = typeof selectedServiceObj.duration === 'number' 
        ? selectedServiceObj.duration 
        : parseServiceDuration(selectedServiceObj.duration);
      const endTimeStr = calculateEndTime(timeStr, durationMinutes);

      // Use universal conflict detection formula
      // This works for ANY combination: Every 3 Days for 1 Year, Every Week for 2 Months, etc.
      // Use customEvents (real appointments) instead of demoEvents for accurate conflict detection
      const conflictResult = checkRecurringConflicts(
        bookingSelectedDate,
        recurringServiceType,
        recurringDuration,
        customEvents,
        timeStr,
        endTimeStr,
        staffId,
        dateIso,
        STAFF_DAY_CALENDARS,
        selectedServiceObj
      );

      if (conflictResult) {
        hasConflictRef.current = true;
        setConflictingAppointment({
          client: conflictResult.conflictingEvent.client || conflictResult.conflictingEvent.clientName || "לקוח לא ידוע",
          date: conflictResult.date,
          time: conflictResult.conflictingEvent.start && conflictResult.conflictingEvent.end 
            ? `${conflictResult.conflictingEvent.start}–${conflictResult.conflictingEvent.end}`
            : conflictResult.conflictingEvent.start || "",
          reason: conflictResult.reason || "appointment-conflict",
        });
        setShowBookingConflictModal(true);
        return; // Stop checking - we found a conflict
      }

      // No conflicts found - clear any previous conflict state
      if (hasConflictRef.current) {
        hasConflictRef.current = false;
        setShowBookingConflictModal(false);
      }
    }
  }, [recurringServiceType, recurringDuration, bookingSelectedDate, bookingSelectedTime, bookingSelectedService, selectedStaffForBooking, bookingSelectedStaff, customEvents, services, STAFF_DAY_CALENDARS]);

  // Filtered waitlist
  const filteredWaitlist = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const inRange = (item) => {
      if (waitlistRange === "all" || waitlistRange === "calendar") {
        return true;
      }

      const itemDateValue = item.date || item.requestedDate;
      if (!itemDateValue) return true;

      const itemDate = itemDateValue instanceof Date 
        ? new Date(itemDateValue)
        : new Date(itemDateValue);
      itemDate.setHours(0, 0, 0, 0);

      const diffMs = itemDate.getTime() - todayDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (waitlistRange === "today") return diffDays === 0;
      if (waitlistRange === "3days") return diffDays >= 0 && diffDays <= 3;
      if (waitlistRange === "7days") return diffDays >= 0 && diffDays <= 7;
      if (waitlistRange === "30days") return diffDays >= 0 && diffDays <= 30;

      return true;
    };

    return waitlistItems.filter(
      (item) =>
        (waitlistFilter === "all"
          ? true
          : item.status === waitlistFilter) && inRange(item)
    );
  }, [waitlistFilter, waitlistRange, waitlistItems]);

  // Handle flow apply - create appointments or waitlist entries
  const handleFlowApply = (clientOverride = null) => {
    // Use clientOverride if provided, otherwise use selectedWaitlistClient from state
    const clientToUse = clientOverride || selectedWaitlistClient;
    
    // If client is selected but other data is missing, just update the client and keep panel open
    if (clientToUse && (!bookingSelectedService || !bookingSelectedDate)) {
      setSelectedWaitlistClient(clientToUse);
      // Don't close - let user continue selecting
      return;
    }
    
    // Validation - check required fields
    if (
      !clientToUse ||
      !bookingSelectedService ||
      !bookingSelectedDate
    ) {
      console.warn("Missing required data", {
        clientToUse: !!clientToUse,
        bookingSelectedService: !!bookingSelectedService,
        bookingSelectedDate: !!bookingSelectedDate,
        bookingSelectedTime: bookingSelectedTime
      });
      return;
    }

    // Find service object
    const selectedServiceObj = services.find(
      (s) => s.id === bookingSelectedService
    );

    if (!selectedServiceObj) {
      console.warn("Service not found");
      return;
    }

    // Route based on flow mode
    if (addFlowMode === "booking") {
      // Create calendar appointment
      const dateIso = bookingSelectedDate instanceof Date 
        ? formatDateLocal(bookingSelectedDate)
        : bookingSelectedDate;
      
      // Handle "any" time - use a default time for validation
      let timeStr;
      if (!bookingSelectedTime || bookingSelectedTime === "any") {
        timeStr = "10:00"; // Default time when "any" is selected
      } else {
        timeStr = getExactStartTime(bookingSelectedTime);
      }
      
      // Build full date-time for validation
      const startDateTime = new Date(bookingSelectedDate);
      const [h, m] = timeStr.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        startDateTime.setHours(h, m, 0, 0);
      }
      
      // Use selected staff from booking flow, or pre-selected from calendar click, or fallback to default
      let staffId, staffName;
      if (selectedStaffForBooking) {
        const selectedStaffObj = STAFF_DAY_CALENDARS.find(s => s.id === selectedStaffForBooking);
        staffId = selectedStaffObj?.id || selectedStaffForBooking;
        staffName = selectedStaffObj?.name || (STAFF_DAY_CALENDARS.length > 0 ? STAFF_DAY_CALENDARS[0].name : "ללא שם");
      } else if (bookingSelectedStaff) {
        staffId = bookingSelectedStaff.id;
        staffName = bookingSelectedStaff.name;
      } else {
        const defaultStaff = STAFF_DAY_CALENDARS.find(s => s.status !== "offline" && s.status !== "not-working") || (STAFF_DAY_CALENDARS.length > 0 ? STAFF_DAY_CALENDARS[0] : null);
        staffId = defaultStaff?.id || "Dana";
        staffName = defaultStaff?.name || "דנה";
      }

      // Calculate end time based on service duration
      // duration is stored as a number (minutes), not a string
      const durationMinutes = typeof selectedServiceObj.duration === 'number' 
        ? selectedServiceObj.duration 
        : parseServiceDuration(selectedServiceObj.duration);
      const endTimeStr = calculateEndTime(timeStr, durationMinutes);

      // Calculate recurring dates if service type is recurring
      const recurringDates = recurringServiceType !== "Regular Appointment"
        ? calculateRecurringDates(bookingSelectedDate, recurringServiceType, recurringDuration)
        : [new Date(bookingSelectedDate)];

      // Use universal conflict detection formula BEFORE creating any appointments
      // This works for ANY combination: Every 3 Days for 1 Year, Every Week for 2 Months, etc.
      const conflictResult = checkRecurringConflicts(
        bookingSelectedDate,
        recurringServiceType,
        recurringDuration,
        customEvents,
        timeStr,
        endTimeStr,
        staffId,
        dateIso,
        STAFF_DAY_CALENDARS,
        selectedServiceObj
      );

          // If conflict found, show modal and DON'T create any appointments
          if (conflictResult) {
            hasConflictRef.current = true;
            setConflictingAppointment({
              client: conflictResult.conflictingEvent.client || conflictResult.conflictingEvent.clientName || "לקוח לא ידוע",
              date: conflictResult.date,
              time: conflictResult.conflictingEvent.start && conflictResult.conflictingEvent.end 
                ? `${conflictResult.conflictingEvent.start}–${conflictResult.conflictingEvent.end}`
                : conflictResult.conflictingEvent.start || "",
              reason: conflictResult.reason || "appointment-conflict",
            });
            setShowBookingConflictModal(true);
            return; // Stop here - don't create any appointments
          }

      // Show appointment summary card WITHOUT creating the appointment yet
      const staffObj = STAFF_DAY_CALENDARS.find(s => s.id === staffId);
      
      // Set appointment summary data - save all data needed to create appointment later
      setAppointmentSummaryData({
        eventId: null, // Will be created when "קבע תור" is clicked
        client: clientToUse,
        service: selectedServiceObj,
        date: bookingSelectedDate,
        time: timeStr,
        staff: staffObj || { name: staffName, id: staffId },
        price: selectedServiceObj.price,
        duration: selectedServiceObj.duration,
        recurringType: recurringServiceType !== "Regular Appointment" ? recurringServiceType : null,
        recurringDuration: recurringServiceType !== "Regular Appointment" ? recurringDuration : null,
        status: null, // Will be set to "נקבע תור" when appointment is created
        // Save data needed for creating appointment
        _pendingAppointmentData: {
          dateIso,
          timeStr,
          endTimeStr,
          staffId,
          staffName,
          bookingSelectedService,
          recurringDates,
          selectedWaitlistClient: clientToUse,
          selectedServiceObj,
        },
      });
      setShowAppointmentSummary(true);

      // Close flow and reset
      closeFlow();
      setRecurringServiceType("Regular Appointment");
      setRecurringDuration("1 Month");
      hasConflictRef.current = false;

    } else if (addFlowMode === "waitlist") {
      // Create waitlist entry
      const startDateTime = new Date(bookingSelectedDate);
      if (bookingSelectedTime && typeof bookingSelectedTime === "string" && bookingSelectedTime.includes(":")) {
        const timeStr = getExactStartTime(bookingSelectedTime);
        const [h, m] = timeStr.split(":").map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          startDateTime.setHours(h, m, 0, 0);
        }
      }

      addWaitlistItem({
        client: clientToUse,
        service: selectedServiceObj,
        date: bookingSelectedDate instanceof Date 
          ? bookingSelectedDate 
          : new Date(bookingSelectedDate),
        time: bookingSelectedTime,
        startDateTime: startDateTime.toISOString(),
        status: "waiting",
      });

      // Reset and close panel
      closeFlow();
      
      // Open waitlist panel to show the new entry
      setWaitlistFilter("waiting");
      setWaitlistRange("all");
      setIsWaitlistOpen(true);
    }
  };

  // Create appointment when "קבע תור" button is clicked
  const handleCreateAppointment = async (pendingData) => {
    // Check subscription before creating appointment
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי ליצור תורים. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    // console.log("[CREATE_APPT] save_clicked", pendingData);
    
    const {
      dateIso,
      timeStr,
      endTimeStr,
      staffId,
      staffName,
      bookingSelectedService,
      recurringDates,
      selectedWaitlistClient,
      selectedServiceObj,
    } = pendingData;

    // Note: Client is already saved via Redux when created/selected
    // No need to manually save to localStorage anymore

    // Generate first event ID for appointment summary
    const firstEventId = uuid();
    
    // Prepare appointments to create
    const appointmentsToCreate = [];
    let skippedCount = 0;
    const firstSelectedDateIso = dateIso;
    
    for (const appointmentDate of recurringDates) {
      const appointmentDateIso = formatDateLocal(appointmentDate);
      
      // Skip dates before first selected date
      if (appointmentDateIso < firstSelectedDateIso) {
        continue;
      }
      
      // Skip past dates
      const nowCheck = new Date();
      const currentDateIsoCheck = formatDateLocal(nowCheck);
      if (appointmentDateIso < currentDateIsoCheck) {
        continue;
      }
      
      // Check for duplicates
      const isDuplicate = customEvents.some((event) => {
        return (
          event.date === appointmentDateIso &&
          event.start === timeStr &&
          event.staff === staffId &&
          event.clientId === selectedWaitlistClient.id &&
          event.serviceId === bookingSelectedService
        );
      });

      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      // Prepare appointment data for API call
      const appointmentData = {
        date: appointmentDateIso,
        start: timeStr,
        end: endTimeStr,
        staff: staffId,
        staffId: staffId,
        staffName: staffName,
        clientId: selectedWaitlistClient.id,
        client: selectedWaitlistClient.name,
        serviceId: bookingSelectedService,
        serviceName: selectedServiceObj.name,
        duration: selectedServiceObj.duration,
      };

      appointmentsToCreate.push(appointmentData);
    }

    if (skippedCount > 0) {
      console.log(`[RECURRING APPOINTMENTS] Skipped ${skippedCount} appointment(s) due to duplicates`);
    }

    // Create all appointments via API using the hook (which handles server sync + state update)
    // console.log("[CREATE_APPT] calling createAppointment hook for", appointmentsToCreate.length, "appointments");
    
    if (appointmentsToCreate.length === 0) {
      console.warn("[CREATE_APPT] No appointments to create");
      return;
    }
    
    // Create appointments one by one using the hook (batch endpoint doesn't exist yet)
    // The hook handles API calls, state updates, and error handling
    const createdAppointments = [];
    const errors = [];
    
    for (const appointmentData of appointmentsToCreate) {
      try {
        if (import.meta.env.DEV) {
          // console.log("[CREATE_APPT] 🚀 Creating appointment:", {
          //   date: appointmentData.date,
          //   start: appointmentData.start,
          //   end: appointmentData.end,
          //   staff: appointmentData.staff,
          //   staffId: appointmentData.staffId,
          //   client: appointmentData.client,
          //   service: appointmentData.serviceName,
          // });
        }
        
        const created = await createAppointmentHook(appointmentData);
        createdAppointments.push(created);
        
        if (import.meta.env.DEV) {
          // console.log("[CREATE_APPT] ✅ Successfully created appointment:", {
          //   id: created?.id,
          //   date: created?.date,
          //   start: created?.start,
          //   end: created?.end,
          //   staff: created?.staff,
          //   status: created?.status,
          //   hasDate: !!created?.date,
          //   hasStart: !!created?.start,
          //   hasEnd: !!created?.end,
          //   // Check if it's in current date range
          //   inCurrentRange: created?.date && created?.date >= dateRange.startDate.toISOString().split('T')[0] && created?.date <= dateRange.endDate.toISOString().split('T')[0],
          //   dateRange: {
          //     start: dateRange.startISO,
          //     end: dateRange.endISO,
          //     startLocal: dateRange.startDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
          //     endLocal: dateRange.endDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
          //   },
          // });
        }
      } catch (error) {
        console.error("[CREATE_APPT] Failed to create appointment:", error);
        errors.push({ appointment: appointmentData, error });
        // Continue creating other appointments even if one fails
      }
    }
    
    if (errors.length > 0) {
      console.error(`[CREATE_APPT] Failed to create ${errors.length} out of ${appointmentsToCreate.length} appointments`);
      // Show error to user
      if (errors.length === appointmentsToCreate.length) {
        // All failed
        throw new Error(`נכשל ביצירת תורים: ${errors[0].error.message}`);
      } else {
        // Some failed
        console.warn(`[CREATE_APPT] Partial success: ${createdAppointments.length} created, ${errors.length} failed`);
      }
    }
    
    // Reload appointments from API to ensure we have the latest data
    // This ensures the newly created appointment appears in the calendar
    if (createdAppointments.length > 0) {
      try {
        const filters = {
          start: dateRange.startISO,
          end: dateRange.endISO,
        };
        await loadAppointments(filters);
        if (import.meta.env.DEV) {
          console.log('[CREATE_APPT] ✅ Reloaded appointments from API after creation');
        }
      } catch (reloadError) {
        console.error('[CREATE_APPT] ⚠️ Failed to reload appointments after creation:', reloadError);
        // Don't throw - appointments were created successfully, just couldn't reload
      }
    }
    
    if (import.meta.env.DEV) {
      // console.log("[CREATE_APPT] ✅ Successfully created", createdAppointments.length, "appointments");
      // console.log("[CREATE_APPT] Created appointments details:", createdAppointments.map(apt => ({
      //   id: apt.id,
      //   date: apt.date,
      //   start: apt.start,
      //   end: apt.end,
      //   staff: apt.staff,
      //   status: apt.status,
      // })));
    }
    
    // Appointments are saved to localStorage immediately by the hook
    // No need to refetch - the state is already updated
    if (import.meta.env.DEV) {
      // console.log("[CREATE_APPT] ✅ Appointments created and saved to localStorage:", {
      //   createdCount: createdAppointments.length,
      //   createdAppointmentIds: createdAppointments.map(a => a.id),
      //   createdAppointmentDates: createdAppointments.map(a => ({ id: a.id, date: a.date, start: a.start })),
      // });
    }
    
    // Note: The hook already adds appointments to state, but we refetch to ensure consistency
    /*
    setCustomEvents((prev) => {
      const newEvents = [];
      let isFirstEvent = true;
      
      for (const appointmentData of appointmentsToCreate) {
        const newEvent = {
          id: isFirstEvent ? firstEventId : uuid(),
          date: appointmentData.date,
          title: `${appointmentData.serviceName} – ${appointmentData.client}`,
          client: appointmentData.client,
          clientId: appointmentData.clientId,
          staff: appointmentData.staff,
          staffName: appointmentData.staffName,
          start: appointmentData.start,
          end: appointmentData.end,
          serviceId: appointmentData.serviceId,
          serviceName: appointmentData.serviceName,
          color: selectedServiceObj.color || BRAND_COLOR,
          status: "נקבע תור",
        };

        newEvents.push(newEvent);
        isFirstEvent = false;
      }

      return [...prev, ...newEvents];
    });
    */

    // Update appointment summary data with the created event ID and status
    setAppointmentSummaryData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        eventId: firstEventId,
        status: "נקבע תור",
        _pendingAppointmentData: undefined, // Remove pending data
      };
    });
    
    // Close the appointment summary popup after creating the appointment
    setShowAppointmentSummary(false);
    setAppointmentSummaryData(null);
  };


  // Apply date selection
  const applyDateSelection = () => {
    const hasRealRange =
      rangeStartDate &&
      rangeEndDate &&
      toDateOnly(rangeStartDate).getTime() !== toDateOnly(rangeEndDate).getTime();

    if (hasRealRange && isFullMonthRange(rangeStartDate, rangeEndDate)) {
      const monthDate = new Date(
        rangeStartDate.getFullYear(),
        rangeStartDate.getMonth(),
        1
      );
      setCurrentDate(monthDate);
      changeView("month");
      setCustomWeekStart(null);
    } else if (hasRealRange) {
      const startOnly = toDateOnly(rangeStartDate);
      setCurrentDate(startOnly);
      changeView("week");
      setCustomWeekStart(startOnly);
    } else if (rangeStartDate) {
      const startOnly = toDateOnly(rangeStartDate);
      setCurrentDate(startOnly);
      changeView("day");
      setCustomWeekStart(null);
    } else if (selectedDate) {
      const d = toDateOnly(selectedDate);
      setCurrentDate(d);
      changeView("day");
      setCustomWeekStart(null);
    }

    setIsDatePickerOpen(false);
  };

  // Day column click handler
  const handleDayColumnClick = (e, iso, staff, isWeekView = false) => {
    if (!staff || staff.status === "offline" || staff.status === "not-working") {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    let y = e.clientY - rect.top;
    const maxHeight = HOURS.length * appliedSlotHeight;
    if (y < 0) y = 0;
    if (y > maxHeight) y = maxHeight;

    // Check if clicking on an appointment before opening booking flow
    // Same logic for both day and week view - check only staff-specific events
    const events = filterEvents(demoEvents);
    const dayEvents = events.filter((ev) => ev.date === iso);
    const staffEvents = dayEvents.filter((ev) => ev.staff === staff.id);
    
    const isOverAppointment = staffEvents.some((event) => {
      const eventStart = parseTime(event.start);
      const eventEnd = parseTime(event.end);
      const eventTop = (eventStart - START_HOUR) * appliedSlotHeight;
      const eventHeight = Math.max((eventEnd - eventStart) * appliedSlotHeight - 2, 10);
      const eventBottom = eventTop + eventHeight;
      return y >= eventTop - 2 && y <= eventBottom + 2;
    });

    // If clicking on an appointment, don't open booking flow
    // The appointment's onClick handler will handle it
    if (isOverAppointment) {
      return;
    }

    const slot5 = appliedSlotHeight / 12;
    let slotIndex = Math.floor(y / slot5);
    if (slotIndex < 0) slotIndex = 0;
    const maxIndex = HOURS.length * 12 - 1;
    if (slotIndex > maxIndex) slotIndex = maxIndex;

    const totalMinutes = START_HOUR * 60 + slotIndex * 5;
    const timeLabel = minutesToLabel(totalMinutes);

    // Open booking flow
    openBookingFlow({
      date: iso,
      time: timeLabel,
      staff: staff,
      step: "service",
    });
  };

  // Day mouse move handler
  const handleDayMouseMove = (iso, e, staffId = null, isWeekView = false) => {
    if (draggedEvent) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const events = filterEvents(demoEvents);
    const dayEvents = events.filter((ev) => ev.date === iso);
    
    // Check only staff-specific events (same logic for both day and week view)
    // This ensures hoverPreview shows in free time slots
    const staffEvents = dayEvents.filter((ev) => ev.staff === staffId);

    const isOverAppointment = staffEvents.some((event) => {
      const eventStart = parseTime(event.start);
      const eventEnd = parseTime(event.end);
      const eventTop = (eventStart - START_HOUR) * appliedSlotHeight;
      const eventHeight = Math.max((eventEnd - eventStart) * appliedSlotHeight - 2, 10);
      const eventBottom = eventTop + eventHeight;
      return y >= eventTop - 2 && y <= eventBottom + 2;
    });

    if (isOverAppointment) {
      setHoverPreview(null);
      return;
    }

    const slot5 = appliedSlotHeight / 12;
    let slotIndex = Math.floor(y / slot5);
    if (slotIndex < 0) slotIndex = 0;
    const maxIndex = HOURS.length * 12 - 1;
    if (slotIndex > maxIndex) slotIndex = maxIndex;

    const top = slotIndex * slot5;
    const totalMinutes = START_HOUR * 60 + slotIndex * 5;
    const label = minutesToLabel(totalMinutes);

    setHoverPreview({ iso, top, label, staffId });
  };

  const handleDayMouseLeave = () => {
    setHoverPreview(null);
  };

  // Appointment drag handlers
  const handleAppointmentDragStart = (e, event, dateIso, staffId) => {
    e.stopPropagation();
    setDraggedEvent(event);
    setActiveDraggedAppointmentId(event.id);

    const rect = e.currentTarget.getBoundingClientRect();
    const columnRect = e.currentTarget.closest('[data-column]')?.getBoundingClientRect();
    if (columnRect) {
      const mouseYRelativeToColumn = e.clientY - columnRect.top;
      const eventStart = parseTime(event.start);
      const appointmentTopRelativeToColumn = (eventStart - START_HOUR) * appliedSlotHeight;
      const clickOffsetY = mouseYRelativeToColumn - appointmentTopRelativeToColumn;
      setDragClickOffsetY(clickOffsetY);

      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      const currentY = appointmentTopRelativeToColumn;
      const slot5 = appliedSlotHeight / 12;
      let slotIndex = Math.floor(currentY / slot5);
      if (slotIndex < 0) slotIndex = 0;
      const maxIndex = HOURS.length * 12 - 1;
      if (slotIndex > maxIndex) slotIndex = maxIndex;
      const snappedY = slotIndex * slot5;
      const totalMinutes = START_HOUR * 60 + slotIndex * 5;
      const timeLabel = minutesToLabel(totalMinutes);
      setDragPosition({ dateIso, staffId, y: snappedY, time: timeLabel });
    }

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");

    const dragImage = document.createElement("img");
    dragImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    dragImage.style.width = "1px";
    dragImage.style.height = "1px";
    dragImage.style.opacity = "0";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
  };

  const handleAppointmentDragEnd = (e) => {
    e.stopPropagation();
    setDraggedEvent(null);
    setActiveDraggedAppointmentId(null);
    setDragOffset({ x: 0, y: 0 });
    setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
    setDragClickOffsetY(0);
  };

  // Appointment drop handler
  // Handle appointment click - open summary card
  const handleAppointmentClick = (e, event) => {
    e.stopPropagation();
    
    // Find client - prioritize localStorage (most up-to-date), then demo clients, then event data
    let client = null;
    
    // Find client from current clients list (from Redux store)
    if (event.clientId) {
      client = clients.find(c => c.id === event.clientId);
    }
    
    // If still not found, create from event data
    if (!client) {
      client = { 
        name: event.client || event.clientName || "לקוח מזדמן", 
        initials: (event.client || event.clientName || "ל").charAt(0) 
      };
    }
    
    // Try to get phone from event if not already in client
    if (!client.phone && (event.phone || event.clientPhone)) {
      client = { ...client, phone: event.phone || event.clientPhone };
    }
    
    // Find service
    const service = event.serviceId
      ? services.find(s => s.id === event.serviceId)
      : { name: event.serviceName || event.title?.split(/[–-]/)[0]?.trim() || "שירות לא זמין", duration: "", price: "" };
    
    // Find staff
    const staff = STAFF_DAY_CALENDARS.find(s => s.id === event.staff) || { 
      name: event.staffName || "איש צוות לא זמין", 
      id: event.staff,
      initials: (event.staffName || "א").charAt(0)
    };
    
    // Format date
    const appointmentDate = event.date ? new Date(event.date + 'T00:00:00') : new Date();
    
    // Format time - show start and end if both available
    const timeStr = event.start 
      ? (event.end ? `${event.start}–${event.end}` : event.start)
      : "";
    
    // Use duration from event if available (may be different from service default), otherwise from service
    const eventDuration = event.duration || service.duration || "";
    
    setAppointmentSummaryData({
      eventId: event.id,
      client,
      service: {
        ...service,
        duration: eventDuration, // Use event duration (may be different from service default)
      },
      date: appointmentDate,
      time: timeStr,
      staff,
      price: event.price || service.price || "",
      duration: eventDuration,
      recurringType: null, // Can be added if we track this in events
      recurringDuration: null,
      status: event.status || "נקבע תור",
    });
    setShowAppointmentSummary(true);
  };

  const handleAppointmentDrop = (event, targetDateIso, targetStaff, targetTime, isWeekView = false) => {
    if (!event || !targetDateIso || !targetStaff || !targetTime) {
      return;
    }

    const selectedServiceObj = services.find((s) => 
      event.title?.includes(s.name) || event.service === s.id
    );
    
    let durationMinutes = 30;
    if (selectedServiceObj?.duration) {
      // duration is stored as a number (minutes), not a string
      durationMinutes = typeof selectedServiceObj.duration === 'number' 
        ? selectedServiceObj.duration 
        : parseServiceDuration(selectedServiceObj.duration);
      } else {
      const oldStart = parseTime(event.start);
      const oldEnd = parseTime(event.end);
      durationMinutes = Math.round((oldEnd - oldStart) * 60);
    }

    const endTimeStr = calculateEndTime(targetTime, durationMinutes);

    // Check for overlaps - same logic for both day and week view
    // Check only staff-specific events (same as day view)
    const events = filterEvents(demoEvents);
    const hasOverlap = events.some((e) => {
      if (e.id === event.id) return false;
      // Same logic for both views: check only events of the same staff and same date
      if (e.staff !== targetStaff.id || e.date !== targetDateIso) return false;
      return timeRangesOverlap(targetTime, endTimeStr, e.start, e.end);
    });

    if (hasOverlap) {
      setDraggedEvent(null);
      setActiveDraggedAppointmentId(null);
      setDragOffset({ x: 0, y: 0 });
      setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
      setDragClickOffsetY(0);
      setShowOverlapModal(true);
      return;
    }

    // Update appointment
    const staffObj = STAFF_DAY_CALENDARS.find((s) => s.id === targetStaff.id);
    const staffName = staffObj?.name || targetStaff.name;

    updateAppointment(event.id, {
      date: targetDateIso,
      start: targetTime,
      end: endTimeStr,
      staff: targetStaff.id,
      staffName: staffName,
    });

    setDraggedEvent(null);
    setActiveDraggedAppointmentId(null);
    setDragOffset({ x: 0, y: 0 });
    setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
    setDragClickOffsetY(0);
  };

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(65);
  // Header הכללי (עם הלוגו) גובהו 72px ב-mobile ו-66px ב-desktop
  const mainHeaderHeight = 72; // lg:66px - נשתמש ב-72px כי זה הגובה הגדול יותר

  useEffect(() => {
    if (headerRef.current) {
      const updateHeight = () => {
        setHeaderHeight(headerRef.current?.offsetHeight || 65);
      };
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [view]);

  return (
    <div dir="ltr" className="-mt-6 -mx-4 sm:-mx-6 h-[calc(100vh-85px)] flex flex-col bg-white dark:bg-[#111111]">
      <style>{`
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

      {/* Calendar Header - Fixed position like logo */}
      <div ref={headerRef} className="fixed left-0 right-0 z-30 top-[72px] lg:top-[66px]">
        <CalendarHeader
        currentDate={currentDate}
        view={view}
        weekStart={weekStart}
        headerLabel={headerLabel}
        handlePrev={handlePrev}
        handleNext={handleNext}
        jumpToToday={jumpToToday}
        changeView={changeView}
        slotHeight={slotHeight}
        appliedSlotHeight={appliedSlotHeight}
        setSlotHeight={setSlotHeight}
        onSettingsClick={() => {
          setSlotHeight(appliedSlotHeight);
          setIsSettingsOpen(true);
          setIsWaitlistOpen(false);
        }}
        selectedStaff={selectedStaff}
        selectedTeamMembers={selectedTeamMembers}
        setSelectedStaff={setSelectedStaff}
        setSelectedTeamMembers={setSelectedTeamMembers}
        staffDayCalendars={STAFF_DAY_CALENDARS}
        allStaffIds={ALL_STAFF_IDS}
        isDatePickerOpen={isDatePickerOpen}
        setIsDatePickerOpen={setIsDatePickerOpen}
        pickerMonth={pickerMonth}
        setPickerMonth={setPickerMonth}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        rangeStartDate={rangeStartDate}
        setRangeStartDate={setRangeStartDate}
        rangeEndDate={rangeEndDate}
        setRangeEndDate={setRangeEndDate}
        rangeHoverDate={rangeHoverDate}
        setRangeHoverDate={setRangeHoverDate}
        applyDateSelection={applyDateSelection}
        onWaitlistClick={() => {
          setIsWaitlistOpen(true);
          setIsSettingsOpen(false);
        }}
        language={language}
        />
      </div>

      {/* Spacer for fixed CalendarHeader and CalendarStaffBar */}
      {view === "day" ? (
        <div style={{ height: `${headerHeight + 112}px` }} />
      ) : view === "week" ? (
        <div style={{ height: `${headerHeight + 112}px` }} />
      ) : (
        <div style={{ height: `${headerHeight}px` }} />
      )}

      {/* Error Banner - Show if appointments failed to load */}
      {appointmentsError && (
        <div className="fixed top-[calc(72px+65px)] lg:top-[calc(66px+65px)] left-0 right-0 z-40 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                נכשל בטעינת תורים מהשרת: {appointmentsError}
              </p>
            </div>
            <button
              onClick={() => {
                // Clear error and retry
                const filters = {
                  start: dateRange.startISO,
                  end: dateRange.endISO,
                };
                loadAppointments(filters);
              }}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
            >
              נסה שוב
            </button>
          </div>
        </div>
      )}

      {/* Staff/Date Header Bar - Separate layout component, independent from CalendarHeader */}
      <CalendarStaffBar
        view={view}
        currentDate={currentDate}
        weekDays={weekDays}
        filteredEvents={filteredEvents}
        selectedStaff={selectedStaff}
        selectedTeamMembers={selectedTeamMembers}
        headerHeight={mainHeaderHeight + headerHeight}
        language={language}
        staffDayCalendars={STAFF_DAY_CALENDARS}
        allStaffIds={ALL_STAFF_IDS}
        setSelectedStaff={setSelectedStaff}
      />

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0">
        {view === "month" ? (
          <MonthGrid
            currentDate={currentDate}
            events={filteredEvents}
            selectedStaff={selectedStaff}
            selectedTeamMembers={selectedTeamMembers}
            language={language}
            staffDayCalendars={STAFF_DAY_CALENDARS}
            allStaffIds={ALL_STAFF_IDS}
            services={services}
          />
        ) : (
          <TimeGrid
            view={view}
            currentDate={currentDate}
            weekStart={weekStart}
            weekDays={weekDays}
            slotHeight={slotHeight}
            events={filteredEvents}
            selectedStaff={selectedStaff}
            selectedTeamMembers={selectedTeamMembers}
            draggedEvent={draggedEvent}
            dragPosition={dragPosition}
            dragClickOffsetY={dragClickOffsetY}
            activeDraggedAppointmentId={activeDraggedAppointmentId}
            hoverPreview={hoverPreview}
            setHoverPreview={setHoverPreview}
            setDragPosition={setDragPosition}
            setDragClickOffsetY={setDragClickOffsetY}
            onDayColumnClick={handleDayColumnClick}
            onDayMouseMove={handleDayMouseMove}
            onDayMouseLeave={handleDayMouseLeave}
            onAppointmentDrop={handleAppointmentDrop}
            onAppointmentDragStart={handleAppointmentDragStart}
            onAppointmentDragEnd={handleAppointmentDragEnd}
            onAppointmentClick={handleAppointmentClick}
            language
            headerHeight={headerHeight}
            staffDayCalendars={STAFF_DAY_CALENDARS}
            allStaffIds={ALL_STAFF_IDS}
            services={services}
          />
        )}
      </div>

      {/* Panels */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => {
          setSlotHeight(appliedSlotHeight);
              setIsSettingsOpen(false);
        }}
        slotHeight={slotHeight}
        appliedSlotHeight={appliedSlotHeight}
        setSlotHeight={setSlotHeight}
        setAppliedSlotHeight={setAppliedSlotHeight}
        applyZoom={() => {
          applyZoom();
          setIsSettingsOpen(false);
        }}
        resetZoom={() => {
          resetZoom();
          setIsSettingsOpen(false);
        }}
      />

      {/* Modals */}
      <OverlapModal
        isOpen={showOverlapModal}
        onClose={() => setShowOverlapModal(false)}
      />

      <ConflictModal
        isOpen={showBookingConflictModal}
        conflictingAppointment={conflictingAppointment}
        onClose={() => {
          setShowBookingConflictModal(false);
          setConflictingAppointment(null);
          
          // If conflict modal was opened from appointment summary card (editing existing appointment)
          if (showAppointmentSummary && appointmentSummaryData?.eventId) {
            // Reset pending changes in appointment summary card - keep card open
            if (resetPendingChangesRef.current) {
              resetPendingChangesRef.current();
            }
          } else {
            // If conflict modal was opened from booking flow (creating new appointment)
          // Reset recurring dropdowns to default values
          setRecurringServiceType("Regular Appointment");
          setRecurringDuration("1 Month");
          hasConflictRef.current = false;
            // Clear selected service to return to clean state
            setBookingSelectedService(null);
            // Return to service selection step
            setWaitlistAddStep("service");
          }
        }}
      />

      {/* Waitlist Panel */}
      <WaitlistPanel
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        waitlistItems={waitlistItems}
        filteredWaitlist={filteredWaitlist}
        waitlistFilter={waitlistFilter}
        waitlistRange={waitlistRange}
        waitlistSort={waitlistSort}
        isWaitlistRangeOpen={isWaitlistRangeOpen}
        isSortDropdownOpen={isSortDropdownOpen}
        openWaitlistActionId={openWaitlistActionId}
        onFilterChange={setWaitlistFilter}
        onRangeChange={setWaitlistRange}
        onSortChange={setWaitlistSort}
        onRangeDropdownToggle={setIsWaitlistRangeOpen}
        onSortDropdownToggle={setIsSortDropdownOpen}
        onActionDropdownToggle={setOpenWaitlistActionId}
        onBookAppointment={(item) => {
          convertToAppointment(item.id);
          // TODO: Convert waitlist item to appointment
        }}
        onRemoveItem={(itemId) => {
          deleteWaitlistItem(itemId);
        }}
        onAddNew={() => {
          openWaitlistFlow();
          setIsWaitlistOpen(false);
        }}
      />

      {/* Booking Flow Panel */}
      <BookingFlowPanel
        isOpen={isWaitlistAddOpen}
        onClose={closeFlow}
        language={language}
        addFlowMode={addFlowMode}
        waitlistAddStep={waitlistAddStep}
        selectedWaitlistClient={selectedWaitlistClient}
        bookingSelectedDate={bookingSelectedDate}
        bookingSelectedTime={bookingSelectedTime}
        bookingSelectedService={bookingSelectedService}
        bookingSelectedStaff={bookingSelectedStaff}
        selectedStaffForBooking={selectedStaffForBooking}
        waitlistClientSearch={waitlistClientSearch}
        serviceSearch={serviceSearch}
        isTimeDropdownOpen={isTimeDropdownOpen}
        recurringServiceType={recurringServiceType}
        recurringDuration={recurringDuration}
        isServiceTypeDropdownOpen={isServiceTypeDropdownOpen}
        isRepeatDurationDropdownOpen={isRepeatDurationDropdownOpen}
        bookingMonth={bookingMonth}
        clients={clients}
        staffDayCalendars={STAFF_DAY_CALENDARS}
        setWaitlistAddStep={setWaitlistAddStep}
        setSelectedWaitlistClient={setSelectedWaitlistClient}
        setBookingSelectedDate={setBookingSelectedDate}
        setBookingSelectedTime={setBookingSelectedTime}
        setBookingSelectedService={setBookingSelectedService}
        setSelectedStaffForBooking={setSelectedStaffForBooking}
        setWaitlistClientSearch={setWaitlistClientSearch}
        setServiceSearch={setServiceSearch}
        setIsTimeDropdownOpen={setIsTimeDropdownOpen}
        setRecurringServiceType={setRecurringServiceType}
        setRecurringDuration={setRecurringDuration}
        setIsServiceTypeDropdownOpen={setIsServiceTypeDropdownOpen}
        setIsRepeatDurationDropdownOpen={setIsRepeatDurationDropdownOpen}
        setBookingMonth={setBookingMonth}
        onApply={handleFlowApply}
        onOpenNewClientModal={() => {
          setSelectedWaitlistClient(null);
          resetCustomerForm();
          setIsNewClientModalOpen(true);
        }}
      />

      {/* New Client Modal */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        newClientName={newClientName}
        newClientPhone={newClientPhone}
        newClientEmail={newClientEmail}
        newClientCity={newClientCity}
        newClientAddress={newClientAddress}
        newClientErrors={newClientErrors}
        onNameChange={setNewClientName}
        onPhoneChange={setNewClientPhone}
        onEmailChange={setNewClientEmail}
        onCityChange={setNewClientCity}
        onAddressChange={setNewClientAddress}
        onSubmit={handleCreateNewClient}
      />

      {/* Appointment Summary Card */}
      <AppointmentSummaryCard
        isOpen={showAppointmentSummary}
        onClose={() => {
          setShowAppointmentSummary(false);
          setAppointmentSummaryData(null);
        }}
        appointment={appointmentSummaryData}
        language={language}
        onStatusChange={(eventId, newStatus) => {
          if (eventId) {
            updateAppointment(eventId, { status: newStatus });
          }
        }}
        onServiceChange={(eventId, serviceData) => {
          if (eventId && serviceData) {
            // Update appointment with new service
            // The useEffect will automatically sync appointmentSummaryData from customEvents
            updateAppointment(eventId, {
              service: serviceData.service,
              serviceId: serviceData.serviceId,
              serviceName: serviceData.serviceName,
              title: serviceData.serviceName,
              start: serviceData.time.split('–')[0],
              end: serviceData.end,
              price: serviceData.price,
              duration: serviceData.duration,
            });
          }
        }}
        onDateChange={(eventId, newDateIso) => {
          // If appointment is already created (has eventId), check for conflicts before updating
          if (eventId) {
            // Find the current appointment to get time and staff
            const currentAppointment = customEvents.find(e => e.id === eventId);
            if (!currentAppointment) return;
            
            const appointmentDateIso = typeof newDateIso === 'string' 
              ? newDateIso 
              : formatDateLocal(new Date(newDateIso));
            
            // Check for conflicts with other appointments
            const hasConflict = customEvents.some((event) => {
              // Skip the current appointment
              if (event.id === eventId) return false;
              
              // Only check events for the same staff member and same date
              if (event.staff !== currentAppointment.staff || event.date !== appointmentDateIso) {
                return false;
              }
              
              // Check if time ranges overlap
              return timeRangesOverlap(currentAppointment.start, currentAppointment.end, event.start, event.end);
            });
            
            if (hasConflict) {
              // Find the conflicting appointment
              const conflictingEvent = customEvents.find((event) => {
                if (event.id === eventId) return false;
                if (event.staff !== currentAppointment.staff || event.date !== appointmentDateIso) {
                  return false;
                }
                return timeRangesOverlap(currentAppointment.start, currentAppointment.end, event.start, event.end);
              });
              
              if (conflictingEvent) {
                setConflictingAppointment({
                  ...conflictingEvent,
                  date: appointmentDateIso,
                });
                setShowBookingConflictModal(true);
                return; // Don't update if there's a conflict
              }
            }
            
            // No conflict - update the appointment
            // The useEffect will automatically sync appointmentSummaryData from customEvents
            updateAppointment(eventId, {
              date: newDateIso,
            });
          }
        }}
        onTimeChange={(eventId, newTimeRange, newStartTime, newEndTime) => {
          // If appointment is already created (has eventId), check for conflicts before updating
          if (eventId) {
            // Find the current appointment to get date and staff
            const currentAppointment = customEvents.find(e => e.id === eventId);
            if (!currentAppointment) return;
            
            const appointmentDateIso = typeof currentAppointment.date === 'string' 
              ? currentAppointment.date 
              : formatDateLocal(new Date(currentAppointment.date));
            
            // Check for conflicts with other appointments
            const hasConflict = customEvents.some((event) => {
              // Skip the current appointment
              if (event.id === eventId) return false;
              
              // Only check events for the same staff member and same date
              if (event.staff !== currentAppointment.staff || event.date !== appointmentDateIso) {
                return false;
              }
              
              // Check if time ranges overlap
              return timeRangesOverlap(newStartTime, newEndTime, event.start, event.end);
            });
            
            if (hasConflict) {
              // Find the conflicting appointment
              const conflictingEvent = customEvents.find((event) => {
                if (event.id === eventId) return false;
                if (event.staff !== currentAppointment.staff || event.date !== appointmentDateIso) {
                  return false;
                }
                return timeRangesOverlap(newStartTime, newEndTime, event.start, event.end);
              });
              
              if (conflictingEvent) {
                setConflictingAppointment({
                  ...conflictingEvent,
                  date: appointmentDateIso,
                });
                setShowBookingConflictModal(true);
                return; // Don't update if there's a conflict
              }
            }
            
            // No conflict - update the appointment
            // The useEffect will automatically sync appointmentSummaryData from customEvents
            updateAppointment(eventId, {
              start: newStartTime,
              end: newEndTime,
            });
          }
        }}
        onDurationChange={(eventId, newDurationMinutes, newTimeRange, newEndTime) => {
          // If appointment is already created (has eventId), check for conflicts before updating
          if (eventId) {
            // Find the current appointment to get date and staff
            const currentAppointment = customEvents.find(e => e.id === eventId);
            if (!currentAppointment) return;
            
            const newStartTime = newTimeRange.split('–')[0];
            const appointmentDateIso = typeof currentAppointment.date === 'string' 
              ? currentAppointment.date 
              : formatDateLocal(new Date(currentAppointment.date));
            
            // Check for conflicts with other appointments
            const hasConflict = customEvents.some((event) => {
              // Skip the current appointment
              if (event.id === eventId) return false;
              
              // Only check events for the same staff member and same date
              if (event.staff !== currentAppointment.staff || event.date !== appointmentDateIso) {
                return false;
              }
              
              // Check if time ranges overlap
              return timeRangesOverlap(newStartTime, newEndTime, event.start, event.end);
            });
            
            if (hasConflict) {
              // Find the conflicting appointment
              const conflictingEvent = customEvents.find((event) => {
                if (event.id === eventId) return false;
                if (event.staff !== currentAppointment.staff || event.date !== appointmentDateIso) {
                  return false;
                }
                return timeRangesOverlap(newStartTime, newEndTime, event.start, event.end);
              });
              
              if (conflictingEvent) {
                setConflictingAppointment({
                  ...conflictingEvent,
                  date: appointmentDateIso,
                });
                setShowBookingConflictModal(true);
                // Don't update appointment in calendar if there's a conflict
                // The appointmentSummaryData will remain unchanged (showing original values)
                return;
              }
            }
            
            // No conflict - update the appointment
            // The useEffect will automatically sync appointmentSummaryData from customEvents
            updateAppointment(eventId, {
              duration: newDurationMinutes,
              start: newStartTime,
              end: newEndTime,
            });
          }
        }}
        onSaveChanges={{
          save: (eventId, pendingChanges) => {
          if (!eventId || !pendingChanges) return;
          
          // Find the current appointment to get staff
          const currentAppointment = customEvents.find(e => e.id === eventId);
          if (!currentAppointment) return;
          
          // Determine the final values (use pending changes or current values)
          const finalDate = pendingChanges.date !== undefined 
            ? (typeof pendingChanges.date === 'string' ? pendingChanges.date : formatDateLocal(new Date(pendingChanges.date)))
            : (typeof currentAppointment.date === 'string' ? currentAppointment.date : formatDateLocal(new Date(currentAppointment.date)));
          
          // Determine final start time - use pending changes if available, otherwise current
          const finalStartTime = pendingChanges.startTime || currentAppointment.start;
          
          // Determine final duration - use pending changes if available, otherwise current, otherwise from service
          const finalDuration = pendingChanges.duration !== undefined 
            ? pendingChanges.duration 
            : (pendingChanges.service?.duration !== undefined 
              ? (typeof pendingChanges.service.duration === 'number' 
                ? pendingChanges.service.duration 
                : parseServiceDuration(pendingChanges.service.duration))
              : currentAppointment.duration);
          
          // Calculate final end time based on start time and duration
          const finalEndTime = pendingChanges.endTime || (finalStartTime && finalDuration 
            ? calculateEndTime(finalStartTime, finalDuration)
            : currentAppointment.end);
          
          // Check for conflicts with other appointments
          const hasConflict = customEvents.some((event) => {
            // Skip the current appointment
            if (event.id === eventId) return false;
            
            // Only check events for the same staff member and same date
            if (event.staff !== currentAppointment.staff || event.date !== finalDate) {
              return false;
            }
            
            // Check if time ranges overlap
            return timeRangesOverlap(finalStartTime, finalEndTime, event.start, event.end);
          });
          
          if (hasConflict) {
            // Find the conflicting appointment
            const conflictingEvent = customEvents.find((event) => {
              if (event.id === eventId) return false;
              if (event.staff !== currentAppointment.staff || event.date !== finalDate) {
                return false;
              }
              return timeRangesOverlap(finalStartTime, finalEndTime, event.start, event.end);
            });
            
            if (conflictingEvent) {
              setConflictingAppointment({
                ...conflictingEvent,
                date: finalDate,
              });
              setShowBookingConflictModal(true);
              // Reset pending changes when conflict is detected
              if (resetPendingChangesRef.current) {
                resetPendingChangesRef.current();
              }
              return false; // Don't update if there's a conflict - return false to indicate failure
            }
          }
          
          // No conflict - update the appointment with all changes
          const updateData = {};
          if (pendingChanges.date !== undefined) {
            updateData.date = typeof pendingChanges.date === 'string' ? pendingChanges.date : formatDateLocal(new Date(pendingChanges.date));
          }
          if (pendingChanges.startTime !== undefined) {
            updateData.start = pendingChanges.startTime;
          }
          if (pendingChanges.endTime !== undefined) {
            updateData.end = pendingChanges.endTime;
          }
          if (pendingChanges.duration !== undefined) {
            updateData.duration = pendingChanges.duration;
          }
          // Handle service changes (service, serviceId, serviceName, price)
          if (pendingChanges.service !== undefined) {
            updateData.service = pendingChanges.service;
          }
          if (pendingChanges.serviceId !== undefined) {
            updateData.serviceId = pendingChanges.serviceId;
          }
          if (pendingChanges.serviceName !== undefined) {
            updateData.serviceName = pendingChanges.serviceName;
            updateData.title = pendingChanges.serviceName; // Also update title
          }
          if (pendingChanges.price !== undefined) {
            updateData.price = pendingChanges.price;
          }
          
          if (Object.keys(updateData).length > 0) {
            // Update the appointment - the useEffect will automatically sync appointmentSummaryData from customEvents
            updateAppointment(eventId, updateData);
            
            // After saving, navigate to day view of the new appointment date and scroll to the appointment
            // Determine the final date (use updated date if changed, otherwise current)
            const targetDate = finalDate;
            const targetStartTime = finalStartTime;
            
            // Convert date string to Date object
            const targetDateObj = typeof targetDate === 'string' 
              ? new Date(targetDate + 'T00:00:00')
              : new Date(targetDate);
            targetDateObj.setHours(0, 0, 0, 0);
            
            // Navigate to day view with the new date
            setCurrentDate(targetDateObj);
            changeView("day");
            setCustomWeekStart(null);
            
            // Scroll to the appointment time after a short delay to allow view to render
            setTimeout(() => {
              // Find the scroll container (TimeGrid's scroll container)
              const scrollContainer = document.querySelector('[data-time-grid-scroll]');
              
              if (scrollContainer && targetStartTime) {
                // Calculate scroll position based on time
                const timeMinutes = parseTime(targetStartTime);
                const scrollPosition = (timeMinutes - START_HOUR) * appliedSlotHeight;
                
                // Scroll to position, with some offset to show the appointment nicely
                const offset = 100; // Offset to show appointment above viewport center
                scrollContainer.scrollTo({
                  top: Math.max(0, scrollPosition - offset),
                  behavior: 'smooth'
                });
              }
              
              // Close the appointment summary panel after navigation
              setShowAppointmentSummary(false);
              setAppointmentSummaryData(null);
            }, 150);
          }
          
          return true; // Indicate successful save
          },
          resetPendingChanges: resetPendingChangesRef,
        }}
        onConflictDetected={(changeData) => {
          if (!changeData || !changeData.eventId) return false;
          
          // Find the current appointment to get staff
          const currentAppointment = customEvents.find(e => e.id === changeData.eventId);
          if (!currentAppointment) return false;
          
          // Determine the final values
          const finalDate = changeData.date !== undefined 
            ? (typeof changeData.date === 'string' ? changeData.date : formatDateLocal(new Date(changeData.date)))
            : (typeof currentAppointment.date === 'string' ? currentAppointment.date : formatDateLocal(new Date(currentAppointment.date)));
          
          const finalStartTime = changeData.startTime || currentAppointment.start;
          const finalEndTime = changeData.endTime || currentAppointment.end;
          
          // Check for conflicts with other appointments
          const hasConflict = customEvents.some((event) => {
            // Skip the current appointment
            if (event.id === changeData.eventId) return false;
            
            // Only check events for the same staff member and same date
            if (event.staff !== currentAppointment.staff || event.date !== finalDate) {
              return false;
            }
            
            // Check if time ranges overlap
            return timeRangesOverlap(finalStartTime, finalEndTime, event.start, event.end);
          });
          
          if (hasConflict) {
            // Find the conflicting appointment
            const conflictingEvent = customEvents.find((event) => {
              if (event.id === changeData.eventId) return false;
              if (event.staff !== currentAppointment.staff || event.date !== finalDate) {
                return false;
              }
              return timeRangesOverlap(finalStartTime, finalEndTime, event.start, event.end);
            });
            
            if (conflictingEvent) {
              setConflictingAppointment({
                ...conflictingEvent,
                date: finalDate,
              });
              setShowBookingConflictModal(true);
              // Reset pending changes when conflict is detected
              if (resetPendingChangesRef.current) {
                resetPendingChangesRef.current();
              }
              return true; // Indicate conflict was detected
            }
          }
          
          return false; // No conflict
        }}
        onCreateAppointment={handleCreateAppointment}
        onViewClient={(client) => {
          // Open client profile panel in the same page
          // Load client from localStorage to ensure we have all fields (matching calendarClients behavior)
          if (client) {
            try {
              const CALENDAR_CLIENTS_STORAGE_KEY = "calendar_clients";
              const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
              if (storedClients) {
                const allClients = JSON.parse(storedClients);
                // Try to find the client by id first, then by name
                const foundClient = allClients.find(c => 
                  c.id === client.id || 
                  (c.name && client.name && c.name.toLowerCase().trim() === client.name.toLowerCase().trim())
                );
                if (foundClient) {
                  setSelectedClientForProfile(foundClient);
                } else {
                  // If not found in localStorage, use the client from appointment
                  setSelectedClientForProfile(client);
                }
              } else {
                // If no clients in localStorage, use the client from appointment
                setSelectedClientForProfile(client);
              }
            } catch (error) {
              console.error("Error loading client from localStorage:", error);
              // Fallback to client from appointment
              setSelectedClientForProfile(client);
            }
            setShowClientProfile(true);
          }
        }}
      />

      {/* Client Profile Panel - opens above appointment card */}
      <ClientSummaryCard
        client={selectedClientForProfile}
        isOpen={showClientProfile}
        onClose={() => {
          setShowClientProfile(false);
          setSelectedClientForProfile(null);
        }}
        zIndex={70}
        onClientUpdate={(updatedClient) => {
          setSelectedClientForProfile(updatedClient);
        }}
      />
    </div>
  );
}

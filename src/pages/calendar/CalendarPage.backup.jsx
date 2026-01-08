import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiUser,
  FiSettings,
  FiClock,
  FiX,
  FiSearch,
  FiCalendar,
  FiXCircle,
} from "react-icons/fi";

const BRAND_COLOR = "#FF257C";

// LocalStorage key for persisting calendar appointments
const CALENDAR_EVENTS_STORAGE_KEY = "plusfive_calendar_events";

// Helper function to generate UUID
const uuid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};


// שעות לתצוגה
const START_HOUR = 0;
const END_HOUR = 23;

const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i
);

// מינימום ומקסימום של הזום ביומן (בשביל הסליידר)
const SLOT_HEIGHT_MIN = 130; // Increased by ~30% from 100 to 130 for better readability
const SLOT_HEIGHT_MAX = 500;

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getMonthMatrix = (date) => {
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

const formatHour = (hour) => `${hour.toString().padStart(2, "0")}:00`;

const formatDayLabel = (date, language) => {
  const locale = language === "he" ? "he-IL" : "en-US";
  const dayName = date.toLocaleDateString(locale, { weekday: "short" });
  const dayNum = date.getDate();
  return { dayName, dayNum };
};

const formatHeaderLabel = (view, currentDate, weekStart, language) => {
  const locale = language === "he" ? "he-IL" : "en-US";

  if (view === "day") {
    return currentDate.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (view === "month") {
    return currentDate.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
  }

  // week
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(start.getDate() + 6);

  const startMonth = start.toLocaleDateString(locale, { month: "short" });
  const endMonth = end.toLocaleDateString(locale, { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();
  const endYear = end.getFullYear();

  if (startMonth === endMonth && year === endYear) {
    return `${startDay}-${endDay} ${startMonth} ${year}`;
  }

  return `${startDay} ${startMonth} ${year} - ${endDay} ${endMonth} ${endYear}`;
};

const parseTime = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
};

// Parse service duration string (e.g., "45 דק'" or "60 דק'") to minutes
// Helper function to format date to YYYY-MM-DD in LOCAL timezone (not UTC)
// This prevents timezone shifts that cause dates to appear one day earlier
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to calculate recurring appointment dates
// Duration Period defines TOTAL number of appointments to create, not end date
const calculateRecurringDates = (startDate, serviceType, duration) => {
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
  
  // Calculate interval in days based on service type
  let intervalDays = 0;
  if (serviceType === "Every Day") {
    intervalDays = 1;
  } else if (serviceType.startsWith("Every ")) {
    const match = serviceType.match(/Every (\d+)\s*(Day|Week|Month)/i);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === "day") {
        intervalDays = amount;
      } else if (unit === "week") {
        intervalDays = amount * 7;
      } else if (unit === "month") {
        // Approximate months as 30 days
        intervalDays = amount * 30;
      }
    }
  }
  
  // Calculate total number of appointments based on Duration Period
  // Duration Period defines how long the recurrence should continue
  // For "Every Day": 1 Week = 7 appointments, 2 Weeks = 14 appointments, etc.
  // For "Every Week": 1 Week = 1 appointment, 2 Weeks = 2 appointments, etc.
  let totalAppointments = 1; // Default to 1 if parsing fails
  const durationMatch = duration.match(/(\d+(?:\.\d+)?)\s*(Week|Month|Year)/i);
  if (durationMatch) {
    const amount = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    if (unit === "week") {
      // If service type is "Every Day", calculate based on days (1 week = 7 days = 7 appointments)
      if (serviceType === "Every Day") {
        totalAppointments = Math.round(amount * 7);
      } else {
        // For other intervals, Duration in weeks = total appointments (1 week = 1 appointment, 2 weeks = 2 appointments, etc.)
        totalAppointments = Math.round(amount);
      }
    } else if (unit === "month") {
      // If service type is "Every Day", calculate based on days (1 month ≈ 30 days = 30 appointments)
      if (serviceType === "Every Day") {
        if (amount === 1) {
          totalAppointments = 30;
        } else if (amount === 1.5) {
          totalAppointments = 45;
        } else if (amount === 2) {
          totalAppointments = 60;
        } else if (amount === 3) {
          totalAppointments = 90;
        } else if (amount === 6) {
          totalAppointments = 180;
        } else if (amount === 12) {
          totalAppointments = 365;
        } else {
          totalAppointments = Math.round(amount * 30);
        }
      } else {
        // For other intervals: 1 Month = 4 appointments, 1.5 Months = 6, 2 Months = 8, 3 Months = 12, 6 Months = 26, 12 Months = 52
        if (amount === 1) {
          totalAppointments = 4;
        } else if (amount === 1.5) {
          totalAppointments = 6;
        } else if (amount === 2) {
          totalAppointments = 8;
        } else if (amount === 3) {
          totalAppointments = 12;
        } else if (amount === 6) {
          totalAppointments = 26;
        } else if (amount === 12) {
          totalAppointments = 52;
        } else {
          // Fallback: approximate as 4 per month
          totalAppointments = Math.round(amount * 4);
        }
      }
    } else if (unit === "year") {
      // If service type is "Every Day", calculate based on days (1 year ≈ 365 days)
      if (serviceType === "Every Day") {
        totalAppointments = 365;
      } else {
        // 1 Year = 52 appointments
        totalAppointments = 52;
      }
    }
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
      // Add interval days to get the next appointment date
      current.setDate(current.getDate() + intervalDays);
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

const parseServiceDuration = (durationStr) => {
  if (!durationStr) return 30; // Default to 30 minutes if no duration
  // Extract number from string like "45 דק'" -> 45
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
};

// Calculate end time from start time and duration in minutes
const calculateEndTime = (startTime, durationMinutes) => {
  const [h, m] = startTime.split(":").map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
};

// Check if two time ranges overlap (for the same staff member)
// Returns true if [start1, end1) overlaps with [start2, end2)
const timeRangesOverlap = (start1, end1, start2, end2) => {
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);
  // Two ranges overlap if: start1 < end2 AND start2 < end1
  return s1 < e2 && s2 < e1;
};

// SINGLE SOURCE OF TRUTH: Extract the exact start time from bookingSelectedTime
// This function ensures we use the EXACT value stored in bookingSelectedTime without any modification
// Input: bookingSelectedTime (can be "13:05" or "10:00-10:30")
// Output: The exact start time string (e.g., "13:05")
// CRITICAL: This is the ONLY place where we extract/process the time - use this everywhere
// CRITICAL: NO rounding, NO adjustment, NO recalculation - use the stored value exactly as-is
const getExactStartTime = (bookingSelectedTime) => {
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

const minutesToLabel = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}`;
};

// לייבל לתאריך בחירת הבוקינג בפופ אפ Add
const formatBookingDateLabel = (date, language) => {
  if (!date) return "";
  const locale = language === "he" ? "he-IL" : "en-US";
  // Ensure date is a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";
  // Use same format as calendar header (day view format)
  return dateObj.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// אירועי דמו
const createDemoEvents = (weekDays) => {
  if (!weekDays || weekDays.length === 0) return [];
  const toISO = (d) => d.toISOString().slice(0, 10);

  return [
    {
      id: 1,
      date: toISO(weekDays[1]),
      title: "תספורת – דני",
      client: "דני כהן",
      staff: "דנה",
      start: "10:00",
      end: "11:00",
      color: "#FFE4F1",
    },
    {
      id: 2,
      date: toISO(weekDays[1]),
      title: "פייד + זקן",
      client: "יוסי לוי",
      staff: "אבי",
      start: "12:30",
      end: "13:15",
      color: "#E9D5FF",
    },
    {
      id: 3,
      date: toISO(weekDays[3]),
      title: "לקוח VIP",
      client: "ניר",
      staff: "דנה",
      start: "18:00",
      end: "19:30",
      color: "#FED7D7",
    },
    {
      id: 4,
      date: toISO(weekDays[4]),
      title: "צבע ועיצוב",
      client: "שיר",
      staff: "ליאור",
      start: "09:00",
      end: "10:30",
      color: "#FFE7F3",
    },
  ];
};

// דמו לוויטינג ליסט
const DEMO_WAITLIST = [
  {
    id: 1,
    client: "נועה לוי",
    requestedDate: "2025-12-26",
    status: "waiting",
    note: "אחר הצהריים בלבד",
  },
  {
    id: 2,
    client: "בר כהן",
    requestedDate: "2025-12-20",
    status: "expired",
    note: "כל שעה",
  },
  {
    id: 3,
    client: "טל אמיר",
    requestedDate: "2025-12-27",
    status: "booked",
    note: "פייד + זקן",
  },
];

// דמו קליינטים לפופ Add client
const DEMO_WAITLIST_CLIENTS = [
  {
    id: 1,
    name: "ג'יין דו",
    email: "jane@example.com",
    initials: "ג",
  },
  {
    id: 2,
    name: "ג'ון דו",
    email: "john@example.com",
    initials: "ג",
  },
];

// דמו שירותים לפופ Select a service
const DEMO_SERVICES = [
  {
    id: 1,
    name: "תספורת קלאסית",
    duration: "45 דק'",
    price: "₪120",
  },
  {
    id: 2,
    name: "פייד + זקן",
    duration: "60 דק'",
    price: "₪160",
  },
  {
    id: 3,
    name: "צבע ועיצוב",
    duration: "90 דק'",
    price: "₪320",
  },
  {
    id: 4,
    name: "תספורת ילדים",
    duration: "30 דק'",
    price: "₪90",
  },
];

// בר עובדים ל־DAY VIEW
const STAFF_DAY_CALENDARS = [
  {
    id: "Dana",
    name: "דנה",
    initials: "ד",
    role: "צבע ועיצוב",
    status: "available",
    bookingsToday: 3,
    imageUrl: null,
  },
  {
    id: "Avi",
    name: "אבי",
    initials: "א",
    role: "ספר",
    status: "busy",
    bookingsToday: 5,
    imageUrl: null,
  },
  {
    id: "Lior",
    name: "ליאור",
    initials: "ל",
    role: "מעצב שיער",
    status: "offline",
    bookingsToday: 0,
    imageUrl: null,
  },
];

const ALL_STAFF_IDS = STAFF_DAY_CALENDARS.map((s) => s.id);

const isSameCalendarDay = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

// עזרים לטווח
const toDateOnly = (d) =>
  d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null;

const isBetweenInclusive = (day, start, end) => {
  if (!day || !start || !end) return false;
  const d = toDateOnly(day).getTime();
  const s = toDateOnly(start).getTime();
  const e = toDateOnly(end).getTime();
  const min = Math.min(s, e);
  const max = Math.max(s, e);
  return d >= min && d <= max;
};

const isFullMonthRange = (start, end) => {
  if (!start || !end) return false;
  const s = toDateOnly(start);
  const e = toDateOnly(end);
  if (!s || !e) return false;

  if (s.getFullYear() !== e.getFullYear() || s.getMonth() !== e.getMonth()) {
    return false;
  }

  const firstDayIsFirst = s.getDate() === 1;
  const lastDayOfMonth = new Date(e.getFullYear(), e.getMonth() + 1, 0).getDate();
  const lastDayIsLast = e.getDate() === lastDayOfMonth;

  return firstDayIsFirst && lastDayIsLast;
};

// יצירת סלוטים של חצי שעה בין 10:00 ל־20:00
const generateTimeSlots = (startHour = 10, endHour = 20, intervalMinutes = 30) => {
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

const CalendarPage = () => {
  const { language } = useLanguage();
  const { isDarkMode } = useTheme(); // כרגע לא בשימוש, משאירים

   // 🔥 פופ־אפ יצירת תור חדש כשנלחצים על סלוט ביומן
const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
const [clickedSlot, setClickedSlot] = useState(null);
// clickedSlot: { dateIso, time, staffId, staffName }


// LEGACY: This function is DISABLED - no longer opens the old left-side drawer
// All calendar clicks now use the new right-side booking flow
const handleCalendarSlotClick = (dateIso, time, staffId, staffName) => {
  // DISABLED: Do not open the legacy left-side drawer
  // The new booking flow is handled in handleDayColumnClick for empty slots
  // and existing appointments should not open any popup (they are draggable/editable)
  return;
  
  // OLD CODE (disabled):
  // setClickedSlot({
  //   dateIso,
  //   time,
  //   staffId,
  //   staffName,
  // });
  // setIsNewAppointmentOpen(true);
};



// סוגר את כל הפופאפים / פאנלים הרלוונטיים
const closeAllPopups = () => {
  setIsNewAppointmentOpen(false);
  setIsWaitlistAddOpen(false);
  setIsNewClientModalOpen(false);
  setOpenWaitlistActionId(null);
};


  // בחירת שירות ולקוח בתוך הפופ־אפ
  const [newAppointmentService, setNewAppointmentService] = useState(null);
  const [newAppointmentClient, setNewAppointmentClient] = useState(null);

  // Initialize to today's date (normalized to start of day) and day view on mount
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [view, setView] = useState("day");

  // מצב בחירת צוות
  const [selectedStaff, setSelectedStaff] = useState("all-business");
  const [selectedTeamMembers, setSelectedTeamMembers] =
    useState(ALL_STAFF_IDS);

  const [selectedLocation] = useState("all");
  const [hoverPreview, setHoverPreview] = useState(null);

  // גודל תצוגה לייב ביומן
  const [slotHeight, setSlotHeight] = useState(SLOT_HEIGHT_MIN);
  const [appliedSlotHeight, setAppliedSlotHeight] =
    useState(SLOT_HEIGHT_MIN);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);

  // Date picker
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // טווח תאריכים בדייט־פיקר
  const [rangeStartDate, setRangeStartDate] = useState(null);
  const [rangeEndDate, setRangeEndDate] = useState(null);
  const [rangeHoverDate, setRangeHoverDate] = useState(null);

  // week start מותאם לטווח
  const [customWeekStart, setCustomWeekStart] = useState(null);

  // רשימת ה-Waitlist בפועל
  const [waitlistItems, setWaitlistItems] = useState(DEMO_WAITLIST || []);

  // אירועים אמיתיים שנוצרים מהפלואו (נכנסים ליומן)
  // Load from localStorage on mount, or use empty array if no stored data
  const [customEvents, setCustomEvents] = useState(() => {
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
  });

  // Persist customEvents to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(customEvents));
    } catch (error) {
      console.warn("Failed to save calendar events to localStorage:", error);
    }
  }, [customEvents]);

  // Drag & drop state
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ dateIso: null, staffId: null, y: 0, time: null });
  const [dragClickOffsetY, setDragClickOffsetY] = useState(0); // Offset from mouse Y to appointment top when drag started
  const [activeDraggedAppointmentId, setActiveDraggedAppointmentId] = useState(null); // ID of the appointment currently being dragged
  const [hoveredAppointmentId, setHoveredAppointmentId] = useState(null); // ID of the appointment currently being hovered
  const [showOverlapModal, setShowOverlapModal] = useState(false); // Show modal when drag & drop causes overlap
  const [showBookingConflictModal, setShowBookingConflictModal] = useState(false); // Show modal when booking appointment causes conflict
  const [conflictingAppointment, setConflictingAppointment] = useState(null); // Details of the conflicting appointment
  const hasConflictRef = useRef(false); // Track if there was a conflict during appointment creation

    // קבלת אירוע חדש מה-AppointmentDrawer והוספתו ליומן
    // Always creates a NEW appointment - never updates or removes existing appointments
    // Multiple appointments for the same client are allowed and should coexist
  const handleCreateAppointmentFromDrawer = (newEvent) => {
    // Always ADD the new appointment to the array - never filter, remove, or update existing appointments
    setCustomEvents((prev) => [...prev, newEvent]);

    // CRITICAL: Do NOT navigate or change the calendar view after creating an appointment
    // The calendar should remain on the same date and view where the user created the appointment
    // The new appointment will appear in the current view automatically

    setIsNewAppointmentOpen(false);
    setClickedSlot(null);
  };

  // Unified handler for both booking and waitlist flows
  const handleFlowApply = () => {
    // Validation - check required fields
    if (
      !selectedWaitlistClient ||
      !bookingSelectedService ||
      !bookingSelectedDate
    ) {
      console.warn("Missing required data", {
        selectedWaitlistClient: !!selectedWaitlistClient,
        bookingSelectedService: !!bookingSelectedService,
        bookingSelectedDate: !!bookingSelectedDate,
        bookingSelectedTime: bookingSelectedTime
      });
      return;
    }

    // Find service object
    const selectedServiceObj = DEMO_SERVICES.find(
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
        ? bookingSelectedDate.toISOString().slice(0, 10)
        : new Date(bookingSelectedDate).toISOString().slice(0, 10);
      
      // SINGLE SOURCE OF TRUTH: Get the exact start time from bookingSelectedTime
      // This uses the EXACT value stored in bookingSelectedTime - no rounding, no adjustment, no recalculation
      // If bookingSelectedTime is "13:05", timeStr will be exactly "13:05"
      // If bookingSelectedTime is "10:00-10:30", timeStr will be exactly "10:00"
      const timeStr = getExactStartTime(bookingSelectedTime);
      
      // DEBUG: Log the exact values to verify 1:1 match
      // CRITICAL VALIDATION: For single time format, the extracted time MUST match the stored time exactly
      if (bookingSelectedTime && typeof bookingSelectedTime === "string" && bookingSelectedTime.includes(":") && !bookingSelectedTime.includes("-")) {
        if (timeStr !== bookingSelectedTime) {
          console.error("[CRITICAL ERROR] Time mismatch detected!", {
            stored: bookingSelectedTime,
            extracted: timeStr,
            message: "The extracted time does not match the stored time - this should NEVER happen!"
          });
          // Use the stored value directly as fallback to prevent offset bug
          const correctedTimeStr = bookingSelectedTime;
          console.warn("[FALLBACK] Using stored time directly:", correctedTimeStr);
          // Continue with correctedTimeStr instead of timeStr
          // But for now, we'll use timeStr and log the error
        } else {
          console.log("[APPOINTMENT CREATION] ✅ Time match verified:", {
            bookingSelectedTime: bookingSelectedTime,
            extractedTimeStr: timeStr,
            match: true,
          });
        }
      } else {
        console.log("[APPOINTMENT CREATION] Time extraction:", {
          bookingSelectedTime: bookingSelectedTime,
          extractedTimeStr: timeStr,
        });
      }
      
      // Build full date-time for validation (not used in event creation, but kept for consistency)
      const startDateTime = new Date(bookingSelectedDate);
      const [h, m] = timeStr.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        startDateTime.setHours(h, m, 0, 0);
      }
      
      // Use selected staff from booking flow, or pre-selected from calendar click, or fallback to default
      let staffId, staffName;
      if (selectedStaffForBooking) {
        // Use staff selected in booking flow step 1
        const selectedStaffObj = STAFF_DAY_CALENDARS.find(s => s.id === selectedStaffForBooking);
        staffId = selectedStaffObj?.id || selectedStaffForBooking;
        staffName = selectedStaffObj?.name || "דנה";
      } else if (bookingSelectedStaff) {
        // Use pre-selected staff from calendar click
        staffId = bookingSelectedStaff.id;
        staffName = bookingSelectedStaff.name;
      } else {
        // Get first available staff or use default
        const defaultStaff = STAFF_DAY_CALENDARS.find(s => s.status !== "offline" && s.status !== "not-working") || STAFF_DAY_CALENDARS[0];
        staffId = defaultStaff?.id || "Dana";
        staffName = defaultStaff?.name || "דנה";
      }

      // Calculate end time based on service duration
      const durationMinutes = parseServiceDuration(selectedServiceObj.duration);
      const endTimeStr = calculateEndTime(timeStr, durationMinutes);

      // Calculate recurring dates if service type is recurring
      // DEBUG: Log the values to verify they are being read correctly
      console.log("[RECURRING APPOINTMENTS] Creating appointments with:", {
        recurringServiceType,
        recurringDuration,
        bookingSelectedDate,
      });
      
      const recurringDates = recurringServiceType !== "Regular Appointment"
        ? calculateRecurringDates(bookingSelectedDate, recurringServiceType, recurringDuration)
        : [new Date(bookingSelectedDate)];
      
      console.log("[RECURRING APPOINTMENTS] Generated dates:", {
        count: recurringDates.length,
        dates: recurringDates.map(d => formatDateLocal(d)),
      });

      // Create appointments for all recurring dates
      // CRITICAL: Prevent duplicate appointment creation and overlapping appointments
      // Use functional update to check previous state and prevent duplicates/overlaps
      setCustomEvents((prev) => {
        const newEvents = [];
        let skippedCount = 0;

        // CRITICAL: Get the first selected date (the date the user chose to start the recurring appointments)
        // We only check for conflicts on dates from this date forward, not on dates before it
        const firstSelectedDateIso = bookingSelectedDate;
        
        // Generate appointments for each recurring date
        for (const appointmentDate of recurringDates) {
          // CRITICAL: Use local timezone format, not UTC (toISOString converts to UTC which can shift dates backward)
          const appointmentDateIso = formatDateLocal(appointmentDate);
          
          // CRITICAL: Only check for conflicts on dates from the first selected date forward
          // Skip checking dates that are before the first selected date (they are not part of the recurring chain)
          if (appointmentDateIso < firstSelectedDateIso) {
            // This date is before the first selected date - skip conflict check for it
            // But we should still create the appointment if it's in the recurring dates array
            // Actually, we should NOT create appointments before the first selected date
            continue; // Skip creating appointments before the first selected date
          }
          
          // CRITICAL: Also skip past dates (before today) - we only create future appointments
          const nowCheck = new Date();
          const currentDateIsoCheck = nowCheck.toISOString().slice(0, 10);
          if (appointmentDateIso < currentDateIsoCheck) {
            // This is a past date - skip creating appointment for it
            continue; // Skip creating appointments for past dates
          }
          
          // Check if an identical appointment already exists
          const isDuplicate = prev.some((event) => {
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
            continue; // Skip this date and continue to next
          }

          // CRITICAL: Check for overlapping appointments for the same staff member
          // ONLY check FUTURE appointments (from today forward), NOT past appointments
          const now = new Date();
          const currentDateIso = now.toISOString().slice(0, 10);
          const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          // CRITICAL: Skip checking conflicts for past dates - only check future dates
          // If the appointment date is in the past (before today), skip conflict check entirely
          if (appointmentDateIso < currentDateIso) {
            // This is a past date - skip conflict check and continue to next date
            console.log("[OVERLAP CHECK] Skipping past date:", appointmentDateIso);
            // Still create the appointment for past dates (if needed)
            // But we won't check for conflicts on past dates
          } else {
            // This is a future date (today or later) - check for conflicts
            
            // CRITICAL: Filter to get ALL future events (from today forward) for conflict checking
            const relevantEvents = prev.filter((event) => {
              // Only consider events from today forward (future appointments)
              if (event.date < currentDateIsoCheck) {
                return false; // Past appointments - ignore
              }
              
              // If the event is today, check if it's already ended
              if (event.date === currentDateIsoCheck) {
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
            
            // DEBUG: Log overlap check
            console.log("[OVERLAP CHECK] Checking for conflicts:", {
              appointmentDateIso,
              firstSelectedDateIso,
              currentDateIso,
              timeStr,
              endTimeStr,
              staffId,
              totalEvents: prev.length,
              relevantEventsCount: relevantEvents.length,
              filteredOutCount: prev.length - relevantEvents.length,
              existingEventsCount: relevantEvents.filter(e => e.staff === staffId && e.date === appointmentDateIso).length
            });
            
            const conflictingEvent = relevantEvents.find((event) => {
              // Only check events for the same staff member and same date
              if (event.staff !== staffId || event.date !== appointmentDateIso) {
                return false;
              }
              
              // Check if time ranges overlap
              const overlaps = timeRangesOverlap(timeStr, endTimeStr, event.start, event.end);
              
              // DEBUG: Log overlap check result
              if (overlaps) {
                console.log("[OVERLAP DETECTED]", {
                  newAppointment: `${timeStr} - ${endTimeStr}`,
                  existingAppointment: `${event.start} - ${event.end}`,
                  eventDate: event.date,
                  firstSelectedDateIso,
                  appointmentDateIso,
                  event
                });
              }
              
              return overlaps;
            });

            if (conflictingEvent) {
              // Stop creating appointments and show conflict modal
              // Store conflicting appointment details for display (only first conflict)
              hasConflictRef.current = true; // Mark that there was a conflict
              setConflictingAppointment({
                client: conflictingEvent.client || conflictingEvent.clientName || "לקוח לא ידוע",
                date: appointmentDateIso,
                time: `${conflictingEvent.start}–${conflictingEvent.end}`,
              });
              setShowBookingConflictModal(true);
              // Return previous state without adding any new appointments
              return prev;
            }
          }

          // Create appointment for this date
          const newEvent = {
            id: uuid(), // Unique ID for this appointment - not based on client ID
            date: appointmentDateIso,
            title: `${selectedServiceObj.name} – ${selectedWaitlistClient.name}`,
            client: selectedWaitlistClient.name,
            clientId: selectedWaitlistClient.id,
            staff: staffId,
            staffName: staffName,
            // ⭐ SINGLE SOURCE OF TRUTH: start time is set here
            // timeStr comes from getExactStartTime(bookingSelectedTime) - NO rounding, NO adjustment
            // If bookingSelectedTime is "13:05", start will be exactly "13:05"
            start: timeStr,
            end: endTimeStr, // Calculated from start time + service duration
            serviceId: bookingSelectedService,
            serviceName: selectedServiceObj.name,
            color: "#FFE4F1",
          };

          newEvents.push(newEvent);
        }

        // Log skipped appointments if any
        if (skippedCount > 0) {
          console.log(`[RECURRING APPOINTMENTS] Skipped ${skippedCount} appointment(s) due to conflicts`);
        }

        // Always ADD the new appointments to the array - never filter, remove, or update existing appointments
        // This allows multiple appointments for the same client to coexist
        return [...prev, ...newEvents];
      });

      // CRITICAL: Do NOT navigate or change the calendar view after creating an appointment
      // The calendar should remain on the same date and view where the user created the appointment
      // The new appointment will appear in the current view automatically

      // Reset and close panel ONLY if there was no conflict
      // If there was a conflict, keep the panel open so user can see the error and fix it
      if (!hasConflictRef.current) {
            setWaitlistAddStep("date");
            setSelectedWaitlistClient(null);
            setBookingSelectedService(null);
            setBookingSelectedDate(null);
            setBookingSelectedTime(null);
            setBookingSelectedStaff(null);
            setSelectedStaffForBooking(null); // Reset staff selection for booking flow
        setRecurringServiceType("Regular Appointment"); // Reset recurring settings
        setRecurringDuration("1 Month"); // Reset recurring duration
        setIsWaitlistAddOpen(false);
      } else {
        // Reset the conflict flag for next time
        hasConflictRef.current = false;
      }

    } else if (addFlowMode === "waitlist") {
      // Create waitlist entry
      const newItem = {
        id: uuid(),
        client: selectedWaitlistClient,
        service: selectedServiceObj,
        date: bookingSelectedDate instanceof Date 
          ? bookingSelectedDate 
          : new Date(bookingSelectedDate),
        time: bookingSelectedTime,
        startDateTime: startDateTime.toISOString(),
        status: "waiting",
        createdAt: new Date().toISOString(),
      };

      setWaitlistItems((prev) => [...prev, newItem]);

      // Reset and close panel
      setWaitlistAddStep("date");
      setSelectedWaitlistClient(null);
      setBookingSelectedService(null);
      setBookingSelectedDate(null);
      setBookingSelectedTime(null);
      setIsWaitlistAddOpen(false);
      
      // Open waitlist panel to show the new entry
      setWaitlistFilter("waiting");
      setWaitlistRange("all");
      setIsWaitlistOpen(true);
    }
  };

  // רשימת קליינטים לפלואו (ניתנת להרחבה ע"י Add new client)
  const [clients, setClients] = useState(DEMO_WAITLIST_CLIENTS);

  // לקוח שנבחר בפלואו ה-Waitlist
  const [selectedWaitlistClient, setSelectedWaitlistClient] = useState(null);

  // פילטר לטאב: "waiting" | "expired" | "booked" | "all"
  const [waitlistFilter, setWaitlistFilter] = useState("waiting");
  const [waitlistRange, setWaitlistRange] = useState("30days");

  // sort dropdown state
  const [waitlistSort, setWaitlistSort] = useState("created-oldest");
  const [isWaitlistRangeOpen, setIsWaitlistRangeOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // סטייט ל־Actions dropdown של כרטיסי ה־Waitlist
  const [openWaitlistActionId, setOpenWaitlistActionId] = useState(null);

  // פופ חדש – Add client מה־Waitlist
  const [isWaitlistAddOpen, setIsWaitlistAddOpen] = useState(false);
  const [waitlistClientSearch, setWaitlistClientSearch] = useState("");
  // שלב בתוך הפאנל: "client" / "date" / "time" / "service"
  const [waitlistAddStep, setWaitlistAddStep] = useState("date");
  // מאיפה הפלואו התחיל: "waitlist" או "booking"
  // "waitlist" = creates waitlist entry
  // "booking" = creates calendar appointment
  const [addFlowMode, setAddFlowMode] = useState("waitlist");

  // מצב לפופ־אפ Add new client (מודאל נפרד)
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCity, setNewClientCity] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientErrors, setNewClientErrors] = useState({});

  // תאריך ושעה שנבחרו
  const [bookingSelectedDate, setBookingSelectedDate] = useState(null); // "2025-12-30" לדוגמה
  const [bookingSelectedTime, setBookingSelectedTime] = useState(null); // "14:30" לדוגמה
  
  // שירות שנבחר
  const [bookingSelectedService, setBookingSelectedService] = useState(null);
  
  // עובד שנבחר (לפלואו הבוקינג)
  const [bookingSelectedStaff, setBookingSelectedStaff] = useState(null);
  
  // עובד שנבחר בפלואו הבוקינג (שלב נפרד)
  const [selectedStaffForBooking, setSelectedStaffForBooking] = useState(null);
  
  const [bookingMonth, setBookingMonth] = useState(() => new Date());
  const [serviceSearch, setServiceSearch] = useState("");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  
  // Recurring appointment settings
  const [recurringServiceType, setRecurringServiceType] = useState("Regular Appointment");
  const [recurringDuration, setRecurringDuration] = useState("1 Month");
  const [isServiceTypeDropdownOpen, setIsServiceTypeDropdownOpen] = useState(false);
  const [isRepeatDurationDropdownOpen, setIsRepeatDurationDropdownOpen] = useState(false);

  // Handle creating a new client - moved here to have access to all state variables
  const handleCreateNewClient = () => {
    const errors = {};
    if (!newClientName.trim()) {
      errors.name = "שם הוא שדה חובה";
    }
    
    // Validate Israeli phone number: exactly 10 digits
    const phoneDigits = newClientPhone.trim().replace(/\D/g, ''); // Remove all non-digits
    if (!newClientPhone.trim()) {
      errors.phone = "טלפון הוא שדה חובה";
    } else if (phoneDigits.length !== 10) {
      errors.phone = "מספר טלפון חייב להכיל בדיוק 10 ספרות";
    }

    setNewClientErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const initials = newClientName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newClient = {
      id: Date.now(),
      name: newClientName.trim(),
      phone: phoneDigits, // Store only digits (10 digits)
      email: newClientEmail.trim(),
      city: newClientCity.trim(),
      address: newClientAddress.trim(),
      initials: initials || "ל",
    };

    // Check if we're in waitlist flow
    // CRITICAL: Check addFlowMode FIRST - this is the primary indicator
    // Also check if waitlist add popup is open as a fallback
    const isWaitlistFlow = addFlowMode === "waitlist" || (isWaitlistAddOpen && addFlowMode !== "booking");
    
    // Check if we have the minimum required data for waitlist (date, time, service)
    const hasValidTime = bookingSelectedTime && bookingSelectedTime !== "any" && typeof bookingSelectedTime === "string" && bookingSelectedTime.includes(":");
    const hasAllWaitlistData = bookingSelectedDate && hasValidTime && bookingSelectedService;

    // CRITICAL: Only proceed if we're definitely in waitlist flow AND have all data
    if (isWaitlistFlow && hasAllWaitlistData) {
      // Find the service object
      const selectedServiceObj = DEMO_SERVICES.find(
        (s) => s.id === bookingSelectedService
      );

      if (selectedServiceObj) {
        // Build full date-time
        const startDateTime = new Date(bookingSelectedDate);
        if (bookingSelectedTime && typeof bookingSelectedTime === "string" && bookingSelectedTime.includes(":")) {
          // Handle both single time (e.g., "10:00") and range (e.g., "10:00-10:30")
          // Extract just the start time (first part before "-" if it's a range)
          const timeStr = bookingSelectedTime.split("-")[0].trim();
          const [h, m] = timeStr.split(":").map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            startDateTime.setHours(h, m, 0, 0);
          }
        }

        // Create waitlist item with the selected date, time, service, staff (if available), and new client
        const newWaitlistItem = {
          id: uuid(),
          client: newClient,
          service: selectedServiceObj,
          date: bookingSelectedDate instanceof Date 
            ? bookingSelectedDate 
            : new Date(bookingSelectedDate),
          time: bookingSelectedTime,
          startDateTime: startDateTime.toISOString(),
          status: "waiting",
          createdAt: new Date().toISOString(),
          // Include staff if it was selected
          ...(bookingSelectedStaff && {
            staff: bookingSelectedStaff.id,
            staffName: bookingSelectedStaff.name,
          }),
        };

        // Add to waitlist - THIS IS THE CRITICAL STEP
        setWaitlistItems((prev) => [...prev, newWaitlistItem]);

        // Add client to clients list (global clients list) - optional for now
        setClients((prev) => [newClient, ...prev]);

        // Close new client modal first
        setIsNewClientModalOpen(false);
        
        // IMPORTANT: Close waitlist flow popup completely BEFORE opening waitlist list
        // This ensures the flow doesn't show the date selection screen
        setIsWaitlistAddOpen(false);
        
        // Open waitlist LIST view FIRST to show the new entry (final destination)
        // This must happen before resetting state to ensure proper navigation
        setWaitlistFilter("waiting");
        setWaitlistRange("all");
        setIsWaitlistOpen(true);
        
        // Reset waitlist flow state AFTER opening the list view
        // This cleanup happens after navigation is complete
        // IMPORTANT: Do NOT reset addFlowMode - keep it as "waitlist" to prevent flow restart
        setWaitlistAddStep("date");
        setSelectedWaitlistClient(null);
        setBookingSelectedService(null);
        setBookingSelectedDate(null);
        setBookingSelectedTime(null);
        setBookingSelectedStaff(null);
        setServiceSearch("");
        setIsTimeDropdownOpen(false);
        // Keep addFlowMode as "waitlist" - do not reset it
      } else {
        // Service not found - but we're in waitlist flow, so still try to create item with available data
        // Build full date-time
        const startDateTime = new Date(bookingSelectedDate);
        if (bookingSelectedTime && typeof bookingSelectedTime === "string" && bookingSelectedTime.includes(":")) {
          // Handle both single time (e.g., "10:00") and range (e.g., "10:00-10:30")
          // Extract just the start time (first part before "-" if it's a range)
          const timeStr = bookingSelectedTime.split("-")[0].trim();
          const [h, m] = timeStr.split(":").map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            startDateTime.setHours(h, m, 0, 0);
          }
        }

        // Create waitlist item even without service object (fallback)
        const newWaitlistItem = {
          id: uuid(),
          client: newClient,
          service: { id: bookingSelectedService, name: "Unknown Service" }, // Fallback service
          date: bookingSelectedDate instanceof Date 
            ? bookingSelectedDate 
            : new Date(bookingSelectedDate),
          time: bookingSelectedTime,
          startDateTime: startDateTime.toISOString(),
          status: "waiting",
          createdAt: new Date().toISOString(),
          // Include staff if it was selected
          ...(bookingSelectedStaff && {
            staff: bookingSelectedStaff.id,
            staffName: bookingSelectedStaff.name,
          }),
        };

        // Add to waitlist
        setWaitlistItems((prev) => [...prev, newWaitlistItem]);
        
        // Add client to clients list
        setClients((prev) => [newClient, ...prev]);

        // Close modals and open waitlist view
        setIsNewClientModalOpen(false);
        setIsWaitlistAddOpen(false);
        setWaitlistFilter("waiting");
        setWaitlistRange("all");
        setIsWaitlistOpen(true);
        
        // Reset state
        // IMPORTANT: Do NOT reset addFlowMode - keep it as "waitlist" to prevent flow restart
        setWaitlistAddStep("date");
        setSelectedWaitlistClient(null);
        setBookingSelectedService(null);
        setBookingSelectedDate(null);
        setBookingSelectedTime(null);
        setBookingSelectedStaff(null);
        setServiceSearch("");
        setIsTimeDropdownOpen(false);
        // Keep addFlowMode as "waitlist" - do not reset it
      }
    } else {
      // Check if we're in booking flow
      const isBookingFlow = addFlowMode === "booking";
      
      // Check if we have all required data for booking (date, time, service)
      const hasValidTime = bookingSelectedTime && bookingSelectedTime !== "any" && typeof bookingSelectedTime === "string" && bookingSelectedTime.includes(":");
      const hasAllBookingData = bookingSelectedDate && hasValidTime && bookingSelectedService;
      
      // CRITICAL: If in booking flow AND have all data, create appointment immediately
      if (isBookingFlow && hasAllBookingData) {
        // Find the service object
        const selectedServiceObj = DEMO_SERVICES.find(
          (s) => s.id === bookingSelectedService
        );

        if (selectedServiceObj) {
          // Create calendar appointment
          const dateIso = bookingSelectedDate instanceof Date 
            ? bookingSelectedDate.toISOString().slice(0, 10)
            : new Date(bookingSelectedDate).toISOString().slice(0, 10);
          
          // SINGLE SOURCE OF TRUTH: Get the exact start time from bookingSelectedTime
          // This uses the EXACT value stored in bookingSelectedTime - no rounding, no adjustment, no recalculation
          // If bookingSelectedTime is "13:05", timeStr will be exactly "13:05"
          // If bookingSelectedTime is "10:00-10:30", timeStr will be exactly "10:00"
          const timeStr = getExactStartTime(bookingSelectedTime);
          
          // DEBUG: Log the exact values to verify 1:1 match
          // CRITICAL VALIDATION: For single time format, the extracted time MUST match the stored time exactly
          if (bookingSelectedTime && typeof bookingSelectedTime === "string" && bookingSelectedTime.includes(":") && !bookingSelectedTime.includes("-")) {
            if (timeStr !== bookingSelectedTime) {
              console.error("[CRITICAL ERROR - NEW CLIENT] Time mismatch detected!", {
                stored: bookingSelectedTime,
                extracted: timeStr,
                message: "The extracted time does not match the stored time - this should NEVER happen!"
              });
            } else {
              console.log("[APPOINTMENT CREATION - NEW CLIENT] ✅ Time match verified:", {
                bookingSelectedTime: bookingSelectedTime,
                extractedTimeStr: timeStr,
                match: true,
              });
            }
          } else {
            console.log("[APPOINTMENT CREATION - NEW CLIENT] Time extraction:", {
              bookingSelectedTime: bookingSelectedTime,
              extractedTimeStr: timeStr,
            });
          }
          
          // Use selected staff from booking flow, or pre-selected from calendar click, or fallback to default
          let staffId, staffName;
          if (selectedStaffForBooking) {
            // Use staff selected in booking flow step 1
            const selectedStaffObj = STAFF_DAY_CALENDARS.find(s => s.id === selectedStaffForBooking);
            staffId = selectedStaffObj?.id || selectedStaffForBooking;
            staffName = selectedStaffObj?.name || "דנה";
          } else if (bookingSelectedStaff) {
            // Use pre-selected staff from calendar click
            staffId = bookingSelectedStaff.id;
            staffName = bookingSelectedStaff.name;
          } else {
            // Get first available staff or use default
            const defaultStaff = STAFF_DAY_CALENDARS.find(s => s.status !== "offline" && s.status !== "not-working") || STAFF_DAY_CALENDARS[0];
            staffId = defaultStaff?.id || "Dana";
            staffName = defaultStaff?.name || "דנה";
          }

          // Calculate end time based on service duration
          const durationMinutes = parseServiceDuration(selectedServiceObj.duration);
          const endTimeStr = calculateEndTime(timeStr, durationMinutes);

          // Calculate recurring dates if service type is recurring
          // DEBUG: Log the values to verify they are being read correctly
          console.log("[RECURRING APPOINTMENTS - NEW CLIENT] Creating appointments with:", {
            recurringServiceType,
            recurringDuration,
            bookingSelectedDate,
          });
          
          const recurringDates = recurringServiceType !== "Regular Appointment"
            ? calculateRecurringDates(bookingSelectedDate, recurringServiceType, recurringDuration)
            : [new Date(bookingSelectedDate)];
          
          console.log("[RECURRING APPOINTMENTS - NEW CLIENT] Generated dates:", {
            count: recurringDates.length,
            dates: recurringDates.map(d => formatDateLocal(d)),
          });

          // Create appointments for all recurring dates
          // CRITICAL: Prevent duplicate appointment creation and overlapping appointments
          setCustomEvents((prev) => {
            const newEvents = [];
            let skippedCount = 0;

            // CRITICAL: Get the first selected date (the date the user chose to start the recurring appointments)
            // We only check for conflicts on dates from this date forward, not on dates before it
            const firstSelectedDateIso = bookingSelectedDate;
            
            // Generate appointments for each recurring date
            for (const appointmentDate of recurringDates) {
              // CRITICAL: Use local timezone format, not UTC (toISOString converts to UTC which can shift dates backward)
              const appointmentDateIso = formatDateLocal(appointmentDate);
              
              // CRITICAL: Only check for conflicts on dates from the first selected date forward
              // Skip checking dates that are before the first selected date (they are not part of the recurring chain)
              if (appointmentDateIso < firstSelectedDateIso) {
                // This date is before the first selected date - skip conflict check for it
                // But we should still create the appointment if it's in the recurring dates array
                // Actually, we should NOT create appointments before the first selected date
                continue; // Skip creating appointments before the first selected date
              }
              
              // CRITICAL: Also skip past dates (before today) - we only create future appointments
              const nowCheckNew = new Date();
              const currentDateIsoCheckNew = nowCheckNew.toISOString().slice(0, 10);
              if (appointmentDateIso < currentDateIsoCheckNew) {
                // This is a past date - skip creating appointment for it
                continue; // Skip creating appointments for past dates
              }
              
              // Check if an identical appointment already exists
              const isDuplicate = prev.some((event) => {
                return (
                  event.date === appointmentDateIso &&
                  event.start === timeStr &&
                  event.staff === staffId &&
                  event.clientId === newClient.id &&
                  event.serviceId === bookingSelectedService
                );
              });

              if (isDuplicate) {
                skippedCount++;
                continue; // Skip this date and continue to next
              }

              // CRITICAL: Check for overlapping appointments for the same staff member
              // ONLY check FUTURE appointments (from today forward), NOT past appointments
              // At this point, appointmentDateIso is guaranteed to be >= currentDateIsoCheckNew (we already filtered out past dates above)
              const currentTimeStr = `${nowCheckNew.getHours().toString().padStart(2, '0')}:${nowCheckNew.getMinutes().toString().padStart(2, '0')}`;
              
              // CRITICAL: Proceed with conflict checking for future dates only
              // At this point, appointmentDateIso is guaranteed to be >= currentDateIsoCheckNew (we already filtered out past dates above)
              
              // CRITICAL: Filter to get ALL future events (from today forward) for conflict checking
                const relevantEvents = prev.filter((event) => {
                  // Only consider events from today forward (future appointments)
                  if (event.date < currentDateIsoCheckNew) {
                    return false; // Past appointments - ignore
                  }
                  
                  // If the event is today, check if it's already ended
                  if (event.date === currentDateIsoCheckNew) {
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
                
                const conflictingEvent = relevantEvents.find((event) => {
                  // Only check events for the same staff member and same date
                  if (event.staff !== staffId || event.date !== appointmentDateIso) {
                    return false;
                  }
                  
                  // Check if time ranges overlap
                  return timeRangesOverlap(timeStr, endTimeStr, event.start, event.end);
                });

                if (conflictingEvent) {
                  // Stop creating appointments and show conflict modal
                  // Store conflicting appointment details for display (only first conflict)
                  hasConflictRef.current = true; // Mark that there was a conflict
                  setConflictingAppointment({
                    client: conflictingEvent.client || conflictingEvent.clientName || "לקוח לא ידוע",
                    date: appointmentDateIso,
                    time: `${conflictingEvent.start}–${conflictingEvent.end}`,
                  });
                  setShowBookingConflictModal(true);
                  // Return previous state without adding any new appointments
                  return prev;
                }

              // Create appointment for this date
              const newEvent = {
                id: uuid(), // Unique ID for this appointment - not based on client ID
                date: appointmentDateIso,
                title: `${selectedServiceObj.name} – ${newClient.name}`,
                client: newClient.name,
                clientId: newClient.id,
                staff: staffId,
                staffName: staffName,
                // ⭐ SINGLE SOURCE OF TRUTH: start time is set here
                // timeStr comes from getExactStartTime(bookingSelectedTime) - NO rounding, NO adjustment
                // If bookingSelectedTime is "13:05", start will be exactly "13:05"
                start: timeStr,
                end: endTimeStr, // Calculated from start time + service duration
                serviceId: bookingSelectedService,
                serviceName: selectedServiceObj.name,
                color: "#FFE4F1",
              };

              newEvents.push(newEvent);
            }

            // Log skipped appointments if any
            if (skippedCount > 0) {
              console.log(`[RECURRING APPOINTMENTS - NEW CLIENT] Skipped ${skippedCount} appointment(s) due to conflicts`);
            }

            // Always ADD the new appointments to the array
            return [...prev, ...newEvents];
          });

          // Add client to clients list
          setClients((prev) => [newClient, ...prev]);

          // Close new client modal
          setIsNewClientModalOpen(false);
          
          // CRITICAL: Close booking flow panel completely ONLY if there was no conflict
          // If there was a conflict, keep the panel open so user can see the error and fix it
          if (!hasConflictRef.current) {
            // CRITICAL: Close booking flow panel completely
            // Do NOT restart the flow - just close it
            setIsWaitlistAddOpen(false);
            
            // CRITICAL: Do NOT navigate or change the calendar view
            // The calendar should remain on the same date and view where the user created the appointment
            
            // Reset booking flow state AFTER closing the panel
            // IMPORTANT: Do NOT reset addFlowMode - it will be reset when flow is opened again
            setWaitlistAddStep("date");
            setSelectedWaitlistClient(null);
            setBookingSelectedService(null);
            setBookingSelectedDate(null);
            setBookingSelectedTime(null);
            setBookingSelectedStaff(null);
            setSelectedStaffForBooking(null);
            setServiceSearch("");
            setIsTimeDropdownOpen(false);
          } else {
            // Reset the conflict flag for next time
            hasConflictRef.current = false;
          }
        } else {
          // Service not found - fallback: just set client and close modal
          setSelectedWaitlistClient(newClient);
          setClients((prev) => [newClient, ...prev]);
          setIsNewClientModalOpen(false);
        }
      } else if (isWaitlistFlow) {
        // We're in waitlist flow but missing required data - set client and stay in flow
        setSelectedWaitlistClient(newClient);
        setIsNewClientModalOpen(false);
        // Don't restart the flow - stay on current step
      } else {
        // Not in booking flow or missing data - set selected client and continue flow
        setSelectedWaitlistClient(newClient);
        setClients((prev) => [newClient, ...prev]);
        setIsNewClientModalOpen(false);
        // Don't restart - stay on current step if in booking flow
        if (isBookingFlow) {
          // In booking flow but missing data - stay on current step
          // Don't reset the flow
        } else {
          // Not in booking flow - reset to date step
          setWaitlistAddStep("date");
          setBookingSelectedTime("any");
          setBookingSelectedService(null);
          setServiceSearch("");
          setIsTimeDropdownOpen(false);
        }
      }
    }

    // Always reset form fields
    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
    setNewClientCity("");
    setNewClientAddress("");
    setNewClientErrors({});
  };

  const weekStart = useMemo(
    () => (customWeekStart ? customWeekStart : getStartOfWeek(currentDate)),
    [currentDate, customWeekStart]
  );

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart]
  );

  const headerLabel = useMemo(
    () => formatHeaderLabel(view, currentDate, weekStart, language),
    [view, currentDate, weekStart, language]
  );

  // אירועים לתצוגה – דמו + אירועים אמיתיים
  const demoEvents = useMemo(() => {
    const base = createDemoEvents(weekDays);
    return [...base, ...customEvents];
  }, [weekDays, customEvents]);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  

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
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setPickerMonth(now);
    setSelectedDate(now);
    setView("day"); // Today -> Day view
    setCustomWeekStart(null);
  };

  // toggle עובד בודד
  const toggleStaffMember = (id) => {
    setSelectedTeamMembers((prev) => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter((sId) => sId !== id);
      } else {
        next = [...prev, id];
      }

      if (next.length === ALL_STAFF_IDS.length) {
        setSelectedStaff("all-business");
      } else {
        setSelectedStaff("custom");
      }

      return next;
    });
  };

  const handleClearAllStaff = () => {
    setSelectedTeamMembers([]);
    setSelectedStaff("custom");
  };

  const staffButtonLabel = useMemo(() => {
    if (selectedStaff === "all-business") {
      return "כל הצוות";
    }
    if (selectedStaff === "scheduled-team") {
      return "צוות מתוזמן";
    }
    if (selectedTeamMembers.length === 0) {
      return "לא נבחרו עובדים";
    }
    if (selectedTeamMembers.length === ALL_STAFF_IDS.length) {
      return "כל הצוות";
    }
    return `${selectedTeamMembers.length} חברי צוות`;
  }, [selectedStaff, selectedTeamMembers]);

  const filterEvents = (events) =>
    events.filter((e) => {
      const locOk =
        selectedLocation === "all" || e.location === selectedLocation;

      if (selectedStaff === "all-business") {
        return locOk;
      }

      if (selectedStaff === "scheduled-team") {
        const scheduledIds = STAFF_DAY_CALENDARS.filter(
          (s) => s.status !== "offline" && s.status !== "not-working"
        ).map((s) => s.id);
        return locOk && scheduledIds.includes(e.staff);
      }

      if (selectedStaff === "custom") {
        if (!selectedTeamMembers.length) return false;
        return locOk && selectedTeamMembers.includes(e.staff);
      }

      if (selectedStaff === "with-appointments") {
        return locOk;
      }

      return locOk && e.staff === selectedStaff;
    });

  // Helper function to check if a time range overlaps with an existing appointment
  const checkTimeOverlap = (events, dateIso, staffId, startTime, endTime, excludeEventId = null) => {
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

  const renderEvent = (event, dateIso, staffId) => {
    const start = parseTime(event.start);
    const end = parseTime(event.end);
    const isDragging = draggedEvent?.id === event.id;
    const isHovered = hoveredAppointmentId === event.id && !isDragging; // Only hover if not dragging
    
    // Calculate visual position: use dragged position if dragging, otherwise use original position
    let top, height;
    if (isDragging) {
      // When dragging, show the appointment ONLY in the target column (dragPosition.staffId)
      // Hide it in all other columns, including the original column
      if (dragPosition.dateIso === dateIso && dragPosition.staffId === staffId) {
        // This is the target column - show the appointment here with snapped position
        top = dragPosition.y; // This is already snapped to grid in onDragOver
        height = Math.max((end - start) * slotHeight - 2, 40);
      } else {
        // Not the target column - hide the appointment (including in original column)
        return null;
      }
    } else {
      // Normal position (not dragging) - only show if this event belongs to this staff/date
      if (event.staff !== staffId || event.date !== dateIso) {
        return null; // Don't render events that don't belong to this column
      }
      top = (start - START_HOUR) * slotHeight;
      height = Math.max((end - start) * slotHeight - 2, 40);
    }

    // Calculate appointment duration in minutes
    const durationMinutes = (end - start) * 60;
    // Use compact single-line format only for appointments of 15 minutes or less
    // All appointments longer than 15 minutes use the three-row format
    const useCompactFormat = durationMinutes <= 15;

    const handleDragStart = (e) => {
      e.stopPropagation(); // Prevent triggering column click
      setDraggedEvent(event);
      setActiveDraggedAppointmentId(event.id); // Track which appointment is being dragged
      const rect = e.currentTarget.getBoundingClientRect();
      const columnRect = e.currentTarget.closest('[data-column]')?.getBoundingClientRect();
      if (columnRect) {
        // Calculate the offset from mouse Y to appointment top (relative to column)
        // This ensures the appointment doesn't jump when drag starts
        const mouseYRelativeToColumn = e.clientY - columnRect.top;
        const appointmentTopRelativeToColumn = top; // top is already relative to the column
        const clickOffsetY = mouseYRelativeToColumn - appointmentTopRelativeToColumn;
        setDragClickOffsetY(clickOffsetY);
        
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        // Initialize drag position with current event position (snapped)
        // Use the appointment's current top position - no jump on drag start
        const currentY = top;
        const slot5 = slotHeight / 12;
        let slotIndex = Math.floor(currentY / slot5);
        if (slotIndex < 0) slotIndex = 0;
        const maxIndex = HOURS.length * 12 - 1;
        if (slotIndex > maxIndex) slotIndex = maxIndex;
        const snappedY = slotIndex * slot5; // Snapped Y position
        const totalMinutes = START_HOUR * 60 + slotIndex * 5;
        const timeLabel = minutesToLabel(totalMinutes);
        setDragPosition({ dateIso, staffId, y: snappedY, time: timeLabel });
      }
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", ""); // Required for Firefox
      
      // Remove the floating ghost copy by setting a transparent drag image
      // This prevents the browser from showing a duplicate/ghost of the appointment
      const dragImage = document.createElement("img");
      dragImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      dragImage.style.width = "1px";
      dragImage.style.height = "1px";
      dragImage.style.opacity = "0";
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      // Remove the temporary image after a short delay
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      }, 0);
    };

    const handleDragEnd = (e) => {
      e.stopPropagation();
      setDraggedEvent(null);
      setActiveDraggedAppointmentId(null); // Clear active dragged appointment
      setDragOffset({ x: 0, y: 0 });
      setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
      setDragClickOffsetY(0);
    };

    const handleClick = (e) => {
      e.stopPropagation(); // Prevent triggering column click
      // DISABLED: No longer opening legacy drawer on appointment click
      // Appointments are draggable - clicking them doesn't open any popup
      // If needed in the future, we can add a click-to-edit feature using the new booking flow
    };

    const handleMouseEnter = (e) => {
      e.stopPropagation(); // Prevent triggering column hover
      if (!isDragging) {
        setHoveredAppointmentId(event.id);
      }
    };

    const handleMouseLeave = (e) => {
      e.stopPropagation(); // Prevent triggering column hover
      setHoveredAppointmentId(null);
    };

    return (
      <div
        key={event.id}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`absolute left-[1px] right-[1px] rounded-md text-[11px] sm:text-xs px-2 py-1.5 text-gray-900 dark:text-white overflow-hidden shadow-sm ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          top,
          height,
          backgroundColor: event.color,
          border: isDragging 
            ? `2px solid ${BRAND_COLOR}` 
            : isHovered
            ? `2px solid ${BRAND_COLOR}`
            : "1px solid rgba(0,0,0,0.04)",
          opacity: isDragging ? 0.8 : 1,
        }}
      >
        <div className="h-full flex items-start justify-end text-right" dir="rtl">
          {useCompactFormat ? (
            /* Single line format for appointments of 15 minutes or less: Client / Time / Service */
            <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] truncate w-full" dir="rtl">
              <span className="font-extrabold text-[13px] sm:text-[14px]">{event.client || event.clientName}</span>
              <span className="opacity-70">/</span>
              <span className="opacity-80">{event.start}–{event.end}</span>
              <span className="opacity-70">/</span>
              <span className="truncate">
                {(() => {
                  const serviceText = event.title || event.serviceName || '';
                  // Remove client name and dash if present (format: "Service Name – Client Name" or "Service Name - Client Name")
                  return serviceText.split(/[–-]/)[0].trim();
                })()}
          </span>
        </div>
          ) : (
            /* Three-row format for appointments longer than 15 minutes: Client, Time, Service */
            <div className="flex flex-col items-end text-right gap-1 w-full" dir="rtl">
              <div className="font-bold truncate w-full text-right text-[13px] sm:text-[14px]">{event.client || event.clientName}</div>
              <div className="opacity-80 text-[12px] sm:text-[13px] text-right w-full">
                {event.start}–{event.end}
              </div>
              <div className="truncate text-[12px] sm:text-[13px] w-full text-right">
                {(() => {
                  const serviceText = event.title || event.serviceName || '';
                  // Remove client name and dash if present (format: "Service Name – Client Name" or "Service Name - Client Name")
                  return serviceText.split(/[–-]/)[0].trim();
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Hover של 5 דקות
const handleDayMouseMove = (iso, e, staffId = null) => {
  // If dragging an event, don't show hover preview
  if (draggedEvent) {
    return;
  }

  const rect = e.currentTarget.getBoundingClientRect();
  const y = e.clientY - rect.top;

  // CRITICAL: Check if mouse Y position is over an existing appointment block
  // This prevents hover preview from appearing behind/over appointments
  const events = filterEvents(demoEvents);
  const dayEvents = events.filter((ev) => ev.date === iso);
  const staffEvents = dayEvents.filter((ev) => ev.staff === staffId);
  
  // Check if the mouse Y position intersects with any appointment's visual bounds
  const isOverAppointment = staffEvents.some((event) => {
    const eventStart = parseTime(event.start);
    const eventEnd = parseTime(event.end);
    const eventTop = (eventStart - START_HOUR) * slotHeight;
    const eventHeight = Math.max((eventEnd - eventStart) * slotHeight - 2, 40);
    const eventBottom = eventTop + eventHeight;
    
    // Check if mouse Y is within the event block's visual bounds (with small margin for better detection)
    return y >= eventTop - 2 && y <= eventBottom + 2;
  });

  // If hovering over an appointment, do NOT show hover preview
  if (isOverAppointment) {
    setHoverPreview(null);
    return;
  }

  // Mouse is over empty space - show hover preview with 5-minute snapping
  const slot5 = slotHeight / 12;
  let slotIndex = Math.floor(y / slot5);
  if (slotIndex < 0) slotIndex = 0;

  const maxIndex = HOURS.length * 12 - 1;
  if (slotIndex > maxIndex) slotIndex = maxIndex;

  const top = slotIndex * slot5;
  const totalMinutes = START_HOUR * 60 + slotIndex * 5;
  const label = minutesToLabel(totalMinutes);

  setHoverPreview({ iso, top, label, staffId });
};

// כשעוזבים עמודה / יום – מנקה את ההיילייט
const handleDayMouseLeave = () => {
  setHoverPreview(null);
};

  // Handle dropping an appointment on a new time/staff
  const handleAppointmentDrop = (event, targetDateIso, targetStaff, targetTime) => {
    if (!event || !targetDateIso || !targetStaff || !targetTime) {
      return;
    }

    // Calculate new end time based on service duration
    const selectedServiceObj = DEMO_SERVICES.find((s) => 
      event.title?.includes(s.name) || event.service === s.id
    );
    
    let durationMinutes = 30; // Default duration
    if (selectedServiceObj?.duration) {
      durationMinutes = parseServiceDuration(selectedServiceObj.duration);
    } else {
      // Try to calculate from existing start/end times
      const oldStart = parseTime(event.start);
      const oldEnd = parseTime(event.end);
      durationMinutes = Math.round((oldEnd - oldStart) * 60);
    }

    const endTimeStr = calculateEndTime(targetTime, durationMinutes);

    // Check for overlaps with existing appointments (excluding the dragged event)
    const events = filterEvents(demoEvents);
    const hasOverlap = checkTimeOverlap(events, targetDateIso, targetStaff.id, targetTime, endTimeStr, event.id);

    if (hasOverlap) {
      // Revert the appointment to its original position (don't save the new position)
      // Clear drag state
      setDraggedEvent(null);
      setActiveDraggedAppointmentId(null); // Clear active dragged appointment
      setDragOffset({ x: 0, y: 0 });
      setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
      setDragClickOffsetY(0);
      
      // Show blocking popup in center of screen
      setShowOverlapModal(true);
      return;
    }

    // Update the appointment
    setCustomEvents((prev) => {
      return prev.map((e) => {
        if (e.id === event.id) {
          // Find staff name
          const staffObj = STAFF_DAY_CALENDARS.find((s) => s.id === targetStaff.id);
          const staffName = staffObj?.name || targetStaff.name;

          return {
            ...e,
            date: targetDateIso,
            start: targetTime,
            end: endTimeStr,
            staff: targetStaff.id,
            staffName: staffName,
          };
        }
        return e;
      });
    });

    setDraggedEvent(null);
    setActiveDraggedAppointmentId(null); // Clear active dragged appointment
    setDragOffset({ x: 0, y: 0 });
    setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
    setDragClickOffsetY(0);
  };

    // לחיצה על עמודת יום ב-DAY VIEW – מחשבת שעה לפי גובה הקליק
  const handleDayColumnClick = (e, iso, staff) => {
    if (!staff || staff.status === "offline" || staff.status === "not-working") {
      return; // לא פותחים תור לעובד שלא עובד
    }

    const rect = e.currentTarget.getBoundingClientRect();
    let y = e.clientY - rect.top;

    // גובה מקסימלי של היום
    const maxHeight = HOURS.length * slotHeight;
    if (y < 0) y = 0;
    if (y > maxHeight) y = maxHeight;

    // CRITICAL FIX: Calculate time from TOP anchor, not bottom
    // Use the same logic as hover preview to ensure consistency
    // Calculate which 5-minute slot contains the click position (from the top)
    const slot5 = slotHeight / 12; // Height of one 5-minute slot
    let slotIndex = Math.floor(y / slot5); // Floor to snap DOWN to the slot that contains the click
    if (slotIndex < 0) slotIndex = 0;
    
    const maxIndex = HOURS.length * 12 - 1;
    if (slotIndex > maxIndex) slotIndex = maxIndex;

    // Calculate total minutes from the slot index (each slot is 5 minutes)
    // This ensures we snap to the TOP of the slot, not the bottom
    const totalMinutes = START_HOUR * 60 + slotIndex * 5;
    
    // DEBUG: Log the calculation to verify top anchor
    console.log("[CALENDAR CLICK] Time calculation from TOP anchor:", {
      clickY: y,
      slot5: slot5,
      slotIndex: slotIndex,
      totalMinutes: totalMinutes,
      calculatedTime: minutesToLabel(totalMinutes),
    });

    const timeLabel = minutesToLabel(totalMinutes); // "HH:MM"

    // Check if click position (Y coordinate) intersects with any existing event block
    // This is more accurate than just checking time, as it checks the actual visual position
    const events = filterEvents(demoEvents);
    const dayEvents = events.filter((e) => e.date === iso);
    const staffEvents = dayEvents.filter((e) => e.staff === staff.id);
    
    // Check if the click Y position is within any event block's visual bounds
    const clickedEvent = staffEvents.find((event) => {
      const eventStart = parseTime(event.start);
      const eventEnd = parseTime(event.end);
      const eventTop = (eventStart - START_HOUR) * slotHeight;
      const eventHeight = Math.max((eventEnd - eventStart) * slotHeight - 2, 40);
      const eventBottom = eventTop + eventHeight;
      
      // Check if click Y is within the event block's visual bounds
      return y >= eventTop && y <= eventBottom;
    });

    if (clickedEvent) {
      // Click is on an existing appointment
      // DISABLED: No longer opening legacy drawer - appointments are draggable/editable
      // If needed in the future, we can add a click-to-edit feature using the new booking flow
      return;
    }

    // If dragging an event, handle drop
    if (draggedEvent) {
      handleAppointmentDrop(draggedEvent, iso, staff, timeLabel);
      return;
    }

    // Slot is EMPTY - open booking flow with pre-filled values
    const clickedDate = new Date(iso);
    
    // Pre-fill date, time, and staff
    // CRITICAL: timeLabel is the SINGLE SOURCE OF TRUTH - it's already snapped to 5-minute increments
    // This exact value will be used for the appointment start time - NO modification allowed
    console.log("[CALENDAR CLICK] Setting bookingSelectedTime to exact snapped time:", {
      timeLabel: timeLabel,
      totalMinutes: totalMinutes,
      willBeStoredAs: timeLabel,
    });
    setBookingSelectedDate(clickedDate);
    setBookingSelectedTime(timeLabel); // ⭐ SINGLE SOURCE OF TRUTH: Store exact snapped time
    setBookingSelectedStaff({ id: staff.id, name: staff.name });
    
    // Reset other flow state
    setBookingSelectedService(null);
    setSelectedWaitlistClient(null);
    setServiceSearch("");
    setWaitlistClientSearch("");
    setIsTimeDropdownOpen(false);
    
    // Set to booking mode and skip to service step
    setAddFlowMode("booking");
    setWaitlistAddStep("service"); // Skip date/time/staff steps, go directly to service
    
    // Open the booking flow panel
    setIsWaitlistAddOpen(true);
  };

  /* ---------------------  WEEK / DAY GRID  --------------------- */

  const renderTimeGrid = () => {
    const events = filterEvents(demoEvents);

    // DAY VIEW – יומנים לפי אנשי צוות
    if (view === "day") {
      const currentDay = new Date(currentDate);
      currentDay.setHours(0, 0, 0, 0);
      const iso = currentDay.toISOString().slice(0, 10);

      const dayEvents = events.filter((e) => e.date === iso);

      const visibleStaffIds = (() => {
        if (selectedStaff === "all-business") {
          return ALL_STAFF_IDS;
        }
        if (selectedStaff === "scheduled-team") {
          return STAFF_DAY_CALENDARS.filter(
            (s) => s.status !== "offline" && s.status !== "not-working"
          ).map((s) => s.id);
        }
        if (selectedStaff === "custom") {
          return selectedTeamMembers.length ? selectedTeamMembers : ALL_STAFF_IDS;
        }
        if (selectedStaff === "with-appointments") {
          const ids = Array.from(new Set(dayEvents.map((e) => e.staff)));
          return ids.length ? ids : ALL_STAFF_IDS;
        }
        return [selectedStaff];
      })();

      const staffCalendars = STAFF_DAY_CALENDARS.filter((s) =>
        visibleStaffIds.includes(s.id)
      );

      const isTodayFlag =
        new Date().toDateString() === currentDay.toDateString();

      const orderedStaff = [...staffCalendars].sort((a, b) => {
        const score = (s) =>
          s.status === "offline" || s.status === "not-working" ? 1 : 0;
        return score(a) - score(b);
      });

      // Reverse staff order for RTL visual display (right to left)
      // CSS Grid doesn't reverse columns with direction: rtl, so we reverse the array
      const rtlStaff = [...orderedStaff].reverse();

      const now = new Date();
      const hourNow = now.getHours() + now.getMinutes() / 60;
      const showNowLine =
        isTodayFlag && hourNow >= START_HOUR && hourNow <= END_HOUR;
      const nowTop = (hourNow - START_HOUR) * slotHeight;
      const nowLabel = minutesToLabel(
        now.getHours() * 60 + now.getMinutes()
      );

      const colsCount = Math.max(1, orderedStaff.length || 1);

      return (
        <div className="relative flex flex-1 min-h-0">
          {showNowLine && (
            <div
              className="pointer-events-none absolute z-10"
              style={{ 
                top: 112 + nowTop, // 112px = h-28 בר עובדים
                left: 0,
                right: 0,
              }}
            >
              <div className="flex items-center">
                <div
                  className="flex-1 h-[2px]"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
                <div className="w-[72px] sm:w-20 flex items-center">
                  {/* Current time label - solid filled pill, connected to the line */}
                  <div
                    className="py-1.5 px-3 rounded-full text-[14px] font-bold text-white whitespace-nowrap flex items-center justify-center"
                    style={{
                      backgroundColor: BRAND_COLOR,
                    }}
                  >
                    {nowLabel}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* צד שמאל – בר עובדים + טורים (RTL: staff columns right to left) */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#050505]">
            {/* בר העובדים */}
            <div
              className="border-b border-gray-200 dark:border-commonBorder bg-white dark:bg-[#141414] h-28 grid"
              style={{
                gridTemplateColumns: `repeat(${colsCount}, minmax(0,1fr))`,
              }}
            >
              {rtlStaff.map((staff) => {
                const isOffline =
                  staff.status === "offline" || staff.status === "not-working";

                const staffEventsForToday = dayEvents.filter(
                  (e) => e.staff === staff.id
                );
                const bookingsCount = staffEventsForToday.length;

                return (
                  <div
                    key={staff.id}
                    className="relative flex items-center justify-center"
                  >
                    <div
                      className={`relative flex flex-col items-center gap-1 leading-tight ${
                        isOffline ? "opacity-70" : ""
                      }`}
                    >
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-full p-[2px] shadow-sm"
                          style={{
                            background:
                              "linear-gradient(135deg,#FF257C,#FF8FC0,#FFE7F3)",
                          }}
                        >
                          <div className="w-full h-full rounded-full bg-white dark:bg-[#181818] overflow-hidden flex items-center justify-center">
                            {staff.imageUrl ? (
                              <img
                                src={staff.imageUrl}
                                alt={staff.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span
                                className="text-sm font-semibold"
                                style={{ color: BRAND_COLOR }}
                              >
                                {staff.initials}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-gray-900 dark:text:white">
                        {staff.name}
                      </span>

                      <span className="mt-0.5 inline-flex items-center rounded-full px-2 py-[2px] text-[9px] bg-pink-50 text-pink-600 dark:bg-[rgba(255,37,124,0.08)] dark:text-pink-200">
                        {isOffline
                          ? "לא עובד היום"
                          : `${bookingsCount} תורים היום`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* היומן – טורים (RTL: staff columns right to left) */}
            <div
              className="flex-1 relative grid"
              style={{
                gridTemplateColumns: `repeat(${colsCount}, minmax(0,1fr))`,
              }}
            >
              {rtlStaff.map((staff) => {
                const isOffline =
                  staff.status === "offline" || staff.status === "not-working";

                // Filter events for this staff
                let staffEvents = dayEvents.filter(
                  (e) => e.staff === staff.id
                );
                
                // If dragging an event to THIS column, include it even though it hasn't been updated yet
                if (draggedEvent && dragPosition.staffId === staff.id && dragPosition.dateIso === iso) {
                  // Check if dragged event is not already in the list (it might be if dragging within same column)
                  if (!staffEvents.some(e => e.id === draggedEvent.id)) {
                    staffEvents = [...staffEvents, draggedEvent];
                  }
                }
                
                // If dragging an event FROM this column to a different column, exclude it from this column
                if (draggedEvent && draggedEvent.staff === staff.id && dragPosition.staffId !== staff.id) {
                  staffEvents = staffEvents.filter(e => e.id !== draggedEvent.id);
                }

                return (
                  <div
                    key={staff.id}
                    className="relative border-r border-gray-200/80 dark:border-commonBorder"
                  >
                    {isOffline && (
                      <div className="absolute inset-0 pointer-events-none opacity-55">
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(135deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 6px, transparent 6px, transparent 12px)",
                          }}
                        />
                      </div>
                    )}

                    {HOURS.map((h, idx) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-gray-100 dark:border-[#1c1c1c]"
                        style={{ top: idx * slotHeight }}
                      />
                    ))}

                       <div
  className="relative cursor-pointer"
  style={{ height: HOURS.length * slotHeight }}
  data-column
  data-date={iso}
  data-staff-id={staff.id}
  onMouseMove={(e) => handleDayMouseMove(iso, e, staff.id)}
  onMouseLeave={handleDayMouseLeave}
  onClick={(e) => handleDayColumnClick(e, iso, staff)}
  onDragOver={(e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    // Update drag position for visual feedback - SNAP TO 5-MINUTE GRID
    if (draggedEvent) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseYRelativeToColumn = e.clientY - rect.top;
      
      // CRITICAL: Account for the click offset to prevent jump on drag start
      // Calculate where the appointment's TOP should be based on mouse position
      // mouseY - clickOffsetY = appointment top position
      const appointmentTopY = mouseYRelativeToColumn - dragClickOffsetY;
      
      // Use the SAME snapping logic as hover preview and click handler
      const slot5 = slotHeight / 12; // Height of one 5-minute slot
      let slotIndex = Math.floor(appointmentTopY / slot5); // Floor to snap DOWN to the slot
      if (slotIndex < 0) slotIndex = 0;
      const maxIndex = HOURS.length * 12 - 1;
      if (slotIndex > maxIndex) slotIndex = maxIndex;
      
      // Calculate snapped Y position (aligned to grid)
      const snappedY = slotIndex * slot5;
      const totalMinutes = START_HOUR * 60 + slotIndex * 5;
      const timeLabel = minutesToLabel(totalMinutes);
      
      // Store SNAPPED position and time - this is the single source of truth
      setDragPosition({ dateIso: iso, staffId: staff.id, y: snappedY, time: timeLabel });
    }
  }}
  onDrop={(e) => {
    e.preventDefault();
    if (draggedEvent) {
      // CRITICAL: Use dragPosition.staffId (target staff from drag) instead of current column's staff
      // This allows dropping appointments into different staff columns
      const targetStaff = dragPosition.staffId ? 
        STAFF_DAY_CALENDARS.find(s => s.id === dragPosition.staffId) || staff :
        staff;
      
      // Use the SAME snapped time from dragPosition - single source of truth
      // This ensures the saved time matches exactly what was shown during drag
      // Works for drops in ANY column - use the current dragPosition.time
      if (dragPosition.dateIso === iso && dragPosition.time) {
        handleAppointmentDrop(draggedEvent, iso, targetStaff, dragPosition.time);
      } else {
        // Fallback: calculate snapped time (should rarely happen)
        // Account for click offset to prevent jump
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseYRelativeToColumn = e.clientY - rect.top;
        const appointmentTopY = mouseYRelativeToColumn - dragClickOffsetY;
        const slot5 = slotHeight / 12;
        let slotIndex = Math.floor(appointmentTopY / slot5);
        if (slotIndex < 0) slotIndex = 0;
        const maxIndex = HOURS.length * 12 - 1;
        if (slotIndex > maxIndex) slotIndex = maxIndex;
        const totalMinutes = START_HOUR * 60 + slotIndex * 5;
        const timeLabel = minutesToLabel(totalMinutes);
        handleAppointmentDrop(draggedEvent, iso, targetStaff, timeLabel);
      }
      setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
      setDragClickOffsetY(0);
      setActiveDraggedAppointmentId(null); // Clear active dragged appointment
    }
  }}
>

                      {/* Drag time marker - shows ONLY for the actively dragged appointment */}
                      {activeDraggedAppointmentId && 
                       draggedEvent && 
                       draggedEvent.id === activeDraggedAppointmentId &&
                       dragPosition.dateIso === iso && 
                       dragPosition.staffId === staff.id &&
                       dragPosition.time && (
                        <div
                          className="absolute pointer-events-none z-40"
                          style={{
                            right: "-60px",
                            top: dragPosition.y, // Use snapped Y position - aligns with appointment top (no transform)
                          }}
                        >
                          <div
                            className="px-2.5 py-1 rounded-full text-[13px] font-bold text-white whitespace-nowrap shadow-lg"
                            style={{ backgroundColor: BRAND_COLOR }}
                          >
                            {dragPosition.time}
                          </div>
                        </div>
                      )}

                      {hoverPreview &&
                        hoverPreview.iso === iso &&
                        hoverPreview.staffId === staff.id && (
                          <>
                            {/* Preview block */}
                          <div
                            className="absolute left-0 right-0 rounded-md pointer-events-none flex items-center"
                            style={{
                              top: hoverPreview.top,
                                height: slotHeight / 12,
                              backgroundColor: "rgba(255,37,124,0.09)",
                                border: `1px solid ${BRAND_COLOR}`,
                              }}
                            >
                              {/* Time label pill - positioned over gray time text */}
                              <div
                                className="absolute pointer-events-none z-30"
                                style={{
                                  right: "-4px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              >
                                <div
                                  className="px-3 py-1.5 rounded-full text-[16px] font-bold text-white whitespace-nowrap"
                                  style={{
                                    backgroundColor: BRAND_COLOR,
                                  }}
                                >
                                  {hoverPreview.label}
                                </div>
                              </div>
                              {/* Gray time text - hidden behind pill */}
                              <span className="ml-2 text-[10px] font-medium text-gray-700 dark:text-gray-100 opacity-0">
                              {hoverPreview.label}
                            </span>
                          </div>
                          </>
                        )}

                      {staffEvents.map((event) => renderEvent(event, iso, staff.id))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* עמודת שעות – DAY VIEW (moved to right side) */}
          <div className="w-[72px] sm:w-20 bg-white dark:bg-[#101010] text-[10px] sm:text-[13px] text-gray-500 dark:text-gray-400">
            {/* חלק עליון זהה לבר העובדים */}
            <div className="h-28 border-b border-gray-200/80 dark:border-commonBorder bg-white dark:bg-[#141414]" />

            {HOURS.map((h) => (
              <div
                key={h}
                className="flex items-start justify-center pr-1 sm:pr-2 pt-1 font-bold border-t border-l border-gray-200/80 dark:border-[#1c1c1c] bg-white dark:bg-[#101010]"
                style={{ height: slotHeight }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>
        </div>
      );
    }

     // WEEK VIEW
  const daysToRender = weekDays;

  // Current time indicator for week view
  const now = new Date();
  const hourNow = now.getHours() + now.getMinutes() / 60;
  const weekStartDate = weekStart;
  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekStart.getDate() + 6);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isTodayInWeek = today >= weekStartDate && today <= weekEndDate;
  const showNowLineWeek = isTodayInWeek && hourNow >= START_HOUR && hourNow <= END_HOUR;
  const nowTopWeek = (hourNow - START_HOUR) * slotHeight;
  const nowLabelWeek = minutesToLabel(
    now.getHours() * 60 + now.getMinutes()
  );

  return (
    <div className="relative flex flex-1 min-h-0">
      {/* Current time indicator for week view */}
      {showNowLineWeek && (
        <div
          className="pointer-events-none absolute z-10"
          style={{ 
            top: 96 + nowTopWeek, // 96px = h-24 בר הימים
            left: 0,
            right: 0,
          }}
        >
          <div className="flex items-center">
            <div
              className="flex-1 h-[2px]"
              style={{ backgroundColor: BRAND_COLOR }}
            />
            <div className="w-[72px] sm:w-20 flex items-center">
              {/* Current time label - solid filled pill, connected to the line */}
              <div
                className="py-1.5 px-3 rounded-full text-[14px] font-bold text-white whitespace-nowrap flex items-center justify-center"
                style={{
                  backgroundColor: BRAND_COLOR,
                }}
              >
                {nowLabelWeek}
          </div>
      </div>
          </div>
        </div>
      )}

      {/* ימים – RTL: שבת שמאל ← א' ימין */}
      <div
        className="flex-1 grid grid-cols-7 bg-white dark:bg-[#050505]"
        dir="rtl"
      >
        {daysToRender.map((day) => {
          const iso = day.toISOString().slice(0, 10);
          const { dayName, dayNum } = formatDayLabel(day, language);
          const isTodayFlag =
            new Date().toDateString() === day.toDateString();

          const dayEvents = events.filter((e) => e.date === iso);

          return (
            <div
              key={iso}
              className="relative group border-b border-gray-200/80 dark:border-commonBorder"
            >
              {/* כותרת היום */}
              <div
                className={`h-24 flex flex-col items-center justify-center transition-colors mx-1
                  ${
                    isTodayFlag
                      ? "bg-white dark:bg-[#141414]"
                      : "bg-white dark:bg-[#080808]"
                  }
                  group-hover:bg-[rgba(255,37,124,0.06)] group-hover:rounded-2xl
                `}
              >
                <span
                  className={`text-[13px] uppercase tracking-wide ${
                    isTodayFlag
                      ? "text-[var(--brand-color,#7C3AED)]"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  style={isTodayFlag ? { color: BRAND_COLOR } : undefined}
                >
                  {dayName}
                </span>
                <span
                  className={`
                    inline-flex items-center justify-center
                    w-9 h-9 rounded-full text-sm font-semibold
                    ${
                      isTodayFlag
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-100"
                    }
                  `}
                  style={
                    isTodayFlag ? { backgroundColor: BRAND_COLOR } : undefined
                  }
                >
                  {dayNum}
                </span>
              </div>

              {/* הצללה עדינה מתחת לבר הימים – גולשת לתוך היומן */}
              <div
                className="pointer-events-none absolute inset-x-0 top-24 h-12"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(15,23,42,0.04), rgba(15,23,42,0))",
                }}
              />

              {/* גוף היום */}
              <div
                className="relative"
                style={{
                  height: HOURS.length * slotHeight,
                }}
                data-column
                data-date={iso}
                onMouseMove={(e) => {
                  // For week view, use first available staff
                  const firstAvailableStaff = STAFF_DAY_CALENDARS.find(
                    s => s.status !== "offline" && s.status !== "not-working"
                  ) || STAFF_DAY_CALENDARS[0];
                  if (firstAvailableStaff) {
                    handleDayMouseMove(iso, e, firstAvailableStaff.id);
                  }
                }}
                onMouseLeave={handleDayMouseLeave}
                onClick={(e) => {
                  // For week view, we need to find which staff column was clicked
                  // Since week view doesn't have staff columns, we'll use the first available staff
                  const firstAvailableStaff = STAFF_DAY_CALENDARS.find(
                    s => s.status !== "offline" && s.status !== "not-working"
                  ) || STAFF_DAY_CALENDARS[0];
                  
                  if (firstAvailableStaff) {
                    // Create a synthetic event to pass to handleDayColumnClick
                    const syntheticEvent = {
                      currentTarget: e.currentTarget,
                      clientY: e.clientY,
                    };
                    handleDayColumnClick(syntheticEvent, iso, firstAvailableStaff);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  
                  // Update drag position for visual feedback - SNAP TO 5-MINUTE GRID
                  if (draggedEvent) {
                    // For week view, we need to detect which staff column the mouse is over
                    // Since week view doesn't have separate staff columns, we'll use the first available staff
                    // In a future enhancement, we could detect the column based on mouse X position
                    const firstAvailableStaff = STAFF_DAY_CALENDARS.find(
                      s => s.status !== "offline" && s.status !== "not-working"
                    ) || STAFF_DAY_CALENDARS[0];
                    if (firstAvailableStaff) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mouseYRelativeToColumn = e.clientY - rect.top;
                      
                      // CRITICAL: Account for the click offset to prevent jump on drag start
                      // Calculate where the appointment's TOP should be based on mouse position
                      const appointmentTopY = mouseYRelativeToColumn - dragClickOffsetY;
                      
                      // Use the SAME snapping logic as hover preview and click handler
                      const slot5 = slotHeight / 12; // Height of one 5-minute slot
                      let slotIndex = Math.floor(appointmentTopY / slot5); // Floor to snap DOWN to the slot
                      if (slotIndex < 0) slotIndex = 0;
                      const maxIndex = HOURS.length * 12 - 1;
                      if (slotIndex > maxIndex) slotIndex = maxIndex;
                      
                      // Calculate snapped Y position (aligned to grid)
                      const snappedY = slotIndex * slot5;
                      const totalMinutes = START_HOUR * 60 + slotIndex * 5;
                      const timeLabel = minutesToLabel(totalMinutes);
                      
                      // Store SNAPPED position and time - this is the single source of truth
                      // Use firstAvailableStaff.id for week view (in day view, staff.id is already set in onDragOver)
                      setDragPosition({ dateIso: iso, staffId: firstAvailableStaff.id, y: snappedY, time: timeLabel });
                    }
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedEvent) {
                    const firstAvailableStaff = STAFF_DAY_CALENDARS.find(
                      s => s.status !== "offline" && s.status !== "not-working"
                    ) || STAFF_DAY_CALENDARS[0];
                    if (firstAvailableStaff) {
                      // Use the SAME snapped time from dragPosition - single source of truth
                      // This ensures the saved time matches exactly what was shown during drag
                      // Works for drops in ANY column - use the current dragPosition.time
                      if (dragPosition.dateIso === iso && dragPosition.time) {
                        handleAppointmentDrop(draggedEvent, iso, firstAvailableStaff, dragPosition.time);
                      } else {
                        // Fallback: calculate snapped time (should rarely happen)
                        // Account for click offset to prevent jump
                        const rect = e.currentTarget.getBoundingClientRect();
                        const mouseYRelativeToColumn = e.clientY - rect.top;
                        const appointmentTopY = mouseYRelativeToColumn - dragClickOffsetY;
                        const slot5 = slotHeight / 12;
                        let slotIndex = Math.floor(appointmentTopY / slot5);
                        if (slotIndex < 0) slotIndex = 0;
                        const maxIndex = HOURS.length * 12 - 1;
                        if (slotIndex > maxIndex) slotIndex = maxIndex;
                        const totalMinutes = START_HOUR * 60 + slotIndex * 5;
                        const timeLabel = minutesToLabel(totalMinutes);
                        handleAppointmentDrop(draggedEvent, iso, firstAvailableStaff, timeLabel);
                      }
                      setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
                      setDragClickOffsetY(0);
                      setActiveDraggedAppointmentId(null); // Clear active dragged appointment
                    }
                  }
                }}
              >
                {/* קווי שעות */}
                {HOURS.map((h, idx) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-gray-100 dark:border-[#1c1c1c]"
                    style={{ top: idx * slotHeight }}
                  />
                ))}

                {/* Drag time marker - shows ONLY for the actively dragged appointment (week view) */}
                {activeDraggedAppointmentId && 
                 draggedEvent && 
                 draggedEvent.id === activeDraggedAppointmentId &&
                 dragPosition.dateIso === iso && 
                 dragPosition.time && (
                  <div
                    className="absolute pointer-events-none z-40"
                    style={{
                      right: "-60px",
                      top: dragPosition.y, // TOP-RIGHT alignment: snapped Y position aligns with appointment top
                    }}
                  >
                    <div
                      className="px-2.5 py-1 rounded-full text-[13px] font-bold text-white whitespace-nowrap shadow-lg"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      {dragPosition.time}
                    </div>
                  </div>
                )}

                {/* hover של 5 דקות */}
                {hoverPreview && hoverPreview.iso === iso && (
                  <>
                    {/* Preview block */}
                  <div
                    className="absolute left-0 right-0 pointer-events-none flex items-center rounded-lg"
                    style={{
                      top: hoverPreview.top,
                        height: slotHeight / 12,
                      backgroundColor: "rgba(255,37,124,0.09)",
                        border: `1px solid ${BRAND_COLOR}`,
                      }}
                    >
                      {/* Time label pill - positioned over gray time text */}
                      <div
                        className="absolute pointer-events-none z-30"
                        style={{
                          right: "-4px",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        <div
                          className="px-3 py-1.5 rounded-full text-[16px] font-bold text-white whitespace-nowrap"
                          style={{
                            backgroundColor: BRAND_COLOR,
                          }}
                        >
                          {hoverPreview.label}
                        </div>
                      </div>
                      {/* Gray time text - hidden behind pill */}
                      <span className="ml-2 text-[10px] font-medium text-gray-700 dark:text-gray-100 opacity-0">
                      {hoverPreview.label}
                    </span>
                  </div>
                  </>
                )}

                {/* אירועים */}
                {dayEvents.map((event) => {
                  // For week view, find which staff this event belongs to
                  const eventStaff = STAFF_DAY_CALENDARS.find(s => s.id === event.staff) || STAFF_DAY_CALENDARS[0];
                  return renderEvent(event, iso, eventStaff?.id || event.staff);
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* עמודת שעות – WEEK VIEW (moved to right side) */}
      <div className="w-[72px] sm:w-20 bg-white dark:bg-[#050505] text-[10px] sm:text-[13px] text-gray-500 dark:text-gray-400">
        {/* החלק העליון – שיהיה זהה לבר של הימים */}
        <div className="h-24 border-b border-gray-200/80 dark:border-commonBorder bg-white dark:bg-[#050505]" />

        {HOURS.map((h) => (
          <div
            key={h}
            className="flex items-start justify-center font-bold border-t border-l border-gray-200/80 dark:border-[#1c1c1c]"
            style={{ height: slotHeight }}
          >
            {formatHour(h)}
          </div>
        ))}
      </div>
    </div>
  );
}; // ← כאן נסגרת הפונקציה renderTimeGrid שלך


  /* ---------------------  MONTH GRID  --------------------- */

  const renderMonthGrid = () => {
  const locale = language === "he" ? "he-IL" : "en-US";
  const daysMatrix = getMonthMatrix(currentDate);
  const currentMonth = currentDate.getMonth();
  const events = filterEvents(demoEvents);

  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2025, 0, 5 + i);
    return d.toLocaleDateString(locale, { weekday: "short" });
  });

  // מחלקים את המטריצה לשבועות (שורות של 7 ימים)
  const weeks = [];
  for (let i = 0; i < daysMatrix.length; i += 7) {
    weeks.push(daysMatrix.slice(i, i + 7));
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#050505]">
      {/* כותרת ימים */}
      {/* כותרת ימים – להפוך את הסדר כדי שיום א׳ יהיה הכי ימינה ושבת הכי שמאלה */}
<div className="grid grid-cols-7 border-b border-gray-200 dark:border-commonBorder bg-gray-50/80 dark:bg-[#080808]">
  {dayNames
    .slice()     // עושה קופי שלא נהרוס את המערך המקורי
    .reverse()   // הופך את הסדר של הכותרות
    .map((name) => (
      <div
        key={name}
        className="h-10 flex items-center justify-center text-[15px] font-medium text-gray-500 dark:text-gray-300"
      >
        {name}
      </div>
    ))}
</div>


      {/* תיבות חודש – כל שבוע הפוך מימין לשמאל */}

      <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-[700px]">
        {weeks.map((week, rowIndex) =>
          week
            .slice()      // קופי, שלא נהרוס את המערך המקורי
            .reverse()    // פה הסיבוב של השורה ל־RTL
            .map((day) => {
              const isTodayFlag =
                day.toDateString() === new Date().toDateString();
              const isCurrentMonth = day.getMonth() === currentMonth;
              const iso = day.toISOString().slice(0, 10);
              const dayEvents = events.filter((e) => e.date === iso);

              const dayDate = new Date(day);
              dayDate.setHours(0, 0, 0, 0);
              const isPast = dayDate < today;

              return (
                <div
                  key={iso}
                  className={`relative overflow-hidden border border-gray-200/70 dark:border-[#191919] ${
                    isCurrentMonth
                      ? "bg-white dark:bg-[#050505]"
                      : "bg-gray-50/60 dark:bg-[#050505]"
                  }`}
                >
                  {isPast && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-70"
                      style={{
                        background:
                          "repeating-linear-gradient(135deg, rgba(0,0,0,0.025), rgba(0,0,0,0.025) 4px, transparent 4px, transparent 8px)",
                      }}
                    />
                  )}

                  <div className="relative flex items-center justify-between px-2 pt-1">
                    <span
                      className={`text-xs font-medium ${
                        isCurrentMonth
                          ? "text-gray-700 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {isTodayFlag && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        •
                      </span>
                    )}
                  </div>

                  <div className="relative px-2 pb-2 mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className="h-4 rounded-[6px] text-[9px] px-1 flex items-center text-gray-900 dark:text-white truncate"
                        style={{ backgroundColor: ev.color }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-gray-500 dark:text-gray-400">
                        +{dayEvents.length - 3} נוספים
                      </div>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};




  /* ---------------------  DATE PICKER  --------------------- */

  const handlePickerDayClick = (date) => {
    if (!rangeStartDate || (rangeStartDate && rangeEndDate)) {
      // התחלה חדשה של טווח
      setRangeStartDate(date);
      setRangeEndDate(null);
      setRangeHoverDate(null);
      setSelectedDate(date);
      return;
    }

    if (rangeStartDate && !rangeEndDate) {
      let start = rangeStartDate;
      let end = date;

      if (toDateOnly(end).getTime() < toDateOnly(start).getTime()) {
        [start, end] = [end, start];
      }

      setRangeStartDate(start);
      setRangeEndDate(end);
      setRangeHoverDate(null);
      setSelectedDate(start);
    }
  };

  const handlePickerDayHover = (date) => {
    if (rangeStartDate && !rangeEndDate) {
      setRangeHoverDate(date);
    }
  };

  const applyDateSelection = () => {
    const hasRealRange =
      rangeStartDate &&
      rangeEndDate &&
      toDateOnly(rangeStartDate).getTime() !==
        toDateOnly(rangeEndDate).getTime();

    if (hasRealRange && isFullMonthRange(rangeStartDate, rangeEndDate)) {
      // חודש מלא -> תצוגת חודש
      const monthDate = new Date(
        rangeStartDate.getFullYear(),
        rangeStartDate.getMonth(),
        1
      );
      setCurrentDate(monthDate);
      setView("month");
      setCustomWeekStart(null);
    } else if (hasRealRange) {
      // טווח חלקי -> תצוגת שבוע שמתחיל בדיוק מהיום הראשון בטווח
      const startOnly = toDateOnly(rangeStartDate);
      setCurrentDate(startOnly);
      setView("week");
      setCustomWeekStart(startOnly);
    } else if (rangeStartDate) {
      // תאריך בודד
      const startOnly = toDateOnly(rangeStartDate);
      setCurrentDate(startOnly);
      setView("day");
      setCustomWeekStart(null);
    } else if (selectedDate) {
      const d = toDateOnly(selectedDate);
      setCurrentDate(d);
      setView("day");
      setCustomWeekStart(null);
    }

    setIsDatePickerOpen(false);
  };

  const renderSingleMonth = (baseDate) => {
    const locale = language === "he" ? "he-IL" : "en-US";
    const days = getMonthMatrix(baseDate);
    const currentMonth = baseDate.getMonth();

    const monthLabel = baseDate.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });

    const dayNames = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2025, 0, 5 + i);
      return d.toLocaleDateString(locale, { weekday: "short" });
    });

    const activeEnd = rangeEndDate || rangeHoverDate;

    return (
  <div className="w-full">
    {/* כותרת חודש + חצים */}
    <div className="flex items-center justify-between mb-3">
      
      {/* חץ ימין – חוזר חודש אחורה */}
      <button
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-300"
        onClick={() => {
          const d = new Date(pickerMonth);
          d.setMonth(d.getMonth() - 1); // 👈 BACKWARD
          setPickerMonth(d);
        }}
      >
        <span dir="ltr">
          <FiChevronRight />   {/* 👈 ויזואלית מצביע ימינה (אחורה ב-RTL) */}
        </span>
      </button>
      
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {monthLabel}
      </span>
      
      {/* חץ שמאל – מתקדם קדימה */}
      <button
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-300"
        onClick={() => {
          const d = new Date(pickerMonth);
          d.setMonth(d.getMonth() + 1); // 👈 FORWARD
          setPickerMonth(d);
        }}
      >
        <span dir="ltr">
          <FiChevronLeft />   {/* 👈 ויזואלית מצביע שמאלה (קדימה ב-RTL) */}
        </span>
      </button>
    </div>


        {/* שמות ימים */}
        <div className="grid grid-cols-7 gap-[4px] text-[11px] text-gray-500 dark:text-gray-300 mb-1">
          {dayNames.map((name) => (
            <div
              key={name}
              className="h-7 flex items-center justify-center"
            >
              {name}
            </div>
          ))}
        </div>

        {/* ימים – עיגול זהה + טווח ורוד */}
        <div className="grid grid-cols-7 grid-rows-6 gap-[4px]">
          {days.map((day) => {
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isSelectedSingle = isSameCalendarDay(day, selectedDate);

            const isRangeStart =
              rangeStartDate && isSameCalendarDay(day, rangeStartDate);

            const isRangeEnd =
              activeEnd &&
              !isSameCalendarDay(rangeStartDate, activeEnd) &&
              isSameCalendarDay(day, activeEnd);

            const inBetweenRange =
              rangeStartDate && activeEnd
                ? isBetweenInclusive(day, rangeStartDate, activeEnd) &&
                  !isRangeStart &&
                  !isRangeEnd
                : false;

            let className =
              "relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs transition-colors";
            let style = {};

            if (isRangeStart || isRangeEnd) {
              // התחלה/סיום טווח – עיגול מלא ורוד
              className += " font-semibold text-white";
              style = {
                backgroundColor: BRAND_COLOR,
                color: "#FFFFFF",
              };
            } else if (isSelectedSingle) {
              // יום בודד – outline ורוד
              className +=
                " font-semibold bg-[rgba(255,37,124,0.08)] text-gray-900 dark:text:white";
              style = {
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: BRAND_COLOR,
                color: BRAND_COLOR,
              };
            } else if (!isCurrentMonth) {
              className += " text-gray-400 dark:text-gray-600";
            } else {
              className +=
                " text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#222]";
            }

            return (
              <div
                key={day.toISOString()}
                className="flex items-center justify-center"
              >
                <div className="relative">
                  {/* רקע ורוד לטווח */}
                  {inBetweenRange && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
                        style={{
                          backgroundColor: "rgba(255,37,124,0.12)",
                          boxShadow:
                            "0 0 0 1px rgba(255,37,124,0.28)",
                        }}
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    className={className}
                    style={style}
                    onClick={() => handlePickerDayClick(day)}
                    onMouseEnter={() => handlePickerDayHover(day)}
                  >
                    {day.getDate()}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ---------------------  WAITLIST PANEL  --------------------- */

  // Automatic expiration logic: check if item date + time has passed
  useEffect(() => {
    const checkExpiredItems = () => {
      const now = new Date();
      
      setWaitlistItems((prev) =>
        prev.map((item) => {
          // Skip if already expired or booked
          if (item.status === "expired" || item.status === "booked") {
            return item;
          }

          // Get date from item (support both old 'requestedDate' and new 'date' format)
          const itemDate = item.date 
            ? (item.date instanceof Date ? new Date(item.date) : new Date(item.date))
            : item.requestedDate 
            ? new Date(item.requestedDate)
            : null;

          if (!itemDate) return item;

          // Parse time if available
          let itemDateTime = new Date(itemDate);
          if (item.time && item.time !== "any") {
            // Handle time format like "10:00-11:00" or "10:00"
            const timeStr = item.time.includes("-") 
              ? item.time.split("-")[0].trim() 
              : item.time;
            const [hours, minutes] = timeStr.split(":").map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
              itemDateTime.setHours(hours, minutes || 0, 0, 0);
            }
          } else {
            // If no time specified, use end of day
            itemDateTime.setHours(23, 59, 59, 999);
          }

          // If item date + time has passed, mark as expired
          if (itemDateTime < now) {
            return { ...item, status: "expired" };
          }

          return item;
        })
      );
    };

    // Check immediately
    checkExpiredItems();

    // Check every minute
    const interval = setInterval(checkExpiredItems, 60000);

    return () => clearInterval(interval);
  }, []);

  const filteredWaitlist = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const inRange = (item) => {
      if (waitlistRange === "all" || waitlistRange === "calendar") {
        return true;
      }

      // Support both old 'requestedDate' and new 'date' format
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

  const renderWaitlistPanel = () => {
    const rangeLabel = (() => {
      switch (waitlistRange) {
        case "all":
          return "כל הקרובים";
        case "today":
          return "היום";
        case "3days":
          return "3 ימים הקרובים";
        case "7days":
          return "7 ימים הקרובים";
        case "30days":
        default:
          return "30 ימים הקרובים";
      }
    })();

    const rangeOptions = [
      { key: "all", label: "כל הקרובים" },
      { key: "today", label: "היום" },
      { key: "3days", label: "3 ימים הקרובים" },
      { key: "7days", label: "7 ימים הקרובים" },
      { key: "30days", label: "30 ימים הקרובים" },
    ];

    const sortOptions = [
      { key: "created-oldest", label: "תאריך יצירה (הישן ביותר)" },
      { key: "created-newest", label: "תאריך יצירה (החדש ביותר)" },
      { key: "price-highest", label: "מחיר (הגבוה ביותר)" },
      { key: "price-lowest", label: "מחיר (הנמוך ביותר)" },
      {
        key: "requested-nearest",
        label: "תאריך מבוקש (הקרוב ביותר)",
      },
      {
        key: "requested-furthest",
        label: "תאריך מבוקש (הרחוק ביותר)",
      },
    ];

    const sortLabel =
      sortOptions.find((opt) => opt.key === waitlistSort)?.label ||
      "תאריך יצירה (הישן ביותר)";

    return (
      <div className="fixed inset-0 z-40 flex justify-end">
        {/* קליק ברקע – סוגר את כל הפאנל */}
        <div
          className="flex-1 bg-black/0"
          onClick={() => {
            setIsWaitlistOpen(false);
            setIsWaitlistRangeOpen(false);
            setIsSortDropdownOpen(false);
            setOpenWaitlistActionId(null);
          }}
        />

        {/* הפאנל עצמו */}
        <div
          className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111] border-l border-gray-200 dark:border-commonBorder shadow-2xl flex flex-col calendar-slide-in"
          onClick={() => {
            setIsWaitlistRangeOpen(false);
            setIsSortDropdownOpen(false);
            setOpenWaitlistActionId(null);
          }}
        >
          {/* X מחוץ לפאנל בקצה השמאלי */}
          <button
            className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222]"
            onClick={(e) => {
              e.stopPropagation();
              setIsWaitlistOpen(false);
              setIsWaitlistRangeOpen(false);
              setIsSortDropdownOpen(false);
              setOpenWaitlistActionId(null);
            }}
          >
            <FiX className="text-[20px]" />
          </button>

          {/* Header */}
          <div className="relative z-20 flex items-center justify-between px-8 py-7" dir="rtl">
            <span className="text-[26px] font-semibold text-gray-900 dark:text-gray-100">
              רשימת המתנה
            </span>
            <button
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition"
              onClick={(e) => {
                e.stopPropagation();
                // Start waitlist flow (NOT regular appointment booking)
                    setWaitlistClientSearch("");
                setWaitlistAddStep("date");
    setBookingSelectedTime("any");
    setBookingSelectedService(null);
    setServiceSearch("");
    setIsTimeDropdownOpen(false);
    setSelectedWaitlistClient(null);
                setAddFlowMode("waitlist"); // Waitlist flow mode
    setIsWaitlistAddOpen(true);
              }}
            >
              <span>חדש</span>
              <FiPlus className="text-[16px]" />
            </button>
          </div>

          {/* תוכן */}
          <div className="relative z-20 flex-1 overflow-y-auto px-6 pt-2 pb-5 text-sm text-gray-800 dark:text-gray-100" dir="rtl">
            {/* שורת פילטרים */}
            <div className="flex flex-wrap items-center gap-2 mb-4" dir="rtl">
              {/* All upcoming dropdown */}
              <div className="relative">
                <button
                  className="inline-flex items-center justify-between px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] text-xs sm:text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#222]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWaitlistRangeOpen((prev) => !prev);
                    setIsSortDropdownOpen(false);
                    setOpenWaitlistActionId(null);
                  }}
                >
                  <span>{rangeLabel}</span>
                  <FiChevronDown className="ml-1 text-[13px] text-gray-400" />
                </button>

                {isWaitlistRangeOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] z-30 py-1 text-xs sm:text-sm px-2"
                    style={{
                      boxShadow:
                        "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {rangeOptions.map((opt) => {
                      const isActive = waitlistRange === opt.key;

                      return (
                        <button
                          key={opt.key}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] transition"
                          onClick={() => {
                            setWaitlistRange(opt.key);
                            setIsWaitlistRangeOpen(false);
                          }}
                        >
                          <div className="flex flex-col items-start">
                            <span
                              className={`font-normal ${
                                isActive
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-600 dark:text-gray-200"
                              }`}
                            >
                              {opt.label}
                            </span>
                          </div>

                          {isActive && (
                            <span className="ml-2 text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Created / sort dropdown */}
              <div className="relative">
                <button
                  className="inline-flex items-center justify-between px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] text-xs sm:text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#222]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSortDropdownOpen((prev) => !prev);
                    setIsWaitlistRangeOpen(false);
                    setOpenWaitlistActionId(null);
                  }}
                >
                  <span>{sortLabel}</span>
                  <FiChevronDown className="ml-1 text-[13px] text-gray-400" />
                </button>

                {isSortDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] z-30 py-1 text-xs sm:text-sm px-2"
                    style={{
                      boxShadow:
                        "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {sortOptions.map((opt) => {
                      const isActive = waitlistSort === opt.key;

                      return (
                        <button
                          key={opt.key}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] transition"
                          onClick={() => {
                            setWaitlistSort(opt.key);
                            setIsSortDropdownOpen(false);
                          }}
                        >
                          <span
                            className={
                              isActive
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-600 dark:text-gray-200"
                            }
                          >
                            {opt.label}
                          </span>

                          {isActive && (
                            <span className="ml-2 text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* טאבים – Waiting / Expired / Booked */}
            <div className="border-b border-gray-200 dark:border-[#262626] mb-4">
              <div className="flex items-center gap-6 text-xs sm:text-sm px-2">
                {[
                  { key: "waiting", label: "ממתינים" },
                  { key: "expired", label: "פג תוקף" },
                  { key: "booked", label: "נקבע תור" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setWaitlistFilter(key);
                      setOpenWaitlistActionId(null);
                    }}
                    className={`relative pb-3 pt-1 font-medium transition-colors ${
                      waitlistFilter === key
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {label}
                    {waitlistFilter === key && (
                      <span
                        className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* רשימת וייטליסט */}
            <div className="space-y-3">
              {filteredWaitlist.map((item) => {
                // Support both old format (client as string) and new format (client as object)
                const clientName = typeof item.client === "string" 
                  ? item.client 
                  : item.client?.name || "Unknown Client";
                
                // Support both old format (requestedDate) and new format (date)
                const itemDate = item.date || item.requestedDate;
                const dateDisplay = itemDate instanceof Date
                  ? itemDate.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : itemDate
                  ? new Date(itemDate).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : "No date";
                
                // Get service name (support both old format with note and new format with service object)
                const serviceName = item.service?.name || item.note || "No service";

                return (
                <div
                  key={item.id}
                  className="relative rounded-xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] p-3 text-[14px] text-gray-800 dark:text-gray-100 text-right "
                >
                  <div className="flex justify-between mb-1 flex-row-reverse">
                    <span className="font-semibold text-right">{clientName}</span>
                    <span className="text-[12px] text-gray-500">
                      {dateDisplay}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] flex-row-reverse">
                    {item.time && item.time !== "any" && (
                    <span className="capitalize text-gray-500">
                        {item.time}
                    </span>
                    )}
                    <span className="text-gray-600 dark:text-gray-300">
                      {serviceName}
                    </span>
                  </div>

                  {/* Actions button + dropdown */}
                  <div className="mt-3 flex justify-start">
                    <div className="relative">
                      <button
                        className="inline-flex items-center gap-1 px-5 py-2 rounded-full border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] text-[11px] font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#222222]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenWaitlistActionId((prev) =>
                            prev === item.id ? null : item.id
                          );
                        }}
                      >
                        <span>פעולות</span>
                        <FiChevronDown className="text-[12px] text-gray-400" />
                      </button>

                      {openWaitlistActionId === item.id && (
                        <div
                          className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] z-30 py-1 text-[11px]"
                          style={{
                            boxShadow:
                              "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Book appointment (Calendar icon) */}
                          <button
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition"
                            onClick={() => {
                              setWaitlistItems((prev) =>
                                prev.map((w) =>
                                  w.id === item.id
                                    ? { ...w, status: "booked" }
                                    : w
                                )
                              );
                              setWaitlistFilter("booked");
                              setOpenWaitlistActionId(null);
                            }}
                          >
                            <span className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-[13px]">
                              <FiCalendar className="text-[15px] text-gray-700 dark:text-gray-200" />
                              קבע תור
                            </span>
                          </button>

                          <div className="my-1 border-t border-gray-200 dark:border-gray-700 mx-3" />

                          {/* Remove (Red X icon) */}
                          <button
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition text-red-500 text-[13px]"
                            onClick={() => {
                              setWaitlistItems((prev) =>
                                prev.filter((w) => w.id !== item.id)
                              );
                              setOpenWaitlistActionId(null);
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <FiXCircle className="text-[16px] text-red-500" />
                              הסר מרשימת המתנה
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}

              {filteredWaitlist.length === 0 && (
                <div className="flex flex-col items-center justify-center text-xs text-gray-500 dark:text-gray-400 py-10">
                  <div className="mb-3 w-10 h-10 rounded-2xl bg-gradient-to-b from-purple-300 to-purple-500/80 opacity-80" />
                  <div className="text-sm font-semibold mb-1">
                    אין רשומות ברשימת המתנה
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    אין לך לקוחות ברשימת המתנה
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ----------- ADD CLIENT PANEL (מתוך Waitlist > Add וגם מה-Add למעלה) ----------- */

  const renderWaitlistAddClientPanel = () => {
    const filteredClients = clients.filter((c) => {
      if (!waitlistClientSearch.trim()) return true;
      const term = waitlistClientSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        (c.email || "").toLowerCase().includes(term)
      );
    });
    

    // Generate time slots: 5-minute intervals for booking flow, 30-minute for waitlist flow
    const timeSlots = addFlowMode === "booking" 
      ? generateTimeSlots(10, 20, 5) 
      : generateTimeSlots(10, 20, 30);

    const closePanel = () => {
  setIsWaitlistAddOpen(false);
  setWaitlistAddStep("date");
      setIsTimeDropdownOpen(false);
      setBookingSelectedTime("any");
      setBookingSelectedService(null);
      setServiceSearch("");
      setSelectedWaitlistClient(null);
      setSelectedStaffForBooking(null); // Reset staff selection
      setAddFlowMode("waitlist");
    };

    const isStaffStep = waitlistAddStep === "staff";
    const isDateStep = waitlistAddStep === "date";
    const isTimeStep = waitlistAddStep === "time";
    const isServiceStep = waitlistAddStep === "service";
    const isClientStep = waitlistAddStep === "client";

    const titleText = isClientStep
      ? "בחר לקוח"
      : isStaffStep
      ? "בחר עובד"
      : isDateStep
      ? "בחר תאריך"
      : isTimeStep
      ? "בחר שעה"
      : "בחר שירות";

    const bookingDateLabel = formatBookingDateLabel(
      bookingSelectedDate,
      language
    );

    // יומן בתוך הפופ אפ – UI מותאם לפאנל, RTL אמיתי (א' מימין, ש' משמאל)
const renderBookingMonthForPanel = () => {
  // Copy exact implementation from renderSingleMonth (the working top-bar calendar)
  const locale = language === "he" ? "he-IL" : "en-US";
  const days = getMonthMatrix(bookingMonth);
  const currentMonth = bookingMonth.getMonth();

  const monthLabel = bookingMonth.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2025, 0, 5 + i);
    return d.toLocaleDateString(locale, { weekday: "short" });
  });

  return (
    <div className="w-full">
      {/* כותרת חודש + חצים */}
<div className="flex items-center justify-between mb-3">
  
        {/* חץ ימין – חוזר חודש אחורה */}
  <button
    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-300"
    onClick={() => {
      const d = new Date(bookingMonth);
            d.setMonth(d.getMonth() - 1); // 👈 BACKWARD
      setBookingMonth(d);
    }}
  >
          <span dir="ltr">
            <FiChevronRight />   {/* 👈 ויזואלית מצביע ימינה (אחורה ב-RTL) */}
          </span>
  </button>

  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
    {monthLabel}
  </span>

        {/* חץ שמאל – מתקדם קדימה */}
  <button
    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-300"
    onClick={() => {
      const d = new Date(bookingMonth);
            d.setMonth(d.getMonth() + 1); // 👈 FORWARD
      setBookingMonth(d);
    }}
  >
          <span dir="ltr">
            <FiChevronLeft />   {/* 👈 ויזואלית מצביע שמאלה (קדימה ב-RTL) */}
          </span>
  </button>
</div>


      {/* שמות ימים */}
      <div className="grid grid-cols-7 gap-[4px] text-[11px] text-gray-500 dark:text-gray-300 mb-1">
        {dayNames.map((name) => (
          <div
            key={name}
            className="h-7 flex items-center justify-center"
          >
            {name}
          </div>
        ))}
      </div>

      {/* ימים – עיגול זהה */}
      <div className="grid grid-cols-7 grid-rows-6 gap-[4px]">
        {days.map((day) => {
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isSelectedSingle = isSameCalendarDay(day, bookingSelectedDate);
          const isTodayFlag = isSameCalendarDay(day, today);

          let className =
            "relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs transition-colors";
          let style = {};

          if (isSelectedSingle) {
            // יום נבחר – outline ורוד (רק תאריך אחד נבחר)
            className +=
              " font-semibold bg-[rgba(255,37,124,0.08)] text-gray-900 dark:text:white";
            style = {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: BRAND_COLOR,
              color: BRAND_COLOR,
            };
          } else if (isTodayFlag && isCurrentMonth && !bookingSelectedDate) {
            // היום – highlight רק אם אין תאריך נבחר
            className +=
              " font-semibold bg-[rgba(255,37,124,0.08)] text-gray-900 dark:text:white";
            style = {
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: BRAND_COLOR,
              color: BRAND_COLOR,
            };
          } else if (!isCurrentMonth) {
            className += " text-gray-400 dark:text-gray-600";
          } else {
            className +=
              " text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#222]";
          }

          return (
            <div
              key={day.toISOString()}
              className="flex items-center justify-center"
            >
              <button
                type="button"
                className={className}
                style={style}
                onClick={() => setBookingSelectedDate(day)}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* קליק על הרקע – סוגר את הפאנל הזה בלבד */}
        <div className="flex-1 bg-black/0" onClick={closePanel} />

       <div
  dir="rtl"
  className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
             border-l border-gray-200 dark:border-commonBorder shadow-2xl
             flex flex-col calendar-slide-in text-right"
  onClick={(e) => e.stopPropagation()}
>

          {/* X מחוץ לפופ בצד שמאל למעלה */}
          <button
            className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222]"
            onClick={closePanel}
          >
            <FiX className="text-[20px]" />
          </button>

         {/* Header + breadcrumb עם ניווט לחיץ */}
<div className="px-8 pt-7 pb-3">
            {/* 🔥 שלבי הפלואו – בסדר חדש: עובד → תאריך → שעה → שירות → לקוח (בוקינג) או תאריך → שעה → שירות → לקוח (ווייטליסט) */}
  <div className="text-[11px] mb-2 flex items-center gap-1">
            {/* Show staff step ONLY for booking flow */}
            {addFlowMode === "booking" && !(bookingSelectedDate && bookingSelectedTime && bookingSelectedStaff) && (
              <>
                {/* עובד */}
                <button
                  className={`transition ${
                    isStaffStep
                      ? "text-gray-900 dark:text-gray-100 font-medium"
                      : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setWaitlistAddStep("staff")}
                >
                  עובד
                </button>

                <span className="text-gray-300">›</span>
              </>
            )}

            {/* Show date/time steps only if not pre-filled from calendar click */}
            {!(bookingSelectedDate && bookingSelectedTime && bookingSelectedStaff) && (
              <>
    {/* תאריך */}
    <button
      className={`transition ${
        isDateStep
          ? "text-gray-900 dark:text-gray-100 font-medium"
          : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
      onClick={() => setWaitlistAddStep("date")}
    >
      תאריך
    </button>

    <span className="text-gray-300">›</span>

    {/* שעה */}
    <button
      className={`transition ${
        isTimeStep
          ? "text-gray-900 dark:text-gray-100 font-medium"
          : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
      onClick={() => setWaitlistAddStep("time")}
    >
      שעה
    </button>

    <span className="text-gray-300">›</span>
              </>
            )}

    {/* שירות */}
    <button
      className={`transition ${
        isServiceStep
          ? "text-gray-900 dark:text-gray-100 font-medium"
          : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
      onClick={() => setWaitlistAddStep("service")}
    >
      שירות
    </button>

    <span className="text-gray-300">›</span>

    {/* לקוח — אחרון ושמאלי ביותר */}
    <button
      className={`transition ${
        isClientStep
          ? "text-gray-900 dark:text-gray-100 font-medium"
          : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
      onClick={() => setWaitlistAddStep("client")}
    >
      לקוח
    </button>
</div>

            {/* כותרת המסך */}
            <h2 className="text-[24px] sm:text-[26px] font-semibold text-gray-900 dark:text-gray-100">
              {titleText}
            </h2>
          </div>

                    {/* BODY – שלב 1: Select staff (BOOKING FLOW ONLY) */}
{isStaffStep && addFlowMode === "booking" && (
  <>
    <div className="flex-1 overflow-y-auto px-8 pb-6 pt-3 text-m text-gray-800 dark:text-gray-100">
      <div className="space-y-5">
        {/* search bar */}
        <div className="mt-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="text-[16px]" />
            </span>
            <input
              type="text"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder="חפש לפי שם עובד"
              className="w-full h-10 rounded-[12px] bg-white dark:bg-[#181818] border border-[rgba(148,163,184,0.35)] dark:border-[#333] pl-9 pr-3 text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent"
            />
          </div>
        </div>

        <div className="pt-3" />

        {/* רשימת עובדים */}
        <div className="space-y-3">
          {STAFF_DAY_CALENDARS.filter((staff) =>
            staff.name.toLowerCase().includes(serviceSearch.toLowerCase())
          ).map((staff) => {
            const isActive = selectedStaffForBooking === staff.id;

            return (
              <button
                key={staff.id}
                type="button"
                className={`relative w-full flex items-center justify-between px-3 py-3 text-left text-xs sm:text-sm transition
                  ${
                    isActive
                      ? "bg-gray-100 dark:bg-[#1f1f1f] border-transparent"
                      : "bg-white dark:bg-[#181818] border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#222]"
                  }
                `}
                onClick={() => setSelectedStaffForBooking(staff.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-[4px] h-10 rounded-full"
                    style={{ backgroundColor: BRAND_COLOR }}
                  />

                  <div className="flex items-center gap-3">
                    {staff.imageUrl ? (
                      <img
                        src={staff.imageUrl}
                        alt={staff.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#222] flex items-center justify-center">
                        <span className="text-sm font-semibold" style={{ color: BRAND_COLOR }}>
                          {staff.initials}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col items-start">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {staff.name}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {staff.status === "offline" || staff.status === "not-working"
                          ? "לא עובד היום"
                          : "זמין"}
                      </span>
                    </div>
                  </div>
                </div>

                {isActive && (
                  <span className="ml-4 text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>

    <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
      <button
        type="button"
        className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!selectedStaffForBooking}
        onClick={() => {
          if (selectedStaffForBooking) {
            setWaitlistAddStep("date");
          }
        }}
      >
        המשך
      </button>
    </div>
  </>
)}

                    {/* BODY – שלב 2: Select date */}
{isDateStep && (
  <>
    <div className="flex-1 overflow-y-auto px-8 pb-6 pt-3 text-sm text-gray-800 dark:text-gray-100">
      {renderBookingMonthForPanel()}
    </div>

    <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
      <button
        type="button"
        className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!bookingSelectedDate}
        onClick={() => {
          if (bookingSelectedDate) {
          setWaitlistAddStep("time");
          setBookingSelectedTime("any");
          setBookingSelectedService(null);
          setServiceSearch("");
          setIsTimeDropdownOpen(false);
          }
        }}
      >
        המשך
      </button>
    </div>
  </>
)}

{/* BODY – שלב 3: Select time */}
{isTimeStep && (
  <>
    <div className="flex-1 overflow-y-auto px-8 pb-6 pt-3 text-sm text-gray-800 dark:text-gray-100">
      <div className="space-y-6">
        {/* Date summary */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            תאריך
          </div>
          <div className="w-full h-11 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] px-4 flex items-center text-xs sm:text-sm text-gray-900 dark:text-gray-100">
            <span>{bookingDateLabel || ""}</span>
          </div>
        </div>

        {/* Start time */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            שעת התחלה
          </div>
          <div className="relative">
            <button
              type="button"
              className="w-full h-11 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] px-4 flex items-center justify-between text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#222]"
              onClick={() => setIsTimeDropdownOpen((prev) => !prev)}
            >
              <span>
                {!bookingSelectedTime || bookingSelectedTime === "any"
                  ? "כל שעה"
                  : bookingSelectedTime}
              </span>
              <FiChevronDown className="text-[16px] text-gray-400" />
            </button>

            {isTimeDropdownOpen && (
              <div
                className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] z-30 py-1 text-xs sm:text-sm"
                style={{
                  boxShadow:
                    "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                }}
              >
                {/* Any time */}
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition"
                  onClick={() => {
                    setBookingSelectedTime("any");
                    setIsTimeDropdownOpen(false);
                  }}
                >
                  <span className="text-gray-800 dark:text-gray-100">
                    כל שעה
                  </span>
                  {(!bookingSelectedTime || bookingSelectedTime === "any") && (
                    <span className="text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                      ✓
                    </span>
                  )}
                </button>

                <div className="my-1 border-t border-gray-200 dark:border-[#262626]" />

                {/* רשימת סלוטים */}
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition"
                    onClick={() => {
                      setBookingSelectedTime(slot);
                      setIsTimeDropdownOpen(false);
                    }}
                  >
                    <span className="text-gray-800 dark:text-gray-100">
                      {slot}
                    </span>
                    {bookingSelectedTime === slot && (
                      <span className="text-[11px] font-semibold text-[rgba(148,163,184,1)]">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
      <button
        type="button"
        className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition"
        onClick={() => {
          setIsTimeDropdownOpen(false);
          setWaitlistAddStep("service");
        }}
      >
        המשך
      </button>
    </div>
  </>
)}

{/* BODY – שלב 3: Select service */}
{isServiceStep && (
  <>
    <div className="flex-1 overflow-y-auto px-8 pb-6 pt-3 text-m text-gray-800 dark:text-gray-100">
      <div className="space-y-5">
        {/* סיכום איש צוות (אם קיים) */}
        {(bookingSelectedStaff || selectedStaffForBooking) && (
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              איש צוות
            </div>
            <div className="text-base text-gray-500 dark:text-gray-400">
              {bookingSelectedStaff?.name || 
               STAFF_DAY_CALENDARS.find((s) => s.id === selectedStaffForBooking)?.name || 
               ""}
            </div>
          </div>
        )}

        {/* סיכום תאריך ושעה */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            תאריך ושעה
          </div>
          <div className="text-base text-gray-500 dark:text-gray-400">
            {bookingDateLabel} ·{" "}
            {!bookingSelectedTime || bookingSelectedTime === "any" ? "כל שעה" : bookingSelectedTime}
          </div>
        </div>

        {/* Recurring Appointment Dropdowns - Side by Side */}
        <div className="flex gap-3">
          {/* Service Type Dropdown */}
          <div className="flex-1 space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              סוג שירות
            </div>
            <div className="relative">
              <button
                type="button"
                className="w-full h-11 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] px-4 flex items-center justify-between text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#222]"
                onClick={() => setIsServiceTypeDropdownOpen((prev) => !prev)}
              >
                <span>
                  {recurringServiceType === "Regular Appointment" ? "תור רגיל" :
                   recurringServiceType === "Every Day" ? "כל יום" :
                   recurringServiceType === "Every 2 Days" ? "כל יומיים" :
                   recurringServiceType === "Every 3 Days" ? "כל 3 ימים" :
                   recurringServiceType === "Every 4 Days" ? "כל 4 ימים" :
                   recurringServiceType === "Every 5 Days" ? "כל 5 ימים" :
                   recurringServiceType === "Every 6 Days" ? "כל 6 ימים" :
                   recurringServiceType === "Every Week" ? "כל שבוע" :
                   recurringServiceType === "Every 2 Weeks" ? "כל שבועיים" :
                   recurringServiceType === "Every 3 Weeks" ? "כל 3 שבועות" :
                   recurringServiceType === "Every 4 Weeks" ? "כל 4 שבועות" :
                   recurringServiceType === "Every 5 Weeks" ? "כל 5 שבועות" :
                   recurringServiceType === "Every 6 Weeks" ? "כל 6 שבועות" :
                   recurringServiceType === "Every 7 Weeks" ? "כל 7 שבועות" :
                   recurringServiceType === "Every 8 Weeks" ? "כל 8 שבועות" :
                   recurringServiceType === "Every 9 Weeks" ? "כל 9 שבועות" :
                   recurringServiceType === "Every 10 Weeks" ? "כל 10 שבועות" :
                   recurringServiceType === "Every Month" ? "כל חודש" :
                   recurringServiceType === "Every 2 Months" ? "כל חודשיים" :
                   recurringServiceType === "Every 3 Months" ? "כל 3 חודשים" :
                   recurringServiceType === "Every 4 Months" ? "כל 4 חודשים" :
                   recurringServiceType === "Every 5 Months" ? "כל 5 חודשים" :
                   recurringServiceType === "Every 6 Months" ? "כל 6 חודשים" :
                   recurringServiceType}
                </span>
                <FiChevronDown className="text-[16px] text-gray-400" />
              </button>

              {isServiceTypeDropdownOpen && (
                <div
                  className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] z-30 py-1 text-xs sm:text-sm"
                  style={{
                    boxShadow:
                      "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                  }}
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition"
                    onClick={() => {
                      setRecurringServiceType("Regular Appointment");
                      setIsServiceTypeDropdownOpen(false);
                    }}
                  >
                    <span className="text-gray-800 dark:text-gray-100">תור רגיל</span>
                    {recurringServiceType === "Regular Appointment" && (
                      <span className="text-[11px] font-semibold text-[rgba(148,163,184,1)]">✓</span>
                    )}
                  </button>
                  <div className="my-1 border-t border-gray-200 dark:border-[#262626]" />
                  {[
                    { value: "Every Day", label: "כל יום" },
                    { value: "Every 2 Days", label: "כל יומיים" },
                    { value: "Every 3 Days", label: "כל 3 ימים" },
                    { value: "Every 4 Days", label: "כל 4 ימים" },
                    { value: "Every 5 Days", label: "כל 5 ימים" },
                    { value: "Every 6 Days", label: "כל 6 ימים" },
                    { value: "Every Week", label: "כל שבוע" },
                    { value: "Every 2 Weeks", label: "כל שבועיים" },
                    { value: "Every 3 Weeks", label: "כל 3 שבועות" },
                    { value: "Every 4 Weeks", label: "כל 4 שבועות" },
                    { value: "Every 5 Weeks", label: "כל 5 שבועות" },
                    { value: "Every 6 Weeks", label: "כל 6 שבועות" },
                    { value: "Every 7 Weeks", label: "כל 7 שבועות" },
                    { value: "Every 8 Weeks", label: "כל 8 שבועות" },
                    { value: "Every 9 Weeks", label: "כל 9 שבועות" },
                    { value: "Every 10 Weeks", label: "כל 10 שבועות" },
                    { value: "Every Month", label: "כל חודש" },
                    { value: "Every 2 Months", label: "כל חודשיים" },
                    { value: "Every 3 Months", label: "כל 3 חודשים" },
                    { value: "Every 4 Months", label: "כל 4 חודשים" },
                    { value: "Every 5 Months", label: "כל 5 חודשים" },
                    { value: "Every 6 Months", label: "כל 6 חודשים" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition"
                      onClick={() => {
                        setRecurringServiceType(option.value);
                        setIsServiceTypeDropdownOpen(false);
                      }}
                    >
                      <span className="text-gray-800 dark:text-gray-100">{option.label}</span>
                      {recurringServiceType === option.value && (
                        <span className="text-[11px] font-semibold text-[rgba(148,163,184,1)]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Repeat Duration Dropdown */}
          {recurringServiceType !== "Regular Appointment" && (
            <div className="flex-1 space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                חזור למשך
              </div>
              <div className="relative">
                <button
                  type="button"
                  className="w-full h-11 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] px-4 flex items-center justify-between text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#222]"
                  onClick={() => setIsRepeatDurationDropdownOpen((prev) => !prev)}
                >
                  <span>
                    {recurringDuration === "1 Week" ? "שבוע" :
                     recurringDuration === "2 Weeks" ? "שבועיים" :
                     recurringDuration === "3 Weeks" ? "3 שבועות" :
                     recurringDuration === "1 Month" ? "חודש" :
                     recurringDuration === "1.5 Months" ? "חודש וחצי" :
                     recurringDuration === "2 Months" ? "חודשיים" :
                     recurringDuration === "3 Months" ? "3 חודשים" :
                     recurringDuration === "6 Months" ? "6 חודשים" :
                     recurringDuration === "12 Months" ? "12 חודשים" :
                     recurringDuration}
                  </span>
                  <FiChevronDown className="text-[16px] text-gray-400" />
                </button>

                {isRepeatDurationDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] z-30 py-1 text-xs sm:text-sm"
                    style={{
                      boxShadow:
                        "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                    }}
                  >
                    {[
                      { value: "1 Week", label: "שבוע" },
                      { value: "2 Weeks", label: "שבועיים" },
                      { value: "3 Weeks", label: "3 שבועות" },
                      { value: "1 Month", label: "חודש" },
                      { value: "1.5 Months", label: "חודש וחצי" },
                      { value: "2 Months", label: "חודשיים" },
                      { value: "3 Months", label: "3 חודשים" },
                      { value: "6 Months", label: "6 חודשים" },
                      { value: "12 Months", label: "12 חודשים" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition"
                        onClick={() => {
                          setRecurringDuration(option.value);
                          setIsRepeatDurationDropdownOpen(false);
                        }}
                      >
                        <span className="text-gray-800 dark:text-gray-100">{option.label}</span>
                        {recurringDuration === option.value && (
                          <span className="text-[11px] font-semibold text-[rgba(148,163,184,1)]">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* search bar */}
        <div className="mt-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="text-[16px]" />
            </span>
            <input
              type="text"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder="חפש לפי שם שירות"
              className="w-full h-10 rounded-[12px] bg-white dark:bg-[#181818] border border-[rgba(148,163,184,0.35)] dark:border-[#333] pl-9 pr-3 text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent"
            />
          </div>
        </div>

        <div className="pt-3" />

        {/* רשימת שירותים */}
        <div className="space-y-3">
          {DEMO_SERVICES.filter((service) =>
            service.name.toLowerCase().includes(serviceSearch.toLowerCase())
          ).map((service) => {
            const isActive = bookingSelectedService === service.id;

            return (
              <button
                key={service.id}
                type="button"
                className={`relative w-full flex items-center justify-between px-3 py-3 text-left text-xs sm:text-sm transition
                  ${
                    isActive
                      ? "bg-gray-100 dark:bg-[#1f1f1f] border-transparent"
                      : "bg-white dark:bg-[#181818] border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#222]"
                  }
                `}
                onClick={() => setBookingSelectedService(service.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-[4px] h-10 rounded-full"
                    style={{ backgroundColor: BRAND_COLOR }}
                  />

                  <div className="flex flex-col items-start">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {service.name}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {service.duration}
                    </span>
                  </div>
                </div>

                <span className="ml-4 text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                  {service.price}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>

    <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
      <button
        type="button"
        className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!bookingSelectedService}
        onClick={() => {
          // בוחרים שירות → עוברים לשלב לקוח (לא חוזרים לתאריך)
          setWaitlistAddStep("client");
        }}
      >
        המשך
      </button>
    </div>
  </>
)}

{/* BODY – שלב 4: Client (אחרון + Apply) */}
{isClientStep && (
  <>
    <div className="flex-1 overflow-y-auto px-8 pb-6 pt-1 text-sm text-gray-800 dark:text-gray-100">
      {/* חיפוש */}
      <div className="mb-5">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch className="text-[16px]" />
          </span>
          <input
            type="text"
            value={waitlistClientSearch}
            onChange={(e) => setWaitlistClientSearch(e.target.value)}
            placeholder="חפש לקוח או השאר ריק ללקוח מזדמן"
            className="w-full h-10 rounded-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] pl-9 pr-3 text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.35)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Add new client */}
      <button
        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl border border-dashed border-gray-300 dark:border-[#333] bg-gray-50/70 dark:bg-[#181818] hover:bg-gray-100 dark:hover:bg-[#222] text-xs sm:text-sm mb-4"
        onClick={() => {
          setSelectedWaitlistClient(null);
          setNewClientName("");
          setNewClientPhone("");
          setNewClientEmail("");
          setNewClientCity("");
          setNewClientAddress("");
          setNewClientErrors({});
          setIsNewClientModalOpen(true);
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[18px] font-semibold shadow-sm"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <FiPlus />
        </div>
        <div className="flex flex-col items-start">
          <span className="font-semibold text-gray-900 dark:text-gray-50">
            הוסף לקוח חדש
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            צור פרופיל לקוח חדש לתור זה
          </span>
        </div>
      </button>

      {/* רשימת קליינטים */}
      <div className="space-y-2">
        {filteredClients.map((client) => (
          <button
            key={client.id}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#181818] text-left text-xs sm:text-sm ${
              selectedWaitlistClient?.id === client.id
                ? "bg-gray-50 dark:bg-[#181818]"
                : ""
            }`}
            onClick={() => {
              setSelectedWaitlistClient(client);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-50 dark:bg-[#262626] flex items-center justify-center text-[13px] font-semibold text-purple-500 dark:text-purple-200">
                {client.initials}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {client.name}
                </span>
                {client.email && (
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {client.email}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* כפתור Apply – סופי */}
<div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
  <button
    type="button"
        className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition"
        onClick={handleFlowApply}
  >
    החל
  </button>
</div>
    </>
  )}

        </div>
      </div>
    );
  };

/* ---------------------  SETTINGS PANEL  --------------------- */

const renderSettingsPanel = () => {
  // חישוב האחוז של הזום
  const percent =
    ((slotHeight - SLOT_HEIGHT_MIN) /
      (SLOT_HEIGHT_MAX - SLOT_HEIGHT_MIN)) *
    100;
  const clampedPercent = Math.min(100, Math.max(0, percent));

  let zoomLabel = "קטן";
  const ratio =
    (slotHeight - SLOT_HEIGHT_MIN) /
    (SLOT_HEIGHT_MAX - SLOT_HEIGHT_MIN);
  if (ratio > 0.66) {
    zoomLabel = "גדול";
  } else if (ratio > 0.33) {
    zoomLabel = "בינוני";
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" dir="ltr">
      {/* לחץ על הרקע – ביטול + החזרת הערך האחרון */}
      <div
        className="flex-1 bg-black/0"
        onClick={() => {
          setSlotHeight(appliedSlotHeight);
          setIsSettingsOpen(false);
        }}
      />

      <div className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111] border-l border-gray-200 dark:border-commonBorder shadow-2xl flex flex-col calendar-slide-in">
        {/* slider styles */}
        <style>{`
          .calendar-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 3px;
            border-radius: 9999px;
            background: #e5e7eb;
            outline: none;
          }
          .calendar-slider::-webkit-slider-runnable-track {
            height: 3px;
            border-radius: 9999px;
            background: transparent;
          }
          .calendar-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 9999px;
            background: ${BRAND_COLOR};
            border: none;
            cursor: pointer;
            margin-top: -5px;
            box-shadow: 0 0 0 2px #ffffff;
          }
          .calendar-slider::-moz-range-track {
            height: 3px;
            border-radius: 9999px;
            background: transparent;
          }
          .calendar-slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 9999px;
            background: ${BRAND_COLOR};
            border: none;
            cursor: pointer;
            box-shadow: 0 0 0 2px #ffffff;
          }
        `}</style>

        {/* X מחוץ לפופ אפ, בקצה הימני */}
        <button
          className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222]"
          onClick={() => {
            setSlotHeight(appliedSlotHeight);
            setIsSettingsOpen(false);
          }}
        >
          <FiX className="text-[20px]" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-end px-8 py-7">
          <span className="text-[26px] font-semibold text-gray-900 dark:text-gray-100 text-right w-full">
            הגדרות היומן שלך
          </span>
        </div>

          {/* תוכן – Calendar zoom + סליידר */}
<div
  className="flex-1 overflow-y-auto px-6 pt-2 pb-4 text-sm text-gray-800 dark:text-gray-100"
>
  <div className="space-y-4">
    <div className="flex items-center justify-between px-2">
      <span className="text-[16px] font-medium text-gray-500 dark:text-gray-400">
        זום יומן
      </span>
      <span className="text-[16px] font-medium text-gray-500 dark:text-gray-400">
        {zoomLabel}
      </span>
    </div>

    <div className="flex items-center">
      <input
        type="range"
        min={SLOT_HEIGHT_MIN}
        max={SLOT_HEIGHT_MAX}
        value={slotHeight}
        onChange={(e) => setSlotHeight(Number(e.target.value))}
        className="flex-1 calendar-slider"
        style={{
          background: `linear-gradient(to right, ${BRAND_COLOR} 0%, ${BRAND_COLOR} ${clampedPercent}%, #e5e7eb ${clampedPercent}%, #e5e7eb 100%)`,
        }}
      />
    </div>
  </div>
</div>

{/* כפתור Apply בתחתית */}
<div
  dir="rtl"
  className="border-top border-gray-200 dark:border-commonBorder px-8 py-5 border-t"
>
  <button
    className="w-full h-[48px] rounded-full text-md font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition"
    onClick={() => {
      setAppliedSlotHeight(slotHeight);
      setIsSettingsOpen(false);
    }}
  >
    החל
  </button>
</div>
        </div>
      </div>
    );
  };

  /* ---------------------  MAIN RENDER  --------------------- */

  return (
    <div dir="ltr" className="-mt-6 -mx-4 sm:-mx-6 h-[calc(100vh-85px)] flex flex-col bg-white dark:bg-[#111111]">
      {/* סטייל אנימציה לפאנלים */}
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

      {/* בר עליון */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-commonBorder bg-[#F9F9F9] dark:bg-[#111111]">
        {/* צד שמאל */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
           {/* Settings */}
          <button
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#222222]"
            onClick={() => {
              setSlotHeight(appliedSlotHeight);
              setIsSettingsOpen(true);
              setIsWaitlistOpen(false);
            }}
          >
            <FiSettings className="text-[15px]" />
          </button>
          

         {/* כפתור תאריך – חצים + תאריך + חצים */}
<div className="inline-flex items-center rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-xs sm:text-sm text-gray-800 dark:text-gray-100 overflow-hidden">
  {/* חץ שמאלי – קדימה (+1) */}
  <button
    onClick={handleNext} // 👈 קודם היה handlePrev
    className="py-2 px-2 sm:px-3 flex items-center justify-center border-r border-gray-200 dark:border-commonBorder hover:bg-gray-50 dark:hover:bg-[#222222]"
  >
    <span dir="ltr">
      <FiChevronLeft className="text-[14px]" />
    </span>
  </button>

  {/* טקסט התאריך / הטווח */}
  <button
    type="button"
    onClick={() => {
      setSelectedDate(currentDate);
      setPickerMonth(currentDate);
      setRangeStartDate(null);
      setRangeEndDate(null);
      setRangeHoverDate(null);
      setIsDatePickerOpen(true);
    }}
    className="px-3 sm:px-4 py-2 flex items-center justify-center font-medium whitespace-nowrap"
  >
    <span dir="rtl">{headerLabel}</span>
  </button>

  {/* חץ ימני – אחורה (-1) */}
  <button
    onClick={handlePrev} // 👈 קודם היה handleNext
    className="py-2 px-2 sm:px-3 flex items-center justify-center border-l border-gray-200 dark:border-commonBorder hover:bg-gray-50 dark:hover:bg-[#222222]"
  >
    <span dir="ltr">
      <FiChevronRight className="text-[14px]" />
    </span>
  </button>
</div>



{/* Date picker – מודאל אמצעי (עם השחרה + X בחוץ) */}
{isDatePickerOpen && (
  <div
    className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
    onClick={() => setIsDatePickerOpen(false)}
  >
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      {/* X מחוץ לפופ אפ בצד שמאל */}
      <button
        className="absolute -left-10 top-6 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222]"
        onClick={() => setIsDatePickerOpen(false)}
      >
        <FiX className="text-[20px]" />
      </button>

      <div className="w-[90vw] max-w-md rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-2xl p-4 sm:p-6">
        {/* 👇 כאן אני מכריח את כל היומן להיות RTL */}
        <div dir="rtl">
          {renderSingleMonth(pickerMonth)}
        </div>

        {/* כפתור שמירה */}
        <div className="flex items-center justify-end mt-4 text-xs sm:text-sm">
          <button
            className="px-8 py-2 rounded-full text-xs sm:text-sm font-semibold text-white"
            style={{ backgroundColor: BRAND_COLOR }}
            onClick={applyDateSelection}
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  </div>
)}



          {/* Staff dropdown button */}
<div className="relative">
  {/* כפתור "כל הצוות" – החץ משמאל לטקסט */}
  <button
    type="button"
    className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#222222]"
    onClick={() => setIsStaffDropdownOpen((prev) => !prev)}
  >
    {/* החץ קודם – יהיה בצד שמאל */}
    <FiChevronDown className="text-[14px] text-gray-400" />
    {/* הטקסט אחריו – בצד ימין */}
    <span className="whitespace-nowrap">
      {staffButtonLabel}
    </span>
  </button>

  {isStaffDropdownOpen && (
  <div
    dir="rtl"
    className="absolute left-0 mt-2 w-72 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
  >
      {/* מצב תצוגה – Scheduled / All */}
      <div className="py-2 border-b border-gray-200 dark:border-[#2B2B2B]">
        {/* צוות עם תורים */}
        <button
          type="button"
          className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#222] ${
            selectedStaff === "scheduled-team"
              ? "bg-gray-50 dark:bg-[#222]"
              : ""
          }`}
          onClick={() => {
            const scheduledIds = STAFF_DAY_CALENDARS.filter(
              (s) =>
                s.status !== "offline" &&
                s.status !== "not-working"
            ).map((s) => s.id);
            setSelectedStaff("scheduled-team");
            setSelectedTeamMembers(scheduledIds);
          }}
        >
          <span className="flex items-center gap-2">
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                selectedStaff === "scheduled-team"
                  ? "border-[rgba(255,37,124,1)]"
                  : "border-gray-300 dark:border-gray-500"
              }`}
            >
              {selectedStaff === "scheduled-team" && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
              )}
            </span>
            <span>צוות עם תורים</span>
          </span>
        </button>

        {/* כל הצוות */}
        <button
          type="button"
          className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#222] ${
            selectedStaff === "all-business"
              ? "bg-gray-50 dark:bg-[#222]"
              : ""
          }`}
          onClick={() => {
            setSelectedStaff("all-business");
            setSelectedTeamMembers(ALL_STAFF_IDS);
          }}
        >
          <span className="flex items-center gap-2">
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                selectedStaff === "all-business"
                  ? "border-[rgba(255,37,124,1)]"
                  : "border-gray-300 dark:border-gray-500"
              }`}
            >
              {selectedStaff === "all-business" && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
              )}
            </span>
            <span>כל הצוות</span>
          </span>
        </button>
      </div>

    


                {/* רשימת עובדים – שם בלבד */}
                <div className="py-2">
                  <div className="flex items-center justify-between px-3 mb-1">
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      חברי צוות
                    </span>
                    <button
                      className="text-[11px] text-[rgba(148,163,184,1)] hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={handleClearAllStaff}
                    >
                      נקה הכל
                    </button>
                  </div>

                  {STAFF_DAY_CALENDARS.map((staff) => {
                    const isChecked =
                      selectedTeamMembers.includes(staff.id);

                    return (
                      <button
                        key={staff.id}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#222]"
                        onClick={() => toggleStaffMember(staff.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#222] flex items-center justify-center text-[11px] font-semibold text-gray-800 dark:text-gray-100">
                            {staff.initials}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-[12px] font-medium">
                              {staff.name}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                            isChecked
                              ? "border-transparent"
                              : "border-gray-300 dark:border-gray-500"
                          }`}
                          style={
                            isChecked
                              ? { backgroundColor: BRAND_COLOR }
                              : undefined
                          }
                        >
                          {isChecked && (
                            <span className="text-[10px] text-white leading-none">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
          
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* צד ימין */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end flex-shrink-0">

          {/* Waitlist */}
          <button
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#222222]"
            onClick={() => {
              // Open waitlist LIST view first (not the flow)
              setIsWaitlistOpen(true);
              setIsSettingsOpen(false);
              setIsWaitlistRangeOpen(false);
              setIsSortDropdownOpen(false);
              setOpenWaitlistActionId(null);
            }}
          >
            <FiClock className="text-[15px]" />
          </button>

          {/* Day / Week / Month */}
          <div className="inline-flex items-center gap-2 flex-row-reverse">
            <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-[#181818] p-1 text-xs sm:text-sm flex-row-reverse">
            <button
              onClick={() => {
                setView("day");
                setCustomWeekStart(null);
              }}
              className={`px-3 py-2 rounded-full transition ${
                view === "day"
                  ? "text-gray-900 shadow-sm"
                  : "text-gray-600 dark:text-gray-300"
              }`}
              style={view === "day" ? { backgroundColor: "#ffffff" } : {}}
            >
              יום
            </button>
            <button
              onClick={() => {
                setView("week");
                setCustomWeekStart(null);
              }}
              className={`px-3 py-2 rounded-full transition ${
                view === "week"
                  ? "text-gray-900 shadow-sm"
                  : "text-gray-600 dark:text-gray-300"
              }`}
              style={view === "week" ? { backgroundColor: "#ffffff" } : {}}
            >
              שבוע
            </button>
            <button
              onClick={() => {
                setView("month");
                setCustomWeekStart(null);
              }}
              className={`px-3 py-2 rounded-full transition ${
                view === "month"
                  ? "text-gray-900 shadow-sm"
                  : "text-gray-600 dark:text-gray-300"
              }`}
              style={view === "month" ? { backgroundColor: "#ffffff" } : {}}
            >
              חודש
            </button>
            </div>
          </div>

          {/* כפתור "היום" - קופץ לתצוגה יומית של היום */}
          <button
            onClick={() => {
              const today = new Date();
              setCurrentDate(today);
              setView("day");
              setCustomWeekStart(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white shadow-sm hover:shadow-md active:scale-[0.98] transition"
            style={{ backgroundColor: "#000000" }}
          >
            <span>היום</span>
          </button>

          {/* Add – מפעיל פלואו קביעת תור ביומן */}
          {/* TEMPORARILY HIDDEN - Button kept in backend but not visible in UI */}
          <button
            className="hidden inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white shadow-sm hover:shadow-md active:scale-[0.98] transition"
            style={{ backgroundColor: BRAND_COLOR }}
            onClick={() => {
              // Open side-panel flow in "booking" mode (creates calendar appointment)
              // Start with staff selection step for booking flow
  setWaitlistClientSearch("");
              setWaitlistAddStep("staff"); // Start with staff selection for booking flow
  setBookingSelectedTime("any");
  setBookingSelectedService(null);
  setServiceSearch("");
  setIsTimeDropdownOpen(false);
              setSelectedWaitlistClient(null);
              setBookingSelectedDate(null);
              setBookingSelectedTime(null);
              setSelectedStaffForBooking(null); // Reset staff selection
              setAddFlowMode("booking"); // Booking mode = creates calendar appointment
              setIsWaitlistAddOpen(true); // Open the same side-panel flow
}}

          >
            <FiPlus className="text-[16px]" />
            <span>חדש</span>
          </button>
        </div>
      </div>

      {/* לייר לסגירת דרופדאון עובדים בלחיצה בחוץ */}
      {isStaffDropdownOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsStaffDropdownOpen(false)}
        />
      )}

      {/* היומן עצמו */}
      <div className="flex-1 min-h-0">
        {view === "month" ? renderMonthGrid() : renderTimeGrid()}
      </div>

            {/* Panels */}
      {isSettingsOpen && renderSettingsPanel()}
      {isWaitlistOpen && renderWaitlistPanel()}
      {isWaitlistAddOpen && renderWaitlistAddClientPanel()}

      {/* Overlap Warning Modal - shown when drag & drop causes overlap */}
      {/* Uses the SAME modal style as the date picker popup */}
      {showOverlapModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
          onClick={() => setShowOverlapModal(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* X מחוץ לפופ אפ בצד שמאל - SAME as date picker */}
            <button
              className="absolute -left-10 top-6 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222]"
              onClick={() => setShowOverlapModal(false)}
            >
              <FiX className="text-[20px]" />
            </button>

            {/* Modal container - narrower width for two-line text, smaller padding */}
            <div className="w-[90vw] max-w-xs rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-2xl p-3 sm:p-4" dir="rtl">
              {/* Message - two lines with hierarchy */}
              <div className="py-6 text-center">
                {/* Headline - bold and larger */}
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                  לא ניתן להזיז תור
                </p>
                {/* Explanation - smaller and softer */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  יש חפיפה עם תור קיים.
                </p>
              </div>

              {/* Button - centered */}
              <div className="flex items-center justify-center mt-4">
                <button
                  className="px-8 py-2 rounded-full text-xs sm:text-sm font-semibold text-white"
                  style={{ backgroundColor: BRAND_COLOR }}
                  onClick={() => setShowOverlapModal(false)}
                >
                  חזרה ליומן
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Conflict Modal - shown when creating recurring appointments causes overlap */}
      {showBookingConflictModal && conflictingAppointment && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
          onClick={() => {
            setShowBookingConflictModal(false);
            setConflictingAppointment(null);
            setWaitlistAddStep("service"); // Return to service selection screen
          }}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -left-10 top-6 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222]"
              onClick={() => {
                setShowBookingConflictModal(false);
                setConflictingAppointment(null);
                setWaitlistAddStep("service"); // Return to service selection screen
              }}
            >
              <FiX className="text-[20px]" />
            </button>

            {/* Modal container */}
            <div className="w-[90vw] max-w-xs rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-2xl p-3 sm:p-4" dir="rtl">
              {/* Message with warning icon */}
              <div className="py-6 text-center">
                {/* Headline with warning icon */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    התנגשות תורים!
                  </p>
                </div>
                {/* Explanation with conflicting appointment details */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
                  יש תור שמתנגש עם התור שאתה רוצה לקבוע ב:
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {conflictingAppointment.client} • {new Date(conflictingAppointment.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })} • {conflictingAppointment.time}
                </p>
              </div>

              {/* Button - centered */}
              <div className="flex items-center justify-center mt-4">
                <button
                  className="px-8 py-2 rounded-full text-xs sm:text-sm font-semibold text-white"
                  style={{ backgroundColor: BRAND_COLOR }}
                  onClick={() => {
                    setShowBookingConflictModal(false);
                    setConflictingAppointment(null);
                    setWaitlistAddStep("service"); // Return to service selection screen
                  }}
                >
                  חזרה ליומן
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* מודאל Add new client */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* רקע לסגירה בלחיצה */}
          <div
            className="absolute inset-0 bg-black/0"
            onClick={closeAllPopups}
          />

          {/* הפאנל עצמו – עכשיו RTL */}
          <div
            dir="rtl"
            className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111] border-l border-gray-200 dark:border-commonBorder shadow-2xl flex flex-col calendar-slide-in z-50 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222]"
              onClick={closeAllPopups}
            >
              <FiX className="text-[20px]" />
            </button>

            <div className="px-8 pt-7 pb-9">
              <h2 className="text-[24px] sm:text-[26px] font-semibold text-gray-900 dark:text-gray-100">
                הוסף לקוח חדש
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-9 pb-6 pt-1 text-sm text-gray-800 dark:text-gray-100">
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                      שם מלא <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="שם הלקוח"
                    dir="rtl"
                    className={`w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border ${
                      newClientErrors.name
                        ? "border-red-400 dark:border-red-500"
                        : "border-gray-200 dark:border-[#262626]"
                    } text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right`}
                  />
                  {newClientErrors.name && (
                    <p className="text-[11px] text-red-500">
                      {newClientErrors.name}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                      טלפון <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={newClientPhone}
                    onChange={(e) => {
                      // Allow only digits, limit to 10 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewClientPhone(value);
                    }}
                    placeholder="מספר נייד"
                    maxLength={10}
                    dir="rtl"
                    className={`w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border ${
                      newClientErrors.phone
                        ? "border-red-400 dark:border-red-500"
                        : "border-gray-200 dark:border-[#262626]"
                    } text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right`}
                  />
                  {newClientErrors.phone && (
                    <p className="text-[11px] text-red-500">
                      {newClientErrors.phone}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                    אימייל
                  </label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    dir="rtl"
                    className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                  />
                </div>

                {/* City */}
                <div className="space-y-3">
                  <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                    עיר
                  </label>
                  <input
                    type="text"
                    value={newClientCity}
                    onChange={(e) => setNewClientCity(e.target.value)}
                    placeholder="עיר"
                    dir="rtl"
                    className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                  />
                </div>

                {/* Address */}
                <div className="space-y-3">
                  <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                    כתובת
                  </label>
                  <input
                    type="text"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    placeholder="רחוב, מספר וכו'"
                    dir="rtl"
                    className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                  />
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
              <button
                type="button"
                className="w-full h-[44px] rounded-full text-medium font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition"
                onClick={handleCreateNewClient}
              >
                הוסף לקוח
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEGACY DRAWER DISABLED - No longer used */}
      {/* All booking now uses the new right-side booking flow (isWaitlistAddOpen with addFlowMode="booking") */}
      {/* <AppointmentDrawer
        open={false}
        slot={null}
        services={DEMO_SERVICES}
        clients={clients}
        onClose={closeAllPopups}
        onCreate={handleCreateAppointmentFromDrawer}
      /> */}
    </div>
  );
};


const AppointmentDrawer = ({
  open,
  slot,
  services,
  clients,
  onClose,
  onCreate,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  if (!open || !slot) return null;

  const handleSave = () => {
    if (!selectedServiceId || !selectedClientId) return;

    const selectedService = services.find((s) => s.id === selectedServiceId);
    const selectedClient = clients.find((c) => c.id === selectedClientId);

    const newEvent = {
      id: Date.now(),
      date: slot.dateIso,      // "YYYY-MM-DD"
      startTime: slot.time,    // "HH:MM"
      endTime: slot.time,      // כרגע אותו זמן, אפשר לחשב לפי משך שירות
      staff: slot.staffId,
      staffName: slot.staffName,
      serviceId: selectedServiceId,
      serviceName: selectedService?.name,
      clientId: selectedClientId,
      clientName: selectedClient?.name,
      // אפשר להוסיף כאן שדות נוספים בהתאם ל-customEvents
    };

    onCreate(newEvent);
    setSelectedServiceId("");
    setSelectedClientId("");
    onClose();
  };

  return (
    <>
      {/* רקע לסגירה בלחיצה על המסך */}
      <div
        className="fixed inset-0 bg-black/0 z-40"
        onClick={onClose}
      />

      {/* הפאנל עצמו – אותם חוקים של שאר הפופ אפים */}
      <div
        dir="rtl"
        className="fixed inset-0 z-50 flex justify-end"
      >
        <div
          className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111] border-l border-gray-200 dark:border-commonBorder shadow-2xl flex flex-col calendar-slide-in text-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* X מחוץ לפופ אפ בצד שמאל למעלה */}
          <button
            className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222]"
            onClick={onClose}
          >
            <FiX className="text-[20px]" />
          </button>

          {/* כותרת + סיכום תאריך/שעה/איש צוות */}
          <div className="px-8 pt-7 pb-3">
            <h2 className="text-[24px] sm:text-[26px] font-semibold text-gray-900 dark:text-gray-100">
              קביעת תור חדש
            </h2>
            <div className="mt-2 text-[12px] text-gray-500 dark:text-gray-400">
              {slot.staffName} · {slot.time} · {slot.dateIso}
            </div>
          </div>

          {/* גוף הפאנל – בחירת שירות ולקוח */}
          <div className="flex-1 overflow-y-auto px-9 pb-6 pt-1 text-sm text-gray-800 dark:text-gray-100">
            <div className="space-y-5">
              {/* שירות */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                    שירות <span className="text-red-500">*</span>
                  </label>
                </div>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent"
                >
                  <option value="">בחר שירות</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                      {service.duration ? ` · ${service.duration}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* לקוח */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                    לקוח <span className="text-red-500">*</span>
                  </label>
                </div>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent"
                >
                  <option value="">בחר לקוח</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                      {client.phone ? ` · ${client.phone}` : ""}
                    </option>
                  ))}
                </select>

                {/* בעתיד – חיבור למודאל "הוסף לקוח חדש" */}
                {/* 
                <button
                  type="button"
                  className="mt-2 text-[11px] font-medium text-[rgba(255,37,124,1)] hover:underline"
                  onClick={() => {
                    // לחבר למודאל Add client כשנרצה
                  }}
                >
                  + הוסף לקוח חדש
                </button>
                */}
              </div>
            </div>
          </div>

          {/* כפתור שמירה – אותו סטייל כמו שאר הפאנלים */}
          <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder" dir="rtl">
            <button
              type="button"
              className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedServiceId || !selectedClientId}
              onClick={handleSave}
            >
              שמור תור
            </button>
          </div>
        </div>
      </div>
    </>
  );
};



export default CalendarPage;
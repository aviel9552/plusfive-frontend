import React, { useState, useMemo } from "react";
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

// שעות לתצוגה
const START_HOUR = 0;
const END_HOUR = 23;

const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i
);

// מינימום ומקסימום של הזום ביומן (בשביל הסליידר)
const SLOT_HEIGHT_MIN = 100;
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
  return date.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
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
    status: "upcoming",
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
    const endLabel = minutesToLabel(minute + intervalMinutes);
    slots.push(`${startLabel}-${endLabel}`);
  }

  return slots;
};

const CalendarPage = () => {
  const { language } = useLanguage();
  const { isDarkMode } = useTheme(); // כרגע לא בשימוש, משאירים

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState("week");

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

  // רשימת ה-Waitlist בפועל (מתחיל מה-DEMO)
  const [waitlistItems, setWaitlistItems] = useState(DEMO_WAITLIST);

  // אירועים אמיתיים שנוצרים מהפלואו (נכנסים ליומן)
  const [customEvents, setCustomEvents] = useState([]);

  // רשימת קליינטים לפלואו (ניתנת להרחבה ע"י Add new client)
  const [clients, setClients] = useState(DEMO_WAITLIST_CLIENTS);

  // הקליינט שנבחר בפלואו של ה-Add
  const [selectedWaitlistClient, setSelectedWaitlistClient] = useState(null);

  // Waitlist filters
  const [waitlistFilter, setWaitlistFilter] = useState("upcoming");
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
  const [waitlistAddStep, setWaitlistAddStep] = useState("client");
  // מאיפה הפלואו התחיל: "waitlist" או "calendar"
  const [addFlowMode, setAddFlowMode] = useState("waitlist");

  // מצב לפופ־אפ Add new client (מודאל נפרד)
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCity, setNewClientCity] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientErrors, setNewClientErrors] = useState({});

  // תאריך לבוקינג מתוך הפופ אפ החדש
  const [bookingSelectedDate, setBookingSelectedDate] = useState(
    () => new Date()
  );
  const [bookingMonth, setBookingMonth] = useState(() => new Date());

  // זמן ושירות לבוקינג מתוך הפופ אפ החדש
  const [bookingSelectedTime, setBookingSelectedTime] = useState("any");
  const [bookingSelectedService, setBookingSelectedService] = useState(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

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

  const renderEvent = (event) => {
    const start = parseTime(event.start);
    const end = parseTime(event.end);
    const top = (start - START_HOUR) * slotHeight;
    const height = Math.max((end - start) * slotHeight - 6, 40);

    return (
      <div
        key={event.id}
        className="absolute left-[3px] right-[3px] rounded-md text-[11px] sm:text-xs px-2 py-1.5 text-gray-900 dark:text-white overflow-hidden shadow-sm"
        style={{
          top,
          height,
          backgroundColor: event.color,
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex justify-between items-center mb-0.5 gap-2">
          <span className="font-semibold truncate">{event.title}</span>
          <span className="opacity-80">
            {event.start}–{event.end}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2 opacity-90">
          <span className="truncate">{event.client}</span>
          <span className="flex items-center gap-1">
            <FiUser className="text-[11px]" />
            <span className="truncate">{event.staff}</span>
          </span>
        </div>
      </div>
    );
  };

  // Hover של רבע שעה
  const handleDayMouseMove = (iso, e, staffId = null) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const slot15 = slotHeight / 4;
    let slotIndex = Math.floor(y / slot15);
    if (slotIndex < 0) slotIndex = 0;

    const maxIndex = HOURS.length * 4 - 1;
    if (slotIndex > maxIndex) slotIndex = maxIndex;

    const top = slotIndex * slot15;
    const totalMinutes = START_HOUR * 60 + slotIndex * 15;
    const label = minutesToLabel(totalMinutes);

    setHoverPreview({ iso, top, label, staffId });
  };

  const handleDayMouseLeave = () => {
    setHoverPreview(null);
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
              className="pointer-events-none absolute inset-x-0 z-10"
              style={{ top: 112 + nowTop }} // 112px = h-28 בר עובדים
            >
              <div className="flex items-center">
                <div className="w-16 sm:w-14 flex items-center justify-center">
                  <div
                    className="h-6 w-full ml-[7.5px] rounded-full bg-white/95 dark:bg-[#181818]/95 border-[2px] flex items-center justify-center gap-0 text-[12px] font-extrabold tracking-tight shadow-sm"
                    style={{
                      borderColor: BRAND_COLOR,
                      color: BRAND_COLOR,
                    }}
                  >
                    <span>{nowLabel}</span>
                  </div>
                </div>

                <div
                  className="flex-1 h-[2px]"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
              </div>
            </div>
          )}

          {/* עמודת שעות – DAY VIEW */}
          <div className="w-16 sm:w-14 bg-white dark:bg-[#101010] text-[10px] sm:text-[13px] text-gray-500 dark:text-gray-400">
            {/* חלק עליון זהה לבר העובדים */}
            <div className="h-28 border-b border-gray-200/80 dark:border-commonBorder bg-white dark:bg-[#141414]" />

            {HOURS.map((h) => (
              <div
                key={h}
                className="flex items-start justify-center pr-1 sm:pr-2 pt-1 font-semibold border-t border-r border-gray-200/80 dark:border-[#1c1c1c] bg-white dark:bg-[#101010]"
                style={{ height: slotHeight }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* צד ימין – בר עובדים + טורים */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#050505]">
            {/* בר העובדים */}
            <div
              className="border-b border-gray-200 dark:border-commonBorder bg-white dark:bg-[#141414] h-28 grid"
              style={{
                gridTemplateColumns: `repeat(${colsCount}, minmax(0,1fr))`,
              }}
            >
              {orderedStaff.map((staff) => {
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

            {/* היומן – טורים */}
            <div
              className="flex-1 relative grid"
              style={{
                gridTemplateColumns: `repeat(${colsCount}, minmax(0,1fr))`,
              }}
            >
              {orderedStaff.map((staff) => {
                const isOffline =
                  staff.status === "offline" || staff.status === "not-working";

                const staffEvents = dayEvents.filter(
                  (e) => e.staff === staff.id
                );

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
                      className="relative"
                      style={{ height: HOURS.length * slotHeight }}
                      onMouseMove={(e) =>
                        handleDayMouseMove(iso, e, staff.id)
                      }
                      onMouseLeave={handleDayMouseLeave}
                    >
                      {hoverPreview &&
                        hoverPreview.iso === iso &&
                        hoverPreview.staffId === staff.id && (
                          <div
                            className="absolute left-0 right-0 rounded-md pointer-events-none flex items-center"
                            style={{
                              top: hoverPreview.top,
                              height: slotHeight / 4,
                              backgroundColor: "rgba(255,37,124,0.09)",
                              boxShadow:
                                "0 0 0 1px rgba(255,37,124,0.22) inset",
                            }}
                          >
                            <span className="ml-2 text-[10px] font-medium text-gray-700 dark:text-gray-100">
                              {hoverPreview.label}
                            </span>
                          </div>
                        )}

                      {staffEvents.map(renderEvent)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // WEEK VIEW
    const daysToRender = weekDays;

    return (
      <div className="flex flex-1 min-h-0">
        
        {/* עמודת שעות – WEEK VIEW */}
        <div className="w-16 sm:w-14 bg-white dark:bg-[#050505] text-[10px] sm:text-[13px] text-gray-500 dark:text-gray-400">
          {/* החלק העליון – שיהיה זהה לבר של הימים */}
          <div className="h-24 border-b border-gray-200/80 dark:border-commonBorder bg-white dark:bg-[#050505]" />

          {HOURS.map((h) => (
            <div
              key={h}
              className="flex items-start justify-center font-semibold border-t border-r border-gray-200/80 dark:border-[#1c1c1c]"
              style={{ height: slotHeight }}
            >
              {formatHour(h)}
            </div>
          ))}
        </div>

        {/* ימים – RTL: שבת שמאל ← א' ימין */}
<div className="flex-1 grid grid-cols-7 bg-white dark:bg-[#050505]" dir="rtl">
  {[...daysToRender].map((day) => {

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
                  onMouseMove={(e) => handleDayMouseMove(iso, e)}
                  onMouseLeave={handleDayMouseLeave}
                >
                  {/* קווי שעות */}
                  {HOURS.map((h, idx) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-gray-100 dark:border-[#1c1c1c]"
                      style={{ top: idx * slotHeight }}
                    />
                  ))}


                  {/* hover של 15 דקות */}
                  {hoverPreview && hoverPreview.iso === iso && (
                    <div
                      className="absolute left-0 right-0 pointer-events-none flex items-center rounded-lg"
                      style={{
                        top: hoverPreview.top,
                        height: slotHeight / 4,
                        backgroundColor: "rgba(255,37,124,0.09)",
                        boxShadow:
                          "0 0 0 1px rgba(255,37,124,0.22) inset",
                      }}
                    >
                      <span className="ml-2 text-[10px] font-medium text-gray-700 dark:text-gray-100">
                        {hoverPreview.label}
                      </span>
                    </div>
                  )}

                  {/* אירועים */}
                  {dayEvents.map(renderEvent)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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

  const filteredWaitlist = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const inRange = (item) => {
      if (waitlistRange === "all" || waitlistRange === "calendar") {
        return true;
      }

      const itemDate = new Date(item.requestedDate);
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
                setWaitlistClientSearch("");
                setWaitlistAddStep("client");
                setBookingSelectedTime("any");
                setBookingSelectedService(null);
                setServiceSearch("");
                setIsTimeDropdownOpen(false);
                setSelectedWaitlistClient(null);
                setAddFlowMode("waitlist"); // הפלואו מגיע מה-Waitlist
                setIsWaitlistAddOpen(true); // פותח את הפופ החדש
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
                  { key: "upcoming", label: "ממתינים" },
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
              {filteredWaitlist.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] p-3 text-[14px] text-gray-800 dark:text-gray-100 text-right "
                >
                  <div className="flex justify-between mb-1 flex-row-reverse">
                    <span className="font-semibold text-right">{item.client}</span>
                    <span className="text-[12px] text-gray-500">
                      {item.requestedDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] flex-row-reverse">
                    <span className="capitalize text-gray-500">
              
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.note}
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
              ))}

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
    

    const timeSlots = generateTimeSlots(10, 20, 30);

    const closePanel = () => {
      setIsWaitlistAddOpen(false);
      setWaitlistAddStep("client");
      setIsTimeDropdownOpen(false);
      setBookingSelectedTime("any");
      setBookingSelectedService(null);
      setServiceSearch("");
      setSelectedWaitlistClient(null);
      setAddFlowMode("waitlist");
    };

    const isClientStep = waitlistAddStep === "client";
    const isDateStep = waitlistAddStep === "date";
    const isTimeStep = waitlistAddStep === "time";
    const isServiceStep = waitlistAddStep === "service";

    const titleText = isClientStep
      ? "בחר לקוח"
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
  const locale = language === "he" ? "he-IL" : "en-US";
  const days = getMonthMatrix(bookingMonth);
  const currentMonth = bookingMonth.getMonth();

  const monthLabel = bookingMonth.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  // שמות ימים – יוצרים א'..ש' ואז הופכים כדי ששבת תהיה בשמאל וא' בימין
  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2025, 0, 5 + i); // 5/1/2025 זה יום א'
    return d.toLocaleDateString(locale, { weekday: "short" });
  });
  const rtlDayNames = [...dayNames].reverse(); // ש, ו, ה, ד, ג, ב, א

  // הופכים כל שורה במטריצת הימים, כדי שהמספרים יסודרו מימין לשמאל
  const rtlDays = [];
  for (let week = 0; week < 6; week++) {
    const start = week * 7;
    const weekDays = days.slice(start, start + 7).reverse(); // הופך את השורה
    rtlDays.push(...weekDays);
  }

  return (
    <div className="w-full">
      {/* כותרת חודש + חצים ב-RTL אמיתי */}
<div className="flex items-center justify-between mb-3">
  
  {/* ▶ חץ ימני = חודש קודם (-1) */}
  <button
    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-300"
    onClick={() => {
      const d = new Date(bookingMonth);
      d.setMonth(d.getMonth() + 1);
      setBookingMonth(d);
    }}
  >
    <FiChevronLeft /> {/* פונה ימינה */}
  </button>

  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
    {monthLabel}
  </span>

  {/* ◀ חץ שמאלי = חודש הבא (+1) */}
  <button
    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-300"
    onClick={() => {
      const d = new Date(bookingMonth);
      d.setMonth(d.getMonth() - 1);
      setBookingMonth(d);
    }}
  >
    <FiChevronRight /> {/* פונה שמאלה */}
  </button>

</div>

      {/* שמות ימים – שבת משמאל, א' מימין */}
      <div className="grid grid-cols-7 gap-[4px] text-[11px] text-gray-500 dark:text-gray-300 mb-1">
        {rtlDayNames.map((name) => (
          <div
            key={name}
            className="h-7 flex items-center justify-center"
          >
            {name}
          </div>
        ))}
      </div>

      {/* ימים – 1 מתחיל מתחת לא' (קצה ימין), ממשיך שמאלה */}
      <div className="grid grid-cols-7 grid-rows-6 gap-[4px]">
        {rtlDays.map((day) => {
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isSelected = isSameCalendarDay(day, bookingSelectedDate);

          let className =
            "relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs transition-colors";
          let style = {};

          if (isSelected) {
            className +=
              " font-semibold bg-[rgba(255,37,124,0.08)] text-gray-900 dark:text-white";
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
            {/* 🔥 שלבי הפלואו – כולם לחיצים */}
            <div className="text-[11px] mb-2 flex items-center gap-1">
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

              <span className="text-gray-300">›</span>

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
            </div>

            {/* כותרת המסך */}
            <h2 className="text-[24px] sm:text-[26px] font-semibold text-gray-900 dark:text-gray-100">
              {titleText}
            </h2>
          </div>

          {/* BODY – שלב 1: Client */}
          {isClientStep && (
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
                    onChange={(e) =>
                      setWaitlistClientSearch(e.target.value)
                    }
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
                    className="w-full flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#181818] text-left text-xs sm:text-sm"
                    onClick={() => {
                      setSelectedWaitlistClient(client);
                      setWaitlistAddStep("date");
                      setBookingSelectedTime("any");
                      setBookingSelectedService(null);
                      setServiceSearch("");
                      setIsTimeDropdownOpen(false);
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
                  className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition"
                  onClick={() => {
                    setWaitlistAddStep("time");
                    setBookingSelectedTime("any");
                    setBookingSelectedService(null);
                    setServiceSearch("");
                    setIsTimeDropdownOpen(false);
                  }}
                >
                  החל
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
                      <span>{bookingDateLabel}</span>
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
                        onClick={() =>
                          setIsTimeDropdownOpen((prev) => !prev)
                        }
                      >
                        <span>
                          {bookingSelectedTime === "any"
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
                            {bookingSelectedTime === "any" && (
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
                  החל
                </button>
              </div>
            </>
          )}

          {/* BODY – שלב 4: Select service */}
          {isServiceStep && (
            <>
              <div className="flex-1 overflow-y-auto px-8 pb-6 pt-3 text-m text-gray-800 dark:text-gray-100">
                <div className="space-y-5">
                  {/* סיכום תאריך ושעה */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      תאריך ושעה
                    </div>
                    <div className="text-[14px] text-gray-500 dark:text-gray-400">
                      {bookingDateLabel} ·{" "}
                      {bookingSelectedTime === "any"
                        ? "כל שעה"
                        : bookingSelectedTime}
                    </div>
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
                      service.name
                        .toLowerCase()
                        .includes(serviceSearch.toLowerCase())
                    ).map((service) => {
                      const isActive =
                        bookingSelectedService === service.id;

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
                          onClick={() =>
                            setBookingSelectedService(service.id)
                          }
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

              {/* כפתור Apply – לפי מקור הפלואו */}
              <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
                <button
                  type="button"
                  className="w-full h-[48px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!bookingSelectedService}
                  onClick={() => {
                    const isoDate =
                      bookingSelectedDate instanceof Date
                        ? bookingSelectedDate.toISOString().slice(0, 10)
                        : new Date().toISOString().slice(0, 10);

                    const selectedServiceObj = DEMO_SERVICES.find(
                      (s) => s.id === bookingSelectedService
                    );

                    const clientName =
                      selectedWaitlistClient?.name || "לקוח מזדמן";

                    const noteText = selectedServiceObj
                      ? selectedServiceObj.name
                      : "תור חדש";

                    if (addFlowMode === "waitlist") {
                      // מצב ישן – מוסיפים ל-Waitlist
                      setWaitlistItems((prev) => [
                        {
                          id: Date.now(),
                          client: clientName,
                          requestedDate: isoDate,
                          status: "upcoming",
                          note: noteText,
                        },
                        ...prev,
                      ]);

                      setWaitlistFilter("upcoming");
                      setWaitlistRange("30days");
                      setIsWaitlistOpen(true);
                    } else {
                      // מצב חדש – הפלואו התחיל מכפתור Add למעלה => קביעת תור ביומן
                      let start = "10:00";
                      let end = "11:00";

                      if (bookingSelectedTime && bookingSelectedTime !== "any") {
                        const parts = bookingSelectedTime.split("-");
                        if (parts.length === 2) {
                          start = parts[0].trim();
                          end = parts[1].trim();
                        }
                      }

                      const defaultStaff =
                        STAFF_DAY_CALENDARS[0]?.id || "Dana";

                      const newEvent = {
                        id: Date.now(),
                        date: isoDate,
                        title: noteText,
                        client: clientName,
                        staff: defaultStaff,
                        start,
                        end,
                        color: "#FFE4F1",
                      };

                      setCustomEvents((prev) => [...prev, newEvent]);

                      const dateObj = new Date(isoDate);
                      setCurrentDate(dateObj);
                      setView("day");
                      setCustomWeekStart(null);
                    }

                    // ניקוי וסגירת פאנל
                    setIsWaitlistAddOpen(false);
                    setWaitlistAddStep("client");
                    setBookingSelectedTime("any");
                    setBookingSelectedService(null);
                    setServiceSearch("");
                    setSelectedWaitlistClient(null);
                    setAddFlowMode("waitlist");
                  }}
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

  const handleCreateNewClient = () => {
    const errors = {};
    if (!newClientName.trim()) {
      errors.name = "שם הוא שדה חובה";
    }
    if (!newClientPhone.trim()) {
      errors.phone = "טלפון הוא שדה חובה";
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
      phone: newClientPhone.trim(),
      email: newClientEmail.trim(),
      city: newClientCity.trim(),
      address: newClientAddress.trim(),
      initials: initials || "ל",
    };

    setClients((prev) => [newClient, ...prev]);
    setSelectedWaitlistClient(newClient);

    setWaitlistAddStep("date");
    setBookingSelectedTime("any");
    setBookingSelectedService(null);
    setServiceSearch("");
    setIsTimeDropdownOpen(false);

    setIsNewClientModalOpen(false);
    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
    setNewClientCity("");
    setNewClientAddress("");
    setNewClientErrors({});
  };

  const renderSettingsPanel = () => {
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
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#222222]"
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
    className="h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-center border-r border-gray-200 dark:border-commonBorder hover:bg-gray-50 dark:hover:bg-[#222222]"
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
    className="px-3 sm:px-4 h-8 sm:h-9 flex items-center justify-center font-medium whitespace-nowrap"
  >
    <span dir="rtl">{headerLabel}</span>
  </button>

  {/* חץ ימני – אחורה (-1) */}
  <button
    onClick={handlePrev} // 👈 קודם היה handleNext
    className="h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-center border-l border-gray-200 dark:border-commonBorder hover:bg-gray-50 dark:hover:bg-[#222222]"
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
    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#222222]"
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
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#222222]"
            onClick={() => {
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
            <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-[#181818] p-1 text-xs sm:text-sm flex-row-reverse">
            <button
              onClick={() => {
                setView("day");
                setCustomWeekStart(null);
              }}
              className={`px-3 py-1 rounded-full ${
                view === "day"
                  ? "bg-white dark:bg-[#262626] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              יום
            </button>
            <button
              onClick={() => {
                setView("week");
                setCustomWeekStart(null);
              }}
              className={`px-3 py-1 rounded-full ${
                view === "week"
                  ? "bg-white dark:bg-[#262626] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              שבוע
            </button>
            <button
              onClick={() => {
                setView("month");
                setCustomWeekStart(null);
              }}
              className={`px-3 py-1 rounded-full ${
                view === "month"
                  ? "bg-white dark:bg-[#262626] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              חודש
            </button>
          </div>

          {/* Add – מפעיל פלואו קביעת תור ביומן */}
          <button
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-sm hover:shadow-md active:scale-[0.98] transition"
            style={{ backgroundColor: BRAND_COLOR }}
            onClick={() => {
              setWaitlistClientSearch("");
              setWaitlistAddStep("client");
              setBookingSelectedTime("any");
              setBookingSelectedService(null);
              setServiceSearch("");
              setIsTimeDropdownOpen(false);
              setSelectedWaitlistClient(null);
              setAddFlowMode("calendar"); // פלואו של Calendar
              setIsWaitlistAddOpen(true); // פותח Select a client
            }}
          >
            <FiPlus className="text-[16px]" />
            <span>הוסף</span>
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

      {/* מודאל Add new client */}
{isNewClientModalOpen && (
  <div className="fixed inset-0 z-50 flex justify-end">
    {/* רקע לסגירה בלחיצה */}
    <div
      className="absolute inset-0 bg-black/0"
      onClick={() => {
        setIsNewClientModalOpen(false);
        setNewClientErrors({});
      }}
    />

    {/* הפאנל עצמו – עכשיו RTL */}
    <div
      dir="rtl"
      className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111] border-l border-gray-200 dark:border-commonBorder shadow-2xl flex flex-col calendar-slide-in z-50 text-right"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222]"
        onClick={() => {
          setIsNewClientModalOpen(false);
          setNewClientErrors({});
        }}
      >
        <FiX className="text-[20px]" />
      </button>


            <div className="px-8 pt-7 pb-9">
              <h2 className="text-[24px] sm:text-[26px] font-semibold text-gray-900 dark:text-gray-100">
                הוסף לקוח
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-9 pb-6 pt-1 text-sm text-gray-800 dark:text-gray-100">
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      שם <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="שם הלקוח"
                    className={`w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border ${
                      newClientErrors.name
                        ? "border-red-400 dark:border-red-500"
                        : "border-gray-200 dark:border-[#262626]"
                    } text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent`}
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
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      טלפון <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="מספר טלפון"
                    className={`w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border ${
                      newClientErrors.phone
                        ? "border-red-400 dark:border-red-500"
                        : "border-gray-200 dark:border-[#262626]"
                    } text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent`}
                  />
                  {newClientErrors.phone && (
                    <p className="text-[11px] text-red-500">
                      {newClientErrors.phone}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    אימייל
                  </label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent"
                  />
                </div>

                {/* City */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    עיר
                  </label>
                  <input
                    type="text"
                    value={newClientCity}
                    onChange={(e) => setNewClientCity(e.target.value)}
                    placeholder="עיר"
                    className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent"
                  />
                </div>

                {/* Address */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    כתובת
                  </label>
                  <input
                    type="text"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    placeholder="רחוב, מספר וכו'"
                    className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
              <button
                type="button"
                className="w-full h-[44px] rounded-full text-sm font-semibold flex items-center justify-center bg-black text-white dark:bg.white dark:text-black hover:opacity-90 transition"
                onClick={handleCreateNewClient}
              >
                צור לקוח
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
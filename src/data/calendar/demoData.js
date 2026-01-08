/**
 * Demo data for calendar
 * This should eventually be replaced with real API calls
 */

// בר עובדים ל־DAY VIEW - DEPRECATED: Use staff from localStorage instead
// These are kept only for demo events that reference them by ID
const DEMO_STAFF_IDS = ["Dana", "Avi", "Lior"];

// Note: STAFF_DAY_CALENDARS and ALL_STAFF_IDS are now loaded from localStorage in CalendarPage
// This ensures full synchronization between the staff management page and the calendar

// דמו שירותים לפופ Select a service
export const DEMO_SERVICES = [
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

// דמו לוויטינג ליסט
export const DEMO_WAITLIST = [
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
export const DEMO_WAITLIST_CLIENTS = [
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

/**
 * Create demo events for a given week
 * @param {Date[]} weekDays - Array of 7 dates for the week
 * @returns {Array} - Array of demo events
 */
export const createDemoEvents = (weekDays) => {
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


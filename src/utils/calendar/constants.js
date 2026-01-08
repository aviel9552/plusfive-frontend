// Calendar Constants
export const BRAND_COLOR = "#FF257C";

// LocalStorage key for persisting calendar appointments
export const CALENDAR_EVENTS_STORAGE_KEY = "plusfive_calendar_events";

// Hours for display
export const START_HOUR = 0;
export const END_HOUR = 23;

export const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i
);

// Zoom limits for calendar slots
export const SLOT_HEIGHT_MIN = 130; // Increased by ~30% from 100 to 130 for better readability
export const SLOT_HEIGHT_MAX = 500;

// Helper function to generate UUID
export const uuid = () => {
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


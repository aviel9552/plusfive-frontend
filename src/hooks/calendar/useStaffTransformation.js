import { useMemo } from "react";

export const useStaffTransformation = (staffFromStorage) => {
  // Convert staff from storage to calendar format
  const STAFF_DAY_CALENDARS = useMemo(() => {
    return staffFromStorage
      .filter((staffMember) => {
        // Filter out staff members with status "לא פעיל" (inactive)
        const staffStatus = staffMember.status || "פעיל";
        return staffStatus !== "לא פעיל";
      })
      .map((staffMember) => {
        const workingHours = staffMember.workingHours || {};
        const today = new Date();
        const dayNames = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
        const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday=0 to Sunday=6
        const todayKey = dayNames[dayIndex];
        const todayHours = workingHours[todayKey] || {};
        const isActive = todayHours.active !== false; // Default to true

        // Determine status based on working hours and active state
        let status = "available";
        if (!isActive) {
          status = "offline";
        } else if (todayHours.startTime && todayHours.endTime) {
          const now = new Date();
          const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          const startTime = todayHours.startTime;
          const endTime = todayHours.endTime;

          if (currentTime >= startTime && currentTime <= endTime) {
            status = "available";
          } else {
            status = "offline";
          }
        }

        return {
          id: String(staffMember.id),
          name: staffMember.name || "ללא שם",
          initials: staffMember.initials || (staffMember.name ? staffMember.name.charAt(0).toUpperCase() : "ל"),
          role: staffMember.role || "",
          status: status,
          bookingsToday: 0,
          imageUrl: staffMember.profileImage || null,
          workingHours: workingHours,
        };
      });
  }, [staffFromStorage]);

  const ALL_STAFF_IDS = useMemo(() => {
    return STAFF_DAY_CALENDARS.map((s) => s.id);
  }, [STAFF_DAY_CALENDARS]);

  return { STAFF_DAY_CALENDARS, ALL_STAFF_IDS };
};

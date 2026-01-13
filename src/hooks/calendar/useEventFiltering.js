import { useMemo, useCallback } from "react";

export const useEventFiltering = (eventsList, selectedStaff, selectedTeamMembers) => {
  const filterEvents = useCallback((eventsList) => {
    const filtered = eventsList.filter((e) => {
      // Filter out cancelled appointments from view
      if (e.status === "בוטל") {
        return false;
      }

      if (selectedStaff === "all-business") {
        // Show all appointments, including unassigned (staff === null)
        return true;
      }
      if (selectedStaff === "scheduled-team") {
        // Check if staff has appointments in the events list
        // Include unassigned appointments (staff === null) in scheduled-team view
        if (e.staff === null || e.staff === undefined) {
          return true; // Show unassigned appointments
        }
        return eventsList.some(
          (appt) => appt.staff === e.staff && appt.status !== "בוטל"
        );
      }
      if (selectedStaff === "custom") {
        if (!selectedTeamMembers.length) {
          // If no team members selected, show unassigned appointments
          return e.staff === null || e.staff === undefined;
        }
        // Include unassigned appointments if they're in the selected team (or show all unassigned)
        if (e.staff === null || e.staff === undefined) {
          return true; // Show unassigned appointments in custom team view
        }
        return selectedTeamMembers.includes(e.staff);
      }
      // Specific staff selected - only show appointments for that staff
      // Unassigned appointments (staff === null) won't show in specific staff view
      return e.staff === selectedStaff;
    });

    if (import.meta.env.DEV) {
      const filteredOut = eventsList.filter((e) => {
        if (e.status === "בוטל") return true;
        if (selectedStaff === "all-business") return false;
        if (selectedStaff === "scheduled-team") {
          return !eventsList.some((appt) => appt.staff === e.staff && appt.status !== "בוטל");
        }
        if (selectedStaff === "custom") {
          if (!selectedTeamMembers.length) return true;
          return !selectedTeamMembers.includes(e.staff);
        }
        return e.staff !== selectedStaff;
      });

      // console.log("[CAL_APPTS_RENDER] 🎨 Filtering results:", {
      //   total: eventsList.length,
      //   visible: filtered.length,
      //   filteredOut: filteredOut.length,
      //   selectedStaff,
      //   sampleVisible: filtered.slice(0, 3).map((e) => ({
      //     id: e.id,
      //     date: e.date,
      //     start: e.start,
      //     end: e.end,
      //     staff: e.staff,
      //     status: e.status,
      //   })),
      // });
    }

    return filtered;
  }, [selectedStaff, selectedTeamMembers]);

  const filteredEvents = useMemo(() => {
    return filterEvents(eventsList);
  }, [eventsList, filterEvents]);

  return { filteredEvents, filterEvents };
};

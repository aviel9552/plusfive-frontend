/**
 * Hook for managing drag and drop functionality for appointments
 */

import { useState } from 'react';
import { checkTimeOverlap } from '../../utils/calendar/conflictDetection';
import { calculateEndTime, parseServiceDuration, parseTime } from '../../utils/calendar/timeHelpers';
import { formatDateLocal } from '../../utils/calendar/dateHelpers';

export const useDragAndDrop = (appointments, onUpdateAppointment) => {
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ 
    dateIso: null, 
    staffId: null, 
    y: 0, 
    time: null 
  });
  const [dragClickOffsetY, setDragClickOffsetY] = useState(0);
  const [activeDraggedAppointmentId, setActiveDraggedAppointmentId] = useState(null);
  
  /**
   * Handle drag start
   */
  const handleDragStart = (e, event, slotHeight) => {
    e.stopPropagation();
    setDraggedEvent(event);
    setActiveDraggedAppointmentId(event.id);
    
    // Calculate offset from mouse to appointment top
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY;
    const appointmentTop = rect.top;
    const offsetY = clickY - appointmentTop;
    setDragClickOffsetY(offsetY);
    
    // Calculate initial drag offset
    const startX = e.clientX;
    const startY = e.clientY;
    setDragOffset({ x: startX, y: startY });
  };
  
  /**
   * Handle drag end
   */
  const handleDragEnd = (e, allEvents, staffList, slotHeight) => {
    if (!draggedEvent || !dragPosition.dateIso || !dragPosition.staffId || !dragPosition.time) {
      // Reset drag state
      setDraggedEvent(null);
      setActiveDraggedAppointmentId(null);
      setDragOffset({ x: 0, y: 0 });
      setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
      setDragClickOffsetY(0);
      return;
    }
    
    const event = draggedEvent;
    const targetDateIso = dragPosition.dateIso;
    const targetTime = dragPosition.time;
    const targetStaff = staffList.find((s) => s.id === dragPosition.staffId);
    
    if (!targetStaff) {
      // Reset drag state
      setDraggedEvent(null);
      setActiveDraggedAppointmentId(null);
      setDragOffset({ x: 0, y: 0 });
      setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
      setDragClickOffsetY(0);
      return;
    }
    
    // Calculate end time based on service duration
    // Try to get duration from service, or calculate from existing times
    const selectedServiceObj = null; // TODO: Get from context or props
    let durationMinutes = 30; // Default
    
    if (selectedServiceObj?.duration) {
      durationMinutes = parseServiceDuration(selectedServiceObj.duration);
    } else {
      // Calculate from existing start/end times
      const oldStart = parseTime(event.start);
      const oldEnd = parseTime(event.end);
      durationMinutes = Math.round((oldEnd - oldStart) * 60);
    }
    
    const endTimeStr = calculateEndTime(targetTime, durationMinutes);
    
    // Check for overlaps with existing appointments (excluding the dragged event)
    const hasOverlap = checkTimeOverlap(
      allEvents, 
      targetDateIso, 
      targetStaff.id, 
      targetTime, 
      endTimeStr, 
      event.id
    );
    
    if (hasOverlap) {
      // Reset drag state
      setDraggedEvent(null);
      setActiveDraggedAppointmentId(null);
      setDragOffset({ x: 0, y: 0 });
      setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
      setDragClickOffsetY(0);
      
      // Return overlap flag - parent component should show modal
      return { hasOverlap: true };
    }
    
    // Update the appointment
    const staffObj = staffList.find((s) => s.id === targetStaff.id);
    const staffName = staffObj?.name || targetStaff.name;
    
    onUpdateAppointment(event.id, {
      date: targetDateIso,
      start: targetTime,
      end: endTimeStr,
      staff: targetStaff.id,
      staffName: staffName,
    });
    
    // Reset drag state
    setDraggedEvent(null);
    setActiveDraggedAppointmentId(null);
    setDragOffset({ x: 0, y: 0 });
    setDragPosition({ dateIso: null, staffId: null, y: 0, time: null });
    setDragClickOffsetY(0);
    
    return { hasOverlap: false };
  };
  
  return {
    // State
    draggedEvent,
    dragOffset,
    dragPosition,
    dragClickOffsetY,
    activeDraggedAppointmentId,
    
    // Setters
    setDragPosition,
    
    // Handlers
    handleDragStart,
    handleDragEnd,
  };
};


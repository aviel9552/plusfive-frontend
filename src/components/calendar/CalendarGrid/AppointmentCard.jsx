/**
 * Appointment Card Component
 * Draggable appointment card displayed on calendar
 */

import React from 'react';
import { BRAND_COLOR, SLOT_HEIGHT_MIN, SLOT_HEIGHT_MAX } from '../../../utils/calendar/constants';
import { parseTime, minutesToLabel } from '../../../utils/calendar/timeHelpers';
import { START_HOUR } from '../../../utils/calendar/constants';

export const AppointmentCard = ({
  event,
  slotHeight,
  isDragging = false,
  isHovered = false,
  top: topProp,
  height: heightProp,
  services = [],
  onDragStart,
  onDragEnd,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const eventStart = parseTime(event.start);
  const eventEnd = parseTime(event.end);
  // Use provided top/height if available (for drag preview), otherwise calculate
  const top = topProp !== undefined ? topProp : (eventStart - START_HOUR) * slotHeight;
  const duration = eventEnd - eventStart;
  const height = heightProp !== undefined ? heightProp : Math.max(duration * slotHeight - 2, 10);
  
  // Calculate dynamic font size based on slotHeight and appointment duration
  // Scale from 13px (min) to 22px (max) based on slotHeight - reduced by 2px from previous
  // Use linear interpolation for smooth scaling
  const fontSizeRatio = (slotHeight - SLOT_HEIGHT_MIN) / (SLOT_HEIGHT_MAX - SLOT_HEIGHT_MIN);
  const baseFontSize = 13; // Reduced by 2px from 15
  const maxFontSize = 22; // Reduced by 2px from 24
  let dynamicFontSize = baseFontSize + (maxFontSize - baseFontSize) * fontSizeRatio;
  
  // For very short appointments (5-10 minutes), reduce font size to ensure text fits
  const appointmentHeightPx = height;
  let padding = 'px-2 py-1.5'; // Default padding
  if (appointmentHeightPx < 20) {
    // Very short appointment (5 minutes) - use very small font and minimal padding
    dynamicFontSize = Math.min(dynamicFontSize, 9);
    padding = 'px-1.5 py-0.5';
  } else if (appointmentHeightPx < 30) {
    // Very short appointment - use smaller font
    dynamicFontSize = Math.min(dynamicFontSize, 10);
    padding = 'px-1.5 py-1';
  } else if (appointmentHeightPx < 40) {
    // Short appointment - use smaller font
    dynamicFontSize = Math.min(dynamicFontSize, 11);
    padding = 'px-2 py-1';
  } else if (appointmentHeightPx < 50) {
    // Medium-short appointment - use medium font
    dynamicFontSize = Math.min(dynamicFontSize, 12);
  }
  
  // Calculate font sizes for different text elements - all scale proportionally
  const clientFontSize = Math.round(dynamicFontSize + (appointmentHeightPx < 30 ? 0.5 : 1.5)); // Client name is always larger, but less for short appointments
  const timeFontSize = Math.round(dynamicFontSize); // Time uses base size
  const serviceFontSize = Math.round(dynamicFontSize); // Service uses base size
  
  // Use compact format for appointments of 30 minutes or less
  const useCompactFormat = duration <= 0.5; // 30 minutes = 0.5 hours

  // Get service color from services array
  const getServiceColor = () => {
    if (event.serviceId) {
      const service = services.find(s => s.id === event.serviceId || s.id === String(event.serviceId));
      if (service && service.color) {
        return service.color;
      }
    }
    // Fallback to event.color or brand color
    return event.color || BRAND_COLOR;
  };

  const serviceColor = getServiceColor();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute left-[1px] right-[1px] rounded-md ${padding} text-gray-900 dark:text-black overflow-visible z-0 ${
        isDragging ? "shadow-2xl cursor-grabbing" : "shadow-sm cursor-grab"
      }`}
      style={{
        top,
        height,
        backgroundColor: serviceColor,
        border: isDragging 
          ? `2px solid ${BRAND_COLOR}` 
          : isHovered
          ? `2px solid ${BRAND_COLOR}`
          : "1px solid rgba(0,0,0,0.04)",
        opacity: isDragging ? 0.8 : 1,
        fontSize: `${dynamicFontSize}px`,
      }}
    >
      <div className="h-full flex items-start justify-end text-right relative z-0" dir="rtl">
        {useCompactFormat ? (
          /* Single line format for appointments of 30 minutes or less: Client • Time • Service */
          <div className="flex items-center gap-1.5 truncate w-full" dir="rtl" style={{ fontSize: `${dynamicFontSize}px` }}>
            <span className="font-extrabold" style={{ fontSize: `${clientFontSize}px` }}>{event.client || event.clientName}</span>
            <span className="opacity-70">•</span>
            <span className="opacity-80" style={{ fontSize: `${timeFontSize}px` }}>{event.start}–{event.end}</span>
            <span className="opacity-70">•</span>
            <span className="truncate" style={{ fontSize: `${serviceFontSize}px` }}>
              {(() => {
                const serviceText = event.title || event.serviceName || '';
                // Remove client name and dash if present
                return serviceText.split(/[–-]/)[0].trim();
              })()}
            </span>
          </div>
        ) : (
          /* Three-row format for appointments longer than 30 minutes: Client, Time, Service */
          <div className="flex flex-col items-end text-right gap-1 w-full" dir="rtl">
            <div className="font-bold truncate w-full text-right" style={{ fontSize: `${clientFontSize}px` }}>{event.client || event.clientName}</div>
            <div className="opacity-80 text-right w-full" style={{ fontSize: `${timeFontSize}px` }}>
              {event.start}–{event.end}
            </div>
            <div className="truncate w-full text-right" style={{ fontSize: `${serviceFontSize}px` }}>
              {(() => {
                const serviceText = event.title || event.serviceName || '';
                // Remove client name and dash if present
                return serviceText.split(/[–-]/)[0].trim();
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


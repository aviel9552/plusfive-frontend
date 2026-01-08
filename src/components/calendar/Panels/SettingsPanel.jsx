/**
 * Settings Panel Component
 * Calendar zoom and display settings
 */

import React from 'react';
import { FiX } from 'react-icons/fi';
import { BRAND_COLOR, SLOT_HEIGHT_MIN, SLOT_HEIGHT_MAX } from '../../../utils/calendar/constants';

export const SettingsPanel = ({
  isOpen,
  onClose,
  slotHeight,
  appliedSlotHeight,
  setSlotHeight,
  setAppliedSlotHeight,
  applyZoom,
  resetZoom,
}) => {
  if (!isOpen) return null;

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
          onClose();
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
          className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
          onClick={() => {
            setSlotHeight(appliedSlotHeight);
            onClose();
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
                step={5}
                value={slotHeight}
                onChange={(e) => setSlotHeight(Number(e.target.value))}
                onInput={(e) => setSlotHeight(Number(e.target.value))}
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
            className="w-full h-[48px] rounded-full text-md font-semibold flex items-center justify-center bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
            onClick={() => {
              setAppliedSlotHeight(slotHeight);
              onClose();
            }}
          >
            החל
          </button>
        </div>
      </div>
    </div>
  );
};


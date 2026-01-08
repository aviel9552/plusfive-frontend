/**
 * Conflict Modal Component
 * Shown when creating recurring appointments causes overlap
 */

import React from 'react';
import { FiX } from 'react-icons/fi';
import { BRAND_COLOR } from '../../../utils/calendar/constants';

export const ConflictModal = ({ 
  isOpen, 
  conflictingAppointment, 
  onClose 
}) => {
  if (!isOpen || !conflictingAppointment) return null;

  return (
    <>
      <style>{`
        .apply-button-gradient {
          background: #000000 !important;
          background-size: auto !important;
          animation: none !important;
        }
        html.dark .apply-button-gradient {
          background: linear-gradient(315deg, #FF257C 0%, #FF257C 25%, #FF257C 50%, #FF8FC0 75%, #FFE7F3 100%) !important;
          background-size: 130% 130% !important;
          animation: gentleGradientShift 10s ease-in-out infinite !important;
        }
        @keyframes gentleGradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 30% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={(e) => {
        // Only close if clicking directly on the backdrop (not on modal content)
        if (e.target === e.currentTarget) {
          e.stopPropagation(); // Prevent event from bubbling to parent elements
          e.preventDefault(); // Prevent default behavior
          onClose();
        }
      }}
      onMouseDown={(e) => {
        // Prevent mousedown from reaching elements below
        if (e.target === e.currentTarget) {
          e.stopPropagation();
        }
      }}
    >
      <div
        className="relative w-[90%] max-w-sm rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder p-6 shadow-2xl"
        style={{
          boxShadow: "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
        }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close button */}
        <button
          className="absolute -left-10 top-6 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
          onClick={onClose}
        >
          <FiX className="text-[20px]" />
        </button>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          <span className="text-red-600 dark:text-red-400">התנגשות תורים!</span>
        </h3>

        {/* Message */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
          {conflictingAppointment.reason === "non-working-day" ? (
            <>
              <p className="mb-2">
                העסק לא פעיל בתאריך:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(conflictingAppointment.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
              </p>
            </>
          ) : conflictingAppointment.reason === "staff-not-working" ? (
            <>
              <p className="mb-2">
                {conflictingAppointment.client} בתאריך:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(conflictingAppointment.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </>
          ) : (
            <>
              <p className="mb-2">
                יש תור שמתנגש עם התור שאתה רוצה לקבוע ב:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {conflictingAppointment.client} • {new Date(conflictingAppointment.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })} • {conflictingAppointment.time}
              </p>
            </>
          )}
        </div>

        {/* Button */}
        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            className="flex-1 px-8 py-3 rounded-full text-sm font-semibold text-white hover:opacity-90 transition apply-button-gradient"
            onClick={onClose}
          >
            חזרה ליומן
          </button>
        </div>
      </div>
    </div>
    </>
  );
};


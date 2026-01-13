/**
 * NewClientModal Component
 * Modal for creating a new client
 */

import React from "react";
import { FiX } from "react-icons/fi";
import { BRAND_COLOR } from "../../../utils/calendar/constants";

export const NewClientModal = ({
  isOpen,
  onClose,
  newClientName,
  newClientPhone,
  newClientEmail,
  newClientCity,
  newClientAddress,
  newClientErrors,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onCityChange,
  onAddressChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" dir="ltr">
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
      
      {/* קליק על הרקע – סוגר את הכרטיס */}
      <div className="flex-1 bg-black/0" onClick={onClose} />

      {/* הפאנל עצמו */}
      <div
        dir="rtl"
        className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
                 border-l border-gray-200 dark:border-commonBorder shadow-2xl
                 flex flex-col calendar-slide-in text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
          onClick={onClose}
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
                onChange={(e) => onNameChange(e.target.value)}
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
                  onPhoneChange(value);
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
              <div className="flex items-center justify-between">
                <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                  אימייל <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                type="email"
                value={newClientEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="client@example.com"
                dir="rtl"
                className={`w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border ${
                  newClientErrors.email
                    ? "border-red-400 dark:border-red-500"
                    : "border-gray-200 dark:border-[#262626]"
                } text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right`}
              />
              {newClientErrors.email && (
                <p className="text-[11px] text-red-500">
                  {newClientErrors.email}
                </p>
              )}
            </div>

            {/* City */}
            <div className="space-y-3">
              <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                עיר
              </label>
              <input
                type="text"
                value={newClientCity}
                onChange={(e) => onCityChange(e.target.value)}
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
                onChange={(e) => onAddressChange?.(e.target.value)}
                placeholder="רחוב, מספר וכו'"
                dir="rtl"
                className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
              />
            </div>
          </div>
          
          {/* Submit Error */}
          {newClientErrors.submit && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {newClientErrors.submit}
              </p>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
          <button
            type="button"
            className="w-full h-[44px] rounded-full text-medium font-semibold flex items-center justify-center bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
            onClick={onSubmit}
          >
            הוסף לקוח
          </button>
        </div>
      </div>
    </div>
  );
};


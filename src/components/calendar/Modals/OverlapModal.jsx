/**
 * Overlap Modal Component
 * Shown when drag & drop causes overlap
 */

import React from 'react';
import { FiX } from 'react-icons/fi';
import { BRAND_COLOR } from '../../../utils/calendar/constants';

export const OverlapModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute -left-10 top-6 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
          onClick={onClose}
        >
          <FiX className="text-[20px]" />
        </button>

        {/* Modal container */}
        <div className="w-[90vw] max-w-xs rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-2xl p-3 sm:p-4" dir="rtl">
          {/* Message with warning icon */}
          <div className="py-6 text-center">
            {/* Headline with warning icon */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                התנגשות תורים!
              </p>
            </div>
            {/* Explanation */}
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              לא ניתן להזיז את התור למיקום זה כי יש תור אחר באותה שעה.
            </p>
          </div>

          {/* Button - centered */}
          <div className="flex items-center justify-center mt-4">
            <button
              className="px-8 py-2 rounded-full text-xs sm:text-sm font-semibold text-white"
              style={{ backgroundColor: BRAND_COLOR }}
              onClick={onClose}
            >
              הבנתי
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


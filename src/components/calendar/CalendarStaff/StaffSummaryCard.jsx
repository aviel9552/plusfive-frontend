/**
 * StaffSummaryCard - Summary card component for staff members
 * Displays staff details, services, working hours, and advanced data
 */

import React, { useState, useRef, useEffect } from "react";
import {
  FiPhone, FiEdit, FiX, FiUpload, FiMail, FiUser, FiMapPin, FiHome, FiCheckCircle,
  FiCalendar, FiChevronDown, FiClock, FiSave
} from "react-icons/fi";
import { FaStar, FaPhoneAlt } from "react-icons/fa";
import { formatPhoneForDisplay, formatPhoneForBackend, formatPhoneToWhatsapp } from "../../../utils/phoneHelpers";
import { useTheme } from "../../../context/ThemeContext";
import { BRAND_COLOR } from "../../../utils/calendar/constants";
import gradientImage from "../../../assets/gradientteam.jpg";
import whatsappDarkIcon from "../../../assets/whatsappDark.svg";
import whatsappLightIcon from "../../../assets/whatsappLight.svg";
import { DEMO_SERVICES } from "../../../data/calendar/demoData";

// Constants
const DURATION_OPTIONS = [
  "10 דק'", "15 דק'", "20 דק'", "25 דק'", "30 דק'", "35 דק'", "40 דק'",
  "45 דק'", "50 דק'", "55 דק'",
  "שעה",
  "שעה ו-5 דק'", "שעה ו-10 דק'", "שעה ו-15 דק'", "שעה ו-20 דק'", "שעה ו-25 דק'", "שעה ו-30 דק'", "שעה ו-35 דק'", "שעה ו-40 דק'", "שעה ו-45 דק'", "שעה ו-50 דק'", "שעה ו-55 דק'",
  "שעתיים"
];

const TIME_OPTIONS = (() => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      times.push(`${hourStr}:${minuteStr}`);
    }
  }
  return times;
})();

const DAYS_OF_WEEK = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];

export const StaffSummaryCard = ({
  staffMember,
  isOpen,
  onClose,
  onUpdateStaff,
  onUpdateStaffStatus,
  onProfileImageUpload,
  onUpdateServiceField,
  onToggleStaffService,
  onUpdateWorkingHours,
  onToggleWorkingHoursDay,
  getStaffServiceData,
  formatDate,
  hasActiveSubscription = false,
  subscriptionLoading = false,
  staffList = [], // For updating the staff member in the list
  onStaffListUpdate = () => {}, // Callback to update staff list
  storageKey = "calendar_staff", // For localStorage updates
  initialTab = "details", // Initial tab to show when opening
}) => {
  const { isDarkMode } = useTheme();
  const [staffViewTab, setStaffViewTab] = useState(initialTab);
  const [editedStaffData, setEditedStaffData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: ""
  });
  const profileImageInputRef = useRef(null);
  const priceInputRef = useRef(null);
  const [editingField, setEditingField] = useState(null);
  const [isStaffCardStatusDropdownOpen, setIsStaffCardStatusDropdownOpen] = useState(false);
  const [editingServiceField, setEditingServiceField] = useState(null);
  const [openDurationDropdowns, setOpenDurationDropdowns] = useState({});
  const [openWorkingHoursDropdowns, setOpenWorkingHoursDropdowns] = useState({});
  const prevStaffMemberIdRef = useRef(null);

  // Update edited data when staff member changes
  useEffect(() => {
    if (staffMember) {
      setEditedStaffData({
        name: staffMember.name || "",
        phone: staffMember.phone || "",
        email: staffMember.email || "",
        city: staffMember.city || "",
        address: staffMember.address || ""
      });
      setEditingField(null);
      // Only reset to initialTab when opening a NEW staff popup (different staff member)
      if (!prevStaffMemberIdRef.current || staffMember.id !== prevStaffMemberIdRef.current) {
        setStaffViewTab(initialTab);
      }
      prevStaffMemberIdRef.current = staffMember.id;
    } else {
      prevStaffMemberIdRef.current = null;
    }
  }, [staffMember, initialTab]);

  // Handle click outside for price input
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingServiceField && editingServiceField.startsWith('price-') && priceInputRef.current && !priceInputRef.current.contains(event.target)) {
        // Close editing mode when clicking outside
        setEditingServiceField(null);
      }
    };

    if (editingServiceField && editingServiceField.startsWith('price-')) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingServiceField]);

  // Save edited field
  const handleSaveField = async (fieldName) => {
    if (!staffMember) return;

    try {
      const updateData = {};

      if (fieldName === "name") {
        updateData.fullName = editedStaffData.name;
      } else if (fieldName === "phone") {
        updateData.phone = formatPhoneForBackend(editedStaffData.phone);
      } else if (fieldName === "email") {
        updateData.email = editedStaffData.email || null;
      } else if (fieldName === "city") {
        updateData.city = editedStaffData.city || null;
      } else if (fieldName === "address") {
        updateData.address = editedStaffData.address || null;
      }

      // Update via callback
      await onUpdateStaff(staffMember.id, updateData);

      setEditingField(null);
    } catch (error) {
      console.error("Error updating staff:", error);
      alert(error.message || "שגיאה בעדכון איש צוות. נסה שוב.");
    }
  };

  // Cancel editing field
  const handleCancelEditField = (fieldName) => {
    if (staffMember) {
      if (fieldName === "name") {
        setEditedStaffData({ ...editedStaffData, name: staffMember.name || "" });
      } else if (fieldName === "phone") {
        setEditedStaffData({ ...editedStaffData, phone: staffMember.phone || "" });
      } else if (fieldName === "email") {
        setEditedStaffData({ ...editedStaffData, email: staffMember.email || "" });
      } else if (fieldName === "city") {
        setEditedStaffData({ ...editedStaffData, city: staffMember.city || "" });
      } else if (fieldName === "address") {
        setEditedStaffData({ ...editedStaffData, address: staffMember.address || "" });
      }
    }
    setEditingField(null);
  };

  // Handle profile image upload
  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !staffMember) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('אנא בחר קובץ תמונה');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('גודל הקובץ גדול מדי. מקסימום 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      onProfileImageUpload(staffMember.id, base64String);
    };
    reader.onerror = () => {
      alert('שגיאה בקריאת הקובץ');
    };
    reader.readAsDataURL(file);
  };

  // Handle update service field
  const handleUpdateServiceField = (serviceId, field, value, shouldCloseEditing = true) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי לערוך שירותים. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    onUpdateServiceField(staffMember.id, serviceId, field, value, shouldCloseEditing);

    // Close editing mode only if shouldCloseEditing is true
    if (shouldCloseEditing) {
      setEditingServiceField(null);
      setOpenDurationDropdowns(prev => {
        const newState = { ...prev };
        delete newState[serviceId];
        return newState;
      });
    }
  };

  if (!isOpen || !staffMember) return null;

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

      <div
        dir="rtl"
        className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
             border-l border-gray-200 dark:border-commonBorder shadow-2xl
             flex flex-col calendar-slide-in text-right"
        onClick={(e) => {
          e.stopPropagation();
          // If clicking on the card itself (not on input, button, etc.) and there's an active edit, save it
          if (editingField && !e.target.closest('input') && !e.target.closest('button') && !e.target.closest('[role="button"]')) {
            handleSaveField(editingField);
          }
        }}
      >
        {/* X מחוץ לפופ בצד שמאל למעלה */}
        <button
          className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
          onClick={onClose}
        >
          <FiX className="text-[16px]" />
        </button>

        {/* HEADER */}
        <div className="px-5 py-7 min-h-[125px] relative overflow-visible">
          {/* Background image */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              backgroundImage: `url(${gradientImage})`,
              backgroundSize: 'cover',
              backgroundPosition: '40% 16%',
              backgroundRepeat: 'no-repeat',
              transform: 'scaleX(-1)',
            }}
          />
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 text-sm text-gray-800 dark:text-gray-100">
          <div className="space-y-6">
            {/* Staff Information */}
            <div className="space-y-4">
              {/* Avatar and Name */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-black text-white overflow-hidden"
                  >
                    {staffMember?.profileImage ? (
                      <img
                        src={staffMember.profileImage}
                        alt={staffMember?.name || "איש צוות"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      staffMember?.initials || staffMember?.name?.charAt(0)?.toUpperCase() || "ל"
                    )}
                  </div>
                  <input
                    ref={profileImageInputRef}
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageUpload}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--brand-color,#7C3AED)] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-lg z-10"
                    style={{ backgroundColor: BRAND_COLOR }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (profileImageInputRef.current) {
                        profileImageInputRef.current.click();
                      }
                    }}
                  >
                    <FiUpload className="text-white text-xs" size={12} />
                  </button>
                </div>
                <div className="flex-1 flex flex-col relative">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1.5">
                    {staffMember?.name || "ללא שם"}
                  </div>
                  {staffMember?.phone && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-white">
                        {formatPhoneForDisplay(staffMember.phone)}
                      </span>
                      <button
                        type="button"
                        className="inline-block hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
                        title="התקשר"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${staffMember.phone}`;
                        }}
                      >
                        <FaPhoneAlt className="w-5 h-5 text-gray-600 dark:text-white" />
                      </button>
                      <button
                        type="button"
                        className="inline-block hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
                        title="פתח שיחה ב-WhatsApp"
                        onClick={(e) => {
                          e.stopPropagation();
                          const whatsappUrl = formatPhoneToWhatsapp(staffMember.phone);
                          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <img
                          src={isDarkMode ? whatsappLightIcon : whatsappDarkIcon}
                          alt="WhatsApp"
                          className="w-6 h-6"
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* קטגוריות תצוגה */}
              <div className="border-b border-gray-200 dark:border-[#262626] mb-4 mt-4">
                <div className="flex items-center gap-6 text-xs sm:text-sm px-2">
                  {[
                    { key: "details", label: "פרטים" },
                    { key: "services", label: "שירותים" },
                    { key: "hours", label: "שעות פעילות" },
                    { key: "advanced", label: "נתונים מתקדמים" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={(e) => {
                        e.stopPropagation();
                        setStaffViewTab(key);
                      }}
                      className={`relative pb-3 pt-1 font-medium transition-colors ${staffViewTab === key
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-white"
                        }`}
                    >
                      {label}
                      {staffViewTab === key && (
                        <span
                          className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                          style={{ backgroundColor: BRAND_COLOR }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Staff Details Tab */}
              {staffViewTab === "details" && (
                <div className="space-y-4 mt-6">
                  {/* שם מלא */}
                  <div
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={(e) => {
                      if (editingField !== "name") {
                        e.stopPropagation();
                        setEditingField("name");
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                      <FiUser className="text-gray-600 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-white mb-1">שם מלא</div>
                      {editingField === "name" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editedStaffData.name}
                            onChange={(e) => setEditedStaffData({ ...editedStaffData, name: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.stopPropagation();
                                handleSaveField("name");
                              }
                            }}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveField("name");
                            }}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                            style={{ backgroundColor: BRAND_COLOR }}
                          >
                            <FiSave className="text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditField("name");
                            }}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {staffMember?.name || "-"}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingField("name");
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                          >
                            <FiEdit className="text-xs" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* טלפון */}
                  <div
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={(e) => {
                      if (editingField !== "phone") {
                        e.stopPropagation();
                        setEditingField("phone");
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                      <FiPhone className="text-gray-600 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-white mb-1">טלפון</div>
                      {editingField === "phone" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="tel"
                            value={editedStaffData.phone}
                            onChange={(e) => setEditedStaffData({ ...editedStaffData, phone: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.stopPropagation();
                                handleSaveField("phone");
                              }
                            }}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            placeholder="05X-XXXXXXX"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveField("phone");
                            }}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                            style={{ backgroundColor: BRAND_COLOR }}
                          >
                            <FiSave className="text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditField("phone");
                            }}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {staffMember?.phone ? formatPhoneForDisplay(staffMember.phone) : "-"}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingField("phone");
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                          >
                            <FiEdit className="text-xs" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* אימייל */}
                  <div
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={(e) => {
                      if (editingField !== "email") {
                        e.stopPropagation();
                        setEditingField("email");
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                      <FiMail className="text-gray-600 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-white mb-1">אימייל</div>
                      {editingField === "email" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            value={editedStaffData.email}
                            onChange={(e) => setEditedStaffData({ ...editedStaffData, email: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.stopPropagation();
                                handleSaveField("email");
                              }
                            }}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            placeholder="example@email.com"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveField("email");
                            }}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                            style={{ backgroundColor: BRAND_COLOR }}
                          >
                            <FiSave className="text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditField("email");
                            }}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {staffMember?.email || "-"}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingField("email");
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                          >
                            <FiEdit className="text-xs" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* עיר */}
                  <div
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={(e) => {
                      if (editingField !== "city") {
                        e.stopPropagation();
                        setEditingField("city");
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                      <FiMapPin className="text-gray-600 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-white mb-1">עיר</div>
                      {editingField === "city" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editedStaffData.city}
                            onChange={(e) => setEditedStaffData({ ...editedStaffData, city: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.stopPropagation();
                                handleSaveField("city");
                              }
                            }}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            placeholder="תל אביב"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveField("city");
                            }}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                            style={{ backgroundColor: BRAND_COLOR }}
                          >
                            <FiSave className="text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditField("city");
                            }}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {staffMember?.city || "-"}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingField("city");
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                          >
                            <FiEdit className="text-xs" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* כתובת */}
                  <div
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={(e) => {
                      if (editingField !== "address") {
                        e.stopPropagation();
                        setEditingField("address");
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                      <FiHome className="text-gray-600 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-white mb-1">כתובת</div>
                      {editingField === "address" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editedStaffData.address}
                            onChange={(e) => setEditedStaffData({ ...editedStaffData, address: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.stopPropagation();
                                handleSaveField("address");
                              }
                            }}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            placeholder="רחוב ושם רחוב 123"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveField("address");
                            }}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                            style={{ backgroundColor: BRAND_COLOR }}
                          >
                            <FiSave className="text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditField("address");
                            }}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {staffMember?.address || "-"}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingField("address");
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                          >
                            <FiEdit className="text-xs" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* סטטוס */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                      <FiCheckCircle className="text-gray-600 dark:text-white" />
                    </div>
                    <div className="flex-1 relative">
                      <div className="text-xs text-gray-500 dark:text-white mb-1">סטטוס</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsStaffCardStatusDropdownOpen((prev) => !prev);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition ${(staffMember?.status || "פעיל") === "לא פעיל"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : ""
                          }`}
                        style={
                          (staffMember?.status || "פעיל") === "פעיל"
                            ? {
                              backgroundColor: BRAND_COLOR,
                              color: "white"
                            }
                            : {}
                        }
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${(staffMember?.status || "פעיל") === "פעיל"
                            ? "bg-white animate-pulse"
                            : "bg-white dark:bg-black"
                          }`}></span>
                        <span>{staffMember?.status || "פעיל"}</span>
                        <FiChevronDown className="text-[10px]" />
                      </button>

                      {isStaffCardStatusDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setIsStaffCardStatusDropdownOpen(false)}
                          />
                          <div
                            dir="rtl"
                            className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                          >
                            <div className="py-2">
                              {/* פעיל */}
                              <button
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStaffStatus(staffMember.id, "פעיל");
                                  setIsStaffCardStatusDropdownOpen(false);
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${(staffMember?.status || "פעיל") === "פעיל"
                                        ? "border-[rgba(255,37,124,1)]"
                                        : "border-gray-300 dark:border-gray-500"
                                      }`}
                                  >
                                    {(staffMember?.status || "פעיל") === "פעיל" && (
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: BRAND_COLOR }}
                                      />
                                    )}
                                  </span>
                                  <span>פעיל</span>
                                </span>
                              </button>

                              {/* לא פעיל */}
                              <button
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStaffStatus(staffMember.id, "לא פעיל");
                                  setIsStaffCardStatusDropdownOpen(false);
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${(staffMember?.status || "פעיל") === "לא פעיל"
                                        ? "border-gray-500"
                                        : "border-gray-300 dark:border-gray-500"
                                      }`}
                                  >
                                    {(staffMember?.status || "פעיל") === "לא פעיל" && (
                                      <span
                                        className="w-2 h-2 rounded-full bg-gray-500"
                                      />
                                    )}
                                  </span>
                                  <span>לא פעיל</span>
                                </span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* דירוג */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                      <FaStar className="text-gray-600 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-white mb-1">דירוג</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {staffMember?.rating || "-"}
                      </div>
                    </div>
                  </div>

                  {/* תאריך יצירה */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                      <FiCalendar className="text-gray-600 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-white mb-1">תאריך יצירה</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {staffMember?.createdAt
                          ? formatDate(new Date(staffMember.createdAt))
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Services Tab */}
              {staffViewTab === "services" && (
                <div className="space-y-4 mt-6">
                  {/* Headers */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#2b2b2b] mb-2">
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div className="text-[15px] font-semibold text-gray-700 dark:text-white">
                        שם שירות
                      </div>
                      <div className="text-[15px] font-semibold text-gray-700 dark:text-white">
                        משך שירות
                      </div>
                      <div className="text-[15px] font-semibold text-gray-700 dark:text-white">
                        מחיר
                      </div>
                      <div className="text-[15px] font-semibold text-gray-700 dark:text-white text-center">
                        פעיל / לא פעיל
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {DEMO_SERVICES.map((service) => {
                      const staffServices = staffMember?.services || [];
                      const isServiceEnabled = staffServices.some(s =>
                        typeof s === 'object' ? s.id === service.id : s === service.id
                      );
                      const serviceData = getStaffServiceData(staffMember?.id, service.id);
                      const currentDuration = serviceData?.duration || service.duration;
                      const currentPrice = serviceData?.price || service.price;
                      const isEditingDuration = editingServiceField === `duration-${service.id}`;
                      const isEditingPrice = editingServiceField === `price-${service.id}`;
                      const isDurationDropdownOpen = openDurationDropdowns[service.id];

                      return (
                        <div
                          key={service.id}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                            {/* שם שירות */}
                            <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                              {service.name}
                            </div>

                            {/* משך שירות */}
                            <div className="text-sm">
                              <div className="relative">
                                {isEditingDuration ? (
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDurationDropdowns(prev => ({
                                          ...prev,
                                          [service.id]: !prev[service.id]
                                        }));
                                      }}
                                      className="flex items-center gap-1 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                      <FiClock className="text-[14px]" />
                                      <span>{currentDuration}</span>
                                      <FiChevronDown className="text-[12px]" />
                                    </button>

                                    {isDurationDropdownOpen && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-20"
                                          onClick={() => {
                                            setOpenDurationDropdowns(prev => ({
                                              ...prev,
                                              [service.id]: false
                                            }));
                                          }}
                                        />
                                        <div
                                          dir="rtl"
                                          className="absolute right-0 mt-2 w-32 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-sm text-gray-800 dark:text-gray-100 text-right"
                                        >
                                          <div className="py-2">
                                            {DURATION_OPTIONS.map((duration) => (
                                              <button
                                                key={duration}
                                                type="button"
                                                className={`w-full flex items-center justify-between px-3 py-2 ${currentDuration === duration
                                                    ? ""
                                                    : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                                  } transition`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUpdateServiceField(service.id, 'duration', duration);
                                                }}
                                              >
                                                <span className="flex items-center gap-2">
                                                  <span
                                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${currentDuration === duration
                                                        ? "border-[rgba(255,37,124,1)]"
                                                        : "border-gray-300 dark:border-gray-500"
                                                      }`}
                                                  >
                                                    {currentDuration === duration && (
                                                      <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: BRAND_COLOR }}
                                                      />
                                                    )}
                                                  </span>
                                                  <span>{duration}</span>
                                                </span>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingServiceField(`duration-${service.id}`);
                                      setOpenDurationDropdowns(prev => ({
                                        ...prev,
                                        [service.id]: true
                                      }));
                                    }}
                                    className="flex items-center gap-1 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                                  >
                                    <FiClock className="text-[12px]" />
                                    <span>{currentDuration}</span>
                                    <FiEdit className="text-[10px] opacity-0 group-hover:opacity-100" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* מחיר השירות */}
                            <div className="text-sm">
                              {isEditingPrice ? (
                                <input
                                  ref={priceInputRef}
                                  type="text"
                                  value={currentPrice}
                                  onChange={(e) => {
                                    let value = e.target.value;

                                    // Remove all non-digit characters except ₪
                                    const shekelSymbol = '₪';
                                    const digitsOnly = value.replace(/[^\d₪]/g, '');

                                    // Always ensure ₪ is present at the start
                                    if (!digitsOnly.startsWith(shekelSymbol)) {
                                      // If user deleted ₪, add it back
                                      if (digitsOnly.length > 0 && !digitsOnly.includes(shekelSymbol)) {
                                        value = shekelSymbol + digitsOnly.replace(/₪/g, '');
                                      } else if (digitsOnly.length === 0) {
                                        value = shekelSymbol;
                                      } else {
                                        // Remove ₪ from middle/end and put at start
                                        const digits = digitsOnly.replace(/₪/g, '');
                                        value = shekelSymbol + digits;
                                      }
                                    } else {
                                      // Remove any ₪ symbols that are not at the start
                                      const digits = digitsOnly.replace(/₪/g, '');
                                      value = shekelSymbol + digits;
                                    }

                                    // Update without closing editing mode
                                    handleUpdateServiceField(service.id, 'price', value, false);
                                  }}
                                  onKeyDown={(e) => {
                                    // Allow: digits, backspace, delete, arrow keys, enter, escape, tab
                                    const allowedKeys = [
                                      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
                                      'ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab',
                                      'Home', 'End'
                                    ];

                                    // Allow digits (0-9)
                                    const isDigit = /^\d$/.test(e.key);

                                    // Allow control keys (Ctrl, Alt, Meta)
                                    const isControlKey = e.ctrlKey || e.altKey || e.metaKey;

                                    // Allow copy/paste shortcuts
                                    if (isControlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x')) {
                                      return;
                                    }

                                    // Block if not allowed
                                    if (!isDigit && !allowedKeys.includes(e.key) && !isControlKey) {
                                      e.preventDefault();
                                      return;
                                    }

                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      // Ensure ₪ is present and at least one digit exists
                                      let value = currentPrice;
                                      if (!value.startsWith('₪')) {
                                        value = '₪' + value.replace(/₪/g, '');
                                      }

                                      // Check if there's at least one digit
                                      const digits = value.replace(/[^\d]/g, '');
                                      if (digits.length === 0) {
                                        // Don't close if no digits - keep editing mode open
                                        return;
                                      }

                                      handleUpdateServiceField(service.id, 'price', value, false);
                                      setEditingServiceField(null);
                                    }

                                    if (e.key === 'Escape') {
                                      // Escape always closes, even without validation
                                      setEditingServiceField(null);
                                    }
                                  }}
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    const pastedText = e.clipboardData.getData('text');
                                    // Extract only digits from pasted text
                                    const digits = pastedText.replace(/\D/g, '');
                                    if (digits && digits.length > 0) {
                                      const value = '₪' + digits;
                                      handleUpdateServiceField(service.id, 'price', value, false);
                                    }
                                  }}
                                  className="px-2 py-1 rounded-full border border-gray-200 dark:border-commonBorder text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,1)] focus:border-[rgba(255,37,124,1)] transition-colors w-auto max-w-[100px] price-input-container"
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                />
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingServiceField(`price-${service.id}`);
                                  }}
                                  className="px-2 py-1 rounded-full border border-gray-200 dark:border-commonBorder text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors w-auto max-w-[100px]"
                                >
                                  {currentPrice}
                                </button>
                              )}
                            </div>

                            {/* פעיל */}
                            <div className="flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleStaffService(staffMember.id, service.id);
                                }}
                                className="flex items-center justify-center"
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isServiceEnabled
                                      ? "border-[rgba(255,37,124,1)]"
                                      : "border-gray-300 dark:border-gray-500"
                                    }`}
                                >
                                  {isServiceEnabled && (
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: BRAND_COLOR }}
                                    />
                                  )}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Working Hours Tab */}
              {staffViewTab === "hours" && (
                <div className="space-y-4 mt-6">
                  {/* Headers */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#2b2b2b] mb-2">
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div className="text-[15px] font-semibold text-gray-700 dark:text-white">
                        יום
                      </div>
                      <div className="text-[15px] font-semibold text-gray-700 dark:text-white">
                        התחלה
                      </div>
                      <div className="text-[15px] font-semibold text-gray-700 dark:text-white">
                        סיום
                      </div>
                      <div className="text-[15px] font-semibold text-gray-700 dark:text-white text-center">
                        פעיל / לא פעיל
                      </div>
                    </div>
                  </div>

                  {/* Days Rows */}
                  <div className="space-y-2">
                    {DAYS_OF_WEEK.map((day, dayIndex) => {
                      const workingHours = staffMember?.workingHours || {};
                      const dayData = workingHours[day] || {};
                      const startTime = dayData.startTime || '09:00';
                      const endTime = dayData.endTime || '17:00';
                      const isActive = dayData.active !== false; // Default to true
                      const isStartDropdownOpen = openWorkingHoursDropdowns[`start-${dayIndex}`];
                      const isEndDropdownOpen = openWorkingHoursDropdowns[`end-${dayIndex}`];

                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                            {/* יום */}
                            <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                              {day}
                            </div>

                            {/* התחלה */}
                            <div className="text-sm">
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenWorkingHoursDropdowns(prev => ({
                                      ...prev,
                                      [`start-${dayIndex}`]: !prev[`start-${dayIndex}`]
                                    }));
                                  }}
                                  className="flex items-center gap-1 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  <FiClock className="text-[14px]" />
                                  <span>{startTime}</span>
                                  <FiChevronDown className="text-[12px]" />
                                </button>

                                {isStartDropdownOpen && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-20"
                                      onClick={() => {
                                        setOpenWorkingHoursDropdowns(prev => ({
                                          ...prev,
                                          [`start-${dayIndex}`]: false
                                        }));
                                      }}
                                    />
                                    <div
                                      dir="rtl"
                                      className="absolute right-0 mt-2 w-32 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-sm text-gray-800 dark:text-gray-100 text-right max-h-60 overflow-y-auto"
                                    >
                                      <div className="py-2">
                                        {TIME_OPTIONS.map((time) => (
                                          <button
                                            key={time}
                                            type="button"
                                            className={`w-full flex items-center justify-between px-3 py-2 ${startTime === time
                                                ? ""
                                                : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                              } transition`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onUpdateWorkingHours(staffMember.id, dayIndex, 'startTime', time);
                                            }}
                                          >
                                            <span className="flex items-center gap-2">
                                              <span
                                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${startTime === time
                                                    ? "border-[rgba(255,37,124,1)]"
                                                    : "border-gray-300 dark:border-gray-500"
                                                  }`}
                                              >
                                                {startTime === time && (
                                                  <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: BRAND_COLOR }}
                                                  />
                                                )}
                                              </span>
                                              <span>{time}</span>
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* סיום */}
                            <div className="text-sm">
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenWorkingHoursDropdowns(prev => ({
                                      ...prev,
                                      [`end-${dayIndex}`]: !prev[`end-${dayIndex}`]
                                    }));
                                  }}
                                  className="flex items-center gap-1 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  <FiClock className="text-[14px]" />
                                  <span>{endTime}</span>
                                  <FiChevronDown className="text-[12px]" />
                                </button>

                                {isEndDropdownOpen && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-20"
                                      onClick={() => {
                                        setOpenWorkingHoursDropdowns(prev => ({
                                          ...prev,
                                          [`end-${dayIndex}`]: false
                                        }));
                                      }}
                                    />
                                    <div
                                      dir="rtl"
                                      className="absolute right-0 mt-2 w-32 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-sm text-gray-800 dark:text-gray-100 text-right max-h-60 overflow-y-auto"
                                    >
                                      <div className="py-2">
                                        {TIME_OPTIONS.map((time) => (
                                          <button
                                            key={time}
                                            type="button"
                                            className={`w-full flex items-center justify-between px-3 py-2 ${endTime === time
                                                ? ""
                                                : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                              } transition`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onUpdateWorkingHours(staffMember.id, dayIndex, 'endTime', time);
                                            }}
                                          >
                                            <span className="flex items-center gap-2">
                                              <span
                                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${endTime === time
                                                    ? "border-[rgba(255,37,124,1)]"
                                                    : "border-gray-300 dark:border-gray-500"
                                                  }`}
                                              >
                                                {endTime === time && (
                                                  <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: BRAND_COLOR }}
                                                  />
                                                )}
                                              </span>
                                              <span>{time}</span>
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* פעיל / לא פעיל */}
                            <div className="flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleWorkingHoursDay(staffMember.id, dayIndex);
                                }}
                                className="flex items-center justify-center"
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isActive
                                      ? "border-[rgba(255,37,124,1)]"
                                      : "border-gray-300 dark:border-gray-500"
                                    }`}
                                >
                                  {isActive && (
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: BRAND_COLOR }}
                                    />
                                  )}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Advanced Data Tab */}
              {staffViewTab === "advanced" && (
                <div className="space-y-4 mt-6">
                  <div className="text-sm text-gray-600 dark:text-white">
                    נתונים מתקדמים
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

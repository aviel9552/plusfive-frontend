/**
 * BusinessProfileCard - Business profile card component
 * Similar UI to ClientSummaryCard, opens from the right side
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  FiPhone, FiEdit, FiX, FiMail, FiUser, FiMapPin, FiHome, FiSave, FiClock, FiLock, FiChevronDown, FiTrash2, FiDownload
} from "react-icons/fi";
import { FaRegTrashAlt } from 'react-icons/fa';
import { MdQrCode2 } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, logoutUser } from '../../redux/actions/authActions';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import { getAccountSettingTranslations, getValidationTranslations } from '../../utils/translations';
import { formatPhoneForDisplay, formatPhoneForBackend } from '../../utils/phoneHelpers';
import { BRAND_COLOR } from '../../utils/calendar/constants';
import gradientImage from '../../assets/gradientteam.jpg';
import ChangePassword from './ChangePassword';
import { CommonNormalDropDown, CommonLoader } from '../index';
import { useNavigate } from 'react-router-dom';
import CommonConfirmModel from '../commonComponent/CommonConfirmModel';
import { softDeleteUser } from '../../redux/services/authService';
import { createQRCodeWithUserInfo } from '../../redux/services/qrServices';
import { fetchQRCodes } from '../../redux/actions/qrActions';
import { useTheme } from '../../context/ThemeContext';
import { getAdminQRTranslations } from '../../utils/translations';
import BlackQRIcon from '../../assets/qr-large-black-icon.svg';
import WhiteQRIcon from '../../assets/qr-large-white-icon.svg';

export const BusinessProfileCard = ({
  isOpen,
  onClose,
  zIndex = 50,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const { language } = useLanguage();
  const { isDarkMode } = useTheme();
  const t = getAccountSettingTranslations(language);
  const v = getValidationTranslations(language);
  const qrT = getAdminQRTranslations(language);
  
  // QR Code state
  const [qrFormData, setQrFormData] = useState({
    customerMessage: '',
    directMessage: ''
  });
  const [qrErrors, setQrErrors] = useState({});
  const [qrLoading, setQrLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);
  const { qrCodes, loading: qrCodesLoading } = useSelector(state => state.qr);

  const [businessViewTab, setBusinessViewTab] = useState("business-details"); // "business-details", "contact-person", "hours", "password", "qr"
  const [editingField, setEditingField] = useState(null);
  const [editedBusinessData, setEditedBusinessData] = useState({
    businessName: "",
    businessType: "",
    address: "",
    phone: "",
    email: "",
    fullName: "",
    contactPhone: "",
    contactEmail: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [openWorkingHoursDropdowns, setOpenWorkingHoursDropdowns] = useState({}); // Track which working hours dropdown is open: "start-{dayIndex}" or "end-{dayIndex}"
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaffMember, setSelectedStaffMember] = useState(null); // Selected staff member for editing hours
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Load staff members from localStorage
  useEffect(() => {
    const CALENDAR_STAFF_STORAGE_KEY = "calendar_staff";
    const loadStaff = () => {
      const storedStaff = localStorage.getItem(CALENDAR_STAFF_STORAGE_KEY);
      if (storedStaff) {
        try {
          const parsedStaff = JSON.parse(storedStaff);
          setStaffMembers(parsedStaff || []);
        } catch (error) {
          console.error("Error loading staff from localStorage:", error);
          setStaffMembers([]);
        }
      } else {
        setStaffMembers([]);
      }
    };
    
    loadStaff();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === CALENDAR_STAFF_STORAGE_KEY) {
        loadStaff();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for changes
    const intervalId = setInterval(() => {
      loadStaff();
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Handle staff member selection for hours editing
  const handleStaffMemberSelect = (staffMember) => {
    setSelectedStaffMember(staffMember);
    setIsStaffDropdownOpen(false);
  };

  // Generate time options from 00:00 to 23:55 in 5-minute intervals
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

  // Days of the week (א'-ש')
  const DAYS_OF_WEEK = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];

  // Base business types dropdown options
  const baseBusinessTypes = [
    { value: '', label: t.selectBusinessType },
    { value: 'salon', label: t.salon },
    { value: 'barbershop', label: t.barbershop },
    { value: 'nails-salon', label: t.nailsSalon },
    { value: 'spa', label: t.spa },
    { value: 'medspa', label: t.medspa },
    { value: 'massage', label: t.massage },
    { value: 'tattoo-piercing', label: t.tattooPiercing },
    { value: 'tanning-studio', label: t.tanningStudio },
    { value: 'technology', label: t.technology },
  ];

  // Update edited data when user changes
  useEffect(() => {
    if (user) {
      setEditedBusinessData({
        businessName: user.businessName || "",
        businessType: user.businessType || "",
        address: user.address || "",
        phone: user.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : "",
        email: user.email || "",
        fullName: user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "") || "",
        contactPhone: user.contactPhone ? formatPhoneForDisplay(user.contactPhone) : "",
        contactEmail: user.contactEmail || "",
      });
      setEditingField(null);
      // Don't change tab - keep current tab active
    }
  }, [user]);

  // Initialize QR form data when user or business name changes
  useEffect(() => {
    if (user && businessViewTab === 'qr') {
      const businessName = user.businessName || 'Your Business';
      setQrFormData({
        customerMessage: `היי אח הסתפרתי הרגע ב ${businessName},
והם נתנו לי לינק עם 20% לפעם ראשונה אצליהם, דבר איתם בלינק:`,
        directMessage: `היי אח קבלתי הטבה של 20% דרך חבר, אשמח לדבר`
      });
    }
  }, [user, businessViewTab]);

  // Fetch QR codes when QR tab is opened
  useEffect(() => {
    if (businessViewTab === 'qr') {
      dispatch(fetchQRCodes());
    }
  }, [businessViewTab, dispatch]);

  // Get existing QR code
  const existingQRCode = qrCodes?.qrCodes?.[0];
  const hasExistingQR = existingQRCode && existingQRCode.id;

  // Update selected staff member when staff members change
  useEffect(() => {
    if (selectedStaffMember && staffMembers.length > 0) {
      const updatedStaffMember = staffMembers.find(s => s.id === selectedStaffMember.id);
      if (updatedStaffMember) {
        setSelectedStaffMember(updatedStaffMember);
      }
    }
  }, [staffMembers]);

  const handleSaveField = async (fieldName) => {
    setIsLoading(true);
    try {
      const apiData = {
        fullName: editedBusinessData.fullName,
        email: editedBusinessData.email,
        phoneNumber: formatPhoneForBackend(editedBusinessData.phone),
        businessName: editedBusinessData.businessName,
        businessType: editedBusinessData.businessType,
        address: editedBusinessData.address,
        contactPhone: formatPhoneForBackend(editedBusinessData.contactPhone),
        contactEmail: editedBusinessData.contactEmail,
      };

      const result = await dispatch(updateUserProfile(apiData));
      if (result.success) {
        setEditingField(null);
        setErrors({});
      } else {
        toast.error(result.error || t.failedToUpdateProfile);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || t.failedToUpdateProfile);
    } finally {
      setIsLoading(false);
    }
  };

  // Update working hours for business or staff member
  const handleUpdateWorkingHours = async (dayIndex, field, value) => {
    if (!user) return;

    const dayKey = DAYS_OF_WEEK[dayIndex];
    
    // Close the dropdown immediately
    const dropdownKey = `${field}-${dayIndex}`;
    setOpenWorkingHoursDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
    
    // If staff member is selected, update their working hours in localStorage
    if (selectedStaffMember) {
      const CALENDAR_STAFF_STORAGE_KEY = "calendar_staff";
      const storedStaff = localStorage.getItem(CALENDAR_STAFF_STORAGE_KEY);
      if (storedStaff) {
        try {
          const staffArray = JSON.parse(storedStaff);
          const updatedStaff = staffArray.map(staffMember => {
            if (staffMember.id === selectedStaffMember.id) {
              const currentWorkingHours = staffMember.workingHours || {};
              return {
                ...staffMember,
                workingHours: {
                  ...currentWorkingHours,
                  [dayKey]: {
                    ...currentWorkingHours[dayKey],
                    [field]: value
                  }
                }
              };
            }
            return staffMember;
          });
          
          localStorage.setItem(CALENDAR_STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
          
          // Update local state
          const updatedStaffMember = updatedStaff.find(s => s.id === selectedStaffMember.id);
          if (updatedStaffMember) {
            setSelectedStaffMember(updatedStaffMember);
            // Update staffMembers array
            setStaffMembers(updatedStaff);
          }
        } catch (error) {
          console.error('Error updating staff working hours:', error);
          toast.error('שגיאה בעדכון שעות הפעילות');
        }
      }
      return;
    }

    // Otherwise, update business working hours
    const currentWorkingHours = user.workingHours || {};
    
    const updatedWorkingHours = {
      ...currentWorkingHours,
      [dayKey]: {
        ...currentWorkingHours[dayKey],
        [field]: value
      }
    };

    setIsLoading(true);
    try {
      const apiData = {
        fullName: user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "") || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        businessName: user.businessName || "",
        businessType: user.businessType || "",
        address: user.address || "",
        contactPhone: user.contactPhone || "",
        workingHours: updatedWorkingHours,
      };

      const result = await dispatch(updateUserProfile(apiData));
      if (!result.success) {
        toast.error(result.error || t.failedToUpdateProfile);
      }
    } catch (error) {
      console.error('Working hours update error:', error);
      toast.error(error.message || t.failedToUpdateProfile);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle working hours active/inactive for a day
  const handleToggleWorkingHoursDay = async (dayIndex) => {
    if (!user) return;

    const dayKey = DAYS_OF_WEEK[dayIndex];
    
    // If staff member is selected, update their working hours in localStorage
    if (selectedStaffMember) {
      const CALENDAR_STAFF_STORAGE_KEY = "calendar_staff";
      const storedStaff = localStorage.getItem(CALENDAR_STAFF_STORAGE_KEY);
      if (storedStaff) {
        try {
          const staffArray = JSON.parse(storedStaff);
          const updatedStaff = staffArray.map(staffMember => {
            if (staffMember.id === selectedStaffMember.id) {
              const currentWorkingHours = staffMember.workingHours || {};
              const currentDayData = currentWorkingHours[dayKey] || {};
              const isActive = currentDayData.active !== false; // Default to true
              
              return {
                ...staffMember,
                workingHours: {
                  ...currentWorkingHours,
                  [dayKey]: {
                    ...currentDayData,
                    active: !isActive
                  }
                }
              };
            }
            return staffMember;
          });
          
          localStorage.setItem(CALENDAR_STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
          
          // Update local state
          const updatedStaffMember = updatedStaff.find(s => s.id === selectedStaffMember.id);
          if (updatedStaffMember) {
            setSelectedStaffMember(updatedStaffMember);
            // Update staffMembers array
            setStaffMembers(updatedStaff);
          }
        } catch (error) {
          console.error('Error updating staff working hours:', error);
          toast.error('שגיאה בעדכון שעות הפעילות');
        }
      }
      return;
    }

    // Otherwise, update business working hours
    const currentWorkingHours = user.workingHours || {};
    const currentDayData = currentWorkingHours[dayKey] || {};
    const isActive = currentDayData.active !== false; // Default to true
    
    const updatedWorkingHours = {
      ...currentWorkingHours,
      [dayKey]: {
        ...currentDayData,
        active: !isActive
      }
    };

    setIsLoading(true);
    try {
      const apiData = {
        fullName: user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "") || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        businessName: user.businessName || "",
        businessType: user.businessType || "",
        address: user.address || "",
        contactPhone: user.contactPhone || "",
        workingHours: updatedWorkingHours,
      };

      const result = await dispatch(updateUserProfile(apiData));
      if (!result.success) {
        toast.error(result.error || t.failedToUpdateProfile);
      }
    } catch (error) {
      console.error('Working hours toggle error:', error);
      toast.error(error.message || t.failedToUpdateProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEditField = (fieldName) => {
    if (user) {
      let value = user[fieldName];
      if (fieldName === 'phone') {
        value = formatPhoneForDisplay(user.phoneNumber || '');
      } else if (fieldName === 'contactPhone') {
        value = formatPhoneForDisplay(user.contactPhone || '');
      } else if (fieldName === 'fullName') {
        value = user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '');
      } else if (fieldName === 'contactEmail') {
        value = user.contactEmail || '';
      }
      setEditedBusinessData(prev => ({
        ...prev,
        [fieldName]: value || ''
      }));
    }
    setEditingField(null);
    setErrors(prev => ({ ...prev, [fieldName]: undefined }));
  };

  // Handle delete account
  const handleDeleteAccountClick = () => {
    setShowDeleteAccountModal(true);
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      const response = await softDeleteUser();
      
      toast.success(response.message || 'החשבון נמחק בהצלחה');
      
      setTimeout(() => {
        dispatch(logoutUser());
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'שגיאה במחיקת החשבון');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);
    }
  };

  // QR Code handlers
  const handleQRChange = (e) => {
    const { name, value } = e.target;
    setQrFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (name === 'customerMessage') {
      if (!value) {
        setQrErrors(prev => ({ ...prev, customerMessage: "" }));
      } else if (value.trim().length < 10) {
        setQrErrors(prev => ({ ...prev, customerMessage: qrT.customerMessageMinLength }));
      } else {
        setQrErrors(prev => ({ ...prev, customerMessage: "" }));
      }
    } else if (name === 'directMessage') {
      if (!value) {
        setQrErrors(prev => ({ ...prev, directMessage: "" }));
      } else if (value.trim().length < 10) {
        setQrErrors(prev => ({ ...prev, directMessage: qrT.directMessageMinLength }));
      } else {
        setQrErrors(prev => ({ ...prev, directMessage: "" }));
      }
    }
  };

  const validateQRForm = () => {
    const newErrors = {};
    if (!qrFormData.customerMessage.trim()) {
      newErrors.customerMessage = qrT.customerMessageRequired;
    } else if (qrFormData.customerMessage.trim().length < 10) {
      newErrors.customerMessage = qrT.customerMessageMinLength;
    }
    if (!qrFormData.directMessage.trim()) {
      newErrors.directMessage = qrT.directMessageRequired;
    } else if (qrFormData.directMessage.trim().length < 10) {
      newErrors.directMessage = qrT.directMessageMinLength;
    }
    setQrErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateQR = async () => {
    if (!validateQRForm()) {
      return;
    }

    setQrLoading(true);
    try {
      const qrData = {
        name: qrT.myBusinessQRCode,
        messageForCustomer: qrFormData.customerMessage.trim(),
        directMessage: qrFormData.directMessage.trim(),
        size: 300,
        color: "#000000",
        backgroundColor: "#FFFFFF"
      };

      const response = await createQRCodeWithUserInfo(qrData);
      if (response && response.data) {
        setGeneratedQR(response.data);
        toast.success(response.message || qrT.qrCodeGeneratedSuccessfully);
        dispatch(fetchQRCodes()); // Refresh QR codes list
      } else {
        toast.error(qrT.failedToGenerateQRCode);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error(error.message || qrT.errorGeneratingQRCode);
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!generatedQR && !existingQRCode) {
      toast.error(qrT.noQRCodeToDownload);
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = generatedQR?.qrCodeImage || existingQRCode.qrCodeImage;
      link.download = `${generatedQR?.name || existingQRCode.name || 'QRCode'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(qrT.qrCodeDownloadedSuccessfully);
    } catch (error) {
      toast.error(qrT.failedToDownloadQRCode);
    }
  };

  if (!isOpen || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex justify-end" style={{ zIndex }} dir="ltr">
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
      
      {/* Click on background - closes the card */}
      <div className="flex-1 bg-black/0" onClick={onClose} />

      <div
        dir="rtl"
        className={`relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
             border-l border-gray-200 dark:border-commonBorder shadow-2xl
             flex flex-col calendar-slide-in text-right overflow-y-auto`}
        onClick={(e) => {
          e.stopPropagation();
          // If clicking on the card itself (not on input, button, etc.) and there's an active edit, save it
          if (editingField && !e.target.closest('input') && !e.target.closest('button') && !e.target.closest('[role="button"]')) {
            handleSaveField(editingField);
          }
        }}
      >
        {/* X button outside popup on left top */}
        <button
          className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] z-10"
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
              backgroundPosition: '60% 50%',
              backgroundRepeat: 'no-repeat',
              transform: 'scaleX(-1)',
            }}
          />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-black text-white overflow-hidden"
              >
                {user?.businessName ? user.businessName.charAt(0).toUpperCase() : "ע"}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">
                  {user?.businessName || "עסק"}
                </h2>
                <p className="text-sm text-white/80">
                  פרופיל עסק
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 px-5 pb-6 overflow-y-auto">
          {/* Tabs */}
          <div className="mb-4 mt-4">
            <div className="border-b border-gray-200 dark:border-[#262626] pb-0">
              <div className="flex items-center gap-6 text-xs sm:text-sm px-2">
                {[
                  { key: "business-details", label: "פרטי העסק" },
                  { key: "contact-person", label: "פרטי איש קשר" },
                  { key: "hours", label: "שעות פעילות" },
                  { key: "qr", label: "QR" },
                  { key: "password", label: "שינוי סיסמא" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setBusinessViewTab(key);
                    }}
                    className={`relative pb-3 pt-1 font-medium transition-colors ${
                      businessViewTab === key
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {label}
                    {businessViewTab === key && (
                      <span
                        className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Staff Dropdown - Only show in hours tab, below tabs */}
            {businessViewTab === "hours" && staffMembers.length > 0 && (
              <div className="relative mt-4 px-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStaffDropdownOpen(!isStaffDropdownOpen);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#181818] hover:border-[#ff257c] transition-colors text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  <FiUser className="text-xs" />
                  <span>
                    {selectedStaffMember ? selectedStaffMember.name : "בחר איש צוות"}
                  </span>
                  <FiChevronDown className="text-xs" />
                </button>

                {isStaffDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsStaffDropdownOpen(false)}
                    />
                    <div
                      dir="rtl"
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-sm text-gray-800 dark:text-gray-100 text-right max-h-60 overflow-y-auto"
                    >
                      <div className="py-2">
                        {staffMembers.map((staffMember) => (
                          <button
                            key={staffMember.id}
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStaffMemberSelect(staffMember);
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  selectedStaffMember?.id === staffMember.id
                                    ? "border-[rgba(255,37,124,1)]"
                                    : "border-gray-300 dark:border-gray-500"
                                }`}
                              >
                                {selectedStaffMember?.id === staffMember.id && (
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                  />
                                )}
                              </span>
                              <span>{staffMember.name || "ללא שם"}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Business Details Tab */}
          {businessViewTab === "business-details" && (
            <div className="space-y-4 mt-6">
              {/* שם העסק */}
              <div 
                className="flex items-center gap-3 group cursor-pointer"
                onClick={(e) => {
                  if (editingField !== "businessName") {
                    e.stopPropagation();
                    setEditingField("businessName");
                  }
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                  <FiUser className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">שם העסק</div>
                  {editingField === "businessName" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedBusinessData.businessName}
                        onChange={(e) => setEditedBusinessData({ ...editedBusinessData, businessName: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            handleSaveField("businessName");
                          }
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveField("businessName");
                        }}
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        <FiSave className="text-sm" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEditField("businessName");
                        }}
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {editedBusinessData.businessName || "-"}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingField("businessName");
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                      >
                        <FiEdit className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* סוג עסק */}
              <div 
                className="flex items-center gap-3 group cursor-pointer"
                onClick={(e) => {
                  if (editingField !== "businessType") {
                    e.stopPropagation();
                    setEditingField("businessType");
                  }
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                  <FiUser className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">סוג עסק</div>
                  {editingField === "businessType" ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <CommonNormalDropDown
                          options={baseBusinessTypes}
                          value={editedBusinessData.businessType}
                          onChange={(value) => {
                            setEditedBusinessData({ ...editedBusinessData, businessType: value });
                            handleSaveField("businessType");
                          }}
                          bgColor="bg-white dark:bg-[#181818]"
                          textColor="text-gray-900 dark:text-white"
                          fontSize="text-sm"
                          showIcon={false}
                          borderRadius="rounded-xl"
                          width="w-full"
                          inputWidth="w-full"
                          inputBorderRadius="rounded-full"
                          padding="px-3 py-2"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEditField("businessType");
                        }}
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {baseBusinessTypes.find(type => type.value === editedBusinessData.businessType)?.label || editedBusinessData.businessType || "-"}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingField("businessType");
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
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
                  <FiHome className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">כתובת</div>
                  {editingField === "address" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedBusinessData.address}
                        onChange={(e) => setEditedBusinessData({ ...editedBusinessData, address: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            handleSaveField("address");
                          }
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        placeholder="הזן כתובת..."
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
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {editedBusinessData.address || "-"}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingField("address");
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
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
                  <FiPhone className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">טלפון</div>
                  {editingField === "phone" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={editedBusinessData.phone}
                        onChange={(e) => setEditedBusinessData({ ...editedBusinessData, phone: e.target.value })}
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
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {editedBusinessData.phone ? formatPhoneForDisplay(editedBusinessData.phone) : "-"}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingField("phone");
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
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
                  <FiMail className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">אימייל</div>
                  {editingField === "email" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={editedBusinessData.email}
                        onChange={(e) => setEditedBusinessData({ ...editedBusinessData, email: e.target.value })}
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
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {editedBusinessData.email || "-"}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingField("email");
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                      >
                        <FiEdit className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Account */}
              <div 
                className="flex items-center gap-3 group cursor-pointer mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAccountClick();
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                  <FiTrash2 className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">מחיקת חשבון</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-sm font-medium text-red-600 dark:text-red-500">
                      לחץ למחיקת החשבון
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAccountClick();
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-red-600 dark:text-red-500 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                    >
                      <FiEdit className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Person Tab */}
          {businessViewTab === "contact-person" && (
            <div className="space-y-4 mt-6">
              {/* שם ספק */}
              <div 
                className="flex items-center gap-3 group cursor-pointer"
                onClick={(e) => {
                  if (editingField !== "fullName") {
                    e.stopPropagation();
                    setEditingField("fullName");
                  }
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                  <FiUser className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">שם ספק</div>
                  {editingField === "fullName" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedBusinessData.fullName}
                        onChange={(e) => setEditedBusinessData({ ...editedBusinessData, fullName: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            handleSaveField("fullName");
                          }
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveField("fullName");
                        }}
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        <FiSave className="text-sm" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEditField("fullName");
                        }}
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {editedBusinessData.fullName || "-"}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingField("fullName");
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                      >
                        <FiEdit className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* מספר נייד */}
              <div 
                className="flex items-center gap-3 group cursor-pointer"
                onClick={(e) => {
                  if (editingField !== "contactPhone") {
                    e.stopPropagation();
                    setEditingField("contactPhone");
                  }
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                  <FiPhone className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">מספר נייד</div>
                  {editingField === "contactPhone" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={editedBusinessData.contactPhone}
                        onChange={(e) => setEditedBusinessData({ ...editedBusinessData, contactPhone: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            handleSaveField("contactPhone");
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
                          handleSaveField("contactPhone");
                        }}
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        <FiSave className="text-sm" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEditField("contactPhone");
                        }}
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {editedBusinessData.contactPhone ? formatPhoneForDisplay(editedBusinessData.contactPhone) : "-"}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingField("contactPhone");
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                      >
                        <FiEdit className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Business Hours Tab */}
          {businessViewTab === "hours" && (
            <div className="space-y-4 mt-6">
              {/* Headers */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#2b2b2b] mb-2">
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div className="text-[15px] font-semibold text-gray-700 dark:text-gray-300">
                    יום
                  </div>
                  <div className="text-[15px] font-semibold text-gray-700 dark:text-gray-300">
                    התחלה
                  </div>
                  <div className="text-[15px] font-semibold text-gray-700 dark:text-gray-300">
                    סיום
                  </div>
                  <div className="text-[15px] font-semibold text-gray-700 dark:text-gray-300 text-center">
                    פעיל / לא פעיל
                  </div>
                </div>
              </div>
              
              {/* Days Rows */}
              <div className="space-y-2">
                {DAYS_OF_WEEK.map((day, dayIndex) => {
                  // Use selected staff member's working hours if selected, otherwise use business hours
                  const workingHoursSource = selectedStaffMember?.workingHours || user?.workingHours || {};
                  const dayData = workingHoursSource[day] || {};
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
                              className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
                                        className={`w-full flex items-center justify-between px-3 py-2 ${
                                          startTime === time 
                                            ? "" 
                                            : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                        } transition`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateWorkingHours(dayIndex, 'startTime', time);
                                        }}
                                      >
                                        <span className="flex items-center gap-2">
                                          <span
                                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                              startTime === time
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
                              className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
                                        className={`w-full flex items-center justify-between px-3 py-2 ${
                                          endTime === time
                                            ? "" 
                                            : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                        } transition`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateWorkingHours(dayIndex, 'endTime', time);
                                        }}
                                      >
                                        <span className="flex items-center gap-2">
                                          <span
                                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                              endTime === time
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
                              handleToggleWorkingHoursDay(dayIndex);
                            }}
                            className="flex items-center justify-center"
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                isActive
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

          {/* QR Tab */}
          {businessViewTab === "qr" && (
            <div className="space-y-4 mt-6">
              {/* Message for Customer */}
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                  <MdQrCode2 className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {qrT.messageForCustomer}
                  </div>
                  <textarea
                    name="customerMessage"
                    value={qrFormData.customerMessage}
                    onChange={handleQRChange}
                    placeholder={qrT.messageForCustomerPlaceholder}
                    disabled={hasExistingQR || generatedQR}
                    rows={3}
                    className="w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {qrErrors.customerMessage && (
                    <p className="text-xs text-red-500 mt-1">{qrErrors.customerMessage}</p>
                  )}
                </div>
              </div>

              {/* Direct Message */}
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                  <FiMail className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {qrT.directMessage}
                  </div>
                  <textarea
                    name="directMessage"
                    value={qrFormData.directMessage}
                    onChange={handleQRChange}
                    placeholder={qrT.directMessagePlaceholder}
                    disabled={hasExistingQR || generatedQR}
                    rows={3}
                    className="w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {qrErrors.directMessage && (
                    <p className="text-xs text-red-500 mt-1">{qrErrors.directMessage}</p>
                  )}
                </div>
              </div>


              {/* QR Code Display */}
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                  <MdQrCode2 className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {qrT.myQRCodes}
                    </div>
                    {/* Download Button - Delicate button */}
                    {(generatedQR || existingQRCode) && (
                      <button
                        onClick={handleDownloadQR}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100"
                        title={qrT.downloadQRCode}
                      >
                        <FiDownload className="text-sm" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center min-h-[200px] rounded-lg bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder p-6">
                    {qrCodesLoading ? (
                      <CommonLoader />
                    ) : generatedQR ? (
                      <div className="text-center w-full">
                        <img
                          src={generatedQR.qrCodeImage}
                          alt="Generated QR Code"
                          className="w-32 h-32 mx-auto"
                        />
                      </div>
                    ) : existingQRCode ? (
                      <div className="text-center w-full">
                        <img
                          src={existingQRCode.qrCodeImage}
                          alt="Existing QR Code"
                          className="w-32 h-32 mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <img 
                          src={isDarkMode ? WhiteQRIcon : BlackQRIcon} 
                          alt="QR Code" 
                          className="mb-4 mx-auto opacity-30"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {qrT.generatedQRCodesWillAppearHere}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Change Password Tab */}
          {businessViewTab === "password" && (
            <div className="mt-6">
              <ChangePassword isEmbedded={true} onLoadingChange={setIsLoading} />
            </div>
          )}
        </div>

        {/* Generate QR Button - Fixed at bottom for QR tab */}
        {businessViewTab === "qr" && (
          <div className="border-t border-gray-200 dark:border-[#262626] px-5 py-4 bg-white dark:bg-[#111]">
            <div className="flex gap-3">
              {/* Download Button - Only show if QR code exists */}
              {(generatedQR || existingQRCode) && (
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 h-[44px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <FiSave className="text-base" />
                  <span>{qrT.downloadQRCode}</span>
                </button>
              )}
              {/* Generate QR Button */}
              <button
                onClick={handleGenerateQR}
                disabled={qrLoading || hasExistingQR || generatedQR}
                className={`${(generatedQR || existingQRCode) ? 'flex-1' : 'w-full'} h-[44px] rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {qrLoading ? (
                  <>
                    <CommonLoader />
                    <span>{qrT.generating}</span>
                  </>
                ) : hasExistingQR || generatedQR ? (
                  <span>{qrT.qrCodeAlreadyExists}</span>
                ) : (
                  <>
                    <MdQrCode2 className="text-base" />
                    <span>{qrT.generateQRCode}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Save Changes Button - Fixed at bottom for password tab */}
        {businessViewTab === "password" && (
          <div className="border-t border-gray-200 dark:border-[#262626] px-5 py-4 bg-white dark:bg-[#111]">
            <button
              type="submit"
              form="change-password-form"
              disabled={isLoading}
              className="w-full h-[44px] rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t.changingPassword : t.saveChanges}
            </button>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      <CommonConfirmModel
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={handleConfirmDeleteAccount}
        title="מחיקת חשבון"
        message="האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו אינה הפיכה וכל הנתונים יימחקו לצמיתות."
        confirmText={isDeletingAccount ? "מוחק..." : "מחק חשבון"}
        cancelText="ביטול"
      />
    </div>
  );
};

export default BusinessProfileCard;


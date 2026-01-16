/**
 * Calendar Staff Page - Fresha Style
 * Displays all staff members that have been created through the calendar booking flow
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FiPhone, FiSearch, FiEdit, FiTrash2, FiEye, 
  FiPlus, FiChevronDown, FiFilter, FiX, FiUpload, FiDownload, FiMail, FiUser, FiDollarSign, FiMapPin, FiHome, FiCheckCircle,
  FiCalendar, FiTrendingUp, FiClock, FiStar, FiAlertCircle, FiRefreshCw, FiGlobe, FiLink, FiTarget, FiBarChart2, FiSave
} from "react-icons/fi";
import { FaStar, FaPhoneAlt } from "react-icons/fa";
import { formatPhoneForDisplay, formatPhoneForBackend, formatPhoneToWhatsapp } from "../../utils/phoneHelpers";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { BRAND_COLOR } from "../../utils/calendar/constants";
import { NewStaffModal } from "../../components/calendar/Modals/NewStaffModal";
import gradientImage from "../../assets/gradientteam.jpg";
import whatsappIcon from "../../assets/whatsappicon.png";
import { Area, AreaChart, Tooltip, ResponsiveContainer } from 'recharts';
import { DEMO_SERVICES } from "../../data/calendar/demoData";
import { useDispatch, useSelector } from "react-redux";
import { 
  getAllStaffAction, 
  createStaffAction, 
  updateStaffAction, 
  deleteStaffAction, 
  deleteMultipleStaffAction 
} from "../../redux/actions/staffActions";
import { useSubscriptionCheck } from "../../hooks/useSubscriptionCheck";

const CALENDAR_STAFF_STORAGE_KEY = "calendar_staff";
const COLUMN_SPACING_STORAGE_KEY = "calendar_staff_column_spacing";
const VISIBLE_FIELDS_STORAGE_KEY = "calendar_staff_visible_fields";

export default function CalendarStaffPage() {
  const { language } = useLanguage();
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  
  // Get staff from Redux store
  const { staff: staffFromStore, loading: isLoadingStaff } = useSelector((state) => state.staff);
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedStatus, setSelectedStatus] = useState(null); // null = כל הסטטוסים
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null); // null = כל הדירוגים
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isColumnFilterDropdownOpen, setIsColumnFilterDropdownOpen] = useState(false);
  const [editingFieldInList, setEditingFieldInList] = useState(null); // Track which field is being edited in the list
  const [openStatusDropdowns, setOpenStatusDropdowns] = useState({}); // Track which staff status dropdown is open
  const [statusDropdownPositions, setStatusDropdownPositions] = useState({}); // Track dropdown positions
  const [isStaffCardStatusDropdownOpen, setIsStaffCardStatusDropdownOpen] = useState(false); // Track status dropdown in staff card
  const [editingServiceField, setEditingServiceField] = useState(null); // Track which service field is being edited: "duration-{serviceId}" or "price-{serviceId}"
  const [openDurationDropdowns, setOpenDurationDropdowns] = useState({}); // Track which service duration dropdown is open
  const [openPriceDropdowns, setOpenPriceDropdowns] = useState({}); // Track which service price dropdown is open
  const [priceDropdownPositions, setPriceDropdownPositions] = useState({}); // Track price dropdown positions
  const [openWorkingHoursDropdowns, setOpenWorkingHoursDropdowns] = useState({}); // Track which working hours dropdown is open: "start-{day}" or "end-{day}"
  const [visibleFields, setVisibleFields] = useState(() => {
    // Default visible fields for staff - ברירת מחדל: שם, מספר נייד, סטטוס, אימייל
    const defaultFields = {
      // פרטי בסיס
      name: true,
      status: true,
      phone: true,
      email: false,
      city: false,
      address: false,
      createdAt: false, // תאריך כניסת איש הצוות
    };
    
    // Check if this is a new session (user logged in again)
    // Use sessionStorage to track if user was already in this session
    const SESSION_FLAG_KEY = "calendar_staff_session_active";
    const isNewSession = !sessionStorage.getItem(SESSION_FLAG_KEY);
    
    // If it's a new session, reset to defaults (user logged in again)
    if (isNewSession) {
      // Mark session as active
      sessionStorage.setItem(SESSION_FLAG_KEY, "true");
      // Clear any stored preferences to reset to defaults
      try {
        localStorage.removeItem(VISIBLE_FIELDS_STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing visible fields:", error);
      }
      return defaultFields;
    }
    
    // Load from localStorage (user is in same session, keep their preferences)
    try {
      const stored = localStorage.getItem(VISIBLE_FIELDS_STORAGE_KEY);
      if (stored) {
        return { ...defaultFields, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading visible fields:", error);
    }
    return defaultFields;
  });
  const [selectedStaffForView, setSelectedStaffForView] = useState(null);
  const [showStaffSummary, setShowStaffSummary] = useState(false);
  const [staffViewTab, setStaffViewTab] = useState("details"); // Only "details" for staff
  const prevSelectedStaffIdRef = useRef(null);
  const [editingField, setEditingField] = useState(null); // "name", "phone", "email", "city", "address", or null
  const [editedStaffData, setEditedStaffData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: ""
  });
  const profileImageInputRef = useRef(null);
  const priceInputRef = useRef(null);

  // Check subscription status using custom hook
  const { hasActiveSubscription, subscriptionLoading } = useSubscriptionCheck({
    pageName: 'CALENDAR STAFF PAGE',
    enableLogging: false
  });

  // Handle clicks outside price input to close editing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingServiceField && editingServiceField.startsWith('price-') && priceInputRef.current && !priceInputRef.current.contains(event.target)) {
        // Ensure ₪ is present and at least one digit exists before closing
        const serviceId = editingServiceField.replace('price-', '');
        const service = selectedStaffForView?.services?.find(s => 
          typeof s === 'object' ? s.id === serviceId : s === serviceId
        );
        if (service && typeof service === 'object' && selectedStaffForView) {
          let value = service.price || '₪';
          
          // Check if there's at least one digit
          const digits = value.replace(/[^\d]/g, '');
          if (digits.length === 0) {
            // Don't close if no digits - keep editing mode open
            return;
          }
          
          if (!value.startsWith('₪')) {
            value = '₪' + value.replace(/₪/g, '');
            // Update the service price directly
            const updatedStaff = staff.map(staffMember => {
              if (staffMember.id === selectedStaffForView.id) {
                const currentServices = staffMember.services || [];
                const serviceIndex = currentServices.findIndex(s => 
                  typeof s === 'object' ? s.id === serviceId : s === serviceId
                );
                
                if (serviceIndex >= 0) {
                  const updatedServices = [...currentServices];
                  if (typeof updatedServices[serviceIndex] === 'object') {
                    updatedServices[serviceIndex] = {
                      ...updatedServices[serviceIndex],
                      price: value
                    };
                  } else {
                    const defaultService = DEMO_SERVICES.find(s => s.id === serviceId);
                    updatedServices[serviceIndex] = {
                      id: serviceId,
                      duration: defaultService?.duration || "30 דק'",
                      price: value
                    };
                  }
                  
                  return {
                    ...staffMember,
                    services: updatedServices
                  };
                }
              }
              return staffMember;
            });

            setStaff(updatedStaff);
            localStorage.setItem(CALENDAR_STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
            
            // Update selectedStaffForView if it's the same staff member
            const updatedStaffMember = updatedStaff.find(s => s.id === selectedStaffForView.id);
            if (updatedStaffMember) {
              setSelectedStaffForView(updatedStaffMember);
            }
          }
        }
        setEditingServiceField(null);
      }
    };

    if (editingServiceField && editingServiceField.startsWith('price-')) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingServiceField, selectedStaffForView, staff]);

  // Update edited data when staff changes
  useEffect(() => {
    if (selectedStaffForView) {
      setEditedStaffData({
        name: selectedStaffForView.name || "",
        phone: selectedStaffForView.phone || "",
        email: selectedStaffForView.email || "",
        city: selectedStaffForView.city || "",
        address: selectedStaffForView.address || ""
      });
      setEditingField(null);
      // Only reset to "details" tab when opening a NEW staff popup (different staff member)
      // Don't change tab if we're already viewing a staff member and just updating data
      if (!prevSelectedStaffIdRef.current || selectedStaffForView.id !== prevSelectedStaffIdRef.current) {
      setStaffViewTab("details");
      }
      prevSelectedStaffIdRef.current = selectedStaffForView.id;
    } else {
      prevSelectedStaffIdRef.current = null;
    }
  }, [selectedStaffForView]);

  // Handle profile image upload
  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedStaffForView) return;

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
      
      const updatedStaff = staff.map(staffMember => {
        if (staffMember.id === selectedStaffForView.id) {
          return {
            ...staffMember,
            profileImage: base64String
          };
        }
        return staffMember;
      });

      setStaff(updatedStaff);
      localStorage.setItem(CALENDAR_STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
      
      // Update selectedStaffForView to reflect changes
      const updatedStaffMember = updatedStaff.find(s => s.id === selectedStaffForView.id);
      setSelectedStaffForView(updatedStaffMember);
    };
    reader.onerror = () => {
      alert('שגיאה בקריאת הקובץ');
    };
    reader.readAsDataURL(file);
  };

  // Update staff status
  const handleUpdateStaffStatus = (staffId, newStatus) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי לערוך סטטוס. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    const updatedStaff = staff.map(staffMember => {
      if (staffMember.id === staffId) {
        return {
          ...staffMember,
          status: newStatus
        };
      }
      return staffMember;
    });

    setStaff(updatedStaff);
    localStorage.setItem(CALENDAR_STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
    
    // Update selectedStaffForView if it's the same staff member
    if (selectedStaffForView && selectedStaffForView.id === staffId) {
      const updatedStaffMember = updatedStaff.find(s => s.id === staffId);
      setSelectedStaffForView(updatedStaffMember);
    }
    
    // Close the dropdown
    setOpenStatusDropdowns(prev => ({ ...prev, [staffId]: false }));
  };

  // Toggle service for staff member
  const handleToggleStaffService = (staffId, serviceId) => {
    const updatedStaff = staff.map(staffMember => {
      if (staffMember.id === staffId) {
        const currentServices = staffMember.services || [];
        const isServiceEnabled = currentServices.some(s => 
          typeof s === 'object' ? s.id === serviceId : s === serviceId
        );
        
        if (isServiceEnabled) {
          // Remove service
          return {
            ...staffMember,
            services: currentServices.filter(s => 
              typeof s === 'object' ? s.id !== serviceId : s !== serviceId
            )
          };
        } else {
          // Add service with default values
          const service = DEMO_SERVICES.find(s => s.id === serviceId);
          return {
            ...staffMember,
            services: [...currentServices, {
              id: serviceId,
              duration: service?.duration || "30 דק'",
              price: service?.price || "₪0"
            }]
          };
        }
      }
      return staffMember;
    });

    setStaff(updatedStaff);
    localStorage.setItem(CALENDAR_STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
    
    // Update selectedStaffForView if it's the same staff member
    if (selectedStaffForView && selectedStaffForView.id === staffId) {
      const updatedStaffMember = updatedStaff.find(s => s.id === staffId);
      setSelectedStaffForView(updatedStaffMember);
    }
  };

  // Update working hours for staff member
  const handleUpdateWorkingHours = (staffId, dayIndex, field, value) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי לערוך שעות עבודה. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    const updatedStaff = staff.map(staffMember => {
      if (staffMember.id === staffId) {
        const currentWorkingHours = staffMember.workingHours || {};
        const dayKey = DAYS_OF_WEEK[dayIndex];
        
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

    setStaff(updatedStaff);
    localStorage.setItem(CALENDAR_STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
    
    // Update selectedStaffForView if it's the same staff member
    if (selectedStaffForView && selectedStaffForView.id === staffId) {
      const updatedStaffMember = updatedStaff.find(s => s.id === staffId);
      setSelectedStaffForView(updatedStaffMember);
    }
    
    // Close the dropdown
    const dropdownKey = `${field}-${dayIndex}`;
    setOpenWorkingHoursDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
  };

  // Toggle working hours active/inactive for a day
  const handleToggleWorkingHoursDay = (staffId, dayIndex) => {
    const updatedStaff = staff.map(staffMember => {
      if (staffMember.id === staffId) {
        const currentWorkingHours = staffMember.workingHours || {};
        const dayKey = DAYS_OF_WEEK[dayIndex];
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

    setStaff(updatedStaff);
    localStorage.setItem(CALENDAR_STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
    
    // Update selectedStaffForView if it's the same staff member
    if (selectedStaffForView && selectedStaffForView.id === staffId) {
      const updatedStaffMember = updatedStaff.find(s => s.id === staffId);
      setSelectedStaffForView(updatedStaffMember);
    }
  };

  // Get service data for staff member
  const getStaffServiceData = (staffId, serviceId) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember || !staffMember.services) return null;
    
    const serviceData = staffMember.services.find(s => 
      typeof s === 'object' ? s.id === serviceId : s === serviceId
    );
    
    if (typeof serviceData === 'object') {
      return serviceData;
    }
    
    // Fallback to default service data
    const defaultService = DEMO_SERVICES.find(s => s.id === serviceId);
    return defaultService ? {
      id: serviceId,
      duration: defaultService.duration,
      price: defaultService.price
    } : null;
  };

  // Update service duration or price
  const handleUpdateServiceField = (staffId, serviceId, field, value, shouldCloseEditing = true) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי לערוך שירותים. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    const updatedStaff = staff.map(staffMember => {
      if (staffMember.id === staffId) {
        const currentServices = staffMember.services || [];
        const serviceIndex = currentServices.findIndex(s => 
          typeof s === 'object' ? s.id === serviceId : s === serviceId
        );
        
        if (serviceIndex >= 0) {
          // Update existing service
          const updatedServices = [...currentServices];
          if (typeof updatedServices[serviceIndex] === 'object') {
            updatedServices[serviceIndex] = {
              ...updatedServices[serviceIndex],
              [field]: value
            };
          } else {
            // Convert to object
            const defaultService = DEMO_SERVICES.find(s => s.id === serviceId);
            updatedServices[serviceIndex] = {
              id: serviceId,
              duration: defaultService?.duration || "30 דק'",
              price: defaultService?.price || "₪0",
              [field]: value
            };
          }
          
          return {
            ...staffMember,
            services: updatedServices
          };
        }
      }
      return staffMember;
    });

    setStaff(updatedStaff);
    localStorage.setItem(CALENDAR_STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
    
    // Update selectedStaffForView if it's the same staff member
    if (selectedStaffForView && selectedStaffForView.id === staffId) {
      const updatedStaffMember = updatedStaff.find(s => s.id === staffId);
      setSelectedStaffForView(updatedStaffMember);
    }
    
    // Close editing mode only if shouldCloseEditing is true (for duration dropdown, not for price input)
    if (shouldCloseEditing) {
      setEditingServiceField(null);
      setOpenDurationDropdowns(prev => {
        const newState = { ...prev };
        delete newState[serviceId];
        return newState;
      });
      setOpenPriceDropdowns(prev => {
        const newState = { ...prev };
        delete newState[serviceId];
        return newState;
      });
    }
  };

  // Generate duration options: 10-40 minutes, then every 5 minutes up to 2 hours
  const DURATION_OPTIONS = [
    "10 דק'", "15 דק'", "20 דק'", "25 דק'", "30 דק'", "35 דק'", "40 דק'",
    "45 דק'", "50 דק'", "55 דק'",
    "שעה",
    "שעה ו-5 דק'", "שעה ו-10 דק'", "שעה ו-15 דק'", "שעה ו-20 דק'", "שעה ו-25 דק'", "שעה ו-30 דק'", "שעה ו-35 דק'", "שעה ו-40 דק'", "שעה ו-45 דק'", "שעה ו-50 דק'", "שעה ו-55 דק'",
    "שעתיים"
  ];

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

  // Save edited field
  const handleSaveField = async (fieldName) => {
    if (!selectedStaffForView) return;

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

      // Update via Redux action
      const result = await dispatch(updateStaffAction(selectedStaffForView.id, updateData));
      if (!result.success) {
        throw new Error(result.error);
      }
      const updatedStaffData = result.data;

      // Update local state
      const updatedStaff = staff.map(staffMember => {
        if (staffMember.id === selectedStaffForView.id) {
          return {
            ...staffMember,
            name: updatedStaffData.fullName || editedStaffData.name,
            phone: updatedStaffData.phone || formatPhoneForBackend(editedStaffData.phone),
            email: updatedStaffData.email || editedStaffData.email,
            city: updatedStaffData.city || editedStaffData.city,
            address: updatedStaffData.address || editedStaffData.address,
          };
        }
        return staffMember;
      });

      setStaff(updatedStaff);
      
      // Update selectedStaffForView to reflect changes
      const updatedStaffMember = updatedStaff.find(s => s.id === selectedStaffForView.id);
      setSelectedStaffForView(updatedStaffMember);
      
      setEditingField(null);
    } catch (error) {
      console.error("Error updating staff:", error);
      alert(error.message || "שגיאה בעדכון איש צוות. נסה שוב.");
    }
  };

  // Cancel editing field
  const handleCancelEditField = (fieldName) => {
    if (selectedStaffForView) {
      if (fieldName === "name") {
        setEditedStaffData({ ...editedStaffData, name: selectedStaffForView.name || "" });
      } else if (fieldName === "phone") {
        setEditedStaffData({ ...editedStaffData, phone: selectedStaffForView.phone || "" });
      } else if (fieldName === "email") {
        setEditedStaffData({ ...editedStaffData, email: selectedStaffForView.email || "" });
      } else if (fieldName === "city") {
        setEditedStaffData({ ...editedStaffData, city: selectedStaffForView.city || "" });
      } else if (fieldName === "address") {
        setEditedStaffData({ ...editedStaffData, address: selectedStaffForView.address || "" });
      }
    }
    setEditingField(null);
  };

  // Update staff field in list (inline editing)
  const handleUpdateStaffFieldInList = async (staffId, fieldName, value) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי לערוך אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    try {
      const updateData = {};
      
      if (fieldName === "name") {
        updateData.fullName = value;
      } else if (fieldName === "phone") {
        const phoneDigits = value.replace(/\D/g, '');
        updateData.phone = formatPhoneForBackend(phoneDigits);
      } else if (fieldName === "email") {
        updateData.email = value || null;
      } else if (fieldName === "city") {
        updateData.city = value || null;
      } else if (fieldName === "address") {
        updateData.address = value || null;
      }

      // Update via Redux action
      const result = await dispatch(updateStaffAction(staffId, updateData));
      if (!result.success) {
        throw new Error(result.error);
      }
      const updatedStaffData = result.data;

      // Update local state
      const updatedStaff = staff.map(staffMember => {
        if (staffMember.id === staffId) {
          return {
            ...staffMember,
            name: updatedStaffData.fullName || (fieldName === "name" ? value : staffMember.name),
            phone: updatedStaffData.phone || (fieldName === "phone" ? formatPhoneForBackend(value.replace(/\D/g, '')) : staffMember.phone),
            email: updatedStaffData.email || (fieldName === "email" ? value : staffMember.email),
            city: updatedStaffData.city || (fieldName === "city" ? value : staffMember.city),
            address: updatedStaffData.address || (fieldName === "address" ? value : staffMember.address),
          };
        }
        return staffMember;
      });

      setStaff(updatedStaff);
      
      // Update selectedStaffForView if it's the same staff member
      if (selectedStaffForView && selectedStaffForView.id === staffId) {
        const updatedStaffMember = updatedStaff.find(s => s.id === staffId);
        setSelectedStaffForView(updatedStaffMember);
      }
    } catch (error) {
      console.error("Error updating staff field:", error);
      // Don't show alert for inline editing, just log the error
    }
  };
  
  // Column spacing state
  const [columnSpacing, setColumnSpacing] = useState({
    nameToStatus: 32, // mr-8 = 32px
    statusToPhone: 0,
    phoneToRating: 0,
    ratingToRevenue: 0,
    revenueToActions: 0,
    actionsSpacing: 0,
  });
  
  // Load column spacing from localStorage
  // Always sync with clients page spacing to match exactly
  useEffect(() => {
    const clientsSpacingKey = "calendar_clients_column_spacing";
    
    // Function to load and sync spacing from clients page
    const syncSpacingFromClients = () => {
      const storedClientsSpacing = localStorage.getItem(clientsSpacingKey);
      
      if (storedClientsSpacing) {
        try {
          const clientsSpacing = JSON.parse(storedClientsSpacing);
          // Use the same spacing values from clients page
          setColumnSpacing(clientsSpacing);
          // Also save to staff-specific key for consistency
          localStorage.setItem(COLUMN_SPACING_STORAGE_KEY, JSON.stringify(clientsSpacing));
      } catch (error) {
          console.error("Error loading column spacing from clients:", error);
        }
      }
    };
    
    // Load spacing on mount
    syncSpacingFromClients();
    
    // Listen for storage changes to sync spacing when clients page updates it
    const handleStorageChange = (e) => {
      if (e.key === clientsSpacingKey) {
        syncSpacingFromClients();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (in case of same-tab updates)
    const intervalId = setInterval(() => {
      syncSpacingFromClients();
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);


  // Save visible fields to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(VISIBLE_FIELDS_STORAGE_KEY, JSON.stringify(visibleFields));
    } catch (error) {
      console.error("Error saving visible fields:", error);
    }
  }, [visibleFields]);

  // Toggle field visibility
  const toggleFieldVisibility = (fieldName) => {
    setVisibleFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  // Select all fields in a category
  const selectAllFieldsInCategory = (fieldKeys) => {
    setVisibleFields(prev => {
      const newFields = { ...prev };
      const allSelected = fieldKeys.every(key => newFields[key]);
      fieldKeys.forEach(key => {
        newFields[key] = !allSelected;
      });
      return newFields;
    });
  };

  // Removed getClientAppointmentsInfo - not needed for staff management
  
  // New staff modal state
  const [isNewStaffModalOpen, setIsNewStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffCity, setNewStaffCity] = useState("");
  const [newStaffAddress, setNewStaffAddress] = useState("");
  const [newStaffErrors, setNewStaffErrors] = useState({});

  // Transform staff from Redux store to frontend format
  const transformStaff = (s) => ({
    id: s.id,
    name: s.fullName || "",
    phone: s.phone || "",
    email: s.email || "",
    city: s.city || "",
    address: s.address || "",
    initials: (s.fullName || "")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ל",
    status: s.isActive ? "פעיל" : "לא פעיל",
    services: DEMO_SERVICES.map(service => ({
      id: service.id,
      duration: service.duration,
      price: service.price
    })),
    createdAt: s.createdAt || new Date().toISOString(),
  });

  // Load staff from Redux store on mount
  useEffect(() => {
    const fetchStaff = async () => {
      const result = await dispatch(getAllStaffAction());
      if (result.success) {
        // Staff will be updated via staffFromStore useEffect
      } else {
        console.error("Error loading staff:", result.error);
        // Fallback to localStorage if API fails
        const storedClients = localStorage.getItem(CALENDAR_STAFF_STORAGE_KEY);
        if (storedClients) {
          try {
            setStaff(JSON.parse(storedClients));
          } catch (parseError) {
            console.error("Error loading clients from localStorage:", parseError);
          }
        }
      }
    };

    // Only fetch if store is empty
    if (staffFromStore.length === 0) {
      fetchStaff();
    }
  }, [dispatch]);

  // Sync staff from Redux store to local state
  useEffect(() => {
    if (staffFromStore.length > 0) {
      const transformedStaff = staffFromStore.map(transformStaff);
      setStaff(transformedStaff);
    }
  }, [staffFromStore]);

  // Check if we need to open a staff card (from business profile)
  useEffect(() => {
    const openStaffCardData = sessionStorage.getItem('openStaffCard');
    if (openStaffCardData && staff.length > 0) {
      try {
        const { staffId, tab } = JSON.parse(openStaffCardData);
        const staffMember = staff.find(s => s.id === staffId);
        if (staffMember) {
          setSelectedStaffForView(staffMember);
          setShowStaffSummary(true);
          setStaffViewTab(tab || 'hours');
          // Clear the sessionStorage after opening
          sessionStorage.removeItem('openStaffCard');
        }
      } catch (error) {
        console.error("Error opening staff card:", error);
        sessionStorage.removeItem('openStaffCard');
      }
    }
  }, [staff]);

  // Filter and sort staff
  const filteredAndSortedStaff = useMemo(() => {
    let filtered = staff;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      const queryLower = query.toLowerCase();
      
      filtered = staff.filter((staffMember) => {
        // Check name and email (normal search)
        const nameMatch = staffMember.name?.toLowerCase().includes(queryLower);
        const emailMatch = staffMember.email?.toLowerCase().includes(queryLower);
        
        // For phone number - check if query starts with the phone number (progressive search)
        let phoneMatch = false;
        if (staffMember.phone) {
          // Remove all non-digit characters from both phone and query for comparison
          let phoneDigits = staffMember.phone.replace(/\D/g, ''); // Remove all non-digits
          let queryDigits = query.replace(/\D/g, ''); // Remove all non-digits
          
          // Normalize phone number: if it starts with 972 (Israel country code), convert to 0
          // Numbers might be stored as +972XXXXXXXXX or 0XXXXXXXXX
          if (phoneDigits.startsWith('972') && phoneDigits.length > 3) {
            phoneDigits = '0' + phoneDigits.substring(3); // Convert +972 to 0
          }
          
          // Normalize query: if it starts with 972, convert to 0
          if (queryDigits.startsWith('972') && queryDigits.length > 3) {
            queryDigits = '0' + queryDigits.substring(3);
          }
          
          // Check if phone number starts with the query (progressive search)
          if (phoneDigits && queryDigits) {
            phoneMatch = phoneDigits.startsWith(queryDigits);
          }
        }
        
        return nameMatch || emailMatch || phoneMatch;
      });
    }

    // Filter by status
    if (selectedStatus !== null) {
      filtered = filtered.filter((staffMember) => {
        const staffStatus = staffMember.status || "פעיל";
        // Support both Hebrew and English status values
        const statusMap = {
          "פעיל": "פעיל",
          "active": "פעיל",
          "Active": "פעיל",
          "לא פעיל": "לא פעיל",
          "inactive": "לא פעיל",
          "Inactive": "לא פעיל",
          "בסיכון": "בסיכון",
          "at risk": "בסיכון",
          "At Risk": "בסיכון",
          "אבוד": "אבוד",
          "lost": "אבוד",
          "Lost": "אבוד",
          "התאושש": "התאושש",
          "recovered": "התאושש",
          "Recovered": "התאושש",
          "חדש": "חדש",
          "new": "חדש",
          "New": "חדש"
        };
        const normalizedStaffStatus = statusMap[staffStatus] || staffStatus;
        return normalizedStaffStatus === selectedStatus;
      });
    }

    // Filter by rating
    if (selectedRating !== null) {
      filtered = filtered.filter((staffMember) => {
        const staffRating = staffMember.rating || "-";
        if (selectedRating === "-") {
          return staffRating === "-" || !staffRating;
        }
        return String(staffRating) === String(selectedRating);
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return (b.id || 0) - (a.id || 0);
      } else if (sortBy === "oldest") {
        return (a.id || 0) - (b.id || 0);
      } else if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return 0;
    });

    return sorted;
  }, [staff, searchQuery, sortBy, selectedStatus, selectedRating]);

  // Removed clientAdvancedStats - not needed for staff management

  const handleDeleteStaff = async (staffId) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי למחוק אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    if (!window.confirm("האם אתה בטוח שאתה רוצה למחוק את איש הצוות הזה?")) {
      return;
    }
    
    try {
      const result = await dispatch(deleteStaffAction(staffId));
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const updatedStaff = staff.filter((s) => s.id !== staffId);
      setStaff(updatedStaff);
      
      // If the deleted staff member was being viewed, close the summary
      if (selectedStaffForView?.id === staffId) {
        setShowStaffSummary(false);
        setSelectedStaffForView(null);
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      alert(error.message || "שגיאה במחיקת איש צוות. נסה שוב.");
    }
  };

  const handleDownloadSelectedClients = () => {
    if (selectedStaff.length === 0) {
      alert("אנא בחר לפחות איש צוות אחד להורדה");
      return;
    }

    const selectedStaffData = staff.filter((s) => selectedStaff.includes(s.id));
    
    // Convert to CSV
    const headers = ["שם", "טלפון", "אימייל", "עיר", "כתובת", "סטטוס", "דירוג", "סך הכנסות"];
    const rows = selectedStaffData.map(staffMember => [
      staffMember.name || "",
      staffMember.phone ? formatPhoneForDisplay(staffMember.phone) : "",
      staffMember.email || "",
      staffMember.city || "",
      staffMember.address || "",
      staffMember.status || "פעיל",
      staffMember.rating || "-",
      staffMember.totalRevenue || 0
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Add BOM for Hebrew support in Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `צוות_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSelectedClients = async () => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי למחוק אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    if (selectedStaff.length === 0) {
      alert("אנא בחר לפחות איש צוות אחד למחיקה");
      return;
    }

    if (window.confirm(`האם אתה בטוח שאתה רוצה למחוק ${selectedStaff.length} איש/אנשי צוות?`)) {
      try {
        const result = await dispatch(deleteMultipleStaffAction(selectedStaff));
        if (!result.success) {
          throw new Error(result.error);
        }
        
        const updatedStaff = staff.filter((s) => !selectedStaff.includes(s.id));
        setStaff(updatedStaff);
        setSelectedStaff([]);
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert(error.message || "שגיאה במחיקת אנשי צוות. נסה שוב.");
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedStaff.length === filteredAndSortedStaff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(filteredAndSortedStaff.map(c => c.id));
    }
  };

  const handleSelectStaff = (staffId) => {
    if (selectedStaff.includes(staffId)) {
      setSelectedStaff(selectedStaff.filter(id => id !== staffId));
    } else {
      setSelectedStaff([...selectedStaff, staffId]);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Handle creating a new staff member
  const handleCreateNewStaff = async () => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי ליצור אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    const errors = {};
    if (!newStaffName.trim()) {
      errors.name = "שם הוא שדה חובה";
    }
    
    const phoneDigits = newStaffPhone.trim().replace(/\D/g, '');
    if (!newStaffPhone.trim()) {
      errors.phone = "טלפון הוא שדה חובה";
    } else if (phoneDigits.length !== 10) {
      errors.phone = "מספר טלפון חייב להכיל בדיוק 10 ספרות";
    }

    setNewStaffErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      // Create staff via Redux action
      const staffData = {
        fullName: newStaffName.trim(),
        phone: formatPhoneForBackend(phoneDigits),
        email: newStaffEmail.trim() || null,
        city: newStaffCity.trim() || null,
        address: newStaffAddress.trim() || null,
      };

      const result = await dispatch(createStaffAction(staffData));
      if (!result.success) {
        throw new Error(result.error);
      }
      const createdStaff = result.data;

      // Transform API response to match frontend format
      const initials = newStaffName
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const newStaffMember = {
        id: createdStaff.id,
        name: createdStaff.fullName || newStaffName.trim(),
        phone: createdStaff.phone || formatPhoneForBackend(phoneDigits),
        email: createdStaff.email || "",
        city: createdStaff.city || "",
        address: createdStaff.address || "",
        initials: initials || "ל",
        status: createdStaff.isActive ? "פעיל" : "לא פעיל",
        services: DEMO_SERVICES.map(service => ({
          id: service.id,
          duration: service.duration,
          price: service.price
        })),
        createdAt: createdStaff.createdAt || new Date().toISOString(),
      };

      // Add staff member to staff list
      const updatedStaff = [newStaffMember, ...staff];
      setStaff(updatedStaff);
      
      // Close modal
      setIsNewStaffModalOpen(false);
      
      // Reset form fields
      setNewStaffName("");
      setNewStaffPhone("");
      setNewStaffEmail("");
      setNewStaffCity("");
      setNewStaffAddress("");
      setNewStaffErrors({});
    } catch (error) {
      console.error("Error creating staff:", error);
      setNewStaffErrors({ 
        submit: error.message || "שגיאה ביצירת איש צוות. נסה שוב." 
      });
    }
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-customBlack" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                רשימת צוות
              </h1>
              {staff.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-white bg-gray-100 dark:bg-[#181818] px-2 py-0.5 rounded">
                  {staff.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-white">
              צפה, הוסף, ערוך ומחק את פרטי אנשי הצוות שלך.{" "}
              <a href="#" className="text-[#ff257c] hover:underline">למד עוד</a>
            </p>
          </div>
          <div className="flex items-center gap-2">
              <button
              onClick={() => {
                if (!hasActiveSubscription) {
                  alert('נדרש מנוי פעיל כדי ליצור אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
                  return;
                }
                setNewStaffName("");
                setNewStaffPhone("");
                setNewStaffEmail("");
                setNewStaffCity("");
                setNewStaffAddress("");
                setNewStaffErrors({});
                setIsNewStaffModalOpen(true);
              }}
              disabled={!hasActiveSubscription || subscriptionLoading}
              className={`px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${
                !hasActiveSubscription || subscriptionLoading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-white cursor-not-allowed'
                  : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
              }`}
              title={!hasActiveSubscription ? 'נדרש מנוי פעיל כדי ליצור אנשי צוות' : ''}
            >
              חדש
              <FiPlus className="text-base" />
            </button>
          </div>
        </div>


        {/* Search and Filters Bar */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <div className="relative w-1/4">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="שם, אימייל או טלפון"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-4 pl-12 py-2.5 rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-[#ff257c] focus:outline-none focus:border-[#ff257c] transition-colors"
            />
          </div>
          
          {/* Status Filter Button */}
          <div className="relative">
          <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
            >
              <span className="whitespace-nowrap">
                {selectedStatus === null ? "כל הסטטוסים" : selectedStatus}
              </span>
              <FiChevronDown className="text-[14px] text-gray-400" />
          </button>

            {isStatusDropdownOpen && (
              <>
                {/* Overlay layer to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsStatusDropdownOpen(false)}
                />
                <div
                  dir="rtl"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                >
                <div className="py-2">
                  {/* כל הסטטוסים */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setSelectedStatus(null);
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedStatus === null
                            ? "border-[rgba(255,37,124,1)]"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedStatus === null && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                        )}
                      </span>
                      <span>כל הסטטוסים</span>
                    </span>
                  </button>

                  {/* פעיל */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setSelectedStatus("פעיל");
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedStatus === "פעיל"
                            ? "border-[rgba(255,37,124,1)]"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedStatus === "פעיל" && (
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
                    onClick={() => {
                      setSelectedStatus("לא פעיל");
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedStatus === "לא פעיל"
                            ? "border-gray-500"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedStatus === "לא פעיל" && (
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

          {/* Rating Filter Button */}
          <div className="relative">
              <button
              type="button"
              className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors ${
                isRatingDropdownOpen || selectedRating !== null
                  ? "border-[#ff257c] focus:ring-2 focus:ring-[#ff257c]"
                  : "border-gray-200 dark:border-commonBorder"
              }`}
              onClick={() => setIsRatingDropdownOpen((prev) => !prev)}
            >
              <span className="whitespace-nowrap flex items-center gap-1">
                {selectedRating === null ? (
                  "דירוג"
                ) : selectedRating === "-" ? (
                  "ללא דירוג"
                ) : (
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < parseInt(selectedRating) ? "text-ratingStar" : "text-gray-300 dark:text-gray-500"}
                        style={{ fontSize: "12px" }}
                      />
                    ))}
          </div>
                )}
              </span>
              <FiChevronDown className="text-[14px] text-gray-400" />
            </button>

            {isRatingDropdownOpen && (
              <>
                {/* Overlay layer to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsRatingDropdownOpen(false)}
                />
                <div
                  dir="rtl"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                >
                <div className="py-2">
                  {/* כל הדירוגים */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setSelectedRating(null);
                      setIsRatingDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRating === null
                            ? "border-[rgba(255,37,124,1)]"
                      : "border-gray-300 dark:border-gray-500"
                  }`}
                      >
                        {selectedRating === null && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                        )}
                    </span>
                      <span>כל הדירוגים</span>
                    </span>
                  </button>

                  {/* דירוג 5 */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setSelectedRating("5");
                      setIsRatingDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRating === "5"
                            ? "border-[rgba(255,37,124,1)]"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedRating === "5" && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                        )}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-ratingStar"
                            style={{ fontSize: "12px" }}
                          />
                        ))}
        </div>
                    </span>
              </button>

                  {/* דירוג 4 */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setSelectedRating("4");
                      setIsRatingDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRating === "4"
                            ? "border-[rgba(255,37,124,1)]"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedRating === "4" && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                        )}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(4)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-ratingStar"
                            style={{ fontSize: "12px" }}
                          />
                        ))}
                        {[...Array(1)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-gray-300 dark:text-gray-500"
                            style={{ fontSize: "12px" }}
                          />
                        ))}
          </div>
                    </span>
              </button>

                  {/* דירוג 3 */}
              <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setSelectedRating("3");
                      setIsRatingDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRating === "3"
                            ? "border-[rgba(255,37,124,1)]"
                      : "border-gray-300 dark:border-gray-500"
                  }`}
                      >
                        {selectedRating === "3" && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                        )}
                    </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(3)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-ratingStar"
                            style={{ fontSize: "12px" }}
                          />
                        ))}
                        {[...Array(2)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-gray-300 dark:text-gray-500"
                            style={{ fontSize: "12px" }}
                          />
                        ))}
                      </div>
                    </span>
              </button>

                  {/* דירוג 2 */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setSelectedRating("2");
                      setIsRatingDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRating === "2"
                            ? "border-[rgba(255,37,124,1)]"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedRating === "2" && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                        )}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(2)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-ratingStar"
                            style={{ fontSize: "12px" }}
                          />
                        ))}
                        {[...Array(3)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-gray-300 dark:text-gray-500"
                            style={{ fontSize: "12px" }}
                          />
                        ))}
                </div>
                    </span>
              </button>

                  {/* דירוג 1 */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setSelectedRating("1");
                      setIsRatingDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRating === "1"
                            ? "border-[rgba(255,37,124,1)]"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedRating === "1" && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                        )}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(1)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-ratingStar"
                            style={{ fontSize: "12px" }}
                          />
                        ))}
                        {[...Array(4)].map((_, i) => (
                          <FaStar
                            key={i}
                            className="text-gray-300 dark:text-gray-500"
                            style={{ fontSize: "12px" }}
                          />
                        ))}
                      </div>
                    </span>
              </button>

                  {/* ללא דירוג */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setSelectedRating("-");
                      setIsRatingDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedRating === "-"
                            ? "border-[rgba(255,37,124,1)]"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedRating === "-" && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                        )}
                      </span>
                      <span>ללא דירוג</span>
                    </span>
              </button>
                </div>
              </div>
              </>
            )}
          </div>

          {/* Column Filter Button */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsColumnFilterDropdownOpen((prev) => !prev);
              }}
            >
              <span className="whitespace-nowrap">סינון</span>
              <FiFilter className="text-[14px] text-gray-400" />
              </button>

            {/* Column Filter Dropdown */}
            {isColumnFilterDropdownOpen && (
              <>
                {/* Overlay layer to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsColumnFilterDropdownOpen(false);
                  }}
                />
                <div
                  dir="rtl"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right max-h-[80vh] overflow-y-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="py-2">
                    {/* קטגוריה: מיון */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-white uppercase tracking-wide">
                      מיון
                    </div>
                    {[
                      { key: "newest", label: "חדש ביותר" },
                      { key: "oldest", label: "ישן ביותר" },
                      { key: "name", label: "א-ב" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSortBy(option.key);
                          setIsColumnFilterDropdownOpen(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              sortBy === option.key
                                ? "border-[rgba(255,37,124,1)]"
                      : "border-gray-300 dark:border-gray-500"
                  }`}
                          >
                            {sortBy === option.key && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: BRAND_COLOR }}
                              />
                            )}
                    </span>
                          <span>{option.label}</span>
                        </span>
              </button>
                    ))}

                    {/* הפרדה בין קטגוריות */}
                    <div className="border-b border-gray-200 dark:border-[#262626] my-2"></div>

                    {/* קטגוריה: פרטים */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-white uppercase tracking-wide">
                        פרטים
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllFieldsInCategory(["name", "status", "phone", "email", "city", "address"]);
                        }}
                        className="text-xs text-gray-600 dark:text-white hover:text-[#ff257c] transition-colors"
                      >
                        סמן הכל
                      </button>
                    </div>
                    {[
                      { key: "name", label: "שם איש צוות" },
                      { key: "status", label: "סטטוס" },
                      { key: "phone", label: "מספר נייד" },
                      { key: "email", label: "אימייל" },
                      { key: "city", label: "עיר" },
                      { key: "address", label: "כתובת" },
                    ].map((field) => (
                      <button
                        key={field.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFieldVisibility(field.key);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              visibleFields[field.key]
                                ? "border-[rgba(255,37,124,1)]"
                                : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {visibleFields[field.key] && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: BRAND_COLOR }}
                              />
                            )}
                          </span>
                          <span>{field.label}</span>
                        </span>
              </button>
                    ))}

                    {/* Removed all client-related categories - only basic staff fields remain */}
                  </div>
                </div>
              </>
            )}
            </div>

          <div className="relative flex items-center gap-3">
            {/* Select All Button */}
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedStaff.length === filteredAndSortedStaff.length && filteredAndSortedStaff.length > 0
                    ? "border-[rgba(255,37,124,1)]"
                    : "border-gray-300 dark:border-gray-500"
                }`}
              >
                {selectedStaff.length === filteredAndSortedStaff.length && filteredAndSortedStaff.length > 0 && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: BRAND_COLOR }}
                  />
                )}
              </span>
              <span className="whitespace-nowrap text-xs sm:text-sm">
                  בחר הכל ({selectedStaff.length}/{filteredAndSortedStaff.length})
                </span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownloadSelectedClients}
              disabled={selectedStaff.length === 0}
              className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${
                selectedStaff.length === 0
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                  : "text-gray-600 dark:text-white hover:text-[#ff257c] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
              }`}
              title="הורדת אנשי צוות נבחרים"
            >
              <FiDownload className="text-sm" />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => {
                if (!hasActiveSubscription) {
                  alert('נדרש מנוי פעיל כדי למחוק אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
                  return;
                }
                handleDeleteSelectedClients();
              }}
              disabled={selectedStaff.length === 0 || !hasActiveSubscription || subscriptionLoading}
              className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${
                selectedStaff.length === 0 || !hasActiveSubscription || subscriptionLoading
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                  : "text-gray-600 dark:text-white hover:text-red-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
              }`}
              title={!hasActiveSubscription ? 'נדרש מנוי פעיל כדי למחוק אנשי צוות' : 'מחיקת אנשי צוות נבחרים'}
            >
              <FiTrash2 className="text-sm" />
            </button>
              </div>
        </div>

        {/* Clients Cards - Floating Design */}
        {!visibleFields.phone ? (
          <div className="p-12 text-center">
            <span className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4 block">📱</span>
            <p className="text-gray-500 dark:text-white text-lg">
              יש לבחור את "מספר נייד" בתצוגה כדי לראות את רשימת אנשי הצוות
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              אנא סמן את "מספר נייד" בכפתור הסינון כדי להציג את אנשי הצוות
            </p>
          </div>
        ) : isLoadingStaff ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-[#ff257c] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-white text-lg">
              טוען אנשי צוות...
            </p>
          </div>
        ) : filteredAndSortedStaff.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4 block">☺</span>
            <p className="text-gray-500 dark:text-white text-lg">
              {searchQuery ? "לא נמצאו אנשי צוות התואמים לחיפוש" : "אין אנשי צוות עדיין"}
            </p>
            {!searchQuery && (
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                אנשי צוות חדשים שנוצרים דרך קביעת תורים יופיעו כאן
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#181818] rounded-lg overflow-hidden">
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Table Headers */}
            <div className="flex items-center gap-6 px-4 py-3 border-b border-gray-200 dark:border-[#2b2b2b] relative min-w-max">
              {/* Checkbox placeholder for alignment */}
              <div className="w-3.5 flex-shrink-0"></div>
              
              {visibleFields.name && (
                <div className="w-32 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `${columnSpacing.nameToStatus}px` }}>
                  <div className="w-8 h-8 flex-shrink-0"></div>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-white">
                שם איש צוות
                </span>
              </div>
              )}
              {visibleFields.status && (
                <div className="w-28 flex items-center justify-start flex-shrink-0" style={{ marginRight: `${columnSpacing.statusToPhone}px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-white">
                    סטטוס
                  </span>
                </div>
              )}
              {visibleFields.phone && (
                <div className="w-40 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `${columnSpacing.phoneToRating}px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-white">
                מספר נייד
                  </span>
                  <div className="w-[52px] flex-shrink-0"></div>
                </div>
              )}
              {visibleFields.email && (
                <div className="w-40 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-white">
                    אימייל
                  </span>
                </div>
              )}
              {visibleFields.city && (
                <div className="w-32 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-white">
                    עיר
                  </span>
                </div>
              )}
              {visibleFields.address && (
                <div className="w-40 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-white">
                    כתובת
                  </span>
                </div>
              )}
              <div className="w-24 flex items-center justify-start flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                מציג {filteredAndSortedStaff.length} מתוך {staff.length} תוצאות
              </p>
              </div>
            </div>

            {/* Staff Rows */}
            {filteredAndSortedStaff.map((staffMember, index) => (
              <div
                key={staffMember.id}
                onClick={() => {
                  setSelectedStaffForView(staffMember);
                  setShowStaffSummary(true);
                  setStaffViewTab("details");
                }}
                className={`px-4 py-3 flex items-center gap-6 transition-colors cursor-pointer min-w-max ${
                  index % 2 === 0 
                    ? "bg-white dark:bg-[#181818]" 
                    : "bg-gray-50/50 dark:bg-[#1a1a1a]"
                } hover:bg-gray-100 dark:hover:bg-[#222]`}
              >
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStaff(staffMember.id);
                    }}
                    className="flex-shrink-0"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selectedStaff.includes(staffMember.id)
                          ? "border-[rgba(255,37,124,1)]"
                          : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {selectedStaff.includes(staffMember.id) && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: BRAND_COLOR }}
                        />
                      )}
                    </span>
                  </button>
                  
                  {/* שם איש צוות עם אייקון */}
                  {visibleFields.name && (
                    <div className="w-32 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `${columnSpacing.nameToStatus}px` }}>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2b2b2b] flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-white flex-shrink-0 overflow-hidden">
                        {staffMember.profileImage ? (
                          <img 
                            src={staffMember.profileImage} 
                            alt={staffMember.name || "איש צוות"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          staffMember.initials || (staffMember.name ? staffMember.name.charAt(0).toUpperCase() : "ל")
                        )}
                      </div>
                      {editingFieldInList === `name-${staffMember.id}` ? (
                        <input
                          type="text"
                          value={staffMember.name || ""}
                          onChange={(e) => handleUpdateStaffFieldInList(staffMember.id, 'name', e.target.value)}
                          onBlur={() => setEditingFieldInList(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setEditingFieldInList(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-sm font-semibold rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                          dir="rtl"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className={`flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate ${
                            !hasActiveSubscription || subscriptionLoading
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer hover:text-[#ff257c]'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!hasActiveSubscription) {
                              alert('נדרש מנוי פעיל כדי לערוך אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
                              return;
                            }
                            setEditingFieldInList(`name-${staffMember.id}`);
                          }}
                        >
                      {staffMember.name || "ללא שם"}
                    </div>
                      )}
                  </div>
                  )}

                  {/* סטטוס */}
                  {visibleFields.status && (
                    <div className="w-28 flex-shrink-0 relative status-dropdown-container" style={{ marginRight: `${columnSpacing.statusToPhone}px` }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setStatusDropdownPositions(prev => ({
                            ...prev,
                            [staffMember.id]: {
                              top: rect.bottom + window.scrollY + 8,
                              right: window.innerWidth - rect.right
                            }
                          }));
                          setOpenStatusDropdowns(prev => ({
                            ...prev,
                            [staffMember.id]: !prev[staffMember.id]
                          }));
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition text-white ${
                          (staffMember.status || "פעיל") === "לא פעיל"
                            ? "bg-black"
                            : ""
                        }`}
                        style={
                          (staffMember.status || "פעיל") === "פעיל"
                            ? { 
                                backgroundColor: BRAND_COLOR
                              }
                            : {}
                        }
                      >
                        <span className={`w-1.5 h-1.5 rounded-full bg-white ${
                          (staffMember.status || "פעיל") === "פעיל" ? "animate-pulse" : ""
                        }`}></span>
                        <span>{staffMember.status || "פעיל"}</span>
                        <FiChevronDown className="text-[10px]" />
                      </button>
                      
                      {openStatusDropdowns[staffMember.id] && (
                        <>
                          {/* Overlay layer to close dropdown when clicking outside */}
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => {
                              setOpenStatusDropdowns(prev => ({
                                ...prev,
                                [staffMember.id]: false
                              }));
                            }}
                          />
                          <div
                            dir="rtl"
                            className="fixed w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                            style={{
                              top: statusDropdownPositions[staffMember.id]?.top ? `${statusDropdownPositions[staffMember.id].top}px` : 'auto',
                              right: statusDropdownPositions[staffMember.id]?.right ? `${statusDropdownPositions[staffMember.id].right}px` : 'auto'
                            }}
                          >
                            <div className="py-2">
                              {/* פעיל */}
                              <button
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStaffStatus(staffMember.id, "פעיל");
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                      (staffMember.status || "פעיל") === "פעיל"
                                        ? "border-[rgba(255,37,124,1)]"
                                        : "border-gray-300 dark:border-gray-500"
                                    }`}
                                  >
                                    {(staffMember.status || "פעיל") === "פעיל" && (
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
                                  handleUpdateStaffStatus(staffMember.id, "לא פעיל");
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                      (staffMember.status || "פעיל") === "לא פעיל"
                                        ? "border-[rgba(255,37,124,1)]"
                                        : "border-gray-300 dark:border-gray-500"
                                    }`}
                                  >
                                    {(staffMember.status || "פעיל") === "לא פעיל" && (
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: BRAND_COLOR }}
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
                  )}

                  {/* מספר נייד */}
                  {visibleFields.phone && (
                    <div className="w-40 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `${columnSpacing.phoneToRating}px` }}>
                      {editingFieldInList === `phone-${staffMember.id}` ? (
                        <input
                          type="text"
                          value={staffMember.phone || ""}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d]/g, '');
                            handleUpdateStaffFieldInList(staffMember.id, 'phone', value);
                          }}
                          onBlur={() => setEditingFieldInList(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setEditingFieldInList(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-sm rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                          dir="rtl"
                          autoFocus
                          placeholder="0501234567"
                        />
                      ) : (
                        <>
                          <div 
                            className={`text-sm text-gray-700 dark:text-white whitespace-nowrap ${
                              !hasActiveSubscription || subscriptionLoading
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer hover:text-[#ff257c]'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!hasActiveSubscription) {
                                alert('נדרש מנוי פעיל כדי לערוך אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
                                return;
                              }
                              setEditingFieldInList(`phone-${staffMember.id}`);
                            }}
                          >
                            {staffMember.phone ? formatPhoneForDisplay(staffMember.phone) : "-"}
                          </div>
                          {staffMember.phone && (
                            <>
                              <button
                                type="button"
                                className="flex-shrink-0 hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
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
                                className="flex-shrink-0 hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
                                title="פתח שיחה ב-WhatsApp"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const whatsappUrl = formatPhoneToWhatsapp(staffMember.phone);
                                  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                                }}
                              >
                                <img 
                                  src={whatsappIcon} 
                                  alt="WhatsApp" 
                                  className="w-7 h-7"
                                  style={{ filter: 'brightness(0)' }}
                                />
                              </button>
                            </>
                          )}
                        </>
                      )}
                  </div>
                  )}

                  {/* אימייל */}
                  {visibleFields.email && (
                    <div className="w-40 flex-shrink-0" style={{ marginRight: `16px` }}>
                      {editingFieldInList === `email-${staffMember.id}` ? (
                        <input
                          type="email"
                          value={staffMember.email || ""}
                          onChange={(e) => handleUpdateStaffFieldInList(staffMember.id, 'email', e.target.value)}
                          onBlur={() => setEditingFieldInList(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setEditingFieldInList(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-sm rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                          dir="rtl"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className={`text-sm text-gray-700 dark:text-white truncate ${
                            !hasActiveSubscription || subscriptionLoading
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer hover:text-[#ff257c]'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!hasActiveSubscription) {
                              alert('נדרש מנוי פעיל כדי לערוך אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
                              return;
                            }
                            setEditingFieldInList(`email-${staffMember.id}`);
                          }}
                        >
                      {staffMember.email || "-"}
                    </div>
                      )}
                  </div>
                  )}

                  {/* עיר */}
                  {visibleFields.city && (
                    <div className="w-32 flex-shrink-0" style={{ marginRight: `16px` }}>
                      <div className="text-sm text-gray-700 dark:text-white truncate">
                        {staffMember.city || "-"}
                    </div>
                  </div>
                  )}

                  {/* כתובת */}
                  {visibleFields.address && (
                    <div className="w-40 flex-shrink-0" style={{ marginRight: `16px` }}>
                      <div className="text-sm text-gray-700 dark:text-white truncate">
                        {staffMember.address || "-"}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0" style={{ marginLeft: `${columnSpacing.actionsSpacing}px` }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStaffForView(staffMember);
                        setShowStaffSummary(true);
                        setStaffViewTab("details");
                      }}
                      className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                      title="צפה בפרטים"
                    >
                      <FiEye className="text-base" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasActiveSubscription) {
                          alert('נדרש מנוי פעיל כדי לערוך אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
                          return;
                        }
                        setSelectedStaffForView(staffMember);
                        setShowStaffSummary(true);
                        setStaffViewTab("details");
                        setEditingField("name");
                      }}
                      disabled={!hasActiveSubscription || subscriptionLoading}
                      className={`p-2 rounded-lg transition ${
                        !hasActiveSubscription || subscriptionLoading
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                      }`}
                      title={!hasActiveSubscription ? 'נדרש מנוי פעיל כדי לערוך אנשי צוות' : 'ערוך'}
                    >
                      <FiEdit className="text-base" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasActiveSubscription) {
                          alert('נדרש מנוי פעיל כדי למחוק אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
                          return;
                        }
                        handleDeleteStaff(staffMember.id);
                      }}
                      disabled={!hasActiveSubscription || subscriptionLoading}
                      className={`p-2 rounded-lg transition ${
                        !hasActiveSubscription || subscriptionLoading
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                      }`}
                      title={!hasActiveSubscription ? 'נדרש מנוי פעיל כדי למחוק אנשי צוות' : 'מחק'}
                    >
                      <FiTrash2 className="text-base" />
                    </button>
                  </div>
                </div>
            ))}
              </div>
          </div>
        )}
      </div>

      {/* Staff Summary Popup */}
      {showStaffSummary && selectedStaffForView && (
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
          <div className="flex-1 bg-black/0" onClick={() => {
            setShowStaffSummary(false);
            setSelectedStaffForView(null);
          }} />

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
              onClick={() => {
                setShowStaffSummary(false);
                setSelectedStaffForView(null);
              }}
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
                {/* Client Information */}
                <div className="space-y-4">
                  {/* Avatar and Name */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-black text-white overflow-hidden"
                      >
                        {selectedStaffForView?.profileImage ? (
                          <img 
                            src={selectedStaffForView.profileImage} 
                            alt={selectedStaffForView?.name || "לקוח"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          selectedStaffForView?.initials || selectedStaffForView?.name?.charAt(0)?.toUpperCase() || "ל"
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
                        {selectedStaffForView?.name || "ללא שם"}
                      </div>
                      {selectedStaffForView?.phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600 dark:text-white">
                            {formatPhoneForDisplay(selectedStaffForView.phone)}
                          </span>
                          <button
                            type="button"
                            className="inline-block hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
                            title="התקשר"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${selectedStaffForView.phone}`;
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
                              const whatsappUrl = formatPhoneToWhatsapp(selectedStaffForView.phone);
                              window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <img 
                              src={whatsappIcon} 
                              alt="WhatsApp" 
                              className="w-7 h-7"
                              style={{ filter: 'brightness(0)' }}
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
                          className={`relative pb-3 pt-1 font-medium transition-colors ${
                            staffViewTab === key
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

                  {/* Staff Details */}
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
                              {selectedStaffForView?.name || "-"}
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
                              {selectedStaffForView?.phone ? formatPhoneForDisplay(selectedStaffForView.phone) : "-"}
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
                              {selectedStaffForView?.email || "-"}
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
                              {selectedStaffForView?.city || "-"}
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
                              {selectedStaffForView?.address || "-"}
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
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition ${
                            (selectedStaffForView?.status || "פעיל") === "לא פעיל"
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : ""
                          }`}
                          style={
                            (selectedStaffForView?.status || "פעיל") === "פעיל"
                              ? { 
                                  backgroundColor: BRAND_COLOR,
                                  color: "white"
                                }
                              : {}
                          }
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (selectedStaffForView?.status || "פעיל") === "פעיל" 
                              ? "bg-white animate-pulse" 
                              : "bg-white dark:bg-black"
                          }`}></span>
                          <span>{selectedStaffForView?.status || "פעיל"}</span>
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
                                    handleUpdateStaffStatus(selectedStaffForView.id, "פעיל");
                                    setIsStaffCardStatusDropdownOpen(false);
                                  }}
                                >
                                  <span className="flex items-center gap-2">
                                    <span
                                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                        (selectedStaffForView?.status || "פעיל") === "פעיל"
                                          ? "border-[rgba(255,37,124,1)]"
                                          : "border-gray-300 dark:border-gray-500"
                                      }`}
                                    >
                                      {(selectedStaffForView?.status || "פעיל") === "פעיל" && (
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
                                    handleUpdateStaffStatus(selectedStaffForView.id, "לא פעיל");
                                    setIsStaffCardStatusDropdownOpen(false);
                                  }}
                                >
                                  <span className="flex items-center gap-2">
                                    <span
                                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                        (selectedStaffForView?.status || "פעיל") === "לא פעיל"
                                          ? "border-gray-500"
                                          : "border-gray-300 dark:border-gray-500"
                                      }`}
                                    >
                                      {(selectedStaffForView?.status || "פעיל") === "לא פעיל" && (
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
                          {selectedStaffForView?.rating || "-"}
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
                          {selectedStaffForView?.createdAt 
                            ? formatDate(new Date(selectedStaffForView.createdAt))
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
                          const staffServices = selectedStaffForView?.services || [];
                          const isServiceEnabled = staffServices.some(s => 
                            typeof s === 'object' ? s.id === service.id : s === service.id
                          );
                          const serviceData = getStaffServiceData(selectedStaffForView?.id, service.id);
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
                                                    className={`w-full flex items-center justify-between px-3 py-2 ${
                                                      currentDuration === duration 
                                                        ? "" 
                                                        : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                                    } transition`}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleUpdateServiceField(selectedStaffForView.id, service.id, 'duration', duration);
                                                    }}
                                                  >
                                                    <span className="flex items-center gap-2">
                                                      <span
                                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                                          currentDuration === duration
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
                                        
                                        // Update without closing editing mode (even if only ₪, allow it for now - validation on close)
                                        handleUpdateServiceField(selectedStaffForView.id, service.id, 'price', value, false);
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
                                          
                                          handleUpdateServiceField(selectedStaffForView.id, service.id, 'price', value, false);
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
                                          handleUpdateServiceField(selectedStaffForView.id, service.id, 'price', value, false);
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
                                      handleToggleStaffService(selectedStaffForView.id, service.id);
                                    }}
                                    className="flex items-center justify-center"
                                  >
                                    <span
                                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                        isServiceEnabled
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
                          const workingHours = selectedStaffForView?.workingHours || {};
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
                                                className={`w-full flex items-center justify-between px-3 py-2 ${
                                                  startTime === time 
                                                    ? "" 
                                                    : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                                } transition`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUpdateWorkingHours(selectedStaffForView.id, dayIndex, 'startTime', time);
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
                                                className={`w-full flex items-center justify-between px-3 py-2 ${
                                                  endTime === time
                                                    ? "" 
                                                    : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                                } transition`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUpdateWorkingHours(selectedStaffForView.id, dayIndex, 'endTime', time);
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
                                      handleToggleWorkingHoursDay(selectedStaffForView.id, dayIndex);
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

                  {/* Advanced Data Tab */}
                  {staffViewTab === "advanced" && (
                    <div className="space-y-4 mt-6">
                      <div className="text-sm text-gray-600 dark:text-white">
                        נתונים מתקדמים
                              </div>
                          </div>
                          )}

                  {/* Removed Appointments and Data tabs - not needed for staff management */}

                                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Staff Modal */}
      <NewStaffModal
        isOpen={isNewStaffModalOpen}
        onClose={() => setIsNewStaffModalOpen(false)}
        newStaffName={newStaffName}
        newStaffPhone={newStaffPhone}
        newStaffEmail={newStaffEmail}
        newStaffCity={newStaffCity}
        newStaffAddress={newStaffAddress}
        newStaffErrors={newStaffErrors}
        onNameChange={setNewStaffName}
        onPhoneChange={setNewStaffPhone}
        onEmailChange={setNewStaffEmail}
        onCityChange={setNewStaffCity}
        onAddressChange={setNewStaffAddress}
        onSubmit={handleCreateNewStaff}
      />
    </div>
  );
}

// Removed addCalendarClient export - staff management doesn't need this function

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
import whatsappDarkIcon from "../../assets/whatsappDark.svg";
import whatsappLightIcon from "../../assets/whatsappLight.svg";
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
import { CalendarCommonTable } from "../../components/commonComponent/CalendarCommonTable";
import CommonConfirmModel from "../../components/commonComponent/CommonConfirmModel";
import { StaffSummaryCard } from "../../components/calendar/CalendarStaff/StaffSummaryCard";
import { toast } from "react-toastify";

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
  const [initialTab, setInitialTab] = useState("details"); // Initial tab for StaffSummaryCard
  const [editingValue, setEditingValue] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Check subscription status using custom hook
  const { hasActiveSubscription, subscriptionLoading } = useSubscriptionCheck({
    pageName: 'CALENDAR STAFF PAGE',
    enableLogging: false
  });

  // Update staff status
  const handleUpdateStaffStatus = async (staffId, newStatus) => {
    if (!hasActiveSubscription) {
      toast.error('נדרש מנוי פעיל כדי לערוך סטטוס. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    try {
      // Update via API
      const result = await dispatch(updateStaffAction(staffId, { isActive: newStatus === "פעיל" }));
      if (!result.success) {
        throw new Error(result.error);
      }
      const updatedStaffData = result.data;

      // Update local state
      const updatedStaff = staff.map(staffMember => {
        if (staffMember.id === staffId) {
          return {
            ...staffMember,
            status: updatedStaffData.isActive ? "פעיל" : "לא פעיל"
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

      toast.success("סטטוס עודכן בהצלחה");
    } catch (error) {
      console.error("Error updating staff status:", error);
      toast.error(error.message || "שגיאה בעדכון סטטוס. נסה שוב.");
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
          setInitialTab(tab || 'hours');
          setSelectedStaffForView(staffMember);
          setShowStaffSummary(true);
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
        // Show newest first (descending by createdAt)
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      } else if (sortBy === "oldest") {
        // Show oldest first (ascending by createdAt)
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aDate - bDate;
      } else if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return 0;
    });

    return sorted;
  }, [staff, searchQuery, sortBy, selectedStatus, selectedRating]);

  const handleDeleteStaff = (staffId) => {
    if (!hasActiveSubscription) {
      toast.error('נדרש מנוי פעיל כדי למחוק אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
      return;
    }
    setStaffToDelete(staffId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;

    try {
      const result = await dispatch(deleteStaffAction(staffToDelete));
      if (!result.success) {
        throw new Error(result.error);
      }

      const updatedStaff = staff.filter((s) => s.id !== staffToDelete);
      setStaff(updatedStaff);

      // If the deleted staff member was being viewed, close the summary
      if (selectedStaffForView?.id === staffToDelete) {
        setShowStaffSummary(false);
        setSelectedStaffForView(null);
      }

      toast.success("איש צוות נמחק בהצלחה");
      setShowDeleteConfirm(false);
      setStaffToDelete(null);
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error(error.message || "שגיאה במחיקת איש צוות. נסה שוב.");
    }
  };

  const handleDownloadSelectedClients = () => {
    if (selectedStaff.length === 0) {
      toast.error("אנא בחר לפחות איש צוות אחד להורדה");
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

  const handleDeleteSelectedClients = () => {
    if (!hasActiveSubscription) {
      toast.error('נדרש מנוי פעיל כדי למחוק אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    if (selectedStaff.length === 0) {
      toast.error("אנא בחר לפחות איש צוות אחד למחיקה");
      return;
    }

    setShowBulkDeleteConfirm(true);
  };

  const confirmDeleteSelectedClients = async () => {
    try {
      const result = await dispatch(deleteMultipleStaffAction(selectedStaff));
      if (!result.success) {
        throw new Error(result.error);
      }

      const updatedStaff = staff.filter((s) => !selectedStaff.includes(s.id));
      setStaff(updatedStaff);
      setSelectedStaff([]);
      toast.success(`${selectedStaff.length} אנשי צוות נמחקו בהצלחה`);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error(error.message || "שגיאה במחיקת אנשי צוות. נסה שוב.");
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
      toast.error('נדרש מנוי פעיל כדי ליצור אנשי צוות. אנא הירשם למנוי כדי להמשיך.');
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

  // Column definitions for CalendarCommonTable
  const columns = useMemo(() => {
    const cols = [];

    if (visibleFields.name) {
      cols.push({ key: "name", label: "שם איש צוות", width: "w-32", marginRight: 32 });
    }
    if (visibleFields.status) {
      cols.push({ key: "status", label: "סטטוס", width: "w-28", marginRight: 0 });
    }
    if (visibleFields.phone) {
      cols.push({ key: "phone", label: "מספר נייד", width: "w-40", marginRight: 0, type: "phone" });
    }
    if (visibleFields.email) {
      cols.push({ key: "email", label: "אימייל", width: "w-40", marginRight: 16 });
    }
    if (visibleFields.city) {
      cols.push({ key: "city", label: "עיר", width: "w-32", marginRight: 16 });
    }
    if (visibleFields.address) {
      cols.push({ key: "address", label: "כתובת", width: "w-40", marginRight: 16 });
    }
    if (visibleFields.createdAt) {
      cols.push({ key: "createdAt", label: "תאריך כניסה", width: "w-32", marginRight: 16, type: "date" });
    }

    return cols;
  }, [visibleFields]);

  // Custom cell renderer for staff table
  const renderCell = (column, row, rowIndex) => {
    const staffMember = row;

    // Name cell with avatar (no inline editing)
    if (column.key === "name") {
      return (
        <>
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2b2b2b] flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-white flex-shrink-0 overflow-hidden">
            {staffMember.profileImage ? (
              <img src={staffMember.profileImage} alt={staffMember.name || "איש צוות"} className="w-full h-full object-cover" />
            ) : (
              staffMember.initials || (staffMember.name ? staffMember.name.charAt(0).toUpperCase() : "ל")
            )}
          </div>
          <div className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {staffMember.name || "ללא שם"}
          </div>
        </>
      );
    }

    // Status cell with dropdown
    if (column.key === "status") {
      return (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!hasActiveSubscription) {
                toast.error('נדרש מנוי פעיל כדי לערוך סטטוס. אנא הירשם למנוי כדי להמשיך.');
                return;
              }
              const rect = e.currentTarget.getBoundingClientRect();
              setStatusDropdownPositions((prev) => ({
                ...prev,
                [staffMember.id]: {
                  top: rect.bottom + window.scrollY + 8,
                  right: window.innerWidth - rect.right,
                },
              }));
              setOpenStatusDropdowns((prev) => ({ ...prev, [staffMember.id]: !prev[staffMember.id] }));
            }}
            disabled={!hasActiveSubscription || subscriptionLoading}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition text-white ${!hasActiveSubscription || subscriptionLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90'
              } ${(staffMember.status || "פעיל") === "לא פעיל"
                ? "bg-black dark:bg-white dark:text-black"
                : ""
              }`}
            style={(staffMember.status || "פעיל") === "פעיל" ? { backgroundColor: BRAND_COLOR } : {}}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${(staffMember.status || "פעיל") === "פעיל" ? "bg-white animate-pulse" : "bg-white dark:bg-black"
                }`}
            />
            <span>{staffMember.status || "פעיל"}</span>
            <FiChevronDown className="text-[10px]" />
          </button>

          {openStatusDropdowns[staffMember.id] && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenStatusDropdowns((prev) => ({ ...prev, [staffMember.id]: false }));
                }}
              />
              <div
                dir="rtl"
                className="fixed w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                style={{
                  top: statusDropdownPositions[staffMember.id]?.top ? `${statusDropdownPositions[staffMember.id].top}px` : "auto",
                  right: statusDropdownPositions[staffMember.id]?.right ? `${statusDropdownPositions[staffMember.id].right}px` : "auto",
                }}
              >
                <div className="py-2">
                  {["פעיל", "לא פעיל"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={!hasActiveSubscription || subscriptionLoading}
                      className={`w-full flex items-center justify-between px-3 py-2 ${!hasActiveSubscription || subscriptionLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasActiveSubscription || subscriptionLoading) {
                          return;
                        }
                        handleUpdateStaffStatus(staffMember.id, s);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${(staffMember.status || "פעיל") === s
                              ? s === "לא פעיל"
                                ? "border-gray-500"
                                : "border-[rgba(255,37,124,1)]"
                              : "border-gray-300 dark:border-gray-500"
                            }`}
                        >
                          {(staffMember.status || "פעיל") === s &&
                            (s === "לא פעיל" ? (
                              <span className="w-2 h-2 rounded-full bg-gray-500" />
                            ) : (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                            ))}
                        </span>
                        <span>{s}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    // Phone cell with WhatsApp (no inline editing)
    if (column.key === "phone") {
      return (
        <>
          <div className="text-sm text-gray-700 dark:text-white whitespace-nowrap">
            {staffMember.phone ? formatPhoneForDisplay(staffMember.phone) : "-"}
          </div>

          {staffMember.phone && (
            <>
              <button
                type="button"
                className={`flex-shrink-0 transition-transform duration-200 ease-in-out ${
                  !hasActiveSubscription || subscriptionLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-110 cursor-pointer"
                }`}
                title={!hasActiveSubscription || subscriptionLoading ? "נדרש מנוי פעיל כדי להתקשר" : "התקשר"}
                disabled={!hasActiveSubscription || subscriptionLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasActiveSubscription || subscriptionLoading) {
                    toast.error('נדרש מנוי פעיל כדי להתקשר. אנא הירשם למנוי כדי להמשיך.');
                    return;
                  }
                  window.location.href = `tel:${staffMember.phone}`;
                }}
              >
                <FaPhoneAlt className="w-5 h-5 text-black dark:text-white" />
              </button>

              <button
                type="button"
                className={`flex-shrink-0 transition-transform duration-200 ease-in-out ${
                  !hasActiveSubscription || subscriptionLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-110 cursor-pointer"
                }`}
                title={!hasActiveSubscription || subscriptionLoading ? "נדרש מנוי פעיל כדי לפתוח שיחה ב-WhatsApp" : "פתח שיחה ב-WhatsApp"}
                disabled={!hasActiveSubscription || subscriptionLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasActiveSubscription || subscriptionLoading) {
                    toast.error('נדרש מנוי פעיל כדי לפתוח שיחה ב-WhatsApp. אנא הירשם למנוי כדי להמשיך.');
                    return;
                  }
                  const whatsappUrl = formatPhoneToWhatsapp(staffMember.phone);
                  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <img
                  // src={whatsappIcon}
                  src={isDarkMode ? whatsappLightIcon : whatsappDarkIcon}
                  alt="WhatsApp"
                  className="w-6 h-6"
                  // style={{ filter: isDarkMode ? "brightness(1)" : "brightness(0)" }}
                />
              </button>
            </>
          )}
        </>
      );
    }

    // Default rendering for other cells
    const fieldValue = staffMember[column.key];

    if (column.type === "currency") {
      return <div className="text-sm text-gray-700 dark:text-white">₪{(fieldValue || 0).toLocaleString()}</div>;
    }
    if (column.type === "date" && fieldValue) {
      return <div className="text-sm text-gray-700 dark:text-white">{formatDate(new Date(fieldValue))}</div>;
    }
    if (column.key === "phone") {
      return <div className="text-sm text-gray-700 dark:text-white">{fieldValue ? formatPhoneForDisplay(fieldValue) : "-"}</div>;
    }

    return <div className="text-sm text-gray-700 dark:text-white">{fieldValue || "-"}</div>;
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-customBlack" dir="rtl">
      <div className="mx-auto">
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
              className={`px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${!hasActiveSubscription || subscriptionLoading
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

        {/* CalendarCommonTable Component */}
        <CalendarCommonTable
          data={staff}
          filteredData={filteredAndSortedStaff}
          isLoading={isLoadingStaff}
          error={null}
          isAuthError={false}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="חפש איש צוות..."
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          statusOptions={[
            { key: null, label: "כל הסטטוסים" },
            { key: "פעיל", label: "פעיל" },
            { key: "לא פעיל", label: "לא פעיל" },
          ]}
          selectedRating={null}
          onRatingChange={null}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { key: "newest", label: "חדש ביותר" },
            { key: "oldest", label: "ישן ביותר" },
            { key: "name", label: "א-ב" },
          ]}
          visibleFields={visibleFields}
          onToggleFieldVisibility={toggleFieldVisibility}
          onSelectAllFieldsInCategory={selectAllFieldsInCategory}
          columnFilterCategories={[
            {
              title: "פרטים",
              fields: [
                { key: "name", label: "שם איש צוות" },
                { key: "status", label: "סטטוס" },
                { key: "phone", label: "מספר נייד" },
                { key: "email", label: "אימייל" },
                { key: "city", label: "עיר" },
                { key: "address", label: "כתובת" },
                { key: "createdAt", label: "תאריך כניסה" },
              ],
            },
          ]}
          selectedItems={selectedStaff}
          onSelectItem={handleSelectStaff}
          onSelectAll={handleSelectAll}
          onDownloadSelected={handleDownloadSelectedClients}
          onDeleteSelected={handleDeleteSelectedClients}
          hasActiveSubscription={hasActiveSubscription}
          subscriptionLoading={subscriptionLoading}
          onRowClick={(staffMember) => {
            setInitialTab("details");
            setSelectedStaffForView(staffMember);
            setShowStaffSummary(true);
          }}
          onUpdateField={handleUpdateStaffFieldInList}
          onUpdateStatus={handleUpdateStaffStatus}
          onDeleteItem={handleDeleteStaff}
          renderCell={renderCell}
          columns={columns}
          emptyStateMessage="אין אנשי צוות עדיין"
          emptySearchMessage="לא נמצאו אנשי צוות התואמים לחיפוש"
          loadingMessage="טוען אנשי צוות..."
          requiredFieldMessage='יש לבחור את "מספר נייד" בתצוגה כדי לראות את רשימת אנשי הצוות'
          requiredFieldKey="phone"
          formatDate={formatDate}
          enablePagination={true}
        />

        {false && (
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
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedStatus === null
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
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedStatus === "פעיל"
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
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedStatus === "לא פעיל"
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
                className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors ${isRatingDropdownOpen || selectedRating !== null
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
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRating === null
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
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRating === "5"
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
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRating === "4"
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
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRating === "3"
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
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRating === "2"
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
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRating === "1"
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
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedRating === "-"
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
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${sortBy === option.key
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
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${visibleFields[field.key]
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
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedStaff.length === filteredAndSortedStaff.length && filteredAndSortedStaff.length > 0
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
                className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${selectedStaff.length === 0
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
                className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${selectedStaff.length === 0 || !hasActiveSubscription || subscriptionLoading
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                    : "text-gray-600 dark:text-white hover:text-red-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
                  }`}
                title={!hasActiveSubscription ? 'נדרש מנוי פעיל כדי למחוק אנשי צוות' : 'מחיקת אנשי צוות נבחרים'}
              >
                <FiTrash2 className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Staff Summary Popup */}
      <StaffSummaryCard
        staffMember={selectedStaffForView}
        isOpen={showStaffSummary && !!selectedStaffForView}
        initialTab={initialTab}
        onClose={() => {
          setShowStaffSummary(false);
          setSelectedStaffForView(null);
        }}
        onUpdateStaff={async (staffId, updateData) => {
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
                name: updatedStaffData.fullName || staffMember.name,
                phone: updatedStaffData.phone || staffMember.phone,
                email: updatedStaffData.email || staffMember.email,
                city: updatedStaffData.city || staffMember.city,
                address: updatedStaffData.address || staffMember.address,
              };
            }
            return staffMember;
          });

          setStaff(updatedStaff);

          // Update selectedStaffForView to reflect changes
          const updatedStaffMember = updatedStaff.find(s => s.id === staffId);
          setSelectedStaffForView(updatedStaffMember);
        }}
        onUpdateStaffStatus={handleUpdateStaffStatus}
        onProfileImageUpload={(staffId, base64String) => {
          const updatedStaff = staff.map(staffMember => {
            if (staffMember.id === staffId) {
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
          const updatedStaffMember = updatedStaff.find(s => s.id === staffId);
          setSelectedStaffForView(updatedStaffMember);
        }}
        onUpdateServiceField={handleUpdateServiceField}
        onToggleStaffService={handleToggleStaffService}
        onUpdateWorkingHours={handleUpdateWorkingHours}
        onToggleWorkingHoursDay={handleToggleWorkingHoursDay}
        getStaffServiceData={getStaffServiceData}
        formatDate={formatDate}
        hasActiveSubscription={hasActiveSubscription}
        subscriptionLoading={subscriptionLoading}
        staffList={staff}
        onStaffListUpdate={(updatedStaff) => {
          setStaff(updatedStaff);
          localStorage.setItem(CALENDAR_STAFF_STORAGE_KEY, JSON.stringify(updatedStaff));
        }}
        storageKey={CALENDAR_STAFF_STORAGE_KEY}
      />

      <CommonConfirmModel
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setStaffToDelete(null);
        }}
        onConfirm={confirmDeleteStaff}
        title="מחיקת איש צוות"
        message="האם אתה בטוח שאתה רוצה למחוק את איש הצוות הזה?"
        confirmText="מחק"
        cancelText="ביטול"
        confirmColor="red"
      />

      <CommonConfirmModel
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmDeleteSelectedClients}
        title="מחיקת אנשי צוות"
        message={`האם אתה בטוח שאתה רוצה למחוק ${selectedStaff.length} איש/אנשי צוות?`}
        confirmText="מחק"
        cancelText="ביטול"
        confirmColor="red"
      />

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

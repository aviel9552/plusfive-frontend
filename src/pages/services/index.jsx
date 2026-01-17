/**
 * Services Page - Fresha Style
 * Displays all services that have been created through the calendar booking flow
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FiPackage, FiSearch, FiEdit, FiTrash2, FiEye,
  FiPlus, FiChevronDown, FiFilter, FiX, FiUpload, FiDownload, FiMail, FiUser, FiDollarSign, FiMapPin, FiHome, FiCheckCircle,
  FiCalendar, FiTrendingUp, FiClock, FiStar, FiAlertCircle, FiRefreshCw, FiGlobe, FiLink, FiTarget, FiBarChart2, FiSave,
  FiFileText, FiTag, FiCircle, FiEyeOff
} from "react-icons/fi";
import { FaStar, FaPhoneAlt } from "react-icons/fa";
import { formatPhoneForDisplay, formatPhoneForBackend, formatPhoneToWhatsapp } from "../../utils/phoneHelpers";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { BRAND_COLOR } from "../../utils/calendar/constants";
import { NewServiceModal } from "../../components/calendar/Modals/NewServiceModal";
import gradientImage from "../../assets/gradientteam.jpg";
import { DEMO_SERVICES } from "../../data/calendar/demoData";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllServicesAction,
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  deleteMultipleServicesAction
} from "../../redux/actions/serviceActions";
import { fetchCategories } from "../../redux/actions/categoryActions";
import { useSubscriptionCheck } from "../../hooks/useSubscriptionCheck";
import { STATUS, CUSTOMER_STATUS } from "../../config/constants";
import { CalendarCommonTable } from "../../components/commonComponent/CalendarCommonTable";
import CommonConfirmModel from "../../components/commonComponent/CommonConfirmModel";
import { toast } from "react-toastify";

const SERVICES_STORAGE_KEY = "services";
const COLUMN_SPACING_STORAGE_KEY = "services_column_spacing";
const VISIBLE_FIELDS_STORAGE_KEY = "services_visible_fields";

export default function ServicesPage() {
  const { language } = useLanguage();
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();

  // Get services from Redux store
  const { services: servicesFromStore, loading: isLoadingServices } = useSelector((state) => state.service);
  // Get categories from Redux store
  const { categories } = useSelector((state) => state.category || { categories: [] });
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedStatus, setSelectedStatus] = useState(null); // null = כל הסטטוסים
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isColumnFilterDropdownOpen, setIsColumnFilterDropdownOpen] = useState(false);
  const [openStatusDropdowns, setOpenStatusDropdowns] = useState({}); // Track which service status dropdown is open
  const [statusDropdownPositions, setStatusDropdownPositions] = useState({}); // Track dropdown positions
  const [durationDropdownPositions, setDurationDropdownPositions] = useState({}); // Track duration dropdown positions
  const [categoryDropdownPositions, setCategoryDropdownPositions] = useState({}); // Track category dropdown positions
  const [colorDropdownPositions, setColorDropdownPositions] = useState({}); // Track color dropdown positions
  const [isServiceCardStatusDropdownOpen, setIsServiceCardStatusDropdownOpen] = useState(false); // Track status dropdown in service card
  const [editingServiceField, setEditingServiceField] = useState(null); // Track which service field is being edited: "duration-{serviceId}" or "price-{serviceId}"
  const [openDurationDropdowns, setOpenDurationDropdowns] = useState({}); // Track which service duration dropdown is open
  const [openPriceDropdowns, setOpenPriceDropdowns] = useState({}); // Track which service price dropdown is open
  const [priceDropdownPositions, setPriceDropdownPositions] = useState({}); // Track price dropdown positions
  const [openWorkingHoursDropdowns, setOpenWorkingHoursDropdowns] = useState({}); // Track which working hours dropdown is open: "start-{day}" or "end-{day}"
  const [openAdvancedSettingsDropdowns, setOpenAdvancedSettingsDropdowns] = useState({}); // Track advanced settings dropdowns: "earliestBookingTime" or "latestBookingTime"
  const [visibleFields, setVisibleFields] = useState(() => {
    // Default visible fields for services - ברירת מחדל: כל השדות חוץ מהערות
    const defaultFields = {
      // פרטי בסיס
      name: true,
      status: true,
      email: true,
      city: true,
      address: true,
      duration: true,
      price: true,
      notes: false, // הערות לא מוצגות בברירת מחדל
      category: true,
      color: true,
      hideFromClients: true,
      createdAt: false,
    };

    // Load from sessionStorage (only for current session)
    // Every time user enters/refreshes, it resets to defaults
    try {
      const stored = sessionStorage.getItem(VISIBLE_FIELDS_STORAGE_KEY);
      if (stored) {
        return { ...defaultFields, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading visible fields:", error);
    }
    return defaultFields;
  });
  const [selectedServiceForView, setSelectedServiceForView] = useState(null);
  const [showServiceSummary, setShowServiceSummary] = useState(false);
  const [serviceViewTab, setServiceViewTab] = useState("details"); // "details" or "advanced" for service
  const prevSelectedServiceIdRef = useRef(null);
  const [editingField, setEditingField] = useState(null); // Track which field is being edited in the list
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [editedServiceData, setEditedServiceData] = useState({
    name: "",
    notes: "",
    category: "",
    price: "",
    duration: "",
    color: "",
    hideFromClients: false
  });
  const profileImageInputRef = useRef(null);
  const priceInputRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle clicks outside price input to close editing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingServiceField && editingServiceField.startsWith('price-') && priceInputRef.current && !priceInputRef.current.contains(event.target)) {
        // Ensure ₪ is present and at least one digit exists before closing
        const serviceId = editingServiceField.replace('price-', '');
        const service = selectedServiceForView?.services?.find(s =>
          typeof s === 'object' ? s.id === serviceId : s === serviceId
        );
        if (service && typeof service === 'object' && selectedServiceForView) {
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
            const updatedServices = services.map(service => {
              if (service.id === selectedServiceForView.id) {
                const currentServices = service.services || [];
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
                    ...service,
                    services: updatedServices
                  };
                }
              }
              return service;
            });

            setServices(updatedServices);
            localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));

            // Update selectedServiceForView if it's the same service
            const updatedServicesMember = updatedServices.find(s => s.id === selectedServiceForView.id);
            if (updatedServicesMember) {
              setSelectedServiceForView(updatedServicesMember);
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
  }, [editingServiceField, selectedServiceForView, services]);

  // Update edited data when service changes
  useEffect(() => {
    if (selectedServiceForView) {
      setEditedServiceData({
        name: selectedServiceForView.name || "",
        notes: selectedServiceForView.notes || "",
        category: selectedServiceForView.category || "",
        price: selectedServiceForView.price || "",
        duration: selectedServiceForView.duration || "",
        color: selectedServiceForView.color || "#FF257C",
        hideFromClients: selectedServiceForView.hideFromClients || false
      });
      setEditingField(null);
      // Only reset to "details" tab when opening a NEW service popup (different service)
      // Don't change tab if we're already viewing a service and just updating data
      if (!prevSelectedServiceIdRef.current || selectedServiceForView.id !== prevSelectedServiceIdRef.current) {
        setServiceViewTab("details");
      }
      prevSelectedServiceIdRef.current = selectedServiceForView.id;
    } else {
      prevSelectedServiceIdRef.current = null;
    }
  }, [selectedServiceForView]);

  // Handle profile image upload
  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedServiceForView) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('אנא בחר קובץ תמונה');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('גודל הקובץ גדול מדי. מקסימום 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;

      const updatedServices = services.map(service => {
        if (service.id === selectedServiceForView.id) {
          return {
            ...service,
            profileImage: base64String
          };
        }
        return service;
      });

      setServices(updatedServices);
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));

      // Update selectedServiceForView to reflect changes
      const updatedServicesMember = updatedServices.find(s => s.id === selectedServiceForView.id);
      setSelectedServiceForView(updatedServicesMember);
    };
    reader.onerror = () => {
      toast.error('שגיאה בקריאת הקובץ');
    };
    reader.readAsDataURL(file);
  };

  // Update service status
  const handleUpdateServiceStatus = async (serviceId, newStatus) => {
    if (!hasActiveSubscription) {
      toast.error('נדרש מנוי פעיל כדי לערוך סטטוס. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    try {
      const isActive = newStatus === "פעיל";
      const result = await dispatch(updateServiceAction(serviceId, { isActive }));
      if (!result.success) {
        throw new Error(result.error);
      }

      const updatedServices = services.map(service => {
        if (service.id === serviceId) {
          return {
            ...service,
            status: newStatus
          };
        }
        return service;
      });

      setServices(updatedServices);

      // Update selectedServiceForView if it's the same service
      if (selectedServiceForView && selectedServiceForView.id === serviceId) {
        const updatedServicesMember = updatedServices.find(s => s.id === serviceId);
        setSelectedServiceForView(updatedServicesMember);
      }

      // Close the dropdown
      setOpenStatusDropdowns(prev => ({ ...prev, [serviceId]: false }));
    } catch (error) {
      console.error("Error updating service status:", error);
      // Don't show alert for status updates, just log the error
    }
  };

  // Toggle service status
  const handleToggleServiceStatus = (serviceId) => {
    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        return {
          ...service,
          status: service.status === "פעיל" ? "לא פעיל" : "פעיל"
        };
      }
      return service;
    });

    setServices(updatedServices);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));

    // Update selectedServiceForView if it's the same service
    if (selectedServiceForView && selectedServiceForView.id === serviceId) {
      const updatedService = updatedServices.find(s => s.id === serviceId);
      setSelectedServiceForView(updatedService);
    }
  };

  // Update working hours for staff member
  const handleUpdateWorkingHours = (serviceId, dayIndex, field, value) => {
    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        const currentWorkingHours = service.workingHours || {};
        const dayKey = DAYS_OF_WEEK[dayIndex];

        return {
          ...service,
          workingHours: {
            ...currentWorkingHours,
            [dayKey]: {
              ...currentWorkingHours[dayKey],
              [field]: value
            }
          }
        };
      }
      return service;
    });

    setServices(updatedServices);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));

    // Update selectedServiceForView if it's the same service
    if (selectedServiceForView && selectedServiceForView.id === serviceId) {
      const updatedServicesMember = updatedServices.find(s => s.id === serviceId);
      setSelectedServiceForView(updatedServicesMember);
    }

    // Close the dropdown
    const dropdownKey = `${field}-${dayIndex}`;
    setOpenWorkingHoursDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
  };

  // Toggle working hours active/inactive for a day
  const handleToggleWorkingHoursDay = (serviceId, dayIndex) => {
    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        const currentWorkingHours = service.workingHours || {};
        const dayKey = DAYS_OF_WEEK[dayIndex];
        const currentDayData = currentWorkingHours[dayKey] || {};
        const isActive = currentDayData.active !== false; // Default to true

        return {
          ...service,
          workingHours: {
            ...currentWorkingHours,
            [dayKey]: {
              ...currentDayData,
              active: !isActive
            }
          }
        };
      }
      return service;
    });

    setServices(updatedServices);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));

    // Update selectedServiceForView if it's the same service
    if (selectedServiceForView && selectedServiceForView.id === serviceId) {
      const updatedServicesMember = updatedServices.find(s => s.id === serviceId);
      setSelectedServiceForView(updatedServicesMember);
    }
  };

  // Get service data
  const getServiceData = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (!service || !service.services) return null;

    const serviceData = service.services.find(s =>
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
  const handleUpdateServiceField = (serviceId, field, value, shouldCloseEditing = true) => {
    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        const currentServices = service.services || [];
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
            ...service,
            services: updatedServices
          };
        }
      }
      return service;
    });

    setServices(updatedServices);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));

    // Update selectedServiceForView if it's the same service
    if (selectedServiceForView && selectedServiceForView.id === serviceId) {
      const updatedServicesMember = updatedServices.find(s => s.id === serviceId);
      setSelectedServiceForView(updatedServicesMember);
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

  // Update service field directly from list
  const handleUpdateServiceFieldInList = async (serviceId, field, value) => {
    if (!hasActiveSubscription) {
      toast.error('נדרש מנוי פעיל כדי לערוך שירותים. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    try {
      const updateData = {};

      if (field === "name") {
        updateData.name = value;
      } else if (field === "notes") {
        updateData.notes = value || null;
      } else if (field === "category") {
        updateData.category = value || null;
      } else if (field === "price") {
        const priceDigits = typeof value === 'string' ? value.replace(/[^\d]/g, '') : value.toString().replace(/[^\d]/g, '');
        updateData.price = priceDigits ? parseFloat(priceDigits) : 0;
      } else if (field === "duration") {
        updateData.duration = parseInt(value);
      } else if (field === "color") {
        updateData.color = value || "#FF257C";
      } else if (field === "hideFromClients") {
        updateData.hideFromClients = value;
      }

      // Update via Redux action
      const result = await dispatch(updateServiceAction(serviceId, updateData));
      if (!result.success) {
        throw new Error(result.error);
      }
      const updatedServiceData = result.data;

      // Update local state
      const updatedServices = services.map(service => {
        if (service.id === serviceId) {
          return {
            ...service,
            name: updatedServiceData.name || (field === "name" ? value : service.name),
            notes: updatedServiceData.notes !== undefined ? updatedServiceData.notes : (field === "notes" ? value : service.notes),
            category: updatedServiceData.category !== undefined ? updatedServiceData.category : (field === "category" ? value : service.category),
            price: updatedServiceData.price || (field === "price" ? parseFloat(value) : service.price),
            duration: updatedServiceData.duration || (field === "duration" ? parseInt(value) : service.duration),
            color: updatedServiceData.color || (field === "color" ? value : service.color),
            hideFromClients: updatedServiceData.hideFromClients !== undefined ? updatedServiceData.hideFromClients : (field === "hideFromClients" ? value : service.hideFromClients),
          };
        }
        return service;
      });

      setServices(updatedServices);

      // Update selectedServiceForView if it's the same service
      if (selectedServiceForView && selectedServiceForView.id === serviceId) {
        const updatedService = updatedServices.find(s => s.id === serviceId);
        setSelectedServiceForView(updatedService);
      }
    } catch (error) {
      console.error("Error updating service field:", error);
      // Don't show alert for inline editing, just log the error
    }
  };

  // Save edited field
  const handleSaveField = async (fieldName) => {
    if (!selectedServiceForView) return;

    if (!hasActiveSubscription) {
      toast.error('נדרש מנוי פעיל כדי לערוך שירותים. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    try {
      const updateData = {};

      if (fieldName === "name") {
        updateData.name = editedServiceData.name;
      } else if (fieldName === "notes") {
        updateData.notes = editedServiceData.notes || null;
      } else if (fieldName === "category") {
        updateData.category = editedServiceData.category || null;
      } else if (fieldName === "price") {
        let priceValue = editedServiceData.price;
        if (typeof priceValue === 'string') {
          const digits = priceValue.replace(/[^\d]/g, '');
          if (digits.length > 0) {
            priceValue = parseFloat(digits);
          } else {
            priceValue = 0;
          }
        }
        updateData.price = priceValue;
      } else if (fieldName === "duration") {
        updateData.duration = parseInt(editedServiceData.duration);
      } else if (fieldName === "color") {
        updateData.color = editedServiceData.color || "#FF257C";
      } else if (fieldName === "hideFromClients") {
        updateData.hideFromClients = editedServiceData.hideFromClients;
      }

      // Update via Redux action
      const result = await dispatch(updateServiceAction(selectedServiceForView.id, updateData));
      if (!result.success) {
        throw new Error(result.error);
      }
      const updatedServiceData = result.data;

      // Update local state
      const updatedServices = services.map(service => {
        if (service.id === selectedServiceForView.id) {
          return {
            ...service,
            name: updatedServiceData.name || editedServiceData.name,
            notes: updatedServiceData.notes || editedServiceData.notes,
            category: updatedServiceData.category || editedServiceData.category,
            price: updatedServiceData.price || (fieldName === "price" ? parseFloat(editedServiceData.price) : service.price),
            duration: updatedServiceData.duration || (fieldName === "duration" ? parseInt(editedServiceData.duration) : service.duration),
            color: updatedServiceData.color || editedServiceData.color,
            hideFromClients: updatedServiceData.hideFromClients !== undefined ? updatedServiceData.hideFromClients : editedServiceData.hideFromClients,
          };
        }
        return service;
      });

      setServices(updatedServices);

      // Update selectedServiceForView to reflect changes
      const updatedServicesMember = updatedServices.find(s => s.id === selectedServiceForView.id);
      setSelectedServiceForView(updatedServicesMember);

      setEditingField(null);
      toast.success("שירות עודכן בהצלחה");
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error(error.message || "שגיאה בעדכון שירות. נסה שוב.");
    }
  };

  // Cancel editing field
  const handleCancelEditField = (fieldName) => {
    if (selectedServiceForView) {
      if (fieldName === "name") {
        setEditedServiceData({ ...editedServiceData, name: selectedServiceForView.name || "" });
      } else if (fieldName === "duration") {
        setEditedServiceData({ ...editedServiceData, duration: selectedServiceForView.duration || "" });
      } else if (fieldName === "price") {
        setEditedServiceData({ ...editedServiceData, price: selectedServiceForView.price || "" });
      } else if (fieldName === "notes") {
        setEditedServiceData({ ...editedServiceData, notes: selectedServiceForView.notes || "" });
      } else if (fieldName === "category") {
        setEditedServiceData({ ...editedServiceData, category: selectedServiceForView.category || "" });
      } else if (fieldName === "color") {
        setEditedServiceData({ ...editedServiceData, color: selectedServiceForView.color || "#FF257C" });
      }
    }
    setEditingField(null);
  };

  // Column spacing state
  const [columnSpacing, setColumnSpacing] = useState({
    nameToStatus: 32, // mr-8 = 32px
    statusToPhone: 0,
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


  // Save visible fields to sessionStorage when they change (only for current session)
  useEffect(() => {
    try {
      sessionStorage.setItem(VISIBLE_FIELDS_STORAGE_KEY, JSON.stringify(visibleFields));
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

  // New service modal state
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceNotes, setNewServiceNotes] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("");
  const [newServiceColor, setNewServiceColor] = useState("#FF257C");
  const [newServiceHideFromClients, setNewServiceHideFromClients] = useState(false);
  const [newServiceErrors, setNewServiceErrors] = useState({});

  // Check subscription status using custom hook
  const { hasActiveSubscription, subscriptionLoading } = useSubscriptionCheck({
    pageName: 'SERVICES PAGE',
    enableLogging: true
  });

  // Transform services from Redux store to frontend format
  const transformService = (s) => ({
    id: s.id,
    name: s.name || "",
    notes: s.notes || "",
    category: s.category || "",
    price: s.price || 0,
    duration: s.duration || 30,
    color: s.color || "#FF257C",
    hideFromClients: s.hideFromClients || false,
    status: s.isActive ? "פעיל" : "לא פעיל",
    createdAt: s.createdAt || new Date().toISOString(),
  });

  // Load services from Redux store on mount
  useEffect(() => {
    const fetchServices = async () => {
      const result = await dispatch(getAllServicesAction());
      if (result.success) {
        // Services will be updated via servicesFromStore useEffect
      } else {
        console.error("Error loading services:", result.error);
        // Fallback to localStorage if API fails
        const storedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
        if (storedServices) {
          try {
            setServices(JSON.parse(storedServices));
          } catch (parseError) {
            console.error("Error loading services from localStorage:", parseError);
          }
        }
      }
    };

    // Only fetch if store is empty
    if (servicesFromStore.length === 0) {
      fetchServices();
    }
  }, [dispatch]);

  // Sync services from Redux store to local state
  useEffect(() => {
    if (servicesFromStore.length > 0) {
      const transformedServices = servicesFromStore.map(transformService);
      setServices(transformedServices);
    }
  }, [servicesFromStore]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = services;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      const queryLower = query.toLowerCase();

      filtered = services.filter((service) => {
        // Check name (normal search)
        const nameMatch = service.name?.toLowerCase().includes(queryLower);

        return nameMatch;
      });
    }

    // Filter by status
    if (selectedStatus !== null) {
      filtered = filtered.filter((service) => {
        const serviceStatus = service.status || "פעיל";
        // Support both Hebrew and English status values
        const statusMap = {
          "פעיל": "פעיל",
          [STATUS.ACTIVE]: "פעיל",
          "Active": "פעיל",
          "לא פעיל": "לא פעיל",
          [STATUS.INACTIVE]: "לא פעיל",
          "Inactive": "לא פעיל",
          "בסיכון": "בסיכון",
          [CUSTOMER_STATUS.AT_RISK]: "בסיכון",
          "At Risk": "בסיכון",
          "אבוד": "אבוד",
          [CUSTOMER_STATUS.LOST]: "אבוד",
          "Lost": "אבוד",
          "התאושש": "התאושש",
          [CUSTOMER_STATUS.RECOVERED]: "התאושש",
          "Recovered": "התאושש",
          "חדש": "חדש",
          [CUSTOMER_STATUS.NEW]: "חדש",
          "New": "חדש"
        };
        const normalizedServiceStatus = statusMap[serviceStatus] || serviceStatus;
        return normalizedServiceStatus === selectedStatus;
      });
    }


    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      } else if (sortBy === "oldest") {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aDate - bDate;
      } else if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return 0;
    });

    return sorted;
  }, [services, searchQuery, sortBy, selectedStatus]);

  // Removed clientAdvancedStats - not needed for staff management

  const handleDeleteService = (serviceId) => {
    if (!hasActiveSubscription) {
      toast.error('נדרש מנוי פעיל כדי למחוק שירותים. אנא הירשם למנוי כדי להמשיך.');
      return;
    }
    setServiceToDelete(serviceId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      const result = await dispatch(deleteServiceAction(serviceToDelete));
      if (!result.success) {
        throw new Error(result.error);
      }

      const updatedServices = services.filter((s) => s.id !== serviceToDelete);
      setServices(updatedServices);

      // If the deleted service was being viewed, close the summary
      if (selectedServiceForView?.id === serviceToDelete) {
        setShowServiceSummary(false);
        setSelectedServiceForView(null);
      }

      toast.success("שירות נמחק בהצלחה");
      setShowDeleteConfirm(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error(error.message || "שגיאה במחיקת שירות. נסה שוב.");
    }
  };

  const handleDownloadSelectedClients = () => {
    if (selectedServices.length === 0) {
      toast.error("אנא בחר לפחות שירות אחד להורדה");
      return;
    }

    const selectedServicesData = services.filter((s) => selectedServices.includes(s.id));

    // Convert to CSV
    const headers = ["שם", "משך", "מחיר", "סטטוס"];
    const rows = selectedServicesData.map(service => [
      service.name || "",
      service.duration || "",
      service.price || "",
      service.status || "פעיל"
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
      toast.error('נדרש מנוי פעיל כדי למחוק שירותים. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    if (selectedServices.length === 0) {
      toast.error("אנא בחר לפחות שירות אחד למחיקה");
      return;
    }

    setShowBulkDeleteConfirm(true);
  };

  const confirmDeleteSelectedClients = async () => {
    try {
      const result = await dispatch(deleteMultipleServicesAction(selectedServices));
      if (!result.success) {
        throw new Error(result.error);
      }

      const updatedServices = services.filter((s) => !selectedServices.includes(s.id));
      setServices(updatedServices);
      setSelectedServices([]);
      toast.success(`${selectedServices.length} שירותים נמחקו בהצלחה`);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting services:", error);
      toast.error(error.message || "שגיאה במחיקת שירותים. נסה שוב.");
    }
  };

  const handleSelectAll = () => {
    if (selectedServices.length === filteredAndSortedServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredAndSortedServices.map(c => c.id));
    }
  };

  const handleSelectService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Column definitions for CalendarCommonTable
  const columns = useMemo(() => {
    const cols = [];

    if (visibleFields.name) {
      cols.push({ key: "name", label: "שם שירות", width: "w-32", marginRight: 32 });
    }
    if (visibleFields.status) {
      cols.push({ key: "status", label: "סטטוס", width: "w-28", marginRight: 0 });
    }
    if (visibleFields.duration) {
      cols.push({ key: "duration", label: "משך שירות", width: "w-40", marginRight: 16 });
    }
    if (visibleFields.price) {
      cols.push({ key: "price", label: "מחיר", width: "w-40", marginRight: 8 });
    }
    if (visibleFields.notes) {
      cols.push({ key: "notes", label: "הערות", width: "w-48", marginRight: 16 });
    }
    if (visibleFields.category) {
      cols.push({ key: "category", label: "קטגוריה", width: "w-32", marginRight: 16 });
    }
    if (visibleFields.color) {
      cols.push({ key: "color", label: "צבע", width: "w-24", marginRight: 16 });
    }
    if (visibleFields.hideFromClients) {
      cols.push({ key: "hideFromClients", label: "להסתיר מלקוחות", width: "w-32", marginRight: 16 });
    }
    if (visibleFields.createdAt) {
      cols.push({ key: "createdAt", label: "תאריך יצירה", width: "w-32", marginRight: 16, type: "date" });
    }

    return cols;
  }, [visibleFields]);

  // Custom cell renderer for services table
  const renderCell = (column, row, rowIndex) => {
    const service = row;

    // Name cell
    if (column.key === "name") {
      return (
        <>
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2b2b2b] flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-white flex-shrink-0 overflow-hidden">
            {service.name ? service.name.charAt(0).toUpperCase() : "ש"}
          </div>
          <div className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {service.name || "ללא שם"}
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
              setStatusDropdownPositions(prev => ({
                ...prev,
                [service.id]: {
                  top: rect.bottom + window.scrollY + 8,
                  right: window.innerWidth - rect.right
                }
              }));
              setOpenStatusDropdowns(prev => ({ ...prev, [service.id]: !prev[service.id] }));
            }}
            disabled={!hasActiveSubscription || subscriptionLoading}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition text-white ${!hasActiveSubscription || subscriptionLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90'
              } ${(service.status || "פעיל") === "לא פעיל"
                ? "bg-black dark:bg-white dark:text-black"
                : ""
              }`}
            style={(service.status || "פעיל") === "פעיל" ? { backgroundColor: BRAND_COLOR } : {}}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${(service.status || "פעיל") === "פעיל" ? "bg-white animate-pulse" : "bg-white dark:bg-black"
              }`}></span>
            <span>{service.status || "פעיל"}</span>
            <FiChevronDown className="text-[10px]" />
          </button>

          {openStatusDropdowns[service.id] && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenStatusDropdowns(prev => ({ ...prev, [service.id]: false }));
                }}
              />
              <div
                dir="rtl"
                className="fixed w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                style={{
                  top: statusDropdownPositions[service.id]?.top ? `${statusDropdownPositions[service.id].top}px` : 'auto',
                  right: statusDropdownPositions[service.id]?.right ? `${statusDropdownPositions[service.id].right}px` : 'auto'
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
                        handleUpdateServiceStatus(service.id, s);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${(service.status || "פעיל") === s
                              ? s === "לא פעיל"
                                ? "border-gray-500"
                                : "border-[rgba(255,37,124,1)]"
                              : "border-gray-300 dark:border-gray-500"
                            }`}
                        >
                          {(service.status || "פעיל") === s &&
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

    // Default rendering for other cells
    const fieldValue = service[column.key];

    if (column.type === "date" && fieldValue) {
      return <div className="text-sm text-gray-700 dark:text-white">{formatDate(new Date(fieldValue))}</div>;
    }
    if (column.key === "price") {
      return <div className="text-sm text-gray-700 dark:text-white">{fieldValue ? (typeof fieldValue === 'number' ? `₪${fieldValue}` : fieldValue) : "-"}</div>;
    }
    if (column.key === "duration") {
      const minutes = Number(fieldValue);
      if (isNaN(minutes)) return <div className="text-sm text-gray-700 dark:text-white">{fieldValue || "-"}</div>;
      if (minutes === 60) return <div className="text-sm text-gray-700 dark:text-white">1 שעה</div>;
      if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) return <div className="text-sm text-gray-700 dark:text-white">{hours} שעות</div>;
        return <div className="text-sm text-gray-700 dark:text-white">{hours} שעות {remainingMinutes} דק'</div>;
      }
      return <div className="text-sm text-gray-700 dark:text-white">{minutes} דק'</div>;
    }
    if (column.key === "color") {
      return (
        <div
          className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: fieldValue || "#FF257C" }}
          title={fieldValue || "#FF257C"}
        />
      );
    }
    if (column.key === "hideFromClients") {
      return (
        <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center ${fieldValue
            ? "bg-[#ff257c] justify-end"
            : "bg-gray-300 dark:bg-gray-600 justify-start"
          }`}>
          <span className="w-5 h-5 bg-white rounded-full shadow-sm mx-0.5" />
        </div>
      );
    }

    return <div className="text-sm text-gray-700 dark:text-white">{fieldValue || "-"}</div>;
  };

  // Handle creating a new service
  const handleCreateNewService = async () => {
    const errors = {};
    if (!newServiceName.trim()) {
      errors.name = "שם שירות הוא שדה חובה";
    }

    if (!newServicePrice.trim()) {
      errors.price = "מחיר הוא שדה חובה";
    } else if (isNaN(parseFloat(newServicePrice)) || parseFloat(newServicePrice) < 0) {
      errors.price = "מחיר חייב להיות מספר חיובי";
    }

    if (!newServiceDuration.trim()) {
      errors.duration = "משך השירות הוא שדה חובה";
    }

    setNewServiceErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      // Create service via Redux action
      const serviceData = {
        name: newServiceName.trim(),
        notes: newServiceNotes.trim() || null,
        category: newServiceCategory || null,
        price: parseFloat(newServicePrice),
        duration: parseInt(newServiceDuration),
        color: newServiceColor || "#FF257C",
        hideFromClients: newServiceHideFromClients || false,
      };

      const result = await dispatch(createServiceAction(serviceData));
      if (!result.success) {
        throw new Error(result.error);
      }
      const createdService = result.data;

      // Transform API response to match frontend format
      const newService = {
        id: createdService.id,
        name: createdService.name || newServiceName.trim(),
        notes: createdService.notes || "",
        category: createdService.category || "",
        price: createdService.price || parseFloat(newServicePrice),
        duration: createdService.duration || parseInt(newServiceDuration),
        color: createdService.color || newServiceColor || "#FF257C",
        hideFromClients: createdService.hideFromClients || false,
        status: createdService.isActive ? "פעיל" : "לא פעיל",
        createdAt: createdService.createdAt || new Date().toISOString(),
      };

      // Add service to services list
      const updatedServices = [newService, ...services];
      setServices(updatedServices);

      // Close modal
      setIsNewServiceModalOpen(false);

      // Reset form fields
      setNewServiceName("");
      setNewServiceNotes("");
      setNewServiceCategory("");
      setNewServicePrice("");
      setNewServiceDuration("");
      setNewServiceColor("#FF257C");
      setNewServiceHideFromClients(false);
      setNewServiceErrors({});
    } catch (error) {
      console.error("Error creating service:", error);
      setNewServiceErrors({
        submit: error.message || "שגיאה ביצירת שירות. נסה שוב."
      });
    }
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-customBlack" dir="rtl">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                שירותים
              </h1>
              {services.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-white bg-gray-100 dark:bg-[#181818] px-2 py-0.5 rounded">
                  {services.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-white">
              צפה, הוסף, ערוך ומחק את השירותים שלך.{" "}
              <a href="#" className="text-[#ff257c] hover:underline">למד עוד</a>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!hasActiveSubscription) {
                  toast.error('נדרש מנוי פעיל כדי ליצור שירותים. אנא הירשם למנוי כדי להמשיך.');
                  return;
                }
                setNewServiceName("");
                setNewServiceNotes("");
                setNewServiceCategory("");
                setNewServicePrice("");
                setNewServiceDuration("");
                setNewServiceColor("#FF257C");
                setNewServiceHideFromClients(false);
                setNewServiceErrors({});
                setIsNewServiceModalOpen(true);
              }}
              disabled={!hasActiveSubscription || subscriptionLoading}
              className={`px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${!hasActiveSubscription || subscriptionLoading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-white cursor-not-allowed'
                  : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                }`}
              title={!hasActiveSubscription ? 'נדרש מנוי פעיל כדי ליצור שירותים' : ''}
            >
              חדש
              <FiPlus className="text-base" />
            </button>
          </div>
        </div>

        {/* CalendarCommonTable Component */}
        <CalendarCommonTable
          data={services}
          filteredData={filteredAndSortedServices}
          isLoading={isLoadingServices}
          error={null}
          isAuthError={false}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="חפש שירות..."
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
                { key: "name", label: "שם שירות" },
                { key: "status", label: "סטטוס" },
                { key: "duration", label: "משך שירות" },
                { key: "price", label: "מחיר" },
                { key: "notes", label: "הערות" },
                { key: "category", label: "קטגוריה" },
                { key: "color", label: "צבע" },
                { key: "hideFromClients", label: "להסתיר מלקוחות" },
                { key: "createdAt", label: "תאריך יצירה" },
              ],
            },
          ]}
          selectedItems={selectedServices}
          onSelectItem={handleSelectService}
          onSelectAll={handleSelectAll}
          onDownloadSelected={handleDownloadSelectedClients}
          onDeleteSelected={handleDeleteSelectedClients}
          hasActiveSubscription={hasActiveSubscription}
          subscriptionLoading={subscriptionLoading}
          onRowClick={(service) => {
            setSelectedServiceForView(service);
            setShowServiceSummary(true);
            setServiceViewTab("details");
          }}
          onUpdateField={handleUpdateServiceFieldInList}
          onUpdateStatus={handleUpdateServiceStatus}
          onDeleteItem={handleDeleteService}
          renderCell={renderCell}
          columns={columns}
          emptyStateMessage="אין שירותים עדיין"
          emptySearchMessage="לא נמצאו שירותים התואמים לחיפוש"
          loadingMessage="טוען שירותים..."
          requiredFieldMessage='יש לבחור את "שם שירות" בתצוגה כדי לראות את רשימת השירותים'
          requiredFieldKey="name"
          formatDate={formatDate}
          enablePagination={true}
        />
      </div>

      {/* Staff Summary Popup */}
      {showServiceSummary && selectedServiceForView && (
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
            setShowServiceSummary(false);
            setSelectedServiceForView(null);
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
                setShowServiceSummary(false);
                setSelectedServiceForView(null);
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
                        {selectedServiceForView?.name?.charAt(0)?.toUpperCase() || "ש"}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col relative">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1.5">
                        {selectedServiceForView?.name || "ללא שם"}
                      </div>
                      {selectedServiceForView?.duration && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600 dark:text-white">
                            {(() => {
                              const minutes = Number(selectedServiceForView.duration);
                              if (isNaN(minutes)) return selectedServiceForView.duration;
                              if (minutes === 60) return "1 שעה";
                              if (minutes > 60) {
                                const hours = Math.floor(minutes / 60);
                                const remainingMinutes = minutes % 60;
                                if (remainingMinutes === 0) return `${hours} שעות`;
                                return `${hours} שעות ${remainingMinutes} דק'`;
                              }
                              return `${minutes} דק'`;
                            })()}
                          </span>
                        </div>
                      )}
                      {selectedServiceForView?.price && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600 dark:text-white">
                            {typeof selectedServiceForView.price === 'number' ? `₪${selectedServiceForView.price}` : selectedServiceForView.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* קטגוריות תצוגה */}
                  <div className="border-b border-gray-200 dark:border-[#262626] mb-4 mt-4">
                    <div className="flex items-center gap-6 text-xs sm:text-sm px-2">
                      {[
                        { key: "details", label: "פרטים" },
                        { key: "advanced", label: "הגדרות מתקדמות" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={(e) => {
                            e.stopPropagation();
                            setServiceViewTab(key);
                          }}
                          className={`relative pb-3 pt-1 font-medium transition-colors ${serviceViewTab === key
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500 dark:text-white"
                            }`}
                        >
                          {label}
                          {serviceViewTab === key && (
                            <span
                              className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                              style={{ backgroundColor: BRAND_COLOR }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Service Details */}
                  {serviceViewTab === "details" && (
                    <div className="space-y-4 mt-6">
                      {/* שם שירות */}
                      <div
                        className={`flex items-center gap-3 group ${!hasActiveSubscription || subscriptionLoading
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer'
                          }`}
                        onClick={(e) => {
                          if (!hasActiveSubscription || subscriptionLoading) {
                            toast.error('נדרש מנוי פעיל כדי לערוך שירותים. אנא הירשם למנוי כדי להמשיך.');
                            return;
                          }
                          if (editingField !== "name") {
                            e.stopPropagation();
                            setEditingField("name");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiPackage className="text-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-white mb-1">שם שירות</div>
                          {editingField === "name" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editedServiceData.name}
                                onChange={(e) => setEditedServiceData({ ...editedServiceData, name: e.target.value })}
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
                                {selectedServiceForView?.name || "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!hasActiveSubscription || subscriptionLoading) {
                                    toast.error('נדרש מנוי פעיל כדי לערוך שירותים. אנא הירשם למנוי כדי להמשיך.');
                                    return;
                                  }
                                  setEditingField("name");
                                }}
                                disabled={!hasActiveSubscription || subscriptionLoading}
                                className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-full transition-all ${!hasActiveSubscription || subscriptionLoading
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333]'
                                  }`}
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* משך שירות */}
                      <div
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "duration") {
                            e.stopPropagation();
                            setEditingField("duration");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiClock className="text-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-white mb-1">משך שירות</div>
                          {editingField === "duration" ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editedServiceData.duration || ""}
                                onChange={(e) => setEditedServiceData({ ...editedServiceData, duration: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("duration");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              >
                                {(() => {
                                  const options = [];
                                  for (let minutes = 10; minutes <= 60; minutes += 5) {
                                    options.push({ value: minutes, label: minutes === 60 ? "1 שעה" : `${minutes} דק'` });
                                  }
                                  for (let minutes = 65; minutes <= 300; minutes += 5) {
                                    const hours = Math.floor(minutes / 60);
                                    const remainingMinutes = minutes % 60;
                                    if (remainingMinutes === 0) {
                                      options.push({ value: minutes, label: `${hours} שעות` });
                                    } else {
                                      options.push({ value: minutes, label: `${hours} שעות ${remainingMinutes} דק'` });
                                    }
                                  }
                                  return options;
                                })().map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("duration");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("duration");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedServiceForView?.duration
                                  ? (() => {
                                    const minutes = Number(selectedServiceForView.duration);
                                    if (isNaN(minutes)) return selectedServiceForView.duration;
                                    if (minutes === 60) return "1 שעה";
                                    if (minutes > 60) {
                                      const hours = Math.floor(minutes / 60);
                                      const remainingMinutes = minutes % 60;
                                      if (remainingMinutes === 0) return `${hours} שעות`;
                                      return `${hours} שעות ${remainingMinutes} דק'`;
                                    }
                                    return `${minutes} דק'`;
                                  })()
                                  : "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("duration");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* מחיר */}
                      <div
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "price") {
                            e.stopPropagation();
                            setEditingField("price");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiDollarSign className="text-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-white mb-1">מחיר</div>
                          {editingField === "price" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={typeof editedServiceData.price === 'number' ? `₪${editedServiceData.price}` : (editedServiceData.price || "₪")}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  value = value.replace(/[^\d₪]/g, '');
                                  if (value && !value.startsWith('₪')) {
                                    value = '₪' + value.replace(/₪/g, '');
                                  }
                                  setEditedServiceData({ ...editedServiceData, price: value });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("price");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                dir="rtl"
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("price");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("price");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedServiceForView?.price ? (typeof selectedServiceForView.price === 'number' ? `₪${selectedServiceForView.price}` : selectedServiceForView.price) : "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("price");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* הערות */}
                      <div
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "notes") {
                            e.stopPropagation();
                            setEditingField("notes");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiFileText className="text-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-white mb-1">הערות</div>
                          {editingField === "notes" ? (
                            <div className="flex items-center gap-2">
                              <textarea
                                value={editedServiceData.notes || ""}
                                onChange={(e) => setEditedServiceData({ ...editedServiceData, notes: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && e.ctrlKey) {
                                    e.stopPropagation();
                                    handleSaveField("notes");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors resize-none"
                                onClick={(e) => e.stopPropagation()}
                                rows={3}
                                dir="rtl"
                                autoFocus
                              />
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveField("notes");
                                  }}
                                  className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                  style={{ backgroundColor: BRAND_COLOR }}
                                >
                                  <FiSave className="text-sm" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEditField("notes");
                                  }}
                                  className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                >
                                  <FiX className="text-sm" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedServiceForView?.notes || "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("notes");
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
                              setIsServiceCardStatusDropdownOpen((prev) => !prev);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition ${(selectedServiceForView?.status || "פעיל") === "לא פעיל"
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : ""
                              }`}
                            style={
                              (selectedServiceForView?.status || "פעיל") === "פעיל"
                                ? {
                                  backgroundColor: BRAND_COLOR,
                                  color: "white"
                                }
                                : {}
                            }
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${(selectedServiceForView?.status || "פעיל") === "פעיל"
                                ? "bg-white animate-pulse"
                                : "bg-white dark:bg-black"
                              }`}></span>
                            <span>{selectedServiceForView?.status || "פעיל"}</span>
                            <FiChevronDown className="text-[10px]" />
                          </button>

                          {isServiceCardStatusDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setIsServiceCardStatusDropdownOpen(false)}
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
                                      handleUpdateServiceStatus(selectedServiceForView.id, "פעיל");
                                      setIsServiceCardStatusDropdownOpen(false);
                                    }}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${(selectedServiceForView?.status || "פעיל") === "פעיל"
                                            ? "border-[rgba(255,37,124,1)]"
                                            : "border-gray-300 dark:border-gray-500"
                                          }`}
                                      >
                                        {(selectedServiceForView?.status || "פעיל") === "פעיל" && (
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
                                      handleUpdateServiceStatus(selectedServiceForView.id, "לא פעיל");
                                      setIsServiceCardStatusDropdownOpen(false);
                                    }}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${(selectedServiceForView?.status || "פעיל") === "לא פעיל"
                                            ? "border-gray-500"
                                            : "border-gray-300 dark:border-gray-500"
                                          }`}
                                      >
                                        {(selectedServiceForView?.status || "פעיל") === "לא פעיל" && (
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

                      {/* קטגוריה */}
                      <div
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "category") {
                            e.stopPropagation();
                            setEditingField("category");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiTag className="text-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-white mb-1">קטגוריה</div>
                          {editingField === "category" ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editedServiceData.category || ""}
                                onChange={(e) => setEditedServiceData({ ...editedServiceData, category: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("category");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              >
                                <option value="">בחר קטגוריה</option>
                                {categories
                                  .filter(cat => cat.status === STATUS.ACTIVE || !cat.status)
                                  .map((category) => {
                                    // Handle both object format {id, title} and string format
                                    const categoryTitle = typeof category === 'string' ? category : (category.title || category.name || '');
                                    return (
                                      <option key={category.id || categoryTitle} value={categoryTitle}>
                                        {categoryTitle}
                                      </option>
                                    );
                                  })}
                              </select>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("category");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("category");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedServiceForView?.category || "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("category");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* צבע */}
                      <div
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "color") {
                            e.stopPropagation();
                            setEditingField("color");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiCircle className="text-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-white mb-1">צבע</div>
                          {editingField === "color" ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 flex flex-wrap gap-2">
                                {[
                                  { name: "שחור", value: "#000000" },
                                  { name: "לבן", value: "#FFFFFF" },
                                  { name: "כחול כהה", value: "#050c13" },
                                  { name: "אדום", value: "#d63b52" },
                                  { name: "ורוד", value: "#f6c6bd" },
                                  { name: "סגול", value: "#8e4e78" },
                                  { name: "כחול", value: "#014773" },
                                  { name: "תכלת", value: "#0881ae" },
                                  { name: "כחול-אפור", value: "#3e5267" },
                                  { name: "כתום", value: "#e67d52" },
                                  { name: "ורוד בוהק", value: "#ff257c" },
                                  { name: "ירוק", value: "#10b981" },
                                ].map((color) => (
                                  <button
                                    key={color.value}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditedServiceData({ ...editedServiceData, color: color.value });
                                      handleSaveField("color");
                                    }}
                                    className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                                    style={{
                                      backgroundColor: color.value,
                                      borderColor: editedServiceData.color === color.value ? "#ff257c" : color.value.toLowerCase() === "#ffffff" || color.value.toLowerCase() === "#fff" ? "#e5e7eb" : "transparent"
                                    }}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("color");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                  style={{ backgroundColor: selectedServiceForView?.color || "#FF257C" }}
                                />
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {selectedServiceForView?.color || "#FF257C"}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("color");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* להסתיר מלקוחות */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiEyeOff className="text-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-white mb-1">להסתיר מלקוחות</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!selectedServiceForView) return;
                              const newValue = !selectedServiceForView.hideFromClients;

                              // Update services array
                              const updatedServices = services.map(service => {
                                if (service.id === selectedServiceForView.id) {
                                  return {
                                    ...service,
                                    hideFromClients: newValue
                                  };
                                }
                                return service;
                              });

                              setServices(updatedServices);
                              localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));

                              // Update selectedServiceForView immediately
                              const updatedService = updatedServices.find(s => s.id === selectedServiceForView.id);
                              setSelectedServiceForView(updatedService);
                            }}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center ${selectedServiceForView?.hideFromClients
                                ? "bg-[#ff257c] justify-end"
                                : "bg-gray-300 dark:bg-gray-600 justify-start"
                              }`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow-sm mx-0.5" />
                          </button>
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
                            {selectedServiceForView?.createdAt
                              ? formatDate(new Date(selectedServiceForView.createdAt))
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advanced Settings Tab */}
                  {serviceViewTab === "advanced" && (
                    <div className="space-y-4 mt-6">
                      {/* השעה הכי מוקדמת לקביעת תור */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiClock className="text-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1 relative">
                          <div className="text-xs text-gray-500 dark:text-white mb-1">השעה הכי מוקדמת לקביעת תור</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenAdvancedSettingsDropdowns(prev => ({
                                ...prev,
                                earliestBookingTime: !prev.earliestBookingTime
                              }));
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
                          >
                            <span className="whitespace-nowrap">
                              {selectedServiceForView?.earliestBookingTime || "בחר שעה"}
                            </span>
                            <FiChevronDown className="text-[14px] text-gray-400" />
                          </button>

                          {openAdvancedSettingsDropdowns.earliestBookingTime && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenAdvancedSettingsDropdowns(prev => ({
                                    ...prev,
                                    earliestBookingTime: false
                                  }));
                                }}
                              />
                              <div
                                dir="rtl"
                                className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-scroll rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                              >
                                <div className="py-2">
                                  {TIME_OPTIONS.map((time) => (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedServices = services.map(service => {
                                          if (service.id === selectedServiceForView.id) {
                                            return {
                                              ...service,
                                              earliestBookingTime: time
                                            };
                                          }
                                          return service;
                                        });
                                        setServices(updatedServices);
                                        localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));
                                        const updatedService = updatedServices.find(s => s.id === selectedServiceForView.id);
                                        setSelectedServiceForView(updatedService);
                                        setOpenAdvancedSettingsDropdowns(prev => ({
                                          ...prev,
                                          earliestBookingTime: false
                                        }));
                                      }}
                                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                    >
                                      <span className="flex items-center gap-2">
                                        <span
                                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedServiceForView?.earliestBookingTime === time
                                              ? "border-[rgba(255,37,124,1)]"
                                              : "border-gray-300 dark:border-gray-500"
                                            }`}
                                        >
                                          {selectedServiceForView?.earliestBookingTime === time && (
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

                      {/* השעה הכי מאוחרת לקביעת תור */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiClock className="text-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1 relative">
                          <div className="text-xs text-gray-500 dark:text-white mb-1">השעה הכי מאוחרת לקביעת תור</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenAdvancedSettingsDropdowns(prev => ({
                                ...prev,
                                latestBookingTime: !prev.latestBookingTime
                              }));
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
                          >
                            <span className="whitespace-nowrap">
                              {selectedServiceForView?.latestBookingTime || "בחר שעה"}
                            </span>
                            <FiChevronDown className="text-[14px] text-gray-400" />
                          </button>

                          {openAdvancedSettingsDropdowns.latestBookingTime && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenAdvancedSettingsDropdowns(prev => ({
                                    ...prev,
                                    latestBookingTime: false
                                  }));
                                }}
                              />
                              <div
                                dir="rtl"
                                className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-scroll rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                              >
                                <div className="py-2">
                                  {TIME_OPTIONS.map((time) => (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedServices = services.map(service => {
                                          if (service.id === selectedServiceForView.id) {
                                            return {
                                              ...service,
                                              latestBookingTime: time
                                            };
                                          }
                                          return service;
                                        });
                                        setServices(updatedServices);
                                        localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));
                                        const updatedService = updatedServices.find(s => s.id === selectedServiceForView.id);
                                        setSelectedServiceForView(updatedService);
                                        setOpenAdvancedSettingsDropdowns(prev => ({
                                          ...prev,
                                          latestBookingTime: false
                                        }));
                                      }}
                                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                    >
                                      <span className="flex items-center gap-2">
                                        <span
                                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedServiceForView?.latestBookingTime === time
                                              ? "border-[rgba(255,37,124,1)]"
                                              : "border-gray-300 dark:border-gray-500"
                                            }`}
                                        >
                                          {selectedServiceForView?.latestBookingTime === time && (
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

                      {/* ימים שבהם אפשר לקבוע תור */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiCalendar className="text-gray-600 dark:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-white mb-1">ימים שבהם אפשר לקבוע תור</div>
                          <div className="flex items-center gap-3 flex-wrap mt-2">
                            {DAYS_OF_WEEK.map((day) => {
                              // Default: if availableDays is undefined/null, all days are selected
                              // If availableDays is empty array [], no days are selected (user explicitly deselected all)
                              // If availableDays has values, only those days are selected
                              const availableDays = selectedServiceForView?.availableDays;
                              const isDaySelected = availableDays === undefined || availableDays === null
                                ? true  // Default: all days selected
                                : availableDays.length === 0
                                  ? false  // User explicitly deselected all days
                                  : availableDays.includes(day);  // Check if day is in the array

                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!selectedServiceForView) return;

                                    // Handle default state (undefined/null means all days selected)
                                    let currentDays;
                                    if (selectedServiceForView.availableDays === undefined || selectedServiceForView.availableDays === null) {
                                      // Default state: all days are selected, so we start with all days
                                      currentDays = [...DAYS_OF_WEEK];
                                    } else {
                                      currentDays = selectedServiceForView.availableDays;
                                    }

                                    const newDays = isDaySelected
                                      ? currentDays.filter(d => d !== day)
                                      : [...currentDays, day];

                                    // If all days are selected, we can set to undefined to use default
                                    // But if user explicitly selected all days, we keep the array
                                    // So we only set to undefined if we're removing the last day
                                    const finalDays = newDays.length === DAYS_OF_WEEK.length
                                      ? undefined  // All days selected = default state
                                      : newDays.length === 0
                                        ? []  // No days selected (explicit empty array)
                                        : newDays;  // Some days selected

                                    const updatedServices = services.map(service => {
                                      if (service.id === selectedServiceForView.id) {
                                        return {
                                          ...service,
                                          availableDays: finalDays
                                        };
                                      }
                                      return service;
                                    });

                                    setServices(updatedServices);
                                    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));

                                    const updatedService = updatedServices.find(s => s.id === selectedServiceForView.id);
                                    setSelectedServiceForView(updatedService);
                                  }}
                                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${isDaySelected
                                      ? "border-[#ff257c] bg-[#ff257c] text-white"
                                      : "border-gray-300 dark:border-gray-500 bg-white dark:bg-[#181818] text-gray-700 dark:text-white hover:border-[#ff257c]"
                                    }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CommonConfirmModel
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setServiceToDelete(null);
        }}
        onConfirm={confirmDeleteService}
        title="מחיקת שירות"
        message="האם אתה בטוח שאתה רוצה למחוק את השירות הזה?"
        confirmText="מחק"
        cancelText="ביטול"
        confirmColor="red"
      />

      <CommonConfirmModel
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmDeleteSelectedClients}
        title="מחיקת שירותים"
        message={`האם אתה בטוח שאתה רוצה למחוק ${selectedServices.length} שירותים?`}
        confirmText="מחק"
        cancelText="ביטול"
        confirmColor="red"
      />

      {/* New Service Modal */}
      <NewServiceModal
        isOpen={isNewServiceModalOpen}
        onClose={() => setIsNewServiceModalOpen(false)}
        newServiceName={newServiceName}
        newServiceNotes={newServiceNotes}
        newServiceCategory={newServiceCategory}
        newServicePrice={newServicePrice}
        newServiceDuration={newServiceDuration}
        newServiceColor={newServiceColor}
        newServiceHideFromClients={newServiceHideFromClients}
        newServiceErrors={newServiceErrors}
        onNameChange={setNewServiceName}
        onNotesChange={setNewServiceNotes}
        onCategoryChange={setNewServiceCategory}
        onPriceChange={setNewServicePrice}
        onDurationChange={setNewServiceDuration}
        onColorChange={setNewServiceColor}
        onHideFromClientsChange={setNewServiceHideFromClients}
        onSubmit={handleCreateNewService}
        categories={categories.filter(cat => cat.status === STATUS.ACTIVE || !cat.status)} // Only show active categories or categories without status
      />
    </div>
  );
}

// Removed addCalendarClient export - staff management doesn't need this function

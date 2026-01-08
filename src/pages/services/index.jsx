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
import whatsappIcon from "../../assets/whatsappicon.png";
import { Area, AreaChart, Tooltip, ResponsiveContainer } from 'recharts';
import { DEMO_SERVICES } from "../../data/calendar/demoData";

const SERVICES_STORAGE_KEY = "services";
const COLUMN_SPACING_STORAGE_KEY = "services_column_spacing";
const VISIBLE_FIELDS_STORAGE_KEY = "services_visible_fields";

export default function ServicesPage() {
  const { language } = useLanguage();
  const { isDarkMode } = useTheme();
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
      alert('שגיאה בקריאת הקובץ');
    };
    reader.readAsDataURL(file);
  };

  // Update service status
  const handleUpdateServiceStatus = (serviceId, newStatus) => {
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
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));
    
    // Update selectedServiceForView if it's the same service
    if (selectedServiceForView && selectedServiceForView.id === serviceId) {
      const updatedServicesMember = updatedServices.find(s => s.id === serviceId);
      setSelectedServiceForView(updatedServicesMember);
    }
    
    // Close the dropdown
    setOpenStatusDropdowns(prev => ({ ...prev, [serviceId]: false }));
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
  const handleUpdateServiceFieldInList = (serviceId, field, value) => {
    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        return {
          ...service,
          [field]: value
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

  // Save edited field
  const handleSaveField = (fieldName) => {
    if (!selectedServiceForView) return;

    const updatedServices = services.map(service => {
      if (service.id === selectedServiceForView.id) {
        const updates = {
          ...service,
        };
        
        if (fieldName === "name") {
          updates.name = editedServiceData.name;
        } else if (fieldName === "notes") {
          updates.notes = editedServiceData.notes;
        } else if (fieldName === "category") {
          updates.category = editedServiceData.category;
        } else if (fieldName === "price") {
          let priceValue = editedServiceData.price;
          if (typeof priceValue === 'string') {
            const digits = priceValue.replace(/[^\d]/g, '');
            if (digits.length > 0) {
              priceValue = parseInt(digits);
            } else {
              priceValue = 0;
            }
          }
          updates.price = priceValue;
        } else if (fieldName === "duration") {
          updates.duration = editedServiceData.duration;
        } else if (fieldName === "color") {
          updates.color = editedServiceData.color;
        } else if (fieldName === "hideFromClients") {
          updates.hideFromClients = editedServiceData.hideFromClients;
        }
        
        return updates;
      }
      return service;
    });

    setServices(updatedServices);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));
    
    // Update selectedServiceForView to reflect changes
    const updatedServicesMember = updatedServices.find(s => s.id === selectedServiceForView.id);
    setSelectedServiceForView(updatedServicesMember);
    
    setEditingField(null);
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

  // Load services from localStorage on mount
  useEffect(() => {
    const storedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (storedServices) {
      try {
        setServices(JSON.parse(storedServices));
      } catch (error) {
        console.error("Error loading services from localStorage:", error);
      }
    }
  }, []);

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
        const normalizedServiceStatus = statusMap[serviceStatus] || serviceStatus;
        return normalizedServiceStatus === selectedStatus;
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
  }, [services, searchQuery, sortBy, selectedStatus]);

  // Removed clientAdvancedStats - not needed for staff management

  const handleDeleteService = (serviceId) => {
    if (!window.confirm("האם אתה בטוח שאתה רוצה למחוק את איש הצוות הזה?")) {
            return;
          }
          
    const updatedServices = services.filter((s) => s.id !== serviceId);
    setServices(updatedServices);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));
    
    // If the deleted staff member was being viewed, close the summary
    if (selectedServiceForView?.id === serviceId) {
      setShowServiceSummary(false);
      setSelectedServiceForView(null);
    }
  };

  const handleDownloadSelectedClients = () => {
    if (selectedServices.length === 0) {
      alert("אנא בחר לפחות שירות אחד להורדה");
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
    if (selectedServices.length === 0) {
      alert("אנא בחר לפחות שירות אחד למחיקה");
      return;
    }

    if (window.confirm(`האם אתה בטוח שאתה רוצה למחוק ${selectedServices.length} איש/שירותים?`)) {
      const updatedServices = services.filter((s) => !selectedServices.includes(s.id));
      setServices(updatedServices);
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));
      setSelectedServices([]);
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

  // Handle creating a new service
  const handleCreateNewService = () => {
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

    const newService = {
      id: Date.now(),
      name: newServiceName.trim(),
      notes: newServiceNotes.trim(),
      category: newServiceCategory || "",
      price: parseFloat(newServicePrice),
      duration: parseInt(newServiceDuration),
      color: newServiceColor || "#FF257C",
      hideFromClients: newServiceHideFromClients || false,
      status: "פעיל",
      createdAt: new Date().toISOString(),
    };

    // Add service to services list
    const updatedServices = [newService, ...services];
    setServices(updatedServices);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));
    
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
  };

  return (
    <div className="w-full bg-[#ffffff]" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                שירותים
              </h1>
              {services.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#181818] px-2 py-0.5 rounded">
                  {services.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              צפה, הוסף, ערוך ומחק את השירותים שלך.{" "}
              <a href="#" className="text-[#ff257c] hover:underline">למד עוד</a>
            </p>
          </div>
          <div className="flex items-center gap-2">
              <button
              onClick={() => {
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
              className="px-4 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-200 font-semibold text-sm flex items-center gap-2"
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
              placeholder="חפש שירות..."
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
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
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
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        פרטים
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllFieldsInCategory(["name", "status", "duration", "price", "notes", "category", "color", "hideFromClients"]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#ff257c] transition-colors"
                      >
                        סמן הכל
                      </button>
                    </div>
                    {[
                      { key: "name", label: "שם שירות" },
                      { key: "status", label: "סטטוס" },
                      { key: "duration", label: "משך שירות" },
                      { key: "price", label: "מחיר" },
                      { key: "notes", label: "הערות" },
                      { key: "category", label: "קטגוריה" },
                      { key: "color", label: "צבע" },
                      { key: "hideFromClients", label: "להסתיר מלקוחות" },
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
                  selectedServices.length === filteredAndSortedServices.length && filteredAndSortedServices.length > 0
                    ? "border-[rgba(255,37,124,1)]"
                    : "border-gray-300 dark:border-gray-500"
                }`}
              >
                {selectedServices.length === filteredAndSortedServices.length && filteredAndSortedServices.length > 0 && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: BRAND_COLOR }}
                  />
                )}
              </span>
              <span className="whitespace-nowrap text-xs sm:text-sm">
                  בחר הכל ({selectedServices.length}/{filteredAndSortedServices.length})
                </span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownloadSelectedClients}
              disabled={selectedServices.length === 0}
              className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${
                selectedServices.length === 0
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                  : "text-gray-600 dark:text-gray-400 hover:text-[#ff257c] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
              }`}
              title="הורדת שירותים נבחרים"
            >
              <FiDownload className="text-sm" />
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDeleteSelectedClients}
              disabled={selectedServices.length === 0}
              className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${
                selectedServices.length === 0
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
              }`}
              title="מחיקת שירותים נבחרים"
            >
              <FiTrash2 className="text-sm" />
            </button>
              </div>
        </div>

        {/* Services List */}
        {filteredAndSortedServices.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4 block">☺</span>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery ? "לא נמצאו שירותים התואמים לחיפוש" : "אין שירותים עדיין"}
            </p>
            {!searchQuery && (
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                שירותים חדשים שנוצרים דרך קביעת תורים יופיעו כאן
              </p>
            )}
          </div>
        ) : (
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Table Headers */}
            <div className="flex items-center gap-6 px-4 py-3 border-b border-gray-200 dark:border-[#2b2b2b] relative min-w-max">
              {/* Checkbox placeholder for alignment */}
              <div className="w-3.5 flex-shrink-0"></div>
              
              {visibleFields.name && (
                <div className="w-32 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `${columnSpacing.nameToStatus}px` }}>
                  <div className="w-8 h-8 flex-shrink-0"></div>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                שם שירות
                </span>
              </div>
              )}
              {visibleFields.status && (
                <div className="w-28 flex items-center justify-center flex-shrink-0" style={{ marginRight: `${columnSpacing.statusToPhone}px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    סטטוס
                  </span>
                </div>
              )}
              {visibleFields.duration && (
                <div className="w-40 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    משך שירות
                  </span>
                </div>
              )}
              {visibleFields.price && (
                <div className="w-40 flex items-center justify-start flex-shrink-0" style={{ marginRight: `8px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    מחיר
                  </span>
                </div>
              )}
              {visibleFields.notes && (
                <div className="w-48 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    הערות
                  </span>
                </div>
              )}
              {visibleFields.category && (
                <div className="w-32 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    קטגוריה
                  </span>
                </div>
              )}
              {visibleFields.color && (
                <div className="w-24 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    צבע
                  </span>
                </div>
              )}
              {visibleFields.hideFromClients && (
                <div className="w-32 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    להסתיר מלקוחות
                  </span>
                </div>
              )}
              <div className="w-24 flex items-center justify-start flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                מציג {filteredAndSortedServices.length} מתוך {services.length} תוצאות
              </p>
              </div>
            </div>

            {/* Staff Rows */}
            {filteredAndSortedServices.map((service, index) => (
              <div
                key={service.id}
                onClick={(e) => {
                  // Open service card if clicking on the row itself or non-interactive elements
                  const target = e.target;
                  const isInteractive = target.closest('button') || target.closest('input') || target.closest('select') || target.closest('textarea') || target.closest('[role="button"]');
                  
                  if (!isInteractive) {
                    setSelectedServiceForView(service);
                    setShowServiceSummary(true);
                    setServiceViewTab("details");
                  }
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
                      handleSelectService(service.id);
                    }}
                    className="flex-shrink-0"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selectedServices.includes(service.id)
                          ? "border-[rgba(255,37,124,1)]"
                          : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {selectedServices.includes(service.id) && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: BRAND_COLOR }}
                        />
                      )}
                    </span>
                  </button>
                  
                  {/* שם שירות עם אייקון */}
                  {visibleFields.name && (
                    <div className="w-32 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `${columnSpacing.nameToStatus}px` }}>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2b2b2b] flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 flex-shrink-0 overflow-hidden">
                        {service.profileImage ? (
                          <img 
                            src={service.profileImage} 
                            alt={service.name || "שירות"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          service.initials || (service.name ? service.name.charAt(0).toUpperCase() : "ל")
                        )}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {service.name || "ללא שם"}
                    </div>
                  </div>
                  )}

                  {/* סטטוס */}
                  {visibleFields.status && (
                    <div className="w-28 flex items-center justify-center flex-shrink-0 relative status-dropdown-container" style={{ marginRight: `${columnSpacing.statusToPhone}px` }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setStatusDropdownPositions(prev => ({
                            ...prev,
                            [service.id]: {
                              top: rect.bottom + window.scrollY + 8,
                              right: window.innerWidth - rect.right
                            }
                          }));
                          setOpenStatusDropdowns(prev => ({
                            ...prev,
                            [service.id]: !prev[service.id]
                          }));
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition text-white ${
                          (service.status || "פעיל") === "לא פעיל"
                            ? "bg-black"
                            : ""
                        }`}
                        style={
                          (service.status || "פעיל") === "פעיל"
                            ? { 
                                backgroundColor: BRAND_COLOR
                              }
                            : {}
                        }
                      >
                        <span className={`w-1.5 h-1.5 rounded-full bg-white ${
                          (service.status || "פעיל") === "פעיל" ? "animate-pulse" : ""
                        }`}></span>
                        <span>{service.status || "פעיל"}</span>
                        <FiChevronDown className="text-[10px]" />
                      </button>
                      
                      {openStatusDropdowns[service.id] && (
                        <>
                          {/* Overlay layer to close dropdown when clicking outside */}
                          <div
                            className="fixed inset-0 z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusDropdowns(prev => ({
                                ...prev,
                                [service.id]: false
                              }));
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
                              {/* פעיל */}
                              <button
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateServiceStatus(service.id, "פעיל");
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                      (service.status || "פעיל") === "פעיל"
                                        ? "border-[rgba(255,37,124,1)]"
                                        : "border-gray-300 dark:border-gray-500"
                                    }`}
                                  >
                                    {(service.status || "פעיל") === "פעיל" && (
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
                                  handleUpdateServiceStatus(service.id, "לא פעיל");
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                      (service.status || "פעיל") === "לא פעיל"
                                        ? "border-[rgba(255,37,124,1)]"
                                        : "border-gray-300 dark:border-gray-500"
                                    }`}
                                  >
                                    {(service.status || "פעיל") === "לא פעיל" && (
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

                  {/* משך שירות */}
                  {visibleFields.duration && (
                    <div className="w-40 flex items-center gap-2 flex-shrink-0 relative" style={{ marginRight: `16px` }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDurationDropdownPositions(prev => ({
                                ...prev,
                                [service.id]: {
                                  top: rect.bottom + window.scrollY + 8,
                                  right: window.innerWidth - rect.right
                                }
                              }));
                              setOpenStatusDropdowns(prev => ({
                                ...prev,
                                [`duration-${service.id}`]: !prev[`duration-${service.id}`]
                              }));
                            }}
                        className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
                      >
                        <span className="whitespace-nowrap">
                          {service.duration 
                            ? (() => {
                                const minutes = Number(service.duration);
                                if (isNaN(minutes)) return "בחר משך";
                                if (minutes === 60) return "1 שעה";
                                if (minutes > 60) {
                                  const hours = Math.floor(minutes / 60);
                                  const remainingMinutes = minutes % 60;
                                  if (remainingMinutes === 0) return `${hours} שעות`;
                                  return `${hours} שעות ${remainingMinutes} דק'`;
                                }
                                return `${minutes} דק'`;
                              })()
                            : "בחר משך"}
                        </span>
                        <FiChevronDown className="text-[14px] text-gray-400" />
                          </button>
                      {openStatusDropdowns[`duration-${service.id}`] && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusDropdowns(prev => ({ ...prev, [`duration-${service.id}`]: false }));
                            }}
                          />
                          <div
                            dir="rtl"
                            className="fixed w-56 max-h-80 overflow-y-scroll rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                            style={{
                              maxHeight: '320px',
                              overflowY: 'scroll',
                              WebkitOverflowScrolling: 'touch',
                              top: durationDropdownPositions[service.id]?.top ? `${durationDropdownPositions[service.id].top}px` : 'auto',
                              right: durationDropdownPositions[service.id]?.right ? `${durationDropdownPositions[service.id].right}px` : 'auto'
                            }}
                          >
                            <div className="py-2">
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
                              })().map((option) => {
                                const currentDuration = Number(service.duration);
                                const optionValue = Number(option.value);
                                const isSelected = !isNaN(currentDuration) && currentDuration === optionValue;
                                
                                return (
                          <button
                                    key={option.value}
                                    data-duration-value={option.value}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                                      handleUpdateServiceFieldInList(service.id, 'duration', option.value);
                                      setOpenStatusDropdowns(prev => ({ ...prev, [`duration-${service.id}`]: false }));
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                          isSelected
                                            ? "border-[rgba(255,37,124,1)]"
                                            : "border-gray-300 dark:border-gray-500"
                                        }`}
                                      >
                                        {isSelected && (
                                          <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: BRAND_COLOR }}
                                          />
                                        )}
                                      </span>
                                      <span>{option.label}</span>
                                    </span>
                          </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                  </div>
                  )}

                  {/* מחיר */}
                  {visibleFields.price && (
                    <div className="w-40 flex items-center justify-start flex-shrink-0" style={{ marginRight: `8px` }}>
                      {editingField === `price-${service.id}` ? (
                        <div className="relative">
                          <input
                            ref={priceInputRef}
                            type="text"
                            value={typeof service.price === 'number' ? `₪${service.price}` : (service.price || "₪")}
                            onChange={(e) => {
                              let value = e.target.value;
                              // Allow only digits and ₪
                              value = value.replace(/[^\d₪]/g, '');
                              // Ensure ₪ is at the start
                              if (value && !value.startsWith('₪')) {
                                value = '₪' + value.replace(/₪/g, '');
                              }
                              handleUpdateServiceFieldInList(service.id, 'price', value);
                            }}
                            onBlur={() => {
                              let value = service.price || '₪';
                              if (typeof value === 'string') {
                                const digits = value.replace(/[^\d]/g, '');
                                if (digits.length === 0) {
                                  value = '₪';
                                } else {
                                  // Convert to number for storage
                                  const numValue = parseInt(digits);
                                  handleUpdateServiceFieldInList(service.id, 'price', numValue);
                                  setEditingField(null);
                                  return;
                                }
                              }
                              setEditingField(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-sm rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                            dir="rtl"
                            autoFocus
                          />
                    </div>
                      ) : (
                        <div 
                          className="text-sm text-gray-700 dark:text-gray-300 truncate cursor-pointer hover:text-[#ff257c] w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingField(`price-${service.id}`);
                          }}
                        >
                          {service.price ? (typeof service.price === 'number' ? `₪${service.price}` : service.price) : "-"}
                        </div>
                      )}
                  </div>
                  )}

                  {/* הערות */}
                  {visibleFields.notes && (
                    <div className="w-48 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                      {editingField === `notes-${service.id}` ? (
                        <input
                          type="text"
                          value={service.notes || ""}
                          onChange={(e) => handleUpdateServiceFieldInList(service.id, 'notes', e.target.value)}
                          onBlur={() => setEditingField(null)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-sm rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                          dir="rtl"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="text-sm text-gray-700 dark:text-gray-300 truncate cursor-pointer hover:text-[#ff257c] w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingField(`notes-${service.id}`);
                          }}
                        >
                          {service.notes || "-"}
                    </div>
                      )}
                  </div>
                  )}

                  {/* קטגוריה */}
                  {visibleFields.category && (
                    <div className="w-32 flex items-center justify-start flex-shrink-0 relative" style={{ marginRight: `16px` }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setCategoryDropdownPositions(prev => ({
                            ...prev,
                            [service.id]: {
                              top: rect.bottom + window.scrollY + 8,
                              right: window.innerWidth - rect.right
                            }
                          }));
                          setOpenStatusDropdowns(prev => ({
                            ...prev,
                            [`category-${service.id}`]: !prev[`category-${service.id}`]
                          }));
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
                      >
                        <span className="whitespace-nowrap">
                          {service.category || "בחר קטגוריה"}
                        </span>
                        <FiChevronDown className="text-[14px] text-gray-400" />
                      </button>
                      {openStatusDropdowns[`category-${service.id}`] && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusDropdowns(prev => ({ ...prev, [`category-${service.id}`]: false }));
                            }}
                          />
                          <div
                            dir="rtl"
                            className="fixed w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                            style={{
                              top: categoryDropdownPositions[service.id]?.top ? `${categoryDropdownPositions[service.id].top}px` : 'auto',
                              right: categoryDropdownPositions[service.id]?.right ? `${categoryDropdownPositions[service.id].right}px` : 'auto'
                            }}
                          >
                            <div className="py-2">
                              {["כללי", "טיפול פנים", "טיפול שיער", "טיפול גוף", "עיסוי", "אחר"].map((category) => (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateServiceFieldInList(service.id, 'category', category);
                                    setOpenStatusDropdowns(prev => ({ ...prev, [`category-${service.id}`]: false }));
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                >
                                  <span className="flex items-center gap-2">
                                    <span
                                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                        service.category === category
                                          ? "border-[rgba(255,37,124,1)]"
                                          : "border-gray-300 dark:border-gray-500"
                                      }`}
                                    >
                                      {service.category === category && (
                                        <span
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: BRAND_COLOR }}
                                        />
                                      )}
                                    </span>
                                    <span>{category}</span>
                                  </span>
                                </button>
                              ))}
                      </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* צבע */}
                  {visibleFields.color && (
                    <div className="w-24 flex items-center justify-start flex-shrink-0 relative" style={{ marginRight: `16px` }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setColorDropdownPositions(prev => ({
                            ...prev,
                            [service.id]: {
                              top: rect.top + window.scrollY,
                              right: window.innerWidth - rect.left + 8 // 8px spacing from left side of button
                            }
                          }));
                          setOpenStatusDropdowns(prev => ({
                            ...prev,
                            [`color-${service.id}`]: !prev[`color-${service.id}`]
                          }));
                        }}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: service.color || "#FF257C" }}
                        title={service.color || "#FF257C"}
                      />
                      {openStatusDropdowns[`color-${service.id}`] && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusDropdowns(prev => ({ ...prev, [`color-${service.id}`]: false }));
                            }}
                          />
                          <div
                            dir="rtl"
                            className="fixed w-[179px] rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right p-3"
                            style={{
                              top: colorDropdownPositions[service.id]?.top ? `${colorDropdownPositions[service.id].top}px` : 'auto',
                              right: colorDropdownPositions[service.id]?.right ? `${colorDropdownPositions[service.id].right}px` : 'auto'
                            }}
                          >
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { name: "קרם", value: "#FDF2DD" },
                                { name: "אפרסק", value: "#FFE6D6" },
                                { name: "קורל", value: "#FFDBCB" },
                                { name: "ורוד בהיר", value: "#FADDD9" },
                                { name: "ורוד", value: "#F5DEE6" },
                                { name: "ורוד-סגול", value: "#F7E8F3" },
                                { name: "סגול בהיר", value: "#F8F7FF" },
                                { name: "סגול", value: "#E4E1FF" },
                                { name: "סגול-כחול", value: "#D0D1FF" },
                                { name: "כחול בהיר", value: "#D6E8FF" },
                                { name: "תכלת", value: "#D0F4F0" },
                                { name: "ירוק בהיר", value: "#D4F4DD" },
                                { name: "צהוב בהיר", value: "#FFF9D0" },
                                { name: "כתום בהיר", value: "#FFE8D0" },
                                { name: "אדום בהיר", value: "#FFE0E0" },
                                { name: "אפור בהיר", value: "#F0F0F0" },
                              ].map((color) => (
                                <button
                                  key={color.value}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateServiceFieldInList(service.id, 'color', color.value);
                                    setOpenStatusDropdowns(prev => ({ ...prev, [`color-${service.id}`]: false }));
                                  }}
                                  className="w-full aspect-square rounded-lg border-2 hover:scale-110 transition-transform"
                                  style={{
                                    backgroundColor: color.value,
                                    borderColor: service.color === color.value ? "#ff257c" : color.value.toLowerCase() === "#ffffff" || color.value.toLowerCase() === "#fff" ? "#e5e7eb" : "transparent"
                                  }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* להסתיר מלקוחות */}
                  {visibleFields.hideFromClients && (
                    <div className="w-32 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateServiceFieldInList(service.id, 'hideFromClients', !service.hideFromClients);
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none flex items-center ${
                          service.hideFromClients
                            ? "bg-[#ff257c] justify-end"
                            : "bg-gray-300 dark:bg-gray-600 justify-start"
                        }`}
                      >
                        <span
                          className="w-5 h-5 bg-white rounded-full shadow-sm mx-0.5"
                        />
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0" style={{ marginLeft: `${columnSpacing.actionsSpacing}px` }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedServiceForView(service);
                        setShowServiceSummary(true);
                        setServiceViewTab("details");
                      }}
                      className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                      title="צפה בפרטים"
                    >
                      <FiEye className="text-base" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedServiceForView(service);
                        setShowServiceSummary(true);
                        setServiceViewTab("details");
                        setEditingField("name");
                      }}
                      className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                      title="ערוך"
                    >
                      <FiEdit className="text-base" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteService(service.id);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
                      title="מחק"
                    >
                      <FiTrash2 className="text-base" />
                    </button>
                  </div>
                </div>
            ))}
          </div>
        )}
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
                          <span className="text-sm text-gray-600 dark:text-gray-400">
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
                          <span className="text-sm text-gray-600 dark:text-gray-400">
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
                          className={`relative pb-3 pt-1 font-medium transition-colors ${
                            serviceViewTab === key
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500 dark:text-gray-400"
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
                      className="flex items-center gap-3 group cursor-pointer"
                      onClick={(e) => {
                        if (editingField !== "name") {
                          e.stopPropagation();
                          setEditingField("name");
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                        <FiPackage className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">שם שירות</div>
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
                              className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
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
                                setEditingField("name");
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
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
                        <FiClock className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">משך שירות</div>
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
                              className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
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
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
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
                        <FiDollarSign className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">מחיר</div>
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
                              className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
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
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
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
                        <FiFileText className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">הערות</div>
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
                              className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
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
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
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
                        <FiCheckCircle className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 relative">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">סטטוס</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsServiceCardStatusDropdownOpen((prev) => !prev);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition ${
                            (selectedServiceForView?.status || "פעיל") === "לא פעיל"
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
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (selectedServiceForView?.status || "פעיל") === "פעיל" 
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
                                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                        (selectedServiceForView?.status || "פעיל") === "פעיל"
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
                                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                        (selectedServiceForView?.status || "פעיל") === "לא פעיל"
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
                        <FiTag className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">קטגוריה</div>
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
                              {["כללי", "טיפול פנים", "טיפול שיער", "טיפול גוף", "עיסוי", "אחר"].map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
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
                              className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
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
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
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
                        <FiCircle className="text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">צבע</div>
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
                              className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
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
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
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
                        <FiEyeOff className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">להסתיר מלקוחות</div>
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
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center ${
                            selectedServiceForView?.hideFromClients
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
                                  <FiCalendar className="text-gray-600 dark:text-gray-400" />
                          </div>
                                <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">תאריך יצירה</div>
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
                          <FiClock className="text-gray-600 dark:text-gray-400" />
                                </div>
                        <div className="flex-1 relative">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">השעה הכי מוקדמת לקביעת תור</div>
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
                                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                            selectedServiceForView?.earliestBookingTime === time
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
                          <FiClock className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 relative">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">השעה הכי מאוחרת לקביעת תור</div>
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
                                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                            selectedServiceForView?.latestBookingTime === time
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
                          <FiCalendar className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ימים שבהם אפשר לקבוע תור</div>
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
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                                  isDaySelected
                                    ? "border-[#ff257c] bg-[#ff257c] text-white"
                                    : "border-gray-300 dark:border-gray-500 bg-white dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:border-[#ff257c]"
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
      />
    </div>
  );
}

// Removed addCalendarClient export - staff management doesn't need this function

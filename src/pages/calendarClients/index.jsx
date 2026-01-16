/**
 * Calendar Clients Page - Fresha Style
 * Displays all clients that have been created through the calendar booking flow
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FiSearch,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiFilter,
  FiX,
  FiUpload,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { FaStar, FaPhoneAlt } from "react-icons/fa";
import {
  formatPhoneForDisplay,
  formatPhoneForBackend,
  formatPhoneToWhatsapp,
} from "../../utils/phoneHelpers";
import { useTheme } from "../../context/ThemeContext";
import { BRAND_COLOR, CALENDAR_EVENTS_STORAGE_KEY } from "../../utils/calendar/constants";
import { ClientSummaryCard } from "../../components/calendar/Panels/ClientSummaryCard";
import gradientImage from "../../assets/gradientteam.jpg";
// import whatsappIcon from "../../assets/whatsappicon.png";
import whatsappDarkIcon from "../../assets/whatsappDark.svg";
import whatsappLightIcon from "../../assets/whatsappLight.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyCustomersAction,
  addCustomerAction,
  updateCustomerAction,
  removeCustomerAction,
  bulkImportCustomersAction,
} from "../../redux/actions/customerActions";
import { useSubscriptionCheck } from "../../hooks/useSubscriptionCheck";
import { CalendarCommonTable } from "../../components/commonComponent/CalendarCommonTable";
import CommonConfirmModel from "../../components/commonComponent/CommonConfirmModel";
import { toast } from 'react-toastify';

const CALENDAR_CLIENTS_STORAGE_KEY = "calendar_clients";
const COLUMN_SPACING_STORAGE_KEY = "calendar_clients_column_spacing";
const VISIBLE_FIELDS_STORAGE_KEY = "calendar_clients_visible_fields";

export default function CalendarClientsPage() {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { customers: customersFromStore, loading: isLoadingCustomers, error: customersError } = useSelector(
    (state) => state.customer
  );

  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [clientsError, setClientsError] = useState(null);
  const [isAuthError, setIsAuthError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);

  const [sortBy, setSortBy] = useState("newest");

  const [showImportBanner, setShowImportBanner] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState(null); // null = כל הסטטוסים
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const [selectedRating, setSelectedRating] = useState(null); // null = כל הדירוגים
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);

  const [isColumnFilterDropdownOpen, setIsColumnFilterDropdownOpen] = useState(false);

  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [openStatusDropdowns, setOpenStatusDropdowns] = useState({});
  const [statusDropdownPositions, setStatusDropdownPositions] = useState({});

  const [selectedClientForView, setSelectedClientForView] = useState(null);
  const [showClientSummary, setShowClientSummary] = useState(false);
  const [clientViewTab, setClientViewTab] = useState("details");
  
  // Prevent duplicate API calls
  const [isUpdatingClient, setIsUpdatingClient] = useState(false);

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [clientsToDelete, setClientsToDelete] = useState([]);

  // CSV import modal state
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvImportProgress, setCsvImportProgress] = useState(null);
  const fileInputRef = useRef(null);

  // Check subscription status using custom hook
  const { hasActiveSubscription, subscriptionLoading } = useSubscriptionCheck({
    pageName: 'CALENDAR CLIENTS PAGE',
    enableLogging: false
  });

  // New client modal state (inline modal implemented here)
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCity, setNewClientCity] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientErrors, setNewClientErrors] = useState({});

  const [visibleFields, setVisibleFields] = useState(() => {
    const defaultFields = {
      // פרטי בסיס
      name: true,
      status: true,
      phone: true,
      email: false,
      city: false,
      address: false,
      createdAt: false,
      firstAppointmentDate: false,
      // ביצועים
      totalRevenue: false,
      appointmentsCount: false,
      lastVisit: true,
      avgRevenuePerVisit: false,
      avgTransaction: false,
      lostRevenue: false,
      recoveredRevenue: false,
      avgVisitsPerYear: false,
      daysSinceLastAppointment: false,
      avgTimeBetweenVisits: false,
      avgTimeFromBookingToAppointment: false,
      lastService: false,
      lastStaff: false,
      avgRating: true,
      lastRating: true,
      // ביקור אחרון
      lastAppointmentDate: false,
      lastAppointmentTime: false,
      // שיווק
      source: false,
      leadDate: false,
      firstContactMethod: false,
      timeToConversion: false,
      campaignName: false,
      adSetName: false,
      adName: false,
      utmSource: false,
      utmMedium: false,
      utmCampaign: false,
      utmContent: false,
      utmTerm: false,
    };

    const SESSION_FLAG_KEY = "calendar_clients_session_active";
    const isNewSession = !sessionStorage.getItem(SESSION_FLAG_KEY);
    
    if (isNewSession) {
      sessionStorage.setItem(SESSION_FLAG_KEY, "true");
      try {
        localStorage.removeItem(VISIBLE_FIELDS_STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing visible fields:", error);
      }
      return defaultFields;
    }
    
    try {
      const stored = localStorage.getItem(VISIBLE_FIELDS_STORAGE_KEY);
      if (stored) return { ...defaultFields, ...JSON.parse(stored) };
    } catch (error) {
      console.error("Error loading visible fields:", error);
    }
    return defaultFields;
  });
  
  // Column spacing state
  const [columnSpacing, setColumnSpacing] = useState(() => ({
    nameToStatus: 32, // mr-8 = 32px
    statusToPhone: 0,
    phoneToRating: 0,
    ratingToRevenue: 0,
    revenueToActions: 0,
    actionsSpacing: 0,
  }));
  
  // Load column spacing from localStorage
  useEffect(() => {
    const storedSpacing = localStorage.getItem(COLUMN_SPACING_STORAGE_KEY);
    if (storedSpacing) {
      try {
        setColumnSpacing(JSON.parse(storedSpacing));
      } catch (error) {
        console.error("Error loading column spacing:", error);
      }
    } else {
      try {
      localStorage.setItem(COLUMN_SPACING_STORAGE_KEY, JSON.stringify(columnSpacing));
      } catch (e) {
        console.error("Error saving default column spacing:", e);
    }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save visible fields to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(VISIBLE_FIELDS_STORAGE_KEY, JSON.stringify(visibleFields));
    } catch (error) {
      console.error("Error saving visible fields:", error);
    }
  }, [visibleFields]);

  // Load clients from Redux store on mount
  useEffect(() => {
    const loadClients = async () => {
      setIsLoadingClients(true);
      setClientsError(null);
      setIsAuthError(false);

      try {
        const result = await dispatch(getMyCustomersAction());

        if (!result.success) {
          setClientsError(result.error || "Failed to load customers");
          setIsAuthError(false);

          // Fallback to localStorage if API fails
          try {
            const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
            if (storedClients) {
              const parsedClients = JSON.parse(storedClients);
              setClients(parsedClients);
            }
          } catch (parseError) {
            console.error("Error loading clients from localStorage:", parseError);
          }
        }
      } catch (error) {
        console.error("Error loading clients:", error);
        setClientsError(error?.message || "Failed to load customers");
        setIsAuthError(false);

        // Fallback to localStorage
        try {
          const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
          if (storedClients) setClients(JSON.parse(storedClients));
        } catch (parseError) {
          console.error("Error loading clients from localStorage:", parseError);
        }
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
  }, [dispatch]);

  // Exit edit mode and close dropdowns when subscription is loading
  useEffect(() => {
    if (subscriptionLoading) {
      setEditingField(null);
      setOpenStatusDropdowns({});
    }
  }, [subscriptionLoading]);

  // Sync customers from Redux store to local state
  useEffect(() => {
    if (customersFromStore.length > 0) {
      // Transform customers from API format to frontend format
      // Backend returns CustomerMaster objects with nested 'customer' (User) object
      const transformedClients = customersFromStore.map((c) => {
        // Handle nested customer object from CustomerMaster
        const customer = c.customer || c; // Fallback to c if customer doesn't exist
        const firstName = customer.firstName || c.firstName || "";
        const lastName = customer.lastName || c.lastName || "";
        const fullName = c.customerFullName || customer.customerFullName || `${firstName} ${lastName}`.trim() || "ללא שם";
        const initials =
          fullName
            .trim()
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ל";

        // Map backend isActive to frontend status
        // Check isActive first, then fallback to status for backward compatibility
        let frontendStatus = "פעיל";
        if (c.isActive !== undefined) {
          frontendStatus = c.isActive ? "פעיל" : "חסום";
        } else if (c.status === "inactive" || c.status === "לא פעיל" || c.status === "חסום" || c.status === "blocked") {
          frontendStatus = "חסום";
        } else if (c.status === "active" || c.status === "פעיל") {
          frontendStatus = "פעיל";
        } else if (c.status) {
          frontendStatus = c.status;
        }

        // Get rating data from API response
        const reviewStats = c.reviewStatistics || {};
        const avgRating = reviewStats.averageRating || c.averageRating || null;
        const lastRating = reviewStats.lastRating || c.lastRating || null;

        return {
          id: c.id, // CustomerMaster id
          customerId: customer.id || c.customerId, // User id (customer)
          name: fullName,
          firstName: firstName,
          lastName: lastName,
          phone: c.customerPhone || customer.phoneNumber || customer.customerPhone || "",
          email: customer.email || c.email || "",
          city: c.city || customer.city || "",
          address: c.address || customer.address || "",
          isActive: c.isActive !== undefined ? c.isActive : (customer.isActive !== undefined ? customer.isActive : true),
          initials: initials,
          status: frontendStatus,
          totalRevenue: c.totalPaid || 0,
          createdAt: c.createdAt || customer.createdAt || new Date().toISOString(),
          // Rating data from API
          avgRating: avgRating && avgRating > 0 ? avgRating : null,
          lastRating: lastRating && lastRating > 0 ? lastRating : null,
        };
      });
      setClients(transformedClients);
    }
  }, [customersFromStore]);

  // Helpers
  const toggleFieldVisibility = (fieldName) => {
    setVisibleFields((prev) => {
      const updated = { ...prev, [fieldName]: !prev[fieldName] };
      return updated;
    });
  };

  const selectAllFieldsInCategory = (fieldKeys) => {
    setVisibleFields((prev) => {
      const next = { ...prev };
      const allSelected = fieldKeys.every((key) => !!next[key]);
      fieldKeys.forEach((key) => {
        next[key] = !allSelected;
      });
      return next;
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "-";
    const months = [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Get client appointments info
  const getClientAppointmentsInfo = (client) => {
    try {
      const storedAppointments = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
      const allAppointments = storedAppointments ? JSON.parse(storedAppointments) : [];
      
      const clientAppointments = allAppointments.filter((apt) => {
        return (
          apt.clientId === client.id ||
               apt.client === client.name ||
          (apt.clientName && apt.clientName === client.name)
        );
      });

      // Use API ratings if available, even when there are no appointments
      let apiAvgRating = "-";
      let apiLastRating = "-";
      if (client.avgRating && client.avgRating > 0) {
        apiAvgRating = parseFloat(client.avgRating).toFixed(1);
      }
      if (client.lastRating && client.lastRating > 0) {
        apiLastRating = parseFloat(client.lastRating).toFixed(1);
      }

      if (clientAppointments.length === 0) {
        return { 
          count: 0, 
          lastVisit: null,
          lastAppointmentDate: null,
          lastAppointmentTime: null,
          lastService: "-",
          lastStaff: "-",
          lastRating: apiLastRating,
          totalRevenue: 0,
          avgRevenuePerVisit: 0,
          lostRevenue: 0,
          recoveredRevenue: 0,
          avgVisitsPerYear: null,
          daysSinceLastAppointment: null,
          avgTimeBetweenVisits: null,
          avgTimeFromBookingToAppointment: null,
          avgRating: apiAvgRating,
        };
      }

      const sortedAppointments = [...clientAppointments].sort((a, b) => {
        const dateA = new Date(a.date || a.start || 0);
        const dateB = new Date(b.date || b.start || 0);
        return dateB - dateA;
      });

      const lastAppointment = sortedAppointments[0];
      
      let lastAppointmentDate = null;
      let lastAppointmentTime = null;
      if (lastAppointment?.date) {
        lastAppointmentDate = new Date(`${lastAppointment.date}T00:00:00`);
      } else if (lastAppointment?.start) {
        const d = new Date(lastAppointment.start);
        if (!Number.isNaN(d.getTime())) lastAppointmentDate = d;
      }
      if (lastAppointment?.start && typeof lastAppointment.start === "string") {
        // If start is "HH:mm" store time string; otherwise try extract time
        lastAppointmentTime =
          lastAppointment.start.length <= 5
            ? lastAppointment.start
            : new Date(lastAppointment.start).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      }

      let lastVisit = null;
      if (lastAppointmentDate) {
        lastVisit = formatDate(lastAppointmentDate);
        if (lastAppointmentTime) lastVisit += ` ${lastAppointmentTime}`;
      }

      let lastService = "-";
      if (lastAppointment?.serviceName) lastService = lastAppointment.serviceName;
      else if (lastAppointment?.title) lastService = lastAppointment.title.split(/[–-]/)[0]?.trim() || "-";

      let lastStaff = "-";
      if (lastAppointment?.staffName) lastStaff = lastAppointment.staffName;
      else if (lastAppointment?.staff) lastStaff = lastAppointment.staff;

      // Use API lastRating if available (already calculated above as apiLastRating), otherwise use from last appointment
      let lastRating = apiLastRating !== "-" ? apiLastRating : "-";
      if (lastRating === "-") {
        // Fallback to last appointment rating if API rating not available
        const rating = lastAppointment?.rating || lastAppointment?.clientRating;
        if (rating && rating !== "-" && !isNaN(parseFloat(rating))) {
          lastRating = parseFloat(rating).toFixed(1);
        } else {
          lastRating = "-";
        }
      }

      const sortedByDate = [...clientAppointments].sort((a, b) => {
        const dateA = new Date(a.date || a.start || 0);
        const dateB = new Date(b.date || b.start || 0);
        return dateA - dateB;
      });

      const parsePrice = (p) => {
        if (p == null) return 0;
        if (typeof p === "number") return p;
        if (typeof p === "string") {
          const n = parseFloat(p.replace(/[₪$,\s]/g, ""));
          return Number.isNaN(n) ? 0 : n;
        }
        return 0;
      };

      const totalRevenue =
        sortedByDate.reduce((sum, apt) => sum + parsePrice(apt.price || apt.servicePrice || 0), 0) ||
        client.totalRevenue ||
        0;

      const avgRevenuePerVisit = clientAppointments.length > 0 ? Math.round(totalRevenue / clientAppointments.length) : 0;

      const lostRevenue = sortedByDate
        .filter((apt) => {
          const s = apt.status || "";
          return s === "אבוד" || s === "lost" || s === "Lost";
        })
        .reduce((sum, apt) => sum + parsePrice(apt.price || apt.servicePrice || 0), 0);

      const recoveredRevenue = sortedByDate
        .filter((apt) => {
          const s = apt.status || "";
          return s === "התאושש" || s === "recovered" || s === "Recovered";
        })
        .reduce((sum, apt) => sum + parsePrice(apt.price || apt.servicePrice || 0), 0);

      let avgVisitsPerYear = null;
      if (sortedByDate.length > 1) {
        const first = new Date(sortedByDate[0].date || sortedByDate[0].start);
        const last = new Date(sortedByDate[sortedByDate.length - 1].date || sortedByDate[sortedByDate.length - 1].start);
        if (!Number.isNaN(first.getTime()) && !Number.isNaN(last.getTime())) {
          const diffYears = (last - first) / (1000 * 60 * 60 * 24 * 365.25);
          if (diffYears > 0) avgVisitsPerYear = Math.round((clientAppointments.length / diffYears) * 10) / 10;
        }
      }

      let daysSinceLastAppointment = null;
      if (lastAppointmentDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastD = new Date(lastAppointmentDate);
        lastD.setHours(0, 0, 0, 0);
        daysSinceLastAppointment = Math.floor((today - lastD) / (1000 * 60 * 60 * 24));
      }

      let avgTimeBetweenVisits = null;
      if (sortedByDate.length > 1) {
        const diffs = [];
        for (let i = 1; i < sortedByDate.length; i++) {
          const d1 = new Date(sortedByDate[i - 1].date || sortedByDate[i - 1].start);
          const d2 = new Date(sortedByDate[i].date || sortedByDate[i].start);
          if (!Number.isNaN(d1.getTime()) && !Number.isNaN(d2.getTime())) {
            const days = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
            if (days > 0) diffs.push(days);
          }
        }
        if (diffs.length) avgTimeBetweenVisits = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      }

      let avgTimeFromBookingToAppointment = null;
      const bta = [];
      sortedByDate.forEach((apt) => {
        if (apt.createdAt && (apt.date || apt.start)) {
            const bookingDate = new Date(apt.createdAt);
            const appointmentDate = new Date(apt.date || apt.start);
          if (!Number.isNaN(bookingDate.getTime()) && !Number.isNaN(appointmentDate.getTime())) {
            const days = Math.floor((appointmentDate - bookingDate) / (1000 * 60 * 60 * 24));
            if (days >= 0) bta.push(days);
            }
          }
        });
      if (bta.length) avgTimeFromBookingToAppointment = Math.round(bta.reduce((a, b) => a + b, 0) / bta.length);

      // Use API rating data if available (already calculated above as apiAvgRating), otherwise calculate from appointments
      let avgRating = apiAvgRating !== "-" ? apiAvgRating : "-";
      if (avgRating === "-") {
        // Calculate from appointments if API rating not available
        const ratings = sortedByDate
          .map((apt) => apt.rating || apt.clientRating)
          .filter((r) => r && r !== "-" && !isNaN(parseFloat(r)));
        if (ratings.length) {
          const sum = ratings.reduce((acc, r) => acc + parseFloat(r), 0);
          avgRating = (sum / ratings.length).toFixed(1);
        } else {
          avgRating = "-";
        }
      }

      return { 
        count: clientAppointments.length, 
        lastVisit,
        lastAppointmentDate,
        lastAppointmentTime,
        lastService,
        lastStaff,
        lastRating,
        totalRevenue,
        avgRevenuePerVisit,
        lostRevenue,
        recoveredRevenue,
        avgVisitsPerYear,
        daysSinceLastAppointment,
        avgTimeBetweenVisits,
        avgTimeFromBookingToAppointment,
        avgRating,
      };
    } catch (error) {
      console.error("Error getting client appointments info:", error);
      return { 
        count: 0, 
        lastVisit: null,
        lastAppointmentDate: null,
        lastAppointmentTime: null,
        lastService: "-",
        lastStaff: "-",
        lastRating: "-",
        totalRevenue: 0,
        avgRevenuePerVisit: 0,
        lostRevenue: 0,
        recoveredRevenue: 0,
        avgVisitsPerYear: null,
        daysSinceLastAppointment: null,
        avgTimeBetweenVisits: null,
        avgTimeFromBookingToAppointment: null,
        avgRating: "-",
      };
    }
  };
  
  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients;

    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      const queryLower = query.toLowerCase();

      filtered = clients.filter((client) => {
        const nameMatch = client.name?.toLowerCase().includes(queryLower);
        const emailMatch = client.email?.toLowerCase().includes(queryLower);

        let phoneMatch = false;
        if (client.phone) {
          let phoneDigits = String(client.phone).replace(/\D/g, "");
          let queryDigits = query.replace(/\D/g, "");

          if (phoneDigits.startsWith("972") && phoneDigits.length > 3) phoneDigits = "0" + phoneDigits.substring(3);
          if (queryDigits.startsWith("972") && queryDigits.length > 3) queryDigits = "0" + queryDigits.substring(3);

          if (phoneDigits && queryDigits) phoneMatch = phoneDigits.startsWith(queryDigits);
        }

        return nameMatch || emailMatch || phoneMatch;
      });
    }

    // Filter by status
    if (selectedStatus !== null) {
      filtered = filtered.filter((client) => {
        const clientStatus = client.status || "פעיל";
        const statusMap = {
          פעיל: "פעיל",
          active: "פעיל",
          Active: "פעיל",
          "בסיכון": "בסיכון",
          "at risk": "בסיכון",
          "At Risk": "בסיכון",
          אבוד: "אבוד",
          lost: "אבוד",
          Lost: "אבוד",
          התאושש: "התאושש",
          recovered: "התאושש",
          Recovered: "התאושש",
          חדש: "חדש",
          new: "חדש",
          New: "חדש",
          חסום: "חסום",
          blocked: "חסום",
          Blocked: "חסום",
        };
        const normalized = statusMap[clientStatus] || clientStatus;
        return normalized === selectedStatus;
      });
    }

    // Filter by rating (using lastRating from appointments info)
    if (selectedRating !== null) {
      filtered = filtered.filter((client) => {
        const appointmentsInfo = getClientAppointmentsInfo(client);
        const r = appointmentsInfo.lastRating || "-";
        if (selectedRating === "-") return r === "-" || !r;
        // Compare rating values - if selectedRating is an integer, match ratings that round to that integer
        if (r === "-" || r === null || r === undefined) return false;
        const ratingNum = parseFloat(r);
        if (isNaN(ratingNum)) return false;
        const selectedNum = parseFloat(selectedRating);
        if (isNaN(selectedNum)) return false;
        // Match if the rating rounds to the selected rating (e.g., 2.0-2.9 matches "2")
        return Math.round(ratingNum) === selectedNum;
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        // Show newest first (descending by createdAt)
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      }
      if (sortBy === "oldest") {
        // Show oldest first (ascending by createdAt)
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aDate - bDate;
      }
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

    return sorted;
  }, [clients, searchQuery, sortBy, selectedStatus, selectedRating]);

  // Client updates
  const handleClientUpdate = async (updatedClient) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי לערוך לקוחות. אנא הירשם למנוי כדי להמשיך.');
      return;
    }
    
    // Prevent duplicate calls
    if (isUpdatingClient) {
      return;
    }
    
    setIsUpdatingClient(true);
    
    // Update via API
    const updateData = {};
    if (updatedClient.name) {
      const nameParts = updatedClient.name.trim().split(" ").filter(Boolean);
      updateData.firstName = nameParts[0] || "";
      updateData.lastName = nameParts.slice(1).join(" ") || updateData.firstName;
    }
    if (updatedClient.phone) {
      updateData.phoneNumber = formatPhoneForBackend(updatedClient.phone.replace(/\D/g, ""));
    }
    if (updatedClient.email !== undefined) {
      updateData.email = updatedClient.email.trim();
    }
    if (updatedClient.address !== undefined) {
      updateData.address = updatedClient.address.trim() || null;
    }
    if (updatedClient.city !== undefined) {
      updateData.city = updatedClient.city.trim() || null;
    }
    if (updatedClient.status !== undefined) {
      // Map status to isActive: "פעיל" = true, everything else (including "חסום") = false
      updateData.isActive = updatedClient.status === "פעיל";
    }

    // Check if there's any data to update
    if (Object.keys(updateData).length === 0) {
      setIsUpdatingClient(false);
      return;
    }
    
    try {
      const result = await dispatch(updateCustomerAction(updatedClient.id, updateData));

      if (result.success) {
        // Refresh customers list
        await dispatch(getMyCustomersAction());

        // Update local state
        const updatedClients = clients.map((c) => (c.id === updatedClient.id ? updatedClient : c));
        setClients(updatedClients);
        setSelectedClientForView(updatedClient);
        
        // Show success toast
        toast.success(result.data?.message || "לקוח עודכן בהצלחה");
      } else {
        console.error("Error updating client:", result.error);
        const errorMessage = result.error || "נסה שוב";
        toast.error("שגיאה בעדכון הלקוח: " + errorMessage);
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("שגיאה בעדכון הלקוח: " + error.message);
    } finally {
      setIsUpdatingClient(false);
    }
  };

  const handleUpdateClientFieldInList = async (clientId, field, value) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי לערוך לקוחות. אנא הירשם למנוי כדי להמשיך.');
      return;
    }
    
    // Prevent duplicate calls
    if (isUpdatingClient) {
      return;
    }
    
    setIsUpdatingClient(true);
    
    // Find the client to get current data
    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      setIsUpdatingClient(false);
      return;
    }

    // Map frontend field names to backend field names
    let updateData = {};
    if (field === "name") {
      // Split name into firstName and lastName
      const nameParts = value.trim().split(" ").filter(Boolean);
      updateData.firstName = nameParts[0] || "";
      updateData.lastName = nameParts.slice(1).join(" ") || updateData.firstName;
    } else if (field === "phone") {
      updateData.phoneNumber = formatPhoneForBackend(value.replace(/\D/g, ""));
    } else if (field === "email") {
      updateData.email = value.trim();
    } else if (field === "address") {
      updateData.address = value.trim() || null;
    } else if (field === "city") {
      updateData.city = value.trim() || null;
    }

    try {
      const result = await dispatch(updateCustomerAction(clientId, updateData));

      if (result.success) {
        // Refresh customers list
        await dispatch(getMyCustomersAction());

        // Update local state immediately for better UX
        const updatedClients = clients.map((c) => (c.id === clientId ? { ...c, [field]: value } : c));
        setClients(updatedClients);

        if (selectedClientForView?.id === clientId) {
          const updatedClient = updatedClients.find((c) => c.id === clientId);
          setSelectedClientForView(updatedClient || null);
        }
        
        // Show success toast
        toast.success(result.data?.message || "לקוח עודכן בהצלחה");
      } else {
        console.error("Error updating client:", result.error);
        const errorMessage = result.error || "נסה שוב";
        toast.error("שגיאה בעדכון הלקוח: " + errorMessage);
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("שגיאה בעדכון הלקוח: " + error.message);
    } finally {
      setIsUpdatingClient(false);
    }
  };

  const handleUpdateClientStatus = async (clientId, newStatus) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי לערוך סטטוס. אנא הירשם למנוי כדי להמשיך.');
      return;
    }
    
    // Prevent duplicate calls
    if (isUpdatingClient) {
      return;
    }
    
    setIsUpdatingClient(true);
    
    // Map frontend status to isActive: "פעיל" = true, everything else (including "חסום") = false
    const isActive = newStatus === "פעיל";

    try {
      const result = await dispatch(updateCustomerAction(clientId, { isActive }));

      if (result.success) {
        // Refresh customers list
        await dispatch(getMyCustomersAction());

        // Update local state immediately for better UX
        const updatedClients = clients.map((client) => (client.id === clientId ? { ...client, status: newStatus } : client));
        setClients(updatedClients);

        if (selectedClientForView?.id === clientId) {
          const updatedClient = updatedClients.find((c) => c.id === clientId);
          setSelectedClientForView(updatedClient || null);
        }

        setOpenStatusDropdowns((prev) => ({ ...prev, [clientId]: false }));
        
        // Show success toast
        toast.success(result.data?.message || "סטטוס הלקוח עודכן בהצלחה");
      } else {
        console.error("Error updating client status:", result.error);
        const errorMessage = result.error || "נסה שוב";
        toast.error("שגיאה בעדכון סטטוס הלקוח: " + errorMessage);
      }
    } catch (error) {
      console.error("Error updating client status:", error);
      toast.error("שגיאה בעדכון סטטוס הלקוח: " + error.message);
    } finally {
      setIsUpdatingClient(false);
    }
  };

  const handleDeleteClient = (clientId) => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי למחוק לקוחות. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    const client = clients.find((c) => c.id === clientId);
    setClientToDelete(clientId);
    setClientsToDelete([]);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      const result = await dispatch(removeCustomerAction(clientToDelete));

      if (result.success) {
        // Refresh customers list
        await dispatch(getMyCustomersAction());

        // Update local state immediately for better UX
        const updatedClients = clients.filter((c) => c.id !== clientToDelete);
        setClients(updatedClients);
        setSelectedClients((prev) => prev.filter((id) => id !== clientToDelete));

        // Close client summary if viewing deleted client
        if (selectedClientForView?.id === clientToDelete) {
          setShowClientSummary(false);
          setSelectedClientForView(null);
        }
        
        // Show success toast
        toast.success(result.data?.message || "לקוח נמחק בהצלחה");
      } else {
        console.error("Error deleting client:", result.error);
        const errorMessage = result.error || "נסה שוב";
        toast.error("שגיאה במחיקת הלקוח: " + errorMessage);
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("שגיאה במחיקת הלקוח: " + error.message);
    } finally {
      setClientToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Bulk actions
  const handleDownloadSelectedClients = () => {
    if (selectedClients.length === 0) {
      alert("אנא בחר לפחות לקוח אחד להורדה");
      return;
    }

    const selectedClientsData = clients.filter((client) => selectedClients.includes(client.id));

    const headers = ["שם", "טלפון", "אימייל", "עיר", "כתובת", "סטטוס", "דירוג אחרון", "סך הכנסות"];
    const rows = selectedClientsData.map((client) => [
      client.name || "",
      client.phone ? formatPhoneForDisplay(client.phone) : "",
      client.email || "",
      client.city || "",
      client.address || "",
      client.status || "פעיל",
      client.le || "-",
      client.totalRevenue || 0,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `לקוחות_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSelectedClients = () => {
    if (selectedClients.length === 0) {
      alert("אנא בחר לפחות לקוח אחד למחיקה");
      return;
    }

    setClientToDelete(null);
    setClientsToDelete([...selectedClients]);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSelectedClients = async () => {
    if (clientsToDelete.length === 0) return;

    try {
      // Delete all selected clients
      const deletePromises = clientsToDelete.map((clientId) => dispatch(removeCustomerAction(clientId)));
      const results = await Promise.all(deletePromises);

      // Check if all deletions were successful
      const allSuccessful = results.every((result) => result.success);
      if (allSuccessful) {
        // Refresh customers list
        await dispatch(getMyCustomersAction());

        // Update local state
        const updatedClients = clients.filter((c) => !clientsToDelete.includes(c.id));
        setClients(updatedClients);
        setSelectedClients([]);

        // Close client summary if viewing deleted client
        if (selectedClientForView && clientsToDelete.includes(selectedClientForView.id)) {
          setShowClientSummary(false);
          setSelectedClientForView(null);
        }
        
        // Show success toast
        toast.success(`${clientsToDelete.length} לקוח/ים נמחקו בהצלחה`);
      } else {
        const failedCount = results.filter((r) => !r.success).length;
        toast.error(`נכשל במחיקת ${failedCount} מתוך ${clientsToDelete.length} לקוחות`);
      }
    } catch (error) {
      console.error("Error deleting clients:", error);
      toast.error("שגיאה במחיקת הלקוחות: " + error.message);
    } finally {
      setClientsToDelete([]);
      setShowDeleteConfirm(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredAndSortedClients.length) setSelectedClients([]);
    else setSelectedClients(filteredAndSortedClients.map((c) => c.id));
  };

  const handleSelectClient = (clientId) => {
    setSelectedClients((prev) => (prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]));
  };

  // Create new client
  const handleCreateNewClient = async () => {
    if (!hasActiveSubscription) {
      alert('נדרש מנוי פעיל כדי ליצור לקוחות. אנא הירשם למנוי כדי להמשיך.');
      return;
    }

    const errors = {};
    if (!newClientName.trim()) errors.name = "שם הוא שדה חובה";

    const phoneDigits = newClientPhone.trim().replace(/\D/g, "");
    if (!newClientPhone.trim()) errors.phone = "טלפון הוא שדה חובה";
    else if (phoneDigits.length !== 10) errors.phone = "מספר טלפון חייב להכיל בדיוק 10 ספרות";

    // Email validation (required by backend)
    if (!newClientEmail.trim()) {
      errors.email = "אימייל הוא שדה חובה";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientEmail.trim())) {
      errors.email = "אימייל לא תקין";
    }

    setNewClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Split full name into firstName and lastName
    const nameParts = newClientName.trim().split(" ").filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Generate a temporary password (backend requires it)
    const tempPassword = `Temp${Date.now()}${Math.random().toString(36).slice(2)}`;

    // Prepare customer data according to backend API
    const customerData = {
      email: newClientEmail.trim(),
      password: tempPassword,
      firstName: firstName,
      lastName: lastName || firstName,
      phoneNumber: formatPhoneForBackend(phoneDigits),
      address: newClientAddress.trim() || null,
      city: newClientCity.trim() || null,
    };

    try {
      // Call API to create customer
      const result = await dispatch(addCustomerAction(customerData));

      if (result.success) {
        // Customer created successfully, refresh the customers list
        await dispatch(getMyCustomersAction());

        // Show success toast
        toast.success(result.data?.message || "לקוח נוצר בהצלחה");

        // Reset form
        setIsNewClientModalOpen(false);
        setNewClientName("");
        setNewClientPhone("");
        setNewClientEmail("");
        setNewClientCity("");
        setNewClientAddress("");
        setNewClientErrors({});
      } else {
        // API error
        const errorMessage = result.error || "שגיאה ביצירת הלקוח. נסה שוב.";
        toast.error(errorMessage);
        setNewClientErrors({
          general: errorMessage,
        });
      }
    } catch (error) {
      console.error("Error creating client:", error);
      const errorMessage = error.message || "שגיאה ביצירת הלקוח. נסה שוב.";
      toast.error(errorMessage);
      setNewClientErrors({
        general: errorMessage,
      });
    }
  };

  // CSV import
  const handleCsvFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv"))) {
      setCsvFile(file);
      parseCsvFile(file);
        } else {
      alert("אנא בחר קובץ CSV בלבד");
    }
  };

  const parseCsvFile = (file) => {
    const reader = new FileReader();

      const parseCsvLine = (line) => {
        const result = [];
      let current = "";
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
            i++;
            } else {
              inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            result.push(current.trim());
          current = "";
      } else {
            current += char;
          }
        }
        
        result.push(current.trim());
        return result;
      };

    reader.onload = async (e) => {
      const text = e.target?.result || "";
      const lines = String(text)
        .split(/\r?\n/)
        .map((l) => l.replace(/^\uFEFF/, "")) // remove BOM if present
        .filter((line) => line.trim());

      if (lines.length < 2) {
        alert("קובץ CSV חייב להכיל לפחות שורת כותרת ושורת נתונים אחת");
        return;
      }

      const headers = parseCsvLine(lines[0]).map((h) => h.trim()).filter((h) => h.length > 0);
      
      // Debug: Log headers to console
      console.log('CSV Headers found:', headers);
      
      if (headers.length === 0) {
        alert("קובץ CSV לא מכיל שורת כותרת תקינה. אנא ודא שהקובץ מתחיל בשורת כותרת עם שמות העמודות.");
        return;
      }
      
      const headersLower = headers.map((h) => h.toLowerCase());

      // More flexible matching for name column (case-insensitive, handles variations)
      // Matches: שם, name, ClientName, clientname, client_name, etc.
      const nameIndex = headersLower.findIndex((h) => 
        h.includes("שם") || 
        h.includes("name") || 
        h.includes("שם מלא") ||
        h === "שם" ||
        h === "name" ||
        h === "שם לקוח" ||
        h === "customer name" ||
        h === "full name" ||
        h === "clientname" ||
        h === "client_name" ||
        h.includes("clientname") ||
        h.includes("client_name")
      );
      
      // More flexible matching for phone column
      // Matches: טלפון, phone, ClientPhone, clientphone, client_phone, etc.
      const phoneIndex = headersLower.findIndex((h) => 
        h.includes("טלפון") || 
        h.includes("phone") || 
        h.includes("מספר טלפון") || 
        h.includes("mobile") ||
        h === "טלפון" ||
        h === "phone" ||
        h === "מספר נייד" ||
        h === "mobile number" ||
        h === "tel" ||
        h.includes("מספר") ||
        h === "clientphone" ||
        h === "client_phone" ||
        h.includes("clientphone") ||
        h.includes("client_phone")
      );
      
      // More flexible matching for email column
      // Matches: אימייל, email, ClientEmail, clientemail, client_email, etc.
      const emailIndex = headersLower.findIndex((h) => 
        h.includes("אימייל") || 
        h.includes("email") || 
        h.includes("מייל") ||
        h === "email" ||
        h === "אימייל" ||
        h === "clientemail" ||
        h === "client_email" ||
        h.includes("clientemail") ||
        h.includes("client_email")
      );
      
      // More flexible matching for city column
      // Matches: עיר, city, ClientCity, clientcity, client_city, etc.
      const cityIndex = headersLower.findIndex((h) => 
        h.includes("עיר") || 
        h.includes("city") ||
        h === "city" ||
        h === "עיר" ||
        h === "clientcity" ||
        h === "client_city" ||
        h.includes("clientcity") ||
        h.includes("client_city")
      );
      
      // More flexible matching for address column
      // Matches: כתובת, address, ClientAddress, clientaddress, client_address, etc.
      const addressIndex = headersLower.findIndex((h) => 
        h.includes("כתובת") || 
        h.includes("address") ||
        h === "address" ||
        h === "כתובת" ||
        h === "clientaddress" ||
        h === "client_address" ||
        h.includes("clientaddress") ||
        h.includes("client_address")
      );

      if (nameIndex === -1 || phoneIndex === -1) {
        // Show more helpful error message with found headers
        const foundHeaders = headers.length > 0 ? headers.join(", ") : "לא נמצאו עמודות";
        const missingColumns = [];
        if (nameIndex === -1) missingColumns.push('"שם" או "name"');
        if (phoneIndex === -1) missingColumns.push('"טלפון" או "phone"');
        
        alert(`קובץ CSV חייב להכיל עמודות "שם" ו"טלפון".\n\nעמודות שנמצאו בקובץ: ${foundHeaders}\n\nחסרות העמודות: ${missingColumns.join(", ")}\n\nאנא ודא שהקובץ מכיל שורת כותרת עם העמודות הנדרשות.`);
        return;
      }

      const importedClients = [];
      const errors = [];
      const skipped = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        
        const name = values[nameIndex]?.trim();
        const phone = values[phoneIndex]?.trim();
        const email = emailIndex >= 0 ? values[emailIndex]?.trim() || "" : "";
        const city = cityIndex >= 0 ? values[cityIndex]?.trim() || "" : "";
        const address = addressIndex >= 0 ? values[addressIndex]?.trim() || "" : "";

        if (!name || !phone) {
          skipped.push(`שורה ${i + 1}: חסרים שם או טלפון`);
          continue;
        }

        const phoneDigits = phone.replace(/\D/g, "");
        if (phoneDigits.length !== 10) {
          errors.push(`שורה ${i + 1}: מספר טלפון לא תקין (${phone})`);
          continue;
        }

        const initials =
          name
            .split(" ")
          .filter(Boolean)
          .map((part) => part[0])
            .join("")
          .slice(0, 2)
            .toUpperCase() || "ל";

        const formattedPhone = formatPhoneForBackend(phoneDigits);

        const existingClient = clients.find(
          (c) => c.phone === formattedPhone || c.name?.toLowerCase() === name.toLowerCase()
        );

        if (existingClient) {
          skipped.push(`שורה ${i + 1}: לקוח ${name} כבר קיים במערכת`);
          continue;
        }

        importedClients.push({
          id: Date.now() + i,
          name,
          phone: formattedPhone,
          email,
          city,
          address,
          initials,
          totalRevenue: 0,
          status: "פעיל",
        });
      }

      // Set initial progress
      const initialProgress = {
        total: lines.length - 1,
        imported: 0,
        errors: errors.length,
        skipped: skipped.length,
        errorMessages: errors,
        skippedMessages: skipped,
      };
      setCsvImportProgress(initialProgress);

      // Import clients via API using bulk import
      if (importedClients.length > 0) {
        try {
          // Prepare customer data array for bulk import
          const customersArray = importedClients.map((importedClient) => {
            // Split name into firstName and lastName
            const nameParts = importedClient.name.trim().split(" ").filter(Boolean);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            // Keep city and address separate (don't combine them)
            // Prepare customer data
            return {
              firstName: firstName,
              lastName: lastName || firstName,
              phoneNumber: importedClient.phone,
              email: importedClient.email || null,
              address: importedClient.address || null,
              city: importedClient.city || null,
              customerFullName: importedClient.name || `${firstName} ${lastName}`.trim(),
              status: 'new',
              isActive: true,
            };
          });

          // Call bulk import API
          const result = await dispatch(bulkImportCustomersAction(customersArray));
          
          if (result.success && result.data) {
            const importData = result.data;
            
            // Format error messages from backend
            const apiErrors = [
              ...errors,
              ...(importData.errors || []).map((err) => 
                `שורה ${err.index}: ${err.error}`
              )
            ];

            // Format skipped messages from backend
            const skippedMessages = [
              ...skipped,
              ...(importData.skipped || []).map((skip) => 
                `שורה ${skip.index}: ${skip.reason}`
              )
            ];

            // Refresh customers list
            await dispatch(getMyCustomersAction());

            // Update progress
            setCsvImportProgress({
              total: importData.total || lines.length - 1,
              imported: importData.imported || 0,
              errors: apiErrors.length,
              skipped: skippedMessages.length,
              errorMessages: apiErrors,
              skippedMessages: skippedMessages,
            });
            
            // Show success toast with summary
            if (importData.imported > 0) {
              toast.success(
                `יובאו ${importData.imported} מתוך ${importData.total} לקוחות בהצלחה${importData.errors > 0 || importData.skipped > 0 ? ` (${importData.errors} שגיאות, ${importData.skipped} דולגו)` : ''}`
              );
            } else {
              toast.warning("לא יובאו לקוחות. בדוק את השגיאות והדילוגים.");
            }
          } else {
            // Handle bulk import failure
            const apiErrors = [
              ...errors,
              `שגיאה ביבוא: ${result.error || 'Unknown error'}`
            ];

            setCsvImportProgress({
              total: lines.length - 1,
              imported: 0,
              errors: apiErrors.length,
              skipped: skipped.length,
              errorMessages: apiErrors,
              skippedMessages: skipped,
            });
            
            // Show error toast
            toast.error(result.error || "שגיאה ביבוא הלקוחות. נסה שוב.");
          }
        } catch (error) {
          // Handle unexpected errors
          const apiErrors = [
            ...errors,
            `שגיאה ביבוא: ${error.message || 'Unknown error'}`
          ];

          setCsvImportProgress({
            total: lines.length - 1,
            imported: 0,
            errors: apiErrors.length,
            skipped: skipped.length,
            errorMessages: apiErrors,
            skippedMessages: skipped,
          });
          
          // Show error toast
          toast.error("שגיאה ביבוא הלקוחות: " + (error.message || "נסה שוב"));
        }
      }
    };

    reader.onerror = () => alert("שגיאה בקריאת הקובץ");
    reader.readAsText(file, "UTF-8");
    };

  const handleStartCsvImport = () => {
    setShowCsvImportModal(true);
    setCsvFile(null);
    setCsvImportProgress(null);
    // Modal will show first, user can click inside modal to select file
  };

  const handleCloseCsvImport = () => {
    setShowCsvImportModal(false);
    setCsvFile(null);
    setCsvImportProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Column definitions for CalendarCommonTable
  const columns = useMemo(() => {
    const cols = [];
    
    if (visibleFields.name) {
      cols.push({ key: "name", label: "שם לקוח", width: "w-32", marginRight: columnSpacing.nameToStatus });
    }
    if (visibleFields.status) {
      cols.push({ key: "status", label: "סטטוס", width: "w-28", marginRight: columnSpacing.statusToPhone });
    }
    if (visibleFields.phone) {
      cols.push({ key: "phone", label: "מספר נייד", width: "w-40", marginRight: columnSpacing.phoneToRating });
    }
    if (visibleFields.email) {
      cols.push({ key: "email", label: "אימייל", width: "w-40" });
    }
    if (visibleFields.city) {
      cols.push({ key: "city", label: "עיר", width: "w-28" });
    }
    if (visibleFields.address) {
      cols.push({ key: "address", label: "כתובת", width: "w-40" });
    }
    if (visibleFields.firstAppointmentDate) {
      cols.push({ key: "firstAppointmentDate", label: "תאריך פגישה ראשונה", width: "w-32", type: "date" });
    }
    if (visibleFields.totalRevenue) {
      cols.push({ key: "totalRevenue", label: "סך הכנסות", width: "w-24", marginRight: columnSpacing.revenueToActions, type: "currency" });
    }
    if (visibleFields.avgRevenuePerVisit) {
      cols.push({ key: "avgRevenuePerVisit", label: "ממוצע הכנסה לתור", width: "w-32", type: "currency" });
    }
    if (visibleFields.avgTransaction) {
      cols.push({ key: "avgTransaction", label: "עסקה ממוצעת", width: "w-28", type: "currency" });
    }
    if (visibleFields.lostRevenue) {
      cols.push({ key: "lostRevenue", label: "הכנסות שאבדו", width: "w-28", type: "currency" });
    }
    if (visibleFields.recoveredRevenue) {
      cols.push({ key: "recoveredRevenue", label: "הכנסות שחזרו", width: "w-28", type: "currency" });
    }
    if (visibleFields.appointmentsCount) {
      cols.push({ key: "appointmentsCount", label: "מספר תורים", width: "w-24" });
    }
    if (visibleFields.avgVisitsPerYear) {
      cols.push({ key: "avgVisitsPerYear", label: "ביקור ממוצע בשנה", width: "w-32" });
    }
    if (visibleFields.daysSinceLastAppointment) {
      cols.push({ key: "daysSinceLastAppointment", label: "ימים מהתור האחרון", width: "w-32" });
    }
    if (visibleFields.avgTimeBetweenVisits) {
      cols.push({ key: "avgTimeBetweenVisits", label: "זמן ממוצע בין תורים", width: "w-36" });
    }
    if (visibleFields.avgTimeFromBookingToAppointment) {
      cols.push({ key: "avgTimeFromBookingToAppointment", label: "זמן בין קביעת תור לתור", width: "w-40" });
    }
    if (visibleFields.avgRating) {
      cols.push({ key: "avgRating", label: "ממוצע דירוג", width: "w-28" });
    }
    if (visibleFields.lastAppointmentDate) {
      cols.push({ key: "lastAppointmentDate", label: "תאריך תור אחרון", width: "w-32", type: "date" });
    }
    if (visibleFields.lastAppointmentTime) {
      cols.push({ key: "lastAppointmentTime", label: "זמן תור אחרון", width: "w-28" });
    }
    if (visibleFields.lastService) {
      cols.push({ key: "lastService", label: "שירות אחרון", width: "w-32" });
    }
    if (visibleFields.lastRating) {
      cols.push({ key: "lastRating", label: "דירוג אחרון", width: "w-28" });
    }
    if (visibleFields.lastStaff) {
      cols.push({ key: "lastStaff", label: "איש צוות אחרון", width: "w-28" });
    }
    if (visibleFields.source) {
      cols.push({ key: "source", label: "מקור הגעה", width: "w-32" });
    }
    if (visibleFields.leadDate) {
      cols.push({ key: "leadDate", label: "תאריך כניסת הליד", width: "w-32", type: "date" });
    }
    if (visibleFields.timeToConversion) {
      cols.push({ key: "timeToConversion", label: "זמן להמרה", width: "w-32" });
    }
    if (visibleFields.campaignName) {
      cols.push({ key: "campaignName", label: "שם קמפיין", width: "w-32" });
    }
    if (visibleFields.adSetName) {
      cols.push({ key: "adSetName", label: "שם אד-סט", width: "w-32" });
    }
    if (visibleFields.adName) {
      cols.push({ key: "adName", label: "שם מודעה", width: "w-32" });
    }
    if (visibleFields.utmSource) {
      cols.push({ key: "utmSource", label: "UTM Source", width: "w-28" });
    }
    if (visibleFields.utmMedium) {
      cols.push({ key: "utmMedium", label: "UTM Medium", width: "w-28" });
    }
    if (visibleFields.utmCampaign) {
      cols.push({ key: "utmCampaign", label: "UTM Campaign", width: "w-32" });
    }
    if (visibleFields.utmContent) {
      cols.push({ key: "utmContent", label: "UTM Content", width: "w-28" });
    }
    if (visibleFields.utmTerm) {
      cols.push({ key: "utmTerm", label: "UTM Term", width: "w-28" });
    }
    
    return cols;
  }, [visibleFields, columnSpacing]);

  // Custom cell renderer for complex cells
  const renderCell = (column, row, rowIndex, rowData) => {
    const client = row;
    const clientAppointmentsInfo = rowData || getClientAppointmentsInfo(client);

    // Name cell with avatar (no inline editing)
    if (column.key === "name") {
      return (
        <>
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2b2b2b] flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-white flex-shrink-0 overflow-hidden">
            {client.profileImage ? (
              <img src={client.profileImage} alt={client.name || "לקוח"} className="w-full h-full object-cover" />
            ) : (
              client.initials || (client.name ? client.name.charAt(0).toUpperCase() : "ל")
            )}
          </div>
          <div className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {client.name || "ללא שם"}
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
                alert('נדרש מנוי פעיל כדי לערוך סטטוס. אנא הירשם למנוי כדי להמשיך.');
                return;
              }
              const rect = e.currentTarget.getBoundingClientRect();
              setStatusDropdownPositions((prev) => ({
                ...prev,
                [client.id]: {
                  top: rect.bottom + window.scrollY + 8,
                  right: window.innerWidth - rect.right,
                },
              }));
              setOpenStatusDropdowns((prev) => ({ ...prev, [client.id]: !prev[client.id] }));
            }}
            disabled={!hasActiveSubscription || subscriptionLoading}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition text-white ${
              !hasActiveSubscription || subscriptionLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90'
            } ${
              (client.status || "פעיל") === "חסום" || (client.status || "פעיל") === "לא פעיל"
                ? "bg-black dark:bg-white dark:text-black"
                : ""
            }`}
            style={(client.status || "פעיל") === "פעיל" ? { backgroundColor: BRAND_COLOR } : {}}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                (client.status || "פעיל") === "פעיל" ? "bg-white animate-pulse" : "bg-white dark:bg-black"
              }`}
            />
            <span>{client.status || "פעיל"}</span>
            <FiChevronDown className="text-[10px]" />
          </button>
          
          {openStatusDropdowns[client.id] && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenStatusDropdowns((prev) => ({ ...prev, [client.id]: false }));
                }}
              />
              <div
                dir="rtl"
                className="fixed w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-customBrown shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                style={{
                  top: statusDropdownPositions[client.id]?.top ? `${statusDropdownPositions[client.id].top}px` : "auto",
                  right: statusDropdownPositions[client.id]?.right ? `${statusDropdownPositions[client.id].right}px` : "auto",
                }}
              >
                <div className="py-2">
                  {["פעיל", "חסום"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={!hasActiveSubscription || subscriptionLoading}
                      className={`w-full flex items-center justify-between px-3 py-2 ${
                        !hasActiveSubscription || subscriptionLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasActiveSubscription || subscriptionLoading) {
                          return;
                        }
                        handleUpdateClientStatus(client.id, s);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            (client.status || "פעיל") === s
                              ? s === "חסום"
                                ? "border-gray-500"
                                : "border-[rgba(255,37,124,1)]"
                              : "border-gray-300 dark:border-gray-500"
                          }`}
                        >
                          {(client.status || "פעיל") === s &&
                            (s === "חסום" ? (
                              <span className="w-2 h-2 rounded-full bg-gray-500" />
                            ) : (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                            ))}
                        </span>
                        <span>{s}</span>
                      </span>
                    </button>
                  ))}

                  <div className="border-t border-gray-200 dark:border-[#262626] my-2" />

                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2 text-red-600 dark:text-red-400 ${
                      !hasActiveSubscription || subscriptionLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasActiveSubscription) {
                        alert('נדרש מנוי פעיל כדי למחוק לקוחות. אנא הירשם למנוי כדי להמשיך.');
                        return;
                      }
                      setOpenStatusDropdowns((prev) => ({ ...prev, [client.id]: false }));
                      handleDeleteClient(client.id);
                    }}
                    disabled={!hasActiveSubscription || subscriptionLoading}
                  >
                    מחק לקוח
                    <FiTrash2 />
                  </button>
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
            {client.phone ? formatPhoneForDisplay(client.phone) : "-"}
          </div>

          {client.phone && (
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
                  window.location.href = `tel:${client.phone}`;
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
                  const whatsappUrl = formatPhoneToWhatsapp(client.phone);
                  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <img 
                  // src={whatsappIcon} 
                  src={isDarkMode ? whatsappLightIcon : whatsappDarkIcon}
                  alt="WhatsApp" 
                  className="w-6 h-6"
                  style={{ filter: isDarkMode ? "brightness(1)" : "brightness(0)" }}
                />
              </button>
            </>
          )}
        </>
      );
    }

    // Default rendering for other cells
    const fieldValue = client[column.key];
    
    // Handle appointment info fields
    if (column.key === "avgRevenuePerVisit" || column.key === "avgTransaction" || 
        column.key === "lostRevenue" || column.key === "recoveredRevenue" ||
        column.key === "appointmentsCount" || column.key === "avgVisitsPerYear" ||
        column.key === "daysSinceLastAppointment" || column.key === "avgTimeBetweenVisits" ||
        column.key === "avgTimeFromBookingToAppointment" || column.key === "avgRating" ||
        column.key === "lastAppointmentDate" || column.key === "lastAppointmentTime" ||
        column.key === "lastService" || column.key === "lastRating" || column.key === "lastStaff") {
      const value = clientAppointmentsInfo[column.key];
      if (column.type === "currency") {
        return <div className="text-sm text-gray-700 dark:text-white">₪{(value || 0).toLocaleString()}</div>;
      }
      if (column.type === "date" && value) {
        return <div className="text-sm text-gray-700 dark:text-white">{formatDate(value)}</div>;
      }
      // Handle rating fields - show as number with star icon
      if (column.key === "avgRating" || column.key === "lastRating") {
        // Check if value is a valid number (including 0, but not null/undefined/empty string)
        const ratingValue = value !== null && value !== undefined && value !== "" && value !== "-" ? parseFloat(value) : null;
        if (ratingValue !== null && !isNaN(ratingValue) && ratingValue > 0) {
          return (
            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-white">
              <FaStar className="text-ratingStar" style={{ fontSize: "12px" }} />
              <span>{ratingValue.toFixed(1)}</span>
            </div>
          );
        }
        return <div className="text-sm text-gray-700 dark:text-white">-</div>;
      }
      return <div className="text-sm text-gray-700 dark:text-white">{value || "-"}</div>;
    }

    // Handle regular fields
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
      <div className="">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">רשימת לקוחות</h1>
              {clients.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-white bg-gray-100 dark:bg-customBrown px-2 py-0.5 rounded">
                  {clients.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-white">
              צפה, הוסף, ערוך ומחק את פרטי הלקוחות שלך.{" "}
              <a href="#" className="text-[#ff257c] hover:underline">
                למד עוד
              </a>
            </p>
          </div>

          <div className="flex items-center gap-2">
              <button
              onClick={() => {
                if (!hasActiveSubscription) {
                  alert('נדרש מנוי פעיל כדי ליצור לקוחות. אנא הירשם למנוי כדי להמשיך.');
                  return;
                }
                setNewClientName("");
                setNewClientPhone("");
                setNewClientEmail("");
                setNewClientCity("");
                setNewClientAddress("");
                setNewClientErrors({});
                setIsNewClientModalOpen(true);
              }}
              disabled={!hasActiveSubscription || subscriptionLoading}
              className={`px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${
                !hasActiveSubscription || subscriptionLoading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
              }`}
              title={!hasActiveSubscription ? 'נדרש מנוי פעיל כדי ליצור לקוחות' : ''}
            >
              חדש
              <FiPlus className="text-base" />
            </button>
          </div>
        </div>

        {/* Import Clients Banner */}
        {showImportBanner && (
          <div className="mb-6 relative w-3/4">
            <div className="relative rounded-2xl shadow-xl py-[141px] px-32 flex items-center justify-between overflow-hidden">
            {/* <button
              onClick={() => setShowImportBanner(false)}
                className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-20"
            >
              <FiX className="text-lg" />
            </button> */}

              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  backgroundImage: `url(${gradientImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "40% 16%",
                  backgroundRepeat: "no-repeat",
                }}
              />

              <div className="relative z-10 w-full h-full">
                <div className="absolute -top-28 -right-20">
                  <h3
                    className="nunito-bold text-[37px] text-white mb-1"
                    style={{ textShadow: "0 2px 8px rgba(0, 0, 0, 0.3), 0 0 2px rgba(0, 0, 0, 0.5)" }}
                  >
                    העלאת לקוחות למערכת
                </h3>
                  <p
                    className="font-semibold text-lg text-white"
                    style={{ textShadow: "0 2px 8px rgba(0, 0, 0, 0.3), 0 0 2px rgba(0, 0, 0, 0.5)" }}
                  >
                    ייבא את רשימת הלקוחות שלך מהמערכת הקודמת בלחיצה כפתור.
                </p>
                </div>

                <button 
                  onClick={handleStartCsvImport}
                  disabled={!hasActiveSubscription || subscriptionLoading}
                  className="absolute -right-20 top-[60px] px-4 py-2.5 rounded-full border-2 border-white bg-transparent text-sm font-semibold text-white hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  התחל עכשיו
                  <FiUpload className="text-xs text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CalendarCommonTable Component */}
        <CalendarCommonTable
          data={clients}
          filteredData={filteredAndSortedClients}
          isLoading={isLoadingClients}
          error={clientsError}
          isAuthError={isAuthError}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="חפש לקוח..."
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          statusOptions={[
            { key: null, label: "כל הסטטוסים" },
            { key: "פעיל", label: "פעיל" },
            { key: "חסום", label: "חסום" },
          ]}
          selectedRating={selectedRating}
          onRatingChange={setSelectedRating}
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
                { key: "name", label: "שם לקוח" },
                { key: "status", label: "סטטוס" },
                { key: "phone", label: "מספר נייד" },
                { key: "email", label: "אימייל" },
                { key: "city", label: "עיר" },
                { key: "address", label: "כתובת" },
                { key: "firstAppointmentDate", label: "תאריך פגישה ראשונה" },
              ],
            },
            {
              title: "הכנסות",
              fields: [
                { key: "totalRevenue", label: "סך הכנסות" },
                { key: "avgRevenuePerVisit", label: "ממוצע הכנסה לתור" },
                { key: "avgTransaction", label: "עסקה ממוצעת" },
                { key: "lostRevenue", label: "הכנסות שאבדו" },
                { key: "recoveredRevenue", label: "הכנסות שחזרו" },
              ],
            },
            {
              title: "פעילות לקוח",
              fields: [
                { key: "appointmentsCount", label: "מספר תורים" },
                { key: "avgVisitsPerYear", label: "ביקור ממוצע בשנה" },
                { key: "daysSinceLastAppointment", label: "ימים מהתור האחרון" },
                { key: "avgTimeBetweenVisits", label: "זמן ממוצע בין תורים" },
                { key: "avgTimeFromBookingToAppointment", label: "זמן בין קביעת תור לתור" },
              ],
            },
            {
              title: "שביעות רצון",
              fields: [
                { key: "avgRating", label: "ממוצע דירוג" },
                { key: "lastRating", label: "דירוג אחרון" },
              ],
            },
            {
              title: "ביקור אחרון",
              fields: [
                { key: "lastAppointmentDate", label: "תור אחרון" },
                { key: "lastAppointmentTime", label: "זמן תור אחרון" },
                { key: "lastService", label: "שירות אחרון" },
                // { key: "lastRating", label: "דירוג אחרון" },
                { key: "lastStaff", label: "איש צוות אחרון" },
              ],
            },
            {
              title: "שיווק",
              fields: [
                { key: "source", label: "מקור הגעה" },
                { key: "leadDate", label: "תאריך כניסת הליד" },
                { key: "timeToConversion", label: "זמן להמרה" },
                { key: "campaignName", label: "שם קמפיין" },
                { key: "adSetName", label: "שם אד-סט" },
                { key: "adName", label: "שם מודעה" },
                { key: "utmSource", label: "UTM Source" },
                { key: "utmMedium", label: "UTM Medium" },
                { key: "utmCampaign", label: "UTM Campaign" },
                { key: "utmContent", label: "UTM Content" },
                { key: "utmTerm", label: "UTM Term" },
              ],
            },
          ]}
          selectedItems={selectedClients}
          onSelectItem={handleSelectClient}
          onSelectAll={handleSelectAll}
          onDownloadSelected={handleDownloadSelectedClients}
          onDeleteSelected={handleDeleteSelectedClients}
          hasActiveSubscription={hasActiveSubscription}
          subscriptionLoading={subscriptionLoading}
          onRowClick={(client) => {
            setSelectedClientForView(client);
            setShowClientSummary(true);
            setClientViewTab("details");
          }}
          onUpdateField={handleUpdateClientFieldInList}
          onUpdateStatus={handleUpdateClientStatus}
          onDeleteItem={handleDeleteClient}
          renderCell={renderCell}
          getRowData={(client) => getClientAppointmentsInfo(client)}
          columns={columns}
          emptyStateMessage="אין לקוחות עדיין"
          emptySearchMessage="לא נמצאו לקוחות התואמים לחיפוש"
          loadingMessage="טוען לקוחות..."
          requiredFieldMessage='יש לבחור את "מספר נייד" בתצוגה כדי לראות את רשימת הלקוחות'
          requiredFieldKey="phone"
          formatDate={formatDate}
          enablePagination={true}
          // defaultPageSize={1}
        />

        {/* Client Summary Popup */}
        <ClientSummaryCard
          client={selectedClientForView}
          isOpen={showClientSummary}
          onClose={() => {
            setShowClientSummary(false);
            setSelectedClientForView(null);
          }}
          zIndex={50}
          onClientUpdate={handleClientUpdate}
          activeTab={clientViewTab}
        />

        {/* CSV Import Modal */}
        {showCsvImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ייבוא לקוחות מקובץ CSV</h2>
                <button onClick={handleCloseCsvImport} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FiX className="text-2xl" />
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvFileSelect} className="hidden" />

              {!csvImportProgress ? (
                <div className="space-y-4">
                  {/* Demo CSV Download Section */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1">רוצה לראות דוגמה?</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">הורד קובץ CSV לדוגמה כדי לראות את הפורמט הנדרש</p>
                      </div>
                      <a
                        href="/demo/לקוחות_Demo.csv"
                        download="לקוחות_Demo.csv"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/50 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200"
                      >
                        <FiDownload className="text-base" />
                        הורד קובץ CSV לדוגמה
                      </a>
                    </div>
                  </div>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <FiUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">לחץ כאן כדי לבחור קובץ CSV</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-200 font-semibold text-sm"
                    >
                      בחר קובץ CSV
                    </button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-2">דרישות קובץ CSV:</p>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                      <li>עמודות חובה: שם, טלפון</li>
                      <li>עמודות אופציונליות: אימייל, עיר, כתובת</li>
                      <li>מספר טלפון חייב להכיל 10 ספרות</li>
                      <li>לקוחות קיימים (לפי טלפון או שם) יידלגו</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <FiCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">ייבוא הושלם!</h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-white">סה"כ שורות:</span>
                        <span className="font-semibold">{csvImportProgress.total}</span>
                      </div>

                      <div className="flex justify-between text-green-700 dark:text-green-400">
                        <span>יובאו בהצלחה:</span>
                        <span className="font-semibold">{csvImportProgress.imported}</span>
                      </div>

                      {csvImportProgress.errors > 0 && (
                        <div className="flex justify-between text-red-700 dark:text-red-400">
                          <span>שגיאות:</span>
                          <span className="font-semibold">{csvImportProgress.errors}</span>
                        </div>
                      )}

                      {csvImportProgress.skipped > 0 && (
                        <div className="flex justify-between text-yellow-700 dark:text-yellow-400">
                          <span>דולגו:</span>
                          <span className="font-semibold">{csvImportProgress.skipped}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {csvImportProgress.errorMessages?.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">שגיאות:</p>
                      <ul className="text-xs text-red-700 dark:text-red-400 space-y-1 max-h-32 overflow-y-auto">
                        {csvImportProgress.errorMessages.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {csvImportProgress.skippedMessages?.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">דולגו:</p>
                      <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 max-h-32 overflow-y-auto">
                        {csvImportProgress.skippedMessages.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleCloseCsvImport}
                      className="px-6 py-2.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-all duration-200 font-semibold text-sm"
                    >
                      סגור
                    </button>

                    <button
                      onClick={handleStartCsvImport}
                      className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-200 font-semibold text-sm flex items-center gap-2"
                    >
                      ייבא עוד קובץ
                      <FiUpload className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <CommonConfirmModel
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setClientToDelete(null);
            setClientsToDelete([]);
          }}
          onConfirm={() => {
            if (clientToDelete) {
              confirmDeleteClient();
            } else if (clientsToDelete.length > 0) {
              confirmDeleteSelectedClients();
            }
          }}
          title="מחיקת לקוח"
          message={
            clientToDelete
              ? "האם אתה בטוח שאתה רוצה למחוק את הלקוח הזה? פעולה זו לא ניתנת לביטול."
              : `האם אתה בטוח שאתה רוצה למחוק ${clientsToDelete.length} לקוח/ים? פעולה זו לא ניתנת לביטול.`
          }
          confirmText="מחק"
          cancelText="ביטול"
          confirmButtonColor="bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
        />

        {/* New Client Modal (Inline) */}
        {isNewClientModalOpen && (
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
            <div className="flex-1 bg-black/0" onClick={() => setIsNewClientModalOpen(false)} />

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
                onClick={() => setIsNewClientModalOpen(false)}
              >
                <FiX className="text-[20px]" />
              </button>

              <div className="px-8 pt-7 pb-9">
                <h2 className="text-[24px] sm:text-[26px] font-semibold text-gray-900 dark:text-gray-100">
                  העלאת לקוח חדש
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto px-9 pb-6 pt-6 text-sm text-gray-800 dark:text-gray-100">
                <div className="space-y-4">
                  {/* שם לקוח */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-medium font-medium text-gray-600 dark:text-white">
                        שם לקוח <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="שם הלקוח"
                      dir="rtl"
                      className={`w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-customBrown border ${
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

                  {/* מס נייד */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-medium font-medium text-gray-600 dark:text-white">
                        מס נייד <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="tel"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="מספר נייד"
                      dir="rtl"
                      className={`w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-customBrown border ${
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

                  {/* מייל */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-medium font-medium text-gray-600 dark:text-white">
                        מייל
                      </label>
                    </div>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="כתובת מייל"
                      dir="rtl"
                      className={`w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-customBrown border ${
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

                  {/* עיר */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-medium font-medium text-gray-600 dark:text-white">
                        עיר
                      </label>
                    </div>
                    <input
                      type="text"
                      value={newClientCity}
                      onChange={(e) => setNewClientCity(e.target.value)}
                      placeholder="עיר"
                      dir="rtl"
                      className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-customBrown border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                    />
                  </div>

                  {/* כתובת */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-medium font-medium text-gray-600 dark:text-white">
                        כתובת
                      </label>
                    </div>
                    <input
                      type="text"
                      value={newClientAddress}
                      onChange={(e) => setNewClientAddress(e.target.value)}
                      placeholder="כתובת"
                      dir="rtl"
                      className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-customBrown border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Footer with Submit Button */}
              <div className="px-8 py-5 border-t border-gray-200 dark:border-commonBorder">
                <button
                  type="button"
                  className="w-full h-[44px] rounded-full text-medium font-semibold flex items-center justify-center bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                  onClick={handleCreateNewClient}
                >
                  הוסף לקוח
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Export function to add client (to be used from CalendarPage)
export const addCalendarClient = (client) => {
  const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
  const clients = storedClients ? JSON.parse(storedClients) : [];
  
  const existingClient = clients.find((c) => c.id === client.id || c.phone === client.phone);
  
  if (!existingClient) {
    const updatedClients = [client, ...clients];
    localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
  }
};



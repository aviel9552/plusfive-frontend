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
import { getAllClients, createClient } from "../../services/clients/clientService";
import gradientImage from "../../assets/gradientteam.jpg";
import whatsappIcon from "../../assets/whatsappicon.png";

const CALENDAR_CLIENTS_STORAGE_KEY = "calendar_clients";
const COLUMN_SPACING_STORAGE_KEY = "calendar_clients_column_spacing";
const VISIBLE_FIELDS_STORAGE_KEY = "calendar_clients_visible_fields";

export default function CalendarClientsPage() {
  const { isDarkMode } = useTheme();

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

  const [openStatusDropdowns, setOpenStatusDropdowns] = useState({});
  const [statusDropdownPositions, setStatusDropdownPositions] = useState({});

  const [selectedClientForView, setSelectedClientForView] = useState(null);
  const [showClientSummary, setShowClientSummary] = useState(false);
  const [clientViewTab, setClientViewTab] = useState("details");

  // CSV import modal state
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvImportProgress, setCsvImportProgress] = useState(null);
  const fileInputRef = useRef(null);

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
      rating: true,
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
      avgRating: false,
      lastRating: false,
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

  // Load clients from backend on mount
  useEffect(() => {
    const loadClients = async () => {
      setIsLoadingClients(true);
      setClientsError(null);
      setIsAuthError(false);
      
      try {
        const result = await getAllClients();
        
        if (result?.error) {
          setClientsError(result.error);
          setIsAuthError(!!result.isAuthError);
        }

        if (Array.isArray(result?.clients)) {
          setClients(result.clients);
        } else {
          // fallback: try localStorage
          const stored = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
          setClients(stored ? JSON.parse(stored) : []);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
        setClientsError(error?.message || "Failed to load customers");
        setIsAuthError(false);

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
  }, []);

  // Helpers
  const toggleFieldVisibility = (fieldName) => {
    setVisibleFields((prev) => {
      const updated = { ...prev, [fieldName]: !prev[fieldName] };
      console.log('Toggling field:', fieldName, 'New value:', updated[fieldName]);
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

      if (clientAppointments.length === 0) {
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

      let lastRating = "-";
      const rating = lastAppointment?.rating || lastAppointment?.clientRating;
      if (rating && rating !== "-" && !isNaN(parseFloat(rating))) lastRating = rating;
      if (lastRating === "-") lastRating = client.rating || "-";

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

      let avgRating = "-";
      const ratings = sortedByDate
        .map((apt) => apt.rating || apt.clientRating)
        .filter((r) => r && r !== "-" && !isNaN(parseFloat(r)));
      if (ratings.length) {
        const sum = ratings.reduce((acc, r) => acc + parseFloat(r), 0);
        avgRating = (sum / ratings.length).toFixed(1);
      } else {
        avgRating = client.rating || "-";
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

    // Filter by rating
    if (selectedRating !== null) {
      filtered = filtered.filter((client) => {
        const r = client.rating || "-";
        if (selectedRating === "-") return r === "-" || !r;
        return String(r) === String(selectedRating);
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "newest") return (b.id || 0) - (a.id || 0);
      if (sortBy === "oldest") return (a.id || 0) - (b.id || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

    return sorted;
  }, [clients, searchQuery, sortBy, selectedStatus, selectedRating]);

  // Client updates
  const handleClientUpdate = (updatedClient) => {
    const updatedClients = clients.map((c) => (c.id === updatedClient.id ? updatedClient : c));
    setClients(updatedClients);
    setSelectedClientForView(updatedClient);
    try {
      localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
    } catch (e) {
      console.error("Error saving clients:", e);
    }
  };

  const handleUpdateClientFieldInList = (clientId, field, value) => {
    const updatedClients = clients.map((client) => (client.id === clientId ? { ...client, [field]: value } : client));
    setClients(updatedClients);
    try {
      localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
    } catch (e) {
      console.error("Error saving clients:", e);
    }

    if (selectedClientForView?.id === clientId) {
      const updatedClient = updatedClients.find((c) => c.id === clientId);
      setSelectedClientForView(updatedClient || null);
    }
  };

  const handleUpdateClientStatus = (clientId, newStatus) => {
    const updatedClients = clients.map((client) => (client.id === clientId ? { ...client, status: newStatus } : client));
    setClients(updatedClients);
    try {
      localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
    } catch (e) {
      console.error("Error saving clients:", e);
    }

    if (selectedClientForView?.id === clientId) {
      const updatedClient = updatedClients.find((c) => c.id === clientId);
      setSelectedClientForView(updatedClient || null);
    }

    setOpenStatusDropdowns((prev) => ({ ...prev, [clientId]: false }));
  };

  const handleDeleteClient = (clientId) => {
    if (window.confirm("האם אתה בטוח שאתה רוצה למחוק את הלקוח הזה?")) {
      const updatedClients = clients.filter((c) => c.id !== clientId);
      setClients(updatedClients);
      try {
        localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
      } catch (e) {
        console.error("Error saving clients:", e);
      }
      setSelectedClients((prev) => prev.filter((id) => id !== clientId));
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
      client.rating || "-",
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

    if (window.confirm(`האם אתה בטוח שאתה רוצה למחוק ${selectedClients.length} לקוח/ים?`)) {
      const updatedClients = clients.filter((c) => !selectedClients.includes(c.id));
      setClients(updatedClients);
      try {
        localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
      } catch (e) {
        console.error("Error saving clients:", e);
      }
      setSelectedClients([]);
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
    const errors = {};
    if (!newClientName.trim()) errors.name = "שם הוא שדה חובה";

    const phoneDigits = newClientPhone.trim().replace(/\D/g, "");
    if (!newClientPhone.trim()) errors.phone = "טלפון הוא שדה חובה";
    else if (phoneDigits.length !== 10) errors.phone = "מספר טלפון חייב להכיל בדיוק 10 ספרות";

    setNewClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const initials =
      newClientName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
        .toUpperCase() || "ל";

    const newClientData = {
      name: newClientName.trim(),
      phone: formatPhoneForBackend(phoneDigits),
      email: newClientEmail.trim() || null,
      city: newClientCity.trim() || "",
      address: newClientAddress.trim() || "",
      initials,
      totalRevenue: 0,
      rating: "-",
      status: "פעיל",
    };

    try {
      // Save to backend (which also saves to localStorage as backup)
      const createdClient = await createClient(newClientData);
      
      // Update state with the created client
      const updatedClients = [createdClient, ...clients];
      setClients(updatedClients);
      
      setIsNewClientModalOpen(false);
      setNewClientName("");
      setNewClientPhone("");
      setNewClientEmail("");
      setNewClientCity("");
      setNewClientAddress("");
      setNewClientErrors({});
    } catch (error) {
      console.error("Error creating client:", error);
      setNewClientErrors({ 
        general: "שגיאה ביצירת לקוח. נסה שוב." 
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

    reader.onload = (e) => {
      const text = e.target?.result || "";
      const lines = String(text)
        .split(/\r?\n/)
        .map((l) => l.replace(/^\uFEFF/, "")) // remove BOM if present
        .filter((line) => line.trim());

      if (lines.length < 2) {
        alert("קובץ CSV חייב להכיל לפחות שורת כותרת ושורת נתונים אחת");
        return;
      }

      const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());

      const nameIndex = headers.findIndex((h) => h.includes("שם") || h.includes("name") || h.includes("שם מלא"));
      const phoneIndex = headers.findIndex(
        (h) => h.includes("טלפון") || h.includes("phone") || h.includes("מספר טלפון") || h.includes("mobile")
      );
      const emailIndex = headers.findIndex((h) => h.includes("אימייל") || h.includes("email") || h.includes("מייל"));
      const cityIndex = headers.findIndex((h) => h.includes("עיר") || h.includes("city"));
      const addressIndex = headers.findIndex((h) => h.includes("כתובת") || h.includes("address"));

      if (nameIndex === -1 || phoneIndex === -1) {
        alert('קובץ CSV חייב להכיל עמודות "שם" ו"טלפון"');
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
          rating: "-",
          status: "פעיל",
        });
      }

      setCsvImportProgress({
        total: lines.length - 1,
        imported: importedClients.length,
        errors: errors.length,
        skipped: skipped.length,
        errorMessages: errors,
        skippedMessages: skipped,
      });

      if (importedClients.length > 0) {
        const updatedClients = [...importedClients, ...clients];
      setClients(updatedClients);
        try {
      localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
        } catch (e2) {
          console.error("Error saving clients:", e2);
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
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleCloseCsvImport = () => {
    setShowCsvImportModal(false);
    setCsvFile(null);
    setCsvImportProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full bg-[#ffffff]" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">רשימת לקוחות</h1>
              {clients.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#181818] px-2 py-0.5 rounded">
                  {clients.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              צפה, הוסף, ערוך ומחק את פרטי הלקוחות שלך.{" "}
              <a href="#" className="text-[#ff257c] hover:underline">
                למד עוד
              </a>
            </p>
          </div>

          <div className="flex items-center gap-2">
              <button
              onClick={() => {
                setNewClientName("");
                setNewClientPhone("");
                setNewClientEmail("");
                setNewClientCity("");
                setNewClientAddress("");
                setNewClientErrors({});
                setIsNewClientModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-200 font-semibold text-sm flex items-center gap-2"
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
            <button
              onClick={() => setShowImportBanner(false)}
                className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-20"
            >
              <FiX className="text-lg" />
            </button>

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
                  className="absolute -right-20 top-[60px] px-4 py-2.5 rounded-full border-2 border-white bg-transparent text-sm font-semibold text-white hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  התחל עכשיו
                  <FiUpload className="text-xs text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px] relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="חפש לקוח..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#ff257c] text-right"
              dir="rtl"
            />
          </div>
          
          {/* Status Filter Button */}
          <div className="relative">
          <button
              type="button"
              className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors ${
                isStatusDropdownOpen || selectedStatus !== null
                  ? "border-[#ff257c] focus:ring-2 focus:ring-[#ff257c]"
                  : "border-gray-200 dark:border-commonBorder"
              }`}
              onClick={() => {
                setIsRatingDropdownOpen(false);
                setIsStatusDropdownOpen((prev) => !prev);
              }}
            >
              <span className="whitespace-nowrap">{selectedStatus === null ? "סטטוס" : selectedStatus}</span>
              <FiChevronDown className="text-[14px] text-gray-400" />
          </button>

            {isStatusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsStatusDropdownOpen(false)} />
                <div
                  dir="rtl"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                >
                <div className="py-2">
                    {[
                      { key: null, label: "כל הסטטוסים" },
                      { key: "פעיל", label: "פעיל" },
                      { key: "חסום", label: "חסום" },
                    ].map((opt) => (
                  <button
                        key={String(opt.key)}
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                          setSelectedStatus(opt.key);
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              selectedStatus === opt.key ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {selectedStatus === opt.key && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                        )}
                      </span>
                          <span>{opt.label}</span>
                    </span>
                  </button>
                    ))}
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
              onClick={() => {
                setIsStatusDropdownOpen(false);
                setIsRatingDropdownOpen((prev) => !prev);
              }}
            >
              <span className="whitespace-nowrap">{selectedRating === null ? "דירוג אחרון" : selectedRating === "-" ? "ללא דירוג" : `⭐ ${selectedRating}`}</span>
              <FiChevronDown className="text-[14px] text-gray-400" />
            </button>

            {isRatingDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsRatingDropdownOpen(false)} />
                <div
                  dir="rtl"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                >
                <div className="py-2">
                    {/* all */}
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
                            selectedRating === null ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                  }`}
                      >
                        {selectedRating === null && (
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                        )}
                    </span>
                      <span>כל הדירוגים</span>
                    </span>
                  </button>

                    {[5, 4, 3, 2, 1].map((n) => (
                  <button
                        key={n}
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                    onClick={() => {
                          setSelectedRating(String(n));
                      setIsRatingDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              selectedRating === String(n) ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {selectedRating === String(n) && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                        )}
                      </span>
                      <div className="flex items-center gap-0.5">
                            {[...Array(n)].map((_, i) => (
                              <FaStar key={i} className="text-ratingStar" style={{ fontSize: "12px" }} />
                            ))}
                            {[...Array(5 - n)].map((_, i) => (
                              <FaStar key={`g-${i}`} className="text-gray-300 dark:text-gray-500" style={{ fontSize: "12px" }} />
                        ))}
          </div>
                    </span>
              </button>
                    ))}

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
                            selectedRating === "-" ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedRating === "-" && (
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
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

            {isColumnFilterDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsColumnFilterDropdownOpen(false)} />
                <div
                  dir="rtl"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">מיון</div>
                    {[
                      { key: "newest", label: "חדש ביותר" },
                      { key: "oldest", label: "ישן ביותר" },
                      { key: "name", label: "א-ב" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={() => {
                          setSortBy(option.key);
                          setIsColumnFilterDropdownOpen(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              sortBy === option.key ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                  }`}
                          >
                            {sortBy === option.key && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                            )}
                    </span>
                          <span>{option.label}</span>
                        </span>
              </button>
                    ))}

                    <div className="border-b border-gray-200 dark:border-[#262626] my-2"></div>

                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">פרטים</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectAllFieldsInCategory(["name", "status", "phone", "email", "city", "address", "firstAppointmentDate"]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#ff257c] transition-colors"
                      >
                        סמן הכל
                      </button>
                    </div>

                    {[
                      { key: "name", label: "שם לקוח" },
                      { key: "status", label: "סטטוס" },
                      { key: "phone", label: "מספר נייד" },
                      { key: "email", label: "אימייל" },
                      { key: "city", label: "עיר" },
                      { key: "address", label: "כתובת" },
                      { key: "firstAppointmentDate", label: "תאריך פגישה ראשונה" },
                    ].map((field) => (
                      <button
                        key={field.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={() => toggleFieldVisibility(field.key)}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              visibleFields[field.key] ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {visibleFields[field.key] && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                            )}
                          </span>
                          <span>{field.label}</span>
                        </span>
              </button>
                    ))}

                    <div className="border-b border-gray-200 dark:border-[#262626] my-2"></div>

                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">הכנסות</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectAllFieldsInCategory(["totalRevenue", "avgRevenuePerVisit", "avgTransaction", "lostRevenue", "recoveredRevenue"]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#ff257c] transition-colors"
                      >
                        סמן הכל
              </button>
            </div>

                    {[
                      { key: "totalRevenue", label: "סך הכנסות" },
                      { key: "avgRevenuePerVisit", label: "ממוצע הכנסה לתור" },
                      { key: "avgTransaction", label: "עסקה ממוצעת" },
                      { key: "lostRevenue", label: "הכנסות שאבדו" },
                      { key: "recoveredRevenue", label: "הכנסות שחזרו" },
                    ].map((field) => (
                      <button
                        key={field.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={() => toggleFieldVisibility(field.key)}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              visibleFields[field.key] ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {visibleFields[field.key] && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                            )}
                          </span>
                          <span>{field.label}</span>
                        </span>
              </button>
                    ))}

                    <div className="border-b border-gray-200 dark:border-[#262626] my-2"></div>

                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">פעילות לקוח</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectAllFieldsInCategory(["appointmentsCount", "avgVisitsPerYear", "daysSinceLastAppointment", "avgTimeBetweenVisits", "avgTimeFromBookingToAppointment"]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#ff257c] transition-colors"
                      >
                        סמן הכל
              </button>
                    </div>

                    {[
                      { key: "appointmentsCount", label: "מספר תורים" },
                      { key: "avgVisitsPerYear", label: "ביקור ממוצע בשנה" },
                      { key: "daysSinceLastAppointment", label: "ימים מהתור האחרון" },
                      { key: "avgTimeBetweenVisits", label: "זמן ממוצע בין תורים" },
                      { key: "avgTimeFromBookingToAppointment", label: "זמן בין קביעת תור לתור" },
                    ].map((field) => (
                      <button
                        key={field.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={() => toggleFieldVisibility(field.key)}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              visibleFields[field.key] ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {visibleFields[field.key] && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                            )}
                          </span>
                          <span>{field.label}</span>
                        </span>
              </button>
                    ))}

                    <div className="border-b border-gray-200 dark:border-[#262626] my-2"></div>

                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">שביעות רצון</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectAllFieldsInCategory(["rating", "avgRating"]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#ff257c] transition-colors"
                      >
                        סמן הכל
              </button>
                    </div>

                    {[
                      { key: "rating", label: "דירוג אחרון" },
                      { key: "avgRating", label: "ממוצע דירוג" },
                    ].map((field) => (
                      <button
                        key={field.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={() => toggleFieldVisibility(field.key)}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              visibleFields[field.key] ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {visibleFields[field.key] && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                            )}
                          </span>
                          <span>{field.label}</span>
                        </span>
              </button>
                    ))}

                    <div className="border-b border-gray-200 dark:border-[#262626] my-2"></div>

                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">ביקור אחרון</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectAllFieldsInCategory(["lastAppointmentDate", "lastAppointmentTime", "lastService", "lastRating", "lastStaff"]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#ff257c] transition-colors"
                      >
                        סמן הכל
              </button>
                    </div>

                    {[
                      { key: "lastAppointmentDate", label: "תור אחרון" },
                      { key: "lastAppointmentTime", label: "זמן תור אחרון" },
                      { key: "lastService", label: "שירות אחרון" },
                      { key: "lastRating", label: "דירוג אחרון" },
                      { key: "lastStaff", label: "איש צוות אחרון" },
                    ].map((field) => (
                      <button
                        key={field.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={() => toggleFieldVisibility(field.key)}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              visibleFields[field.key] ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {visibleFields[field.key] && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                            )}
                          </span>
                          <span>{field.label}</span>
                        </span>
              </button>
                    ))}

                    <div className="border-b border-gray-200 dark:border-[#262626] my-2"></div>

                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">שיווק</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectAllFieldsInCategory([
                            "source",
                            "leadDate",
                            "timeToConversion",
                            "campaignName",
                            "adSetName",
                            "adName",
                            "utmSource",
                            "utmMedium",
                            "utmCampaign",
                            "utmContent",
                            "utmTerm",
                          ]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#ff257c] transition-colors"
                      >
                        סמן הכל
                      </button>
                    </div>

                    {[
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
                    ].map((field) => (
                      <button
                        key={field.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={() => toggleFieldVisibility(field.key)}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              visibleFields[field.key] ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {visibleFields[field.key] && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
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

          {/* Bulk actions */}
          <div className="relative flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedClients.length === filteredAndSortedClients.length && filteredAndSortedClients.length > 0
                    ? "border-[rgba(255,37,124,1)]"
                    : "border-gray-300 dark:border-gray-500"
                }`}
              >
                {selectedClients.length === filteredAndSortedClients.length && filteredAndSortedClients.length > 0 && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                )}
              </span>
              <span className="whitespace-nowrap text-xs sm:text-sm">
                  בחר הכל ({selectedClients.length}/{filteredAndSortedClients.length})
                </span>
            </button>

            <button
              onClick={handleDownloadSelectedClients}
              disabled={selectedClients.length === 0}
              className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${
                selectedClients.length === 0
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                  : "text-gray-600 dark:text-gray-400 hover:text-[#ff257c] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
              }`}
              title="הורדת לקוחות נבחרים"
            >
              <FiDownload className="text-sm" />
            </button>

            <button
              onClick={handleDeleteSelectedClients}
              disabled={selectedClients.length === 0}
              className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${
                selectedClients.length === 0
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
              }`}
              title="מחיקת לקוחות נבחרים"
            >
              <FiTrash2 className="text-sm" />
            </button>
              </div>
        </div>

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
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <FiUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">לחץ על הכפתור כדי לבחור קובץ CSV</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
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
                        <span className="text-gray-700 dark:text-gray-300">סה"כ שורות:</span>
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
                      <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                        שם לקוח <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
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

                  {/* מס נייד */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                        מס נייד <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <input
                      type="tel"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="מספר נייד"
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

                  {/* מייל */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                        מייל
                      </label>
                    </div>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="כתובת מייל"
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

                  {/* עיר */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                        עיר
                      </label>
                    </div>
                    <input
                      type="text"
                      value={newClientCity}
                      onChange={(e) => setNewClientCity(e.target.value)}
                      placeholder="עיר"
                      dir="rtl"
                      className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
                    />
                  </div>

                  {/* כתובת */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-medium font-medium text-gray-600 dark:text-gray-300">
                        כתובת
                      </label>
                    </div>
                    <input
                      type="text"
                      value={newClientAddress}
                      onChange={(e) => setNewClientAddress(e.target.value)}
                      placeholder="כתובת"
                      dir="rtl"
                      className="w-full h-10 rounded-full px-3 text-xs sm:text-sm bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgba(255,37,124,0.45)] focus:border-transparent text-right"
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

        {/* Clients Table */}
        {!visibleFields.phone ? (
          <div className="p-12 text-center">
            <span className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4 block">📱</span>
            <p className="text-gray-500 dark:text-gray-400 text-lg">יש לבחור את "מספר נייד" בתצוגה כדי לראות את רשימת הלקוחות</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">אנא סמן את "מספר נייד" בכפתור הסינון כדי להציג את הלקוחות</p>
          </div>
        ) : isLoadingClients ? (
          <div className="p-12 text-center">
            <FiRefreshCw className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">טוען לקוחות...</p>
          </div>
        ) : isAuthError ? (
          <div className="p-12 text-center">
            <FiAlertCircle className="mx-auto text-4xl text-orange-500 dark:text-orange-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              {clientsError || "Please login to load customers"}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">אנא התחבר כדי לטעון לקוחות מהשרת</p>
            {clients.length > 0 && (
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">מציג לקוחות מקומיים ({clients.length})</p>
            )}
          </div>
        ) : filteredAndSortedClients.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4 block">☺</span>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery ? "לא נמצאו לקוחות התואמים לחיפוש" : "אין לקוחות עדיין"}
            </p>
            {!searchQuery && (
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">לקוחות חדשים שנוצרים דרך קביעת תורים יופיעו כאן</p>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#181818] rounded-lg overflow-hidden" key={JSON.stringify(visibleFields)}>
            <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
            {/* Table Headers */}
            <div className="flex items-center gap-6 px-4 py-3 border-b border-gray-200 dark:border-[#2b2b2b] relative min-w-max">
              <div className="w-3.5 flex-shrink-0"></div>
              
              {/* פרטים */}
              {visibleFields.name && (
                <div className="w-32 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `${columnSpacing.nameToStatus}px` }}>
                  <div className="w-8 h-8 flex-shrink-0"></div>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">שם לקוח</span>
              </div>
              )}

              {visibleFields.status && (
                <div className="w-28 flex items-center justify-start flex-shrink-0" style={{ marginRight: `${columnSpacing.statusToPhone}px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">סטטוס</span>
                </div>
              )}

              {visibleFields.phone && (
                <div className="w-40 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `${columnSpacing.phoneToRating}px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">מספר נייד</span>
                  <div className="w-[52px] flex-shrink-0"></div>
                </div>
              )}

              {visibleFields.email && (
                <div className="w-40 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">אימייל</span>
                </div>
              )}

              {visibleFields.city && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">עיר</span>
                </div>
              )}

              {visibleFields.address && (
                <div className="w-40 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">כתובת</span>
                </div>
              )}

              {visibleFields.firstAppointmentDate && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">תאריך פגישה ראשונה</span>
                </div>
              )}

              {/* הכנסות */}
              {visibleFields.totalRevenue && (
                <div className="w-24 flex items-center justify-start flex-shrink-0" style={{ marginRight: `${columnSpacing.revenueToActions}px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">סך הכנסות</span>
              </div>
              )}

              {visibleFields.avgRevenuePerVisit && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">ממוצע הכנסה לתור</span>
                </div>
              )}

              {visibleFields.avgTransaction && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">עסקה ממוצעת</span>
                </div>
              )}

              {visibleFields.lostRevenue && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">הכנסות שאבדו</span>
                </div>
              )}

              {visibleFields.recoveredRevenue && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">הכנסות שחזרו</span>
                </div>
              )}

              {/* פעילות לקוח */}
              {visibleFields.appointmentsCount && (
                <div className="w-24 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">מספר תורים</span>
                </div>
              )}

              {visibleFields.avgVisitsPerYear && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">ביקור ממוצע בשנה</span>
                </div>
              )}

              {visibleFields.daysSinceLastAppointment && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">ימים מהתור האחרון</span>
                </div>
              )}

              {visibleFields.avgTimeBetweenVisits && (
                <div className="w-36 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">זמן ממוצע בין תורים</span>
                </div>
              )}

              {visibleFields.avgTimeFromBookingToAppointment && (
                <div className="w-40 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">זמן בין קביעת תור לתור</span>
                </div>
              )}

              {/* שביעות רצון */}
              {visibleFields.rating && (
                <div className="w-20 flex items-center justify-start flex-shrink-0" style={{ marginRight: `${columnSpacing.ratingToRevenue}px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">דירוג אחרון</span>
            </div>
              )}

              {visibleFields.avgRating && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">ממוצע דירוג</span>
                </div>
              )}

              {/* ביקור אחרון */}
              {visibleFields.lastAppointmentDate && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">תאריך תור אחרון</span>
                </div>
              )}

              {visibleFields.lastAppointmentTime && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">זמן תור אחרון</span>
                </div>
              )}

              {visibleFields.lastService && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">שירות אחרון</span>
                </div>
              )}

              {visibleFields.lastRating && (
                <div className="w-24 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">דירוג אחרון</span>
                </div>
              )}

              {visibleFields.lastStaff && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">איש צוות אחרון</span>
                </div>
              )}

              {/* שיווק */}
              {visibleFields.source && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">מקור הגעה</span>
                </div>
              )}

              {visibleFields.leadDate && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">תאריך כניסת הליד</span>
                </div>
              )}

              {visibleFields.timeToConversion && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">זמן להמרה</span>
                </div>
              )}

              {visibleFields.campaignName && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">שם קמפיין</span>
                </div>
              )}

              {visibleFields.adSetName && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">שם אד-סט</span>
                </div>
              )}

              {visibleFields.adName && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">שם מודעה</span>
                </div>
              )}

              {visibleFields.utmSource && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">UTM Source</span>
                </div>
              )}

              {visibleFields.utmMedium && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">UTM Medium</span>
                </div>
              )}

              {visibleFields.utmCampaign && (
                <div className="w-32 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">UTM Campaign</span>
                </div>
              )}

              {visibleFields.utmContent && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">UTM Content</span>
                </div>
              )}

              {visibleFields.utmTerm && (
                <div className="w-28 flex items-center justify-start flex-shrink-0">
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">UTM Term</span>
                </div>
              )}

              <div className="w-24 flex items-center justify-start flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                מציג {filteredAndSortedClients.length} מתוך {clients.length} תוצאות
              </p>
              </div>
            </div>

            {/* Client Rows */}
              {filteredAndSortedClients.map((client, index) => {
                const clientAppointmentsInfo = getClientAppointmentsInfo(client);
                return (
              <div
                key={client.id}
                onClick={() => {
                  setSelectedClientForView(client);
                  setShowClientSummary(true);
                  setClientViewTab("details");
                }}
                className={`px-4 py-3 flex items-center gap-6 transition-colors cursor-pointer min-w-max ${
                    index % 2 === 0 ? "bg-white dark:bg-[#181818]" : "bg-gray-50/50 dark:bg-[#1a1a1a]"
                } hover:bg-gray-100 dark:hover:bg-[#222]`}
              >
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectClient(client.id);
                    }}
                    className="flex-shrink-0"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selectedClients.includes(client.id) ? "border-[rgba(255,37,124,1)]" : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {selectedClients.includes(client.id) && (
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
                      )}
                    </span>
                  </button>
                  
                  {/* Name */}
                  {visibleFields.name && (
                    <div className="w-32 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `${columnSpacing.nameToStatus}px` }}>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2b2b2b] flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 flex-shrink-0 overflow-hidden">
                        {client.profileImage ? (
                          <img src={client.profileImage} alt={client.name || "לקוח"} className="w-full h-full object-cover" />
                        ) : (
                          client.initials || (client.name ? client.name.charAt(0).toUpperCase() : "ל")
                        )}
                      </div>

                      {editingField === `name-${client.id}` ? (
                        <input
                          type="text"
                          value={client.name || ""}
                          onChange={(e) => handleUpdateClientFieldInList(client.id, "name", e.target.value)}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-sm font-semibold rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                          dir="rtl"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-[#ff257c]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingField(`name-${client.id}`);
                          }}
                        >
                      {client.name || "ללא שם"}
                    </div>
                      )}
                  </div>
                  )}

                  {/* Status */}
                  {visibleFields.status && (
                    <div className="w-28 flex items-center justify-center flex-shrink-0 relative" style={{ marginRight: `${columnSpacing.statusToPhone}px` }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
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
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition text-white ${
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
                            className="fixed w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
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
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-red-600 dark:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenStatusDropdowns((prev) => ({ ...prev, [client.id]: false }));
                                  handleDeleteClient(client.id);
                                }}
                              >
                                מחק לקוח
                                <FiTrash2 />
                      </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Phone */}
                  {visibleFields.phone && (
                    <div className="w-40 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `${columnSpacing.phoneToRating}px` }}>
                      {editingField === `phone-${client.id}` ? (
                        <input
                          type="text"
                          value={client.phone || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, "");
                            handleUpdateClientFieldInList(client.id, "phone", value);
                          }}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-sm rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                          dir="rtl"
                          autoFocus
                          placeholder="0501234567"
                        />
                      ) : (
                        <>
                          <div 
                            className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap cursor-pointer hover:text-[#ff257c]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingField(`phone-${client.id}`);
                            }}
                          >
                      {client.phone ? formatPhoneForDisplay(client.phone) : "-"}
                    </div>

                      {client.phone && (
                        <>
                          <button
                            type="button"
                            className="flex-shrink-0 hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
                            title="התקשר"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${client.phone}`;
                            }}
                          >
                            <FaPhoneAlt className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>

                          <button
                            type="button"
                            className="flex-shrink-0 hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
                            title="פתח שיחה ב-WhatsApp"
                            onClick={(e) => {
                              e.stopPropagation();
                              const whatsappUrl = formatPhoneToWhatsapp(client.phone);
                                  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                            }}
                          >
                            <img 
                              src={whatsappIcon} 
                              alt="WhatsApp" 
                              className="w-7 h-7"
                                  style={{ filter: isDarkMode ? "brightness(1)" : "brightness(0)" }}
                            />
                          </button>
                            </>
                          )}
                        </>
                      )}
                  </div>
                  )}

                  {/* Email - פרטים */}
                  {visibleFields.email && (
                    <div className="w-40 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.email || "-"}</div>
                  </div>
                  )}

                  {/* City - פרטים */}
                  {visibleFields.city && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.city || "-"}</div>
                  </div>
                  )}

                  {/* Address - פרטים */}
                  {visibleFields.address && (
                    <div className="w-40 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.address || "-"}</div>
                    </div>
                  )}

                  {/* First Appointment Date - פרטים */}
                  {visibleFields.firstAppointmentDate && (
                    <div className="w-32 flex-shrink-0">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        {client.firstAppointmentDate ? formatDate(new Date(client.firstAppointmentDate)) : "-"}
                    </div>
                  </div>
                  )}

                  {/* Total Revenue - הכנסות */}
                  {visibleFields.totalRevenue && (
                    <div className="w-24 flex-shrink-0" style={{ marginRight: `${columnSpacing.revenueToActions}px` }}>
                      <div className="text-sm text-gray-700 dark:text-gray-300">₪{(client.totalRevenue || 0).toLocaleString()}</div>
                    </div>
                  )}

                  {/* Avg Revenue Per Visit - הכנסות */}
                  {visibleFields.avgRevenuePerVisit && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">₪{(clientAppointmentsInfo.avgRevenuePerVisit || 0).toLocaleString()}</div>
                  </div>
                  )}

                  {/* Avg Transaction - הכנסות */}
                  {visibleFields.avgTransaction && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">₪{(clientAppointmentsInfo.avgTransaction || 0).toLocaleString()}</div>
                        </div>
                  )}

                  {/* Lost Revenue - הכנסות */}
                  {visibleFields.lostRevenue && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">₪{(clientAppointmentsInfo.lostRevenue || 0).toLocaleString()}</div>
                      </div>
                  )}

                  {/* Recovered Revenue - הכנסות */}
                  {visibleFields.recoveredRevenue && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">₪{(clientAppointmentsInfo.recoveredRevenue || 0).toLocaleString()}</div>
                        </div>
                  )}

                  {/* Appointments Count - פעילות לקוח */}
                  {visibleFields.appointmentsCount && (
                    <div className="w-24 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{clientAppointmentsInfo.count || 0}</div>
                      </div>
                  )}

                  {/* Avg Visits Per Year - פעילות לקוח */}
                  {visibleFields.avgVisitsPerYear && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{clientAppointmentsInfo.avgVisitsPerYear || "-"}</div>
                        </div>
                  )}

                  {/* Days Since Last Appointment - פעילות לקוח */}
                  {visibleFields.daysSinceLastAppointment && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{clientAppointmentsInfo.daysSinceLastAppointment || "-"}</div>
                      </div>
                  )}

                  {/* Avg Time Between Visits - פעילות לקוח */}
                  {visibleFields.avgTimeBetweenVisits && (
                    <div className="w-36 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{clientAppointmentsInfo.avgTimeBetweenVisits || "-"}</div>
                        </div>
                  )}

                  {/* Avg Time From Booking To Appointment - פעילות לקוח */}
                  {visibleFields.avgTimeFromBookingToAppointment && (
                    <div className="w-40 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{clientAppointmentsInfo.avgTimeFromBookingToAppointment || "-"}</div>
                      </div>
                  )}

                  {/* Rating - שביעות רצון */}
                  {visibleFields.rating && (
                    <div className="w-20 flex-shrink-0" style={{ marginRight: `${columnSpacing.ratingToRevenue}px` }}>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.rating || "-"}</div>
                    </div>
                  )}

                  {/* Avg Rating - שביעות רצון */}
                  {visibleFields.avgRating && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{clientAppointmentsInfo.avgRating || "-"}</div>
                  </div>
                  )}

                  {/* Last Appointment Date - ביקור אחרון */}
                  {visibleFields.lastAppointmentDate && (
                    <div className="w-32 flex-shrink-0">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                        {clientAppointmentsInfo.lastAppointmentDate ? formatDate(clientAppointmentsInfo.lastAppointmentDate) : "-"}
                        </div>
                      </div>
                  )}

                  {/* Last Appointment Time - ביקור אחרון */}
                  {visibleFields.lastAppointmentTime && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{clientAppointmentsInfo.lastAppointmentTime || "-"}</div>
                        </div>
                  )}

                  {/* Last Service - ביקור אחרון */}
                  {visibleFields.lastService && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{clientAppointmentsInfo.lastService || "-"}</div>
                      </div>
                  )}

                  {/* Last Rating - ביקור אחרון */}
                  {visibleFields.lastRating && (
                    <div className="w-24 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{clientAppointmentsInfo.lastRating || "-"}</div>
                        </div>
                  )}

                  {/* Last Staff - ביקור אחרון */}
                  {visibleFields.lastStaff && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{clientAppointmentsInfo.lastStaff || "-"}</div>
                      </div>
                  )}

                  {/* Source */}
                  {visibleFields.source && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.source || "-"}</div>
                  </div>
                  )}

                  {/* Lead Date */}
                  {visibleFields.leadDate && (
                    <div className="w-32 flex-shrink-0">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        {client.leadDate ? formatDate(new Date(client.leadDate)) : "-"}
                    </div>
                  </div>
                  )}

                  {/* Time To Conversion */}
                  {visibleFields.timeToConversion && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.timeToConversion || "-"}</div>
                                </div>
                  )}

                  {/* Campaign Name */}
                  {visibleFields.campaignName && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.campaignName || "-"}</div>
                    </div>
                  )}

                  {/* Ad Set Name */}
                  {visibleFields.adSetName && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.adSetName || "-"}</div>
                    </div>
                  )}

                  {/* Ad Name */}
                  {visibleFields.adName && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.adName || "-"}</div>
                    </div>
                  )}

                  {/* UTM Source */}
                  {visibleFields.utmSource && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.utmSource || "-"}</div>
                    </div>
                  )}

                  {/* UTM Medium */}
                  {visibleFields.utmMedium && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.utmMedium || "-"}</div>
                    </div>
                  )}

                  {/* UTM Campaign */}
                  {visibleFields.utmCampaign && (
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.utmCampaign || "-"}</div>
                    </div>
                  )}

                  {/* UTM Content */}
                  {visibleFields.utmContent && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.utmContent || "-"}</div>
                    </div>
                  )}

                  {/* UTM Term */}
                  {visibleFields.utmTerm && (
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{client.utmTerm || "-"}</div>
                    </div>
                  )}
                  </div>
              );
              })}
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



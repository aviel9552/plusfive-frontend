/**
 * ClientSummaryCard - Shared component for displaying client profile
 * Used in both calendarClients page and CalendarPage
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FiPhone, FiEdit, FiX, FiUpload, FiMail, FiUser, FiDollarSign, FiMapPin, FiHome, FiCheckCircle,
  FiCalendar, FiTrendingUp, FiClock, FiStar, FiAlertCircle, FiRefreshCw, FiGlobe, FiLink, FiTarget, FiBarChart2, FiSave, FiChevronDown
} from "react-icons/fi";
import { FaStar, FaPhoneAlt } from "react-icons/fa";
import { formatPhoneForDisplay, formatPhoneForBackend, formatPhoneToWhatsapp } from "../../../utils/phoneHelpers";
import { BRAND_COLOR, CALENDAR_EVENTS_STORAGE_KEY } from "../../../utils/calendar/constants";
import gradientImage from "../../../assets/gradientteam.jpg";
import whatsappIcon from "../../../assets/whatsappicon.png";
import { Area, AreaChart, Tooltip, ResponsiveContainer } from 'recharts';

const CALENDAR_CLIENTS_STORAGE_KEY = "calendar_clients";

export const ClientSummaryCard = ({
  client,
  isOpen,
  onClose,
  zIndex = 50,
  onClientUpdate, // Callback when client data is updated
}) => {
  const [clientViewTab, setClientViewTab] = useState("details"); // "details", "appointments", or "data"
  const [dataCategoryTab, setDataCategoryTab] = useState("revenue"); // "revenue", "activity", "satisfaction", "lastVisit", "marketing"
  const [editingField, setEditingField] = useState(null); // "name", "phone", "email", "city", "address", or null
  const [editedClientData, setEditedClientData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    status: ""
  });
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [localProfileImage, setLocalProfileImage] = useState(null);
  const statusDropdownRef = useRef(null);
  const profileImageInputRef = useRef(null);

  // Update edited data when client changes
  useEffect(() => {
    if (client) {
      setEditedClientData(prev => {
        // Always update status when client prop changes, even if other fields haven't changed
        // This ensures status changes from the list are reflected in the card
        const newStatus = client.status || "פעיל";
        if (prev.status === newStatus && client.id && prev.name === (client.name || "")) {
          // Only skip update if status AND name are the same (to avoid unnecessary updates)
          return prev;
        }
        return {
          name: client.name || "",
          phone: client.phone || "",
          email: client.email || "",
          city: client.city || "",
          address: client.address || "",
          status: newStatus
        };
      });
      // Always update profile image when client changes
      setLocalProfileImage(client.profileImage || null);
      setEditingField(null);
      // Always reset to "details" tab when opening client popup
      setClientViewTab("details");
    }
  }, [client]);

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };

    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Handle profile image upload
  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !client) return;

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
      
      // Update local state immediately to show image right away
      setLocalProfileImage(base64String);
      
      // Load clients from localStorage
      const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
      const clients = storedClients ? JSON.parse(storedClients) : [];
      
      // Check if client exists in localStorage (by id or by name)
      const existingClientIndex = clients.findIndex(c => 
        c.id === client.id || 
        (c.name && client.name && c.name.toLowerCase().trim() === client.name.toLowerCase().trim())
      );
      
      let updatedClients;
      if (existingClientIndex >= 0) {
        // Update existing client
        updatedClients = clients.map(c => {
          if (c.id === client.id || 
              (c.name && client.name && c.name.toLowerCase().trim() === client.name.toLowerCase().trim())) {
            // Preserve all existing client data and merge with client prop to ensure all fields are saved
            return {
              ...c,
              ...client, // Merge with client prop to ensure we have all fields
              profileImage: base64String // Update profile image
            };
          }
          return c;
        });
      } else {
        // Add new client if not found
        updatedClients = [
          {
            ...client,
            profileImage: base64String
          },
          ...clients
        ];
      }

      localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
      
      // Update client via callback
      const updatedClient = updatedClients.find(c => c.id === client.id);
      if (onClientUpdate && updatedClient) {
        onClientUpdate(updatedClient);
      }
      
      // Reset input to allow uploading the same file again
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      alert('שגיאה בקריאת הקובץ');
    };
    reader.readAsDataURL(file);
  };

  // Save edited field
  const handleSaveField = (fieldName, fieldValue = null) => {
    if (!client) return;

    // Load clients from localStorage
    const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
    const clients = storedClients ? JSON.parse(storedClients) : [];

    // Find the client in localStorage - try multiple matching strategies
    let clientFound = false;
    const updatedClients = clients.map(c => {
      // Try to match by id first, then by name as fallback
      const matchesById = c.id === client.id;
      const matchesByName = c.name && client.name && c.name.toLowerCase().trim() === client.name.toLowerCase().trim();
      
      if (matchesById || matchesByName) {
        clientFound = true;
        // Start with all existing client data to preserve all fields (especially profileImage)
        const updates = {
          ...c,
          ...client, // Merge with client prop to ensure we have all fields
        };
        
        // Only update the specific field that was edited
        // Use fieldValue if provided (for immediate updates), otherwise use editedClientData
        if (fieldName === "name") {
          updates.name = fieldValue !== null ? fieldValue : editedClientData.name;
        } else if (fieldName === "phone") {
          updates.phone = formatPhoneForBackend(fieldValue !== null ? fieldValue : editedClientData.phone);
        } else if (fieldName === "email") {
          updates.email = fieldValue !== null ? fieldValue : editedClientData.email;
        } else if (fieldName === "city") {
          updates.city = fieldValue !== null ? fieldValue : editedClientData.city;
        } else if (fieldName === "address") {
          updates.address = fieldValue !== null ? fieldValue : editedClientData.address;
        } else if (fieldName === "status") {
          updates.status = fieldValue !== null ? fieldValue : editedClientData.status;
        }
        
        // Ensure profileImage is always preserved (from localStorage client or prop)
        if (!updates.profileImage) {
          updates.profileImage = c.profileImage || client.profileImage || null;
        }
        
        // Ensure id is preserved
        if (!updates.id) {
          updates.id = c.id || client.id;
        }
        
        return updates;
      }
      return c;
    });

    // If client not found in localStorage, create a new entry based on client prop
    let updatedClient;
    if (!clientFound) {
      const newClient = {
        ...client,
        id: client.id,
      };
      
      // Update the specific field
      // Use fieldValue if provided (for immediate updates), otherwise use editedClientData
      if (fieldName === "name") {
        newClient.name = fieldValue !== null ? fieldValue : editedClientData.name;
      } else if (fieldName === "phone") {
        newClient.phone = formatPhoneForBackend(fieldValue !== null ? fieldValue : editedClientData.phone);
      } else if (fieldName === "email") {
        newClient.email = fieldValue !== null ? fieldValue : editedClientData.email;
      } else if (fieldName === "city") {
        newClient.city = fieldValue !== null ? fieldValue : editedClientData.city;
      } else if (fieldName === "address") {
        newClient.address = fieldValue !== null ? fieldValue : editedClientData.address;
      } else if (fieldName === "status") {
        newClient.status = fieldValue !== null ? fieldValue : editedClientData.status;
      }
      
      updatedClients.push(newClient);
      updatedClient = newClient;
    } else {
      // Find the updated client
      updatedClient = updatedClients.find(c => c.id === client.id || (c.name && client.name && c.name.toLowerCase().trim() === client.name.toLowerCase().trim()));
    }

    localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
    
    // If client still not found, create updated client from client prop directly
    if (!updatedClient) {
      updatedClient = {
        ...client,
      };
      
      // Update the specific field
      // Use fieldValue if provided (for immediate updates), otherwise use editedClientData
      if (fieldName === "name") {
        updatedClient.name = fieldValue !== null ? fieldValue : editedClientData.name;
      } else if (fieldName === "phone") {
        updatedClient.phone = formatPhoneForBackend(fieldValue !== null ? fieldValue : editedClientData.phone);
      } else if (fieldName === "email") {
        updatedClient.email = fieldValue !== null ? fieldValue : editedClientData.email;
      } else if (fieldName === "city") {
        updatedClient.city = fieldValue !== null ? fieldValue : editedClientData.city;
      } else if (fieldName === "address") {
        updatedClient.address = fieldValue !== null ? fieldValue : editedClientData.address;
      } else if (fieldName === "status") {
        updatedClient.status = fieldValue !== null ? fieldValue : editedClientData.status;
      }
    }
    
    // Call onClientUpdate for all field updates (including status)
    // The parent component has duplicate call prevention
    if (onClientUpdate && updatedClient) {
      onClientUpdate(updatedClient);
    }
    
    // For status, ensure local state is immediately updated
    if (fieldName === "status" && updatedClient) {
      const newStatus = fieldValue !== null ? fieldValue : updatedClient.status;
      setEditedClientData(prev => ({
        ...prev,
        status: newStatus
      }));
    }
    
    // If name was updated, also update all appointments for this client
    if (fieldName === "name" && updatedClient) {
      try {
        const storedAppointments = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
        if (storedAppointments) {
          const appointments = JSON.parse(storedAppointments);
          const updatedAppointments = appointments.map(appointment => {
            if (appointment.clientId === updatedClient.id) {
              const newName = updatedClient.name;
              // Update title format: "Service Name – Client Name"
              const serviceName = appointment.serviceName || appointment.title?.split(/[–-]/)[0]?.trim() || "";
              const newTitle = serviceName ? `${serviceName} – ${newName}` : newName;
              
              return {
                ...appointment,
                client: newName,
                clientName: newName,
                title: newTitle,
              };
            }
            return appointment;
          });
          localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(updatedAppointments));
        }
      } catch (error) {
        console.error("Error updating appointments after client name change:", error);
      }
    }
    
    setEditingField(null);
  };

  // Cancel editing field
  const handleCancelEditField = (fieldName) => {
    if (client) {
      if (fieldName === "name") {
        setEditedClientData({ ...editedClientData, name: client.name || "" });
      } else if (fieldName === "phone") {
        setEditedClientData({ ...editedClientData, phone: client.phone || "" });
      } else if (fieldName === "email") {
        setEditedClientData({ ...editedClientData, email: client.email || "" });
      } else if (fieldName === "city") {
        setEditedClientData({ ...editedClientData, city: client.city || "" });
      } else if (fieldName === "address") {
        setEditedClientData({ ...editedClientData, address: client.address || "" });
      }
    }
    setEditingField(null);
  };

  // Get client appointments info
  const getClientAppointmentsInfo = (client) => {
    try {
      const storedAppointments = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
      const allAppointments = storedAppointments ? JSON.parse(storedAppointments) : [];
      
      const clientAppointments = allAppointments.filter(apt => {
        return apt.clientId === client.id || 
               apt.client === client.name ||
               (apt.clientName && apt.clientName === client.name);
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

      // Sort by date to get last visit (most recent first)
      const sortedAppointments = [...clientAppointments].sort((a, b) => {
        const dateA = new Date(a.date || a.start || 0);
        const dateB = new Date(b.date || b.start || 0);
        return dateB - dateA; // Most recent first
      });

      const lastAppointment = sortedAppointments[0];
      
      // Last appointment date and time (matching client card format)
      let lastAppointmentDate = null;
      let lastAppointmentTime = null;
      if (lastAppointment.date) {
        const appointmentDate = new Date(lastAppointment.date + 'T00:00:00');
        lastAppointmentDate = appointmentDate;
      }
      if (lastAppointment.start) {
        lastAppointmentTime = lastAppointment.start;
      }
      
      // Format last visit like in client card: date + time
      let lastVisit = null;
      if (lastAppointmentDate) {
        lastVisit = formatDate(lastAppointmentDate);
        if (lastAppointmentTime) {
          lastVisit += ` ${lastAppointmentTime}`;
        }
      }

      // Last service
      let lastService = "-";
      if (lastAppointment.serviceName) {
        lastService = lastAppointment.serviceName;
      } else if (lastAppointment.serviceId) {
        lastService = lastAppointment.title?.split(/[–-]/)[0]?.trim() || "-";
      }

      // Last staff
      let lastStaff = "-";
      if (lastAppointment.staffName) {
        lastStaff = lastAppointment.staffName;
      } else if (lastAppointment.staff) {
        lastStaff = lastAppointment.staff;
      }

      // Last rating
      let lastRating = "-";
      const rating = lastAppointment.rating || lastAppointment.clientRating;
      if (rating && rating !== "-" && !isNaN(parseFloat(rating))) {
        lastRating = rating;
      }
      if (lastRating === "-") {
        lastRating = client.rating || "-";
      }

      // Calculate revenue stats (matching client card)
      const sortedByDate = [...clientAppointments].sort((a, b) => {
        const dateA = new Date(a.date || a.start || 0);
        const dateB = new Date(b.date || b.start || 0);
        return dateA - dateB;
      });

      const totalRevenue = sortedByDate.reduce((sum, apt) => {
        const price = apt.price || apt.servicePrice || 0;
        return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
      }, 0) || client.totalRevenue || 0;

      const avgRevenuePerVisit = clientAppointments.length > 0 ? Math.round(totalRevenue / clientAppointments.length) : 0;

      const lostRevenue = sortedByDate
        .filter(apt => {
          const status = apt.status || "";
          return status === "אבוד" || status === "lost" || status === "Lost";
        })
        .reduce((sum, apt) => {
          const price = apt.price || apt.servicePrice || 0;
          return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
        }, 0);

      const recoveredRevenue = sortedByDate
        .filter(apt => {
          const status = apt.status || "";
          return status === "התאושש" || status === "recovered" || status === "Recovered";
        })
        .reduce((sum, apt) => {
          const price = apt.price || apt.servicePrice || 0;
          return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
        }, 0);

      // Average visits per year
      let avgVisitsPerYear = null;
      if (sortedByDate.length > 0) {
        const firstAppointment = sortedByDate[0];
        const lastAppointment = sortedByDate[sortedByDate.length - 1];
        const firstDate = new Date(firstAppointment.date || firstAppointment.start);
        const lastDate = new Date(lastAppointment.date || lastAppointment.start);
        const diffTime = lastDate - firstDate;
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        if (diffYears > 0) {
          avgVisitsPerYear = Math.round((clientAppointments.length / diffYears) * 10) / 10;
        }
      }

      // Days since last appointment
      let daysSinceLastAppointment = null;
      if (lastAppointmentDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastDate = new Date(lastAppointmentDate);
        lastDate.setHours(0, 0, 0, 0);
        const diffTime = today - lastDate;
        daysSinceLastAppointment = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      // Average time between visits
      let avgTimeBetweenVisits = null;
      if (sortedByDate.length > 1) {
        const timeDifferences = [];
        for (let i = 1; i < sortedByDate.length; i++) {
          const date1 = new Date(sortedByDate[i - 1].date || sortedByDate[i - 1].start);
          const date2 = new Date(sortedByDate[i].date || sortedByDate[i].start);
          const diffTime = date2 - date1;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            timeDifferences.push(diffDays);
          }
        }
        if (timeDifferences.length > 0) {
          avgTimeBetweenVisits = Math.round(
            timeDifferences.reduce((sum, val) => sum + val, 0) / timeDifferences.length
          );
        }
      }

      // Average time from booking to appointment
      let avgTimeFromBookingToAppointment = null;
      if (sortedByDate.length > 0) {
        const bookingToAppointmentDifferences = [];
        sortedByDate.forEach(apt => {
          if (apt.createdAt && apt.date) {
            const bookingDate = new Date(apt.createdAt);
            const appointmentDate = new Date(apt.date || apt.start);
            const diffTime = appointmentDate - bookingDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0) {
              bookingToAppointmentDifferences.push(diffDays);
            }
          }
        });
        if (bookingToAppointmentDifferences.length > 0) {
          avgTimeFromBookingToAppointment = Math.round(
            bookingToAppointmentDifferences.reduce((sum, val) => sum + val, 0) / bookingToAppointmentDifferences.length
          );
        }
      }

      // Average rating
      let avgRating = "-";
      const ratings = sortedByDate
        .map(apt => apt.rating || apt.clientRating)
        .filter(r => r && r !== "-" && !isNaN(parseFloat(r)));
      if (ratings.length > 0) {
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

  // Calculate advanced statistics for selected client
  const clientAdvancedStats = useMemo(() => {
    if (!client) {
      return null;
    }

    try {
      // Load appointments from localStorage
      const storedAppointments = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
      const allAppointments = storedAppointments ? JSON.parse(storedAppointments) : [];
      
      // Filter appointments for this client
      const clientAppointments = allAppointments.filter(apt => {
        return apt.clientId === client.id || 
               apt.client === client.name ||
               (apt.clientName && apt.clientName === client.name);
      });

      if (clientAppointments.length === 0) {
        return {
          totalRevenue: client.totalRevenue || 0,
          visitCount: 0,
          avgVisitsPerYear: null,
          avgRevenuePerVisit: 0,
          avgTimeBetweenVisits: null,
          avgTimeBetweenVisitsChart: [],
          avgRating: client.rating || "-",
          avgRatingChart: [],
          lastRating: client.rating || "-",
          lastAppointmentDate: null,
          lastAppointmentTime: null,
          lastService: "-",
          lastStaff: "-",
          lostRevenue: 0,
          recoveredRevenue: 0,
          daysSinceLastAppointment: null,
          timeToConversion: null,
          avgTimeFromBookingToAppointment: null,
          avgTimeFromBookingToAppointmentChart: [],
        };
      }

      // Sort appointments by date
      const sortedAppointments = [...clientAppointments].sort((a, b) => {
        const dateA = new Date(a.date || a.start || 0);
        const dateB = new Date(b.date || b.start || 0);
        return dateA - dateB;
      });

      // Calculate total revenue
      const totalRevenue = sortedAppointments.reduce((sum, apt) => {
        const price = apt.price || apt.servicePrice || 0;
        return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
      }, 0) || client.totalRevenue || 0;

      // Visit count
      const visitCount = sortedAppointments.length;

      // Average visits per year
      let avgVisitsPerYear = null;
      if (sortedAppointments.length > 0) {
        const firstAppointment = sortedAppointments[0];
        const lastAppointment = sortedAppointments[sortedAppointments.length - 1];
        const firstDate = new Date(firstAppointment.date || firstAppointment.start);
        const lastDate = new Date(lastAppointment.date || lastAppointment.start);
        
        // Calculate difference in years
        const diffTime = lastDate - firstDate;
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25); // Account for leap years
        
        if (diffYears > 0) {
          avgVisitsPerYear = Math.round((visitCount / diffYears) * 10) / 10; // Round to 1 decimal place
        } else {
          // If all appointments are on the same day or very close, calculate based on days since first appointment
          const today = new Date();
          const daysSinceFirst = (today - firstDate) / (1000 * 60 * 60 * 24);
          if (daysSinceFirst > 0) {
            const yearsSinceFirst = daysSinceFirst / 365.25;
            avgVisitsPerYear = Math.round((visitCount / yearsSinceFirst) * 10) / 10;
          } else {
            avgVisitsPerYear = visitCount; // If it's the same day, just use visit count
          }
        }
      }

      // Average revenue per visit
      const avgRevenuePerVisit = visitCount > 0 ? Math.round(totalRevenue / visitCount) : 0;

      // Average time between visits (in days) and chart data
      let avgTimeBetweenVisits = null;
      const avgTimeBetweenVisitsChart = [];
      if (sortedAppointments.length > 1) {
        const timeDifferences = [];
        for (let i = 1; i < sortedAppointments.length; i++) {
          const date1 = new Date(sortedAppointments[i - 1].date || sortedAppointments[i - 1].start);
          const date2 = new Date(sortedAppointments[i].date || sortedAppointments[i].start);
          const diffDays = Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            timeDifferences.push(diffDays);
            avgTimeBetweenVisitsChart.push({
              name: `${i}`,
              value: diffDays,
            });
          }
        }
        if (timeDifferences.length > 0) {
          avgTimeBetweenVisits = Math.round(
            timeDifferences.reduce((sum, val) => sum + val, 0) / timeDifferences.length
          );
        }
      }

      // Average rating and chart data
      const ratings = sortedAppointments
        .map(apt => apt.rating || apt.clientRating)
        .filter(r => r && r !== "-" && !isNaN(parseFloat(r)));
      
      let avgRating = "-";
      const avgRatingChart = [];
      if (ratings.length > 0) {
        const numericRatings = ratings.map(r => parseFloat(r));
        avgRating = (numericRatings.reduce((sum, r) => sum + r, 0) / numericRatings.length).toFixed(1);
        
        // Create chart data for ratings over time
        sortedAppointments.forEach((apt, index) => {
          const rating = apt.rating || apt.clientRating;
          if (rating && rating !== "-" && !isNaN(parseFloat(rating))) {
            avgRatingChart.push({
              name: `${index + 1}`,
              value: parseFloat(rating),
            });
          }
        });
      } else {
        avgRating = client.rating || "-";
      }

      // Last visit details (from most recent appointment)
      let lastAppointmentDate = null;
      let lastAppointmentTime = null;
      let lastService = "-";
      let lastStaff = "-";
      let lastRating = "-";
      
      if (sortedAppointments.length > 0) {
        // Get the most recent appointment (last in sorted array)
        const lastAppointment = sortedAppointments[sortedAppointments.length - 1];
        
        // Last appointment date and time
        if (lastAppointment.date) {
          const appointmentDate = new Date(lastAppointment.date + 'T00:00:00');
          lastAppointmentDate = appointmentDate;
        }
        if (lastAppointment.start) {
          lastAppointmentTime = lastAppointment.start;
        }
        
        // Last service
        if (lastAppointment.serviceName) {
          lastService = lastAppointment.serviceName;
        } else if (lastAppointment.serviceId) {
          // Try to find service name from serviceId if needed
          lastService = lastAppointment.title?.split(/[–-]/)[0]?.trim() || "-";
        }
        
        // Last staff
        if (lastAppointment.staffName) {
          lastStaff = lastAppointment.staffName;
        } else if (lastAppointment.staff) {
          lastStaff = lastAppointment.staff;
        }
        
        // Last rating
        const rating = lastAppointment.rating || lastAppointment.clientRating;
        if (rating && rating !== "-" && !isNaN(parseFloat(rating))) {
          lastRating = rating;
        }
      }
      
      // If no rating found in appointments, use client's rating
      if (lastRating === "-") {
        lastRating = client.rating || "-";
      }

      // Lost revenue (appointments with status "אבוד" or "lost")
      const lostRevenue = sortedAppointments
        .filter(apt => {
          const status = apt.status || "";
          return status === "אבוד" || status === "lost" || status === "Lost";
        })
        .reduce((sum, apt) => {
          const price = apt.price || apt.servicePrice || 0;
          return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
        }, 0);

      // Recovered revenue (appointments with status "התאושש" or "recovered")
      const recoveredRevenue = sortedAppointments
        .filter(apt => {
          const status = apt.status || "";
          return status === "התאושש" || status === "recovered" || status === "Recovered";
        })
        .reduce((sum, apt) => {
          const price = apt.price || apt.servicePrice || 0;
          return sum + (typeof price === 'string' ? parseFloat(price.replace(/[₪$,\s]/g, '')) || 0 : price);
        }, 0);

      // Days since last appointment
      let daysSinceLastAppointment = null;
      if (sortedAppointments.length > 0) {
        const lastAppointment = sortedAppointments[sortedAppointments.length - 1];
        const lastDate = new Date(lastAppointment.date || lastAppointment.start);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);
        const diffTime = today - lastDate;
        daysSinceLastAppointment = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      // Time to Conversion (from lead date to first appointment)
      let timeToConversion = null;
      if (sortedAppointments.length > 0) {
        const leadDate = client.leadDate 
          ? new Date(client.leadDate)
          : client.createdAt
          ? new Date(client.createdAt)
          : null;
          
        if (leadDate) {
          const firstAppointment = sortedAppointments[0];
          const firstAppointmentDate = new Date(firstAppointment.date || firstAppointment.start);
          
          const diffTime = firstAppointmentDate - leadDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0) {
            timeToConversion = diffDays;
          }
        }
      }

      // Average time between booking and appointment (in days)
      let avgTimeFromBookingToAppointment = null;
      const avgTimeFromBookingToAppointmentChart = [];
      if (sortedAppointments.length > 0) {
        const bookingToAppointmentDifferences = [];
        sortedAppointments.forEach((apt, index) => {
          const appointmentDate = new Date(apt.date || apt.start);
          // Try to get booking date from createdAt, or use appointment date as fallback
          let bookingDate;
          if (apt.createdAt) {
            bookingDate = new Date(apt.createdAt);
          } else if (apt.bookingDate) {
            bookingDate = new Date(apt.bookingDate);
          } else {
            // If no booking date exists, we can't calculate this metric accurately
            // For now, we'll skip appointments without booking dates
            return;
          }
          
          appointmentDate.setHours(0, 0, 0, 0);
          bookingDate.setHours(0, 0, 0, 0);
          const diffDays = Math.round((appointmentDate - bookingDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0) { // Only count if appointment is after booking
            bookingToAppointmentDifferences.push(diffDays);
            avgTimeFromBookingToAppointmentChart.push({
              name: `${index + 1}`,
              value: diffDays,
            });
          }
        });
        
        if (bookingToAppointmentDifferences.length > 0) {
          avgTimeFromBookingToAppointment = Math.round(
            bookingToAppointmentDifferences.reduce((sum, val) => sum + val, 0) / bookingToAppointmentDifferences.length
          );
        }
      }

      return {
        totalRevenue,
        visitCount,
        avgVisitsPerYear,
        avgRevenuePerVisit,
        avgTimeBetweenVisits,
        avgTimeBetweenVisitsChart,
        avgRating,
        avgRatingChart,
        lastRating,
        lastAppointmentDate,
        lastAppointmentTime,
        lastService,
        lastStaff,
        lostRevenue,
        recoveredRevenue,
        daysSinceLastAppointment,
        timeToConversion,
        avgTimeFromBookingToAppointment,
        avgTimeFromBookingToAppointmentChart,
      };
    } catch (error) {
      console.error("Error calculating advanced stats:", error);
      return null;
    }
  }, [client]);

  if (!isOpen || !client) {
    return null;
  }

  const appointmentsInfo = getClientAppointmentsInfo(client);
  const storedAppointments = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
  const allAppointments = storedAppointments ? JSON.parse(storedAppointments) : [];
  
  const clientAppointments = allAppointments.filter(apt => {
    return apt.clientId === client.id || 
           apt.client === client.name ||
           (apt.clientName && apt.clientName === client.name);
  });

  // Sort by date - most recent first
  const sortedAppointments = [...clientAppointments].sort((a, b) => {
    const dateA = new Date(a.date || a.start || 0);
    const dateB = new Date(b.date || b.start || 0);
    return dateB - dateA; // Most recent first
  });

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
      
      {/* קליק על הרקע – סוגר את הכרטיס */}
      <div className="flex-1 bg-black/0" onClick={onClose} />

      <div
        dir="rtl"
        className={`relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
             border-l border-gray-200 dark:border-commonBorder shadow-2xl
             flex flex-col calendar-slide-in text-right`}
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
              backgroundPosition: '60% 50%',
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
                    {localProfileImage || client?.profileImage ? (
                      <img 
                        src={localProfileImage || client.profileImage} 
                        alt={client?.name || "לקוח"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      client?.initials || client?.name?.charAt(0)?.toUpperCase() || "ל"
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
                    {client?.name || "ללא שם"}
                  </div>
                  {client?.phone && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-white">
                        {formatPhoneForDisplay(client.phone)}
                      </span>
                      <button
                        type="button"
                        className="inline-block hover:scale-110 transition-transform duration-200 ease-in-out cursor-pointer"
                        title="התקשר"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${client.phone}`;
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
                          const whatsappUrl = formatPhoneToWhatsapp(client.phone);
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
                    { key: "appointments", label: "תורים" },
                    { key: "data", label: "נתונים מתקדמים" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={(e) => {
                        e.stopPropagation();
                        setClientViewTab(key);
                      }}
                      className={`relative pb-3 pt-1 font-medium transition-colors ${
                        clientViewTab === key
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-white"
                      }`}
                    >
                      {label}
                      {clientViewTab === key && (
                        <span
                          className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                          style={{ backgroundColor: BRAND_COLOR }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Details Tab */}
              {clientViewTab === "details" && (
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
                            value={editedClientData.name}
                            onChange={(e) => setEditedClientData({ ...editedClientData, name: e.target.value })}
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
                            {client?.name || "-"}
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
                            value={editedClientData.phone}
                            onChange={(e) => setEditedClientData({ ...editedClientData, phone: e.target.value })}
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
                            {client?.phone ? formatPhoneForDisplay(client.phone) : "-"}
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
                            value={editedClientData.email}
                            onChange={(e) => setEditedClientData({ ...editedClientData, email: e.target.value })}
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
                            {client?.email || "-"}
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
                            value={editedClientData.city}
                            onChange={(e) => setEditedClientData({ ...editedClientData, city: e.target.value })}
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
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {client?.city || "-"}
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
                            value={editedClientData.address}
                            onChange={(e) => setEditedClientData({ ...editedClientData, address: e.target.value })}
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
                            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {client?.address || "-"}
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
                  <div className="flex items-center gap-3 relative" ref={statusDropdownRef}>
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                      <FiCheckCircle className="text-gray-600 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-white mb-1">סטטוס</div>
                      <div className="relative">
                        {(() => {
                          const currentStatus = editedClientData.status || client?.status || "פעיל";
                          const isBlocked = currentStatus === "חסום";
                          const isActive = currentStatus === "פעיל";
                          const isInactive = currentStatus === "לא פעיל";
                          
                          return (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                                }}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition text-white ${
                                  isBlocked
                                    ? "bg-black dark:bg-white dark:text-black"
                                    : isActive
                                    ? ""
                                    : "bg-black dark:bg-white dark:text-black"
                                }`}
                                style={
                                  isActive && !isBlocked
                                    ? { 
                                        backgroundColor: BRAND_COLOR
                                      }
                                    : {}
                                }
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  isBlocked
                                    ? "bg-white dark:bg-white animate-pulse"
                                    : isActive
                                    ? "bg-white animate-pulse"
                                    : "bg-white dark:bg-black"
                                }`}></span>
                                <span>{isBlocked ? "חסום" : currentStatus}</span>
                                {!isBlocked && (
                                  <FiChevronDown className={`text-xs transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                                )}
                              </button>
                              
                              {/* Status Dropdown - First option is current status, second is "חסום" or "ביטול חסימה" */}
                              {isStatusDropdownOpen && (
                                <div
                                  className="absolute top-full left-0 mt-2 w-48 rounded-2xl border border-gray-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] shadow-2xl z-50 overflow-hidden"
                                  style={{
                                    boxShadow: "0 20px 50px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.00)",
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  dir="rtl"
                                >
                                  {/* Current Status (First Option) */}
                                  <button
                                    className="w-full px-4 py-3 text-sm text-right flex items-center justify-between transition-colors bg-gray-50 dark:bg-[#2a2a2a] text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700"
                                    disabled
                                  >
                                    <span>{currentStatus}</span>
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND_COLOR }}>
                                      <FiCheckCircle className="text-white text-xs" />
                                    </div>
                                  </button>
                                  
                                  {/* Block/Unblock Option (Second Option) */}
                                  {!isBlocked ? (
                                    // If not blocked, show "חסום" option
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditedClientData({
                                          ...editedClientData,
                                          status: "חסום"
                                        });
                                        handleSaveField("status", "חסום");
                                        setIsStatusDropdownOpen(false);
                                      }}
                                      className="w-full px-4 py-3 text-sm text-right flex items-center justify-between transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                    >
                                      <span>חסום</span>
                                    </button>
                                  ) : (
                                    // If blocked, show "ביטול חסימה" option
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Reset to "פעיל" when unblocking
                                        setEditedClientData({
                                          ...editedClientData,
                                          status: "פעיל"
                                        });
                                        handleSaveField("status", "פעיל");
                                        setIsStatusDropdownOpen(false);
                                      }}
                                      className="w-full px-4 py-3 text-sm text-right flex items-center justify-between transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                    >
                                      <span>ביטול חסימה</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
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
                        {client?.rating || "-"}
                      </div>
                    </div>
                  </div>

                  {/* תאריך פגישה ראשונה */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                      <FiClock className="text-gray-600 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-white mb-1">תאריך פגישה ראשונה</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {(() => {
                          try {
                            const storedAppointments = localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
                            const allAppointments = storedAppointments ? JSON.parse(storedAppointments) : [];
                            const clientAppointments = allAppointments.filter(apt => {
                              return apt.clientId === client?.id || 
                                     apt.client === client?.name ||
                                     (apt.clientName && apt.clientName === client?.name);
                            });
                            
                            if (clientAppointments.length > 0) {
                              const sortedAppointments = [...clientAppointments].sort((a, b) => {
                                const dateA = new Date(a.date || a.start || 0);
                                const dateB = new Date(b.date || b.start || 0);
                                return dateA - dateB; // Sort ascending (oldest first)
                              });
                              const firstAppointment = sortedAppointments[0];
                              const firstDate = firstAppointment.date || firstAppointment.start;
                              return firstDate ? formatDate(firstDate) : "-";
                            }
                            return "-";
                          } catch (error) {
                            console.error("Error getting first appointment:", error);
                            return "-";
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointments Tab */}
              {clientViewTab === "appointments" && (
                sortedAppointments.length === 0 ? (
                  <div className="space-y-4 mt-6">
                    <div className="text-sm text-gray-600 dark:text-white text-center py-8">
                      אין תורים עבור לקוח זה
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 mt-6">
                    {sortedAppointments.map((appointment, index) => {
                      const appointmentDate = appointment.date ? new Date(appointment.date + 'T00:00:00') : null;
                      const formattedDate = appointmentDate ? appointmentDate.toLocaleDateString('he-IL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : '-';
                      const timeRange = appointment.start && appointment.end 
                        ? `${appointment.start} - ${appointment.end}` 
                        : appointment.start || '-';
                      const service = appointment.title || appointment.serviceName || '-';
                      const staff = appointment.staffName || appointment.staff || '-';

                      return (
                        <div
                          key={appointment.id || index}
                          className="border border-gray-200 dark:border-[#262626] rounded-lg p-4 bg-white dark:bg-[#181818] hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FiCalendar className="text-gray-500 dark:text-white" size={16} />
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {formattedDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <FiClock className="text-gray-500 dark:text-white" size={16} />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {timeRange}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <FiUser className="text-gray-500 dark:text-white" size={16} />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {service}
                                </span>
                              </div>
                              {staff !== '-' && (
                                <div className="flex items-center gap-2 mb-2">
                                  <FiUser className="text-gray-500 dark:text-white" size={16} />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {staff}
                                  </span>
                                </div>
                              )}
                              {appointment.status && (
                                <div className="flex items-center gap-2 mb-2">
                                  <FiCheckCircle className="text-gray-500 dark:text-white" size={16} />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {appointment.status}
                                  </span>
                                </div>
                              )}
                              {(appointment.price || appointment.servicePrice) && (
                                <div className="flex items-center gap-2">
                                  <FiDollarSign className="text-green-600 dark:text-green-400" size={16} />
                                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    שולם: ₪{typeof (appointment.price || appointment.servicePrice) === 'string' 
                                      ? parseFloat((appointment.price || appointment.servicePrice).replace(/[₪$,\s]/g, '')) || 0
                                      : (appointment.price || appointment.servicePrice) || 0}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Data Tab - Advanced Statistics */}
              {clientViewTab === "data" && (
                <div className="space-y-6 mt-6">
                  {clientAdvancedStats ? (
                    <>
                      {/* טאבים פנימיים לקטגוריות */}
                      <div className="mb-4 -mt-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm px-2 overflow-x-auto">
                          {[
                            { key: "revenue", label: "הכנסות" },
                            { key: "activity", label: "פעילות לקוח" },
                            { key: "satisfaction", label: "שביעות רצון" },
                            { key: "lastVisit", label: "ביקור אחרון" },
                            { key: "marketing", label: "שיווק" },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDataCategoryTab(key);
                              }}
                              className={`relative px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                                dataCategoryTab === key
                                  ? "text-white"
                                  : "text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
                              }`}
                              style={
                                dataCategoryTab === key
                                  ? { backgroundColor: BRAND_COLOR }
                                  : {}
                              }
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* קטגוריה 1: הכנסות (Revenue) */}
                      {dataCategoryTab === "revenue" && (
                        <div className="space-y-4">
                          <div className="space-y-4">
                            {/* סך הכנסות */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                <FiDollarSign className="text-gray-600 dark:text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 dark:text-white mb-1">סך הכנסות</div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  ₪{clientAdvancedStats.totalRevenue.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* ממוצע הכנסה לתור */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                <FiTrendingUp className="text-gray-600 dark:text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 dark:text-white mb-1">ממוצע הכנסה לתור</div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  ₪{clientAdvancedStats.avgRevenuePerVisit.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* עסקה ממוצעת */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                <FiDollarSign className="text-gray-600 dark:text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 dark:text-white mb-1">עסקה ממוצעת</div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  ₪{clientAdvancedStats.avgRevenuePerVisit.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* הכנסות שאבדו */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                <FiAlertCircle className="text-red-500 dark:text-red-400" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 dark:text-white mb-1">הכנסות שאבדו</div>
                                <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                  ₪{clientAdvancedStats.lostRevenue.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* הכנסות שחזרו */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                <FiRefreshCw className="text-green-500 dark:text-green-400" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 dark:text-white mb-1">הכנסות שחזרו</div>
                                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                  ₪{clientAdvancedStats.recoveredRevenue.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* קטגוריה 2: פעילות לקוח (Engagement/Activity) */}
                      {dataCategoryTab === "activity" && (
                        <div className="space-y-4">
                          {/* כמות ביקורים */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                              <FiCalendar className="text-gray-600 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 dark:text-white mb-1">כמות ביקורים</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {clientAdvancedStats.visitCount}
                              </div>
                            </div>
                          </div>

                          {/* כמות ביקורים ממוצעת לשנה */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                              <FiCalendar className="text-gray-600 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 dark:text-white mb-1">כמות ביקורים ממוצעת לשנה</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {clientAdvancedStats.avgVisitsPerYear !== null ? clientAdvancedStats.avgVisitsPerYear : "-"}
                              </div>
                            </div>
                          </div>

                          {/* ימים מהתור האחרון */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                              <FiCalendar className="text-gray-600 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 dark:text-white mb-1">ימים מהתור האחרון</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {clientAdvancedStats.daysSinceLastAppointment !== null ? clientAdvancedStats.daysSinceLastAppointment : "-"}
                              </div>
                            </div>
                          </div>

                          {/* זמן ממוצע בין פגישות */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                              <FiClock className="text-gray-600 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 dark:text-white mb-1">זמן ממוצע בין פגישות</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                {clientAdvancedStats.avgTimeBetweenVisits !== null ? `${clientAdvancedStats.avgTimeBetweenVisits} ימים` : "-"}
                              </div>
                              {clientAdvancedStats.avgTimeBetweenVisitsChart.length > 0 && (
                                <div className="w-full h-20 mt-2">
                                  <ResponsiveContainer width="100%" height={80}>
                                    <AreaChart data={clientAdvancedStats.avgTimeBetweenVisitsChart}>
                                      <defs>
                                        <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor={BRAND_COLOR} stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor={BRAND_COLOR} stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke={BRAND_COLOR} 
                                        fillOpacity={1} 
                                        fill="url(#timeGradient)" 
                                      />
                                      <Tooltip
                                        content={({ active, payload }) => {
                                          if (active && payload && payload.length) {
                                            return (
                                              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-customBorderColor">
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                  {payload[0].value} ימים
                                                </p>
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                        cursor={false}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* זמן ממוצע בין קביעת התור לתור */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                              <FiClock className="text-gray-600 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 dark:text-white mb-1">זמן ממוצע בין קביעת התור לתור</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                {clientAdvancedStats.avgTimeFromBookingToAppointment !== null ? `${clientAdvancedStats.avgTimeFromBookingToAppointment} ימים` : "-"}
                              </div>
                              {clientAdvancedStats.avgTimeFromBookingToAppointmentChart.length > 0 && (
                                <div className="w-full h-20 mt-2">
                                  <ResponsiveContainer width="100%" height={80}>
                                    <AreaChart data={clientAdvancedStats.avgTimeFromBookingToAppointmentChart}>
                                      <defs>
                                        <linearGradient id="bookingTimeGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor={BRAND_COLOR} stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor={BRAND_COLOR} stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke={BRAND_COLOR} 
                                        fillOpacity={1} 
                                        fill="url(#bookingTimeGradient)" 
                                      />
                                      <Tooltip
                                        content={({ active, payload }) => {
                                          if (active && payload && payload.length) {
                                            return (
                                              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-customBorderColor">
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                  {payload[0].value} ימים
                                                </p>
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                        cursor={false}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* קטגוריה 3: שביעות רצון (Satisfaction) */}
                      {dataCategoryTab === "satisfaction" && (
                        <div className="space-y-4">
                          {/* ממוצע דירוג */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                              <FiStar className="text-gray-600 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 dark:text-white mb-1">ממוצע דירוג</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                {clientAdvancedStats.avgRating !== "-" ? clientAdvancedStats.avgRating : "-"}
                              </div>
                              {clientAdvancedStats.avgRatingChart.length > 0 && (
                                <div className="w-full h-20 mt-2">
                                  <ResponsiveContainer width="100%" height={80}>
                                    <AreaChart data={clientAdvancedStats.avgRatingChart}>
                                      <defs>
                                        <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor={BRAND_COLOR} stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor={BRAND_COLOR} stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke={BRAND_COLOR} 
                                        fillOpacity={1} 
                                        fill="url(#ratingGradient)" 
                                      />
                                      <Tooltip
                                        content={({ active, payload }) => {
                                          if (active && payload && payload.length) {
                                            return (
                                              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-customBorderColor">
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                  {payload[0].value}
                                                </p>
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                        cursor={false}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* קטגוריה 4: ביקור אחרון */}
                      {dataCategoryTab === "lastVisit" && (
                        <div className="space-y-4">
                          {/* תור אחרון */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                              <FiCalendar className="text-gray-600 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 dark:text-white mb-1">תור אחרון</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {clientAdvancedStats.lastAppointmentDate 
                                  ? `${formatDate(clientAdvancedStats.lastAppointmentDate)}${clientAdvancedStats.lastAppointmentTime ? ` ${clientAdvancedStats.lastAppointmentTime}` : ''}`
                                  : "-"}
                              </div>
                            </div>
                          </div>

                          {/* שירות אחרון */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                              <FiTrendingUp className="text-gray-600 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 dark:text-white mb-1">שירות אחרון</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {clientAdvancedStats.lastService}
                              </div>
                            </div>
                          </div>

                          {/* דירוג אחרון */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                              <FiStar className="text-gray-600 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 dark:text-white mb-1">דירוג אחרון</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {clientAdvancedStats.lastRating !== "-" ? clientAdvancedStats.lastRating : "-"}
                              </div>
                            </div>
                          </div>

                          {/* איש צוות אחרון */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                              <FiUser className="text-gray-600 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 dark:text-white mb-1">איש צוות אחרון</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {clientAdvancedStats.lastStaff}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* קטגוריה 5: שיווק (Marketing & Acquisition Data) */}
                      {dataCategoryTab === "marketing" && (
                        <div className="space-y-4">
                          <div className="space-y-6">
                            {/* 1. פרטי מקור הגעת הלקוח */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">פרטי מקור הגעת הלקוח</h4>
                              
                              {/* מקור הגעה */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiGlobe className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">מקור הגעה</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {client?.source || client?.acquisitionSource || "-"}
                                  </div>
                                </div>
                              </div>

                              {/* תאריך כניסת הליד */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiCalendar className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">תאריך כניסת הליד</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {client?.leadDate 
                                      ? formatDate(new Date(client.leadDate))
                                      : client?.createdAt
                                      ? formatDate(new Date(client.createdAt))
                                      : "-"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 2. פרטי קמפיין */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">פרטי קמפיין</h4>
                              
                              {/* שם קמפיין */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiTarget className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">שם קמפיין</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {client?.campaignName || "-"}
                                  </div>
                                </div>
                              </div>

                              {/* שם אד-סט */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiTarget className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">שם אד-סט</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {client?.adSetName || "-"}
                                  </div>
                                </div>
                              </div>

                              {/* שם מודעה */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiTarget className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">שם מודעה</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {client?.adName || "-"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 3. נתוני UTM */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">נתוני UTM</h4>
                              
                              {/* utm_source */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiLink className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">utm_source</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {client?.utmSource || client?.utm_source || "-"}
                                  </div>
                                </div>
                              </div>

                              {/* utm_medium */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiLink className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">utm_medium</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {client?.utmMedium || client?.utm_medium || "-"}
                                  </div>
                                </div>
                              </div>

                              {/* utm_campaign */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiLink className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">utm_campaign</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {client?.utmCampaign || client?.utm_campaign || "-"}
                                  </div>
                                </div>
                              </div>

                              {/* utm_content */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiLink className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">utm_content</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {client?.utmContent || client?.utm_content || "-"}
                                  </div>
                                </div>
                              </div>

                              {/* utm_term */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiLink className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">utm_term</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {client?.utmTerm || client?.utm_term || "-"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 4. מדדי בינה שיווקית */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">מדדי בינה שיווקית</h4>
                              
                              {/* זמן להמרה */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                                  <FiBarChart2 className="text-gray-600 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-500 dark:text-white mb-1">זמן להמרה</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {(() => {
                                      if (clientAdvancedStats.timeToConversion === null) return "-";
                                      
                                      const diffDays = clientAdvancedStats.timeToConversion;
                                      
                                      if (diffDays === 0) return "אותו יום";
                                      if (diffDays === 1) return "יום אחד";
                                      if (diffDays < 30) return `${diffDays} ימים`;
                                      if (diffDays < 365) {
                                        const months = Math.floor(diffDays / 30);
                                        const days = diffDays % 30;
                                        return days > 0 ? `${months} חודשים ו-${days} ימים` : `${months} חודשים`;
                                      }
                                      const years = Math.floor(diffDays / 365);
                                      const months = Math.floor((diffDays % 365) / 30);
                                      return months > 0 ? `${years} שנים ו-${months} חודשים` : `${years} שנים`;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-white text-center py-8">
                      אין נתונים זמינים
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


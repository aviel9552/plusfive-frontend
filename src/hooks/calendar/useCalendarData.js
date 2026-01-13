import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllStaffAction } from "../../redux/actions/staffActions";
import { getAllServicesAction } from "../../redux/actions/serviceActions";
import { getMyCustomersAction } from "../../redux/actions/customerActions";

const CALENDAR_STAFF_STORAGE_KEY = "calendar_staff";
const SERVICES_STORAGE_KEY = "services";

export const useCalendarData = () => {
  const dispatch = useDispatch();
  const { staff: staffFromStore, loading: isLoadingStaff } = useSelector((state) => state.staff);
  const { services: servicesFromStore, loading: isLoadingServices } = useSelector((state) => state.service);
  const { customers: customersFromStore, loading: isLoadingCustomers } = useSelector((state) => state.customer);

  // Staff state
  const [staffFromStorage, setStaffFromStorage] = useState([]);

  // Services state
  const [services, setServices] = useState([]);

  // Clients state
  const [clients, setClients] = useState([]);

  // Load staff from Redux store
  useEffect(() => {
    const fetchStaff = async () => {
      const result = await dispatch(getAllStaffAction());
      if (!result.success) {
        console.error("Error loading staff:", result.error);
        // Fallback to localStorage if API fails
        const storedStaff = localStorage.getItem(CALENDAR_STAFF_STORAGE_KEY);
        if (storedStaff) {
          try {
            const parsedStaff = JSON.parse(storedStaff);
            setStaffFromStorage(parsedStaff);
          } catch (parseError) {
            console.error("Error loading staff from localStorage:", parseError);
          }
        }
      }
    };

    // Only fetch if store is empty
    if (staffFromStore.length === 0) {
      fetchStaff();
    }

    // Refresh staff periodically (every 30 seconds) to get updates
    const intervalId = setInterval(() => {
      dispatch(getAllStaffAction());
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);

  // Sync staff from Redux store to local state
  useEffect(() => {
    if (staffFromStore.length > 0) {
      // Transform API data to match frontend format
      const transformedStaff = staffFromStore.map((s) => {
        const initials = (s.fullName || "")
          .trim()
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "ל";

        return {
          id: s.id,
          name: s.fullName || "",
          phone: s.phone || "",
          email: s.email || "",
          city: s.city || "",
          address: s.address || "",
          initials: initials,
          status: s.isActive ? "פעיל" : "לא פעיל",
          services: [],
          createdAt: s.createdAt || new Date().toISOString(),
          workingHours: {},
        };
      });

      setStaffFromStorage(transformedStaff);
    }
  }, [staffFromStore]);

  // Load services from Redux store
  useEffect(() => {
    const fetchServices = async () => {
      const result = await dispatch(getAllServicesAction());
      if (!result.success) {
        console.error("Error loading services:", result.error);
        // Fallback to localStorage if API fails
        const storedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
        if (storedServices) {
          try {
            const parsedServices = JSON.parse(storedServices);
            setServices(parsedServices);
          } catch (parseError) {
            console.error("Error loading services from localStorage:", parseError);
            setServices([]);
          }
        } else {
          setServices([]);
        }
      }
    };

    // Only fetch if store is empty
    if (servicesFromStore.length === 0) {
      fetchServices();
    }

    // Refresh services periodically (every 30 seconds) to get updates
    const intervalId = setInterval(() => {
      dispatch(getAllServicesAction());
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);

  // Sync services from Redux store to local state
  useEffect(() => {
    if (servicesFromStore.length > 0) {
      // Transform services from API format to frontend format
      const transformedServices = servicesFromStore.map((s) => ({
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
      }));
      setServices(transformedServices);
    }
  }, [servicesFromStore]);

  // Load customers from Redux store
  useEffect(() => {
    const fetchCustomers = async () => {
      const result = await dispatch(getMyCustomersAction());
      if (!result.success) {
        console.error("Error loading customers:", result.error);
        // Fallback to localStorage if API fails
        const storedClients = localStorage.getItem("calendar_clients");
        if (storedClients) {
          try {
            const parsedClients = JSON.parse(storedClients);
            setClients(parsedClients);
          } catch (parseError) {
            console.error("Error loading clients from localStorage:", parseError);
            setClients([]);
          }
        } else {
          setClients([]);
        }
      }
    };

    // Only fetch if store is empty
    if (customersFromStore.length === 0) {
      fetchCustomers();
    }

    // Refresh customers periodically (every 30 seconds) to get updates
    const intervalId = setInterval(() => {
      dispatch(getMyCustomersAction());
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch, customersFromStore.length]);

  // Sync customers from Redux store to local state
  useEffect(() => {
    if (customersFromStore.length > 0) {
      // Transform customers from API format to frontend format
      const transformedClients = customersFromStore.map((c) => {
        const firstName = c.firstName || "";
        const lastName = c.lastName || "";
        const fullName = c.customerFullName || `${firstName} ${lastName}`.trim() || "ללא שם";
        const initials = fullName
          .trim()
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "ל";

        return {
          id: c.id,
          name: fullName,
          firstName: firstName,
          lastName: lastName,
          phone: c.customerPhone || "",
          email: c.email || "",
          initials: initials,
          status: "active",
          createdAt: c.createdAt || new Date().toISOString(),
        };
      });
      setClients(transformedClients);
    }
  }, [customersFromStore]);

  return {
    staffFromStorage,
    services,
    clients,
    setClients,
    isLoadingStaff,
    isLoadingServices,
    isLoadingCustomers,
  };
};

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCustomerAction, getMyCustomersAction } from "../../redux/actions/customerActions";
import { formatPhoneForBackend } from "../../utils/phoneHelpers";

export const useCustomerCreation = (onSuccess) => {
  const dispatch = useDispatch();
  const { customers: customersFromStore } = useSelector((state) => state.customer);

  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCity, setNewClientCity] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientErrors, setNewClientErrors] = useState({});

  const handleCreateNewClient = async () => {
    const errors = {};
    if (!newClientName.trim()) {
      errors.name = "שם הוא שדה חובה";
    }

    const phoneDigits = newClientPhone.trim().replace(/\D/g, "");
    if (!newClientPhone.trim()) {
      errors.phone = "טלפון הוא שדה חובה";
    } else if (phoneDigits.length !== 10) {
      errors.phone = "מספר טלפון חייב להכיל בדיוק 10 ספרות";
    }

    // Email validation (required by backend)
    if (!newClientEmail.trim()) {
      errors.email = "אימייל הוא שדה חובה";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientEmail.trim())) {
      errors.email = "אימייל לא תקין";
    }

    setNewClientErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Split full name into firstName and lastName
    const nameParts = newClientName.trim().split(" ").filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Combine city and address
    const fullAddress = [newClientCity.trim(), newClientAddress.trim()]
      .filter(Boolean)
      .join(", ");

    // Generate a temporary password (backend requires it)
    const tempPassword = `Temp${Date.now()}${Math.random().toString(36).slice(2)}`;

    // Prepare customer data according to backend API
    const customerData = {
      email: newClientEmail.trim(),
      password: tempPassword,
      firstName: firstName,
      lastName: lastName || firstName,
      phoneNumber: formatPhoneForBackend(phoneDigits),
      address: fullAddress || null,
    };

    try {
      // Call API to create customer
      const result = await dispatch(addCustomerAction(customerData));

      if (result.success) {
        // Customer created successfully, refresh the customers list
        const refreshResult = await dispatch(getMyCustomersAction());

        // Get the customer data from API response or find in refreshed store
        let newCustomer = null;

        // Try to get from API response first
        if (result.data?.customer) {
          newCustomer = result.data.customer;
        } else if (result.data?.customerId) {
          // If we have customerId, we can construct from the data we sent
          newCustomer = {
            id: result.data.customerId,
            firstName: firstName,
            lastName: lastName || firstName,
            email: newClientEmail.trim(),
            customerPhone: formatPhoneForBackend(phoneDigits),
            customerFullName: `${firstName} ${lastName || firstName}`.trim(),
            address: fullAddress || null,
            createdAt: new Date().toISOString(),
          };
        } else {
          // Wait a bit for Redux store to update, then find the new customer
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Find in refreshed customers
          const refreshedCustomers =
            customersFromStore.length > 0
              ? customersFromStore
              : refreshResult?.data || [];

          newCustomer = refreshedCustomers.find(
            (c) =>
              c.email === newClientEmail.trim() ||
              (c.firstName === firstName && (c.lastName === lastName || !lastName))
          );
        }

        if (newCustomer) {
          // Transform to frontend format
          const fullName =
            newCustomer.customerFullName ||
            `${newCustomer.firstName || firstName} ${newCustomer.lastName || lastName || firstName}`.trim();
          const initials = fullName
            .trim()
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ל";

          const newClient = {
            id: newCustomer.id,
            name: fullName,
            firstName: newCustomer.firstName || firstName,
            lastName: newCustomer.lastName || lastName || firstName,
            phone: newCustomer.customerPhone || formatPhoneForBackend(phoneDigits),
            email: newCustomer.email || newClientEmail.trim(),
            city: newClientCity.trim(),
            address: newClientAddress.trim(),
            initials: initials,
            status: "active",
            createdAt: newCustomer.createdAt || new Date().toISOString(),
          };

          // Reset form fields
          setNewClientName("");
          setNewClientPhone("");
          setNewClientEmail("");
          setNewClientCity("");
          setNewClientAddress("");
          setNewClientErrors({});

          // Call success callback
          if (onSuccess) {
            onSuccess(newClient);
          }

          return newClient;
        } else {
          // If customer not found, just reset form
          setNewClientName("");
          setNewClientPhone("");
          setNewClientEmail("");
          setNewClientCity("");
          setNewClientAddress("");
          setNewClientErrors({});
          return null;
        }
      } else {
        // API error
        setNewClientErrors({
          submit: result.error || "שגיאה ביצירת הלקוח. נסה שוב.",
        });
        return null;
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      setNewClientErrors({
        submit: error.message || "שגיאה ביצירת הלקוח. נסה שוב.",
      });
      return null;
    }
  };

  const resetForm = () => {
    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
    setNewClientCity("");
    setNewClientAddress("");
    setNewClientErrors({});
  };

  return {
    newClientName,
    setNewClientName,
    newClientPhone,
    setNewClientPhone,
    newClientEmail,
    setNewClientEmail,
    newClientCity,
    setNewClientCity,
    newClientAddress,
    setNewClientAddress,
    newClientErrors,
    setNewClientErrors,
    handleCreateNewClient,
    resetForm,
  };
};

/**
 * Client Service - API calls for clients with localStorage fallback
 * This service handles all client operations with automatic fallback to localStorage
 * if the backend is unavailable or returns an error.
 */

import apiClient from '../../config/apiClient.jsx';
import { getMyCustomers, addCustomer, updateCustomer, removeCustomer } from '../../redux/services/customerService';

const CALENDAR_CLIENTS_STORAGE_KEY = "calendar_clients";

/**
 * Get all clients from backend, with localStorage fallback
 * @returns {Promise<{ clients: Array, error: string | null, isAuthError: boolean }>} Object with clients array and error info
 */
export const getAllClients = async () => {
  try {
    // Get existing clients from localStorage first (to preserve local-only clients)
    const existingLocalClients = getClientsFromLocalStorage();
    
    // Try to get from backend first
    const response = await getMyCustomers();
    
    // If successful, map all clients and merge with local clients
    if (response && Array.isArray(response)) {
      // Map each backend client to frontend format
      const mappedBackendClients = response.map(client => mapBackendClientToFrontend(client));
      
      // Create a map of backend clients by phone (to check for duplicates)
      const backendClientsMap = new Map();
      mappedBackendClients.forEach(client => {
        const key = client.phone || client.customerPhone || '';
        if (key) {
          backendClientsMap.set(key, client);
        }
      });
      
      // Merge: keep backend clients, and add local clients that don't exist in backend
      const mergedClients = [...mappedBackendClients];
      existingLocalClients.forEach(localClient => {
        const key = localClient.phone || localClient.customerPhone || '';
        // Only add local clients that don't exist in backend (by phone number)
        if (key && !backendClientsMap.has(key)) {
          // Also check by ID if phone is not available
          const existsById = mappedBackendClients.some(bc => 
            bc.id === localClient.id || 
            bc.id?.toString() === localClient.id?.toString()
          );
          if (!existsById) {
            mergedClients.push(localClient);
          }
        }
      });
      
      try {
        // Store merged clients to localStorage
        localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(mergedClients));
      } catch (storageError) {
        console.warn('Failed to sync clients to localStorage:', storageError);
      }
      return { clients: mergedClients, error: null, isAuthError: false };
    }
    
    // If response is not an array, fall back to localStorage
    throw new Error('Invalid response format from backend');
  } catch (error) {
    // Check if it's a 401 authentication error
    const isAuthError = error.status === 401 || 
                       error.response?.status === 401 ||
                       error.message?.includes('Access token required') ||
                       error.message?.includes('token') ||
                       error.response?.data?.message?.includes('Access token required') ||
                       error.response?.data?.error?.includes('Access token required');
    
    if (isAuthError) {
      console.warn('Authentication required to load clients from backend');
      // Return empty array with auth error flag, but still try localStorage fallback
      const fallbackClients = await getClientsFromLocalStorage();
      return { 
        clients: fallbackClients, 
        error: 'Please login to load customers', 
        isAuthError: true 
      };
    }
    
    console.warn('Failed to load clients from backend, using localStorage:', error);
    
    // Fallback to localStorage for other errors
    const fallbackClients = await getClientsFromLocalStorage();
    return { 
      clients: fallbackClients, 
      error: error.message || 'Failed to load customers', 
      isAuthError: false 
    };
  }
};

/**
 * Helper function to get clients from localStorage
 * @returns {Array} Array of clients from localStorage
 */
const getClientsFromLocalStorage = () => {
  try {
    const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
    if (storedClients) {
      const parsed = JSON.parse(storedClients);
      // If stored clients are in backend format, map them
      if (parsed.length > 0 && parsed[0].customerFullName !== undefined) {
        return parsed.map(client => mapBackendClientToFrontend(client));
      }
      return parsed;
    }
  } catch (parseError) {
    console.error('Failed to parse clients from localStorage:', parseError);
  }
  return [];
};

/**
 * Create a new client in backend, with localStorage fallback
 * @param {Object} clientData - Client data
 * @returns {Promise<Object>} Created client
 */
export const createClient = async (clientData) => {
  try {
    // Map frontend data to backend format
    const backendPayload = mapFrontendClientToBackend(clientData);
    
    // Try to save to backend first
    const response = await addCustomer(backendPayload);
    
    // If successful, map response to frontend format and save to localStorage as backup
    if (response) {
      const mappedClient = mapBackendClientToFrontend(response);
      try {
        const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
        const clients = storedClients ? JSON.parse(storedClients) : [];
        const updatedClients = [mappedClient, ...clients];
        localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
      } catch (storageError) {
        console.warn('Failed to sync new client to localStorage:', storageError);
      }
      return mappedClient;
    }
    
    throw new Error('Failed to create client in backend');
  } catch (error) {
    console.warn('Failed to create client in backend, using localStorage:', error);
    
    // Fallback to localStorage
    try {
      const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
      const clients = storedClients ? JSON.parse(storedClients) : [];
      
      // Create client with local ID if backend doesn't provide one
      // Use frontend format for localStorage
      const newClient = {
        ...clientData,
        id: clientData.id || `local_${Date.now()}`,
        createdAt: clientData.createdAt || new Date().toISOString(),
        // Ensure all required backend fields have defaults
        customerFullName: clientData.name || clientData.customerFullName || '',
        customerPhone: clientData.phone || clientData.customerPhone || '',
        firstName: clientData.firstName || '',
        lastName: clientData.lastName || '',
        email: clientData.email || null,
        appointmentCount: 0,
        businessId: null,
        businessName: '',
        coverImage: null,
        documentId: null,
        documentImage: null,
        duration: '',
        employeeId: null,
        endDate: null,
        profileImage: null,
        selectedServices: '',
        startDate: null,
        updatedAt: new Date().toISOString(),
        userId: '',
      };
      
      const updatedClients = [newClient, ...clients];
      localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
      
      return newClient;
    } catch (storageError) {
      console.error('Failed to create client in localStorage:', storageError);
      throw new Error('Failed to create client');
    }
  }
};

/**
 * Update a client in backend, with localStorage fallback
 * @param {string|number} clientId - Client ID
 * @param {Object} clientData - Updated client data
 * @returns {Promise<Object>} Updated client
 */
export const updateClient = async (clientId, clientData) => {
  try {
    // Get existing client to preserve unchanged fields
    let existingClient = null;
    try {
      const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        existingClient = clients.find(c => 
          c.id === clientId || c.id?.toString() === clientId?.toString()
        );
      }
    } catch (e) {
      console.warn('Could not load existing client for update:', e);
    }

    // Map frontend data to backend format, preserving existing backend fields
    const backendPayload = mapFrontendClientToBackend(clientData, existingClient);
    
    // Try to update in backend first
    const response = await updateCustomer(clientId, backendPayload);
    
    // If successful, map response to frontend format and update localStorage as backup
    if (response) {
      const mappedClient = mapBackendClientToFrontend(response);
      try {
        const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
        if (storedClients) {
          const clients = JSON.parse(storedClients);
          const updatedClients = clients.map(client => 
            client.id === clientId || client.id?.toString() === clientId?.toString() 
              ? mappedClient
              : client
          );
          localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
        }
      } catch (storageError) {
        console.warn('Failed to sync updated client to localStorage:', storageError);
      }
      return mappedClient;
    }
    
    throw new Error('Failed to update client in backend');
  } catch (error) {
    console.warn('Failed to update client in backend, using localStorage:', error);
    
    // Fallback to localStorage
    try {
      const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        const updatedClients = clients.map(client => {
          if (client.id === clientId || client.id?.toString() === clientId?.toString()) {
            // Merge frontend updates with existing client data
            return {
              ...client,
              ...clientData,
              // Preserve backend fields that might not be in clientData
              customerFullName: clientData.name || client.customerFullName || client.name || '',
              customerPhone: clientData.phone || client.customerPhone || client.phone || '',
              updatedAt: new Date().toISOString(),
            };
          }
          return client;
        });
        localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
        
        const updatedClient = updatedClients.find(c => 
          c.id === clientId || c.id?.toString() === clientId?.toString()
        );
        return updatedClient;
      }
    } catch (storageError) {
      console.error('Failed to update client in localStorage:', storageError);
      throw new Error('Failed to update client');
    }
  }
};

/**
 * Delete a client from backend, with localStorage fallback
 * @param {string|number} clientId - Client ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteClient = async (clientId) => {
  try {
    // Try to delete from backend first
    await removeCustomer(clientId);
    
    // If successful, also delete from localStorage
    try {
      const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        const updatedClients = clients.filter(client => 
          client.id !== clientId && client.id?.toString() !== clientId?.toString()
        );
        localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
      }
    } catch (storageError) {
      console.warn('Failed to sync deleted client to localStorage:', storageError);
    }
    
    return true;
  } catch (error) {
    console.warn('Failed to delete client from backend, using localStorage:', error);
    
    // Fallback to localStorage
    try {
      const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        const updatedClients = clients.filter(client => 
          client.id !== clientId && client.id?.toString() !== clientId?.toString()
        );
        localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
        return true;
      }
    } catch (storageError) {
      console.error('Failed to delete client from localStorage:', storageError);
      throw new Error('Failed to delete client');
    }
  }
};

/**
 * Delete multiple clients from backend, with localStorage fallback
 * @param {Array<string|number>} clientIds - Array of client IDs
 * @returns {Promise<boolean>} Success status
 */
export const deleteMultipleClients = async (clientIds) => {
  try {
    // Try to delete from backend first
    // Note: You might need to create a bulk delete endpoint
    // For now, we'll delete one by one
    const deletePromises = clientIds.map(id => removeCustomer(id));
    await Promise.all(deletePromises);
    
    // If successful, also delete from localStorage
    try {
      const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        const clientIdSet = new Set(clientIds.map(id => id?.toString()));
        const updatedClients = clients.filter(client => 
          !clientIdSet.has(client.id?.toString())
        );
        localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
      }
    } catch (storageError) {
      console.warn('Failed to sync deleted clients to localStorage:', storageError);
    }
    
    return true;
  } catch (error) {
    console.warn('Failed to delete clients from backend, using localStorage:', error);
    
    // Fallback to localStorage
    try {
      const storedClients = localStorage.getItem(CALENDAR_CLIENTS_STORAGE_KEY);
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        const clientIdSet = new Set(clientIds.map(id => id?.toString()));
        const updatedClients = clients.filter(client => 
          !clientIdSet.has(client.id?.toString())
        );
        localStorage.setItem(CALENDAR_CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
        return true;
      }
    } catch (storageError) {
      console.error('Failed to delete clients from localStorage:', storageError);
      throw new Error('Failed to delete clients');
    }
  }
};

/**
 * Map client data from backend format to frontend format
 * FULL 1:1 mapping of all columns from the `customers` table
 * Additional frontend-only fields are added as derived/computed fields
 * @param {Object} backendClient - Client data from backend (Prisma customers table)
 * @returns {Object} Client data in frontend format with all backend fields + derived fields
 */
export const mapBackendClientToFrontend = (backendClient) => {
  if (!backendClient) return null;

  // Build full name from firstName + lastName or use customerFullName
  const fullName = backendClient.customerFullName || 
    (backendClient.firstName && backendClient.lastName 
      ? `${backendClient.firstName} ${backendClient.lastName}`.trim()
      : backendClient.firstName || backendClient.lastName || '');

  // Generate initials from full name
  const generateInitials = (name) => {
    if (!name) return 'ל';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'ל';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Return ALL backend fields + derived frontend fields
  return {
    // === ALL BACKEND FIELDS (1:1 mapping) ===
    id: backendClient.id || '',
    appointmentCount: backendClient.appointmentCount ?? 0,
    businessId: backendClient.businessId ?? null,
    businessName: backendClient.businessName || '',
    coverImage: backendClient.coverImage || null,
    createdAt: backendClient.createdAt || null,
    customerFullName: backendClient.customerFullName || '',
    customerPhone: backendClient.customerPhone || '',
    documentId: backendClient.documentId || null,
    documentImage: backendClient.documentImage || null,
    duration: backendClient.duration || '',
    email: backendClient.email || null,
    employeeId: backendClient.employeeId ?? null,
    endDate: backendClient.endDate || null,
    firstName: backendClient.firstName || '',
    lastName: backendClient.lastName || '',
    profileImage: backendClient.profileImage || null,
    selectedServices: backendClient.selectedServices || '',
    startDate: backendClient.startDate || null,
    updatedAt: backendClient.updatedAt || null,
    userId: backendClient.userId || '',

    // === DERIVED FRONTEND FIELDS (computed from backend data) ===
    // These are for UI compatibility and don't exist in DB
    name: fullName, // Derived from customerFullName or firstName + lastName
    phone: backendClient.customerPhone || '', // Alias for customerPhone
    city: '', // Not in DB - can be added later
    address: '', // Not in DB - can be added later
    status: 'פעיל', // Not in DB - default value, can be added later
    initials: generateInitials(fullName), // Computed from name
    totalRevenue: 0, // Not in DB - can be calculated from appointments later
    rating: '-', // Not in DB - can be added later
  };
};

/**
 * Map client data from frontend format to backend format
 * Maps frontend fields to the exact `customers` table schema
 * Only sends fields that exist in the database schema
 * @param {Object} frontendClient - Client data from frontend
 * @param {Object} existingBackendClient - Optional: existing backend client data to preserve unchanged fields
 * @returns {Object} Client data in backend format (customers table schema)
 */
export const mapFrontendClientToBackend = (frontendClient, existingBackendClient = {}) => {
  if (!frontendClient) return null;

  // Parse name into firstName and lastName if needed
  const parseName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' ')
    };
  };

  const { firstName, lastName } = parseName(frontendClient.name || frontendClient.customerFullName);

  // Build the backend payload with ALL required fields
  // Preserve existing backend fields that aren't being updated
  const backendPayload = {
    // === Fields that can be updated from frontend ===
    customerFullName: frontendClient.name || frontendClient.customerFullName || existingBackendClient.customerFullName || '',
    customerPhone: frontendClient.phone || frontendClient.customerPhone || existingBackendClient.customerPhone || '',
    firstName: firstName || existingBackendClient.firstName || '',
    lastName: lastName || existingBackendClient.lastName || '',
    email: frontendClient.email !== undefined ? frontendClient.email : (existingBackendClient.email || null),
    profileImage: frontendClient.profileImage !== undefined ? frontendClient.profileImage : (existingBackendClient.profileImage || null),
    coverImage: frontendClient.coverImage !== undefined ? frontendClient.coverImage : (existingBackendClient.coverImage || null),
    documentId: frontendClient.documentId !== undefined ? frontendClient.documentId : (existingBackendClient.documentId || null),
    documentImage: frontendClient.documentImage !== undefined ? frontendClient.documentImage : (existingBackendClient.documentImage || null),
    
    // === Fields that should be preserved from existing data if not provided ===
    id: frontendClient.id || existingBackendClient.id || '',
    appointmentCount: frontendClient.appointmentCount !== undefined ? frontendClient.appointmentCount : (existingBackendClient.appointmentCount ?? 0),
    businessId: frontendClient.businessId !== undefined ? frontendClient.businessId : (existingBackendClient.businessId ?? null),
    businessName: frontendClient.businessName || existingBackendClient.businessName || '',
    duration: frontendClient.duration || existingBackendClient.duration || '',
    employeeId: frontendClient.employeeId !== undefined ? frontendClient.employeeId : (existingBackendClient.employeeId ?? null),
    endDate: frontendClient.endDate || existingBackendClient.endDate || null,
    selectedServices: frontendClient.selectedServices || existingBackendClient.selectedServices || '',
    startDate: frontendClient.startDate || existingBackendClient.startDate || null,
    userId: frontendClient.userId || existingBackendClient.userId || '',
    
    // === Timestamps (usually handled by backend, but include if updating) ===
    createdAt: frontendClient.createdAt || existingBackendClient.createdAt || null,
    updatedAt: new Date().toISOString(), // Always update this on modification
  };

  // Remove undefined values to avoid sending them
  Object.keys(backendPayload).forEach(key => {
    if (backendPayload[key] === undefined) {
      delete backendPayload[key];
    }
  });

  return backendPayload;
};


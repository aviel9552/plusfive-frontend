/**
 * Hook for managing appointments
 * Handles CRUD operations with API only (database storage, no localStorage)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { findBatchConflicts } from '../../utils/calendar/conflictDetection';
import { 
  getAppointments as getAppointmentsAPI,
  createAppointment as createAppointmentAPI,
  updateAppointment as updateAppointmentAPI,
  deleteAppointment as deleteAppointmentAPI,
  mapBackendAppointmentToFrontend,
  mapFrontendAppointmentToBackend
} from '../../services/calendar/appointmentService';

export const useAppointments = () => {
  // Start with empty array - will be loaded from API
  const [appointments, setAppointments] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasConflictRef = useRef(false); // Track if there was a conflict during appointment creation
  const abortControllerRef = useRef(null); // Track current request for cancellation
  
  /**
   * Load appointments from API (database)
   * @param {Object} filters - Optional filters (start, end dates for date range, userId, customerId, employeeId)
   * @param {AbortSignal} signal - Optional abort signal for cancellation
   */
  const loadAppointments = useCallback(async (filters = {}, signal = null) => {
    setIsLoading(true);
    setError(null);
    
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      // Load from API
      const response = await getAppointmentsAPI(filters, signal || abortController.signal);
      
      // Extract appointments from response
      // Response structure: { appointments: [...], pagination: {...} } or { data: { appointments: [...], pagination: {...} } }
      let appointmentsList = [];
      if (Array.isArray(response)) {
        appointmentsList = response;
      } else if (Array.isArray(response.appointments)) {
        appointmentsList = response.appointments;
      } else if (Array.isArray(response.data?.appointments)) {
        appointmentsList = response.data.appointments;
      } else if (Array.isArray(response.data)) {
        appointmentsList = response.data;
      }
      
      setAppointments(appointmentsList);
      
      if (import.meta.env.DEV) {
        // console.log('[LOAD_APPTS] ✅ Loaded from API:', {
        //   totalCount: appointmentsList.length,
        //   rangeRequested: filters.start && filters.end ? `${filters.start} to ${filters.end}` : 'all',
        //   responseKeys: Object.keys(response || {}),
        //   hasAppointments: !!response?.appointments,
        //   hasDataAppointments: !!response?.data?.appointments,
        //   sampleAppointment: appointmentsList[0] ? {
        //     id: appointmentsList[0].id,
        //     date: appointmentsList[0].date,
        //     start: appointmentsList[0].start,
        //     staff: appointmentsList[0].staff,
        //   } : null,
        // });
      }
      
      return appointmentsList;
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError' || err.name === 'CanceledError' || signal?.aborted) {
        throw err;
      }
      
      console.error('Failed to load appointments from API:', err);
      setError(err.message);
      const emptyAppointments = [];
      setAppointments(emptyAppointments);
      return emptyAppointments;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []); // Empty deps - function is stable
  
  /**
   * Create a single appointment (API only - database storage)
   */
  const createAppointment = async (appointmentData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Transform frontend appointment data to backend format using the service function
      const backendData = mapFrontendAppointmentToBackend(appointmentData);
      
      // Add source and byCustomer fields
      backendData.source = 'calendar';
      backendData.byCustomer = false;

      // Validate required fields
      if (!backendData.startDate || !backendData.endDate) {
        throw new Error('Invalid date or time format. Please check appointment date and time.');
      }

      // Create via API
      const response = await createAppointmentAPI(backendData);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create appointment');
      }

      const apiAppointment = response.data;
      
      // Transform backend response to frontend format using the service function
      const transformedAppointment = mapBackendAppointmentToFrontend(apiAppointment);
      
      // Merge with original appointment data for any missing fields
      const finalAppointment = {
        ...transformedAppointment,
        // Preserve original fields if mapping didn't provide them
        status: transformedAppointment.status || appointmentData.status || 'confirmed',
        createdAt: apiAppointment.createdAt || new Date().toISOString()
      };

      // Add to state
      setAppointments((prev) => {
        const exists = prev.some(apt => apt.id === finalAppointment.id);
        if (exists) {
          if (import.meta.env.DEV) {
            console.warn('[CREATE_APPT] ⚠️ Appointment already exists in state, skipping duplicate:', finalAppointment.id);
          }
          return prev;
        }
        
        const updated = [...prev, finalAppointment];
        if (import.meta.env.DEV) {
          console.log('[CREATE_APPT] ✅ Created appointment via API:', {
            previousCount: prev.length,
            newCount: updated.length,
            addedAppointment: finalAppointment,
          });
        }
        return updated;
      });

      return finalAppointment;
    } catch (err) {
      console.error('Failed to create appointment:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Create multiple appointments (for recurring appointments) - API only
   * Includes conflict detection
   */
  const createAppointments = async (appointmentsArray, options = {}) => {
    const { checkConflicts = true, onConflict } = options;
    
    // Check for conflicts if requested
    if (checkConflicts) {
      const conflict = findBatchConflicts(appointmentsArray, appointments);
      if (conflict) {
        hasConflictRef.current = true;
        if (onConflict) {
          onConflict(conflict);
        }
        throw new Error('CONFLICT_DETECTED');
      }
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Create each appointment via API
      const createdAppointments = [];
      
      for (const apt of appointmentsArray) {
        try {
          // Transform to backend format
          const backendData = mapFrontendAppointmentToBackend(apt);
          backendData.source = 'calendar';
          backendData.byCustomer = false;

          if (!backendData.startDate || !backendData.endDate) {
            console.warn('[CREATE_APPTS] Skipping appointment with invalid date/time:', apt);
            continue;
          }

          const response = await createAppointmentAPI(backendData);
          
          if (response.success && response.data) {
            const transformed = mapBackendAppointmentToFrontend(response.data);
            createdAppointments.push(transformed);
          }
        } catch (err) {
          console.error('[CREATE_APPTS] Failed to create appointment:', err, apt);
          // Continue with other appointments even if one fails
        }
      }

      // Add all created appointments to state
      setAppointments((prev) => [...prev, ...createdAppointments]);
      hasConflictRef.current = false;
      
      if (import.meta.env.DEV) {
        console.log('[CREATE_APPTS] ✅ Created appointments via API:', {
          requested: appointmentsArray.length,
          created: createdAppointments.length,
        });
      }
      
      return createdAppointments;
    } catch (err) {
      if (err.message === 'CONFLICT_DETECTED') {
        throw err;
      }
      console.error('Failed to create appointments:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Update an appointment (API only - database storage)
   */
  const updateAppointment = async (appointmentId, updates) => {
    try {
      setIsLoading(true);
      setError(null);

      // Transform updates to backend format
      const backendUpdates = mapFrontendAppointmentToBackend(updates);

      // Update via API
      const response = await updateAppointmentAPI(appointmentId, backendUpdates);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update appointment');
      }

      // Transform backend response to frontend format
      const updatedAppointment = mapBackendAppointmentToFrontend(response.data);
      
      // Update in state
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? updatedAppointment : apt))
      );
      
      if (import.meta.env.DEV) {
        console.log('[UPDATE_APPT] ✅ Updated appointment via API:', {
          appointmentId,
          updates,
        });
      }
      
      return updatedAppointment;
    } catch (err) {
      console.error('Failed to update appointment:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Delete an appointment (API only - database storage)
   */
  const deleteAppointment = async (appointmentId) => {
    try {
      setIsLoading(true);
      setError(null);

      // Delete via API
      const response = await deleteAppointmentAPI(appointmentId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete appointment');
      }

      // Remove from state
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
      
      if (import.meta.env.DEV) {
        console.log('[DELETE_APPT] ✅ Deleted appointment via API:', {
          appointmentId,
        });
      }
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Get conflict ref (for checking if there was a conflict)
   */
  const getHasConflict = () => hasConflictRef.current;
  
  /**
   * Reset conflict flag
   */
  const resetConflict = () => {
    hasConflictRef.current = false;
  };
  
  return {
    // State
    appointments,
    isLoading,
    error,
    
    // Actions
    loadAppointments,
    createAppointment,
    createAppointments,
    updateAppointment,
    deleteAppointment,
    
    // Conflict management
    getHasConflict,
    resetConflict,
    
    // Direct setter (for internal use, e.g., drag & drop)
    setAppointments,
  };
};

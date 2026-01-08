/**
 * Hook for managing appointments
 * Handles CRUD operations with localStorage only (no server sync)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { uuid } from '../../utils/calendar/constants';
import { formatDateLocal } from '../../utils/calendar/dateHelpers';
import { 
  loadAppointmentsFromStorage, 
  saveAppointmentsToStorage 
} from '../../services/calendar/storageService';
import { findBatchConflicts } from '../../utils/calendar/conflictDetection';

export const useAppointments = () => {
  // Load from localStorage on mount, or use empty array if no stored data
  const [appointments, setAppointments] = useState(() => {
    return loadAppointmentsFromStorage();
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasConflictRef = useRef(false); // Track if there was a conflict during appointment creation
  const abortControllerRef = useRef(null); // Track current request for cancellation
  
  // Persist appointments to localStorage whenever they change
  useEffect(() => {
    saveAppointmentsToStorage(appointments);
  }, [appointments]);
  
  /**
   * Load appointments from localStorage only (no server calls)
   * @param {Object} filters - Optional filters (start, end dates for date range) - ignored, kept for compatibility
   * @param {AbortSignal} signal - Optional abort signal - ignored, kept for compatibility
   */
  const loadAppointments = useCallback(async (filters = {}, signal = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load from localStorage only
      const localAppointments = loadAppointmentsFromStorage();
      
      // Filter by date range if provided
      let filteredAppointments = localAppointments;
      if (filters.start && filters.end) {
        filteredAppointments = localAppointments.filter(apt => {
          if (!apt.date) return false;
          return apt.date >= filters.start && apt.date <= filters.end;
        });
      }
      
      setAppointments(filteredAppointments);
      
      if (import.meta.env.DEV) {
        console.log('[LOAD_APPTS] ✅ Loaded from localStorage:', {
          totalCount: localAppointments.length,
          filteredCount: filteredAppointments.length,
          rangeRequested: filters.start && filters.end ? `${filters.start} to ${filters.end}` : 'all',
        });
      }
      
      return filteredAppointments;
    } catch (err) {
      console.error('Failed to load appointments from localStorage:', err);
      setError(err.message);
      const emptyAppointments = [];
      setAppointments(emptyAppointments);
      return emptyAppointments;
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty deps - function is stable
  
  /**
   * Create a single appointment (localStorage only, no server calls)
   */
  const createAppointment = async (appointmentData) => {
    try {
      // Create appointment locally only
      const newAppointment = {
        ...appointmentData,
        id: appointmentData.id || uuid(),
      };
      
      // Add to state
      setAppointments((prev) => {
        // Check if appointment already exists (avoid duplicates)
        const exists = prev.some(apt => apt.id === newAppointment.id);
        if (exists) {
          if (import.meta.env.DEV) {
            console.warn('[CREATE_APPT] ⚠️ Appointment already exists in state, skipping duplicate:', newAppointment.id);
          }
          return prev;
        }
        
        const updated = [...prev, newAppointment];
        if (import.meta.env.DEV) {
          console.log('[CREATE_APPT] ✅ Created appointment locally:', {
            previousCount: prev.length,
            newCount: updated.length,
            addedAppointment: {
              id: newAppointment.id,
              date: newAppointment.date,
              start: newAppointment.start,
              end: newAppointment.end,
              staff: newAppointment.staff,
              status: newAppointment.status,
            },
          });
        }
        return updated;
      });
      
      return newAppointment;
    } catch (err) {
      console.error('Failed to create appointment:', err);
      setError(err.message);
      throw err;
    }
  };
  
  /**
   * Create multiple appointments (for recurring appointments) - localStorage only
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
      // Create appointments locally only
      const newAppointments = appointmentsArray.map((apt) => ({
        ...apt,
        id: apt.id || uuid(),
      }));
      
      setAppointments((prev) => [...prev, ...newAppointments]);
      hasConflictRef.current = false;
      
      if (import.meta.env.DEV) {
        console.log('[CREATE_APPTS] ✅ Created appointments locally:', {
          count: newAppointments.length,
        });
      }
      
      return newAppointments;
    } catch (err) {
      if (err.message === 'CONFLICT_DETECTED') {
        throw err;
      }
      console.error('Failed to create appointments:', err);
      setError(err.message);
      throw err;
    }
  };
  
  /**
   * Update an appointment (localStorage only, no server calls)
   */
  const updateAppointment = async (appointmentId, updates) => {
    try {
      // Update locally only
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? { ...apt, ...updates } : apt))
      );
      
      const updatedAppointment = { id: appointmentId, ...updates };
      
      if (import.meta.env.DEV) {
        console.log('[UPDATE_APPT] ✅ Updated appointment locally:', {
          appointmentId,
          updates,
        });
      }
      
      return updatedAppointment;
    } catch (err) {
      console.error('Failed to update appointment:', err);
      setError(err.message);
      throw err;
    }
  };
  
  /**
   * Delete an appointment (localStorage only, no server calls)
   */
  const deleteAppointment = async (appointmentId) => {
    try {
      // Delete locally only
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
      
      if (import.meta.env.DEV) {
        console.log('[DELETE_APPT] ✅ Deleted appointment locally:', {
          appointmentId,
        });
      }
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      setError(err.message);
      throw err;
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


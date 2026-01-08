/**
 * Appointment service - API calls for appointments
 */

import apiClient from '../../config/apiClient.jsx';

/**
 * Map backend appointment format to frontend format
 * Backend format: { id, startDate (ISO), endDate (ISO), employeeId, employeeName, customerId, customerFullName, customerPhone, selectedServices, ... }
 * Frontend format: { id, date (YYYY-MM-DD), start (HH:MM), end (HH:MM), staff, staffName, clientId, client, serviceName, ... }
 */
export const mapBackendAppointmentToFrontend = (backendAppointment) => {
  if (!backendAppointment) {
    if (import.meta.env.DEV) {
      console.warn('[MAP_APPT] Null or undefined backendAppointment');
    }
    return null;
  }
  
  // Always create frontend appointment object, even if some fields are missing
  const frontendAppointment = {
    id: backendAppointment.id || null,
  };
  
  // Map date and time from startDate ISO string
  // IMPORTANT: Backend stores dates in UTC, but we need to display them in local time (Jerusalem)
  // When we parse an ISO string with new Date(), it converts UTC to local time automatically
  // So we extract the local time components (getHours(), getDate(), etc.)
  if (backendAppointment.startDate) {
    const startDate = new Date(backendAppointment.startDate);
    if (!isNaN(startDate.getTime())) {
      // Extract date as YYYY-MM-DD (using local time components)
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      frontendAppointment.date = `${year}-${month}-${day}`;
      
      // Extract start time as HH:MM (using local time components)
      const hours = String(startDate.getHours()).padStart(2, '0');
      const minutes = String(startDate.getMinutes()).padStart(2, '0');
      frontendAppointment.start = `${hours}:${minutes}`;
      
      // Store the Date object for range checking (optional, for debugging)
      if (import.meta.env.DEV) {
        frontendAppointment._startDateObj = startDate;
        frontendAppointment._startDateISO = backendAppointment.startDate;
        frontendAppointment._startDateLocal = startDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn('[MAP_APPT] ⚠️ Invalid startDate:', backendAppointment.startDate, 'for appointment:', backendAppointment.id);
      }
    }
  } else {
    if (import.meta.env.DEV) {
      console.warn('[MAP_APPT] ⚠️ Missing startDate for appointment:', backendAppointment.id);
    }
    // Appointment without startDate will still be included, but calendar may not render it
    // This is intentional - we don't want to filter out appointments, just log the issue
  }
  
  // Map end time from endDate ISO string
  if (backendAppointment.endDate) {
    const endDate = new Date(backendAppointment.endDate);
    if (!isNaN(endDate.getTime())) {
      const hours = String(endDate.getHours()).padStart(2, '0');
      const minutes = String(endDate.getMinutes()).padStart(2, '0');
      frontendAppointment.end = `${hours}:${minutes}`;
      
      // Store the Date object for range checking (optional, for debugging)
      if (import.meta.env.DEV) {
        frontendAppointment._endDateObj = endDate;
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn('[MAP_APPT] Invalid endDate:', backendAppointment.endDate, 'for appointment:', backendAppointment.id);
      }
    }
  }
  
  // Map staff/employee fields
  if (backendAppointment.employeeId !== undefined && backendAppointment.employeeId !== null) {
    frontendAppointment.staff = backendAppointment.employeeId;
    frontendAppointment.staffId = backendAppointment.employeeId;
  }
  
  if (backendAppointment.employeeName) {
    frontendAppointment.staffName = String(backendAppointment.employeeName);
  }
  
  // Map customer/client fields
  if (backendAppointment.customerId) {
    frontendAppointment.clientId = String(backendAppointment.customerId);
  }
  
  if (backendAppointment.customerFullName) {
    frontendAppointment.client = String(backendAppointment.customerFullName);
    frontendAppointment.clientName = String(backendAppointment.customerFullName);
  }
  
  if (backendAppointment.customerPhone) {
    frontendAppointment.customerPhone = String(backendAppointment.customerPhone);
  }
  
  // Map service fields
  if (backendAppointment.selectedServices) {
    frontendAppointment.serviceName = String(backendAppointment.selectedServices);
    // Create title from service and client name
    const clientName = frontendAppointment.client || 'לקוח';
    frontendAppointment.title = `${frontendAppointment.serviceName} – ${clientName}`;
  }
  
  // Map duration
  if (backendAppointment.duration) {
    frontendAppointment.duration = String(backendAppointment.duration);
  }
  
  // Map other fields
  if (backendAppointment.status) {
    frontendAppointment.status = String(backendAppointment.status);
  } else {
    frontendAppointment.status = "נקבע תור";
  }
  
  // Map color (default to brand color if not provided)
  if (backendAppointment.color) {
    frontendAppointment.color = backendAppointment.color;
  }
  
  return frontendAppointment;
};

/**
 * Get all appointments
 * @param {Object} filters - Optional filters (date range, staff, etc.)
 * @returns {Promise<Object>} - Response data
 */
export const getAppointments = async (filters = {}, signal = null) => {
  try {
    // Build full URL for logging
    const fullUrl = `${apiClient.defaults.baseURL}/appointments${Object.keys(filters).length > 0 ? '?' + new URLSearchParams(filters).toString() : ''}`;
    
    if (import.meta.env.DEV) {
      console.log('[API] GET /appointments', filters);
      console.log('[API] Full URL:', fullUrl);
      // Check if token exists
      const token = localStorage.getItem('token');
      console.log('[API] Authorization token present:', !!token && token !== 'undefined');
    }
    
    // Do NOT send custom headers - they trigger CORS preflight
    // Cache control is handled by backend response headers
    const response = await apiClient.get('/appointments', { 
      params: filters,
      signal: signal, // Support AbortController
    });
    
    // Log response details
    console.log('[FE_GET_APPTS]', {
      url: fullUrl,
      status: response.status,
      keys: response.data ? Object.keys(response.data) : [],
      dataKeys: response.data?.data ? Object.keys(response.data.data) : null,
      hasAppointments: !!response.data?.appointments,
      hasNestedData: !!response.data?.data?.appointments,
      isArray: Array.isArray(response.data),
      appointmentsLength: Array.isArray(response.data?.appointments) ? response.data.appointments.length : 
                          Array.isArray(response.data?.data?.appointments) ? response.data.data.appointments.length : 'N/A',
      sample: response.data?.appointments?.[0] || response.data?.data?.appointments?.[0] || response.data?.[0] || null,
    });
    
    // Handle 304 Not Modified defensively (shouldn't happen with no-store, but handle it)
    if (response.status === 304) {
      if (import.meta.env.DEV) {
        console.warn('[API] GET /appointments - Received 304, this should not happen with no-store headers');
      }
      // Return empty array if 304 (no body in 304 response)
      return {
        appointments: [],
        data: [],
      };
    }
    
    // Process response - if processing fails, return empty array instead of throwing
    try {
      // Pass range for debugging (filters will be passed from CalendarPage if needed)
      return processAppointmentsResponse(response, filters.start, filters.end, filters.renderFilters || {});
    } catch (processingError) {
      if (import.meta.env.DEV) {
        console.warn('[API] GET /appointments - Processing failed, returning empty array', processingError);
        console.error('[API] Processing error details:', processingError);
      }
      // Request succeeded (200) but processing failed - return empty array
      return {
        appointments: [],
        data: [],
      };
    }
  } catch (error) {
    // Ignore abort errors
    if (error.name === 'AbortError' || error.name === 'CanceledError' || signal?.aborted) {
      throw error;
    }
    
    // Enhanced error logging
    if (import.meta.env.DEV) {
      console.error('[API] GET /appointments - Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        hasResponse: !!error.response,
        hasRequest: !!error.request,
      });
    }
    
    console.error('❌ בעיה עם ה-server: שגיאה בטעינת תורים', error);
    console.error('Error in getAppointments:', error);
    if (error.response) {
      // Handle 304 in error response (axios might throw for 304)
      if (error.response.status === 304) {
        if (import.meta.env.DEV) {
          console.warn('[API] GET /appointments - Received 304 in error, returning empty');
        }
        // Return empty array for 304 (no body)
        return {
          appointments: [],
          data: [],
        };
      }
      throw new Error(error.response.data?.message || `Failed to get appointments (${error.response.status})`);
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

/**
 * Check if an appointment should be rendered in the calendar
 * @param {Object} appointment - Frontend appointment object
 * @param {string} rangeStartISO - Requested range start (ISO string)
 * @param {string} rangeEndISO - Requested range end (ISO string)
 * @param {Object} filters - Active filters (selectedStaff, selectedTeamMembers, etc.)
 * @returns {{shouldRender: boolean, reason?: string}} - Whether to render and reason if not
 */
const shouldRenderAppointment = (appointment, rangeStartISO, rangeEndISO, filters = {}) => {
  // Check if appointment exists
  if (!appointment || !appointment.id) {
    return { shouldRender: false, reason: 'missing_id' };
  }

  // Check for required date fields
  if (!appointment.date) {
    return { shouldRender: false, reason: 'missing_date' };
  }

  if (!appointment.start) {
    return { shouldRender: false, reason: 'missing_start' };
  }

  // Parse date and time
  let appointmentStartDate, appointmentEndDate;
  try {
    // Parse date (YYYY-MM-DD) + start time (HH:MM)
    const [year, month, day] = appointment.date.split('-').map(Number);
    const [startHours, startMinutes] = appointment.start.split(':').map(Number);
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(startHours) || isNaN(startMinutes)) {
      return { shouldRender: false, reason: 'invalid_date_parsing' };
    }

    // Create date in local timezone (Jerusalem)
    appointmentStartDate = new Date(year, month - 1, day, startHours, startMinutes, 0, 0);
    
    if (isNaN(appointmentStartDate.getTime())) {
      return { shouldRender: false, reason: 'invalid_start_date' };
    }

    // Parse end time if available
    if (appointment.end) {
      const [endHours, endMinutes] = appointment.end.split(':').map(Number);
      if (!isNaN(endHours) && !isNaN(endMinutes)) {
        appointmentEndDate = new Date(year, month - 1, day, endHours, endMinutes, 0, 0);
        if (isNaN(appointmentEndDate.getTime())) {
          return { shouldRender: false, reason: 'invalid_end_date' };
        }
      }
    } else {
      // If no end time, use start time + 30 minutes as default
      appointmentEndDate = new Date(appointmentStartDate);
      appointmentEndDate.setMinutes(appointmentEndDate.getMinutes() + 30);
    }
  } catch (error) {
    return { shouldRender: false, reason: `date_parsing_error: ${error.message}` };
  }

  // Check if end <= start
  if (appointmentEndDate <= appointmentStartDate) {
    return { shouldRender: false, reason: 'end_before_or_equal_start' };
  }

  // Check if appointment is within requested range
  const rangeStart = new Date(rangeStartISO);
  const rangeEnd = new Date(rangeEndISO);
  
  // Appointment is in range if it overlaps with the range at all
  // (appointment starts before range ends AND appointment ends after range starts)
  if (appointmentStartDate >= rangeEnd || appointmentEndDate <= rangeStart) {
    return { 
      shouldRender: false, 
      reason: `outside_range: appointment(${appointmentStartDate.toISOString()} - ${appointmentEndDate.toISOString()}) vs range(${rangeStartISO} - ${rangeEndISO})` 
    };
  }

  // Check status filter (cancelled appointments are filtered out)
  if (appointment.status === "בוטל") {
    return { shouldRender: false, reason: 'status_cancelled' };
  }

  // Check staff filter if active
  if (filters.selectedStaff) {
    if (filters.selectedStaff === "all-business") {
      // Show all
    } else if (filters.selectedStaff === "scheduled-team") {
      // This is checked at the list level, not individual appointment level
    } else if (filters.selectedStaff === "custom") {
      if (!filters.selectedTeamMembers || !filters.selectedTeamMembers.length) {
        return { shouldRender: false, reason: 'staff_filter_no_team_selected' };
      }
      if (!filters.selectedTeamMembers.includes(appointment.staff)) {
        return { shouldRender: false, reason: `staff_filter_not_in_team: ${appointment.staff}` };
      }
    } else {
      // Specific staff selected
      if (appointment.staff !== filters.selectedStaff) {
        return { shouldRender: false, reason: `staff_filter_mismatch: ${appointment.staff} !== ${filters.selectedStaff}` };
      }
    }
  }

  return { shouldRender: true };
};

/**
 * Process appointments response and map to frontend format
 * @param {Object} response - Axios response object
 * @param {string} rangeStartISO - Requested range start (ISO string) for debugging
 * @param {string} rangeEndISO - Requested range end (ISO string) for debugging
 * @param {Object} filters - Active filters for debugging
 */
const processAppointmentsResponse = (response, rangeStartISO = null, rangeEndISO = null, filters = {}) => {
  // Log raw response for debugging
  if (import.meta.env.DEV) {
    console.log('[GET_APPTS] status', response.status);
    console.log('[GET_APPTS] data', response.data);
  }
  
  // Map backend appointments to frontend format
  const backendData = response.data;
  
  // Backend returns: { success: true, message, data: { appointments: [...], pagination: {...} } }
  // Extract appointments array - ENHANCED logging
  let items = [];
  
  if (import.meta.env.DEV) {
    console.log('[GET_APPTS] 🔍 Extracting appointments from response:', {
      backendDataType: typeof backendData,
      isArray: Array.isArray(backendData),
      hasData: !!backendData?.data,
      hasDataAppointments: !!backendData?.data?.appointments,
      hasAppointments: !!backendData?.appointments,
      dataIsArray: Array.isArray(backendData?.data),
      keys: backendData ? Object.keys(backendData) : [],
      dataKeys: backendData?.data ? Object.keys(backendData.data) : [],
    });
  }
  
  // Safely extract the appointments array with multiple fallbacks
  if (Array.isArray(backendData)) {
    items = backendData;
  } else if (Array.isArray(backendData?.data?.appointments)) {
    // Backend successResponse format: { success: true, message, data: { appointments: [...], pagination: {...} } }
    items = backendData.data.appointments;
  } else if (Array.isArray(backendData?.appointments)) {
    items = backendData.appointments;
  } else if (Array.isArray(backendData?.data)) {
    items = backendData.data;
  } else {
    items = [];
  }
  
  if (import.meta.env.DEV) {
    console.log('[GET_APPTS] ✅ Extracted items:', {
      itemsLength: items.length,
      extractionPath: Array.isArray(backendData) 
        ? 'direct array'
        : Array.isArray(backendData?.data?.appointments)
          ? 'backendData.data.appointments'
          : Array.isArray(backendData?.appointments)
            ? 'backendData.appointments'
            : Array.isArray(backendData?.data)
              ? 'backendData.data'
              : 'empty array',
    });
  }
  
  // If items is not an array, log warning and return empty array
  if (!Array.isArray(items)) {
    if (import.meta.env.DEV) {
      console.warn('[GET_APPTS] Response does not contain a valid appointments array. Got:', typeof items, items);
    }
    return {
      appointments: [],
      data: [],
    };
  }
  
  // DEV: Log raw backend appointments
  if (import.meta.env.DEV && rangeStartISO && rangeEndISO) {
    console.group('🔍 [DEBUG] Appointment Processing');
    console.log('📅 Requested Range:', {
      startISO: rangeStartISO,
      endISO: rangeEndISO,
      startLocal: new Date(rangeStartISO).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
      endLocal: new Date(rangeEndISO).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
    });
    console.log('📦 Raw Backend Appointments:', {
      count: items.length,
      first10: items.slice(0, 10).map(item => ({
        id: item.id,
        startDate: item.startDate,
        endDate: item.endDate,
        employeeId: item.employeeId,
        employeeName: item.employeeName,
      })),
    });
  }

  // Map each appointment with error handling per item
  const mappedAppointments = items
    .map((item) => {
      try {
        const mapped = mapBackendAppointmentToFrontend(item);
        return mapped;
      } catch (error) {
        console.warn('[MAP_APPT] skipped invalid item', item, error);
        return null; // Skip malformed items
      }
    })
    .filter(Boolean); // Remove null values

  // Log mapped appointments
  console.log('[FE_MAPPED_APPTS]', {
    count: mappedAppointments.length,
    sample: mappedAppointments[0] ? {
      id: mappedAppointments[0].id,
      date: mappedAppointments[0].date,
      start: mappedAppointments[0].start,
      end: mappedAppointments[0].end,
      staff: mappedAppointments[0].staff,
      status: mappedAppointments[0].status,
    } : null,
  });

  // DEV: Debug rendering eligibility
  if (import.meta.env.DEV && rangeStartISO && rangeEndISO) {
    console.log('🔄 Mapped Appointments:', {
      count: mappedAppointments.length,
      first10: mappedAppointments.slice(0, 10).map(apt => ({
        id: apt.id,
        date: apt.date,
        start: apt.start,
        end: apt.end,
        staff: apt.staff,
        status: apt.status,
      })),
    });

    // Check renderability for each appointment
    const renderabilityResults = mappedAppointments.map(apt => {
      const result = shouldRenderAppointment(apt, rangeStartISO, rangeEndISO, filters);
      return { appointment: apt, ...result };
    });

    const renderable = renderabilityResults.filter(r => r.shouldRender);
    const skipped = renderabilityResults.filter(r => !r.shouldRender);

    // Group skipped by reason
    const skipReasons = {};
    skipped.forEach(({ appointment, reason }) => {
      if (!skipReasons[reason]) {
        skipReasons[reason] = [];
      }
      if (skipReasons[reason].length < 3) {
        skipReasons[reason].push({
          id: appointment.id,
          date: appointment.date,
          start: appointment.start,
          end: appointment.end,
          startDate: appointment.startDate,
          endDate: appointment.endDate,
        });
      }
    });

    // Log summary table
    console.table({
      'Total from Server': items.length,
      'Total Mapped': mappedAppointments.length,
      'Total Renderable': renderable.length,
      'Total Skipped': skipped.length,
    });

    // Log skip reasons
    if (skipped.length > 0) {
      console.group('❌ Skipped Appointments by Reason');
      Object.entries(skipReasons).forEach(([reason, examples]) => {
        console.log(`\n${reason}: ${skipped.filter(s => s.reason === reason).length} items`);
        console.table(examples);
      });
      console.groupEnd();
    }

    // Log renderable appointments
    if (renderable.length > 0) {
      console.log('✅ Renderable Appointments:', {
        count: renderable.length,
        first10: renderable.slice(0, 10).map(r => ({
          id: r.appointment.id,
          date: r.appointment.date,
          start: r.appointment.start,
          end: r.appointment.end,
        })),
      });
    }

    console.groupEnd();
  }
  
  if (import.meta.env.DEV) {
    console.log(`[API] GET /appointments - received ${items.length} items, mapped ${mappedAppointments.length} appointments`);
  }
  
  return {
    ...backendData,
    appointments: mappedAppointments,
    data: mappedAppointments,
  };
};

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data (frontend format)
 * @returns {Promise<Object>} - Created appointment
 */
export const createAppointment = async (appointmentData) => {
  try {
    // Map frontend format to backend format
    const backendPayload = mapFrontendAppointmentToBackend(appointmentData);
    
    if (import.meta.env.DEV) {
      console.log("[API] POST /appointments", backendPayload);
    }
    
    const response = await apiClient.post('/appointments', backendPayload);
    
    // Backend returns { success: true, message, data: appointment }
    // Return the full response so hook can extract and map it
    if (import.meta.env.DEV) {
      console.log('[API] POST /appointments response:', {
        success: response.data?.success,
        hasData: !!response.data?.data,
        appointmentId: response.data?.data?.id,
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ בעיה עם ה-server: שגיאה ביצירת תור', error);
    console.error('Error in createAppointment:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to create appointment');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

/**
 * Check if a value is a Prisma CUID
 * Prisma CUIDs start with "c" and are typically 25 characters long
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is a Prisma CUID
 */
const isPrismaCuid = (value) => {
  if (typeof value !== 'string') return false;
  // Prisma CUIDs start with "c" and are typically 25 characters long (minimum ~20)
  return value.startsWith('c') && value.length >= 20;
};

/**
 * Normalize Israeli phone number
 * - Strip spaces/symbols
 * - If starts with 0 → convert to +972
 * - If starts with 972 → prefix with +
 * @param {string} phone - Phone number to normalize
 * @returns {string|null} - Normalized phone or null if invalid
 */
const normalizeILPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  
  // Strip all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // If empty after stripping, return null
  if (!normalized) return null;
  
  // If starts with 0, convert to +972
  if (normalized.startsWith('0')) {
    normalized = '+972' + normalized.substring(1);
  }
  // If starts with 972 but not +972, add +
  else if (normalized.startsWith('972') && !normalized.startsWith('+972')) {
    normalized = '+' + normalized;
  }
  // If doesn't start with +, add it (assuming it's a valid number)
  else if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  return normalized || null;
};

/**
 * Map frontend appointment format to backend format
 * Frontend format: { date, start, end, staff, staffName, clientId, client, serviceId, serviceName, ... }
 * Backend format: { startDate (ISO), endDate (ISO), duration, employeeId, employeeName, customerId, customerFullName, ... }
 */
const mapFrontendAppointmentToBackend = (frontendData) => {
  const backendPayload = {};
  
  // Map startDate: combine date + start time into ISO datetime string
  // Use local Date constructor to avoid timezone shifts
  if (frontendData.date && frontendData.start) {
    let year, monthIndex, day;
    
    // Extract year, month, day from date (supports Date object or "YYYY-MM-DD" string)
    if (frontendData.date instanceof Date) {
      year = frontendData.date.getFullYear();
      monthIndex = frontendData.date.getMonth();
      day = frontendData.date.getDate();
    } else if (typeof frontendData.date === 'string') {
      // Parse "YYYY-MM-DD" format
      const dateParts = frontendData.date.split('-');
      if (dateParts.length === 3) {
        year = parseInt(dateParts[0], 10);
        monthIndex = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
        day = parseInt(dateParts[2], 10);
      } else {
        // Fallback: try to parse as Date and extract
        const tempDate = new Date(frontendData.date);
        year = tempDate.getFullYear();
        monthIndex = tempDate.getMonth();
        day = tempDate.getDate();
      }
    }
    
    // Extract hours, minutes from time string "HH:MM"
    const [hours, minutes] = frontendData.start.split(':').map(Number);
    
    // Create date using local Date constructor to avoid timezone shifts
    if (!isNaN(year) && !isNaN(monthIndex) && !isNaN(day) && !isNaN(hours) && !isNaN(minutes)) {
      const startDate = new Date(year, monthIndex, day, hours, minutes || 0, 0, 0);
      backendPayload.startDate = startDate.toISOString();
    }
  } else if (frontendData.startDate) {
    // If startDate is already provided as ISO string, use it directly
    backendPayload.startDate = frontendData.startDate instanceof Date 
      ? frontendData.startDate.toISOString()
      : frontendData.startDate;
  }
  
  // Map endDate: combine date + end time into ISO datetime string
  // Use local Date constructor to avoid timezone shifts
  if (frontendData.date && frontendData.end) {
    let year, monthIndex, day;
    
    // Extract year, month, day from date (supports Date object or "YYYY-MM-DD" string)
    if (frontendData.date instanceof Date) {
      year = frontendData.date.getFullYear();
      monthIndex = frontendData.date.getMonth();
      day = frontendData.date.getDate();
    } else if (typeof frontendData.date === 'string') {
      // Parse "YYYY-MM-DD" format
      const dateParts = frontendData.date.split('-');
      if (dateParts.length === 3) {
        year = parseInt(dateParts[0], 10);
        monthIndex = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
        day = parseInt(dateParts[2], 10);
      } else {
        // Fallback: try to parse as Date and extract
        const tempDate = new Date(frontendData.date);
        year = tempDate.getFullYear();
        monthIndex = tempDate.getMonth();
        day = tempDate.getDate();
      }
    }
    
    // Extract hours, minutes from time string "HH:MM"
    const [hours, minutes] = frontendData.end.split(':').map(Number);
    
    // Create date using local Date constructor to avoid timezone shifts
    if (!isNaN(year) && !isNaN(monthIndex) && !isNaN(day) && !isNaN(hours) && !isNaN(minutes)) {
      const endDate = new Date(year, monthIndex, day, hours, minutes || 0, 0, 0);
      backendPayload.endDate = endDate.toISOString();
      
      if (import.meta.env.DEV) {
        console.log('[MAP_TO_BACKEND] 📅 endDate conversion:', {
          input: { date: frontendData.date, end: frontendData.end },
          localDate: endDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
          isoString: endDate.toISOString(),
          utcDate: new Date(endDate.toISOString()).toLocaleString('he-IL', { timeZone: 'UTC' }),
        });
      }
      
      if (import.meta.env.DEV) {
        console.log('[MAP_TO_BACKEND] 📅 endDate conversion:', {
          input: { date: frontendData.date, end: frontendData.end },
          localDate: endDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
          isoString: endDate.toISOString(),
          utcDate: new Date(endDate.toISOString()).toLocaleString('he-IL', { timeZone: 'UTC' }),
        });
      }
    }
  } else if (frontendData.endDate) {
    // If endDate is already provided as ISO string, use it directly
    backendPayload.endDate = frontendData.endDate instanceof Date 
      ? frontendData.endDate.toISOString()
      : frontendData.endDate;
  }
  
  // Map duration (if provided as number of minutes, convert to string)
  if (frontendData.duration !== undefined && frontendData.duration !== null) {
    backendPayload.duration = String(frontendData.duration);
  }
  
  // Map employeeId: staff or staffId -> employeeId
  // Only send if it's a valid INT4 (not a timestamp)
  const MAX_INT4 = 2147483647;
  const MIN_INT4 = -2147483648;
  
  const validateEmployeeId = (value) => {
    if (value === undefined || value === null) return null;
    
    const parsed = typeof value === 'number' ? value : parseInt(value);
    
    // Check if it's NaN
    if (isNaN(parsed)) {
      console.warn('[APPOINTMENT] Invalid employeeId: not a number', value);
      return null;
    }
    
    // Check if it's within INT4 range
    if (parsed > MAX_INT4 || parsed < MIN_INT4) {
      console.warn('[APPOINTMENT] Invalid employeeId: out of INT4 range', parsed);
      return null;
    }
    
    // Check if it looks like a timestamp (values > 1e12 are likely timestamps in milliseconds)
    if (parsed > 1000000000000) {
      console.warn('[APPOINTMENT] Invalid employeeId: looks like a timestamp', parsed);
      return null;
    }
    
    return parsed;
  };
  
  // Try to get employeeId from staffId or staff
  const employeeIdValue = frontendData.staffId !== undefined && frontendData.staffId !== null
    ? frontendData.staffId
    : (frontendData.staff !== undefined && frontendData.staff !== null ? frontendData.staff : null);
  
  const validatedEmployeeId = validateEmployeeId(employeeIdValue);
  if (validatedEmployeeId !== null) {
    backendPayload.employeeId = validatedEmployeeId;
  }
  // If invalid, omit employeeId and only send employeeName (if available)
  
  // Map employeeName: staffName -> employeeName
  if (frontendData.staffName !== undefined && frontendData.staffName !== null) {
    backendPayload.employeeName = String(frontendData.staffName);
  }
  
  // Map customer data with CUID validation
  // Extract possible customerId values from multiple sources
  const customerId = 
    frontendData.customerId || 
    frontendData.clientId || 
    frontendData.client?.id || 
    frontendData.customer?.id;
  
  // Extract customer name from multiple sources
  const customerName = 
    frontendData.client?.name || 
    frontendData.client || 
    frontendData.customerFullName || 
    frontendData.customer?.name;
  
  // Extract customer phone from multiple sources
  const customerPhone = 
    frontendData.client?.phone || 
    frontendData.customerPhone || 
    frontendData.customer?.phone;
  
  // Only send customerId if it's a real Prisma CUID
  if (customerId && isPrismaCuid(customerId)) {
    backendPayload.customerId = customerId;
  } else {
    // DO NOT send customerId if it's not a real CUID
    // Instead, send customerPhone + customerFullName for backend to link or create
    
    // Normalize and set phone
    if (customerPhone) {
      const normalizedPhone = normalizeILPhone(customerPhone);
      if (normalizedPhone) {
        backendPayload.customerPhone = normalizedPhone;
      }
    }
    
    // Set customer full name
    if (customerName) {
      backendPayload.customerFullName = String(customerName);
    }
  }
  
  // Map selectedServices: serviceName -> selectedServices
  if (frontendData.serviceName !== undefined && frontendData.serviceName !== null) {
    backendPayload.selectedServices = String(frontendData.serviceName);
  } else if (frontendData.selectedServices !== undefined && frontendData.selectedServices !== null) {
    backendPayload.selectedServices = String(frontendData.selectedServices);
  }
  
  // DO NOT send businessId or businessName - these are server-owned fields
  // Backend will set them from the authenticated user's data
  
  return backendPayload;
};

/**
 * Create multiple appointments in batch (for recurring appointments)
 * @param {Object[]} appointmentsArray - Array of appointment objects (frontend format)
 * @returns {Promise<Object>} - Response data
 */
export const createAppointmentsBatch = async (appointmentsArray) => {
  try {
    // Map each appointment from frontend format to backend format
    const backendAppointments = appointmentsArray.map(mapFrontendAppointmentToBackend);
    
    const response = await apiClient.post('/appointments/batch', { appointments: backendAppointments });
    
    // Debug log in development
    if (import.meta.env.DEV && response.data?.data) {
      const createdIds = Array.isArray(response.data.data) 
        ? response.data.data.map(apt => apt.id).filter(Boolean)
        : [];
      if (createdIds.length > 0) {
        console.log('Appointments created on server', createdIds);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ בעיה עם ה-server: שגיאה ביצירת תורים מרובים', error);
    console.error('Error in createAppointmentsBatch:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create appointments');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

/**
 * Update an existing appointment
 * @param {string} appointmentId - Appointment ID
 * @param {Object} appointmentData - Updated appointment data (frontend format)
 * @returns {Promise<Object>} - Updated appointment (backend format, will be mapped in hook)
 */
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    // Map frontend format to backend format (reuse the same mapping logic as create)
    const backendPayload = mapFrontendAppointmentToBackend(appointmentData);
    
    if (import.meta.env.DEV) {
      console.log(`[API] PATCH /appointments/${appointmentId}`, backendPayload);
    }
    
    const response = await apiClient.patch(`/appointments/${appointmentId}`, backendPayload);
    
    // Backend returns { success: true, message, data: appointment }
    // Return the response data structure (hook will map it)
    if (import.meta.env.DEV && response.data?.data?.id) {
      console.log('Appointment updated on server', response.data.data.id);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ בעיה עם ה-server: שגיאה בעדכון תור', error);
    console.error('Error in updateAppointment:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update appointment');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

/**
 * Delete an appointment
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await apiClient.delete(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error('❌ בעיה עם ה-server: שגיאה במחיקת תור', error);
    console.error('Error in deleteAppointment:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete appointment');
    } else if (error.request) {
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};


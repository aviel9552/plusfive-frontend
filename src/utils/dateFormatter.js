/**
 * Formats a date to "DD MMM YYYY" format (e.g., "29 Aug 2025")
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string or 'N/A' if date is invalid
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'N/A';
        return dateObj.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Formats a time to "HH:MM AM/PM" format
 * @param {string|Date} date - The date to extract time from
 * @returns {string} Formatted time string or empty string if date is invalid
 */
export const formatTime = (date) => {
    if (!date) return '';
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        return dateObj.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });
    } catch (error) {
        return '';
    }
};

/**
 * Formats a date and time together (e.g., "29 Aug 2025 at 03:40 PM")
 * @param {string|Date} date - The date to format
 * @param {boolean} includeTime - Whether to include time in the output
 * @returns {string} Formatted date and time string or 'N/A' if date is invalid
 */
export const formatDateTime = (date, includeTime = true) => {
    if (!date) return 'N/A';
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'N/A';
        
        const formattedDate = formatDate(date);
        if (!includeTime) return formattedDate;
        
        const formattedTime = formatTime(date);
        return formattedTime ? `${formattedDate} at ${formattedTime}` : formattedDate;
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Formats a date range (e.g., "29 Aug 2025 03:40 PM - 05:00 PM")
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (startDate, endDate) => {
    const startTime = formatTime(startDate);
    const endTime = formatTime(endDate);
    return `${startTime} - ${endTime}`;
};


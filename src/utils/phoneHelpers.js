/**
 * Phone number utility functions
 * Handles conversion between display format (without +972) and storage format (with +972)
 */

/**
 * Converts a phone number to Israeli format with +972 prefix for backend storage
 * @param {string} phone - Phone number (can be with or without +972)
 * @returns {string} - Phone number in format +972XXXXXXXXX
 */
export const formatPhoneForBackend = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If already starts with 972, return with +
  if (digits.startsWith('972')) {
    return `+${digits}`;
  }
  
  // If starts with 0, replace with 972
  if (digits.startsWith('0')) {
    return `+972${digits.slice(1)}`;
  }
  
  // If it's 9 digits (without leading 0), add 972
  if (digits.length === 9) {
    return `+972${digits}`;
  }
  
  // If it's 10 digits (with leading 0), replace 0 with 972
  if (digits.length === 10) {
    return `+972${digits.slice(1)}`;
  }
  
  // If it's already in +972 format, return as is
  if (phone.startsWith('+972')) {
    return phone;
  }
  
  // Default: assume it's a 10-digit number starting with 0
  if (digits.length > 0) {
    return `+972${digits.slice(1)}`;
  }
  
  return phone;
};

/**
 * Converts a phone number from backend format (+972) to display format (without +972)
 * @param {string} phone - Phone number from backend (with +972)
 * @returns {string} - Phone number in display format (0XXXXXXXXX)
 */
export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 972, replace with 0
  if (digits.startsWith('972')) {
    return `0${digits.slice(3)}`;
  }
  
  // If already starts with 0, return as is
  if (digits.startsWith('0')) {
    return digits;
  }
  
  // If it's 9 digits, add 0 at the beginning
  if (digits.length === 9) {
    return `0${digits}`;
  }
  
  // If it's 10 digits, return as is
  if (digits.length === 10) {
    return digits;
  }
  
  // Default: return as is
  return phone;
};

/**
 * Formats phone number for WhatsApp URL (removes + and keeps country code)
 * @param {string} phone - Phone number
 * @returns {string} - Phone number for WhatsApp (972XXXXXXXXX)
 */
export const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 972, return as is
  if (digits.startsWith('972')) {
    return digits;
  }
  
  // If starts with 0, replace with 972
  if (digits.startsWith('0')) {
    return `972${digits.slice(1)}`;
  }
  
  // If it's 9 digits, add 972
  if (digits.length === 9) {
    return `972${digits}`;
  }
  
  // If it's 10 digits, replace 0 with 972
  if (digits.length === 10) {
    return `972${digits.slice(1)}`;
  }
  
  return digits;
};

/**
 * Formats phone number to WhatsApp URL
 * @param {string} phone - Phone number (can be in any format)
 * @returns {string} - WhatsApp URL in format https://wa.me/972XXXXXXXXX
 */
export const formatPhoneToWhatsapp = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  let whatsappNumber = '';
  
  // If starts with 972, use as is
  if (digits.startsWith('972')) {
    whatsappNumber = digits;
  }
  // If starts with 0, remove 0 and add 972
  else if (digits.startsWith('0')) {
    whatsappNumber = `972${digits.slice(1)}`;
  }
  // If it's 9 digits (without leading 0), add 972
  else if (digits.length === 9) {
    whatsappNumber = `972${digits}`;
  }
  // If it's 10 digits (with leading 0), replace 0 with 972
  else if (digits.length === 10) {
    whatsappNumber = `972${digits.slice(1)}`;
  }
  // Default: assume it's a 10-digit number starting with 0
  else if (digits.length > 0) {
    whatsappNumber = `972${digits.slice(1)}`;
  }
  
  // Return WhatsApp URL
  return `https://wa.me/${whatsappNumber}`;
};


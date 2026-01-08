import enTranslations from '../i18/en.json';
import heTranslations from '../i18/he.json';

// Centralized translation utility
export const getTranslations = (language) => {
  return language === 'he' ? heTranslations : enTranslations;
};

// Helper function to get specific sections
export const getTranslationSection = (language, section) => {
  const translations = getTranslations(language);
  return translations[section] || {};
};

// Common translation patterns
export const getAuthTranslations = (language) => {
  return getTranslationSection(language, 'auth');
};

export const getValidationTranslations = (language) => {
  return getTranslationSection(language, 'validation');
};

export const getLayoutTranslations = (language) => {
  return getTranslationSection(language, 'layout');
};

export const getAdminTranslations = (language) => {
  return getTranslationSection(language, 'admin');
};

export const getAdminUserTranslations = (language) => {
  return getTranslationSection(language, 'adminUser');
};

export const getAdminAnalyticsTranslations = (language) => {
  return getTranslationSection(language, 'adminAnalytics');
};

export const getAccountSettingTranslations = (language) => {
  return getTranslationSection(language, 'accountSetting');
};

export const getAdminQRTranslations = (language) => {
  return getTranslationSection(language, 'adminQR');
};

export const getUserSupportTranslations = (language) => {
  return getTranslationSection(language, 'userSupport');
};

export const getAdminReferralTranslations = (language) => {
  return getTranslationSection(language, 'adminReferral');
};

export const getUserCardTranslations = (language) => {
  return getTranslationSection(language, 'userCard');
};

export const getReferralPageTranslations = (language) => {
  return getTranslationSection(language, 'referralPage');
};

export const getUserCustomerTranslations = (language) => {
  return getTranslationSection(language, 'userCustomer');
}; 

export const getMonthsTranslations = (language) => {
  return getTranslationSection(language, 'monthTranslations');
};

export const getDaysTranslations = (language) => {
  return getTranslationSection(language, 'dayTranslations');
};

export const getStatusTranslations = (language) => {
  return getTranslationSection(language, 'statusTranslations');
}; 

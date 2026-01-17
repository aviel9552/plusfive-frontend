// Application Constants
// Centralized constants for the application

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  CUSTOMER: 'customer'
};

// Status Values
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  DELETED: 'deleted'
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  CANCELED: 'canceled',
  EXPIRED: 'expired'
};

// Customer Status
export const CUSTOMER_STATUS = {
  NEW: 'new',
  ACTIVE: 'active',
  AT_RISK: 'at_risk',
  RISK: 'risk',
  LOST: 'lost',
  RECOVERED: 'recovered'
};

// Webhook Types
export const WEBHOOK_TYPES = {
  APPOINTMENT: 'appointment',
  PAYMENT_CHECKOUT: 'payment_checkout',
  RATING: 'rating'
};

// Webhook Status
export const WEBHOOK_STATUS = {
  PENDING: 'pending',
  PROCESSED: 'processed',
  FAILED: 'failed'
};

// Review Status
export const REVIEW_STATUS = {
  SENT: 'sent',
  RECEIVED: 'received',
  PROCESSED: 'processed',
  RESPONDED: 'responded'
};

// Support Ticket Status
export const SUPPORT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// Support Ticket Priority
export const SUPPORT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Payment Status
export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  PENDING: 'pending'
};

// Default export with all constants grouped
const constants = {
  ROLES,
  STATUS,
  SUBSCRIPTION_STATUS,
  CUSTOMER_STATUS,
  WEBHOOK_TYPES,
  WEBHOOK_STATUS,
  REVIEW_STATUS,
  SUPPORT_STATUS,
  SUPPORT_PRIORITY,
  PAYMENT_STATUS
};

export default constants;
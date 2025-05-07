// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://client-tracker-back.onrender.com/api';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Client statuses
export const CLIENT_STATUSES = {
  SCHEDULED: 'scheduled',
  SETTLED: 'settled',
  OUTSTANDING: 'outstanding',
  DEFERRED: 'deferred',
  ABANDONED: 'abandoned',
  COMPLETED: 'completed',
};

// Payment statuses
export const PAYMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  SETTLED: 'settled',
  OUTSTANDING: 'outstanding',
  DEFERRED: 'deferred',
  ABANDONED: 'abandoned',
  COMPLETED: 'completed',
}; 
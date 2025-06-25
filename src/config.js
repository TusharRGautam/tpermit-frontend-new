// Application configuration

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 
            (window.location.origin.includes('localhost') ? 
            'http://localhost:5000/api' : 
            `${window.location.origin}/api`),
  TIMEOUT: 10000, // 10 seconds
};

// Feature flags
export const FEATURES = {
  ENABLE_QUOTATION: true,
  ENABLE_INVOICE: true,
};

// Create a named export object
const config = {
  API_CONFIG,
  FEATURES,
};

export default config; 
// Application configuration

// API configuration
export const API_CONFIG = {
  // Production configuration with api.gautammotors.in domain
  BASE_URL: process.env.REACT_APP_API_BASE_URL ||
            (window.location.origin.includes('localhost') ?
            'http://localhost:5001/api' :
            'https://api.gautammotors.in/api'),
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
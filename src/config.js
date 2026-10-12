// Dynamic API configuration: localhost -> 5001, production -> api.gautammotors.in
const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]'
);

export const API_CONFIG = {
  BASE_URL: isLocal ? 'http://localhost:5001/api' : 'https://api.gautammotors.in/api',
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
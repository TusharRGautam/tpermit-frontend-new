// Application configuration

// API configuration -- For Loca
// export const API_CONFIG = {
//   // Production configuration with api.gautammotors.in domain
//   BASE_URL: 'http://localhost:5001/api',
//   TIMEOUT: 10000, // 10 seconds
// };

// API configuration -- For Production
export const API_CONFIG = {
  // Production configuration with api.gautammotors.in domain
  BASE_URL: 'https://api.gautammotors.in/api',
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
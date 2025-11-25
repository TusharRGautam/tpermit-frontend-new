// quotationService.js
import axios from 'axios';
import { API_CONFIG } from '../config';

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
});

// Log configuration for debugging
console.log('Quotation Service API Configuration:', {
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT
});

// Add request interceptor for logging and authentication
apiClient.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('Request Data:', config.data);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
apiClient.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    console.log('Response Data:', response.data);
    return response;
  },
  error => {
    // Enhanced error handling
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`API Error Response: ${status} ${error.response.statusText}`);
      console.error('Error Data:', data);
      
      // Extract meaningful error message
      if (data && data.error) {
        errorMessage = data.error;
      } else if (data && data.message) {
        errorMessage = data.message;
      } else {
        errorMessage = `Server error: ${status}`;
      }
    } else if (error.request) {
      // Network error - no response received
      console.error('API Error: No response received', error.request);
      errorMessage = 'Network error: Unable to connect to server. Please check if the backend server is running.';
    } else {
      // Request setup error
      console.error('API Error:', error.message);
      errorMessage = error.message;
    }
    
    // Attach enhanced error message
    error.userMessage = errorMessage;
    return Promise.reject(error);
  }
);

const quotationService = {
  /**
   * Check if the backend server is running
   * @returns {Promise<boolean>} - True if the server is running
   */
  checkServerStatus: async () => {
    try {
      // Try to connect to the root endpoint of the API
      const response = await axios.get(API_CONFIG.BASE_URL.replace('/api', '/health'), {
        timeout: 5000
      });
      console.log('Backend server status check:', response.status, response.statusText);
      return true;
    } catch (error) {
      // Try alternative health check
      try {
        const response = await axios.get(API_CONFIG.BASE_URL.replace('/api', ''), {
          timeout: 5000
        });
        console.log('Backend server status check (alternative):', response.status, response.statusText);
        return true;
      } catch (altError) {
        console.error('Backend server is not reachable:', error.message);
        return false;
      }
    }
  },

  /**
   * Validate quotation data before sending to server
   * @param {Object} quotationData - The quotation data to validate
   * @returns {Object} - Validation result with isValid boolean and errors array
   */
  validateQuotationData: (quotationData) => {
    const errors = [];
    
    // Required fields validation
    if (!quotationData.vendor_id) {
      errors.push('Vendor ID is required');
    }
    
    if (!quotationData.car_model) {
      errors.push('Car model is required');
    }
    
    if (!quotationData.model_variant) {
      errors.push('Model variant is required');
    }
    
    if (!quotationData.ex_showroom || quotationData.ex_showroom <= 0) {
      errors.push('Ex-showroom price must be greater than 0');
    }
    
    // At least one bank rate should be provided
    const bankRates = [
      quotationData.sbi_bank,
      quotationData.union_bank,
      quotationData.mahindra_finance,
      quotationData.cholamandalam_bank,
      quotationData.au_bank
    ];

    if (!bankRates.some(rate => rate && rate > 0)) {
      errors.push('At least one bank interest rate is required');
    }

    // Numeric field validation
    const numericFields = [
      'roi_emi_interest', 'sbi_bank', 'union_bank', 'mahindra_finance', 'cholamandalam_bank', 'au_bank',
      'ex_showroom', 'tcs', 'registration', 'insurance', 'on_the_road',
      'loan_amount', 'down_payment', 'final_down_payment', 'monthly_emi'
    ];
    
    numericFields.forEach(field => {
      if (quotationData[field] !== undefined && quotationData[field] !== null && quotationData[field] !== '') {
        if (isNaN(quotationData[field]) || quotationData[field] < 0) {
          errors.push(`${field.replace(/_/g, ' ')} must be a valid positive number`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Create a new quotation with enhanced validation and error handling
   * @param {Object} quotationData - The quotation data
   * @returns {Promise<Object>} - The created quotation
   */
  createQuotation: async (quotationData) => {
    try {
      // Validate data before sending
      const validation = quotationService.validateQuotationData(quotationData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      console.log('Creating quotation with validated data:', quotationData);
      
      const response = await apiClient.post('/quotations', quotationData);
      
      if (response.data) {
        console.log('Quotation created successfully:', response.data);
        
        // Automatically fetch the full quotation data to ensure consistency
        try {
          const fullQuotation = await quotationService.getQuotationByVendor(response.data.vendor_id);
          return fullQuotation;
        } catch (fetchError) {
          console.warn('Could not fetch full quotation data, returning creation response:', fetchError);
          return response.data;
        }
      }
      
      throw new Error('No data returned from server');
    } catch (error) {
      console.error('Error creating quotation:', error);
      
      // Provide user-friendly error message
      if (error.userMessage) {
        throw new Error(error.userMessage);
      } else if (error.message.includes('Validation failed')) {
        throw error; // Pass validation errors as-is
      } else {
        throw new Error('Failed to create quotation. Please check your data and try again.');
      }
    }
  },

  /**
   * Get a quotation by vendor ID with enhanced error handling
   * @param {string} vendorId - The vendor ID
   * @returns {Promise<Object>} - The quotation data
   */
  getQuotationByVendor: async (vendorId) => {
    try {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }
      
      console.log(`Fetching quotation for vendor ID: ${vendorId}`);
      const response = await apiClient.get(`/quotations/${vendorId}`);
      
      if (response.data) {
        console.log('Quotation fetched successfully:', response.data);
        return response.data;
      }
      
      throw new Error('No quotation data found');
    } catch (error) {
      console.error(`Error getting quotation for vendor ${vendorId}:`, error);
      
      if (error.response && error.response.status === 404) {
        throw new Error(`Quotation with vendor ID "${vendorId}" not found`);
      } else if (error.userMessage) {
        throw new Error(error.userMessage);
      } else {
        throw new Error(`Failed to fetch quotation for vendor ID "${vendorId}"`);
      }
    }
  },

  /**
   * Get all quotations with pagination support
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Promise<Array>} - Array of quotation objects
   */
  getAllQuotations: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit);
      if (options.offset) params.append('offset', options.offset);
      if (options.orderBy) params.append('orderBy', options.orderBy);
      
      const queryString = params.toString();
      const url = queryString ? `/quotations?${queryString}` : '/quotations';
      
      const response = await apiClient.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Error getting all quotations:', error);
      throw new Error(error.userMessage || 'Failed to fetch quotations');
    }
  },

  /**
   * Update a quotation with validation
   * @param {string} vendorId - The vendor ID
   * @param {Object} quotationData - The updated quotation data
   * @returns {Promise<Object>} - The updated quotation
   */
  updateQuotation: async (vendorId, quotationData) => {
    try {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }
      
      // Add updated timestamp
      quotationData.updated_at = new Date().toISOString();
      
      console.log(`Updating quotation for vendor ID: ${vendorId}`, quotationData);
      const response = await apiClient.put(`/quotations/${vendorId}`, quotationData);
      
      if (response.data) {
        console.log('Quotation updated successfully:', response.data);
        return response.data;
      }
      
      throw new Error('No data returned from server');
    } catch (error) {
      console.error(`Error updating quotation for vendor ${vendorId}:`, error);
      
      if (error.response && error.response.status === 404) {
        throw new Error(`Quotation with vendor ID "${vendorId}" not found`);
      } else if (error.userMessage) {
        throw new Error(error.userMessage);
      } else {
        throw new Error(`Failed to update quotation for vendor ID "${vendorId}"`);
      }
    }
  },

  /**
   * Delete a quotation with confirmation
   * @param {string} vendorId - The vendor ID
   * @returns {Promise<boolean>} - Success status
   */
  deleteQuotation: async (vendorId) => {
    try {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }
      
      console.log(`Deleting quotation for vendor ID: ${vendorId}`);
      await apiClient.delete(`/quotations/${vendorId}`);
      
      console.log('Quotation deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting quotation for vendor ${vendorId}:`, error);
      
      if (error.response && error.response.status === 404) {
        throw new Error(`Quotation with vendor ID "${vendorId}" not found`);
      } else if (error.userMessage) {
        throw new Error(error.userMessage);
      } else {
        throw new Error(`Failed to delete quotation for vendor ID "${vendorId}"`);
      }
    }
  },
  
  /**
   * Get quotations by car model with enhanced search
   * @param {string} carModel - The car model
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Array of quotation objects
   */
  getQuotationsByCarModel: async (carModel, options = {}) => {
    try {
      if (!carModel) {
        throw new Error('Car model is required');
      }
      
      const params = new URLSearchParams();
      if (options.exact) params.append('exact', 'true');
      if (options.limit) params.append('limit', options.limit);
      
      const queryString = params.toString();
      const url = queryString ? `/quotations/car/${carModel}?${queryString}` : `/quotations/car/${carModel}`;
      
      const response = await apiClient.get(url);
      return response.data || [];
    } catch (error) {
      console.error(`Error getting quotations for car model ${carModel}:`, error);
      throw new Error(error.userMessage || `Failed to fetch quotations for car model "${carModel}"`);
    }
  },

  /**
   * Get quotation statistics
   * @returns {Promise<Object>} - Statistics data
   */
  getQuotationStats: async () => {
    try {
      const response = await apiClient.get('/quotations/stats');
      return response.data || {};
    } catch (error) {
      console.error('Error getting quotation statistics:', error);
      // Don't throw error for stats, just return empty object
      return {};
    }
  },

  /**
   * Export quotations to CSV/PDF
   * @param {string} format - Export format ('csv' or 'pdf')
   * @param {Object} filters - Export filters
   * @returns {Promise<Blob>} - File blob
   */
  exportQuotations: async (format = 'csv', filters = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(`/quotations/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting quotations:', error);
      throw new Error(error.userMessage || 'Failed to export quotations');
    }
  },

  /**
   * Get car summaries for frontend display
   * @returns {Promise<Array>} - Array of car summary objects
   */
  getCarSummaries: async () => {
    try {
      console.log('Fetching car summaries from backend...');
      const response = await apiClient.get('/quotations/summary/cars');
      
      if (response.data) {
        console.log('Car summaries fetched successfully:', response.data.length, 'cars');
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting car summaries:', error);
      // Return empty array on error to prevent breaking the UI
      console.warn('Falling back to empty car summaries due to error');
      return [];
    }
  }
};

export default quotationService; 
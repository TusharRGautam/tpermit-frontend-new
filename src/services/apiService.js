// Central API service for all backend communications

// OLD: Localhost configuration (commented out)
// const API_BASE_URL = 'http://localhost:5000/api';

// NEW: Production configuration with backend subdomain
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
                     (window.location.origin.includes('localhost') ? 
                     'http://localhost:5000/api' : 
                     'https://backend.t-permit.com/api');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      console.log(`Making API request to: ${url}`, requestOptions);
      
      const response = await fetch(url, requestOptions);
      
      console.log(`API Response Status: ${response.status}`);
      
      let responseData = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // Not JSON
      }

      if (!response.ok) {
        const errorMsg = responseData?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }
 
      console.log('API Response Data:', responseData);
      return responseData;
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Enhanced error handling
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Backend server is not accessible. Please ensure the backend is running on backend.t-permit.com.');
      } else if (error.message.includes('status: 404')) {
        throw new Error('API endpoint not found. Please check the backend server configuration.');
      } else if (error.message.includes('status: 500')) {
        throw new Error('Internal server error. Please check the backend logs.');
      } else {
        throw error;
      }
    }
  }

  // Authentication methods
  async login(email, password) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifySession(sessionToken) {
    return this.makeRequest('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ sessionToken }),
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  // Generic HTTP methods
  async get(endpoint) {
    return this.makeRequest(endpoint, {
      method: 'GET',
    });
  }

  async post(endpoint, data) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }

  // Test method
  async testConnection() {
    return this.makeRequest('/test');
  }
}

const apiService = new ApiService();
export default apiService; 
// Central API service for all backend communications
const API_BASE_URL = 'http://localhost:5000/api';

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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response Data:', data);
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Enhanced error handling
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Backend server is not accessible. Please ensure the backend is running on port 5000.');
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

  // Test method
  async testConnection() {
    return this.makeRequest('/test');
  }
}

export default new ApiService(); 
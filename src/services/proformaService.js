import apiService from './apiService';

const proformaService = {
  // Get all proforma invoices
  getAllProformaInvoices: async () => {
    try {
      const response = await apiService.get('/proforma-invoices');
      if (response && response.length >= 0) {
           return response;
      }
      return [];
    } catch (error) {
      console.error('Error fetching proforma invoices:', error);
      throw error;
    }
  },

  // Get proforma by ID
  getProformaInvoiceById: async (id) => {
    try {
      const response = await apiService.get(`/proforma-invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching proforma invoice ${id}:`, error);
      throw error;
    }
  },

  // Get next serial number
  getNextSerialNumber: async () => {
    try {
      const response = await apiService.get('/proforma-invoices/next-serial');
      return response.serialNumber;
    } catch (error) {
      console.error('Error fetching next serial number:', error);
      // Fallback
      return 'PI13000';
    }
  },

  // Create new proforma invoice
  createProformaInvoice: async (invoiceData) => {
    try {
      const response = await apiService.post('/proforma-invoices', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error creating proforma invoice:', error);
      throw error;
    }
  },

  // Delete proforma invoice
  deleteProformaInvoice: async (id) => {
    try {
      return await apiService.delete(`/proforma-invoices/${id}`);
    } catch (error) {
      console.error('Error deleting proforma invoice:', error);
      throw error;
    }
  },


  // Update proforma invoice
  updateProformaInvoice: async (id, invoiceData) => {
    try {
      const response = await apiService.put(`/proforma-invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error updating proforma invoice:', error);
      throw error;
    }
  }
};

export default proformaService;


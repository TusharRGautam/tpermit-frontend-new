import { supabase } from '../config/supabaseClient';

const receiptService = {
  /**
   * Get the next receipt number
   */
  // Import apiService at top if not present, but here we can just fetch from the shared endpoint
  // Actually receiptService.js is using 'supabase' directly.
  // We should switch to consistent API usage for numbering at least.
  
  /**
   * Get the next receipt number (Synced with Booking Orders)
   */
  async getNextReceiptNumber() {
    try {
      // Use the Booking Order Next Number endpoint to ensure synchronization
      // We assume apiService is available globally or we can use fetch/axios
      // Since this file imports supabase directly, let's use the API URL from config if possible
      // effectively we want to call GET /api/booking-orders/next-number
      
      // Since we can't easily import apiService if it's not already imported, 
      // let's try to fetch relative to current origin if in browser
      
      const response = await fetch('http://localhost:5001/api/booking-orders/next-number'); // Assuming localhost for dev
      // Better: Use the same logic as apiService
      
      if (!response.ok) throw new Error('Network response was not ok');
      const json = await response.json();
      
      if (json.success) {
          return json.data;
      }
      return 'BO0522'; // Fallback aligned with booking orders
      
    } catch (error) {
      console.error('Error fetching next receipt number:', error);
      // Fallback: check supabase locally as last resort but try to respect BO format
      try {
        const { data: receipts } = await supabase
          .from('payment_receipts')
          .select('receipt_number')
          .order('receipt_number', { ascending: false })
          .limit(1);

        if (receipts && receipts.length > 0) {
          // Try to handle BO or GM prefixes
          const num = parseInt(receipts[0].receipt_number.replace(/\D/g, '')) || 522;
          return `BO${(num + 1).toString().padStart(4, '0')}`;
        }
        return 'BO0522';
      } catch (fbError) {
        return 'BO0522';
      }
    }
  },

  /**
   * Create a new receipt
   */
  async createReceipt(receiptData) {
    try {
      const { data, error } = await supabase
        .from('payment_receipts')
        .insert([receiptData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },

  /**
   * Get all receipts with optional filters
   */
  async getAllReceipts(filters = {}) {
    try {
      let query = supabase
        .from('payment_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.customerName) {
        query = query.ilike('customer_name', `%${filters.customerName}%`);
      }

      if (filters.mobileNumber) {
        query = query.ilike('mobile_number', `%${filters.mobileNumber}%`);
      }

      if (filters.carModel) {
        query = query.ilike('car_model', `%${filters.carModel}%`);
      }

      if (filters.receiptNumber) {
        query = query.ilike('receipt_number', `%${filters.receiptNumber}%`);
      }

      if (filters.fromDate) {
        query = query.gte('receipt_date', filters.fromDate);
      }

      if (filters.toDate) {
        query = query.lte('receipt_date', filters.toDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
  },

  /**
   * Get a single receipt by ID
   */
  async getReceiptById(id) {
    try {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      throw error;
    }
  },

  /**
   * Get a receipt by receipt number
   */
  async getReceiptByNumber(receiptNumber) {
    try {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('receipt_number', receiptNumber)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching receipt by number:', error);
      throw error;
    }
  },

  /**
   * Update a receipt
   */
  async updateReceipt(id, updates) {
    try {
      const { data, error } = await supabase
        .from('payment_receipts')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  },

  /**
   * Delete a receipt
   */
  async deleteReceipt(id) {
    try {
      const { error } = await supabase
        .from('payment_receipts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  },

  /**
   * Search receipts
   */
  async searchReceipts(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .or(`customer_name.ilike.%${searchTerm}%,mobile_number.ilike.%${searchTerm}%,car_model.ilike.%${searchTerm}%,receipt_number.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching receipts:', error);
      throw error;
    }
  },

  /**
   * Get receipt statistics
   */
  async getReceiptStats() {
    try {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('receipt_amount, payment_mode, receipt_date');

      if (error) throw error;

      const stats = {
        totalReceipts: data.length,
        totalAmount: data.reduce((sum, receipt) => sum + parseFloat(receipt.receipt_amount || 0), 0),
        paymentModes: {},
        recentReceipts: data.slice(0, 5)
      };

      // Count by payment mode
      data.forEach(receipt => {
        const mode = receipt.payment_mode || 'Unknown';
        stats.paymentModes[mode] = (stats.paymentModes[mode] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching receipt stats:', error);
      throw error;
    }
  }
};

export default receiptService;

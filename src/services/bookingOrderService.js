import apiService from './apiService';

const bookingOrderService = {
  /**
   * Get the next booking order number
   */
  async getNextOrderNumber() {
    try {
      const response = await apiService.get('/booking-orders/next-number');
      if (response.success) {
        return response.data;
      }
      return 'BO0522';
    } catch (error) {
      console.error('Error fetching next order number:', error);
      return 'BO0522';
    }
  },

  /**
   * Create a new booking order
   */
  async createBookingOrder(orderData) {
    try {
      // Map frontend fields to backend fields if necessary, or ensure they match
      // Frontend uses camelCase, backend (SQL) uses snake_case
      // We should probably map them here or ensure the API handles it.
      // The API implementation I wrote passes req.body directly to Supabase insert.
      // And BookingOrder.tsx sends snake_case keys in `orderData` object!
      // checking BookingOrder.tsx:
      // const orderData = { order_number: ..., order_date: ..., company_name: ..., ... }
      // So the keys ARE snake_case. Good.
      
      const response = await apiService.post('/booking-orders', orderData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create booking order');
    } catch (error) {
      console.error('Error creating booking order:', error);
      throw error;
    }
  },

  /**
   * Update a booking order
   */
  async updateBookingOrder(id, orderData) {
    try {
      const response = await apiService.put(`/booking-orders/${id}`, orderData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update booking order');
    } catch (error) {
      console.error('Error updating booking order:', error);
      throw error;
    }
  },

  /**
   * Get all booking orders with optional filters
   */
  async getAllBookingOrders(filters = {}) {
    try {
      // Current API doesn't support filters yet, but returns all
      // We can implement client-side filtering or update API later
      const response = await apiService.get('/booking-orders');
      
      if (response.success) {
        let orders = response.data;
        
        // Client-side filtering as fallback until API supports it
        if (filters.customerName) {
            orders = orders.filter(o => o.customer_name?.toLowerCase().includes(filters.customerName.toLowerCase()));
        }
        if (filters.companyName) {
            orders = orders.filter(o => o.company_name?.toLowerCase().includes(filters.companyName.toLowerCase()));
        }
        if (filters.carModel) {
            orders = orders.filter(o => o.car_model?.toLowerCase().includes(filters.carModel.toLowerCase()));
        }
        if (filters.orderNumber) {
            orders = orders.filter(o => o.order_number?.toLowerCase().includes(filters.orderNumber.toLowerCase()));
        }
        
        return orders;
      }
      return [];
    } catch (error) {
      console.error('Error fetching booking orders:', error);
      throw error;
    }
  },

  /**
   * Get a single booking order by ID
   */
  async getBookingOrderById(id) {
    try {
      const response = await apiService.get(`/booking-orders/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Booking order not found');
    } catch (error) {
      console.error('Error fetching booking order:', error);
      throw error;
    }
  },

  /**
   * Get a booking order by order number
   */
  async getBookingOrderByNumber(orderNumber) {
    try {
      // We don't have a specific API for this yet, so we'll fetch all and find
      // Or we can add a new endpoint. For now, fetch all.
      const orders = await this.getAllBookingOrders();
      return orders.find(o => o.order_number === orderNumber);
    } catch (error) {
      console.error('Error fetching booking order by number:', error);
      throw error;
    }
  },
  /**
   * Delete a booking order
   */
  async deleteBookingOrder(id) {
    try {
      const response = await apiService.delete(`/booking-orders/${id}`);
      if (response.success) {
        return true;
      }
      throw new Error(response.message || 'Failed to delete booking order');
    } catch (error) {
      console.error('Error deleting booking order:', error);
      throw error;
    }
  }
};

export default bookingOrderService;

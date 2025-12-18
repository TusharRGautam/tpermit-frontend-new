import { supabase } from '../config/supabaseClient';

const bookingOrderService = {
  /**
   * Get the next booking order number
   */
  async getNextOrderNumber() {
    try {
      const { data: orders, error } = await supabase
        .from('booking_orders')
        .select('order_number')
        .order('order_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (orders && orders.length > 0) {
        const lastNumber = parseInt(orders[0].order_number.replace('BO', ''));
        const nextNumber = lastNumber + 1;
        return `BO${String(nextNumber).padStart(4, '0')}`;
      }
      return 'BO0001';
    } catch (error) {
      console.error('Error fetching next order number:', error);
      return 'BO0001';
    }
  },

  /**
   * Create a new booking order
   */
  async createBookingOrder(orderData) {
    try {
      const { data, error } = await supabase
        .from('booking_orders')
        .insert([orderData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating booking order:', error);
      throw error;
    }
  },

  /**
   * Get all booking orders with optional filters
   */
  async getAllBookingOrders(filters = {}) {
    try {
      let query = supabase
        .from('booking_orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.customerName) {
        query = query.ilike('customer_name', `%${filters.customerName}%`);
      }

      if (filters.companyName) {
        query = query.ilike('company_name', `%${filters.companyName}%`);
      }

      if (filters.carModel) {
        query = query.ilike('car_model', `%${filters.carModel}%`);
      }

      if (filters.orderNumber) {
        query = query.ilike('order_number', `%${filters.orderNumber}%`);
      }

      if (filters.fromDate) {
        query = query.gte('order_date', filters.fromDate);
      }

      if (filters.toDate) {
        query = query.lte('order_date', filters.toDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('booking_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('booking_orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching booking order by number:', error);
      throw error;
    }
  },

  /**
   * Update a booking order
   */
  async updateBookingOrder(id, updates) {
    try {
      const { data, error } = await supabase
        .from('booking_orders')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating booking order:', error);
      throw error;
    }
  },

  /**
   * Delete a booking order
   */
  async deleteBookingOrder(id) {
    try {
      const { error } = await supabase
        .from('booking_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting booking order:', error);
      throw error;
    }
  },

  /**
   * Search booking orders
   */
  async searchBookingOrders(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('booking_orders')
        .select('*')
        .or(`customer_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,car_model.ilike.%${searchTerm}%,order_number.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching booking orders:', error);
      throw error;
    }
  }
};

export default bookingOrderService;

import apiService from './apiService';

class BookingService {
  async createBooking(bookingData) {
    try {
      console.log('Creating booking with data:', bookingData);
      
      const response = await apiService.post('/bookings', {
        // Car details
        car_brand: bookingData.car_brand,
        car_model: bookingData.car_model,
        car_variant: bookingData.car_variant,
        car_fuel_type: bookingData.car_fuel_type,
        car_transmission: bookingData.car_transmission,
        car_color: bookingData.car_color,
        car_year: bookingData.car_year,
        
        // Customer details
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_phone: bookingData.customer_phone,
        customer_address: bookingData.customer_address,
        customer_city: bookingData.customer_city,
        customer_state: bookingData.customer_state || 'Maharashtra',
        customer_pincode: bookingData.customer_pincode,
        
        // Pricing details
        ex_showroom_price: bookingData.ex_showroom_price,
        on_road_price: bookingData.on_road_price,
        booking_amount: bookingData.booking_amount,
        total_amount: bookingData.total_amount,
        
        // Finance details (if any)
        finance_required: bookingData.finance_required || false,
        finance_bank: bookingData.finance_bank,
        loan_amount: bookingData.loan_amount,
        down_payment: bookingData.down_payment,
        emi_amount: bookingData.emi_amount,
        loan_tenure_months: bookingData.loan_tenure_months,
        interest_rate: bookingData.interest_rate,
        
        // Additional details
        special_requirements: bookingData.special_requirements,
        preferred_delivery_date: bookingData.preferred_delivery_date,
        lead_source: 'website',
        referral_source: bookingData.referral_source,
        marketing_campaign: bookingData.marketing_campaign,
        
        // System tracking
        ip_address: bookingData.ip_address,
        user_agent: bookingData.user_agent || navigator.userAgent,
        utm_source: bookingData.utm_source,
        utm_medium: bookingData.utm_medium,
        utm_campaign: bookingData.utm_campaign
      });
      
      return response;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getBookingById(id) {
    try {
      const response = await apiService.get(`/bookings/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  async getBookingByReferenceId(referenceId) {
    try {
      const response = await apiService.get(`/bookings/reference/${referenceId}`);
      return response;
    } catch (error) {
      console.error('Error fetching booking by reference:', error);
      throw error;
    }
  }

  async updatePaymentStatus(bookingId, paymentData) {
    try {
      const response = await apiService.put(`/bookings/${bookingId}/payment`, {
        status: paymentData.status,
        reference_id: paymentData.reference_id,
        gateway: paymentData.gateway,
        method: paymentData.method,
        date: paymentData.date
      });
      return response;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async getCustomerBookings(email) {
    try {
      const response = await apiService.get(`/bookings/customer/${encodeURIComponent(email)}`);
      return response;
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      throw error;
    }
  }

  async testShowroomAllocation(pincode, city, brand) {
    try {
      const response = await apiService.post('/bookings/test-allocation', {
        pincode,
        city,
        brand
      });
      return response;
    } catch (error) {
      console.error('Error testing showroom allocation:', error);
      throw error;
    }
  }

  // Convert cart item to booking data
  convertCartItemToBookingData(cartItem) {
    return {
      // Car details
      car_brand: this.extractBrandFromCarName(cartItem.carName),
      car_model: cartItem.carName,
      car_variant: cartItem.variant.name,
      car_fuel_type: this.extractFuelType(cartItem.variant.name),
      car_transmission: this.extractTransmission(cartItem.variant.name),
      car_color: 'Not specified',
      car_year: new Date().getFullYear(),
      
      // Customer details
      customer_name: cartItem.customerName,
      customer_email: cartItem.customerEmail,
      customer_phone: cartItem.customerPhone,
      customer_address: cartItem.customerAddress,
      customer_city: cartItem.customerCity,
      customer_state: 'Maharashtra',
      customer_pincode: cartItem.customerPincode,
      
      // Pricing
      ex_showroom_price: cartItem.variant.exShowroom,
      on_road_price: cartItem.variant.onRoadPrice,
      booking_amount: cartItem.variant.bookingAmount,
      total_amount: cartItem.variant.onRoadPrice,
      
      // Finance defaults
      finance_required: false,
      down_payment: cartItem.variant.downPayment,
      emi_amount: cartItem.variant.monthlyEmi,
      
      // System info
      user_agent: navigator.userAgent,
      ip_address: null // Will be set by server
    };
  }

  // Helper function to extract brand from car name
  extractBrandFromCarName(carName) {
    const brandMap = {
      'Maruti': 'Maruti Suzuki',
      'Suzuki': 'Maruti Suzuki',
      'Hyundai': 'Hyundai',
      'Toyota': 'Toyota',
      'Honda': 'Honda',
      'Tata': 'Tata',
      'Mahindra': 'Mahindra'
    };

    for (const [key, value] of Object.entries(brandMap)) {
      if (carName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return 'Unknown Brand';
  }

  // Helper function to extract fuel type from variant name
  extractFuelType(variantName) {
    const lowerVariant = variantName.toLowerCase();
    if (lowerVariant.includes('diesel') || lowerVariant.includes('d')) {
      return 'Diesel';
    } else if (lowerVariant.includes('petrol') || lowerVariant.includes('p')) {
      return 'Petrol';
    } else if (lowerVariant.includes('cng')) {
      return 'CNG';
    } else if (lowerVariant.includes('electric') || lowerVariant.includes('ev')) {
      return 'Electric';
    }
    return 'Petrol'; // Default
  }

  // Helper function to extract transmission from variant name
  extractTransmission(variantName) {
    const lowerVariant = variantName.toLowerCase();
    if (lowerVariant.includes('automatic') || lowerVariant.includes('at') || lowerVariant.includes('amt') || lowerVariant.includes('cvt')) {
      return 'Automatic';
    } else if (lowerVariant.includes('manual') || lowerVariant.includes('mt')) {
      return 'Manual';
    }
    return 'Manual'; // Default
  }

  // Process entire cart for booking
  async processCartBookings(cartItems) {
    const bookingResults = [];
    const errors = [];

    for (const cartItem of cartItems) {
      try {
        const bookingData = this.convertCartItemToBookingData(cartItem);
        const result = await this.createBooking(bookingData);
        
        bookingResults.push({
          cartItemId: cartItem.id,
          booking: result,
          success: true
        });
      } catch (error) {
        errors.push({
          cartItemId: cartItem.id,
          carName: cartItem.carName,
          error: error.message,
          success: false
        });
      }
    }

    return {
      successful: bookingResults,
      failed: errors,
      totalProcessed: cartItems.length,
      totalSuccessful: bookingResults.length,
      totalFailed: errors.length
    };
  }
}

const bookingService = new BookingService();
export default bookingService;
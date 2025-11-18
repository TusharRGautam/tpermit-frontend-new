import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import apiService from '../../services/apiService';

interface BookingRelationAllocation {
  id: number;
  booking_reference_id: string;
  booking_date: string;
  booking_status: string;
  
  // Customer details
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_pincode?: string;
  
  // Car details
  car_brand: string;
  car_model: string;
  car_variant?: string;
  car_fuel_type?: string;
  car_transmission?: string;
  car_color?: string;
  car_year?: number;
  
  // Pricing details
  ex_showroom_price?: number;
  on_road_price?: number;
  booking_amount: number;
  total_amount?: number;
  
  // Additional charges
  registration_charges?: number;
  insurance_amount?: number;
  tcs_amount?: number;
  accessories_amount?: number;
  extended_warranty?: number;
  
  // Payment details
  payment_status: string;
  payment_method?: string;
  payment_reference_id?: string;
  payment_date?: string;
  payment_gateway?: string;
  
  // Delivery & Location details
  preferred_delivery_date?: string;
  delivery_location?: string;
  showroom_location?: string;
  sales_executive_name?: string;
  sales_executive_phone?: string;
  
  // Finance details
  finance_required?: boolean;
  finance_bank?: string;
  loan_amount?: number;
  emi_amount?: number;
  loan_tenure_months?: number;
  interest_rate?: number;
  
  // Additional info
  special_requirements?: string;
  referral_source?: string;
  lead_source?: string;
  marketing_campaign?: string;
  
  // Showroom allocation
  allocated_showroom_id?: number;
  allocated_showroom_name?: string;
  allocated_showroom_address?: string;
  allocated_contact_person?: string;
  allocated_contact_phone?: string;
  allocation_method?: string;
  allocation_date?: string;
  allocation_notes?: string;
  
  // Exchange details
  exchange_car_details?: string;
  exchange_car_value?: number;
  
  // UTM tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  
  // Document status
  documents_submitted?: boolean;
  kyc_verified?: boolean;
  agreement_signed?: boolean;
  
  // Notes
  customer_notes?: string;
  internal_notes?: string;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_updated_by?: string;
}

interface BookingSummary {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  completed_bookings?: number;
  revenue_generated: number;
}

const BookingRelations: React.FC = () => {
  const [bookingRelations, setBookingRelations] = useState<BookingRelationAllocation[]>([]);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  useEffect(() => {
    fetchBookingRelations();
    fetchBookingSummary();
  }, []);

  const fetchBookingRelations = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/bookings');
      if (response.success) {
        setBookingRelations(response.data);
      } else {
        setError('Failed to fetch booking relations');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch booking relations');
      console.error('Error fetching booking relations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingSummary = async () => {
    try {
      const response = await apiService.get('/bookings/dashboard/summary');
      if (response.success) {
        setBookingSummary(response.data);
      } else {
        console.warn('Failed to fetch booking summary');
      }
    } catch (err: any) {
      console.warn('Error fetching booking summary:', err);
    }
  };

  // Filter and search functionality
  const filteredRelations = bookingRelations.filter((relation) => {
    const matchesSearch = searchTerm === '' || 
      relation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relation.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relation.car_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relation.car_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (relation.showroom_location && relation.showroom_location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      relation.booking_reference_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || relation.booking_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRelations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRelations.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-confirmed';
      default:
        return 'status-default';
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p>Loading booking relations...</p>
    </div>
  );

  return (
    <div className="booking-relations">
      <div className="page-header">
        <h1>Booking Relations & Allocations</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Booking Summary Section */}
      {bookingSummary && (
        <div className="booking-summary-section">
          <h2>Booking Summary</h2>
          <div className="summary-cards">
            <div className="summary-card total">
              <div className="card-content">
                <h3>Total Bookings</h3>
                <p className="card-value">{bookingSummary.total_bookings}</p>
              </div>
            </div>
            <div className="summary-card pending">
              <div className="card-content">
                <h3>Pending</h3>
                <p className="card-value">{bookingSummary.pending_bookings}</p>
              </div>
            </div>
            <div className="summary-card confirmed">
              <div className="card-content">
                <h3>Confirmed</h3>
                <p className="card-value">{bookingSummary.confirmed_bookings}</p>
              </div>
            </div>
            {bookingSummary.completed_bookings !== undefined && (
              <div className="summary-card confirmed">
                <div className="card-content">
                  <h3>Completed</h3>
                  <p className="card-value">{bookingSummary.completed_bookings}</p>
                </div>
              </div>
            )}
            <div className="summary-card cancelled">
              <div className="card-content">
                <h3>Cancelled</h3>
                <p className="card-value">{bookingSummary.cancelled_bookings}</p>
              </div>
            </div>
            <div className="summary-card revenue">
              <div className="card-content">
                <h3>Revenue Generated</h3>
                <p className="card-value">₹{bookingSummary.revenue_generated?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by user name, email, car, or showroom..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="status-filter"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Booking Relations List */}
      <div className="booking-relations-list">
        {currentItems.length > 0 ? (
          <div className="relations-grid">
            <div className="relations-header">
              <h3>Booking Relations & Allocations ({filteredRelations.length} records)</h3>
            </div>
            {currentItems.map((relation, index) => (
              <div 
                key={relation.id} 
                className="booking-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Card Header */}
                <div className="card-header">
                  <div className="booking-id-section">
                    <h3>#{relation.booking_reference_id}</h3>
                    <span className={`status-badge ${getStatusBadgeClass(relation.booking_status)}`}>
                      {relation.booking_status.charAt(0).toUpperCase() + relation.booking_status.slice(1)}
                    </span>
                  </div>
                  <div className="booking-date">
                    <p>{new Date(relation.booking_date).toLocaleDateString('en-IN', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>

                {/* Card Content Flow */}
                <div className="booking-flow">
                  {/* Step 1: Customer */}
                  <div className="flow-step customer-step">
                    <div className="step-header">
                      <div className="step-number">1</div>
                      <h4>👤 Customer Information</h4>
                    </div>
                    <div className="step-content">
                      <p className="primary-name">{relation.customer_name}</p>
                      <p className="contact-detail">📧 {relation.customer_email}</p>
                      <p className="contact-detail">📞 {relation.customer_phone}</p>
                      
                      {relation.customer_address && (
                        <p className="location-detail">🏠 {relation.customer_address}</p>
                      )}
                      {relation.customer_city && relation.customer_state && (
                        <p className="location-detail">
                          📍 {relation.customer_city}, {relation.customer_state}
                          {relation.customer_pincode && ` - ${relation.customer_pincode}`}
                        </p>
                      )}

                      {/* Document Status */}
                      <div className="document-status">
                        <p className="status-title">📋 Document Status:</p>
                        <div className="status-indicators">
                          <span className={`status-chip ${relation.documents_submitted ? 'verified' : 'pending'}`}>
                            {relation.documents_submitted ? '✓ Documents' : '⏳ Pending'}
                          </span>
                          <span className={`status-chip ${relation.kyc_verified ? 'verified' : 'pending'}`}>
                            {relation.kyc_verified ? '✓ KYC' : '⏳ KYC'}
                          </span>
                          <span className={`status-chip ${relation.agreement_signed ? 'verified' : 'pending'}`}>
                            {relation.agreement_signed ? '✓ Agreement' : '⏳ Agreement'}
                          </span>
                        </div>
                      </div>

                      {relation.customer_notes && (
                        <p className="customer-notes">💬 {relation.customer_notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flow-arrow">→</div>

                  {/* Step 2: Booked Car */}
                  <div className="flow-step car-step">
                    <div className="step-header">
                      <div className="step-number">2</div>
                      <h4>🚗 Booked Vehicle</h4>
                    </div>
                    <div className="step-content">
                      <p className="primary-name">{relation.car_brand} {relation.car_model}</p>
                      <span className="brand-badge mini" data-brand={relation.car_brand}>
                        {relation.car_brand}
                      </span>
                      {relation.car_variant && <p className="spec-detail">Variant: {relation.car_variant}</p>}
                      {relation.car_fuel_type && <p className="spec-detail">Fuel: {relation.car_fuel_type}</p>}
                      {relation.car_color && <p className="spec-detail">Color: {relation.car_color}</p>}
                      {relation.booking_amount && relation.booking_amount > 0 && (
                        <div className="price-highlight">
                          <span>₹{relation.booking_amount?.toLocaleString()}</span>
                          <small>Booking Amount</small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flow-arrow">→</div>

                  {/* Step 3: Allocated Showroom */}
                  <div className="flow-step showroom-step">
                    <div className="step-header">
                      <div className="step-number">3</div>
                      <h4>🏢 Showroom Allocation</h4>
                    </div>
                    <div className="step-content">
                      {/* Check multiple possible showroom fields */}
                      {relation.showroom_location || relation.allocated_showroom_name || relation.allocated_showroom_address ? (
                        <>
                          <p className="primary-name">
                            {relation.showroom_location || relation.allocated_showroom_name || 'Showroom Allocated'}
                          </p>
                          <div className="allocation-badge">✅ Allocated</div>
                          
                          {relation.sales_executive_name && (
                            <p className="contact-detail">👨‍💼 {relation.sales_executive_name}</p>
                          )}
                          {relation.sales_executive_phone && (
                            <p className="contact-detail">📞 {relation.sales_executive_phone}</p>
                          )}
                          
                          {relation.allocated_contact_person && (
                            <p className="contact-detail">🏢 {relation.allocated_contact_person}</p>
                          )}
                          {relation.allocated_contact_phone && (
                            <p className="contact-detail">📞 {relation.allocated_contact_phone}</p>
                          )}
                          
                          {relation.allocated_showroom_address && (
                            <p className="location-detail">📍 {relation.allocated_showroom_address}</p>
                          )}
                          
                          {relation.delivery_location && (
                            <p className="location-detail">📦 {relation.delivery_location}</p>
                          )}
                          
                          {relation.allocation_method && (
                            <p className="spec-detail">⚙️ {relation.allocation_method}</p>
                          )}
                          {relation.allocation_date && (
                            <p className="spec-detail">📅 {new Date(relation.allocation_date).toLocaleDateString('en-IN', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}</p>
                          )}
                        </>
                      ) : (
                        <div className="allocation-pending">
                          {relation.customer_city && relation.customer_state ? (
                            <>
                              <p className="primary-name">🔄 Auto-Allocation</p>
                              <p className="location-detail">📍 {relation.customer_city}, {relation.customer_state}</p>
                              <p className="spec-detail">🚗 {relation.car_brand}</p>
                              <div className="pending-chip">⏳ In Progress</div>
                            </>
                          ) : (
                            <>
                              <p className="not-allocated">⚠️ Not Allocated</p>
                              <p className="allocation-help">Awaiting customer location details</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flow-arrow">→</div>

                  {/* Step 4: Booking Status */}
                  <div className="flow-step status-step">
                    <div className="step-header">
                      <div className="step-number">4</div>
                      <h4>📋 Status & Payment</h4>
                    </div>
                    <div className="step-content">
                      <div className="status-badges">
                        <span className={`status-badge ${getStatusBadgeClass(relation.booking_status)}`}>
                          {relation.booking_status.charAt(0).toUpperCase() + relation.booking_status.slice(1)}
                        </span>
                        {relation.payment_status && (
                          <span className={`payment-badge ${relation.payment_status}`}>
                            {relation.payment_status}
                          </span>
                        )}
                      </div>
                      
                      {relation.total_amount && relation.total_amount > 0 && (
                        <div className="total-amount">
                          <span>₹{relation.total_amount?.toLocaleString()}</span>
                          <small>Total Amount</small>
                        </div>
                      )}

                      {relation.preferred_delivery_date && (
                        <p className="delivery-date">
                          🗓️ {new Date(relation.preferred_delivery_date).toLocaleDateString()}
                        </p>
                      )}

                      {relation.finance_required && (
                        <div className="finance-indicator">
                          <span className="finance-chip">💳 Finance</span>
                          {relation.finance_bank && <small>{relation.finance_bank}</small>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Details - Collapsible */}
                <div className="additional-details">
                  {(relation.special_requirements || relation.customer_notes || relation.internal_notes) && (
                    <div className="notes-section">
                      {relation.special_requirements && (
                        <div className="note-item">
                          <strong>Special Requirements:</strong> {relation.special_requirements}
                        </div>
                      )}
                      {relation.customer_notes && (
                        <div className="note-item">
                          <strong>Customer Notes:</strong> {relation.customer_notes}
                        </div>
                      )}
                      {relation.internal_notes && (
                        <div className="note-item internal">
                          <strong>Internal Notes:</strong> {relation.internal_notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="card-footer">
                  <div className="meta-info">
                    {relation.lead_source && <span className="meta-tag">Source: {relation.lead_source}</span>}
                    {relation.referral_source && <span className="meta-tag">Referral: {relation.referral_source}</span>}
                  </div>
                  <div className="timestamps">
                    <span className="timestamp">Created: {new Date(relation.created_at).toLocaleDateString()}</span>
                    {relation.updated_at && relation.updated_at !== relation.created_at && (
                      <span className="timestamp">Updated: {new Date(relation.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>
              {filteredRelations.length === 0 && bookingRelations.length > 0 
                ? 'No booking relations match your search criteria.' 
                : 'No booking relations found.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages} 
            ({filteredRelations.length} total results)
          </div>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingRelations;
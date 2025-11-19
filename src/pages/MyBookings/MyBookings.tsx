import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import './MyBookings.css';

interface Booking {
  id: number;
  booking_reference_id: string;
  car_brand: string;
  car_model: string;
  car_variant: string;
  car_fuel_type: string;
  car_transmission: string;
  car_color: string;
  ex_showroom_price: number;
  on_road_price: number;
  booking_amount: number;
  total_amount: number;
  booking_status: string;
  payment_status: string;
  payment_method: string;
  booking_date: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserBookings();
  }, []);

  const loadUserBookings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load user profile from localStorage
      const savedUser = localStorage.getItem('tpermit_user_profile');

      if (!savedUser) {
        setError('No user profile found. Please make a booking first.');
        setIsLoading(false);
        return;
      }

      const profile = JSON.parse(savedUser);
      console.log('User Profile from localStorage:', profile);
      setUserProfile(profile);

      // Fetch bookings by email
      if (profile.email) {
        console.log('Fetching bookings for email:', profile.email);
        const response = await bookingService.getCustomerBookings(profile.email);

        console.log('Bookings API Response:', response);
        console.log('Response success:', response.success);
        console.log('Response data:', response.data);
        console.log('Response data length:', response.data?.length);

        if (response.success && response.data) {
          console.log('Setting bookings. Count:', response.data.length);
          console.log('Bookings Data:', response.data);
          setBookings(response.data);
        } else {
          console.log('No bookings found or API error. Response:', response);
          setBookings([]);
        }
      } else {
        console.log('No email in profile!', profile);
        setError('Email not found in user profile.');
      }
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      setError(err.message || 'Failed to load your bookings. Please try again later.');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    if (!status) return 'status-badge status-default';

    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-badge status-confirmed';
      case 'pending':
        return 'status-badge status-pending';
      case 'cancelled':
        return 'status-badge status-cancelled';
      case 'completed':
        return 'status-badge status-completed';
      default:
        return 'status-badge status-default';
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    if (!status) return 'payment-badge payment-default';

    switch (status.toLowerCase()) {
      case 'paid':
        return 'payment-badge payment-paid';
      case 'pending':
        return 'payment-badge payment-pending';
      case 'failed':
        return 'payment-badge payment-failed';
      default:
        return 'payment-badge payment-default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="my-bookings-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <h1>My Bookings</h1>
          <div className="breadcrumb">
            <Link to="/">Home</Link> / My Bookings
          </div>
        </div>

        <div className="error-state">
          <div className="error-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2>{error}</h2>
          <Link to="/" className="back-to-home-btn">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <h1>My Bookings</h1>
          <div className="breadcrumb">
            <Link to="/">Home</Link> / My Bookings
          </div>
        </div>

        <div className="empty-bookings">
          <div className="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h2>No bookings yet</h2>
          <p>You haven't made any car bookings. Start browsing our collection!</p>
          <Link to="/" className="browse-cars-btn">
            Browse Cars
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <div className="my-bookings-header">
        <h1>My Bookings</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link> / My Bookings
        </div>
      </div>

      {userProfile && (
        <div className="user-info-card">
          <div className="user-avatar">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="user-details">
            <h3>{userProfile.name}</h3>
            <p>{userProfile.email}</p>
            <p>{userProfile.phone}</p>
          </div>
          <div className="total-bookings">
            <span className="count">{bookings.length}</span>
            <span className="label">Total Bookings</span>
          </div>
        </div>
      )}

      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card-compact">
            <div className="compact-header">
              <div className="booking-id">
                <span className="id-label">ID:</span>
                <span className="id-value">{booking.booking_reference_id}</span>
              </div>
              <div className="status-badges">
                <span className={getStatusBadgeClass(booking.booking_status)}>
                  {booking.booking_status ? booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1) : 'Pending'}
                </span>
              </div>
            </div>

            <div className="compact-body">
              <div className="car-info">
                <h4>
                  {booking.car_brand || 'Car'} {booking.car_model || 'Model Not Available'}
                </h4>
                <div className="car-meta">
                  {booking.car_variant && <span>{booking.car_variant}</span>}
                  {booking.car_fuel_type && <span>• {booking.car_fuel_type}</span>}
                  {booking.car_transmission && <span>• {booking.car_transmission}</span>}
                </div>
              </div>

              <div className="price-grid">
                <div className="price-box">
                  <span className="label">Booking</span>
                  <span className="amount">
                    {booking.booking_amount && booking.booking_amount > 0
                      ? `₹${Number(booking.booking_amount).toLocaleString('en-IN')}`
                      : '₹N/A'}
                  </span>
                </div>
                <div className="price-box">
                  <span className="label">Ex-Showroom</span>
                  <span className="amount">
                    {booking.ex_showroom_price && booking.ex_showroom_price > 0
                      ? `₹${Number(booking.ex_showroom_price).toLocaleString('en-IN')}`
                      : '₹N/A'}
                  </span>
                </div>
                <div className="price-box highlight">
                  <span className="label">On-Road</span>
                  <span className="amount">
                    {booking.on_road_price && booking.on_road_price > 0
                      ? `₹${Number(booking.on_road_price).toLocaleString('en-IN')}`
                      : '₹N/A'}
                  </span>
                </div>
              </div>

              <div className="compact-footer">
                <span className="date-info">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {formatDate(booking.created_at || booking.booking_date)}
                </span>
                <a
                  href={`https://wa.me/918652089525?text=Hi, I need help with booking ${booking.booking_reference_id}`}
                  className="support-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 11.5C21 16.75 16.75 21 11.5 21C9.93 21 8.46 20.59 7.18 19.87L3 21L4.13 16.82C3.41 15.54 3 14.07 3 12.5C3 7.25 7.25 3 12.5 3C17.75 3 22 7.25 22 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Support
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bookings-footer">
        <Link to="/" className="continue-browsing-btn">
          ← Continue Browsing
        </Link>
      </div>
    </div>
  );
};

export default MyBookings;

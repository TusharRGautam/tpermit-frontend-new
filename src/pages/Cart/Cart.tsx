import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { removeFromCart, updateCartItem, clearCart } from '../../redux/slices/cartSlice';
import './Cart.css';

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const { items, totalAmount, totalItems } = useSelector((state: RootState) => state.cart);

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };

  const handleUpdateCustomerInfo = (id: string, field: string, value: string) => {
    dispatch(updateCartItem({
      id,
      updates: { [field]: value }
    }));
  };

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h1>Your Cart</h1>
          <div className="cart-breadcrumb">
            <Link to="/">Home</Link> / Cart
          </div>
        </div>
        
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 17.6 16.6 18 16 18H8C7.4 18 7 17.6 7 17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="20" r="1" stroke="currentColor" strokeWidth="2"/>
              <circle cx="20" cy="20" r="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Start browsing our car collection and add your favorites to the cart.</p>
          <Link to="/" className="continue-shopping-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h1>
        <div className="cart-breadcrumb">
          <Link to="/">Home</Link> / Cart
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-actions-top">
            <button className="clear-cart-btn" onClick={handleClearCart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.4 8.4 3 9 3H15C15.6 3 16 3.4 16 4V6M19 6V20C19 20.6 18.6 21 18 21H6C5.4 21 5 20.6 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Clear Cart
            </button>
          </div>

          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img src={item.carImage} alt={item.carName} />
              </div>
              
              <div className="cart-item-details">
                <h3>{item.carName}</h3>
                <div className="variant-info">
                  <span className="variant-name">{item.variant.name} Variant</span>
                  <div className="variant-specs">
                    <span>Ex-Showroom: ₹{item.variant.exShowroom.toLocaleString()}</span>
                    <span>On-Road: ₹{item.variant.onRoadPrice.toLocaleString()}</span>
                    <span>EMI: ₹{item.variant.monthlyEmi.toLocaleString()}/month</span>
                  </div>
                </div>
                
                <div className="customer-details">
                  <div className="customer-field">
                    <label>Customer Name:</label>
                    <input 
                      type="text" 
                      value={item.customerName}
                      onChange={(e) => handleUpdateCustomerInfo(item.id, 'customerName', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="customer-field">
                    <label>Phone Number:</label>
                    <input 
                      type="tel" 
                      value={item.customerPhone}
                      onChange={(e) => handleUpdateCustomerInfo(item.id, 'customerPhone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="customer-field">
                    <label>Email Address:</label>
                    <input 
                      type="email" 
                      value={item.customerEmail}
                      onChange={(e) => handleUpdateCustomerInfo(item.id, 'customerEmail', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>
              
              <div className="cart-item-actions">
                <div className="booking-amount">
                  <span className="amount-label">Booking Token:</span>
                  <span className="amount-value">₹{item.bookingAmount.toLocaleString()}</span>
                </div>
                <button 
                  className="remove-item-btn"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="summary-row">
                <span>Booking Token Amount:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="booking-note">
              <div className="note-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="note-text">
                <p><strong>Note:</strong> This is a booking token amount to secure your vehicle. The remaining amount will be collected at the time of delivery.</p>
              </div>
            </div>

            <div className="checkout-actions">
              <Link to="/checkout" className="checkout-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Proceed to Checkout
              </Link>
              
              <Link to="/" className="continue-shopping">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
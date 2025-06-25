import React from 'react';
import './FinanceOffers.css';

const FinanceOffers: React.FC = () => {
  return (
    <div className="finance-offers-container">
      <h2>Finance Offers</h2>
      <p>Explore our range of financing options and special deals.</p>
      <div className="finance-options">
        {/* Finance offer items would be populated here */}
        <p>Finance offers and deals will be displayed here.</p>
      </div>
    </div>
  );
};

export default FinanceOffers; 
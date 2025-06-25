import React from 'react';
import BrandLogos from '../BrandLogos/BrandLogos';
import BankLogos from '../BankLogos/BankLogos';
import './LogosContainer.css';

const LogosContainer: React.FC = () => {
  return (
    <div className="logos-container">
      <div className="logos-section">
        <BrandLogos />
      </div>
      <div className="logos-section">
        <BankLogos />
      </div>
    </div>
  );
};

export default LogosContainer; 
import React, { useState } from 'react';
import './Dashboard.css';

// Car variants matching the approved quotation data
const carVariants = {
  'Maruti Suzuki Wagon-R': ['H3 CNG', 'LXI CNG', 'VXI CNG'],
  'Maruti Suzuki ERTIGA': ['Tour M CNG 1.5 MT', 'VXI CNG 1.5 MT', 'ZXI CNG 1.5 MT'],
  'TOYOTA RUMION': ['S CNG 1.5 MT'],
  'HYUNDAI AURA': ['E CNG', 'S CNG', 'SX CNG'],
  'Maruti Suzuki Dzire': ['Tour\'s CNG'],
  'Toyota Innova Crysta': ['GX', 'GX+', 'VX', 'ZX']
};

const DashboardInvoiceCreation: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedVariant('');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Create Invoice</h1>
        <p>Generate professional invoices for vehicle sales</p>
      </div>
      
      <div className="quotation-creator-wrapper">
        <div className="quotation-card">
          <h3>New Invoice</h3>
          <p>Create a detailed invoice for completed vehicle sales</p>
          
          <div className="form-section" style={{ marginTop: '20px' }}>
            <label>Select Car Brand</label>
            <div className="custom-dropdown">
              <select 
                value={selectedBrand} 
                onChange={(e) => handleBrandSelect(e.target.value)}
                className="form-control"
              >
                <option value="">-- Select Brand --</option>
                {Object.keys(carVariants).map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedBrand && (
            <div className="form-section">
              <label>Select Model Variant</label>
              <div className="custom-dropdown">
                <select 
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Select Variant --</option>
                  {carVariants[selectedBrand as keyof typeof carVariants]?.map(variant => (
                    <option key={variant} value={variant}>{variant}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          <button 
            className="quotation-btn" 
            disabled={!selectedBrand || !selectedVariant}
            style={{ 
              marginTop: '20px',
              opacity: (!selectedBrand || !selectedVariant) ? 0.6 : 1,
              cursor: (!selectedBrand || !selectedVariant) ? 'not-allowed' : 'pointer'
            }}
          >
            Create Invoice
          </button>
        </div>
        
        <div className="quotation-help-card">
          <h3>About Invoices</h3>
          <ul className="quotation-help-list">
            <li>Select the vehicle model and variant</li>
            <li>Fill in customer and payment details</li>
            <li>Include all applicable taxes and charges</li>
            <li>Generate professional invoice document</li>
            <li>Track payment status and delivery</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardInvoiceCreation;
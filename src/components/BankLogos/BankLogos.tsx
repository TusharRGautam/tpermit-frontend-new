import React from 'react';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import './BankLogos.css';

const BankLogos: React.FC = () => {
  const bankLogos = [
    {
      id: 1,
      name: 'State Bank of India',
      image: '/Website-Images/Banks/SBI.webp'
    },
    {
      id: 2,
      name: 'Union Bank',
      image: '/Website-Images/Banks/Union Bank.webp'
    },
    {
      id: 3,
      name: 'AU Bank',
      image: '/Website-Images/Banks/AU BANk.jpg'
    },
    {
      id: 4,
      name: 'IndusInd Bank',
      image: '/Website-Images/Banks/Indusind.webp'
    }
  ];

  return (
    <section className="bank-logos-section">
      <div className="section-container">
        <h3 className="section-subtitle">Financing Partners</h3>
        <div className="brands-container">
          {bankLogos.map(bank => (
            <div className="brand-logo" key={bank.id}>
              <OptimizedImage 
                src={bank.image} 
                alt={bank.name}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BankLogos; 
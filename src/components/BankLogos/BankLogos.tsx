import React from 'react';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import './BankLogos.css';

const BankLogos: React.FC = () => {
  const bankLogos = [
    {
      id: 1,
      name: 'State Bank of India',
      image: '/Website-Images/Banks/SBI.webp',
      interestRate: '10.15%',
      approvalRate: '85%'
    },
    {
      id: 2,
      name: 'Union Bank',
      image: '/Website-Images/Banks/Union Bank.webp',
      interestRate: '11.85%',
      approvalRate: '80%'
    },
    {
      id: 3,
      name: 'Mahindra Finance',
      image: '/Website-Images/Banks/mahindra.webp',
      interestRate: '12.5%',
      approvalRate: '88%'
    },
    {
      id: 4,
      name: 'Cholamandalam Bank',
      image: '/Website-Images/Banks/chola.webp',
      interestRate: '13.0%',
      approvalRate: '87%'
    },
    {
      id: 5,
      name: 'AU Bank',
      image: '/Website-Images/Banks/AU BANk.jpg',
      interestRate: '14.5%',
      approvalRate: '90%'
    }
  ];

  return (
    <section className="bank-logos-section">
      <div className="section-container">
        <h3 className="section-subtitle">Financing Partners</h3>
        <div className="brands-container">
          {bankLogos.map(bank => (
            <div className="brand-logo-card" key={bank.id}>
              <div className="brand-logo">
                <OptimizedImage
                  src={bank.image}
                  alt={bank.name}
                  loading="lazy"
                />
              </div>
              <h4 className="bank-name">{bank.name}</h4>
              <div className="bank-rates">
                <div className="rate-item">
                  <span className="rate-label">Interest Rate</span>
                  <span className="rate-value interest-rate">{bank.interestRate}</span>
                </div>
                <div className="rate-item">
                  <span className="rate-label">Approval Rate</span>
                  <span className="rate-value approval-rate">{bank.approvalRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BankLogos; 
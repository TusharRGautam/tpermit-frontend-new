import React from 'react';
import './BankLogos.css';

const BankLogos: React.FC = () => {
  const bankLogos = [
    {
      id: 1,
      name: 'State Bank of India',
      image: '/Website-Images/Banks/SBI.png'
    },
    {
      id: 2,
      name: 'Union Bank',
      image: '/Website-Images/Banks/Union Bank.png'
    },
    {
      id: 3,
      name: 'AU Bank',
      image: '/Website-Images/Banks/AU BANk.jpg'
    },
    {
      id: 4,
      name: 'IndusInd Bank',
      image: '/Website-Images/Banks/Indusind.png'
    }
  ];

  return (
    <section className="bank-logos-section">
      <div className="section-container">
        <h3 className="section-subtitle">Financing Partners</h3>
        <div className="brands-container">
          {bankLogos.map(bank => (
            <div className="brand-logo" key={bank.id}>
              <img src={bank.image} alt={bank.name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BankLogos; 
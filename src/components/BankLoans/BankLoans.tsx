import React, { useState } from 'react';
import './BankLoans.css';

interface BankProps {
  name: string;
  image: string;
  interestRate: string;
  loanAmount: string;
  colorClass: string;
}

const Bank: React.FC<BankProps> = ({ name, image, interestRate, loanAmount, colorClass }) => {
  const handleCallClick = () => {
    window.location.href = 'tel:+919987828690';
  };

  return (
    <div className="bank-card">
      <div className="bank-logo">
        <img src={image} alt={name} />
      </div>
      <div className="bank-details">
        <h4 className="bank-name">{name}</h4>
        <p className="interest-rate">Interest Rate: {interestRate}</p>
        <p className="loan-amount">Loan up to {loanAmount}</p>
        <button onClick={handleCallClick} className={`call-now ${colorClass}`}>
          📞 Call Now
        </button>
      </div>
    </div>
  );
};

const BankLoans: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  
  const banks = [
    {
      id: 1,
      name: 'State Bank of India',
      image: '/Website-Images/Banks/SBI.webp',
      interestRate: '7.5% - 9.5%',
      loanAmount: '₹75 Lakhs',
      colorClass: 'apply-sbi'
    },
    {
      id: 2,
      name: 'Union Bank',
      image: '/Website-Images/Banks/Union Bank.webp',
      interestRate: '7.7% - 9.8%',
      loanAmount: '₹80 Lakhs',
      colorClass: 'apply-union'
    },
    {
      id: 3,
      name: 'AU Bank',
      image: '/Website-Images/Banks/AU BANk.jpg',
      interestRate: '7.9% - 10.2%',
      loanAmount: '₹70 Lakhs',
      colorClass: 'apply-au'
    },
    {
      id: 4,
      name: 'IndusInd Bank',
      image: '/Website-Images/Banks/Indusind.webp',
      interestRate: '8.1% - 10.5%',
      loanAmount: '₹85 Lakhs',
      colorClass: 'apply-indusind'
    }
  ];
  
  const handleBankSelection = (bankId: number) => {
    setSelectedBank(bankId.toString());
  };

  return (
    <section className="bank-loans-section">
      <div className="section-container">
        <h2 className="section-title">Financing Partners</h2>
        <p className="section-description">
          Get the best loan offers from our trusted banking partners
        </p>
        
        <div className="bank-selection-options">
          <h3>Select Financing Option:</h3>
          <div className="bank-buttons">
            {banks.map(bank => (
              <button 
                key={bank.id}
                className={`bank-option-btn ${bank.colorClass} ${selectedBank === bank.id.toString() ? 'selected' : ''}`}
                onClick={() => handleBankSelection(bank.id)}
              >
                {bank.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        
        <div className="banks-container">
          {banks.map(bank => (
            <Bank
              key={bank.id}
              name={bank.name}
              image={bank.image}
              interestRate={bank.interestRate}
              loanAmount={bank.loanAmount}
              colorClass={bank.colorClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BankLoans; 
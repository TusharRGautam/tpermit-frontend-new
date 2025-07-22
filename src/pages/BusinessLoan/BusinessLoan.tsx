import React from 'react';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';
import './BusinessLoan.css';

const BusinessLoan: React.FC = () => {
  const loanProcess = [
    {
      step: 1,
      title: "Initial Application",
      description: "Submit loan application with basic business details",
      icon: "📝",
      duration: "1-2 days"
    },
    {
      step: 2,
      title: "CIBIL Score Check",
      description: "Bank verifies personal and business credit score (minimum 650+ required)",
      icon: "📊",
      duration: "1 day"
    },
    {
      step: 3,
      title: "Document Collection",
      description: "Submit required documents - KYC, ITR, GST returns, bank statements",
      icon: "📋",
      duration: "2-3 days"
    },
    {
      step: 4,
      title: "Financial Assessment",
      description: "Bank analyzes business financials, turnover, and cash flow",
      icon: "💰",
      duration: "3-5 days"
    },
    {
      step: 5,
      title: "Business Site Verification",
      description: "Physical verification of business premises and operations",
      icon: "🏢",
      duration: "1-2 days"
    },
    {
      step: 6,
      title: "Document Verification",
      description: "Thorough verification of all submitted documents",
      icon: "✅",
      duration: "2-3 days"
    },
    {
      step: 7,
      title: "Credit Committee Review",
      description: "Internal credit committee evaluates and approves the loan",
      icon: "👥",
      duration: "3-7 days"
    },
    {
      step: 8,
      title: "Loan Sanction Letter",
      description: "Bank issues loan sanction letter with terms and conditions",
      icon: "📄",
      duration: "1-2 days"
    },
    {
      step: 9,
      title: "Legal & Technical Check",
      description: "Legal verification of collateral and technical evaluation if applicable",
      icon: "⚖️",
      duration: "5-10 days"
    },
    {
      step: 10,
      title: "Loan Disbursement",
      description: "Final loan amount disbursed to business account",
      icon: "💸",
      duration: "1-3 days"
    }
  ];

  const bankDetails = [
    {
      name: "State Bank of India",
      logo: "/Website-Images/Banks/SBI.webp",
      interestRate: "10.15%",
      approvalRate: "85%",
      note: "Largest public sector bank with competitive rates for established businesses. Offers collateral-free loans up to ₹1 crore for MSME.",
      specialFeatures: ["No collateral up to ₹1 Cr", "Quick processing for existing customers", "Subsidized rates for women entrepreneurs"]
    },
    {
      name: "Union Bank of India",
      logo: "/Website-Images/Banks/Union Bank.png",
      interestRate: "11.85%",
      approvalRate: "80%",
      note: "Strong support for MSME sector with flexible repayment options. Excellent service for manufacturing and trading businesses.",
      specialFeatures: ["MSME focused schemes", "Flexible repayment terms", "Lower documentation for repeat customers"]
    },
    {
      name: "IndusInd Bank",
      logo: "/Website-Images/Banks/Indusind.webp",
      interestRate: "12.5%",
      approvalRate: "90%",
      note: "Private bank with faster processing and digital-first approach. Best for tech-savvy businesses needing quick funds.",
      specialFeatures: ["Digital loan process", "Quick approval", "Relationship-based pricing", "24/7 online support"]
    },
    {
      name: "AU Small Finance Bank",
      logo: "/Website-Images/Banks/AU BANk.jpg",
      interestRate: "14.5%",
      approvalRate: "90%",
      note: "Specialized in small business loans with minimal documentation. Ideal for small enterprises and startups with limited credit history.",
      specialFeatures: ["Minimal documentation", "Small business focus", "Quick turnaround", "Flexible eligibility criteria"]
    }
  ];

  const requiredDocuments = [
    "Aadhar Card",
    "PAN Card", 
    "Ghumasta",
    "Udyam Aadhar",
    "Bank Statement",
    "Driving License"
  ];

  // Phone numbers from footer
  const phoneNumbers = [
    { name: "Shailendra", number: "+919987828417" },
    { name: "Mithilesh", number: "+919987828690" },
    { name: "Pintu", number: "+919987798417" },
    { name: "Prakash", number: "+919004726521" }
  ];

  const handleCallClick = (phoneNumber: string) => {
    window.location.href = `tel:+919987828690`;
  };

  const handleWhatsAppClick = (phoneNumber: string) => {
    const message = "Hi! I'm interested in business loan options. Could you please provide more information?";
    const whatsappUrl = `https://wa.me/919987828417?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="business-loan-container">
      {/* Header Section */}
      <div className="loan-header">
        <h1>Business Loan Solutions</h1>
        <p className="loan-subtitle">
          Get funding for your business growth with competitive rates from top Indian banks
        </p>
      </div>

      {/* Quick Stats Section */}
      <section className="quick-stats">
        <h2>Current Interest Rates & Approval Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card sbi-card">
            <div className="stat-header">
              <div className="bank-logo-small">
                <OptimizedImage 
                  src="/Website-Images/Banks/SBI.webp" 
                  alt="SBI"
                  loading="lazy"
                />
              </div>
              <h3>State Bank of India</h3>
            </div>
            <div className="stat-content">
              <div className="rate-display">
                <div className="rate-item">
                  <span className="rate-label">Interest Rate</span>
                  <span className="rate-value roi">10.15%</span>
                </div>
                <div className="rate-item">
                  <span className="rate-label">Approval Rate</span>
                  <span className="rate-value approval">85%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="stat-card union-card">
            <div className="stat-header">
              <div className="bank-logo-small">
                <OptimizedImage 
                  src="/Website-Images/Banks/Union Bank.webp" 
                  alt="Union Bank"
                  loading="lazy"
                />
              </div>
              <h3>Union Bank of India</h3>
            </div>
            <div className="stat-content">
              <div className="rate-display">
                <div className="rate-item">
                  <span className="rate-label">Interest Rate</span>
                  <span className="rate-value roi">11.85%</span>
                </div>
                <div className="rate-item">
                  <span className="rate-label">Approval Rate</span>
                  <span className="rate-value approval">80%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="stat-card indusind-card">
            <div className="stat-header">
              <div className="bank-logo-small">
                <OptimizedImage 
                  src="/Website-Images/Banks/Indusind.webp" 
                  alt="IndusInd Bank"
                  loading="lazy"
                />
              </div>
              <h3>IndusInd Bank</h3>
            </div>
            <div className="stat-content">
              <div className="rate-display">
                <div className="rate-item">
                  <span className="rate-label">Interest Rate</span>
                  <span className="rate-value roi">12.5%</span>
                </div>
                <div className="rate-item">
                  <span className="rate-label">Approval Rate</span>
                  <span className="rate-value approval">90%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="stat-card au-card">
            <div className="stat-header">
              <div className="bank-logo-small">
                <OptimizedImage 
                  src="/Website-Images/Banks/AU BANk.jpg" 
                  alt="AU Small Finance Bank"
                  loading="lazy"
                />
              </div>
              <h3>AU Small Finance Bank</h3>
            </div>
            <div className="stat-content">
              <div className="rate-display">
                <div className="rate-item">
                  <span className="rate-label">Interest Rate</span>
                  <span className="rate-value roi">14.5%</span>
                </div>
                <div className="rate-item">
                  <span className="rate-label">Approval Rate</span>
                  <span className="rate-value approval">90%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="stats-note">
          <p><strong>Updated Rates:</strong> Interest rates are current as of this month and subject to change based on credit profile and loan amount. Approval rates are based on our historical data.</p>
        </div>
      </section>

      {/* Bank Partners Section */}
      <section className="bank-partners">
        <h2>Our Banking Partners</h2>
        <div className="banks-grid">
          {bankDetails.map((bank, index) => (
            <div key={index} className="bank-card">
              <div className="bank-logo">
                <OptimizedImage 
                  src={bank.logo} 
                  alt={bank.name}
                  loading="lazy"
                />
              </div>
              <div className="bank-info">
                <h3>{bank.name}</h3>
                <div className="bank-details">
                  <div className="detail-item">
                    <span className="label">Interest Rate (ROI):</span>
                    <span className="value">{bank.interestRate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Approval Rate:</span>
                    <span className="value success-rate">{bank.approvalRate}</span>
                  </div>
                </div>
                <div className="bank-note">
                  <p>{bank.note}</p>
                </div>
                <div className="special-features">
                  <h4>Special Features:</h4>
                  <ul>
                    {bank.specialFeatures.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Loan Process Section */}
      {/* <section className="loan-process">
        <h2>Complete Loan Approval Process</h2>
        <p className="process-subtitle">
          Understanding the step-by-step process helps you prepare better and get faster approvals
        </p>
        <div className="process-timeline">
          {loanProcess.map((process, index) => (
            <div key={index} className="process-step">
              <div className="step-number">
                <span className="step-icon">{process.icon}</span>
                <span className="step-num">{process.step}</span>
              </div>
              <div className="step-content">
                <h3>{process.title}</h3>
                <p>{process.description}</p>
                <span className="step-duration">Duration: {process.duration}</span>
              </div>
              {index < loanProcess.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
        <div className="total-timeline">
          <h3>📅 Total Processing Time: 15-45 days (varies by bank and loan amount)</h3>
        </div>
      </section> */}

      {/* Required Documents Section */}
      <section className="required-documents">
        <h2>Required Documents Checklist</h2>
        <div className="documents-grid">
          {requiredDocuments.map((doc, index) => (
            <div key={index} className="document-item">
              <span className="doc-icon">📄</span>
              <span className="doc-name">{doc}</span>
            </div>
          ))}
        </div>
        <div className="documents-note">
          <p><strong>Note:</strong> These are the essential documents required for business loan application. 
          Our team will guide you through the complete documentation process.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-cta">
          <h2>Ready to Apply for Your Business Loan?</h2>
          <p>Our expert team will help you choose the right bank and guide you through the entire process</p>
          
          <div className="single-contact-method">
            <button 
              className="contact-btn call-now-single"
              onClick={() => handleCallClick("+919987828690")}
            >
              📞 Call Now
            </button>
            <p className="contact-number">+91 99878 28690 (Mithilesh)</p>
          </div>
          
          <div className="contact-info">
            <p>📧 Email: asw.cars@gmail.com</p>
            <p>📍 GB 60, Ground floor, High Street Mall, Kapurbawdi, Thane West, Thane-400607</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessLoan; 
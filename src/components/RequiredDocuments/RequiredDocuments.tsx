import React from 'react';
import './RequiredDocuments.css';

const RequiredDocuments: React.FC = () => {
  const requiredDocuments = [
    "Aadhar Card",
    "PAN Card",
    "Ghumasta",
    "Udyam Aadhar",
    "Bank Statement",
    "Driving License"
  ];

  return (
    <section className="required-documents-section">
      <div className="required-documents-container">
        <h2>Required Documents Checklist</h2>
        <p className="documents-subtitle">
          Essential documents needed for business loan application
        </p>
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
      </div>
    </section>
  );
};

export default RequiredDocuments;

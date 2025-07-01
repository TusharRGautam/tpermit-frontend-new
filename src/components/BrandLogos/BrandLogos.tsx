import React from 'react';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import './BrandLogos.css';

const BrandLogos: React.FC = () => {
  const brandLogos = [
    {
      id: 1,
      name: 'Toyota',
      image: '/Website-Images/Brands/Toyota.jpg'
    },
    {
      id: 2,
      name: 'Hyundai',
      image: '/Website-Images/Brands/Hyundai.jpg'
    },
    {
      id: 3,
      name: 'Maruti Suzuki',
      image: '/Website-Images/Brands/Maruti-Suzuki-Logo.png'
    }
  ];

  return (
    <section className="brand-logos-section">
      <div className="section-container">
        <h3 className="section-subtitle">Our Partners</h3>
        <div className="brands-container">
          {brandLogos.map(brand => (
            <div className="brand-logo" key={brand.id}>
              <OptimizedImage 
                src={brand.image} 
                alt={brand.name}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos; 
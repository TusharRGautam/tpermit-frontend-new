import React from 'react';
import './BannerSection.css';

const BannerSection: React.FC = () => {
  const scrollToFindYourCar = () => {
    const findYourCarSection = document.querySelector('.find-your-car-section');
    if (findYourCarSection) {
      findYourCarSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="banner-section">
      <div className="banner-container">
        <img 
          src="/Website-Images/Banners/hero-banner.jpg" 
          alt="Gautam Motors - T-Permit Commercial Car Dealership" 
          loading="eager"
          className="hero-banner-image"
        />
        <div className="banner-overlay-action">
          <button onClick={scrollToFindYourCar} className="banner-explore-btn">
            Explore T-Permit Cars &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
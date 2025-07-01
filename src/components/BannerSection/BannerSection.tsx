import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './BannerSection.css';

const BannerSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if screen is mobile on initial load
    checkIfMobile();
    
    // Add resize listener to update on window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up listener on component unmount
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Function to check if device is mobile based on screen width
  const checkIfMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const banners = [
    {
      id: 1,
      image: '/Website-Images/Banners/Ertiga.png',
      alt: 'Maruti Suzuki Ertiga',
      title: 'Maruti Suzuki Ertiga',
      price: '₹8,64,000',
      downPayment: '₹86,400',
      emi: '₹12,456/month',
      cta: 'View More'
    },
    {
      id: 2,
      image: '/Website-Images/Banners/AURA.png',
      alt: 'Hyundai Aura',
      title: 'Hyundai Aura',
      price: '₹6,49,000',
      downPayment: '₹64,900',
      emi: '₹9,340/month',
      cta: 'Explore More'
    },
    {
      id: 3,
      image: '/Website-Images/Banners/Rumion.png',
      alt: 'Maruti Suzuki Rumion',
      title: 'Maruti Suzuki Rumion',
      price: '₹7,74,000',
      downPayment: '₹77,400',
      emi: '₹11,128/month',
      cta: 'Learn More'
    }
  ];

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
      <Carousel
        autoPlay={true}
        infiniteLoop={true}
        showStatus={false}
        showThumbs={false}
        interval={5000}
        transitionTime={500}
        showArrows={!isMobile} // Hide arrows on mobile for better UX
        emulateTouch={true}
        dynamicHeight={false} // Set to false for consistent height
        stopOnHover={false}
        swipeable={true}
        useKeyboardArrows={true}
      >
        {banners.map(banner => (
          <div key={banner.id} className="banner-slide">
            <div className="banner-container">
              <div className="banner-image-box">
                <img 
                  src={banner.image} 
                  alt={banner.alt} 
                  loading="eager"
                  onError={(e) => {
                    console.error(`Failed to load banner image: ${banner.image}`);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="banner-content-box">
                <div className="banner-content">
                  <h1 className="banner-title">{banner.title}</h1>
                  <div className="price-details">
                    <div className="price-row">
                      <span className="price-label">Starting Price:</span>
                      <span className="price-value">{banner.price}</span>
                    </div>
                    <div className="downpayment-highlight">
                      <span className="downpayment-label">Down Payment:</span>
                      <span className="downpayment-value">{banner.downPayment}</span>
                    </div>
                    <div className="emi-row">
                      <span className="emi-label">EMI from:</span>
                      <span className="emi-value">{banner.emi}</span>
                    </div>
                  </div>
                  <button onClick={scrollToFindYourCar} className="banner-btn">{banner.cta}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default BannerSection; 
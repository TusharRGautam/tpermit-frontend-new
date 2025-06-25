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
      alt: 'Maruti Suzuki Ertiga'
    },
    {
      id: 2,
      image: '/Website-Images/Banners/AURA.png',
      alt: 'Hyundai Aura'
    },
    {
      id: 3,
      image: '/Website-Images/Banners/Rumion.png',
      alt: 'Maruti Suzuki Rumion'
    }
  ];

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
        ))}
      </Carousel>
    </section>
  );
};

export default BannerSection; 
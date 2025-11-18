import React, { useEffect, useState } from 'react';
import './BannerSection.css';

interface CarImage {
  id: number;
  src: string;
  alt: string;
  brand: string;
  model: string;
  variant: string;
  price: string;
}

const BannerSection: React.FC = () => {
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [nextCarIndex, setNextCarIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [textKey, setTextKey] = useState(0);
  const [displayedCarIndex, setDisplayedCarIndex] = useState(0);

  const carImages: CarImage[] = [
    { 
      id: 1, 
      src: '/Website-Images/Cars/Aura.png', 
      alt: 'Hyundai Aura',
      brand: 'HYUNDAI',
      model: 'AURA',
      variant: 'SX Plus 1.2L Petrol',
      price: '₹8,09,000'
    },
    { 
      id: 2, 
      src: '/Website-Images/Cars/Crysta.png', 
      alt: 'Toyota Crysta',
      brand: 'TOYOTA',
      model: 'CRYSTA',
      variant: 'GX 2.4L Diesel MT',
      price: '₹18,05,000'
    },
    { 
      id: 3, 
      src: '/Website-Images/Cars/Dzire.png', 
      alt: 'Maruti Suzuki Dzire',
      brand: 'MARUTI',
      model: 'DZIRE',
      variant: 'ZXI Plus 1.2L Petrol',
      price: '₹8,69,000'
    },
    { 
      id: 4, 
      src: '/Website-Images/Cars/Rumion.png', 
      alt: 'Maruti Suzuki Rumion',
      brand: 'MARUTI',
      model: 'RUMION',
      variant: 'Smart Hybrid Zeta',
      price: '₹7,74,000'
    },
    { 
      id: 5, 
      src: '/Website-Images/Cars/ertiga.png', 
      alt: 'Maruti Suzuki Ertiga',
      brand: 'MARUTI',
      model: 'ERTIGA',
      variant: 'ZXI Plus Smart Hybrid',
      price: '₹8,64,000'
    },
    { 
      id: 6, 
      src: '/Website-Images/Cars/wagnor.png', 
      alt: 'Maruti Suzuki WagonR',
      brand: 'MARUTI',
      model: 'WAGNOR',
      variant: 'ZXI Plus 1.0L Petrol',
      price: '₹6,35,000'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      const nextIndex = (currentCarIndex + 1) % carImages.length;
      setNextCarIndex(nextIndex);
      
      // Change text when the new car image is at center (halfway through slide)
      setTimeout(() => {
        setDisplayedCarIndex(nextIndex);
        setTextKey(prev => prev + 1);
      }, 1000); // Change text when new car is visible at center
      
      // Complete the transition
      setTimeout(() => {
        setCurrentCarIndex(nextIndex);
        setIsAnimating(false);
      }, 2000); // Complete slide animation
    }, 4500); // Change car every 4.5 seconds

    return () => clearInterval(interval);
  }, [currentCarIndex, carImages.length]);

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
      <div className="banner-slide">
        <div className="banner-container">
          {/* Background Banner Image */}
          <div className="banner-background">
            <img 
              src="/Website-Images/Banners/New-banner.png" 
              alt="New Banner Background" 
              loading="eager"
              className="banner-bg-image"
              onError={(e) => {
                console.error('Failed to load banner background: /Website-Images/Banners/New-banner.png');
              }}
            />
          </div>
          
          {/* Car Slider Overlay */}
          <div className="car-slider-overlay">
            <div className="car-slider-container">
              <div className="car-slider-track">
                {/* Current car */}
                <div className={`car-slide ${isAnimating ? 'slide-out-left' : 'active'}`}>
                  <img
                    src={carImages[currentCarIndex].src}
                    alt={carImages[currentCarIndex].alt}
                    className="car-slider-image"
                    onError={(e) => {
                      console.error(`Failed to load car image: ${carImages[currentCarIndex].src}`);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Next car */}
                {isAnimating && (
                  <div className="car-slide slide-in-right">
                    <img
                      src={carImages[nextCarIndex].src}
                      alt={carImages[nextCarIndex].alt}
                      className="car-slider-image"
                      onError={(e) => {
                        console.error(`Failed to load car image: ${carImages[nextCarIndex].src}`);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Car Details Text Overlay */}
              <div className="car-details-overlay">
                <div className={`car-text-container ${isAnimating ? 'text-animating' : 'text-entering'}`}>
                  <div className="split-text-container" key={`text-${textKey}`}>
                    <span className="text-part left" key={`brand-${textKey}`}>
                      {carImages[displayedCarIndex].brand}
                    </span>
                    <span className="text-part right" key={`model-${textKey}`}>
                      {carImages[displayedCarIndex].model}
                    </span>
                  </div>
                  <div className="car-variant-info" key={`info-${textKey}`}>
                    <p className="car-variant fade-in">{carImages[displayedCarIndex].variant}</p>
                    <p className="car-price fade-in">Starting from {carImages[displayedCarIndex].price}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust Messages */}
          <div className="trust-messages">
            <p className="trust-message-hindi">भरोसा रखो और बुक करो, 100% सुरक्षित है।</p>
            <p className="trust-message-marathi">विश्वास ठेवा आणि बुक करा, 100% सुरक्षित आहे.</p>
          </div>

          {/* Action Button */}
          <div className="banner-content-box">
            <div className="banner-content">
              <button onClick={scrollToFindYourCar} className="banner-btn">Explore Our Cars</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection; 
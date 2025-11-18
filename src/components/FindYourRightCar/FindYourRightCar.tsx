import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './FindYourRightCar.css';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { globalFetchCarsData } from '../../redux/slices/globalCarsSlice';
import { 
  selectGlobalCarsLoading, 
  selectGlobalCarsError,
  selectGlobalCarsWithEmi 
} from '../../redux/selectors';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import BookingModal from '../BookingModal/BookingModal';

interface CarVariant {
  id: string;
  name: string;
  exShowroom: number;
  onRoadPrice: number;
  monthlyEmi: number;
  downPayment: number;
  bookingAmount: number;
}

interface CarCardProps {
  id: string;
  image: string;
  name: string;
  downPayment: string;
  monthlyEmi?: string;
  variants: Array<{
    name: string;
    colors: string[];
  }>;
  carVariants: CarVariant[];
  carData: any;
  onBookNow: (carName: string, carImage: string, variants: CarVariant[], carData?: any) => void;
}

const CarCard: React.FC<CarCardProps> = ({ 
  id, 
  image, 
  name, 
  downPayment, 
  monthlyEmi, 
  variants, 
  carVariants, 
  carData,
  onBookNow 
}) => {
  const bookingAmount = 5000; // Fixed booking amount for all cars

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookNow(name, image, carVariants, carData);
  };

  return (
    <Link to={`/car/${id}`} className="car-compact-card-link">
      <div className="car-compact-card">
        <div className="todays-offers-badge">✨ Book Online</div>

        <div className="car-compact-image">
          <OptimizedImage
            src={image}
            alt={name}
            loading="lazy"
            className="car-image-optimized"
            onError={() => console.warn(`Failed to load image for ${name}: ${image}`)}
            placeholder="/Website-Images/Cars/placeholder.svg"
          />
        </div>

        <div className="car-compact-content">
          <h3 className="car-compact-title">{name}</h3>

          <div className="car-variants-compact">
            {variants.slice(0, 3).map((variant, index) => (
              <span key={index} className="variant-tag">
                {variant.name}
              </span>
            ))}
            {variants.length > 3 && (
              <span className="variant-tag">
                +{variants.length - 3} more
              </span>
            )}
          </div>

          <div className="car-price-section">
            <div className="price-row">
              <span className="price-label">Down Payment:</span>
              <span className="price-value">{downPayment.replace('Down Payment: ', '')}</span>
            </div>
            {monthlyEmi && (
              <div className="price-row">
                <span className="price-label">EMI from:</span>
                <span className="price-value">{monthlyEmi}</span>
              </div>
            )}
            <div className="price-row">
              <span className="price-label">Book with:</span>
              <span className="price-value booking-amount">₹{bookingAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="car-actions">
            <button
              className="booking-btn"
              onClick={handleBookNow}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Book Now
            </button>

            <Link to={`/car/${id}`} className="booking-btn-outline" onClick={(e) => e.stopPropagation()}>
              View Details
            </Link>
          </div>

          <div className="contact-buttons-compact">
            <a
              href="tel:+918652089525"
              className="contact-btn call-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fa fa-phone"></i>
            </a>
            <a
              href="https://wa.me/918652089525"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn whatsapp-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fa fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    </Link>
  );
};

interface BookingData {
  carName: string;
  variant: CarVariant;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingAmount: number;
}

const FindYourRightCar: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Global state selectors
  const globalCarsWithEmi = useAppSelector(selectGlobalCarsWithEmi);
  const globalIsLoading = useAppSelector(selectGlobalCarsLoading);
  const globalError = useAppSelector(selectGlobalCarsError);

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCarForBooking, setSelectedCarForBooking] = useState<{
    name: string;
    image: string;
    variants: CarVariant[];
  } | null>(null);

  // Fetch car data on component mount
  useEffect(() => {
    dispatch(globalFetchCarsData());
  }, [dispatch]);

  // Function to convert actual car variants to booking variants with pricing
  const generateCarVariants = (carData: any): CarVariant[] => {
    const basePrice = carData.globalExShowroomPrice || 700000;
    const onRoadPrice = carData.globalTotalOnRoadPrice || Math.floor(basePrice * 1.15);
    const loanAmount = carData.globalLoanAmount || Math.floor(basePrice * 0.85);
    const monthlyEmi = Math.floor((loanAmount * (carData.globalInterestRate || 8.5) / 100) / 12 + loanAmount / 60);

    // Use actual variant names from the car data
    return carData.variants.map((variant: any, index: number) => {
      // Calculate variant-specific pricing (slight variations based on features)
      const variantMultiplier = 1 + (index * 0.1); // Each variant is 10% more expensive than previous
      const variantExShowroom = Math.floor(basePrice * variantMultiplier);
      const variantOnRoad = Math.floor(onRoadPrice * variantMultiplier);
      const variantEmi = Math.floor(monthlyEmi * variantMultiplier);

      return {
        id: `${carData.id}-${variant.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: variant.name,
        exShowroom: variantExShowroom,
        onRoadPrice: variantOnRoad,
        monthlyEmi: variantEmi,
        downPayment: Math.floor(variantExShowroom * 0.15), // 15% down payment
        bookingAmount: 5000 // Fixed booking amount for all cars
      };
    });
  };

  const handleBookNow = (carName: string, carImage: string, variants: CarVariant[], carData?: any) => {
    const carVariants = variants.length > 0 ? variants : (carData ? generateCarVariants(carData) : []);
    
    // Check if we're on mobile/tablet (including touch devices)
    const isMobileOrTablet = window.innerWidth <= 992 || 
                            'ontouchstart' in window || 
                            navigator.maxTouchPoints > 0;
    
    if (isMobileOrTablet) {
      // AGGRESSIVE SCROLL TO TOP - Multiple methods
      const scrollToTopMethods = [
        () => window.scrollTo(0, 0),
        () => { document.documentElement.scrollTop = 0; },
        () => { document.body.scrollTop = 0; },
        () => { window.pageYOffset = 0; },
        () => { 
          try {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          } catch (e) {}
        }
      ];
      
      // Execute all scroll methods
      scrollToTopMethods.forEach(method => {
        try { method(); } catch (e) {}
      });
      
      // Also force any parent containers to scroll to top
      const containers = document.querySelectorAll('[style*="overflow"], .app, .main, .content');
      containers.forEach(container => {
        try {
          (container as HTMLElement).scrollTop = 0;
        } catch (e) {}
      });
      
      // Set modal data
      setSelectedCarForBooking({
        name: carName,
        image: carImage,
        variants: carVariants
      });
      
      // Use requestAnimationFrame to ensure scroll happens before modal opens
      requestAnimationFrame(() => {
        // One more scroll attempt right before opening
        window.scrollTo(0, 0);
        setIsBookingModalOpen(true);
        
        // Additional scroll after modal opens
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
        });
      });
    } else {
      // Desktop - immediate modal opening
      setSelectedCarForBooking({
        name: carName,
        image: carImage,
        variants: carVariants
      });
      setIsBookingModalOpen(true);
    }
  };


  return (
    <>
      <section className="find-your-car-section">
        <div className="section-container">
          <div className="section-header">
            {/* <h2 className="section-title">Book Your Dream Car Online</h2> */}
            {/* <div className="section-subtitle">
              <p>Secure your vehicle with a simple booking token and drive home your dream car</p>
              <div className="booking-features">
                <div className="feature-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Secure Online Booking</span>
                </div>
                <div className="feature-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Quick 2-Minute Process</span>
                </div>
                <div className="feature-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.55 1.23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Flexible Payment Options</span>
                </div>
              </div>
              {globalError && (
                <div className="error-notice">
                  ⚠️ {globalError}
                </div>
              )}
            </div> */}
          </div>
          
          {globalIsLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading latest car offers...</p>
            </div>
          ) : (
            <div className="car-compact-grid">
              {globalCarsWithEmi.map((car) => (
                <CarCard 
                  key={car.id} 
                  id={car.id}
                  image={car.image} 
                  name={car.name} 
                  downPayment={car.downPayment}
                  monthlyEmi={car.monthlyEmi}
                  variants={car.variants}
                  carVariants={generateCarVariants(car)}
                  carData={car}
                  onBookNow={handleBookNow}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedCarForBooking && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          carName={selectedCarForBooking.name}
          carImage={selectedCarForBooking.image}
          variants={selectedCarForBooking.variants}
        />
      )}
    </>
  );
};

export default FindYourRightCar;
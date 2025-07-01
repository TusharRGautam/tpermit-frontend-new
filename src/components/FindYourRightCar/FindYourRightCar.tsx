import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FindYourRightCar.css';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { globalFetchCarsData } from '../../redux/slices/globalCarsSlice';
import { 
  selectGlobalCarsList, 
  selectGlobalCarsLoading, 
  selectGlobalCarsError,
  selectGlobalCarsWithEmi 
} from '../../redux/selectors';

interface CarData {
  id: string;
  image: string;
  name: string;
  downPayment: string;
  monthlyEmi?: string;
  variants: Array<{
    name: string;
    colors: string[];
  }>;
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
}

const CarCard: React.FC<CarCardProps> = ({ id, image, name, downPayment, monthlyEmi, variants }) => (
  <div className="car-card">
    <div className="todays-offers-badge">Today's Offers</div>
    <Link to={`/car/${id}`} className="car-link">
      <div className="car-image">
        <img src={image} alt={name} loading="lazy" />
      </div>
      <div className="car-info">
        <h3 className="car-name">{name}</h3>
        <div className="car-variants">
          <p className="variants-label">Available Variants:</p>
          {variants.slice(0, 2).map((variant, index) => (
            <div key={index} className="variant-info">
              <span className="variant-name">{variant.name}</span>
              <div className="color-count">
                {variant.colors.length} colors
              </div>
            </div>
          ))}
          {variants.length > 2 && (
            <div className="more-variants">
              +{variants.length - 2} more variants
            </div>
          )}
        </div>
        <div className="payment-info">
          <div className="payment-item">
            <span className="payment-label">Down Payment:</span>
            <span className="payment-value">{downPayment.replace('Down Payment: ', '')}</span>
          </div>
          {monthlyEmi && (
            <div className="payment-item">
              <span className="payment-label">EMI from:</span>
              <span className="payment-value">{monthlyEmi}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
    <div className="contact-buttons">
      <a 
        href="tel:+919987828690" 
        className="contact-btn call-btn"
        onClick={(e) => e.stopPropagation()}
      >
        <i className="fa fa-phone"></i> Call
      </a>
      <a 
        href="https://wa.me/919987828417" 
        target="_blank" 
        rel="noopener noreferrer"
        className="contact-btn whatsapp-btn"
        onClick={(e) => e.stopPropagation()}
      >
        <i className="fa fa-whatsapp"></i> WhatsApp
      </a>
    </div>
  </div>
);

const FindYourRightCar: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Global state selectors
  const globalCarsList = useAppSelector(selectGlobalCarsList);
  const globalCarsWithEmi = useAppSelector(selectGlobalCarsWithEmi);
  const globalIsLoading = useAppSelector(selectGlobalCarsLoading);
  const globalError = useAppSelector(selectGlobalCarsError);

  // Fetch car data on component mount
  useEffect(() => {
    dispatch(globalFetchCarsData());
  }, [dispatch]);

  return (
    <section className="find-your-car-section">
      <div className="section-container">
        <h2 className="section-title">Find Your Right Car</h2>
        <div className="section-subtitle">
          <p>Explore our selection of premium vehicles with flexible financing options</p>
          {globalError && (
            <div className="error-notice" style={{ 
              backgroundColor: '#fff3cd', 
              color: '#856404', 
              padding: '8px 16px', 
              borderRadius: '4px', 
              marginTop: '12px',
              fontSize: '14px'
            }}>
              ⚠️ {globalError}
            </div>
          )}
        </div>
        
        {globalIsLoading ? (
          <div className="loading-state" style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div className="loading-spinner" style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }}></div>
            <p>Loading latest car offers from global state...</p>
          </div>
        ) : (
          <div className="car-grid">
            {globalCarsWithEmi.map((car) => (
              <CarCard 
                key={car.id} 
                id={car.id}
                image={car.image} 
                name={car.name} 
                downPayment={car.downPayment}
                monthlyEmi={car.monthlyEmi}
                variants={car.variants}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FindYourRightCar;
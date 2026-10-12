import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FindYourRightCar.css';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { globalFetchCarsData } from '../../redux/slices/globalCarsSlice';
import { 
  selectGlobalCarsLoading, 
  selectGlobalCarsWithEmi 
} from '../../redux/selectors';
import OptimizedImage from '../OptimizedImage/OptimizedImage';

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

const CarCard: React.FC<CarCardProps> = ({ 
  id, 
  image, 
  name, 
  downPayment, 
  monthlyEmi, 
  variants
}) => {
  const whatsappUrl = `https://wa.me/918652089525?text=Hello%20Gautam%20Motors,%20I%20am%20interested%20in%20${encodeURIComponent(name)}%20T-Permit%20Commercial%20Car.%20Please%20share%20quotation%20and%20loan%20details.`;

  return (
    <div className="car-compact-card">
      <Link to={`/car/${id}`} className="car-compact-image-wrap">
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
      </Link>

      <div className="car-compact-content">
        <Link to={`/car/${id}`} className="car-title-link">
          <h3 className="car-compact-title">{name}</h3>
        </Link>

        <div className="car-variants-compact">
          {variants.slice(0, 2).map((variant, index) => (
            <span key={index} className="variant-tag">
              {variant.name}
            </span>
          ))}
          {variants.length > 2 && (
            <span className="variant-tag-more">+{variants.length - 2}</span>
          )}
        </div>

        <div className="car-compact-price">
          <div className="price-item">
            <span className="price-label">Down:</span>
            <span className="price-val">{downPayment.replace('Down Payment: ', '')}</span>
          </div>
          {monthlyEmi && (
            <div className="price-item">
              <span className="price-label">EMI:</span>
              <span className="price-val">{monthlyEmi}</span>
            </div>
          )}
        </div>

        <div className="car-compact-actions">
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="booking-btn-compact"
          >
            Enquire
          </a>
          <Link to={`/car/${id}`} className="view-details-link">
            Details &rarr;
          </Link>
          <div className="compact-quick-contact">
            <a href="tel:+918652089525" className="quick-btn phone" title="Call Showroom">
              <i className="fa fa-phone"></i>
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="quick-btn whatsapp" title="Chat on WhatsApp">
              <i className="fa fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const FindYourRightCar: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Global state selectors
  const globalCarsWithEmi = useAppSelector(selectGlobalCarsWithEmi);
  const globalIsLoading = useAppSelector(selectGlobalCarsLoading);

  useEffect(() => {
    dispatch(globalFetchCarsData());
  }, [dispatch]);

  return (
    <section className="find-your-car-section">
      <div className="section-container">
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
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FindYourRightCar;
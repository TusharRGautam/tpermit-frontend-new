import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import './Header.css';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useSelector((state: RootState) => state.cart);
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  
  // Function to scroll to the Footer section
  const scrollToFooter = (e: React.MouseEvent) => {
    e.preventDefault();
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu when navigating
    setMobileMenuOpen(false);
  };

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle mobile menu interactions and prevent unwanted activation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        headerRef.current &&
        !headerRef.current.querySelector('.mobile-menu-toggle')?.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    // Prevent all touch gestures from opening the menu
    const preventSwipeGestures = (e: TouchEvent) => {
      // If menu is closed and this is a potential swipe gesture, prevent it
      if (!mobileMenuOpen && e.touches.length === 1) {
        const touch = e.touches[0];
        const isRightEdgeSwipe = touch.pageX > window.innerWidth * 0.8;
        const isLeftSwipe = touch.pageX < window.innerWidth * 0.2;
        
        // Prevent any edge swipes that could trigger menu
        if (isRightEdgeSwipe || isLeftSwipe) {
          e.preventDefault();
        }
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    
    // Prevent swipe gestures on mobile
    if (window.innerWidth <= 992) {
      document.addEventListener('touchstart', preventSwipeGestures, { passive: false });
      document.addEventListener('touchmove', preventSwipeGestures, { passive: false });
    }

    // Prevent body scroll when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('touchstart', preventSwipeGestures);
      document.removeEventListener('touchmove', preventSwipeGestures);
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = (event?: React.MouseEvent | React.TouchEvent) => {
    // Only allow menu toggle if it's explicitly triggered by a button click
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Additional safety check - only toggle on small screens
    if (window.innerWidth <= 992) {
      setMobileMenuOpen(!mobileMenuOpen);
    }
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header ref={headerRef} className={`header ${scrolled ? 'header-scrolled' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <div className="logo">
        <Link to="/">
          <OptimizedImage 
            src="/Website-Images/L3.png" 
            alt="Gautam Motors Logo"
            loading="eager"
            priority={true}
          />
        </Link>
      </div>
      
      {/* Mobile menu toggle button */}
      <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <span className={`menu-icon ${mobileMenuOpen ? 'active' : ''}`}></span>
      </div>

      {/* Main navigation for desktop */}
      <nav className="nav-menu desktop-menu">
        <ul>
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              CARS
            </Link>
          </li>
          <li>
            <Link
              to="/about-us"
              className={location.pathname === '/about-us' ? 'active' : ''}
            >
              ABOUT US
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* Mobile navigation menu */}
      <nav ref={mobileMenuRef} className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link
              to="/"
              className={location.pathname === '/' ? 'active' : ''}
              onClick={handleMobileLinkClick}
            >
              CARS
            </Link>
          </li>
          <li>
            <Link 
              to="/about-us" 
              className={location.pathname === '/about-us' ? 'active' : ''}
              onClick={handleMobileLinkClick}
            >
              ABOUT US
            </Link>
          </li>
          <li>
            <a href="tel:+918652089525" className="mobile-call-link" onClick={handleMobileLinkClick}>
              <i className="fa fa-phone" style={{ marginRight: '8px' }}></i> CALL US
            </a>
          </li>
          <li>
            <a href="https://wa.me/918652089525" target="_blank" rel="noopener noreferrer" className="mobile-wa-link" onClick={handleMobileLinkClick}>
              <i className="fa fa-whatsapp" style={{ marginRight: '8px' }}></i> WHATSAPP
            </a>
          </li>
          <li className="mobile-contact-item">
            <a href="#footer" onClick={scrollToFooter} className="contact-button mobile-contact">
              CONTACT US
            </a>
          </li>
        </ul>
      </nav>

      <div className="right-space">
        <div className="header-actions">
          <a href="tel:+918652089525" className="header-call-btn" title="Call Us">
            <i className="fa fa-phone"></i>
            <span>CALL US</span>
          </a>
          <a href="https://wa.me/918652089525" target="_blank" rel="noopener noreferrer" className="header-wa-btn" title="WhatsApp">
            <i className="fa fa-whatsapp"></i>
            <span>WHATSAPP</span>
          </a>
          <a href="#footer" onClick={scrollToFooter} className="contact-button">
            CONTACT US
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header; 
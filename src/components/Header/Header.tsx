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
              to="/my-bookings"
              className={location.pathname === '/my-bookings' ? 'active' : ''}
              onClick={handleMobileLinkClick}
            >
              MY BOOKINGS
            </Link>
          </li>
          <li>
            <Link
              to="/cart"
              className={`mobile-cart-link ${location.pathname === '/cart' ? 'active' : ''}`}
              onClick={handleMobileLinkClick}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 17.6 16.6 18 16 18H8C7.4 18 7 17.6 7 17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="20" r="1" stroke="currentColor" strokeWidth="2"/>
                <circle cx="20" cy="20" r="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
              CART {totalItems > 0 && `(${totalItems})`}
            </Link>
          </li>
          <li>
            <Link 
              to="/" 
              className="mobile-book-now"
              onClick={handleMobileLinkClick}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              BOOK NOW
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
          <li className="mobile-contact-item">
            <a href="#footer" onClick={scrollToFooter} className="contact-button mobile-contact">
              CONTACT US
            </a>
          </li>
        </ul>
      </nav>

      <div className="right-space">
        <div className="header-actions">
          <Link
            to="/my-bookings"
            className={`my-bookings-button ${location.pathname === '/my-bookings' ? 'active' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2H4v20h16V2h-5M9 2v4h6V2M9 2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            MY BOOKINGS
          </Link>
          <Link to="/cart" className="cart-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 17.6 16.6 18 16 18H8C7.4 18 7 17.6 7 17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="20" r="1" stroke="currentColor" strokeWidth="2"/>
              <circle cx="20" cy="20" r="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="cart-text">CART</span>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>
          <Link to="/" className="book-now-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            BOOK NOW
          </Link>
          <a href="#footer" onClick={scrollToFooter} className="contact-button">
            CONTACT US
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header; 
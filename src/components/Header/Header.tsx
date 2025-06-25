import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <div className="logo">
        <Link to="/">
          <img src="/Website-Images/Logo/logo.jpg" alt="ASW Logo" />
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
              NEW CARS
            </Link>
          </li>
          <li>
            <Link 
              to="/finance-offers" 
              className={location.pathname === '/finance-offers' ? 'active' : ''}
            >
              FINANCE OFFERS
            </Link>
          </li>
          <li>
            <Link 
              to="/business-loan" 
              className={location.pathname === '/business-loan' ? 'active' : ''}
            >
              BUSINESS LOAN
            </Link>
          </li>
          {/* <li>
            <Link 
              to="/offers" 
              className={location.pathname === '/offers' ? 'active' : ''}
            >
              OFFERS
            </Link>
          </li> */}
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
      <nav className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
              onClick={handleMobileLinkClick}
            >
              NEW CARS
            </Link>
          </li>
          <li>
            <Link 
              to="/finance-offers" 
              className={location.pathname === '/finance-offers' ? 'active' : ''}
              onClick={handleMobileLinkClick}
            >
              FINANCE OFFERS
            </Link>
          </li>
          <li>
            <Link 
              to="/business-loan" 
              className={location.pathname === '/business-loan' ? 'active' : ''}
              onClick={handleMobileLinkClick}
            >
              BUSINESS LOAN
            </Link>
          </li>
          <li>
            <Link 
              to="/offers" 
              className={location.pathname === '/offers' ? 'active' : ''}
              onClick={handleMobileLinkClick}
            >
              OFFERS
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
        <a href="#footer" onClick={scrollToFooter} className="contact-button">
          CONTACT US
        </a>
      </div>
    </header>
  );
};

export default Header; 
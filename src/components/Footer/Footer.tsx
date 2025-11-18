import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3 className="footer-heading">About Us</h3>
            <p>
              T-Permit is a leading car dealership in India offering a wide range of new cars 
              with attractive financing options and business loan solutions.
            </p>
            <div className="contact">
              <p><i className="fa fa-map-marker"></i> DIVA EAST</p>
              <p><i className="fa fa-phone"></i> +91 86520 89525 (Rakesh Gautam)</p>
              <p><i className="fa fa-envelope"></i> gautam.motors18@gmail.com</p>
            </div>
            <div className="socials">
              <a href="#"><i className="fa fa-facebook"></i></a>
              <a href="#"><i className="fa fa-twitter"></i></a>
              <a href="#"><i className="fa fa-instagram"></i></a>
              <a href="#"><i className="fa fa-linkedin"></i></a>
            </div>
          </div>

          <div className="footer-section links">
            <h3 className="footer-heading">Quick Links</h3>
            <ul>
              <li><Link to="/">New Cars</Link></li>
              <li><a href="#">Services</a></li>
              {/* <li><a href="#">Privacy Policy</a></li> */}
              {/* <li><a href="#">Terms & Conditions</a></li> */}
            </ul>
          </div>

          <div className="footer-section services">
            <h3 className="footer-heading">Our Services</h3>
            <ul>
              <li><i className="fa fa-check"></i> New Car Sales</li>
              <li><i className="fa fa-check"></i> Car Financing</li>
              <li><i className="fa fa-check"></i> Business Loans</li>
              <li><i className="fa fa-check"></i> Insurance Services</li>
              <li><i className="fa fa-check"></i> Car Registration</li>
              <li><i className="fa fa-check"></i> 24/7 Customer Support</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {currentYear} T-Permit Auto. All rights reserved. 
            <span className="designer"> Developed by Zhoop</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
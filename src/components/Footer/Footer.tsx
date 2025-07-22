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
              ASW is a leading car dealership in India offering a wide range of new cars 
              with attractive financing options and business loan solutions.
            </p>
            <div className="contact">
              <p><i className="fa fa-map-marker"></i> GB 60, Ground floor, High Street Mall, Kapurbawdi, Thane West, Thane-400607</p>
              <p><i className="fa fa-phone"></i> +91 99878 28690 (Call) | <a href="https://wa.me/919987828417" target="_blank" rel="noopener noreferrer">WhatsApp: +91 99878 28417</a></p>
              <p><i className="fa fa-phone"></i> +91 99877 98417 (Pintu) | +91 90047 26521 (Prakash)</p>
              <p><i className="fa fa-envelope"></i> asw.cars@gmail.com</p>
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
              <li><Link to="/finance-offers">Finance Offers</Link></li>
              <li><Link to="/business-loan">Business Loan</Link></li>
              <li><a href="#">Services</a></li>
              {/* <li><a href="#">Privacy Policy</a></li> */}
              {/* <li><a href="#">Terms & Conditions</a></li> */}
            </ul>
          </div>

          <div className="footer-section contact-form">
            <h3 className="footer-heading">Contact Us</h3>
            <form>
              <input type="email" name="email" placeholder="Email Address" required />
              <textarea name="message" placeholder="Your Message..." required></textarea>
              <button type="submit" className="btn">Send</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {currentYear} ASW Auto. All rights reserved. 
            <span className="designer"> Developed by Zhoop</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
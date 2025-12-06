import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          © {currentYear} Bhavsar Hospital and Research, Latur. All rights reserved.
        </p>
        <p className="footer-links">
          <a href="#" className="footer-link">Terms of Service</a>
          <span className="footer-separator">|</span>
          <a href="#" className="footer-link">Privacy Policy</a>
          <span className="footer-separator">|</span>
          <a href="#" className="footer-link">Contact Us</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;


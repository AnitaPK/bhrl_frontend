import { Link, useLocation } from 'react-router-dom';
import LogoBranding from './LogoBranding';
import './Header.css';

function Header() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Don't show header on login/register pages
  if (isAuthPage) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/dashboard" className="header-logo-link">
          <LogoBranding />
        </Link>
      </div>
    </header>
  );
}

export default Header;


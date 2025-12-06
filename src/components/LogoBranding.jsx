import './LogoBranding.css';
import logo from '../assets/BHRLOGO.png';

function LogoBranding() {
  return (
    <header className="logo-branding">
      <div className="logo-mark">
        <img src={logo} alt="BHRL-logo" />
      </div>
      <div className="">
        <div className="reflected-header">
          Bhavsar Hospital and Research, Latur
        </div>
      </div>
    </header>
  );
}

export default LogoBranding;


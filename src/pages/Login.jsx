import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import LogoBranding from '../components/LogoBranding';
import DoctorInfoPanel from '../components/DoctorInfoPanel';
import LoginForm from '../components/LoginForm';
import './Auth.css';

function Login() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <LogoBranding />
      </div>
      <Container fluid className="login-container">
        <Row className="h-100">
          {/* Left Side - Branding and Doctor Info */}
          <Col lg={6} className="left-section">
            <div className="left-content">
              <div className="doctors-section">
                <DoctorInfoPanel
                  name="Dr. Shriram Tandale"
                  qualifications="MBBS MD"
                  specialties={[
                    'Fellowship in Critical Care Medicine',
                    'PGCC Diabetology'
                  ]}
                />
                
                <DoctorInfoPanel
                  name="Dr. Aditi Tandale"
                  qualifications="MBBS DGO"
                  specialties={[
                    'Fellowship in Infertility & Laparoscopy'
                  ]}
                />
              </div>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col lg={6} className="right-section">
            <div className="right-content">
              <LoginForm onSuccess={handleLoginSuccess} />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;

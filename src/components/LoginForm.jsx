import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { setAuthToken, setUser } from '../utils/auth';
import './LoginForm.css';

function LoginForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      const { token, user } = response.data;

      setAuthToken(token);
      setUser(user);
      toast.success('Login successful!');
      onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h1 className="login-title">Sign in</h1>
      <p className="login-subtitle">Welcome back! Please enter your details.</p>

      {error && <Alert variant="danger" className="login-error">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="form-label">Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="form-label">Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
          />
        </Form.Group>

        <div className="form-options">
          <Form.Check
            type="checkbox"
            name="rememberMe"
            label="Remember Me"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="remember-me"
          />
          <Link to="#" className="forgot-password-link">
            Forgot Password
          </Link>
        </div>

        <Button
          type="submit"
          className="signin-button"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Form>

      <p className="terms-text">
        By clicking on 'Sign In', you acknowledge the{' '}
        <Link to="#" className="terms-link">Terms of Services</Link> and{' '}
        <Link to="#" className="terms-link">Privacy Policy</Link>.
      </p>

      <p className="signup-text">
        Not an existing user? <Link to="/register" className="signup-link">Sign up for demo</Link>
      </p>
    </div>
  );
}

export default LoginForm;


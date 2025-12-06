import React from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="error-boundary-container">
          <Row className="justify-content-center mt-5">
            <Col md={8}>
              <Alert variant="danger" className="error-boundary-alert">
                <h2 className="alert-heading">Oops! Something went wrong</h2>
                <p>
                  We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="error-details mt-3">
                    <strong>Error Details:</strong>
                    <pre className="mt-2">{this.state.error.toString()}</pre>
                  </div>
                )}
              </Alert>
              <div className="text-center">
                <Button 
                  variant="primary" 
                  onClick={this.handleReset}
                  className="me-2"
                >
                  Try Again
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => window.location.href = '/'}
                >
                  Go to Home
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/Header';
import ScrollToTopButton from './components/ScrollToTopButton';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PatientsList from './pages/PatientsList';
import PatientDetails from './pages/PatientDetails';
import VisitForm from './pages/VisitForm';
import VisitPrintPreview from './pages/VisitPrintPreview';
import { isAuthenticated } from './utils/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Header />
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <PatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id/visits/new"
            element={
              <ProtectedRoute>
                <VisitForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:patientId/visits/:visitId/print"
            element={
              <ProtectedRoute>
                <VisitPrintPreview />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ScrollToTopButton />
    </Router>
  );
}

export default App;

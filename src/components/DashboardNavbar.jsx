import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUserPlus,
  FiBell,
  FiGrid,
  FiUser,
  FiLogOut
} from 'react-icons/fi';
import { getUser, logout } from '../utils/auth';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import AddNewPatientModal from './AddNewPatientModal';
import './DashboardNavbar.css';

function DashboardNavbar({ onPatientCreated }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const user = getUser();

  const handleNewClick = () => {
    setShowModal(true);
  };


  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login', { replace: true });
  };

  return (
    <>
      <nav className="dashboard-navbar">
        <div className="navbar-text welcome-text">
          Welcome, {user?.name || user?.email || 'User'}!
        </div>
        <div className="right-navbar">
        <div className="navbar-item" onClick={handleNewClick}>
          <FiUserPlus className="navbar-icon" />
          <span className="navbar-text">New</span>
        </div>

        {/* <div className="navbar-item navbar-icon-only">
          <FiBell className="navbar-icon" />
        </div>

        <div className="navbar-item navbar-icon-only">
          <FiGrid className="navbar-icon" />
        </div> */}

        <button
          type="button"
          className="navbar-item navbar-profile profile-button"
          onClick={() => setShowProfileModal(true)}
        >
          <div className="profile-icon">
            <FiUser className="profile-user-icon" />
          </div>
          {/* {user && (
            <div className="profile-details">
              <div className="profile-name">{user.name || user.email}</div>
              <div className="profile-role">{user.role}</div>
            </div>
          )} */}
        </button>

        <button
          type="button"
          className="navbar-logout-button"
          onClick={handleLogout}
        >
          <FiLogOut className="navbar-logout-icon" />
          <span className="navbar-logout-text">Logout</span>
        </button>
        </div>
      </nav>

      <AddNewPatientModal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        onSave={(payload) => {
          // payload can be { patient } or the patient itself
          const patient = payload?.patient || payload;
          console.log('Patient saved:', patient);
          setShowModal(false);

          if (onPatientCreated && patient) {
            onPatientCreated(patient);
          }
        }}
      />

      <Modal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>User Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {user ? (
            <div>
              <p className="mb-1">
                <strong>Name:</strong> {user.name || '-'}
              </p>
              <p className="mb-1">
                <strong>Email:</strong> {user.email || '-'}
              </p>
              <p className="mb-1">
                <strong>Role:</strong> {user.role || '-'}
              </p>
              {user.id && (
                <p className="mb-0">
                  <strong>ID:</strong> {user.id}
                </p>
              )}
            </div>
          ) : (
            <p className="mb-0">No user information available.</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DashboardNavbar;


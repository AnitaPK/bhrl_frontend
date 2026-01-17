import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import logo from "../assets/logoOnly.jpeg";
import { FiUserPlus, FiBell, FiGrid, FiUser, FiLogOut } from "react-icons/fi";
import { getUser, logout } from "../utils/auth";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import AddNewPatientModal from "./AddNewPatientModal";
import "./DashboardNavbar.css";

function DashboardNavbar({ onPatientCreated }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const user = getUser();

  const handleNewClick = () => {
    setShowModal(true);
  };

  // console.log(user,"user**********")
  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav className="dashboard-navbar">
        <div className="left-navbar">
          <Link to="/">
          <img src={logo} alt="logo" className="logo-image" />
          </Link>
          <div className="menus">
            <div className="menu-item">
              <Link to="/patients" className="menu-list-item">Appointment
              </Link>
              </div>
            <div className="menu-item">
              <Link to="#" className="menu-list-item">
              Consults
              </Link>
              </div>
            <div className="menu-item dropdown">
              <Link
                className="menu-list-item"
                to="#"
                role="button"
                id="dropdownMenuLink"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Options
              </Link>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <li>
                  <Link class="dropdown-item" href="#">
                    Action
                  </Link>
                </li>
                <li>
                  <Link class="dropdown-item" href="#">
                    Another action
                  </Link>
                </li>
                <li>
                  <Link class="dropdown-item" href="#">
                    Something else here
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="right-navbar">
          <div className="navbar-item" onClick={handleNewClick}>
            <FiUserPlus className="navbar-icon" />
            <span className="navbar-text">New</span>
          </div>

          <button
            type="button"
            className="navbar-item navbar-profile profile-button"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="profile-icon">
              <FiUser className="profile-user-icon" />
            </div>
            <span style={{ fontSize: "12px" }}>
              Dr. {user?.name || user?.email || "User"}
            </span>
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
          console.log("Patient saved:", patient);
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
                <strong>Name:</strong> {user.name || "-"}
              </p>
              <p className="mb-1">
                <strong>Email:</strong> {user.email || "-"}
              </p>
              <p className="mb-1">
                <strong>Role:</strong> {user.role || "-"}
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

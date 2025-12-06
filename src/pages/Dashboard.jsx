import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Form, Button, Modal } from 'react-bootstrap';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { getUser } from '../utils/auth';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import TodayAppointments from '../components/TodayAppointments';
import AddAppointmentModal from '../components/AddAppointmentModal';
import './Dashboard.css';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    visitsToday: 0,
    recentVisits: [],
    appointmentsTodayCount: 0,
    todayAppointments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusModal, setStatusModal] = useState({
    show: false,
    appointmentId: null,
    currentStatus: '',
    nextStatus: '',
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const navigate = useNavigate();
  const user = getUser();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/summary');
      setDashboardData(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusSelect = (appt, newStatus) => {
    if (!newStatus || newStatus === appt.status) return;
    setStatusModal({
      show: true,
      appointmentId: appt.id,
      currentStatus: appt.status,
      nextStatus: newStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    const { appointmentId, nextStatus } = statusModal;
    if (!appointmentId || !nextStatus) return;

    try {
      setUpdatingStatus(true);
      const res = await api.put(`/appointments/${appointmentId}`, {
        status: nextStatus,
      });
      const updated = res.data?.appointment || res.data;

      setDashboardData((prev) => ({
        ...prev,
        todayAppointments: prev.todayAppointments.map((a) =>
          a.id === appointmentId ? { ...a, status: updated.status } : a
        ),
      }));
      toast.success('Appointment status updated');
      setStatusModal({
        show: false,
        appointmentId: null,
        currentStatus: '',
        nextStatus: '',
      });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to update appointment status';
      toast.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <DashboardNavbar onPatientCreated={fetchDashboardData} />
        <div className="dashboard-container">
          <Container className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <DashboardNavbar onPatientCreated={fetchDashboardData} />
      <div className="dashboard-container">
        <Container  className="py-4">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Statistics Cards */}
          <Row className="mb-4">
              <Col md={4} className="mb-3">
              <Link to="/patients">
              <Card className="stat-card stat-card-primary">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="stat-label">Total Patients</h6>
                      <h2 className="stat-value">{dashboardData.totalPatients}</h2>
                    </div>
                    <div className="stat-icon">
                      <i className="bi bi-people-fill"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              </Link>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="stat-card stat-card-success">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="stat-label">Today's Appointments</h6>
                      <h2 className="stat-value">{dashboardData.appointmentsTodayCount}</h2>
                    </div>
                    <div className="stat-actions">
                      <div className="stat-icon">
                        <i className="bi bi-calendar-check-fill"></i>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="stat-card stat-card-info">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="stat-label">Recent Visits</h6>
                      <h2 className="stat-value">{dashboardData.recentVisits?.length || 0}</h2>
                    </div>
                    <div className="stat-icon">
                      <i className="bi bi-clock-history"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Today's Appointments */}
          <Row className="mb-4">
            <Col>
              <TodayAppointments
                appointments={dashboardData.todayAppointments}
                loading={loading}
                error={error}
                onStatusChange={handleStatusSelect}
                onPatientClick={(patientId) => navigate(`/patients/${patientId}`)}
                onAddAppointmentClick={() => setShowAddAppointmentModal(true)}
              />
            </Col>
          </Row>

          {/* Recent Visits Table */}
          <Row>
            <Col>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Patients (Last 10 Visits)</h5>
                  <Button
                    variant="link"
                    className="p-0 small"
                    onClick={() => navigate('/patients')}
                  >
                    View all patients
                  </Button>
                </Card.Header>
                <Card.Body>
                  {dashboardData.recentVisits && dashboardData.recentVisits.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead>
                          <tr>
                            <th>Patient Name</th>
                            <th>Reg. No.</th>
                            <th>Visit Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.recentVisits.map((visit) => (
                            <tr key={visit.id}>
                              <td>
                                <Button
                                  variant="link"
                                  className="p-0"
                                  onClick={() =>
                                    visit.Patient &&
                                    navigate(`/patients/${visit.Patient.id}`)
                                  }
                                >
                                  {visit.Patient
                                    ? visit.Patient.full_name || 'N/A'
                                    : 'N/A'}
                                </Button>
                              </td>
                              <td>{visit.Patient?.reg_no || '-'}</td>
                              <td>{formatDate(visit.visit_date)}</td>
                              <td>
                                <span className="badge bg-primary">Completed</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted text-center py-3">No recent visits found.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />

      <Modal
        show={statusModal.show}
        onHide={() =>
          setStatusModal({
            show: false,
            appointmentId: null,
            currentStatus: '',
            nextStatus: '',
          })
        }
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Appointment Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Are you sure you want to change status from{' '}
            <strong>{statusModal.currentStatus}</strong> to{' '}
            <strong>{statusModal.nextStatus}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setStatusModal({
                show: false,
                appointmentId: null,
                currentStatus: '',
                nextStatus: '',
              })
            }
            disabled={updatingStatus}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmStatusChange}
            disabled={updatingStatus}
          >
            {updatingStatus ? 'Updating...' : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        show={showAddAppointmentModal}
        onHide={() => setShowAddAppointmentModal(false)}
        onAppointmentCreated={() => {
          setShowAddAppointmentModal(false);
          fetchDashboardData();
        }}
      />
    </div>
  );
}

export default Dashboard;

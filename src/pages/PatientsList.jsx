import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { FiUser, FiCalendar, FiEye } from 'react-icons/fi';
import api from '../utils/api';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import './PatientsList.css';
import AddAppointmentModal from '../components/AddAppointmentModal';

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function PatientsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients({ search: debouncedSearch, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPatients = async (opts = {}) => {
    const query = opts.search ?? search;
    const currentPage = opts.page ?? page;
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/patients', {
        params: {
          page: currentPage,
          limit,
          q: query,
        },
      });

      const { patients: rawPatients, total: totalCount } = response.data;

      // Fetch last visit date for each patient (best-effort, parallel)
      const enrichedPatients = await Promise.all(
        rawPatients.map(async (p) => {
          try {
            const visitsRes = await api.get(`/visits/patients/${p.id}/visits`);
            const lastVisit = visitsRes.data?.visits?.[0];
            return {
              ...p,
              lastVisitDate: lastVisit ? lastVisit.visit_date : null,
            };
          } catch (err) {
            console.error('Failed to fetch visits for patient', p.id, err);
            return { ...p, lastVisitDate: null };
          }
        })
      );

      setPatients(enrichedPatients);
      setTotal(totalCount || 0);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to load patients list';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleRowClick = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  const openAppointmentModal = (patient, e) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedPatient(patient);
    setShowAppointmentModal(true);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="patients-page-wrapper">
      <DashboardNavbar
        onPatientCreated={() => {
          // After adding a patient, refresh to show latest on first page
          setPage(1);
          fetchPatients({ search: debouncedSearch, page: 1 });
        }}
      />
      <div className="patients-page-container container">
        <Container className="py-4 ">
          <Row className="mb-3">
            <Col md={6}>
              <div className="patients-page-header">
                <div>
                  <h1 className="patients-title">Patients</h1>
                  <p className="patients-subtitle">
                    View and manage all registered patients with their latest
                    visit.
                  </p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <Form onSubmit={handleSearchSubmit} className="patients-search-form mt-3">
                <Form.Control
                  type="text"
                  placeholder="Search by name, reg. no. or mobile"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="patients-search-input"
                />
              </Form>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card className="patients-card">
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="patients-loading">
                      <Spinner animation="border" role="status" size="sm" />
                      <span className="ms-2">Loading patients...</span>
                    </div>
                  ) : error ? (
                    <Alert variant="danger" className="m-3">
                      {error}
                    </Alert>
                  ) : patients.length === 0 ? (
                    <div className="patients-empty-state">
                      <p className="text-muted mb-0">
                        No patients found. Try adjusting your search.
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive patients-table-wrapper">
                      <Table hover borderless className="patients-table align-middle">
                        <thead>
                          <tr>
                            <th style={{ width: '5%' }}>#</th>
                            <th>Patient</th>
                            <th>Reg. No.</th>
                            <th>Mobile</th>
                            <th style={{ width: '15%' }}>Last Visit</th>
                            <th style={{ width: '18%' }} className="text-end">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {patients.map((patient, index) => (
                            <tr
                              key={patient.id}
                              className="patients-row"
                              onClick={() => handleRowClick(patient.id)}
                            >
                              <td>{(page - 1) * limit + index + 1}</td>
                              <td>
                                <div className="patients-name-cell">
                                  <div className="patients-avatar">
                                    <FiUser />
                                  </div>
                                  <div>
                                    <div className="patients-name">
                                      {patient.full_name}
                                    </div>
                                    <div className="patients-meta">
                                      {patient.gender || 'Unknown'}
                                      {patient.age_years != null &&
                                        ` • ${patient.age_years} yrs`}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>{patient.reg_no || '-'}</td>
                              <td>{patient.mobile || '-'}</td>
                              <td>
                                <span className="patients-visit-badge">
                                  <FiCalendar className="me-1" />
                                  {formatDate(patient.lastVisitDate)}
                                </span>
                              </td>
                              <td className="text-end">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowClick(patient.id);
                                  }}
                                >
                                  <FiEye className="me-1" />
                                  Details
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  className="ms-2"
                                  onClick={(e) => openAppointmentModal(patient, e)}
                                >
                                  <FiCalendar className="me-1" />
                                  Appointment
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>

                {!loading && totalPages > 1 && (
                  <Card.Footer className="patients-pagination-footer">
                    <div className="patients-pagination-info">
                      Page {page} of {totalPages}
                    </div>
                    <div className="patients-pagination-buttons">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        disabled={page === totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </Card.Footer>
                )}
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />

      <AddAppointmentModal
        show={showAppointmentModal}
        onHide={() => setShowAppointmentModal(false)}
        patient={selectedPatient}
        onAppointmentCreated={() => {
          // No need to refresh list for now; appointments are separate from visits
        }}
      />
    </div>
  );
}

export default PatientsList;



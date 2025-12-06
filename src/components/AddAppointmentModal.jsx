import { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { getUser } from '../utils/auth';

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNowTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getMaxDateString() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const max = new Date(startOfToday);
  max.setDate(max.getDate() + 8);
  const year = max.getFullYear();
  const month = String(max.getMonth() + 1).padStart(2, '0');
  const day = String(max.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function AddAppointmentModal({ show, onHide, patient, onAppointmentCreated }) {
  const currentUser = getUser();

  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(getNowTimeString());
  const [doctorId, setDoctorId] = useState(currentUser?.id || '');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  
  // New states for patient search
  const [selectedPatient, setSelectedPatient] = useState(patient || null);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);

  useEffect(() => {
    if (show) {
      setDate(getTodayDateString());
      setTime(getNowTimeString());
      setDoctorId(currentUser?.id || '');
      setSelectedPatient(patient || null);
      setPatientSearch(patient?.full_name || '');
      fetchDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, patient]);

  // Search patients on input change
  useEffect(() => {
    if (patientSearch.trim().length > 0) {
      searchPatients(patientSearch);
    } else {
      setPatientSuggestions([]);
      setShowSuggestions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientSearch]);

  const searchPatients = async (query) => {
    try {
      setSearchingPatients(true);
      const res = await api.get('/patients', {
        params: {
          q: query,
          limit: 5,
        },
      });
      const patients = res.data?.patients || [];
      setPatientSuggestions(patients);
      setShowSuggestions(patients.length > 0);
    } catch (err) {
      console.error('Failed to search patients:', err);
      setPatientSuggestions([]);
    } finally {
      setSearchingPatients(false);
    }
  };

  const handleSelectPatient = (pat) => {
    setSelectedPatient(pat);
    setPatientSearch(pat.full_name);
    setShowSuggestions(false);
  };

  const fetchDoctors = async () => {
    if (currentUser?.role === 'doctor') {
      setDoctors([
        {
          id: currentUser.id,
          name: currentUser.email || 'Current Doctor',
        },
      ]);
      return;
    }

    try {
      setLoadingDoctors(true);
      const res = await api.get('/users/doctors');
      const list = res.data?.doctors || [];
      setDoctors(list);
      if (!doctorId && list.length > 0) {
        setDoctorId(list[0].id);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load doctors list';
      toast.error(msg);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    try {
      setLoading(true);
      const appointmentDateTime = new Date(`${date}T${time}:00`);

      const payload = {
        appointment_datetime: appointmentDateTime.toISOString(),
      };

      if (currentUser?.role !== 'doctor' && doctorId) {
        payload.doctor_id = doctorId;
      }

      const res = await api.post(
        `/appointments/patients/${selectedPatient.id}/appointments`,
        payload
      );

      toast.success('Appointment created');
      if (onAppointmentCreated) {
        onAppointmentCreated(res.data);
      }
      onHide();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to create appointment';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const maxDate = getMaxDateString();

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Book New Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Patient Search */}
          <Form.Group className="mb-4" controlId="patientSearch">
            <Form.Label className="fw-600">Patient *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search patient by name or reg. no."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              onFocus={() => patientSearch.trim() && setShowSuggestions(true)}
              disabled={!!patient}
              isInvalid={patientSearch && !selectedPatient}
            />
            {showSuggestions && patientSuggestions.length > 0 && (
              <ListGroup className="position-absolute mt-1" style={{ zIndex: 1000, width: '100%', marginLeft: '-12px' }}>
                {patientSuggestions.map((pat) => (
                  <ListGroup.Item
                    key={pat.id}
                    action
                    onClick={() => handleSelectPatient(pat)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-500">{pat.full_name}</div>
                        <small className="text-muted">Reg. No: {pat.reg_no || '-'}</small>
                      </div>
                      <small className="text-muted">{pat.mobile}</small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            {searchingPatients && (
              <small className="text-muted d-block mt-1">Searching...</small>
            )}
          </Form.Group>

          {/* Selected Patient Info */}
          {selectedPatient && (
            <div className="alert alert-light border mb-4">
              <strong>Selected Patient:</strong> {selectedPatient.full_name}
              {selectedPatient.reg_no && (
                <span className="text-muted ms-2">({selectedPatient.reg_no})</span>
              )}
            </div>
          )}

          {/* Date and Time */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="appointmentDate">
                <Form.Label className="fw-600">Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  min={getTodayDateString()}
                  max={maxDate}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <Form.Text muted>
                  Next 8 days available
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="appointmentTime">
                <Form.Label className="fw-600">Time *</Form.Label>
                <Form.Control
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Doctor Selection */}
          <Form.Group className="mb-3" controlId="doctor">
            <Form.Label className="fw-600">Doctor *</Form.Label>
            <Form.Select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={currentUser?.role === 'doctor' || loadingDoctors}
            >
              {currentUser?.role === 'doctor' && (
                <option value={currentUser.id}>
                  {currentUser.email || 'Current Doctor'}
                </option>
              )}
              {currentUser?.role !== 'doctor' &&
                doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name || doc.email}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading || !selectedPatient}>
            {loading ? 'Saving...' : 'Save Appointment'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AddAppointmentModal;



import { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
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

function AddVisitTodayModal({ show, onHide, patient, onVisitCreated }) {
  const currentUser = getUser();

  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(getNowTimeString());
  const [doctorId, setDoctorId] = useState(currentUser?.id || '');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    if (show) {
      setDate(getTodayDateString());
      setTime(getNowTimeString());
      setDoctorId(currentUser?.id || '');
      fetchDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const fetchDoctors = async () => {
    // Doctors themselves don't need to fetch the full list just to confirm their own name
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
    if (!patient) return;

    try {
      setLoading(true);
      const visitDateTime = new Date(`${date}T${time}:00`);

      const payload = {
        visit_date: visitDateTime.toISOString(),
      };

      // Only admin/staff can choose doctor; doctor visits always use logged-in doctor
      if (currentUser?.role !== 'doctor' && doctorId) {
        payload.doctor_id = doctorId;
      }

      const res = await api.post(
        `/visits/patients/${patient.id}/visits`,
        payload
      );

      toast.success('Visit created for today');
      if (onVisitCreated) {
        onVisitCreated(res.data);
      }
      onHide();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create visit';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!patient) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Add Visit Today</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Patient: <strong>{patient.full_name}</strong>{' '}
            {patient.reg_no && <span className="text-muted">({patient.reg_no})</span>}
          </p>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="visitDate">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="visitTime">
                <Form.Label>Time</Form.Label>
                <Form.Control
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="doctor">
            <Form.Label>Doctor</Form.Label>
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
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Visit'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AddVisitTodayModal;



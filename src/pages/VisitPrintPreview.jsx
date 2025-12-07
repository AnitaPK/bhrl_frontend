import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';
import api from '../utils/api';
import './VisitPrintPreview.css';

function VisitPrintPreview() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patient data
        const patientRes = await api.get(`/patients/${patientId}`);
        setPatient(patientRes.data?.patient);

        // Fetch visit data - handle both route patterns
        try {
          const visitRes = await api.get(`/visits/patients/${patientId}/visits/${visitId}`);
          setVisit(visitRes.data?.visit);
        } catch (err) {
          // Fallback to simple ID endpoint if the full path fails
          const visitRes = await api.get(`/visits/${visitId}`);
          setVisit(visitRes.data?.visit);
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load visit data';
        setError(msg);
        console.error('Error fetching visit data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId && visitId) {
      fetchData();
    }
  }, [patientId, visitId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  if (!visit || !patient) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning">No visit data found</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="print-page-wrapper">
      {/* Non-print controls */}
      <div className="print-controls no-print">
        <Container className="py-3">
          <Row>
            <Col>
              <Button
                variant="link"
                className="p-0 me-3"
                onClick={() => navigate(-1)}
              >
                <FiArrowLeft className="me-1" /> Back
              </Button>
              <Button variant="primary" onClick={handlePrint}>
                <FiPrinter className="me-2" /> Print
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Print Content */}
      <div className="print-container">
        <div className="print-page">
          {/* Header */}
          <div className="print-header">
            
          </div>

          {/* Patient Info & Visit Details */}
          <div className="visit-header-section">
            <Row>
              <Col md={6}>
                <div className="patient-info">
                  {/* <p className="info-line">
                    <strong>Patient ID:</strong> {patient.id}
                  </p> */}
                  <p className="info-line">
                    <strong>Name:</strong> {patient.full_name}
                  </p>
                  <p className="info-line">
                    <strong>Reg. No:</strong> {patient.reg_no || 'N/A'}
                  </p>
                  <p className="info-line">
                    <strong>Age:</strong> {calculateAge(patient.date_of_birth)} years | 
                    <strong className="ms-2">Gender:</strong> {patient.gender || 'N/A'}
                  </p>
                </div>
              </Col>
              <Col md={6} className="text-end">
                <p className="visit-date">
                  <strong>Date & Time:</strong> {formatDate(visit.visit_date)}
                </p>
              </Col>
            </Row>
          </div>

          {/* Vitals */}
          {(visit.bp_systolic ||
            visit.pulse ||
            visit.temp_c ||
            visit.spo2 ||
            visit.weight_kg ||
            visit.height_cm) && (
            <div className="vitals-section">
              <p className="vitals-text">
                <strong>BP</strong> {visit.bp_systolic}/{visit.bp_diastolic} mmHg | 
                <strong className="ms-2">Pulse</strong> {visit.pulse} bpm | 
                <strong className="ms-2">Height</strong> {visit.height_cm} cm | 
                <strong className="ms-2">Weight</strong> {visit.weight_kg} kg | 
                <strong className="ms-2">Temperature</strong> {visit.temp_c} °F | 
                <strong className="ms-2">BMI</strong> {visit.bmi} kg/m² | 
                <strong className="ms-2">SpO₂</strong> {visit.spo2} %
              </p>
            </div>
          )}

          {/* Investigations */}
          {visit.past_investigation && (
            <div className="section">
              <p className="section-text">
                <strong>[{formatDate(visit.visit_date).split(' ')[0]}]</strong> {visit.past_investigation}
              </p>
            </div>
          )}

          {/* Clinical Findings */}
          {visit.complaints && (
            <div className="section">
              <p className="section-text">
                <strong>Complaints:</strong> {visit.complaints}
              </p>
            </div>
          )}

          {visit.diagnosis && (
            <div className="section">
              <p className="section-text">
                <strong>Diagnosis:</strong> {visit.diagnosis}
              </p>
            </div>
          )}

          {/* Prescription Header */}
          {visit.Medicines && visit.Medicines.length > 0 && (
            <div className="rx-section">
              <h5 className="rx-title">Rx</h5>

              {/* Prescription Table */}
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Timing - Freq - Duration</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {visit.Medicines.map((medicine, index) => (
                    <tr key={index}>
                      <td>
                        <div>
                          <strong>{index + 1}) {medicine.name}</strong>
                        </div>
                        {medicine.type && (
                          <small className="medicine-composition">
                            Composition: {medicine.type}
                          </small>
                        )}
                        {medicine.note && (
                          <div className="medicine-note">
                            Timing: {medicine.when_to_take || 'N/A'}
                          </div>
                        )}
                      </td>
                      <td>{medicine.dosage || 'N/A'}</td>
                      <td>
                        {medicine.when_to_take && `${medicine.when_to_take}`} - {medicine.frequency || 'N/A'} - {medicine.duration_days || 'N/A'} Days
                      </td>
                      <td>{medicine.qty || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Advice */}
          {visit.advice && (
            <div className="section advice-section">
              <p className="section-text">
                <strong>Advice:</strong> {visit.advice}
              </p>
            </div>
          )}

          {/* Tests */}
          {visit.test_requested && visit.test_requested.length > 0 && (
            <div className="section tests-section">
              <p className="tests-title">
                <strong>Tests Prescribed:</strong>
              </p>
              <ul className="tests-list">
                {visit.test_requested.map((test, index) => (
                  <li key={index}>{test}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Visit */}
          {(visit.next_visit_date || visit.next_visit_days) && (
            <div className="section next-visit-section">
              <p className="next-visit-text">
                <strong>Follow-up / Next Visit:</strong>
                {visit.next_visit_days && visit.next_visit_date ? (
                  <span> After {visit.next_visit_days} days on {formatDate(visit.next_visit_date).split(' ')[0]}</span>
                ) : visit.next_visit_days ? (
                  <span> After {visit.next_visit_days} days</span>
                ) : (
                  <span> {formatDate(visit.next_visit_date)}</span>
                )}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default VisitPrintPreview;

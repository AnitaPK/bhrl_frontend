import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { FiArrowLeft, FiUser, FiTrash2 } from 'react-icons/fi';
import { FaWhatsapp, FaSave, FaBriefcase } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import './VisitForm.css';
import {
  DOSAGE_OPTIONS,
  WHEN_OPTIONS,
  FREQUENCY_OPTIONS,
} from '../utils/medicineOptions';

const emptyMedicineRow = () => ({
  type: '',
  name: '',
  dosage: '',
  when_to_take: '',
  frequency: '',
  duration_days: '',
  qty: '',
  note: '',
});

// options are imported from shared `medicineOptions`

function VisitForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    bp_systolic: '',
    bp_diastolic: '',
    pulse: '',
    temp_c: '',
    spo2: '',
    weight_kg: '',
    height_cm: '',
    bmi: '',
    complaints: '',
    past_history: '',
    lmp: '',
    edd: '',
    gestational_weeks: '',
    gestational_days: '',
    rs_exam: '',
    cvs_exam: '',
    per_abdomen: '',
    cns_exam: '',
    breast_exam: '',
    per_speculum: '',
    per_vaginal: '',
    menstrual_info: '',
    past_investigation: '',
    diagnosis: '',
    advice: '',
    test_requested_text: '',
    next_visit_days: '',
    next_visit_date: '',
  });

  const [medicines, setMedicines] = useState([
    emptyMedicineRow(),
    emptyMedicineRow(),
    emptyMedicineRow(),
    emptyMedicineRow(),
  ]);

  const [printAfterSave, setPrintAfterSave] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/patients/${id}`);
        const patientData = res.data?.patient;
        if (!patientData) {
          setError('Patient not found');
        }
        setPatient(patientData);
      } catch (err) {
        const msg =
          err.response?.data?.message || 'Failed to load patient information';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addMedicineRow = () => {
    setMedicines((prev) => [...prev, emptyMedicineRow()]);
  };

  const removeMedicineRow = (index) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const computeBmi = () => {
    const weight = parseFloat(form.weight_kg);
    const heightCm = parseFloat(form.height_cm);
    if (!weight || !heightCm) {
      setForm((prev) => ({ ...prev, bmi: '' }));
      return;
    }
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    setForm((prev) => ({ ...prev, bmi: bmi.toFixed(1) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient) return;

    try {
      setSaving(true);
      setError('');

      const testRequestedArray = form.test_requested_text
        ? form.test_requested_text
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : null;

      const payload = {
        bp_systolic: form.bp_systolic ? parseInt(form.bp_systolic, 10) : null,
        bp_diastolic: form.bp_diastolic
          ? parseInt(form.bp_diastolic, 10)
          : null,
        pulse: form.pulse ? parseInt(form.pulse, 10) : null,
        temp_c: form.temp_c ? parseFloat(form.temp_c) : null,
        spo2: form.spo2 ? parseInt(form.spo2, 10) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        bmi: form.bmi ? parseFloat(form.bmi) : null,
        complaints: form.complaints || null,
        past_history: form.past_history || null,
        lmp: form.lmp || null,
        edd: form.edd || null,
        gestational_weeks: form.gestational_weeks
          ? parseInt(form.gestational_weeks, 10)
          : null,
        gestational_days: form.gestational_days
          ? parseInt(form.gestational_days, 10)
          : null,
        rs_exam: form.rs_exam || null,
        cvs_exam: form.cvs_exam || null,
        per_abdomen: form.per_abdomen || null,
        cns_exam: form.cns_exam || null,
        breast_exam: form.breast_exam || null,
        per_speculum: form.per_speculum || null,
        per_vaginal: form.per_vaginal || null,
        menstrual_info: form.menstrual_info || null,
        past_investigation: form.past_investigation || null,
        diagnosis: form.diagnosis || null,
        advice: form.advice || null,
        test_requested: testRequestedArray,
        next_visit_days: form.next_visit_days
          ? parseInt(form.next_visit_days, 10)
          : null,
        next_visit_date: form.next_visit_date || null,
        medicines: medicines
          .filter((m) => {
            // Only include medicines that have at least a medicine name (required by backend)
            return m.name && m.name.trim() !== '';
          })
          .map((m) => ({
            type: m.type || null,
            name: m.name.trim(),
            dosage: m.dosage || null,
            when_to_take: m.when_to_take || null,
            frequency: m.frequency || null,
            duration_days: m.duration_days
              ? parseInt(m.duration_days, 10)
              : null,
            qty: m.qty ? parseInt(m.qty, 10) : null,
            note: m.note || null,
          })),
      };

      const response = await api.post(`/visits/patients/${patient.id}/visits`, payload);
      const visitId = response.data?.visit?.id;
      
      toast.success('Visit saved successfully');
      
      // Store visitId for print preview access
      if (visitId) {
        sessionStorage.setItem(`visit_${patient.id}`, visitId);
        
        // If export button was clicked, navigate to print preview
        if (printAfterSave) {
          setPrintAfterSave(false);
          navigate(`/patients/${patient.id}/visits/${visitId}/print`);
        } else {
          // Otherwise navigate back to patient details
          navigate(`/patients/${patient.id}`);
        }
      } else {
        navigate(`/patients/${patient.id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save visit';
      setError(msg);
      toast.error(msg);
      setPrintAfterSave(false);
    } finally {
      setSaving(false);
    }
  };

  const handleExportAndPrint = () => {
    // Set flag to print after save
    setPrintAfterSave(true);
    // Trigger form submit programmatically
    document.querySelector('form')?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
  };

  if (loading) {
    return (
      <div className="visit-form-page-wrapper">
        <DashboardNavbar />
        <div className="visit-form-container">
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
    <div className="visit-form-page-wrapper ">
      <DashboardNavbar />
      <div className="visit-form-container container">
        <Container fluid className="py-3">
          <Row className="mb-2">
            <Col>
              <Button
                variant="link"
                className="p-0 mb-2 back-button"
                onClick={() => navigate(-1)}
              >
                <FiArrowLeft className="me-1" /> Back
              </Button>
            </Col>
          </Row>

          {error && (
            <Row className="mb-2">
              <Col>
                <Alert variant="danger">{error}</Alert>
              </Col>
            </Row>
          )}

          {patient && (
            <Row className="mb-3">
              <Col>
                <Card className="visit-patient-header-card">
                  <Card.Body className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="visit-patient-avatar">
                        <FiUser />
                      </div>
                      <div>
                        <h5 className="mb-1">{patient.full_name}</h5>
                        <div className="text-muted small">
                          {patient.reg_no && (
                            <span className="me-3">
                              Reg. No: {patient.reg_no}
                            </span>
                          )}
                          {patient.gender && (
                            <span className="me-3">
                              Gender: {patient.gender}
                            </span>
                          )}
                          {patient.age_years != null && (
                            <span>
                              Age: {patient.age_years} yrs
                              {patient.age_months != null &&
                                ` ${patient.age_months} m`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <Form onSubmit={handleSubmit}>
            {/* VITALS SECTION */}
            <Card className="visit-form-card mb-3">
              <Card.Body>
                <h6 className="section-title mb-3">Vitals</h6>
                <Row className="mb-3">
                  <Col md={3}>
                    <div className="vitals-input-box">
                      <Form.Label className="vitals-label">BP:</Form.Label>
                      <div className="bp-input-compact">
                        <Form.Control
                          type="number"
                          name="bp_systolic"
                          value={form.bp_systolic}
                          onChange={handleChange}
                          placeholder="_"
                          className="bp-field"
                        />
                        <span className="bp-slash">/</span>
                        <Form.Control
                          type="number"
                          name="bp_diastolic"
                          value={form.bp_diastolic}
                          onChange={handleChange}
                          placeholder="_"
                          className="bp-field"
                        />
                      </div>
                      <span className="vitals-unit">mmHg</span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="vitals-input-box">
                      <Form.Label className="vitals-label">Pulse:</Form.Label>
                      <Form.Control
                        type="number"
                        name="pulse"
                        value={form.pulse}
                        onChange={handleChange}
                        placeholder="_"
                        className="vitals-field"
                      />
                      <span className="vitals-unit">bpm</span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="vitals-input-box">
                      <Form.Label className="vitals-label">Temp:</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        name="temp_c"
                        value={form.temp_c}
                        onChange={handleChange}
                        placeholder="_"
                        className="vitals-field"
                      />
                      <span className="vitals-unit">°F</span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="vitals-input-box">
                      <Form.Label className="vitals-label">SpO₂:</Form.Label>
                      <Form.Control
                        type="number"
                        name="spo2"
                        value={form.spo2}
                        onChange={handleChange}
                        placeholder="_"
                        className="vitals-field"
                      />
                      <span className="vitals-unit">%</span>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={3}>
                    <div className="vitals-input-box">
                      <Form.Label className="vitals-label">Weight:</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        name="weight_kg"
                        value={form.weight_kg}
                        onChange={(e) => {
                          handleChange(e);
                          computeBmi();
                        }}
                        placeholder="_"
                        className="vitals-field"
                      />
                      <span className="vitals-unit">Kg</span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="vitals-input-box">
                      <Form.Label className="vitals-label">Height:</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        name="height_cm"
                        value={form.height_cm}
                        onChange={(e) => {
                          handleChange(e);
                          computeBmi();
                        }}
                        placeholder="_"
                        className="vitals-field"
                      />
                      <span className="vitals-unit">cms</span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="vitals-input-box">
                      <Form.Label className="vitals-label">BMI:</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        name="bmi"
                        value={form.bmi}
                        onChange={handleChange}
                        placeholder="_"
                        className="vitals-field"
                      />
                      <span className="vitals-unit">Kg/m²</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* CLINICAL NOTES SECTION */}
            <Card className="visit-form-card mb-3">
              <Card.Body>
                <h6 className="section-title mb-3">Clinical Notes</h6>
                
                <Form.Group className="mb-3">
                  <Form.Label className="form-section-label">Complaints :</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="complaints"
                    value={form.complaints}
                    onChange={handleChange}
                    className="form-textarea-yellow"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="form-section-label">Past History :</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="past_history"
                    value={form.past_history}
                    onChange={handleChange}
                    className="form-textarea-yellow"
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={4}>
                    <div className="obstetric-field">
                      <Form.Label className="exam-label">LMP:</Form.Label>
                      <Form.Control
                        type="date"
                        name="lmp"
                        value={form.lmp}
                        onChange={handleChange}
                        className="exam-input"
                      />
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="obstetric-field">
                      <Form.Label className="exam-label">EDD:</Form.Label>
                      <Form.Control
                        type="date"
                        name="edd"
                        value={form.edd}
                        onChange={handleChange}
                        className="exam-input"
                      />
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="obstetric-field">
                      <Form.Label className="exam-label">Gestational Age:</Form.Label>
                      <div className="ga-inputs">
                        <Form.Control
                          type="number"
                          name="gestational_weeks"
                          value={form.gestational_weeks}
                          onChange={handleChange}
                          placeholder="weeks"
                          className="ga-field"
                        />
                        <span className="ga-divider">/</span>
                        <Form.Control
                          type="number"
                          name="gestational_days"
                          value={form.gestational_days}
                          onChange={handleChange}
                          placeholder="days"
                          className="ga-field"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* EXAMINATION SECTION */}
            <Card className="visit-form-card mb-3">
              <Card.Body>
                <h6 className="section-title mb-3">Physical Examination</h6>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="exam-label">RS Exam:</Form.Label>
                      <Form.Control
                        type="text"
                        name="rs_exam"
                        value={form.rs_exam}
                        onChange={handleChange}
                        className="exam-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="exam-label">CVS Exam:</Form.Label>
                      <Form.Control
                        type="text"
                        name="cvs_exam"
                        value={form.cvs_exam}
                        onChange={handleChange}
                        className="exam-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="exam-label">Per Abdomen :</Form.Label>
                      <Form.Control
                        type="text"
                        name="per_abdomen"
                        value={form.per_abdomen}
                        onChange={handleChange}
                        className="exam-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="exam-label">CNS Exam:</Form.Label>
                      <Form.Control
                        type="text"
                        name="cns_exam"
                        value={form.cns_exam}
                        onChange={handleChange}
                        className="exam-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="exam-label">Breast Exam :</Form.Label>
                      <Form.Control
                        type="text"
                        name="breast_exam"
                        value={form.breast_exam}
                        onChange={handleChange}
                        className="exam-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="exam-label">Per Speculum:</Form.Label>
                      <Form.Control
                        type="text"
                        name="per_speculum"
                        value={form.per_speculum}
                        onChange={handleChange}
                        className="exam-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* MENSTRUAL & INVESTIGATION SECTION */}
            <Card className="visit-form-card mb-3">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label className="form-section-label">Menstrual Info :</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="menstrual_info"
                    value={form.menstrual_info}
                    onChange={handleChange}
                    className="form-textarea-yellow"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="form-section-label">Past Investigation:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="past_investigation"
                    value={form.past_investigation}
                    onChange={handleChange}
                    className="form-textarea-yellow"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="form-section-label">Diagnosis:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleChange}
                    className="form-textarea-yellow"
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* MEDICINES/PRESCRIPTION SECTION */}
            <Card className="visit-form-card mb-3">
              <Card.Body>
                <h6 className="section-title mb-3">Rx (Prescriptions)</h6>
                <div className="table-responsive mb-2">
                  <Table bordered size="sm" className="medicines-table mb-0">
                    <thead>
                      <tr>
                        <th>SN</th>
                        <th>Type</th>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>when</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Qty</th>
                        <th>Note</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((row, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <Form.Select
                              value={row.type || ''}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  'type',
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select</option>
                              <option value="Tablet">Tablet</option>
                              <option value="Syrup">Syrup</option>
                              <option value="Injection">Injection</option>
                              <option value="Other">Other</option>
                            </Form.Select>
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              value={row.name}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  'name',
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <Form.Select
                              value={row.dosage || ''}
                              onChange={(e) =>
                                handleMedicineChange(index, 'dosage', e.target.value)
                              }
                            >
                              <option value="">Select</option>
                              {DOSAGE_OPTIONS.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </Form.Select>
                          </td>
                          <td>
                            <Form.Select
                              value={row.when_to_take || ''}
                              onChange={(e) =>
                                handleMedicineChange(index, 'when_to_take', e.target.value)
                              }
                            >
                              <option value="">Select</option>
                              {WHEN_OPTIONS.map((w) => (
                                <option key={w} value={w}>
                                  {w}
                                </option>
                              ))}
                            </Form.Select>
                          </td>
                          <td>
                            <Form.Select
                              value={row.frequency || ''}
                              onChange={(e) =>
                                handleMedicineChange(index, 'frequency', e.target.value)
                              }
                            >
                              <option value="">Select</option>
                              {FREQUENCY_OPTIONS.map((f) => (
                                <option key={f} value={f}>
                                  {f}
                                </option>
                              ))}
                            </Form.Select>
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              value={row.duration_days}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  'duration_days',
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              value={row.qty}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  'qty',
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              value={row.note}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  'note',
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="text-center">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger p-0"
                              onClick={() => removeMedicineRow(index)}
                              disabled={medicines.length === 1}
                            >
                              🗑
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addMedicineRow}
                  className="mb-3"
                >
                  + Add Medicine
                </Button>
              </Card.Body>
            </Card>

            {/* ADVICE & TESTS SECTION */}
            <Card className="visit-form-card mb-3">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label className="form-section-label">Advice:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="advice"
                    value={form.advice}
                    onChange={handleChange}
                    className="form-textarea-yellow"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="form-section-label">Test Requested:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="test_requested_text"
                    value={form.test_requested_text}
                    onChange={handleChange}
                    placeholder="Comma separated list of tests"
                    className="form-textarea-yellow"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="form-section-label">Next Visit:</Form.Label>
                  <div className="next-visit-container">
                    <Form.Control
                      type="number"
                      name="next_visit_days"
                      value={form.next_visit_days}
                      onChange={handleChange}
                      placeholder="Days"
                      className="next-visit-input"
                    />
                    <span className="next-visit-or">or</span>
                    <Form.Control
                      type="date"
                      name="next_visit_date"
                      value={form.next_visit_date}
                      onChange={handleChange}
                      className="next-visit-input"
                    />
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* ACTION BUTTONS */}
            <div className="action-buttons-container mb-4">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="btn-save"
              >
                <FaSave className="me-2" />
                {saving ? 'Saving...' : 'SAVE'}
              </Button>
              <Button
                variant="success"
                className="btn-whatsapp"
                onClick={() => toast.info('WhatsApp feature coming soon')}
              >
                <FaWhatsapp className="me-2" />
                WhatsApp
              </Button>
              <Button
                variant="info"
                className="btn-export"
                onClick={handleExportAndPrint}
                disabled={saving}
              >
                <FaBriefcase className="me-2" />
                Save & Print
              </Button>
            </div>
          </Form>
        </Container>
      </div>
      <Footer />
    </div>
  );
}

export default VisitForm;

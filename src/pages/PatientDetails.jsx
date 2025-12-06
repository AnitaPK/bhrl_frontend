import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Table,
  Form,
} from "react-bootstrap";
import { FiArrowLeft, FiCalendar, FiUser, FiClock, FiPrinter } from "react-icons/fi";
import api from "../utils/api";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import "./PatientDetails.css";
import {
  DOSAGE_OPTIONS,
  WHEN_OPTIONS,
  FREQUENCY_OPTIONS,
} from "../utils/medicineOptions";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingMedicines, setSavingMedicines] = useState(false);
  const [saveMedicinesError, setSaveMedicinesError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [patientRes, visitsRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get(`/visits/patients/${id}/visits`),
        ]);

        const patientData = patientRes.data?.patient;
        const visitsData = visitsRes.data?.visits || [];

        setPatient(patientData);
        setVisits(visitsData);

        if (visitsData.length > 0) {
          setSelectedVisitId(visitsData[0].id);
        }
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to load patient details";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const selectedVisit = useMemo(
    () => visits.find((v) => v.id === selectedVisitId) || null,
    [visits, selectedVisitId]
  );

  // Determine if there are any medicines that haven't been persisted yet
  const hasUnsavedMedicines = useMemo(() => {
    if (!selectedVisit || !Array.isArray(selectedVisit.Medicines)) return false;
    return selectedVisit.Medicines.some(
      (m) => !m.id && m.name && String(m.name).trim() !== ""
    );
  }, [selectedVisit]);

  // Update a medicine field (dosage / when_to_take / frequency) for the selected visit in local state
  const handleMedicineChange = (medIndex, field, value) => {
    setVisits((prevVisits) =>
      prevVisits.map((v) => {
        if (v.id !== selectedVisitId) return v;
        const updatedMeds = Array.isArray(v.Medicines) ? [...v.Medicines] : [];
        if (!updatedMeds[medIndex]) updatedMeds[medIndex] = {};
        updatedMeds[medIndex] = { ...updatedMeds[medIndex], [field]: value };
        return { ...v, Medicines: updatedMeds };
      })
    );
  };

  // Save medicines for the selected visit to the backend
  const handleSaveMedicines = async () => {
    if (!selectedVisit || !Array.isArray(selectedVisit.Medicines)) {
      setSaveMedicinesError("No medicines to save.");
      return;
    }

    try {
      setSavingMedicines(true);
      setSaveMedicinesError("");

      const response = await api.post(
        `/visits/${selectedVisit.id}/medicines`,
        { medicines: selectedVisit.Medicines }
      );

      if (response.status === 200 || response.status === 201) {
        const updatedMeds = response.data?.medicines || selectedVisit.Medicines;
        setVisits((prevVisits) =>
          prevVisits.map((v) =>
            v.id === selectedVisit.id ? { ...v, Medicines: updatedMeds } : v
          )
        );
        alert("Medicines saved successfully!");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to save medicines";
      setSaveMedicinesError(msg);
      alert(`Error: ${msg}`);
    } finally {
      setSavingMedicines(false);
    }
  };

  const renderVitalsRow = () => {
    if (!selectedVisit) return null;
    return (
      <Row className="mb-3">
        <Col md={3}>
          <div className="detail-field">
            <span className="label">BP</span>
            <span className="value">
              {selectedVisit.bp_systolic || "___"} /{" "}
              {selectedVisit.bp_diastolic || "___"} mmHg
            </span>
          </div>
        </Col>
        <Col md={3}>
          <div className="detail-field">
            <span className="label">Pulse</span>
            <span className="value">{selectedVisit.pulse || "___"} bpm</span>
          </div>
        </Col>
        <Col md={3}>
          <div className="detail-field">
            <span className="label">Temp</span>
            <span className="value">
              {selectedVisit.temp_c != null ? selectedVisit.temp_c : "___"} °C
            </span>
          </div>
        </Col>
        <Col md={3}>
          <div className="detail-field">
            <span className="label">SpO₂</span>
            <span className="value">
              {selectedVisit.spo2 != null ? `${selectedVisit.spo2}%` : "___"}
            </span>
          </div>
        </Col>
      </Row>
    );
  };

  const renderAnthropometricsRow = () => {
    if (!selectedVisit) return null;
    return (
      <Row className="mb-3">
        <Col md={4}>
          <div className="detail-field">
            <span className="label">Weight</span>
            <span className="value">
              {selectedVisit.weight_kg != null
                ? `${selectedVisit.weight_kg} kg`
                : "___"}
            </span>
          </div>
        </Col>
        <Col md={4}>
          <div className="detail-field">
            <span className="label">Height</span>
            <span className="value">
              {selectedVisit.height_cm != null
                ? `${selectedVisit.height_cm} cm`
                : "___"}
            </span>
          </div>
        </Col>
        <Col md={4}>
          <div className="detail-field">
            <span className="label">BMI</span>
            <span className="value">
              {selectedVisit.bmi != null ? `${selectedVisit.bmi} kg/m²` : "___"}
            </span>
          </div>
        </Col>
      </Row>
    );
  };

  const renderObstetricRow = () => {
    if (!selectedVisit) return null;
    return (
      <Row className="mb-3">
        <Col md={3}>
          <div className="detail-field">
            <span className="label">LMP</span>
            <span className="value">{formatDate(selectedVisit.lmp)}</span>
          </div>
        </Col>
        <Col md={3}>
          <div className="detail-field">
            <span className="label">EDD</span>
            <span className="value">{formatDate(selectedVisit.edd)}</span>
          </div>
        </Col>
        <Col md={6}>
          <div className="detail-field">
            <span className="label">Gestational Age</span>
            <span className="value">
              {selectedVisit.gestational_weeks != null
                ? `${selectedVisit.gestational_weeks} weeks`
                : "___ weeks"}{" "}
              /{" "}
              {selectedVisit.gestational_days != null
                ? `${selectedVisit.gestational_days} days`
                : "___ days"}
            </span>
          </div>
        </Col>
      </Row>
    );
  };

  const renderExamRow = () => {
    if (!selectedVisit) return null;
    return (
      <Row className="mb-3">
        <Col md={4}>
          <div className="detail-field">
            <span className="label">RS Exam</span>
            <span className="value">{selectedVisit.rs_exam || ""}</span>
          </div>
        </Col>
        <Col md={4}>
          <div className="detail-field">
            <span className="label">CVS Exam</span>
            <span className="value">{selectedVisit.cvs_exam || ""}</span>
          </div>
        </Col>
        <Col md={4}>
          <div className="detail-field">
            <span className="label">Per Abdomen</span>
            <span className="value">{selectedVisit.per_abdomen || ""}</span>
          </div>
        </Col>
      </Row>
    );
  };

  const renderNeuroRow = () => {
    if (!selectedVisit) return null;
    return (
      <Row className="mb-3">
        <Col md={4}>
          <div className="detail-field">
            <span className="label">CNS Exam</span>
            <span className="value">{selectedVisit.cns_exam || ""}</span>
          </div>
        </Col>
        <Col md={4}>
          <div className="detail-field">
            <span className="label">Breast Exam</span>
            <span className="value">{selectedVisit.breast_exam || ""}</span>
          </div>
        </Col>
        <Col md={4}>
          <div className="detail-field">
            <span className="label">Per Speculum / Vaginal</span>
            <span className="value">
              {selectedVisit.per_speculum || selectedVisit.per_vaginal || ""}
            </span>
          </div>
        </Col>
      </Row>
    );
  };

  const renderLargeTextField = (label, value) => (
    <Row className="mb-2">
      <Col>
        <div className="detail-textarea">
          <span className="label">{label}</span>
          <div className="value multiline">{value || ""}</div>
        </div>
      </Col>
    </Row>
  );

  return (
    <div className="patient-details-page-wrapper ">
      <DashboardNavbar />
      <div className="patient-details-container container">
        <Container fluid className="py-4">
          <Row className="mb-3">
            <Col>
              <div className="patient-details-header">
                <div className="patient-header-main">
                  <Button
                    variant="link"
                    className="p-0 mb-2 back-button"
                    onClick={() => navigate(-1)}
                  >
                    <FiArrowLeft className="me-1" /> Back to list
                  </Button>

                  <div>
                    <h1 className="patient-name">
                      {patient?.full_name || "Patient"}
                      <Button
                        variant="primary"
                        size="sm"
                        className="ms-3"
                        onClick={() => navigate(`/patients/${id}/visits/new`)}
                      >
                        Add New Visit
                      </Button>
                    </h1>
                    <div className="patient-meta">
                      {patient?.reg_no && (
                        <span className="me-3">Reg. No: {patient.reg_no}</span>
                      )}
                      {patient?.gender && (
                        <span className="me-3">Gender: {patient.gender}</span>
                      )}
                      {patient?.age_years != null && (
                        <span className="me-3">
                          Age: {patient.age_years} yrs
                          {patient.age_months != null &&
                            ` ${patient.age_months} m`}
                        </span>
                      )}
                      {patient?.mobile && (
                        <span className="me-3">Mob: {patient.mobile}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="patient-header-extra">
                  {selectedVisit && (
                    <>
                      <div className="patient-header-visit">
                        <FiCalendar className="me-1" />
                        Visit Date: {formatDate(selectedVisit.visit_date)}
                      </div>
                      <div className="patient-header-visit">
                        <FiClock className="me-1" />
                        Total Visits : {selectedVisit.visit_no}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          {loading ? (
            <Row>
              <Col>
                <div className="patient-details-loading">
                  <Spinner animation="border" role="status" />
                </div>
              </Col>
            </Row>
          ) : error ? (
            <Row>
              <Col>
                <Alert variant="danger">{error}</Alert>
              </Col>
            </Row>
          ) : !patient ? (
            <Row>
              <Col>
                <Alert variant="warning">Patient not found.</Alert>
              </Col>
            </Row>
          ) : (
            <>
              <Row className="mb-3">
                <Col>
                  <Card className="visits-selector-card">
                    <Card.Body>
                      <div className="visits-selector-header">
                        <h5 className="mb-0">Visits</h5>
                        <span className="text-muted">
                          Select a visit to view details
                        </span>
                      </div>
                      {visits.length === 0 ? (
                        <p className="text-muted mt-2 mb-0">
                          No visits recorded for this patient yet.
                        </p>
                      ) : (
                        <div className="visits-selector-list">
                          {visits.map((visit) => (
                            <Button
                              key={visit.id}
                              size="sm"
                              variant={
                                visit.id === selectedVisitId
                                  ? "primary"
                                  : "outline-primary"
                              }
                              className="me-2 mb-2 visit-pill"
                              onClick={() => setSelectedVisitId(visit.id)}
                            >
                              <FiCalendar className="me-1" />
                              {formatDate(visit.visit_date)}{" "}
                              <Badge bg="light" text="dark" className="ms-1">
                                #{visit.visit_no}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {selectedVisit && (
                <>
                  <Row className="mb-3">
                    <Col>
                      <Card className="visit-section-card">
                        <Card.Header>Clinical Summary</Card.Header>
                        <Card.Body>
                          {renderVitalsRow()}
                          {renderAnthropometricsRow()}
                          {renderObstetricRow()}
                          {renderLargeTextField(
                            "Complaints",
                            selectedVisit.complaints
                          )}
                          {renderLargeTextField(
                            "Past History",
                            selectedVisit.past_history
                          )}
                          {renderExamRow()}
                          {renderNeuroRow()}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Card className="visit-section-card">
                        <Card.Header>Additional Information</Card.Header>
                        <Card.Body>
                          {renderLargeTextField(
                            "Menstrual Info",
                            selectedVisit.menstrual_info
                          )}
                          {renderLargeTextField(
                            "Past Investigation",
                            selectedVisit.past_investigation
                          )}
                          {renderLargeTextField(
                            "Diagnosis",
                            selectedVisit.diagnosis
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Card className="visit-section-card">
                        <Card.Header>Prescriptions (Rx)</Card.Header>
                        <Card.Body>
                          {Array.isArray(selectedVisit.Medicines) &&
                          selectedVisit.Medicines.length > 0 ? (
                            <div className="table-responsive">
                              <Table
                                bordered
                                size="sm"
                                className="medicines-table mb-0"
                              >
                                <thead>
                                  <tr>
                                    <th>SN</th>
                                    <th>Type</th>
                                    <th>Medicine</th>
                                    <th>Dosage</th>
                                    <th>When</th>
                                    <th>Frequency</th>
                                    <th>Duration</th>
                                    <th>Qty</th>
                                    <th>Note</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(
                                    (Array.isArray(selectedVisit.Medicines) && selectedVisit.Medicines.length > 0)
                                      ? selectedVisit.Medicines
                                      : [
                                          {
                                            id: `new-${selectedVisit.id || '0'}-0`,
                                            type: "",
                                            name: "",
                                            dosage: "",
                                            when_to_take: "",
                                            frequency: "",
                                            duration_days: null,
                                            qty: null,
                                            note: "",
                                          },
                                        ]
                                  ).map((med, index) => (
                                    <tr key={med.id || index}>
                                      <td>{index + 1}</td>
                                      <td>{med.type || ""}</td>
                                      <td>{med.name || ""}</td>
                                      <td>
                                        <Form.Select
                                          size="sm"
                                          value={med.dosage || ""}
                                          onChange={(e) =>
                                            handleMedicineChange(index, "dosage", e.target.value)
                                          }
                                          className="medicine-dropdown"
                                        >
                                          <option value="">Select Dosage</option>
                                          {DOSAGE_OPTIONS.map((dosage) => (
                                            <option key={dosage} value={dosage}>
                                              {dosage}
                                            </option>
                                          ))}
                                        </Form.Select>
                                      </td>
                                      <td>
                                        <Form.Select
                                          size="sm"
                                          value={med.when_to_take || ""}
                                          onChange={(e) =>
                                            handleMedicineChange(index, "when_to_take", e.target.value)
                                          }
                                          className="medicine-dropdown"
                                        >
                                          <option value="">Select When</option>
                                          {WHEN_OPTIONS.map((when) => (
                                            <option key={when} value={when}>
                                              {when}
                                            </option>
                                          ))}
                                        </Form.Select>
                                      </td>
                                      <td>
                                        <Form.Select
                                          size="sm"
                                          value={med.frequency || ""}
                                          onChange={(e) =>
                                            handleMedicineChange(index, "frequency", e.target.value)
                                          }
                                          className="medicine-dropdown"
                                        >
                                          <option value="">Select Frequency</option>
                                          {FREQUENCY_OPTIONS.map((freq) => (
                                            <option key={freq} value={freq}>
                                              {freq}
                                            </option>
                                          ))}
                                        </Form.Select>
                                      </td>
                                      <td>
                                        {med.duration_days != null
                                          ? `${med.duration_days} days`
                                          : ""}
                                      </td>
                                      <td>{med.qty != null ? med.qty : ""}</td>
                                      <td>{med.note || ""}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          ) : (
                            <p className="text-muted mb-0">
                              No medicines recorded for this visit.
                            </p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Save Medicines Button */}
                  <Row className="mb-4">
                    <Col className="d-flex justify-content-end gap-2">
                      {(hasUnsavedMedicines || saveMedicinesError) && (
                        <>
                          {saveMedicinesError && (
                            <Alert variant="danger" className="mb-0">
                              {saveMedicinesError}
                            </Alert>
                          )}
                          {hasUnsavedMedicines && (
                            <Button
                              variant="primary"
                              disabled={savingMedicines}
                              onClick={handleSaveMedicines}
                            >
                              {savingMedicines ? (
                                <>
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                  />
                                  Saving...
                                </>
                              ) : (
                                "Save Medicines"
                              )}
                            </Button>
                          )}
                        </>
                      )}
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col>
                      <Card className="visit-section-card">
                        <Card.Header>Plan & Follow-up</Card.Header>
                        <Card.Body>
                          {renderLargeTextField("Advice", selectedVisit.advice)}
                          {renderLargeTextField(
                            "Test Requested",
                            Array.isArray(selectedVisit.test_requested)
                              ? selectedVisit.test_requested.join(", ")
                              : selectedVisit.test_requested
                          )}
                          <Row className="mt-2">
                            <Col md={6}>
                              <div className="detail-field">
                                <span className="label">Next Visit</span>
                                <span className="value">
                                  {selectedVisit.next_visit_days != null && (
                                    <>In {selectedVisit.next_visit_days} days</>
                                  )}
                                  {selectedVisit.next_visit_days != null &&
                                    selectedVisit.next_visit_date && (
                                      <span className="mx-2">or</span>
                                    )}
                                  {selectedVisit.next_visit_date && (
                                    <>
                                      On{" "}
                                      {formatDate(
                                        selectedVisit.next_visit_date
                                      )}
                                    </>
                                  )}
                                  {!selectedVisit.next_visit_days &&
                                    !selectedVisit.next_visit_date &&
                                    "Not set"}
                                </span>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Print Button */}
                  <Row className="mb-4">
                    <Col className="d-flex justify-content-end gap-2">
                      <Button
                        variant="outline-primary"
                        onClick={() =>
                          navigate(`/patients/${patient.id}/visits/${selectedVisitId}/print`)
                        }
                      >
                        <FiPrinter className="me-2" />
                        Print Prescription
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
            </>
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
}

export default PatientDetails;

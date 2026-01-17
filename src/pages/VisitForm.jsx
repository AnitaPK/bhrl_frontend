import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faRotateLeft, faFileLines, faFileArrowDown, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FiArrowLeft, FiUser, FiTrash2 } from "react-icons/fi";
import { FaWhatsapp, FaSave, FaBriefcase } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../utils/api";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import InvestigationsModal from "../components/InvestigationsModal";
import "./VisitForm.css";
import {
  DOSAGE_OPTIONS,
  WHEN_OPTIONS,
  FREQUENCY_OPTIONS,
} from "../utils/medicineOptions";

const emptyMedicineRow = () => ({
  type: "",
  name: "",
  dosage: "",
  when_to_take: "",
  frequency: "",
  duration_days: "",
  qty: "",
  note: "",
});

// options are imported from shared `medicineOptions`

function VisitForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    bp_systolic: "",
    bp_diastolic: "",
    pulse: "",
    temp_f: "",
    spo2: "",
    weight_kg: "",
    height_cm: "",
    bmi: "",
    // complaints: "",
    past_history: "",
    lmp: "",
    edd: "",
    gestational_weeks: "",
    gestational_days: "",
    rs_exam: "",
    cvs_exam: "",
    per_abdomen: "",
    cns_exam: "",
    breast_exam: "",
    per_speculum: "",
    per_vaginal: "",
    menstrual_info: "",
    past_investigation: "",
    diagnosis: "",
    advice: "",
    test_requested_text: "",
    refer_doctor_name: "",
    refer_doctor_phone: "",
    next_visit_days: "",
    next_visit_date: "",
  });
  const [showInvestigations, setShowInvestigations] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedReferDoctorId, setSelectedReferDoctorId] = useState(null);

  const [complaintsInput, setComplaintsInput] = useState("");
  const [complaintsList, setComplaintsList] = useState([]);
  const [pastHistoryInput, setPastHistoryInput] = useState("");
  const [pastHistoryList, setPastHistoryList] = useState([]);
  const [pastHistorySuggestions, setPastHistorySuggestions] = useState([]);
  const [loadingPastSuggestions, setLoadingPastSuggestions] = useState(false);
  const [pastSuggestionsVisible, setPastSuggestionsVisible] = useState(false);
  const pastTimerRef = useRef(null);
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [diagnosisSuggestions, setDiagnosisSuggestions] = useState([]);
  const [loadingDiagnosisSuggestions, setLoadingDiagnosisSuggestions] =
    useState(false);
  const [diagnosisSuggestionsVisible, setDiagnosisSuggestionsVisible] =
    useState(false);
  const diagnosisTimerRef = useRef(null);
  const [complaintSuggestions, setComplaintSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const suggestionsTimerRef = useRef(null);
  const [adviceInput, setAdviceInput] = useState("");
  const [adviceList, setAdviceList] = useState([]);
  const [adviceSuggestions, setAdviceSuggestions] = useState([]);
  const [loadingAdviceSuggestions, setLoadingAdviceSuggestions] = useState(false);
  const [adviceSuggestionsVisible, setAdviceSuggestionsVisible] = useState(false);
  const adviceTimerRef = useRef(null);
  const [testRequestedInput, setTestRequestedInput] = useState("");
  const [testRequestedList, setTestRequestedList] = useState([]);
  const [testRequestedSuggestions, setTestRequestedSuggestions] = useState([]);
  const [loadingTestRequestedSuggestions, setLoadingTestRequestedSuggestions] = useState(false);
  const [testRequestedSuggestionsVisible, setTestRequestedSuggestionsVisible] = useState(false);
  const testRequestedTimerRef = useRef(null);

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
          setError("Patient not found");
        }
        setPatient(patientData);
      } catch (err) {
        const msg =
          err.response?.data?.message || "Failed to load patient information";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
    // fetch list of doctors for refer-to dropdown
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/users/doctors');
        const list = res.data?.doctors || [];
        setDoctors(list);
      } catch (err) {
        // ignore silently
      }
    };

    fetchDoctors();
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

  const computeBmi = (weight, height) => {
    if (!weight || !height) return "";
    const h = height / 100;
    return (weight / (h * h)).toFixed(1);
  };

  const handleClearVitals = () => {
    setForm((prev) => ({
      ...prev,
      bp_systolic: "",
      bp_diastolic: "",
      pulse: "",
      temp_f: "",
      spo2: "",
      weight_kg: "",
      height_cm: "",
      bmi: "",
    }));
  };

  const handleClearNextVisit = () => {
    setForm((prev) => ({ ...prev, next_visit_days: "", next_visit_date: "" }));
  };

  const handleClearReferDoctor = () => {
    setForm((prev) => ({ ...prev, refer_doctor_name: "", refer_doctor_phone: "" }));
    setSelectedReferDoctorId(null);
  };

  

  const handleClearComplaints = () => {
    setComplaintsInput("");
    setComplaintsList([]);
  };

  const handleAddComplaint = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const value = complaintsInput.trim();
      if (!value) return;

      setComplaintsList((prev) => [...prev, value]);
      setComplaintsInput("");
    }
  };

  const fetchComplaintSuggestions = async (q) => {
    if (!q || q.trim() === "") {
      setComplaintSuggestions([]);
      setSuggestionsVisible(false);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const res = await api.get(
        `/complaints/search?q=${encodeURIComponent(q)}`
      );
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.list || res.data?.complaints || [];
      // normalize to array of strings
      const values = list.map(
        (item) => item.complaint_value || item.complaint || item
      );
      values.sort((a, b) => a.localeCompare(b));
      setComplaintSuggestions(values);
      setSuggestionsVisible(values.length > 0);
    } catch (err) {
      setComplaintSuggestions([]);
      setSuggestionsVisible(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    // debounce suggestions
    if (suggestionsTimerRef.current) clearTimeout(suggestionsTimerRef.current);
    const q = complaintsInput;
    suggestionsTimerRef.current = setTimeout(() => {
      if (q && q.trim().length > 0) {
        fetchComplaintSuggestions(q.trim());
      } else {
        setComplaintSuggestions([]);
        setSuggestionsVisible(false);
      }
    }, 250);

    return () => {
      if (suggestionsTimerRef.current)
        clearTimeout(suggestionsTimerRef.current);
    };
  }, [complaintsInput]);

  const fetchPastHistorySuggestions = async (q) => {
    if (!q || q.trim() === "") {
      setPastHistorySuggestions([]);
      setPastSuggestionsVisible(false);
      return;
    }

    try {
      setLoadingPastSuggestions(true);
      const res = await api.get(
        `/past-history/search?q=${encodeURIComponent(q)}`
      );
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.list || res.data?.past_histories || [];
      const values = list.map(
        (item) => item.history_value || item.history || item
      );
      values.sort((a, b) => a.localeCompare(b));
      setPastHistorySuggestions(values);
      setPastSuggestionsVisible(values.length > 0);
    } catch (err) {
      setPastHistorySuggestions([]);
      setPastSuggestionsVisible(false);
    } finally {
      setLoadingPastSuggestions(false);
    }
  };

  useEffect(() => {
    if (pastTimerRef.current) clearTimeout(pastTimerRef.current);
    const q = pastHistoryInput;
    pastTimerRef.current = setTimeout(() => {
      if (q && q.trim().length > 0) {
        fetchPastHistorySuggestions(q.trim());
      } else {
        setPastHistorySuggestions([]);
        setPastSuggestionsVisible(false);
      }
    }, 250);

    return () => {
      if (pastTimerRef.current) clearTimeout(pastTimerRef.current);
    };
  }, [pastHistoryInput]);

  const handleUndoLastComplaint = () => {
    setComplaintsList((prev) => prev.slice(0, -1));
  };

  const handleClearPastHistory = () => {
    setPastHistoryInput("");
    setPastHistoryList([]);
  };

  const handleAddPastHistory = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = pastHistoryInput.trim();
      if (!value) return;
      setPastHistoryList((prev) => [...prev, value]);
      setPastHistoryInput("");
    }
  };

  const handleUndoLastPastHistory = () => {
    setPastHistoryList((prev) => prev.slice(0, -1));
  };

  const handleClearDiagnosis = () => {
    setDiagnosisInput("");
    setDiagnosisList([]);
  };

  const handleAddDiagnosis = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = diagnosisInput.trim();
      if (!value) return;
      setDiagnosisList((prev) => [...prev, value]);
      setDiagnosisInput("");
    }
  };

  const handleUndoLastDiagnosis = () => {
    setDiagnosisList((prev) => prev.slice(0, -1));
  };

  const fetchDiagnosisSuggestions = async (q) => {
    if (!q || q.trim() === "") {
      setDiagnosisSuggestions([]);
      setDiagnosisSuggestionsVisible(false);
      return;
    }

    try {
      setLoadingDiagnosisSuggestions(true);
      const res = await api.get(`/diagnosis/search?q=${encodeURIComponent(q)}`);
      const list = Array.isArray(res.data) ? res.data : res.data?.list || [];
      const values = list.map(
        (item) => item.diagnosis_value || item.diagnosis || item
      );
      values.sort((a, b) => a.localeCompare(b));
      setDiagnosisSuggestions(values);
      setDiagnosisSuggestionsVisible(values.length > 0);
    } catch (err) {
      setDiagnosisSuggestions([]);
      setDiagnosisSuggestionsVisible(false);
    } finally {
      setLoadingDiagnosisSuggestions(false);
    }
  };

  useEffect(() => {
    if (diagnosisTimerRef.current) clearTimeout(diagnosisTimerRef.current);
    const q = diagnosisInput;
    diagnosisTimerRef.current = setTimeout(() => {
      if (q && q.trim().length > 0) {
        fetchDiagnosisSuggestions(q.trim());
      } else {
        setDiagnosisSuggestions([]);
        setDiagnosisSuggestionsVisible(false);
      }
    }, 250);

    return () => {
      if (diagnosisTimerRef.current) clearTimeout(diagnosisTimerRef.current);
    };
  }, [diagnosisInput]);

  const fetchAdviceSuggestions = async (q) => {
    if (!q || q.trim() === "") {
      setAdviceSuggestions([]);
      setAdviceSuggestionsVisible(false);
      return;
    }

    try {
      setLoadingAdviceSuggestions(true);
      const res = await api.get(`/advice/search?q=${encodeURIComponent(q)}`);
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.list || res.data?.advice || [];
      const values = list.map((item) => item.advice_value || item.advice || item);
      values.sort((a, b) => a.localeCompare(b));
      setAdviceSuggestions(values);
      setAdviceSuggestionsVisible(values.length > 0);
    } catch (err) {
      setAdviceSuggestions([]);
      setAdviceSuggestionsVisible(false);
    } finally {
      setLoadingAdviceSuggestions(false);
    }
  };

  useEffect(() => {
    if (adviceTimerRef.current) clearTimeout(adviceTimerRef.current);
    const q = adviceInput;
    adviceTimerRef.current = setTimeout(() => {
      if (q && q.trim().length > 0) {
        fetchAdviceSuggestions(q.trim());
      } else {
        setAdviceSuggestions([]);
        setAdviceSuggestionsVisible(false);
      }
    }, 250);

    return () => {
      if (adviceTimerRef.current) clearTimeout(adviceTimerRef.current);
    };
  }, [adviceInput]);

  const fetchTestRequestedSuggestions = async (q) => {
    if (!q || q.trim() === "") {
      setTestRequestedSuggestions([]);
      setTestRequestedSuggestionsVisible(false);
      return;
    }

    try {
      setLoadingTestRequestedSuggestions(true);
      // Use investigations list as source of tests then filter locally
      const res = await api.get(`/investigations`);
      const list = Array.isArray(res.data) ? res.data : res.data?.list || [];
      const values = list
        .map((it) => it.test_name || it)
        .filter(Boolean)
        .filter((name) => name.toLowerCase().includes(q.toLowerCase()));
      values.sort((a, b) => a.localeCompare(b));
      setTestRequestedSuggestions(values);
      setTestRequestedSuggestionsVisible(values.length > 0);
    } catch (err) {
      setTestRequestedSuggestions([]);
      setTestRequestedSuggestionsVisible(false);
    } finally {
      setLoadingTestRequestedSuggestions(false);
    }
  };

  useEffect(() => {
    if (testRequestedTimerRef.current) clearTimeout(testRequestedTimerRef.current);
    const q = testRequestedInput;
    testRequestedTimerRef.current = setTimeout(() => {
      if (q && q.trim().length > 0) {
        fetchTestRequestedSuggestions(q.trim());
      } else {
        setTestRequestedSuggestions([]);
        setTestRequestedSuggestionsVisible(false);
      }
    }, 250);

    return () => {
      if (testRequestedTimerRef.current) clearTimeout(testRequestedTimerRef.current);
    };
  }, [testRequestedInput]);

  const handleAddTestRequested = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = testRequestedInput.trim();
      if (!value) return;
      setTestRequestedList((prev) => [...prev, value]);
      setTestRequestedInput("");
    }
  };

  const handleUndoLastTestRequested = () => {
    setTestRequestedList((prev) => prev.slice(0, -1));
  };

  const handleClearTestRequested = () => {
    setTestRequestedInput("");
    setTestRequestedList([]);
  };

  const handleAddAdvice = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = adviceInput.trim();
      if (!value) return;
      setAdviceList((prev) => [...prev, value]);
      setAdviceInput("");
    }
  };

  const handleUndoLastAdvice = () => {
    setAdviceList((prev) => prev.slice(0, -1));
  };

  const handleClearAdvice = () => {
    setAdviceInput("");
    setAdviceList([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient) return;

    try {
      setSaving(true);
      setError("");

        const testRequestedArray = testRequestedList.length
        ? testRequestedList
        : form.test_requested_text
          ? form.test_requested_text
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
          : null;

      const payload = {
        bp_systolic: form.bp_systolic ? parseInt(form.bp_systolic, 10) : null,
        bp_diastolic: form.bp_diastolic
          ? parseInt(form.bp_diastolic, 10)
          : null,
        pulse: form.pulse ? parseInt(form.pulse, 10) : null,
        temp_f: form.temp_f ? parseFloat(form.temp_f) : null,
        spo2: form.spo2 ? parseInt(form.spo2, 10) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        bmi: form.bmi ? parseFloat(form.bmi) : null,
        complaints: complaintsList || null,
        past_history: pastHistoryList.length ? pastHistoryList : null,
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
        diagnosis: diagnosisList.length ? diagnosisList : null,
        advice: adviceList.length ? adviceList : (form.advice || null),
        test_requested: testRequestedArray,
        next_visit_days: form.next_visit_days
          ? parseInt(form.next_visit_days, 10)
          : null,
        next_visit_date: form.next_visit_date || null,
        refer_doctor_name: form.refer_doctor_name || null,
        refer_doctor_phone: form.refer_doctor_phone || null,
        medicines: medicines
          .filter((m) => {
            // Only include medicines that have at least a medicine name (required by backend)
            return m.name && m.name.trim() !== "";
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

      const response = await api.post(
        `/visits/patients/${patient.id}/visits`,
        payload
      );
      const visitId = response.data?.visit?.id;

      toast.success("Visit saved successfully");

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
      const msg = err.response?.data?.message || "Failed to save visit";
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
    document
      .querySelector("form")
      ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
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
                        <h5 className="mb-1 me-2">
                          {patient.full_name} {"  "}
                          {"("}{" "}
                          {patient.gender && (
                            <span className="me-1">{patient.gender} ,</span>
                          )}
                          {patient.age_years != null && (
                            <span>
                              {patient.age_years} Y
                              {/* {patient.age_months != null &&
                                ` ${patient.age_months} m`} */}
                            </span>
                          )}
                          {" )"}
                        </h5>
                        <div className="text-muted small">
                          {patient.id && (
                            <span className="me-3">{patient.id}</span>
                          )}
                          |
                          {patient?.mobile && (
                            <span className="mx-2">{patient.mobile}</span>
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
                <Row className="mb-3 align-items-start">
                  {/* LEFT SIDE – VITALS + CLEAR ICON */}
                  <Col md={2} className="text-center my-5">
                    <h6 className=" my-1">Vitals</h6>

                    <button
                      className="custom-icons-vitals"
                      onClick={handleClearVitals}
                      title="Clear Vitals"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faEraser} />
                    </button>
                  </Col>

                  {/* RIGHT SIDE – VITALS DATA */}
                  <Col md={10}>
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
                              // placeholder="_"
                              className="bp-field"
                            />
                            <span className="bp-slash">/</span>
                            <Form.Control
                              type="number"
                              name="bp_diastolic"
                              value={form.bp_diastolic}
                              onChange={handleChange}
                              // placeholder="_"
                              className="bp-field"
                            />
                            <span className="vitals-unit ps-1">mmHg</span>
                          </div>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="vitals-input-box">
                          <Form.Label className="vitals-label">
                            Pulse:
                          </Form.Label>
                          <div className="vital-input-compact">
                            <Form.Control
                              type="number"
                              name="pulse"
                              value={form.pulse}
                              onChange={handleChange}
                              // placeholder="_"
                              className="vitals-field"
                            />
                            <span className="vitals-unit">bpm</span>
                          </div>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="vitals-input-box">
                          <Form.Label className="vitals-label">
                            Temp:
                          </Form.Label>
                          <div className="vital-input-compact">
                            <Form.Control
                              type="number"
                              step="0.1"
                              name="temp_f"
                              value={form.temp_f}
                              onChange={handleChange}
                              // placeholder="_"
                              className="vitals-field"
                            />
                            <span className="vitals-unit">°F</span>
                          </div>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="vitals-input-box">
                          <Form.Label className="vitals-label">
                            SpO₂:
                          </Form.Label>
                          <div className="vital-input-compact">
                            <Form.Control
                              type="number"
                              name="spo2"
                              value={form.spo2}
                              onChange={handleChange}
                              // placeholder="_"
                              className="vitals-field"
                            />
                            <span className="vitals-unit">%</span>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={3}>
                        <div className="vitals-input-box">
                          <Form.Label className="vitals-label">
                            Weight:
                          </Form.Label>
                          <div className="vital-input-compact">
                            <Form.Control
                              type="number"
                              step="0.1"
                              name="weight_kg"
                              value={form.weight_kg}
                              onChange={(e) => {
                                const value = e.target.value;
                                setForm((prev) => {
                                  const next = { ...prev, weight_kg: value };
                                  next.bmi = computeBmi(value, next.height_cm);
                                  return next;
                                });
                              }}
                              // placeholder="_"
                              className="vitals-field"
                            />
                            <span className="vitals-unit">Kg</span>
                          </div>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="vitals-input-box">
                          <Form.Label className="vitals-label">
                            Height:
                          </Form.Label>
                          <div className="vital-input-compact">
                            <Form.Control
                              type="number"
                              step="0.1"
                              name="height_cm"
                              value={form.height_cm}
                              onChange={(e) => {
                                const value = e.target.value;
                                setForm((prev) => {
                                  const next = { ...prev, height_cm: value };
                                  next.bmi = computeBmi(value, next.weight_kg);
                                  return next;
                                });
                              }}
                              // placeholder="_"
                              className="vitals-field"
                            />
                            <span className="vitals-unit">cms</span>
                          </div>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="vitals-input-box">
                          <Form.Label className="vitals-label">BMI:</Form.Label>
                          <div className="vital-input-compact">
                            <Form.Control
                              type="number"
                              step="0.1"
                              name="bmi"
                              value={form.bmi}
                              onChange={handleChange}
                              // placeholder="_"
                              className="vitals-field"
                            />
                            <span className="vitals-unit">Kg/m²</span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* CLINICAL NOTES SECTION */}
            <Card className="visit-form-card mb-3">
              <Card.Body>
                <h6 className="section-title mb-3">Clinical Notes</h6>

                {/* complaints section  */}
                <Row className="mb-3 align-items-start">
                  {/* LEFT SIDE – complaints + CLEAR ICON */}
                  <Col md={2} className="text-center my-2">
                    <h6 className=" my-1">Complaints</h6>

                    <button
                      className="custom-icons-vitals"
                      onClick={handleClearComplaints}
                      title="Clear Complaints"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faEraser} />
                    </button>
                    <button
                      className="custom-icons-vitals"
                      onClick={handleUndoLastComplaint}
                      title="Undo complaint"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faRotateLeft} />
                    </button>
                  </Col>

                  {/* RIGHT SIDE – complaints DATA */}
                  <Col md={10}>
                    <Form.Group className="mb-3">
                      {/* <Form.Label className="form-section-label">
                    Complaints :
                  </Form.Label> */}
                      <Form.Control
                        as="textarea"
                        rows={1}
                        name="complaints"
                        value={complaintsInput}
                        onChange={(e) => setComplaintsInput(e.target.value)}
                        onKeyDown={handleAddComplaint}
                        onFocus={() => {
                          if (complaintSuggestions.length > 0)
                            setSuggestionsVisible(true);
                        }}
                        onBlur={() =>
                          setTimeout(() => setSuggestionsVisible(false), 150)
                        }
                        className="form-textarea-yellow"
                        placeholder="Complaints"
                      />

                      {suggestionsVisible && (
                        <div
                          className="complaint-suggestions dropdown-menu show p-2"
                          style={{ maxHeight: 200, overflowY: "auto" }}
                        >
                          {loadingSuggestions ? (
                            <div className="text-muted small">Searching...</div>
                          ) : (
                            complaintSuggestions.map((s, i) => (
                              <div
                                key={i}
                                className="suggestion-item list-group-item list-group-item-action"
                                onMouseDown={(ev) => {
                                  ev.preventDefault();
                                  // add suggestion to list
                                  setComplaintsList((prev) => [...prev, s]);
                                  setComplaintsInput("");
                                  setComplaintSuggestions([]);
                                  setSuggestionsVisible(false);
                                }}
                              >
                                {s}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      <div className="complaints-chips mt-2">
                        {complaintsList.map((c, index) => (
                          <span
                            key={index}
                            className="complaint-chip"
                            onClick={() => setComplaintsInput(c)}
                            role="button"
                            tabIndex={0}
                          >
                            {c}
                            <button
                              type="button"
                              className="chip-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setComplaintsList((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* past history  */}
                <Row className="mb-3 align-items-start">
                  {/* LEFT SIDE – Past history + CLEAR ICON */}
                  <Col md={2} className="text-center my-2">
                    <h6 className=" my-1">Past History</h6>

                    <button
                      className="custom-icons-vitals"
                      onClick={handleClearPastHistory}
                      title="Clear Past History"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faEraser} />
                    </button>
                    <button
                      className="custom-icons-vitals"
                      onClick={handleUndoLastPastHistory}
                      title="undo past history"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faRotateLeft} />
                    </button>
                  </Col>

                  {/* RIGHT SIDE – PastHistory DATA */}
                  <Col md={10}>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="past_history"
                        value={pastHistoryInput}
                        onChange={(e) => setPastHistoryInput(e.target.value)}
                        onKeyDown={handleAddPastHistory}
                        onFocus={() => {
                          if (pastHistorySuggestions.length > 0)
                            setPastSuggestionsVisible(true);
                        }}
                        onBlur={() =>
                          setTimeout(
                            () => setPastSuggestionsVisible(false),
                            150
                          )
                        }
                        className="form-textarea-yellow"
                        placeholder="Type and press Enter to add past history"
                      />

                      <div className="complaints-chips mt-2">
                        {pastHistoryList.map((p, idx) => (
                          <span
                            key={idx}
                            className="complaint-chip"
                            onClick={() => setPastHistoryInput(p)}
                            role="button"
                            tabIndex={0}
                          >
                            {p}
                            <button
                              type="button"
                              className="chip-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPastHistoryList((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                );
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {pastSuggestionsVisible && (
                        <div
                          className="complaint-suggestions dropdown-menu show p-2"
                          style={{ maxHeight: 200, overflowY: "auto" }}
                        >
                          {loadingPastSuggestions ? (
                            <div className="text-muted small">Searching...</div>
                          ) : (
                            pastHistorySuggestions.map((s, i) => (
                              <div
                                key={i}
                                className="suggestion-item list-group-item list-group-item-action"
                                onMouseDown={(ev) => {
                                  ev.preventDefault();
                                  setPastHistoryList((prev) => [...prev, s]);
                                  setPastHistoryInput("");
                                  setPastHistorySuggestions([]);
                                  setPastSuggestionsVisible(false);
                                }}
                              >
                                {s}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Investigation  */}
                <Row className="mb-3 align-items-start">
                  {/* LEFT SIDE – Investigation + CLEAR ICON */}
                  <Col md={2} className="text-center my-2">
                    <h6 className=" my-1">Investigation</h6>

                    <button
                      className="custom-icons-vitals"
                      // onClick={handleClearInvestigation}
                      title="Clear Investigation"
                      type="button"
                    >
                     <FontAwesomeIcon icon={faFileArrowDown} />
                    </button>
                    <button
                      className="custom-icons-vitals"
                      // onClick={handleUndoLastInvestigation}
                      title="undo Investigation"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faFileLines} />
                    </button>
                  </Col>

                  {/* RIGHT SIDE – Investigation DATA */}
                  <Col md={10}>
                    <div className="mb-3">
                      <button className="custom-btn-Invest fw-bold" type="button" >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <button className="custom-btn-Invest" type="button" onClick={() => setShowInvestigations(true)}>
                        View All Tests
                      </button>
                    </div>
                <InvestigationsModal show={showInvestigations} onHide={() => setShowInvestigations(false)} />

                  </Col>
                </Row>


                {/* Diagnosis  */}
                <Row className="mb-3 align-items-start">
                  {/* LEFT SIDE – Investigation + CLEAR ICON */}
                  <Col md={2} className="text-center my-2">
                    <h6 className=" my-1">Diagnosis</h6>

                    <button
                      className="custom-icons-vitals"
                      onClick={handleClearDiagnosis}
                      title="Clear Diagnosis"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faEraser} />
                    </button>
                    <button
                      className="custom-icons-vitals"
                      onClick={handleUndoLastDiagnosis}
                      title="undo Diagnosis"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faRotateLeft} />
                    </button>
                  </Col>

                  {/* RIGHT SIDE – Diagnosis DATA */}
                  <Col md={10}>
                    <Form.Group className="mb-3">
                      {/* <Form.Label className="form-section-label">
                    Diagnosis:
                  </Form.Label> */}
                      <Form.Control
                        as="textarea"
                        rows={1}
                        name="diagnosis"
                        value={diagnosisInput}
                        onChange={(e) => setDiagnosisInput(e.target.value)}
                        onKeyDown={handleAddDiagnosis}
                        onFocus={() => {
                          if (diagnosisSuggestions.length > 0)
                            setDiagnosisSuggestionsVisible(true);
                        }}
                        onBlur={() =>
                          setTimeout(
                            () => setDiagnosisSuggestionsVisible(false),
                            150
                          )
                        }
                        className="form-textarea-yellow"
                        placeholder="Type and press Enter to add diagnosis"
                      />

                      <div className="complaints-chips mt-2">
                        {diagnosisList.map((d, idx) => (
                          <span
                            key={idx}
                            className="complaint-chip"
                            onClick={() => setDiagnosisInput(d)}
                            role="button"
                            tabIndex={0}
                          >
                            {d}
                            <button
                              type="button"
                              className="chip-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDiagnosisList((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                );
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {diagnosisSuggestionsVisible && (
                        <div
                          className="complaint-suggestions dropdown-menu show p-2"
                          style={{ maxHeight: 200, overflowY: "auto" }}
                        >
                          {loadingDiagnosisSuggestions ? (
                            <div className="text-muted small">Searching...</div>
                          ) : (
                            diagnosisSuggestions.map((s, i) => (
                              <div
                                key={i}
                                className="suggestion-item list-group-item list-group-item-action"
                                onMouseDown={(ev) => {
                                  ev.preventDefault();
                                  setDiagnosisList((prev) => [...prev, s]);
                                  setDiagnosisInput("");
                                  setDiagnosisSuggestions([]);
                                  setDiagnosisSuggestionsVisible(false);
                                }}
                              >
                                {s}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                {/* <Row className="mb-3">
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
                      <Form.Label className="exam-label">
                        Gestational Age:
                      </Form.Label>
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
                </Row> */}
              </Card.Body>
            </Card>

            {/* MENSTRUAL & INVESTIGATION SECTION */}
            {/* <Card className="visit-form-card mb-3">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label className="form-section-label">
                    Menstrual Info :
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="menstrual_info"
                    value={form.menstrual_info}
                    onChange={handleChange}
                    className="form-textarea-yellow"
                  />
                </Form.Group>
              </Card.Body>
            </Card> */}

            {/* EXAMINATION SECTION */}
            {/* <Card className="visit-form-card mb-3">
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
                      <Form.Label className="exam-label">
                        Per Abdomen :
                      </Form.Label>
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
                      <Form.Label className="exam-label">
                        Breast Exam :
                      </Form.Label>
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
                      <Form.Label className="exam-label">
                        Per Speculum:
                      </Form.Label>
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
            </Card> */}

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
                              value={row.type || ""}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "type",
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
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <Form.Select
                              value={row.dosage || ""}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "dosage",
                                  e.target.value
                                )
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
                              value={row.when_to_take || ""}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "when_to_take",
                                  e.target.value
                                )
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
                              value={row.frequency || ""}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "frequency",
                                  e.target.value
                                )
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
                                  "duration_days",
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
                                  "qty",
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
                                  "note",
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
                <Row className="mb-3 align-items-start">
                  {/* LEFT SIDE – Advice + CLEAR ICON */}
                  <Col md={2} className="text-center my-2">
                    <h6 className=" my-1">Advice</h6>

                    <button
                      className="custom-icons-vitals"
                      onClick={handleClearAdvice}
                      title="Clear Diagnosis"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faEraser} />
                    </button>
                    <button
                      className="custom-icons-vitals"
                      onClick={handleUndoLastAdvice}
                      title="undo Advice"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faRotateLeft} />
                    </button>
                  </Col>

                  {/* RIGHT SIDE – Advice DATA */}
                  <Col md={10}>

                <Form.Group className="mb-3">
                  {/* <Form.Label className="form-section-label">
                    Advice:
                  </Form.Label> */}
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="advice"
                    value={adviceInput}
                    onChange={(e) => setAdviceInput(e.target.value)}
                    onKeyDown={handleAddAdvice}
                    onFocus={() => setAdviceSuggestionsVisible(true)}
                    onBlur={() => setTimeout(() => setAdviceSuggestionsVisible(false), 150)}
                    className="form-textarea-yellow"
                    placeholder="Type and press Enter to add advice"
                  />

                  {adviceSuggestionsVisible && (
                    <div className="complaint-suggestions dropdown-menu show p-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {loadingAdviceSuggestions ? (
                        <div className="text-muted small">Searching...</div>
                      ) : (
                        adviceSuggestions.map((s, i) => (
                          <div key={i} className="suggestion-item list-group-item list-group-item-action" onMouseDown={() => { setAdviceList(prev => [...prev, s]); setAdviceInput(''); }}>
                            {s}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  <div className="complaints-chips mt-2">
                    {adviceList.map((a, idx) => (
                      <span key={idx} className="complaint-chip" onClick={() => setAdviceInput(a)} role="button" tabIndex={0}>
                        {a}
                        <button type="button" className="chip-remove" onClick={(e) => { e.stopPropagation(); setAdviceList(prev => prev.filter((_, i) => i !== idx)); }}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </Form.Group>
</Col>
</Row>

<Row className="mb-3 align-items-start">
                  {/* LEFT SIDE – TestRequested CLEAR ICON */}
                  <Col md={2} className="text-center my-2">
                    <h6 className=" my-1">Test Requested</h6>

                    <button
                      className="custom-icons-vitals"
                      onClick={handleClearTestRequested}
                      title="Clear Test Requested"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faEraser} />
                    </button>
                    <button
                      className="custom-icons-vitals"
                      onClick={handleUndoLastTestRequested}
                      title="undo TestRequested"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faRotateLeft} />
                    </button>
                  </Col>

                  {/* RIGHT SIDE – TestRequested DATA */}
                  <Col md={10}>
                <Form.Group className="mb-3">
                  {/* <Form.Label className="form-section-label">
                    Test Requested:
                  </Form.Label> */}
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="test_requested_text"
                    value={testRequestedInput}
                    onChange={(e) => setTestRequestedInput(e.target.value)}
                    onKeyDown={handleAddTestRequested}
                    onFocus={() => setTestRequestedSuggestionsVisible(true)}
                    onBlur={() => setTimeout(() => setTestRequestedSuggestionsVisible(false), 150)}
                    placeholder="Type and press Enter to add test"
                    className="form-textarea-yellow"
                  />

                  {testRequestedSuggestionsVisible && (
                    <div className="complaint-suggestions dropdown-menu show p-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {loadingTestRequestedSuggestions ? (
                        <div className="text-muted small">Searching...</div>
                      ) : (
                        testRequestedSuggestions.map((s, i) => (
                          <div key={i} className="suggestion-item list-group-item list-group-item-action" onMouseDown={() => { setTestRequestedList(prev => [...prev, s]); setTestRequestedInput(''); }}>
                            {s}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  <div className="complaints-chips mt-2">
                    {testRequestedList.map((t, idx) => (
                      <span key={idx} className="complaint-chip" onClick={() => setTestRequestedInput(t)} role="button" tabIndex={0}>
                        {t}
                        <button type="button" className="chip-remove" onClick={(e) => { e.stopPropagation(); setTestRequestedList(prev => prev.filter((_, i) => i !== idx)); }}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </Form.Group>
</Col>
</Row>
<Row className="mb-3 align-items-start">
                  {/* LEFT SIDE – Next Visit: CLEAR ICON */}
                  <Col md={2} className="text-center my-2">
                    <h6 className=" my-1">Next Visit:</h6>

                    <button
                      className="custom-icons-vitals"
                      onClick={handleClearNextVisit}
                      title="Clear Test Requested"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faEraser} />
                    </button>
                
                  </Col>

                  {/* RIGHT SIDE –  Next Visit: DATA */}
                  <Col md={10}>
                <Form.Group className="mb-3">
                  {/* <Form.Label className="form-section-label">
                    Next Visit:
                  </Form.Label> */}
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
                </Col>
                </Row>

<Row className="mb-3 align-items-start">
                  {/* LEFT SIDE – Refer doctor: CLEAR ICON */}
                  <Col md={2} className="text-center my-2">
                    <h6 className=" my-1">Refer Doctor:</h6>

                    <button
                      className="custom-icons-vitals"
                      onClick={handleClearReferDoctor}
                      title="Clear Refer Doctor"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faEraser} />
                    </button>
                
                  </Col>

                  {/* RIGHT SIDE –  Refer Doctor DATA */}
                  <Col md={10}>
                <Form.Group className="mb-3">
                  {/* <Form.Label className="form-section-label">
                    Refer Doctor
                  </Form.Label> */}
                  <div className="next-visit-container">
                    <Form.Select
                      value={selectedReferDoctorId || ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedReferDoctorId(id || null);
                        const doc = doctors.find((d) => String(d.id) === String(id));
                        if (doc) {
                          setForm((prev) => ({
                            ...prev,
                            refer_doctor_name: doc.name || "",
                            refer_doctor_phone: doc.phone || doc.email || "",
                          }));
                        } else {
                          setForm((prev) => ({ ...prev, refer_doctor_name: "", refer_doctor_phone: "" }));
                        }
                      }}
                      className="next-visit-input"
                    >
                      <option value="">Select doctor (or type below)</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} {d.phone ? `(${d.phone})` : d.email ? `(${d.email})` : ''}
                        </option>
                      ))}
                    </Form.Select>

                    <Form.Control
                      type="text"
                      name="refer_doctor_name"
                      value={form.refer_doctor_name}
                      onChange={(e) => {
                        // allow manual override
                        setSelectedReferDoctorId(null);
                        handleChange(e);
                      }}
                      placeholder="Doctor Name"
                      className="next-visit-input"
                    />

                    <Form.Control
                      type="text"
                      name="refer_doctor_phone"
                      value={form.refer_doctor_phone}
                      onChange={(e) => {
                        setSelectedReferDoctorId(null);
                        handleChange(e);
                      }}
                      placeholder="Phone number"
                      className="next-visit-input"
                    />
                  </div>
                </Form.Group>
                </Col>
                </Row>



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
                {saving ? "Saving..." : "SAVE"}
              </Button>
              <Button
                variant="success"
                className="btn-whatsapp"
                onClick={() => toast.info("WhatsApp feature coming soon")}
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

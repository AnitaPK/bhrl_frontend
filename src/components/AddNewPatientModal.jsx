import { useState } from 'react';
import { Modal, Form, Button, InputGroup, ButtonGroup } from 'react-bootstrap';
import { FiUser, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './AddNewPatientModal.css';

function AddNewPatientModal({ show, onHide, onSave }) {
  const [formData, setFormData] = useState({
    prefix: 'Mr',
    full_name: '',
    gender: 'M',
    mobile: '',
    age_years: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Patient name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.age_years || Number(formData.age_years) <= 0) {
      newErrors.age_years = 'Please enter a valid age';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // Prepare patient data
      const patientData = {
        prefix: formData.prefix,
        full_name: formData.full_name,
        gender: formData.gender,
        mobile: formData.mobile,
        age_years: parseInt(formData.age_years) || 0,
        age_months: 0,
        address: formData.address,
      };

      const response = await api.post('/patients', patientData);
      toast.success('Patient added successfully!');
      onSave(response.data);
      
      // Reset form
      setFormData({
        prefix: 'Mr',
        full_name: '',
        gender: 'M',
        mobile: '',
        age_years: '',
        address: '',
      });
      setErrors({});
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add patient';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async (e) => {
    await handleSubmit(e);
    // Keep modal open for next entry
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg"
      centered
      className="add-patient-modal"
    >
      <Modal.Header className="modal-header-custom">
        <Modal.Title className="modal-title-custom">Add New Patient</Modal.Title>
        <div className="modal-search">
          <input
            type="text"
            placeholder="Search Patient (Name/Reg. No.)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="modal-search-input"
          />
        </div>
        <button type="button" className="close-button" onClick={onHide}>
          ×
        </button>
      </Modal.Header>

      <Modal.Body className="modal-body-custom">
        <Form onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Column */}
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="required-label">Patient Name</Form.Label>
                <InputGroup>
                  <Form.Select
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                    className="title-select"
                  >
                    <option value="Mr">Mr.</option>
                    <option value="Mrs">Mrs.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Baby">Baby</option>
                  </Form.Select>
                  <InputGroup.Text className="icon-input-group">
                    <FiUser />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="full_name"
                    placeholder="Enter Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
                {errors.full_name && (
                  <div className="field-error">{errors.full_name}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="required-label">Gender</Form.Label>
                <ButtonGroup className="gender-buttons">
                  <Button
                    variant={formData.gender === 'M' ? 'primary' : 'outline-primary'}
                    onClick={() => handleChange({ target: { name: 'gender', value: 'M' } })}
                  >
                    M
                  </Button>
                  <Button
                    variant={formData.gender === 'F' ? 'primary' : 'outline-primary'}
                    onClick={() => handleChange({ target: { name: 'gender', value: 'F' } })}
                  >
                    F
                  </Button>
                  <Button
                    variant={formData.gender === 'Other' ? 'primary' : 'outline-primary'}
                    onClick={() => handleChange({ target: { name: 'gender', value: 'Other' } })}
                  >
                    Other
                  </Button>
                </ButtonGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="required-label">Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="address"
                  placeholder="Enter Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                {errors.address && (
                  <div className="field-error">{errors.address}</div>
                )}
              </Form.Group>
            </div>

            {/* Right Column */}
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="required-label">Mobile Number</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="icon-input-group">
                    <FiPhone />
                  </InputGroup.Text>
                  <Form.Control
                    type="tel"
                    name="mobile"
                    placeholder="Enter Mobile No."
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              {errors.mobile && (
                <div className="field-error">{errors.mobile}</div>
              )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="required-label">Age</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="age_years"
                    placeholder="Enter Age"
                    value={formData.age_years}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                  <InputGroup.Text>Years</InputGroup.Text>
                </InputGroup>
              {errors.age_years && (
                <div className="field-error">{errors.age_years}</div>
              )}
              </Form.Group>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Reg. No.</Form.Label>
                <Form.Control
                  type="text"
                  value="Automatic"
                  readOnly
                  className="readonly-field"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <div className="modal-actions-inline">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="save-opd-button"
                >
                  <span className="save-icon">💾</span> Save in OPD Register
                </Button>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveAndNext}
              disabled={loading}
              className="save-next-button"
            >
              {loading ? 'Saving...' : 'Save & Next'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddNewPatientModal;


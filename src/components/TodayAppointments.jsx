import { Card, Form, Spinner, Alert, Button } from 'react-bootstrap';
import { FiClock, FiUser, FiPhone, FiCalendar, FiPlus } from 'react-icons/fi';
import './TodayAppointments.css';

function TodayAppointments({
  appointments = [],
  loading = false,
  error = '',
  onStatusChange,
  onPatientClick,
  onAddAppointmentClick,
}) {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'cancelled':
        return 'badge-danger';
      case 'scheduled':
      default:
        return 'badge-warning';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <Card className="today-appointments-card">
        <Card.Header>
          <div className="appointments-header-content">
            <h5 className="mb-0">
              <FiCalendar className="me-2" />
              Today's Appointments
            </h5>
            {onAddAppointmentClick && (
              <Button
                variant="light"
                size="sm"
                onClick={onAddAppointmentClick}
                className="add-appointment-button"
                title="Add New Appointment"
              >
                <FiPlus size={18} />Add New Appointment
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Loading appointments...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="today-appointments-card">
        <Card.Header>
          <div className="appointments-header-content">
            <h5 className="mb-0">
              <FiCalendar className="me-2" />
              Today's Appointments
            </h5>
            {onAddAppointmentClick && (
              <Button
                variant="light"
                size="sm"
                onClick={onAddAppointmentClick}
                className="add-appointment-button"
                title="Add New Appointment"
              >
                <FiPlus size={18} />
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger" className="mb-0">
            {error}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card className="today-appointments-card">
        <Card.Header>
          <div className="appointments-header-content">
            <h5 className="mb-0">
              <FiCalendar className="me-2" />
              Today's Appointments
            </h5>
            {onAddAppointmentClick && (
              <Button
                variant="light"
                size="sm"
                onClick={onAddAppointmentClick}
                className="add-appointment-button"
                title="Add New Appointment"
              >
                <FiPlus size={18} />
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-5 empty-state">
            <FiCalendar size={48} className="text-muted mb-3" />
            <p className="text-muted mb-0">No appointments scheduled for today.</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="today-appointments-card">
      <Card.Header>
        <div className="appointments-header-content">
          <h5 className="mb-0">
            <FiCalendar className="me-2" />
            Today's Appointments ({appointments.length})
          </h5>
          {onAddAppointmentClick && (
            <Button
              variant="light"
              size="sm"
              onClick={onAddAppointmentClick}
              className="add-appointment-button"
              title="Add New Appointment"
            >
              <FiPlus size={18} />
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="appointments-list">
          {appointments.map((appt, index) => (
            <div
              key={appt.id}
              className="appointment-item"
              onClick={() => {
                if (onPatientClick && appt.Patient?.id) {
                  onPatientClick(appt.Patient.id);
                }
              }}
            >
              {index > 0 && <div className="appointment-divider" />}

              <div className="appointment-content">
                {/* Time Badge */}
                <div className="appointment-time-badge">
                  <FiClock className="me-1" />
                  {new Date(appt.appointment_datetime).toLocaleTimeString(
                    'en-IN',
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                </div>

                {/* Patient Info */}
                <div className="appointment-patient-info">
                  <div className="patient-header">
                    <div className="patient-avatar">
                      <FiUser />
                    </div>
                    <div className="patient-details">
                      <h6 className="patient-name mb-0">
                        {appt.Patient?.full_name || 'N/A'}
                      </h6>
                      <small className="text-muted">
                        Reg. No: {appt.Patient?.reg_no || '-'}
                      </small>
                    </div>
                  </div>

                  {/* Doctor & Contact */}
                  <div className="appointment-meta">
                    <div className="meta-item">
                      <span className="meta-label">Doctor:</span>
                      <span className="meta-value">
                        {appt.doctor?.name || appt.doctor?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <FiPhone className="me-1" />
                      <span className="meta-value">
                        {appt.Patient?.mobile || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Control */}
                <div className="appointment-status">
                  <div className="status-badge-wrapper">
                    <span className={`status-badge ${getStatusBadgeClass(appt.status)}`}>
                      {getStatusLabel(appt.status)}
                    </span>
                  </div>
                  <Form.Select
                    size="sm"
                    value={appt.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (onStatusChange) {
                        onStatusChange(appt, e.target.value);
                      }
                    }}
                    className="status-select"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

export default TodayAppointments;

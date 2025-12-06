import './DoctorInfoPanel.css';

function DoctorInfoPanel({ name, qualifications, specialties }) {
  return (
    <div className="doctor-panel">
      <div className="doctor-logo">
        <div className="abstract-logo">
          <div className="logo-shape shape-1"></div>
          <div className="logo-shape shape-2"></div>
          <div className="logo-shape shape-3"></div>
          <div className="logo-shape shape-4"></div>
          <div className="logo-shape shape-5"></div>
        </div>
      </div>
      <div className="orange-divider"></div>
      <div className="doctor-info">
        <div className="doctor-name">{name}</div>
        <div className="doctor-qualifications">{qualifications}</div>
        {specialties.map((specialty, index) => (
          <div key={index} className="doctor-specialty">{specialty}</div>
        ))}
      </div>
    </div>
  );
}

export default DoctorInfoPanel;


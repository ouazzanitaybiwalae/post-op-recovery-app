import React, { useState } from 'react';
import AppointmentList from '../components/AppointmentList';
import AppointmentDetails from '../components/AppointmentDetails';
import '../App.css';

const Appointments = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCreateForm(false);
  };

  const handleCreateNew = () => {
    setSelectedAppointment(null);
    setShowCreateForm(true);
  };

  const handleClose = () => {
    setSelectedAppointment(null);
    setShowCreateForm(false);
  };

  const handleSuccess = () => {
    setSelectedAppointment(null);
    setShowCreateForm(false);
    // Recharger la liste (AppointmentList le fera automatiquement via useEffect)
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestion des Rendez-vous</h1>
      </div>

      <div className="page-content">
        {!selectedAppointment && !showCreateForm ? (
          <AppointmentList
            onSelectAppointment={handleSelectAppointment}
            onCreateNew={handleCreateNew}
          />
        ) : (
          <AppointmentDetails
            appointmentId={selectedAppointment?.id}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Appointments;
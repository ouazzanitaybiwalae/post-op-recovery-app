import React, { useState, useEffect } from 'react';
import appointmentService from '../services/appointmentService';
import AppointmentForm from './AppointmentForm';
import { useAuth } from '../context/AuthContext';

const AppointmentDetails = ({ appointmentId, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(!appointmentId); // Si pas d'ID = mode création

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    } else {
      setLoading(false);
    }
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentById(appointmentId);
      setAppointment(data);
    } catch (err) {
      setError('Erreur lors du chargement du rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    onSuccess && onSuccess();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const map = {
      scheduled: 'Planifié', confirmed: 'Confirmé',
      completed: 'Terminé', cancelled: 'Annulé', pending: 'En attente'
    };
    return map[status] || status;
  };

  if (loading) return <div className="loading">Chargement...</div>;

  if (editing || !appointmentId) {
    return (
      <AppointmentForm
        appointment={appointment}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    );
  }

  if (!appointment) return <div className="error-message">{error || 'Rendez-vous introuvable'}</div>;

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Détails du rendez-vous</h2>
        <button onClick={onClose} className="btn btn-secondary">← Retour</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div><strong>Date :</strong> {formatDateTime(appointment.appointment_date)}</div>
        <div><strong>Statut :</strong> <span className={`status-badge status-${appointment.status}`}>{getStatusLabel(appointment.status)}</span></div>
        {appointment.patient_name && <div><strong>Patient :</strong> {appointment.patient_name}</div>}
        {appointment.physiotherapist_name && <div><strong>Professionnel :</strong> {appointment.physiotherapist_name}</div>}
        {appointment.reason && <div><strong>Motif :</strong> {appointment.reason}</div>}
        {appointment.duration && <div><strong>Durée :</strong> {appointment.duration} min</div>}
        {appointment.location && <div><strong>Lieu :</strong> {appointment.location}</div>}
        {appointment.notes && <div><strong>Notes :</strong> {appointment.notes}</div>}
      </div>

      {(user?.role === 'physiotherapist' || user?.role === 'admin') && (
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
          <button onClick={() => setEditing(true)} className="btn btn-primary">Modifier</button>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;
import React, { useState } from 'react';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';

const AppointmentForm = ({ appointment, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || user?.id || 'PAT-001',
    professionalId: appointment?.professionalId || '',
    professionalName: appointment?.professionalName || '',
    type: appointment?.type || 'consultation',
    date: appointment?.date || '',
    time: appointment?.time || '',
    location: appointment?.location || '',
    notes: appointment?.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (appointment?.id) {
        await appointmentService.updateAppointment(appointment.id, formData);
      } else {
        await appointmentService.createAppointment(formData);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du rendez-vous');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>{appointment?.id ? 'Modifier' : 'Nouveau'} Rendez-vous</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type de rendez-vous *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="consultation">Consultation</option>
            <option value="suivi">Suivi post-opératoire</option>
            <option value="rééducation">Rééducation</option>
            <option value="contrôle">Contrôle</option>
          </select>
        </div>

        <div className="form-group">
          <label>Professionnel *</label>
          <input
            type="text"
            name="professionalName"
            value={formData.professionalName}
            onChange={handleChange}
            placeholder="Dr. Martin"
            required
          />
        </div>

        <div className="form-group">
          <label>Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Heure *</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Lieu</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Cabinet médical, Hôpital..."
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Informations complémentaires..."
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
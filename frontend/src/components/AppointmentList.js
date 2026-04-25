import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import '../App.css';

const AppointmentList = ({ onSelectAppointment, onCreateNew }) => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      let data;
      
      if (user?.role === 'patient') {
        data = await appointmentService.getMyAppointments();
      } else if (user?.role === 'physiotherapist') {
        data = await appointmentService.getPhysiotherapistAppointments();
      } else {
        data = await appointmentService.getAllAppointments();
      }
      
      setAppointments(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des rendez-vous');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      await appointmentService.deleteAppointment(id);
      setAppointments(appointments.filter(apt => apt.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression du rendez-vous');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(id, newStatus);
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status: newStatus } : apt
      ));
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
      console.error(err);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    
    const matchesDate = !filterDate || 
      apt.appointment_date?.split('T')[0] === filterDate;
    
    const matchesSearch = !searchTerm || 
      apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.physiotherapist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesDate && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      'scheduled': { label: 'Planifié', class: 'status-scheduled' },
      'confirmed': { label: 'Confirmé', class: 'status-confirmed' },
      'completed': { label: 'Terminé', class: 'status-completed' },
      'cancelled': { label: 'Annulé', class: 'status-cancelled' },
      'pending': { label: 'En attente', class: 'status-pending' }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const isPast = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return new Date(b.appointment_date) - new Date(a.appointment_date);
  });

  if (loading) {
    return <div className="loading">Chargement des rendez-vous...</div>;
  }

  return (
    <div className="appointment-list-container">
      <div className="list-header">
        <h2>Mes Rendez-vous</h2>
        {onCreateNew && (
          <button onClick={onCreateNew} className="btn-primary">
            + Nouveau rendez-vous
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="date-filter"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="scheduled">Planifié</option>
          <option value="confirmed">Confirmé</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>

        {(searchTerm || filterDate || filterStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterDate('');
              setFilterStatus('all');
            }}
            className="btn-clear-filters"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {sortedAppointments.length === 0 ? (
        <div className="no-data">
          {searchTerm || filterDate || filterStatus !== 'all'
            ? 'Aucun rendez-vous ne correspond aux critères de recherche'
            : 'Aucun rendez-vous disponible'}
        </div>
      ) : (
        <div className="appointments-list">
          {sortedAppointments.map(appointment => (
            <div
              key={appointment.id}
              className={`appointment-card ${isPast(appointment.appointment_date) ? 'past' : 'upcoming'}`}
            >
              <div className="appointment-header">
                <div className="appointment-date-time">
                  <span className="appointment-date">
                    📅 {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="appointment-time">
                    🕐 {formatTime(appointment.appointment_date)}
                  </span>
                </div>
                {getStatusBadge(appointment.status)}
              </div>

              <div className="appointment-body">
                {user?.role === 'patient' && appointment.physiotherapist_name && (
                  <div className="appointment-info">
                    <strong>Physiothérapeute:</strong>
                    <span>{appointment.physiotherapist_name}</span>
                  </div>
                )}

                {user?.role === 'physiotherapist' && appointment.patient_name && (
                  <div className="appointment-info">
                    <strong>Patient:</strong>
                    <span>{appointment.patient_name}</span>
                  </div>
                )}

                {appointment.reason && (
                  <div className="appointment-info">
                    <strong>Motif:</strong>
                    <span>{appointment.reason}</span>
                  </div>
                )}

                {appointment.duration && (
                  <div className="appointment-info">
                    <strong>Durée:</strong>
                    <span>{appointment.duration} minutes</span>
                  </div>
                )}

                {appointment.location && (
                  <div className="appointment-info">
                    <strong>Lieu:</strong>
                    <span>📍 {appointment.location}</span>
                  </div>
                )}

                {appointment.notes && (
                  <div className="appointment-notes">
                    <strong>Notes:</strong>
                    <p>{appointment.notes}</p>
                  </div>
                )}
              </div>

              <div className="appointment-actions">
                <button
                  onClick={() => onSelectAppointment(appointment)}
                  className="btn-view"
                >
                  Voir détails
                </button>

                {isUpcoming(appointment.appointment_date) && appointment.status !== 'cancelled' && (
                  <>
                    {appointment.status === 'pending' && user?.role === 'physiotherapist' && (
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                        className="btn-confirm"
                      >
                        Confirmer
                      </button>
                    )}

                    {appointment.status === 'confirmed' && user?.role === 'physiotherapist' && (
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                        className="btn-complete"
                      >
                        Marquer terminé
                      </button>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                      className="btn-cancel-appointment"
                    >
                      Annuler
                    </button>
                  </>
                )}

                {(user?.role === 'physiotherapist' || user?.role === 'admin') && (
                  <button
                    onClick={() => handleDelete(appointment.id)}
                    className="btn-delete"
                  >
                    Supprimer
                  </button>
                )}
              </div>

              {isUpcoming(appointment.appointment_date) && (
                <div className="appointment-countdown">
                  {(() => {
                    const now = new Date();
                    const aptDate = new Date(appointment.appointment_date);
                    const diffMs = aptDate - now;
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    
                    if (diffDays > 0) {
                      return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
                    } else if (diffHours > 0) {
                      return `Dans ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
                    } else {
                      return 'Bientôt';
                    }
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="appointments-summary">
        <div className="summary-item">
          <span className="summary-label">Total:</span>
          <span className="summary-value">{appointments.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">À venir:</span>
          <span className="summary-value">
            {appointments.filter(apt => isUpcoming(apt.appointment_date) && apt.status !== 'cancelled').length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Terminés:</span>
          <span className="summary-value">
            {appointments.filter(apt => apt.status === 'completed').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;
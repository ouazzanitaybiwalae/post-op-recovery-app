import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import alertService from '../services/alertService';
import recoveryPlanService from '../services/recoveryPlanService';
import '../App.css';
 
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    activeRecoveryPlans: 0,
    unreadAlerts: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [activePlans, setActivePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  useEffect(() => {
    loadDashboardData();
  }, []);
 
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les rendez-vous
      let appointments = [];
      if (user?.role === 'patient') {
        appointments = await appointmentService.getMyAppointments();
      } else if (user?.role === 'physiotherapist') {
        appointments = await appointmentService.getPhysiotherapistAppointments();
      } else {
        appointments = await appointmentService.getAllAppointments();
      }
 
      // Charger les alertes
      const alerts = await alertService.getAllAlerts();
 
      // Charger les plans de récupération
      let plans = [];
      if (user?.role === 'patient') {
        plans = await recoveryPlanService.getMyPlans();
      } else {
        plans = await recoveryPlanService.getAllPlans();
      }
 
      // Calculer les statistiques
      const now = new Date();
      const upcomingApts = appointments.filter(apt => 
        new Date(apt.appointment_date) > now && apt.status !== 'cancelled'
      );
      const completedApts = appointments.filter(apt => apt.status === 'completed');
      const activePlansList = plans.filter(plan => plan.status === 'active');
      const unreadAlertsList = alerts.filter(alert => !alert.is_read);
 
      setStats({
        totalAppointments: appointments.length,
        upcomingAppointments: upcomingApts.length,
        completedAppointments: completedApts.length,
        activeRecoveryPlans: activePlansList.length,
        unreadAlerts: unreadAlertsList.length
      });
 
      // Trier et limiter les données récentes
      setRecentAppointments(
        appointments
          .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
          .slice(0, 5)
      );
 
      setRecentAlerts(
        alerts
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
      );
 
      setActivePlans(activePlansList.slice(0, 3));
 
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du tableau de bord');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
 
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
 
  const getStatusBadge = (status) => {
    const statusMap = {
      'scheduled': { label: 'Planifié', class: 'status-scheduled' },
      'confirmed': { label: 'Confirmé', class: 'status-confirmed' },
      'completed': { label: 'Terminé', class: 'status-completed' },
      'cancelled': { label: 'Annulé', class: 'status-cancelled' },
      'pending': { label: 'En attente', class: 'status-pending' },
      'active': { label: 'Actif', class: 'status-active' }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };
 
  const calculateProgress = (plan) => {
    if (!plan.exercises || plan.exercises.length === 0) return 0;
    const completed = plan.exercises.filter(ex => ex.completed).length;
    return Math.round((completed / plan.exercises.length) * 100);
  };
 
  if (loading) {
    return <div className="loading">Chargement du tableau de bord...</div>;
  }
 
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <p className="welcome-message">
          Bienvenue, {user?.first_name} {user?.last_name}
        </p>
      </div>
 
      {error && <div className="error-message">{error}</div>}
 
      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.upcomingAppointments}</h3>
            <p>Rendez-vous à venir</p>
          </div>
        </div>
 
        <div className="stat-card stat-success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>{stats.completedAppointments}</h3>
            <p>Rendez-vous terminés</p>
          </div>
        </div>
 
        <div className="stat-card stat-info">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.activeRecoveryPlans}</h3>
            <p>Plans actifs</p>
          </div>
        </div>
 
        <div className="stat-card stat-warning">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>{stats.unreadAlerts}</h3>
            <p>Alertes non lues</p>
          </div>
        </div>
      </div>
 
      <div className="dashboard-content">
        {/* Rendez-vous récents */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Prochains rendez-vous</h2>
            <a href="/appointments" className="view-all-link">Voir tout →</a>
          </div>
 
          {recentAppointments.length === 0 ? (
            <div className="no-data-small">Aucun rendez-vous</div>
          ) : (
            <div className="recent-appointments">
              {recentAppointments.map(apt => (
                <div key={apt.id} className="appointment-item-small">
                  <div className="appointment-date-badge">
                    <span className="day">
                      {new Date(apt.appointment_date).getDate()}
                    </span>
                    <span className="month">
                      {new Date(apt.appointment_date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="appointment-info-small">
                    <h4>
                      {user?.role === 'patient' 
                        ? apt.physiotherapist_name 
                        : apt.patient_name}
                    </h4>
                    <p className="appointment-time">
                      {new Date(apt.appointment_date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {apt.reason && <p className="appointment-reason">{apt.reason}</p>}
                  </div>
                  {getStatusBadge(apt.status)}
                </div>
              ))}
            </div>
          )}
        </div>
 
        {/* Plans de récupération actifs */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Plans de récupération actifs</h2>
            <a href="/recovery-plans" className="view-all-link">Voir tout →</a>
          </div>
 
          {activePlans.length === 0 ? (
            <div className="no-data-small">Aucun plan actif</div>
          ) : (
            <div className="active-plans">
              {activePlans.map(plan => (
                <div key={plan.id} className="plan-item-small">
                  <div className="plan-header-small">
                    <h4>{plan.title}</h4>
                    {getStatusBadge(plan.status)}
                  </div>
                  {plan.patient_name && user?.role === 'physiotherapist' && (
                    <p className="plan-patient-small">👤 {plan.patient_name}</p>
                  )}
                  <div className="plan-progress-small">
                    <div className="progress-bar-small">
                      <div 
                        className="progress-fill-small" 
                        style={{ width: `${calculateProgress(plan)}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{calculateProgress(plan)}%</span>
                  </div>
                  <p className="plan-dates-small">
                    {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
 
        {/* Alertes récentes */}
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h2>Alertes récentes</h2>
            <a href="/alerts" className="view-all-link">Voir tout →</a>
          </div>
 
          {recentAlerts.length === 0 ? (
            <div className="no-data-small">Aucune alerte</div>
          ) : (
            <div className="recent-alerts">
              {recentAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`alert-item-small ${!alert.is_read ? 'unread' : ''}`}
                >
                  <div className="alert-icon-small">
                    {alert.priority === 'high' ? '🔴' : 
                     alert.priority === 'medium' ? '🟡' : '🟢'}
                  </div>
                  <div className="alert-content-small">
                    <h4>{alert.title || 'Alerte'}</h4>
                    <p>{alert.message}</p>
                    <span className="alert-time">
                      {formatDateTime(alert.created_at)}
                    </span>
                  </div>
                  {!alert.is_read && <span className="unread-indicator">●</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
 
      {/* Actions rapides */}
      <div className="quick-actions">
        <h2>Actions rapides</h2>
        <div className="actions-grid">
          <a href="/appointments/new" className="action-card">
            <span className="action-icon">📅</span>
            <span className="action-label">Nouveau rendez-vous</span>
          </a>
 
          {user?.role === 'physiotherapist' && (
            <>
              <a href="/recovery-plans/new" className="action-card">
                <span className="action-icon">📋</span>
                <span className="action-label">Nouveau plan</span>
              </a>
 
              <a href="/exercises/new" className="action-card">
                <span className="action-icon">💪</span>
                <span className="action-label">Nouvel exercice</span>
              </a>
 
              <a href="/questionnaires/new" className="action-card">
                <span className="action-icon">📝</span>
                <span className="action-label">Nouveau questionnaire</span>
              </a>
            </>
          )}
 
          <a href="/profile" className="action-card">
            <span className="action-icon">👤</span>
            <span className="action-label">Mon profil</span>
          </a>
        </div>
      </div>
    </div>
  );
};
 
export default Dashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { questionnaireService } from '../services/questionnaireService';
import { exerciseService } from '../services/exerciseService';
import { alertService } from '../services/alertService';
import { recoveryPlanService } from '../services/recoveryPlanService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    questionnaires: 0,
    exercises: 0,
    alerts: 0,
    recoveryPlans: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const patientId = user?.id || 'PAT-001';

      const [appointments, questionnaires, exercises, alerts, plans] = await Promise.all([
        appointmentService.getPatientAppointments(patientId),
        questionnaireService.getPatientResponses(patientId),
        exerciseService.getPatientExercises(patientId),
        alertService.getPatientAlerts(patientId),
        recoveryPlanService.getPatientPlans(patientId)
      ]);

      setStats({
        appointments: appointments.data?.length || 0,
        questionnaires: questionnaires.data?.length || 0,
        exercises: exercises.data?.length || 0,
        alerts: alerts.data?.filter(a => a.status === 'active').length || 0,
        recoveryPlans: plans.data?.length || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement du dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de Bord</h1>
        <p>Bienvenue {user?.name || 'Utilisateur'}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/recovery-plans')}>
          <div className="card-icon">🏥</div>
          <h3 className="card-title">Parcours de Récupération</h3>
          <div className="card-value">{stats.recoveryPlans}</div>
          <p className="card-description">Parcours actifs</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/appointments')}>
          <div className="card-icon">📅</div>
          <h3 className="card-title">Rendez-vous</h3>
          <div className="card-value">{stats.appointments}</div>
          <p className="card-description">Rendez-vous programmés</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/questionnaires')}>
          <div className="card-icon">📋</div>
          <h3 className="card-title">Questionnaires</h3>
          <div className="card-value">{stats.questionnaires}</div>
          <p className="card-description">Questionnaires complétés</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/exercises')}>
          <div className="card-icon">💪</div>
          <h3 className="card-title">Exercices</h3>
          <div className="card-value">{stats.exercises}</div>
          <p className="card-description">Exercices assignés</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/alerts')}>
          <div className="card-icon">🚨</div>
          <h3 className="card-title">Alertes</h3>
          <div className="card-value">{stats.alerts}</div>
          <p className="card-description">Alertes actives</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
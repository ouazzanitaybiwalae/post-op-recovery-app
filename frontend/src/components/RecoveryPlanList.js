import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import recoveryPlanService from '../services/recoveryPlanService';
import '../App.css';

const RecoveryPlanList = ({ onSelectPlan, onCreateNew }) => {
  const { user } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      let data;
      
      if (user?.role === 'patient') {
        data = await recoveryPlanService.getMyPlans();
      } else {
        data = await recoveryPlanService.getAllPlans();
      }
      
      setPlans(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des plans de récupération');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce plan de récupération ?')) {
      return;
    }

    try {
      await recoveryPlanService.deletePlan(id);
      setPlans(plans.filter(plan => plan.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression du plan');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await recoveryPlanService.updatePlanStatus(id, newStatus);
      setPlans(plans.map(plan => 
        plan.id === id ? { ...plan, status: newStatus } : plan
      ));
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
      console.error(err);
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || plan.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { label: 'Actif', class: 'status-active' },
      'completed': { label: 'Terminé', class: 'status-completed' },
      'pending': { label: 'En attente', class: 'status-pending' },
      'cancelled': { label: 'Annulé', class: 'status-cancelled' }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const calculateProgress = (plan) => {
    if (!plan.exercises || plan.exercises.length === 0) return 0;
    
    const completedExercises = plan.exercises.filter(ex => ex.completed).length;
    return Math.round((completedExercises / plan.exercises.length) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Chargement des plans de récupération...</div>;
  }

  return (
    <div className="recovery-plan-list-container">
      <div className="list-header">
        <h2>Plans de Récupération</h2>
        {user?.role === 'physiotherapist' && onCreateNew && (
          <button onClick={onCreateNew} className="btn-primary">
            + Nouveau plan
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Rechercher un plan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="pending">En attente</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="no-data">
          {searchTerm || filterStatus
            ? 'Aucun plan ne correspond aux critères de recherche'
            : 'Aucun plan de récupération disponible'}
        </div>
      ) : (
        <div className="plans-grid">
          {filteredPlans.map(plan => (
            <div key={plan.id} className="plan-card">
              <div className="plan-header">
                <h3>{plan.title}</h3>
                {getStatusBadge(plan.status)}
              </div>

              {plan.patient_name && user?.role === 'physiotherapist' && (
                <div className="plan-patient">
                  <strong>Patient:</strong> {plan.patient_name}
                </div>
              )}

              {plan.description && (
                <p className="plan-description">
                  {plan.description.length > 120
                    ? `${plan.description.substring(0, 120)}...`
                    : plan.description}
                </p>
              )}

              <div className="plan-dates">
                <div className="date-item">
                  <span className="date-label">Début:</span>
                  <span className="date-value">{formatDate(plan.start_date)}</span>
                </div>
                <div className="date-item">
                  <span className="date-label">Fin:</span>
                  <span className="date-value">{formatDate(plan.end_date)}</span>
                </div>
              </div>

              {plan.exercises && plan.exercises.length > 0 && (
                <div className="plan-progress">
                  <div className="progress-header">
                    <span>Progression</span>
                    <span>{calculateProgress(plan)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${calculateProgress(plan)}%` }}
                    ></div>
                  </div>
                  <div className="exercise-count">
                    {plan.exercises.filter(ex => ex.completed).length} / {plan.exercises.length} exercices complétés
                  </div>
                </div>
              )}

              <div className="plan-actions">
                <button
                  onClick={() => onSelectPlan(plan)}
                  className="btn-view"
                >
                  Voir détails
                </button>

                {user?.role === 'physiotherapist' && plan.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(plan.id, 'active')}
                    className="btn-activate"
                  >
                    Activer
                  </button>
                )}

                {user?.role === 'physiotherapist' && plan.status === 'active' && (
                  <button
                    onClick={() => handleUpdateStatus(plan.id, 'completed')}
                    className="btn-complete"
                  >
                    Terminer
                  </button>
                )}

                {user?.role === 'physiotherapist' && (
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="btn-delete"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecoveryPlanList;
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import alertService from '../services/alertService';
import '../App.css';

const AlertList = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, read, unread
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertService.getAllAlerts();
      setAlerts(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des alertes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await alertService.markAsRead(id);
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, is_read: true } : alert
      ));
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'alerte');
      console.error(err);
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await alertService.markAsUnread(id);
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, is_read: false } : alert
      ));
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'alerte');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      return;
    }

    try {
      await alertService.deleteAlert(id);
      setAlerts(alerts.filter(alert => alert.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression de l\'alerte');
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertService.markAllAsRead();
      setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
    } catch (err) {
      setError('Erreur lors de la mise à jour des alertes');
      console.error(err);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesReadStatus = filter === 'all' || 
                              (filter === 'read' && alert.is_read) ||
                              (filter === 'unread' && !alert.is_read);
    const matchesPriority = !priorityFilter || alert.priority === priorityFilter;
    
    return matchesReadStatus && matchesPriority;
  });

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'élevée':
        return '🔴';
      case 'medium':
      case 'moyenne':
        return '🟡';
      case 'low':
      case 'faible':
        return '🟢';
      default:
                return '⚪';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'élevée':
        return 'priority-high';
      case 'medium':
      case 'moyenne':
        return 'priority-medium';
      case 'low':
      case 'faible':
        return 'priority-low';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Chargement des alertes...</div>;
  }

  return (
    <div className="alert-list-container">
      <div className="list-header">
        <div>
          <h2>Alertes et Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn-secondary">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            Toutes ({alerts.length})
          </button>
          <button
            className={filter === 'unread' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('unread')}
          >
            Non lues ({unreadCount})
          </button>
          <button
            className={filter === 'read' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('read')}
          >
            Lues ({alerts.length - unreadCount})
          </button>
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Toutes les priorités</option>
          <option value="high">Élevée</option>
          <option value="medium">Moyenne</option>
          <option value="low">Faible</option>
        </select>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="no-data">
          {filter === 'unread' 
            ? 'Aucune alerte non lue' 
            : filter === 'read'
            ? 'Aucune alerte lue'
            : 'Aucune alerte disponible'}
        </div>
      ) : (
        <div className="alerts-list">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`alert-item ${!alert.is_read ? 'unread' : ''} ${getPriorityClass(alert.priority)}`}
            >
              <div className="alert-priority-indicator">
                {getPriorityIcon(alert.priority)}
              </div>

              <div className="alert-content">
                <div className="alert-header">
                  <h4>{alert.title || 'Alerte'}</h4>
                  <span className="alert-date">{formatDate(alert.created_at)}</span>
                </div>

                <p className="alert-message">{alert.message}</p>

                {alert.patient_name && (
                  <div className="alert-meta">
                    <span className="patient-info">👤 {alert.patient_name}</span>
                  </div>
                )}

                {alert.type && (
                  <span className="alert-type-badge">{alert.type}</span>
                )}
              </div>

              <div className="alert-actions">
                {!alert.is_read ? (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="btn-icon"
                    title="Marquer comme lu"
                  >
                    ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsUnread(alert.id)}
                    className="btn-icon"
                    title="Marquer comme non lu"
                  >
                    ↺
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="btn-icon btn-delete"
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertList;
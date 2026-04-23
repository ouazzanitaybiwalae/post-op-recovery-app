const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
 
const app = express();
const PORT = process.env.PORT || 3004;
 
app.use(cors());
app.use(bodyParser.json());
 
const alerts = [];
const notifications = [];
 
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Complication Alert Service', port: PORT });
});
 
app.post('/api/alert/create', (req, res) => {
  const { patientId, source, sourceId, anomalies, timestamp } = req.body;
 
  if (!patientId || !source || !anomalies) {
    return res.status(400).json({
      success: false,
      message: 'patientId, source et anomalies sont requis'
    });
  }
 
  const highestSeverity = anomalies.reduce((max, anomaly) => {
    const severityLevels = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    const currentLevel = severityLevels[anomaly.severity] || 0;
    const maxLevel = severityLevels[max] || 0;
    return currentLevel > maxLevel ? anomaly.severity : max;
  }, 'LOW');
 
  const alert = {
    id: uuidv4(),
    patientId,
    source,
    sourceId: sourceId || null,
    anomalies,
    severity: highestSeverity,
    status: 'pending',
    createdAt: timestamp || new Date().toISOString(),
    acknowledgedAt: null,
    acknowledgedBy: null,
    resolvedAt: null,
    resolvedBy: null,
    notes: ''
  };
 
  alerts.push(alert);
 
  const notification = {
    id: uuidv4(),
    alertId: alert.id,
    patientId,
    type: 'alert-created',
    severity: highestSeverity,
    message: `Nouvelle alerte ${highestSeverity} pour le patient ${patientId}`,
    read: false,
    createdAt: new Date().toISOString()
  };
 
  notifications.push(notification);
 
  res.status(201).json({
    success: true,
    message: 'Alerte creee avec succes',
    alert
  });
});
 
app.get('/api/alert', (req, res) => {
  const { status, severity, patientId } = req.query;
 
  let filteredAlerts = alerts;
 
  if (status) {
    filteredAlerts = filteredAlerts.filter(a => a.status === status);
  }
 
  if (severity) {
    filteredAlerts = filteredAlerts.filter(a => a.severity === severity);
  }
 
  if (patientId) {
    filteredAlerts = filteredAlerts.filter(a => a.patientId === patientId);
  }
 
  filteredAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
 
  res.json({
    success: true,
    count: filteredAlerts.length,
    alerts: filteredAlerts
  });
});
 
app.get('/api/alert/:id', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
 
  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'Alerte non trouvee'
    });
  }
 
  res.json({
    success: true,
    alert
  });
});
 
app.get('/api/alert/patient/:patientId', (req, res) => {
  const patientAlerts = alerts.filter(a => a.patientId === req.params.patientId);
 
  patientAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
 
  res.json({
    success: true,
    count: patientAlerts.length,
    alerts: patientAlerts
  });
});
 
app.get('/api/alert/patient/:patientId/pending', (req, res) => {
  const pendingAlerts = alerts.filter(
    a => a.patientId === req.params.patientId && a.status === 'pending'
  );
 
  pendingAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
 
  res.json({
    success: true,
    count: pendingAlerts.length,
    alerts: pendingAlerts
  });
});
 
app.put('/api/alert/:id/acknowledge', (req, res) => {
  const { acknowledgedBy, notes } = req.body;
 
  const alert = alerts.find(a => a.id === req.params.id);
 
  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'Alerte non trouvee'
    });
  }
 
  if (alert.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Cette alerte a deja ete traitee'
    });
  }
 
  alert.status = 'acknowledged';
  alert.acknowledgedAt = new Date().toISOString();
  alert.acknowledgedBy = acknowledgedBy || 'system';
  alert.notes = notes || '';
 
  const notification = {
    id: uuidv4(),
    alertId: alert.id,
    patientId: alert.patientId,
    type: 'alert-acknowledged',
    severity: alert.severity,
    message: `Alerte ${alert.id} prise en compte par ${alert.acknowledgedBy}`,
    read: false,
    createdAt: new Date().toISOString()
  };
 
  notifications.push(notification);
 
  res.json({
    success: true,
    message: 'Alerte prise en compte',
    alert
  });
});
 
app.put('/api/alert/:id/resolve', (req, res) => {
  const { resolvedBy, notes } = req.body;
 
  const alert = alerts.find(a => a.id === req.params.id);
 
  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'Alerte non trouvee'
    });
  }
 
  if (alert.status === 'resolved') {
    return res.status(400).json({
      success: false,
      message: 'Cette alerte est deja resolue'
    });
  }
 
  alert.status = 'resolved';
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = resolvedBy || 'system';
  if (notes) {
    alert.notes = alert.notes ? alert.notes + ' | ' + notes : notes;
  }
 
  const notification = {
    id: uuidv4(),
    alertId: alert.id,
    patientId: alert.patientId,
    type: 'alert-resolved',
    severity: alert.severity,
    message: `Alerte ${alert.id} resolue par ${alert.resolvedBy}`,
    read: false,
    createdAt: new Date().toISOString()
  };
 
  notifications.push(notification);
 
  res.json({
    success: true,
    message: 'Alerte resolue',
    alert
  });
});
 
app.get('/api/notification', (req, res) => {
  const { read, patientId } = req.query;
 
  let filteredNotifications = notifications;
 
  if (read !== undefined) {
    const isRead = read === 'true';
    filteredNotifications = filteredNotifications.filter(n => n.read === isRead);
  }
 
  if (patientId) {
    filteredNotifications = filteredNotifications.filter(n => n.patientId === patientId);
  }
 
  filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
 
  res.json({
    success: true,
    count: filteredNotifications.length,
    notifications: filteredNotifications
  });
});
 
app.get('/api/notification/unread/count', (req, res) => {
  const { patientId } = req.query;
 
  let unreadNotifications = notifications.filter(n => !n.read);
 
  if (patientId) {
    unreadNotifications = unreadNotifications.filter(n => n.patientId === patientId);
  }
 
  res.json({
    success: true,
    count: unreadNotifications.length
  });
});
 
app.put('/api/notification/:id/read', (req, res) => {
  const notification = notifications.find(n => n.id === req.params.id);
 
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification non trouvee'
    });
  }
 
  notification.read = true;
 
  res.json({
    success: true,
    message: 'Notification marquee comme lue',
    notification
  });
});
 
app.put('/api/notification/mark-all-read', (req, res) => {
  const { patientId } = req.body;
 
  let updatedCount = 0;
 
  notifications.forEach(n => {
    if (!n.read && (!patientId || n.patientId === patientId)) {
      n.read = true;
      updatedCount++;
    }
  });
 
  res.json({
    success: true,
    message: `${updatedCount} notifications marquees comme lues`,
    count: updatedCount
  });
});
 
app.get('/api/alert/stats/overview', (req, res) => {
  const totalAlerts = alerts.length;
  const pendingAlerts = alerts.filter(a => a.status === 'pending').length;
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged').length;
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;
 
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;
  const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM').length;
  const lowAlerts = alerts.filter(a => a.severity === 'LOW').length;
 
  const bySeverity = {
    CRITICAL: criticalAlerts,
    HIGH: highAlerts,
    MEDIUM: mediumAlerts,
    LOW: lowAlerts
  };
 
  const byStatus = {
    pending: pendingAlerts,
    acknowledged: acknowledgedAlerts,
    resolved: resolvedAlerts
  };
 
  res.json({
    success: true,
    stats: {
      total: totalAlerts,
      byStatus,
      bySeverity
    }
  });
});
 
app.get('/api/alert/stats/patient/:patientId', (req, res) => {
  const patientId = req.params.patientId;
 
  const patientAlerts = alerts.filter(a => a.patientId === patientId);
 
  const totalAlerts = patientAlerts.length;
  const pendingAlerts = patientAlerts.filter(a => a.status === 'pending').length;
  const acknowledgedAlerts = patientAlerts.filter(a => a.status === 'acknowledged').length;
  const resolvedAlerts = patientAlerts.filter(a => a.status === 'resolved').length;
 
  const criticalAlerts = patientAlerts.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts = patientAlerts.filter(a => a.severity === 'HIGH').length;
 
  const recentAlerts = patientAlerts
    .filter(a => {
      const alertDate = new Date(a.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return alertDate >= sevenDaysAgo;
    })
    .length;
 
  res.json({
    success: true,
    stats: {
      total: totalAlerts,
      pending: pendingAlerts,
      acknowledged: acknowledgedAlerts,
      resolved: resolvedAlerts,
      critical: criticalAlerts,
      high: highAlerts,
      recentAlerts
    }
  });
});
 
app.listen(PORT, () => {
  console.log(`Complication Alert Service demarre sur le port ${PORT}`);
});
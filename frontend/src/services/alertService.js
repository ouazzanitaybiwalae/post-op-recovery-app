import { alertAPI } from './api';

const alertService = {
  getAllAlerts: async () => {
    try {
      const response = await alertAPI.get('/api/alert');
      return response.data.alerts || [];
    } catch { return []; }
  },
  getPatientAlerts: async (patientId) => {
    try {
      const response = await alertAPI.get(`/api/alert/patient/${patientId}`);
      return response.data.alerts || [];
    } catch { return []; }
  },
  createAlert: async (alertData) => {
    const response = await alertAPI.post('/api/alert/create', alertData);
    return response.data.alert;
  },
  acknowledgeAlert: async (id, userId) => {
    const response = await alertAPI.put(`/api/alert/${id}/acknowledge`, { userId });
    return response.data.alert;
  },
  resolveAlert: async (id, userId, resolution) => {
    const response = await alertAPI.put(`/api/alert/${id}/resolve`, { userId, resolution });
    return response.data.alert;
  }
};

export default alertService;
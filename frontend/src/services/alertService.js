import { alertAPI } from './api';

export const alertService = {
  getAllAlerts: async () => {
    const response = await alertAPI.get('/api/alert');
    return response.data;
  },

  getPatientAlerts: async (patientId) => {
    const response = await alertAPI.get(`/api/alert/patient/${patientId}`);
    return response.data;
  },

  getAlertById: async (id) => {
    const response = await alertAPI.get(`/api/alert/${id}`);
    return response.data;
  },

  createAlert: async (alertData) => {
    const response = await alertAPI.post('/api/alert/create', alertData);
    return response.data;
  },

  acknowledgeAlert: async (id, userId) => {
    const response = await alertAPI.put(`/api/alert/${id}/acknowledge`, { userId });
    return response.data;
  },

  resolveAlert: async (id, userId, resolution) => {
    const response = await alertAPI.put(`/api/alert/${id}/resolve`, { userId, resolution });
    return response.data;
  }
};
export default alertService;
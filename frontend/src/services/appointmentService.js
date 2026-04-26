import { careCoordinationAPI } from './api';

export const appointmentService = {
  getAllAppointments: async () => {
    const response = await careCoordinationAPI.get('/api/appointment');
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await careCoordinationAPI.get('/api/appointment');
    return response.data;
  },

  getPhysiotherapistAppointments: async () => {
    const response = await careCoordinationAPI.get('/api/appointment');
    return response.data;
  },

  getPatientAppointments: async (patientId) => {
    const response = await careCoordinationAPI.get(`/api/appointment/patient/${patientId}`);
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await careCoordinationAPI.get(`/api/appointment/${id}`);
    return response.data;
  },

  createAppointment: async (appointmentData) => {
    const response = await careCoordinationAPI.post('/api/appointment/create', appointmentData);
    return response.data;
  },

  updateAppointment: async (id, appointmentData) => {
    const response = await careCoordinationAPI.put(`/api/appointment/${id}`, appointmentData);
    return response.data;
  },

  updateAppointmentStatus: async (id, status) => {
    const response = await careCoordinationAPI.put(`/api/appointment/${id}/status`, { status });
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await careCoordinationAPI.put(`/api/appointment/${id}/cancel`);
    return response.data;
  },

  confirmAppointment: async (id) => {
    const response = await careCoordinationAPI.put(`/api/appointment/${id}/confirm`);
    return response.data;
  },

  deleteAppointment: async (id) => {
    const response = await careCoordinationAPI.delete(`/api/appointment/${id}`);
    return response.data;
  }
};

export default appointmentService;
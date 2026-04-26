import { careCoordinationAPI } from './api';

const appointmentService = {
  getAllAppointments: async () => {
    try {
      const response = await careCoordinationAPI.get('/api/appointments');
      return response.data.appointments || response.data || [];
    } catch { return []; }
  },
  getMyAppointments: async () => {
    try {
      const response = await careCoordinationAPI.get('/api/appointments');
      return response.data.appointments || response.data || [];
    } catch { return []; }
  },
  getPhysiotherapistAppointments: async () => {
    try {
      const response = await careCoordinationAPI.get('/api/appointments');
      return response.data.appointments || response.data || [];
    } catch { return []; }
  }
};

export default appointmentService;
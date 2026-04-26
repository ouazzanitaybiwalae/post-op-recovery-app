import { recoveryPlanAPI } from './api';

const recoveryPlanService = {
  getAllPlans: async () => {
    try {
      const response = await recoveryPlanAPI.get('/api/recovery-plan/templates');
      return response.data.templates || response.data || [];
    } catch { return []; }
  },
  getMyPlans: async () => {
    try {
      const response = await recoveryPlanAPI.get('/api/recovery-plan/templates');
      return response.data.templates || response.data || [];
    } catch { return []; }
  },
  getAllTemplates: async () => {
    try {
      const response = await recoveryPlanAPI.get('/api/recovery-plan/templates');
      return response.data.templates || response.data || [];
    } catch { return []; }
  },
  getPatientPlans: async (patientId) => {
    try {
      const response = await recoveryPlanAPI.get(`/api/recovery-plan/patient/${patientId}`);
      return response.data.plans || [];
    } catch { return []; }
  }
};

export default recoveryPlanService;
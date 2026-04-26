import { recoveryPlanAPI } from './api';

export const recoveryPlanService = {
  getAllTemplates: async () => {
    const response = await recoveryPlanAPI.get('/api/recovery-plan/templates');
    return response.data;
  },

  getTemplateById: async (id) => {
    const response = await recoveryPlanAPI.get(`/api/recovery-plan/templates/${id}`);
    return response.data;
  },

  createTemplate: async (templateData) => {
    const response = await recoveryPlanAPI.post('/api/recovery-plan/templates/create', templateData);
    return response.data;
  },

  assignPlan: async (assignmentData) => {
    const response = await recoveryPlanAPI.post('/api/recovery-plan/assign', assignmentData);
    return response.data;
  },

  getPatientPlans: async (patientId) => {
    const response = await recoveryPlanAPI.get(`/api/recovery-plan/patient/${patientId}`);
    return response.data;
  },

  getPlanById: async (id) => {
    const response = await recoveryPlanAPI.get(`/api/recovery-plan/${id}`);
    return response.data;
  },

  updateProgress: async (id, progressData) => {
    const response = await recoveryPlanAPI.put(`/api/recovery-plan/${id}/progress`, progressData);
    return response.data;
  },

  updatePhase: async (id, phase) => {
    const response = await recoveryPlanAPI.put(`/api/recovery-plan/${id}/phase`, { phase });
    return response.data;
  }
};

  getAllPlans: async () => {
    const response = await recoveryPlanAPI.get('/api/recovery-plan/templates');
    return response.data;
  },

  getMyPlans: async () => {
    const response = await recoveryPlanAPI.get('/api/recovery-plan/templates');
    return response.data;
  }
};
export default recoveryPlanService;
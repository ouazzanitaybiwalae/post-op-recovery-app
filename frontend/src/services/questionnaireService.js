import { questionnaireAPI } from './api';

export const questionnaireService = {
  getAllQuestionnaires: async () => {
    const response = await questionnaireAPI.get('/api/questionnaire');
    return response.data;
  },

  getQuestionnaireById: async (id) => {
    const response = await questionnaireAPI.get(`/api/questionnaire/${id}`);
    return response.data;
  },

  createQuestionnaire: async (questionnaireData) => {
    const response = await questionnaireAPI.post('/api/questionnaire/create', questionnaireData);
    return response.data;
  },

  submitResponse: async (responseData) => {
    const response = await questionnaireAPI.post('/api/questionnaire/response/submit', responseData);
    return response.data;
  },

  getPatientResponses: async (patientId) => {
    const response = await questionnaireAPI.get(`/api/questionnaire/response/patient/${patientId}`);
    return response.data;
  },

  getQuestionnaireResponses: async (questionnaireId) => {
    const response = await questionnaireAPI.get(`/api/questionnaire/response/questionnaire/${questionnaireId}`);
    return response.data;
  }
};
export default questionnaireService;
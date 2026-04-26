import { exerciseAPI } from './api';

export const exerciseService = {
  getAllExercises: async () => {
    const response = await exerciseAPI.get('/api/exercise');
    return response.data;
  },

  getExerciseById: async (id) => {
    const response = await exerciseAPI.get(`/api/exercise/${id}`);
    return response.data;
  },

  createExercise: async (exerciseData) => {
    const response = await exerciseAPI.post('/api/exercise/create', exerciseData);
    return response.data;
  },

  assignExercise: async (assignmentData) => {
    const response = await exerciseAPI.post('/api/exercise/assign', assignmentData);
    return response.data;
  },

  getPatientExercises: async (patientId) => {
    const response = await exerciseAPI.get(`/api/exercise/patient/${patientId}`);
    return response.data;
  },

  recordProgress: async (progressData) => {
    const response = await exerciseAPI.post('/api/exercise/progress', progressData);
    return response.data;
  },

  getAssignmentProgress: async (assignmentId) => {
    const response = await exerciseAPI.get(`/api/exercise/progress/${assignmentId}`);
    return response.data;
  }
};
export default exerciseService;
import axios from 'axios';

const CARE_COORDINATION_URL =
  process.env.REACT_APP_CARE_COORDINATION_URL || 'http://localhost:5001';

const authAPI = axios.create({
  baseURL: CARE_COORDINATION_URL,
  headers: { 'Content-Type': 'application/json' },
});

const authService = {
  login: async ({ email, password }) => {
    const response = await authAPI.post('/api/auth/login', { email, password });
    // Le backend doit renvoyer { token, user }
    return response.data;
  },

  register: async (userData) => {
    const response = await authAPI.post('/api/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
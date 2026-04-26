import axios from 'axios';

const CARE_COORDINATION_URL =
  process.env.REACT_APP_CARE_COORDINATION_URL || 'http://localhost:5001';

const userAPI = axios.create({
  baseURL: CARE_COORDINATION_URL,
  headers: { 'Content-Type': 'application/json' },
});

const userService = {
  updateProfile: async (profileData) => {
    const token = localStorage.getItem('token');
    const response = await userAPI.put('/api/user/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  changePassword: async ({ current_password, new_password }) => {
    const token = localStorage.getItem('token');
    const response = await userAPI.put(
      '/api/user/password',
      { current_password, new_password },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};

export default userService;
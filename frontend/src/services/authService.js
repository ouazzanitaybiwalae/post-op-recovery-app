import axios from 'axios';

const USERS = [
  { id: 1, email: 'admin@physiotrack.com', password: 'admin123', role: 'admin', first_name: 'Dr', last_name: 'Martin' },
  { id: 2, email: 'physio@physiotrack.com', password: 'physio123', role: 'physiotherapist', first_name: 'Karine', last_name: 'Benali' },
  { id: 3, email: 'patient@physiotrack.com', password: 'patient123', role: 'patient', first_name: 'Marie', last_name: 'Moreau' },
];

const authService = {
  login: async (formData) => {
    const { email, password } = formData;
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) {
      const token = 'demo-token-' + user.id;
      return { token, user };
    }
    throw { response: { data: { message: 'Identifiants incorrects' } } };
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
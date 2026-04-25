import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Page Login
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('user', JSON.stringify({ email, role: 'admin' }));
      window.location.href = '/dashboard';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '10px', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', color: '#667eea' }}>🏥 Post-Op Recovery</h1>
        <h2 style={{ textAlign: 'center' }}>Connexion</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px' }}
              required
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px' }}>
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div style={{ minHeight: '100vh' }}>
      <h1>Dashboard</h1>
      <p>{user.email}</p>

      <button onClick={handleLogout}>
        Déconnexion
      </button>
    </div>
  );
}

// App principal
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
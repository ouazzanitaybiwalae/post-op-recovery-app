import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav style={{ background: '#667eea', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'white', fontSize: '20px' }}>🏥</span>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>PostOp Care</span>
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        {[
          { path: '/dashboard', label: '📊 Dashboard' },
          { path: '/recovery-plans', label: '📋 Parcours' },
          { path: '/questionnaires', label: '📝 Questionnaires' },
          { path: '/exercises', label: '💪 Exercices' },
          { path: '/alerts', label: '🚨 Alertes' },
          { path: '/appointments', label: '📅 Rendez-vous' },
        ].map(({ path, label }) => (
          <Link key={path} to={path} style={{
            color: 'white',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            background: location.pathname === path ? 'rgba(255,255,255,0.25)' : 'transparent'
          }}>{label}</Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'white', fontSize: '13px' }}>👤 {user?.first_name} {user?.last_name}</span>
        <button onClick={handleLogout} style={{
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid white',
          color: 'white',
          padding: '6px 14px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px'
        }}>Déconnexion</button>
      </div>
    </nav>
  );
};

export default Navbar;
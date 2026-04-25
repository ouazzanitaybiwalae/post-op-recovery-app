import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🏥 Postoperative Care
        </Link>
        
        <ul className="navbar-menu">
          <li>
            <Link to="/" className="navbar-link">
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/recovery-plans" className="navbar-link">
              🏥 Parcours
            </Link>
          </li>
          <li>
            <Link to="/appointments" className="navbar-link">
              📅 Rendez-vous
            </Link>
          </li>
          <li>
            <Link to="/questionnaires" className="navbar-link">
              📋 Questionnaires
            </Link>
          </li>
          <li>
            <Link to="/exercises" className="navbar-link">
              💪 Exercices
            </Link>
          </li>
          <li>
            <Link to="/alerts" className="navbar-link">
              🚨 Alertes
            </Link>
          </li>
          <li>
            <span className="navbar-link">
              👤 {user?.name || 'Utilisateur'}
            </span>
          </li>
          <li>
            <button onClick={handleLogout} className="btn btn-danger">
              Déconnexion
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import './App.css';

// Pages
import Login from './pages/Login';
import DashboardPage from './pages/Dashboard';
import RecoveryPlans from './pages/RecoveryPlans';
import Appointments from './pages/Appointments';
import Questionnaire from './pages/Questionnaire';
import Exercises from './pages/Exercises';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';

// Route protégée : redirige vers /login si non authentifié
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Layout avec Navbar uniquement pour les pages authentifiées
const AppLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />

        {/* Routes protégées */}
        <Route path="/dashboard" element={
          <PrivateRoute><DashboardPage /></PrivateRoute>
        } />
        <Route path="/recovery-plans" element={
          <PrivateRoute><RecoveryPlans /></PrivateRoute>
        } />
        <Route path="/appointments" element={
          <PrivateRoute><Appointments /></PrivateRoute>
        } />
        <Route path="/questionnaires" element={
          <PrivateRoute><Questionnaire /></PrivateRoute>
        } />
        <Route path="/exercises" element={
          <PrivateRoute><Exercises /></PrivateRoute>
        } />
        <Route path="/alerts" element={
          <PrivateRoute><Alerts /></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
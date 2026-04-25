import React from 'react';
import AlertList from '../components/AlertList';
import '../App.css';

const Alerts = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Alertes et Notifications</h1>
      </div>

      <div className="page-content">
        <AlertList />
      </div>
    </div>
  );
};

export default Alerts;
import React, { useState } from 'react';
import RecoveryPlanList from '../components/RecoveryPlanList';
import RecoveryPlanDetails from '../components/RecoveryPlanDetails';
import '../App.css';
 
const RecoveryPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
 
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowCreateForm(false);
  };
 
  const handleCreateNew = () => {
    setSelectedPlan(null);
    setShowCreateForm(true);
  };
 
  const handleClose = () => {
    setSelectedPlan(null);
    setShowCreateForm(false);
    // Recharger la liste
    window.location.reload();
  };
 
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Plans de Récupération</h1>
      </div>
 
      <div className="page-content">
        {!selectedPlan && !showCreateForm ? (
          <RecoveryPlanList
            onSelectPlan={handleSelectPlan}
            onCreateNew={handleCreateNew}
          />
        ) : (
          <RecoveryPlanDetails
            planId={selectedPlan?.id}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};
 
export default RecoveryPlans;
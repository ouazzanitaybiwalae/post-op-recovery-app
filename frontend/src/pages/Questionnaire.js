import React, { useState } from 'react';
import QuestionnaireList from '../components/QuestionnaireList';
import QuestionnaireDetails from '../components/QuestionnaireDetails';
import '../App.css';

const Questionnaires = () => {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSelectQuestionnaire = (questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setShowCreateForm(false);
  };

  const handleCreateNew = () => {
    setSelectedQuestionnaire(null);
    setShowCreateForm(true);
  };

  const handleClose = () => {
    setSelectedQuestionnaire(null);
    setShowCreateForm(false);
    // Recharger la liste
    window.location.reload();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Questionnaires d'Évaluation</h1>
      </div>

      <div className="page-content">
        {!selectedQuestionnaire && !showCreateForm ? (
          <QuestionnaireList
            onSelectQuestionnaire={handleSelectQuestionnaire}
            onCreateNew={handleCreateNew}
          />
        ) : (
          <QuestionnaireDetails
            questionnaireId={selectedQuestionnaire?.id}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default Questionnaires;
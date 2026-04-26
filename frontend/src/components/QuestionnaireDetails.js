import React from 'react';

const QuestionnaireDetails = ({ questionnaire }) => {
  if (!questionnaire) return <div>Aucun questionnaire sélectionné</div>;
  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
      <h3>{questionnaire.title || 'Questionnaire'}</h3>
      <p><strong>Patient :</strong> {questionnaire.patient_name || 'N/A'}</p>
      <p><strong>Statut :</strong> {questionnaire.status || 'N/A'}</p>
    </div>
  );
};

export default QuestionnaireDetails;
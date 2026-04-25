import React, { useState, useEffect } from 'react';
import { questionnaireService } from '../services/questionnaireService';

const QuestionnaireList = ({ onSelect }) => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await questionnaireService.getAllQuestionnaires();
      setQuestionnaires(response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des questionnaires');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {questionnaires.length === 0 ? (
        <p>Aucun questionnaire disponible</p>
      ) : (
        questionnaires.map(questionnaire => (
          <div key={questionnaire.id} className="list-item">
            <div className="list-item-header">
              <h3 className="list-item-title">{questionnaire.title}</h3>
              <span className="badge badge-info">{questionnaire.category}</span>
            </div>
            <div className="list-item-content">
              <p>{questionnaire.description}</p>
              <div className="list-item-meta">
                <span>📋 {questionnaire.questions?.length || 0} questions</span>
                <span>⏱️ ~{questionnaire.estimatedTime || 5} min</span>
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => onSelect && onSelect(questionnaire)}
              >
                Répondre
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default QuestionnaireList;
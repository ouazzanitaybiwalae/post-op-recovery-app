import React, { useState, useEffect } from 'react';
import questionnaireService from '../services/questionnaireService';
import QuestionnaireForm from './QuestionnaireForm';
import { useAuth } from '../context/AuthContext';

const QuestionnaireDetails = ({ questionnaireId, onClose }) => {
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(!questionnaireId);

  useEffect(() => {
    if (questionnaireId) {
      loadQuestionnaire();
    } else {
      setLoading(false);
    }
  }, [questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const data = await questionnaireService.getQuestionnaireById(questionnaireId);
      setQuestionnaire(data);
    } catch (err) {
      setError('Erreur lors du chargement du questionnaire');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  if (editing || !questionnaireId) {
    return (
      <QuestionnaireForm
        questionnaireId={questionnaireId}
        onSuccess={onClose}
        onCancel={onClose}
      />
    );
  }

  if (!questionnaire) return <div className="error-message">{error || 'Questionnaire introuvable'}</div>;

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{questionnaire.title}</h2>
        <button onClick={onClose} className="btn btn-secondary">← Retour</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div style={{ padding: '20px' }}>
        {questionnaire.description && (
          <p style={{ marginBottom: '20px', color: '#666' }}>{questionnaire.description}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(questionnaire.questions || []).map((q, index) => (
            <div key={index} style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
              <p style={{ fontWeight: '600', marginBottom: '8px' }}>
                {index + 1}. {q.question_text}
                {q.required && <span style={{ color: 'red' }}> *</span>}
              </p>
              <p style={{ fontSize: '13px', color: '#888' }}>Type : {q.question_type}</p>
              {q.options && q.options.length > 0 && (
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>

        {(user?.role === 'physiotherapist' || user?.role === 'admin') && (
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setEditing(true)} className="btn btn-primary">Modifier</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireDetails;
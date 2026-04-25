import React, { useState, useEffect } from 'react';
import questionnaireService from '../services/questionnaireService';
import '../App.css';

const QuestionnaireResponse = ({ questionnaireId, patientId, onSuccess, onCancel }) => {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestionnaire();
  }, [questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const data = await questionnaireService.getQuestionnaireById(questionnaireId);
      setQuestionnaire(data);
      
      // Initialiser les réponses
      const initialResponses = {};
      data.questions.forEach((q, index) => {
        if (q.question_type === 'checkbox') {
          initialResponses[index] = [];
        } else {
          initialResponses[index] = '';
        }
      });
      setResponses(initialResponses);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du questionnaire');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionIndex, value) => {
    setResponses(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleCheckboxChange = (questionIndex, option, checked) => {
    setResponses(prev => {
      const currentResponses = prev[questionIndex] || [];
      if (checked) {
        return {
          ...prev,
          [questionIndex]: [...currentResponses, option]
        };
      } else {
        return {
          ...prev,
          [questionIndex]: currentResponses.filter(item => item !== option)
        };
      }
    });
  };

  const validateResponses = () => {
    for (let i = 0; i < questionnaire.questions.length; i++) {
      const question = questionnaire.questions[i];
      const response = responses[i];

      if (question.required) {
        if (question.question_type === 'checkbox') {
          if (!response || response.length === 0) {
            setError(`La question "${question.question_text}" est obligatoire`);
            return false;
          }
        } else {
          if (!response || response.toString().trim() === '') {
            setError(`La question "${question.question_text}" est obligatoire`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateResponses()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formattedResponses = questionnaire.questions.map((question, index) => ({
        question_id: question.id,
        question_text: question.question_text,
        response: Array.isArray(responses[index]) 
          ? responses[index].join(', ') 
          : responses[index].toString()
      }));

      await questionnaireService.submitResponse({
        questionnaire_id: questionnaireId,
        patient_id: patientId,
        responses: formattedResponses
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission des réponses');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement du questionnaire...</div>;
  }

  if (!questionnaire) {
    return <div className="error-message">Questionnaire introuvable</div>;
  }

  return (
    <div className="questionnaire-response-container">
      <h2>{questionnaire.title}</h2>
      {questionnaire.description && (
        <p className="questionnaire-description">{questionnaire.description}</p>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="questionnaire-response-form">
        {questionnaire.questions.map((question, index) => (
          <div key={index} className="question-response-item">
            <label className="question-label">
              {index + 1}. {question.question_text}
              {question.required && <span className="required">*</span>}
            </label>

            {question.question_type === 'text' && (
              <input
                type="text"
                value={responses[index] || ''}
                onChange={(e) => handleResponseChange(index, e.target.value)}
                required={question.required}
                placeholder="Votre réponse"
              />
            )}

            {question.question_type === 'number' && (
              <input
                type="number"
                value={responses[index] || ''}
                onChange={(e) => handleResponseChange(index, e.target.value)}
                required={question.required}
                placeholder="Entrez un nombre"
              />
            )}

            {question.question_type === 'date' && (
              <input
                type="date"
                value={responses[index] || ''}
                onChange={(e) => handleResponseChange(index, e.target.value)}
                required={question.required}
              />
            )}

            {question.question_type === 'radio' && (
              <div className="radio-options">
                {question.options?.map((option, optIndex) => (
                  <label key={optIndex} className="radio-option">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={responses[index] === option}
                      onChange={(e) => handleResponseChange(index, e.target.value)}
                      required={question.required}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'checkbox' && (
              <div className="checkbox-options">
                {question.options?.map((option, optIndex) => (
                  <label key={optIndex} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={(responses[index] || []).includes(option)}
                      onChange={(e) => handleCheckboxChange(index, option, e.target.checked)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'scale' && (
              <div className="scale-input">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={responses[index] || 5}
                  onChange={(e) => handleResponseChange(index, e.target.value)}
                  required={question.required}
                />
                <span className="scale-value">{responses[index] || 5}</span>
              </div>
            )}
          </div>
        ))}

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-cancel" disabled={submitting}>
              Annuler
            </button>
          )}
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Envoi en cours...' : 'Soumettre'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionnaireResponse;
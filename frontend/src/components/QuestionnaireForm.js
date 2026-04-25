import React, { useState, useEffect } from 'react';
import questionnaireService from '../services/questionnaireService';
import '../App.css';
 
const QuestionnaireForm = ({ questionnaireId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
 
  useEffect(() => {
    if (questionnaireId) {
      loadQuestionnaire();
    }
  }, [questionnaireId]);
 
  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const data = await questionnaireService.getQuestionnaireById(questionnaireId);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        questions: data.questions || []
      });
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du questionnaire');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
 
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
 
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
 
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: '',
          question_type: 'text',
          options: [],
          required: true
        }
      ]
    }));
  };
 
  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };
 
  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options.push('');
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
 
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }
 
    if (formData.questions.length === 0) {
      setError('Veuillez ajouter au moins une question');
      return;
    }
 
    try {
      setLoading(true);
      setError('');
 
      if (questionnaireId) {
        await questionnaireService.updateQuestionnaire(questionnaireId, formData);
      } else {
        await questionnaireService.createQuestionnaire(formData);
      }
 
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde du questionnaire');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
 
  if (loading && questionnaireId) {
    return <div className="loading">Chargement...</div>;
  }
 
  return (
    <div className="questionnaire-form-container">
      <h2>{questionnaireId ? 'Modifier le questionnaire' : 'Créer un questionnaire'}</h2>
      
      {error && <div className="error-message">{error}</div>}
 
      <form onSubmit={handleSubmit} className="questionnaire-form">
        <div className="form-group">
          <label htmlFor="title">Titre *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Titre du questionnaire"
          />
        </div>
 
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Description du questionnaire"
          />
        </div>
 
        <div className="questions-section">
          <div className="section-header">
            <h3>Questions</h3>
            <button type="button" onClick={addQuestion} className="btn-add">
              + Ajouter une question
            </button>
          </div>
 
          {formData.questions.map((question, qIndex) => (
            <div key={qIndex} className="question-item">
              <div className="question-header">
                <h4>Question {qIndex + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="btn-remove"
                >
                  × Supprimer
                </button>
              </div>
 
              <div className="form-group">
                <label>Texte de la question *</label>
                <input
                  type="text"
                  value={question.question_text}
                  onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                  required
                  placeholder="Entrez votre question"
                />
              </div>
 
              <div className="form-group">
                <label>Type de question *</label>
                <select
                  value={question.question_type}
                  onChange={(e) => handleQuestionChange(qIndex, 'question_type', e.target.value)}
                  required
                >
                  <option value="text">Texte</option>
                  <option value="number">Nombre</option>
                  <option value="radio">Choix unique</option>
                  <option value="checkbox">Choix multiple</option>
                  <option value="scale">Échelle</option>
                  <option value="date">Date</option>
                </select>
              </div>
 
              {(question.question_type === 'radio' || question.question_type === 'checkbox') && (
                <div className="options-section">
                  <label>Options</label>
                  {question.options?.map((option, oIndex) => (
                    <div key={oIndex} className="option-item">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="btn-remove-small"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="btn-add-small"
                  >
                    + Ajouter une option
                  </button>
                </div>
              )}
 
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => handleQuestionChange(qIndex, 'required', e.target.checked)}
                  />
                  Question obligatoire
                </label>
              </div>
            </div>
          ))}
 
          {formData.questions.length === 0 && (
            <div className="no-questions">
              Aucune question ajoutée. Cliquez sur "Ajouter une question" pour commencer.
            </div>
          )}
        </div>
 
        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-cancel" disabled={loading}>
            Annuler
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Enregistrement...' : questionnaireId ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};
 
export default QuestionnaireForm;
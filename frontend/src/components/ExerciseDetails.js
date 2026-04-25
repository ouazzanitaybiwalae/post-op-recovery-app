import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import exerciseService from '../services/exerciseService';
import '../App.css';

const ExerciseDetails = ({ exerciseId, onEdit, onClose }) => {
  const { user } = useContext(AuthContext);
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: '',
    duration: '',
    repetitions: '',
    sets: '',
    instructions: '',
    precautions: '',
    image_url: '',
    video_url: ''
  });

  useEffect(() => {
    if (exerciseId) {
      loadExercise();
    } else {
      setIsEditing(true);
      setLoading(false);
    }
  }, [exerciseId]);

    const loadExercise = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getExerciseById(exerciseId);
      setExercise(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        difficulty: data.difficulty || '',
        duration: data.duration || '',
        repetitions: data.repetitions || '',
        sets: data.sets || '',
        instructions: data.instructions || '',
        precautions: data.precautions || '',
        image_url: data.image_url || '',
        video_url: data.video_url || ''
      });
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement de l\'exercice');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Le nom de l\'exercice est requis');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (exerciseId) {
        const updated = await exerciseService.updateExercise(exerciseId, formData);
        setExercise(updated);
        setIsEditing(false);
      } else {
        await exerciseService.createExercise(formData);
        if (onClose) {
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde de l\'exercice');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (exerciseId) {
      setIsEditing(false);
      setFormData({
        name: exercise.name || '',
        description: exercise.description || '',
        category: exercise.category || '',
        difficulty: exercise.difficulty || '',
        duration: exercise.duration || '',
        repetitions: exercise.repetitions || '',
        sets: exercise.sets || '',
        instructions: exercise.instructions || '',
        precautions: exercise.precautions || '',
        image_url: exercise.image_url || '',
        video_url: exercise.video_url || ''
      });
    } else if (onClose) {
      onClose();
    }
  };

  if (loading && exerciseId) {
    return <div className="loading">Chargement...</div>;
  }

  if (error && !isEditing) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="exercise-details-container">
      <div className="details-header">
        <h2>{exerciseId ? (isEditing ? 'Modifier l\'exercice' : 'Détails de l\'exercice') : 'Nouvel exercice'}</h2>
        <div className="header-actions">
          {!isEditing && user?.role === 'physiotherapist' && exerciseId && (
            <button onClick={() => setIsEditing(true)} className="btn-edit">
              Modifier
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="btn-close">
              ✕
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="exercise-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nom de l'exercice *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nom de l'exercice"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Catégorie</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Mobilité">Mobilité</option>
                <option value="Renforcement">Renforcement</option>
                <option value="Étirement">Étirement</option>
                <option value="Équilibre">Équilibre</option>
                <option value="Cardio">Cardio</option>
                <option value="Posture">Posture</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty">Difficulté</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="">Sélectionner la difficulté</option>
                <option value="Facile">Facile</option>
                <option value="Moyen">Moyen</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Durée (minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="0"
                placeholder="Durée en minutes"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="repetitions">Répétitions</label>
              <input
                type="number"
                id="repetitions"
                name="repetitions"
                value={formData.repetitions}
                onChange={handleChange}
                min="0"
                placeholder="Nombre de répétitions"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sets">Séries</label>
              <input
                type="number"
                id="sets"
                name="sets"
                value={formData.sets}
                onChange={handleChange}
                min="0"
                placeholder="Nombre de séries"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Description de l'exercice"
            />
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="5"
              placeholder="Instructions détaillées pour réaliser l'exercice"
            />
          </div>

          <div className="form-group">
            <label htmlFor="precautions">Précautions</label>
            <textarea
              id="precautions"
              name="precautions"
              value={formData.precautions}
              onChange={handleChange}
              rows="3"
              placeholder="Précautions à prendre"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image_url">URL de l'image</label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="video_url">URL de la vidéo</label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-cancel" disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enregistrement...' : exerciseId ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      ) : (
        <div className="exercise-view">
          {exercise?.image_url && (
            <div className="exercise-image-large">
              <img src={exercise.image_url} alt={exercise.name} />
            </div>
          )}

          <div className="exercise-info">
            <div className="info-section">
              <h3>Informations générales</h3>
              <div className="info-grid">
                {exercise?.category && (
                  <div className="info-item">
                    <strong>Catégorie:</strong>
                    <span className="badge badge-category">{exercise.category}</span>
                  </div>
                )}
                {exercise?.difficulty && (
                  <div className="info-item">
                    <strong>Difficulté:</strong>
                    <span className={`badge badge-difficulty badge-${exercise.difficulty.toLowerCase()}`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                )}
                {exercise?.duration && (
                  <div className="info-item">
                    <strong>Durée:</strong>
                    <span>{exercise.duration} minutes</span>
                  </div>
                )}
                {exercise?.repetitions && (
                  <div className="info-item">
                    <strong>Répétitions:</strong>
                    <span>{exercise.repetitions}</span>
                  </div>
                )}
                {exercise?.sets && (
                  <div className="info-item">
                    <strong>Séries:</strong>
                    <span>{exercise.sets}</span>
                  </div>
                )}
              </div>
            </div>

            {exercise?.description && (
              <div className="info-section">
                <h3>Description</h3>
                <p>{exercise.description}</p>
              </div>
            )}

            {exercise?.instructions && (
              <div className="info-section">
                <h3>Instructions</h3>
                <div className="instructions-text">
                  {exercise.instructions.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {exercise?.precautions && (
              <div className="info-section alert-section">
                <h3>⚠️ Précautions</h3>
                <p>{exercise.precautions}</p>
              </div>
            )}

            {exercise?.video_url && (
              <div className="info-section">
                <h3>Vidéo de démonstration</h3>
                <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="video-link">
                  Voir la vidéo
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetails;
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import exerciseService from '../services/exerciseService';
import '../App.css';

const ExerciseList = ({ onSelectExercise, onCreateNew }) => {
  const { user } = useContext(AuthContext);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getAllExercises();
      setExercises(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des exercices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
      return;
    }

    try {
      await exerciseService.deleteExercise(id);
      setExercises(exercises.filter(ex => ex.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression de l\'exercice');
      console.error(err);
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || exercise.category === filterCategory;
    const matchesDifficulty = !filterDifficulty || exercise.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(exercises.map(ex => ex.category).filter(Boolean))];
  const difficulties = ['Facile', 'Moyen', 'Difficile'];

  if (loading) {
    return <div className="loading">Chargement des exercices...</div>;
  }

  return (
    <div className="exercise-list-container">
      <div className="list-header">
        <h2>Liste des Exercices</h2>
        {user?.role === 'physiotherapist' && onCreateNew && (
          <button onClick={onCreateNew} className="btn-primary">
            + Nouvel exercice
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Rechercher un exercice..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="filter-select"
        >
          <option value="">Toutes les difficultés</option>
          {difficulties.map(diff => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="no-data">
          {searchTerm || filterCategory || filterDifficulty
            ? 'Aucun exercice ne correspond aux critères de recherche'
            : 'Aucun exercice disponible'}
        </div>
      ) : (
        <div className="exercises-grid">
          {filteredExercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              {exercise.image_url && (
                <div className="exercise-image">
                  <img src={exercise.image_url} alt={exercise.name} />
                </div>
              )}
              
              <div className="exercise-content">
                <h3>{exercise.name}</h3>
                
                <div className="exercise-meta">
                  {exercise.category && (
                    <span className="badge badge-category">{exercise.category}</span>
                  )}
                  {exercise.difficulty && (
                    <span className={`badge badge-difficulty badge-${exercise.difficulty.toLowerCase()}`}>
                      {exercise.difficulty}
                    </span>
                  )}
                </div>

                {exercise.description && (
                  <p className="exercise-description">
                    {exercise.description.length > 100
                      ? `${exercise.description.substring(0, 100)}...`
                      : exercise.description}
                  </p>
                )}

                <div className="exercise-details">
                  {exercise.duration && (
                    <span>⏱️ {exercise.duration} min</span>
                  )}
                  {exercise.repetitions && (
                    <span>🔄 {exercise.repetitions} rép.</span>
                  )}
                  {exercise.sets && (
                    <span>📊 {exercise.sets} séries</span>
                  )}
                </div>

                <div className="exercise-actions">
                  <button
                    onClick={() => onSelectExercise(exercise)}
                    className="btn-view"
                  >
                    Voir détails
                  </button>
                  
                  {user?.role === 'physiotherapist' && (
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="btn-delete"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseList;
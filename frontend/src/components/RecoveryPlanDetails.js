import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import recoveryPlanService from '../services/recoveryPlanService';
import exerciseService from '../services/exerciseService';
import '../App.css';

const RecoveryPlanDetails = ({ planId, onClose }) => {
  const { user } = useContext(AuthContext);
  const [plan, setPlan] = useState(null);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    patient_id: '',
    start_date: '',
    end_date: '',
    status: 'pending',
    exercises: []
  });

  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exerciseConfig, setExerciseConfig] = useState({
    sets: '',
    repetitions: '',
    duration: '',
    frequency: '',
    notes: ''
  });

  useEffect(() => {
    if (planId) loadPlan();
    else {
      setIsEditing(true);
      setLoading(false);
    }
    loadAvailableExercises();
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const data = await recoveryPlanService.getPlanById(planId);
      setPlan(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        patient_id: data.patient_id || '',
        start_date: data.start_date?.split('T')[0] || '',
        end_date: data.end_date?.split('T')[0] || '',
        status: data.status || 'pending',
        exercises: data.exercises || []
      });
    } catch {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableExercises = async () => {
    try {
      const data = await exerciseService.getAllExercises();
      setAvailableExercises(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExercise = () => {
    if (!selectedExerciseId) return;

    const exercise = availableExercises.find(
      (ex) => ex.id === parseInt(selectedExerciseId)
    );

    const newExercise = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      ...exerciseConfig,
      completed: false
    };

    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));

    setSelectedExerciseId('');
    setExerciseConfig({
      sets: '',
      repetitions: '',
      duration: '',
      frequency: '',
      notes: ''
    });
  };

  const handleRemoveExercise = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="recovery-plan-details-container">

      <h2>{planId ? 'Détails du plan' : 'Nouveau plan'}</h2>

      {error && <div className="error-message">{error}</div>}

      {isEditing ? (
        <form className="recovery-plan-form">

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Titre"
          />

          <div className="exercises-section">
            <h3>Exercices</h3>

            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
            >
              <option value="">Choisir</option>
              {availableExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>

            <button type="button" onClick={handleAddExercise}>
              Ajouter
            </button>

            <div className="exercises-list">
              {formData.exercises.map((ex, i) => (
                <div key={i} className="exercise-item">

                  <div>
                    <h4>{ex.exercise_name}</h4>
                  </div>

                  <button onClick={() => handleRemoveExercise(i)}>
                    Supprimer
                  </button>

                </div>
              ))}
            </div>
          </div>

          <button type="submit">Sauvegarder</button>

        </form>
      ) : (
        <div>

          <h3>{plan?.title}</h3>

          <div className="exercises-list">
            {plan?.exercises?.map((ex, i) => (
              <div key={i} className="exercise-item">
                {ex.exercise_name}
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};

export default RecoveryPlanDetails;
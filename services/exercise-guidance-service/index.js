const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3003;
const ALERT_SERVICE_URL = process.env.ALERT_SERVICE_URL || 'http://localhost:3004';

app.use(cors());
app.use(bodyParser.json());

/* =========================
   LIBRAIRIE DES EXERCICES
========================= */
const exerciseLibrary = [
  {
    id: 'knee-flexion',
    name: 'Flexion du genou',
    category: 'knee',
    difficulty: 'beginner',
    duration: 10,
    repetitions: 10,
    sets: 3,
    description: 'Assis sur une chaise, pliez lentement le genou.',
    instructions: [
      'Asseyez-vous sur une chaise',
      'Gardez le dos droit',
      'Pliez lentement le genou',
      'Maintenez 5 secondes',
      'Revenez a la position initiale'
    ],
    precautions: [
      'Ne forcez pas',
      'Respirez normalement'
    ],
    videoUrl: 'https://example.com/videos/knee-flexion.mp4'
  },
  {
    id: 'ankle-rotation',
    name: 'Rotation de la cheville',
    category: 'ankle',
    difficulty: 'beginner',
    duration: 5,
    repetitions: 15,
    sets: 2,
    description: 'Rotation de la cheville.',
    instructions: [
      'Levez la jambe',
      'Faites des rotations',
      'Changez de sens'
    ],
    precautions: ['Mouvements lents'],
    videoUrl: 'https://example.com/videos/ankle-rotation.mp4'
  }
];

/* =========================
   STOCKAGE
========================= */
const exercisePlans = [];
const exerciseSessions = [];

/* =========================
   HEALTH
========================= */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Exercise Service', port: PORT });
});

/* =========================
   LIBRARY
========================= */
app.get('/api/exercise/library', (req, res) => {
  res.json({
    success: true,
    count: exerciseLibrary.length,
    exercises: exerciseLibrary
  });
});

/* =========================
   CREATE PLAN
========================= */
app.post('/api/exercise/plan/create', (req, res) => {
  const { patientId, exerciseIds } = req.body;

  if (!patientId || !exerciseIds) {
    return res.status(400).json({
      success: false,
      message: 'patientId et exerciseIds requis'
    });
  }

  const exercises = exerciseIds
    .map(id => exerciseLibrary.find(e => e.id === id))
    .filter(Boolean);

  const plan = {
    id: uuidv4(),
    patientId,
    exercises,
    status: 'active',
    createdAt: new Date().toISOString(),
    completedSessions: 0
  };

  exercisePlans.push(plan);

  res.status(201).json({
    success: true,
    plan
  });
});

/* =========================
   START SESSION
========================= */
app.post('/api/exercise/session/start', (req, res) => {
  const { planId, patientId } = req.body;

  const plan = exercisePlans.find(p => p.id === planId);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Plan non trouve'
    });
  }

  const session = {
    id: uuidv4(),
    planId,
    patientId,
    exercises: plan.exercises.map(e => ({
      exerciseId: e.id,
      completed: false,
      painLevel: null
    })),
    status: 'in-progress',
    startTime: new Date().toISOString()
  };

  exerciseSessions.push(session);

  res.status(201).json({
    success: true,
    session
  });
});

/* =========================
   COMPLETE SESSION
========================= */
app.put('/api/exercise/session/:id/complete', (req, res) => {
  const session = exerciseSessions.find(s => s.id === req.params.id);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session non trouvee'
    });
  }

  session.status = 'completed';
  session.endTime = new Date().toISOString();

  const anomalies = [];

  session.exercises.forEach(e => {
    if (e.painLevel && e.painLevel > 8) {
      anomalies.push({
        exerciseId: e.exerciseId,
        severity: 'CRITICAL'
      });
    }
  });

  if (anomalies.length > 0) {
    axios.post(`${ALERT_SERVICE_URL}/api/alert/create`, {
      patientId: session.patientId,
      anomalies
    }).catch(err => console.log(err.message));
  }

  res.json({
    success: true,
    session,
    anomaliesDetected: anomalies.length
  });
});

/* =========================
   GET SESSIONS
========================= */
app.get('/api/exercise/session/patient/:patientId', (req, res) => {
  const sessions = exerciseSessions.filter(s => s.patientId === req.params.patientId);

  res.json({
    success: true,
    sessions
  });
});

/* =========================
   STATS (CORRIGÉ)
========================= */
app.get('/api/exercise/stats/:patientId', (req, res) => {
  const patientId = req.params.patientId;

  const sessions = exerciseSessions.filter(s => s.patientId === patientId);
  const completed = sessions.filter(s => s.status === 'completed');

  const totalExercises = completed.reduce((sum, s) => sum + s.exercises.length, 0);
  const doneExercises = completed.reduce(
    (sum, s) => sum + s.exercises.filter(e => e.completed).length,
    0
  );

  const completionRate = totalExercises > 0
    ? Math.round((doneExercises / totalExercises) * 100)
    : 0;

  res.json({
    success: true,
    stats: {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      totalExercises,
      doneExercises,
      completionRate
    }
  });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Exercise Service running on port ${PORT}`);
});
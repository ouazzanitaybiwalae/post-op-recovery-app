const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
 
const app = express();
const PORT = process.env.PORT || 3001;
 
// Middleware
app.use(cors());
app.use(bodyParser.json());
 
// ==========================================
// DONNÉES EN MÉMOIRE
// ==========================================
 
// Templates de parcours
const templates = [
  {
    id: 'hip-replacement',
    name: 'Prothèse Totale de Hanche',
    type: 'orthopedic',
    baseDuration: 90, // jours
    phases: [
      {
        phase: 1,
        name: 'Hospitalisation',
        weeks: '0-1',
        objectives: ['Gestion douleur', 'Mobilisation précoce'],
        exercises: ['Pompes cheville', 'Contractions quadriceps'],
        restrictions: ['Pas de flexion > 90°']
      },
      {
        phase: 2,
        name: 'Rééducation précoce',
        weeks: '2-6',
        objectives: ['Marche autonome', 'Renforcement musculaire'],
        exercises: ['Marche assistée', 'Abduction hanche'],
        restrictions: ['Cannes obligatoires']
      },
      {
        phase: 3,
        name: 'Renforcement',
        weeks: '7-12',
        objectives: ['Retour activités normales'],
        exercises: ['Musculation progressive', 'Équilibre'],
        restrictions: ['Éviter sports à impact']
      }
    ]
  },
  {
    id: 'knee-replacement',
    name: 'Prothèse Totale de Genou',
    type: 'orthopedic',
    baseDuration: 120,
    phases: [
      {
        phase: 1,
        name: 'Post-opératoire immédiat',
        weeks: '0-2',
        objectives: ['Contrôle douleur', 'Récupération amplitude'],
        exercises: ['Flexion/extension genou', 'Mobilisation rotule'],
        restrictions: ['Pas de charge complète']
      },
      {
        phase: 2,
        name: 'Rééducation active',
        weeks: '3-8',
        objectives: ['Marche normale', 'Force musculaire'],
        exercises: ['Squats assistés', 'Vélo stationnaire'],
        restrictions: ['Éviter torsions']
      },
      {
        phase: 3,
        name: 'Retour à l\'activité',
        weeks: '9-16',
        objectives: ['Reprise activités quotidiennes'],
        exercises: ['Renforcement complet', 'Proprioception'],
        restrictions: ['Progression graduelle']
      }
    ]
  },
  {
    id: 'cardiac-bypass',
    name: 'Pontage Coronarien',
    type: 'cardiac',
    baseDuration: 180,
    phases: [
      {
        phase: 1,
        name: 'Phase hospitalière',
        weeks: '0-1',
        objectives: ['Stabilisation', 'Mobilisation douce'],
        exercises: ['Respiration profonde', 'Marche courte'],
        restrictions: ['Repos strict initial']
      },
      {
        phase: 2,
        name: 'Réadaptation cardiaque',
        weeks: '2-12',
        objectives: ['Endurance cardiovasculaire', 'Gestion facteurs risque'],
        exercises: ['Marche progressive', 'Vélo léger'],
        restrictions: ['Surveillance fréquence cardiaque']
      },
      {
        phase: 3,
        name: 'Maintenance',
        weeks: '13-26',
        objectives: ['Maintien condition physique'],
        exercises: ['Exercice aérobie régulier', 'Musculation légère'],
        restrictions: ['Éviter efforts intenses']
      }
    ]
  }
];
 
// Parcours créés (stockage en mémoire)
const recoveryPlans = [];
 
// ==========================================
// ROUTES
// ==========================================
 
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Recovery Plan Service', port: PORT });
});
 
// GET - Liste des templates disponibles
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    count: templates.length,
    templates
  });
});
 
// GET - Détail d'un template
app.get('/api/templates/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  
  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template non trouvé'
    });
  }
  
  res.json({
    success: true,
    template
  });
});
 
// POST - Créer un parcours personnalisé
app.post('/api/recovery-plan', (req, res) => {
  const { patientId, templateId, age, comorbidities = [], physicalCondition = 'normal' } = req.body;
  
  // Validation
  if (!patientId || !templateId) {
    return res.status(400).json({
      success: false,
      message: 'patientId et templateId sont requis'
    });
  }
  
  // Récupérer le template
  const template = templates.find(t => t.id === templateId);
  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template non trouvé'
    });
  }
  
  // Personnalisation du parcours
  let duration = template.baseDuration;
  let adjustments = [];
  
  // Ajustement selon l'âge
  if (age > 70) {
    duration = Math.round(duration * 1.3); // +30%
    adjustments.push('Durée augmentée de 30% (âge > 70 ans)');
  } else if (age < 40) {
    duration = Math.round(duration * 0.9); // -10%
    adjustments.push('Durée réduite de 10% (âge < 40 ans)');
  }
  
  // Ajustement selon comorbidités
  if (comorbidities.includes('diabetes')) {
    adjustments.push('Surveillance glycémie renforcée');
  }
  if (comorbidities.includes('obesity')) {
    duration = Math.round(duration * 1.2); // +20%
    adjustments.push('Progression plus graduelle (obésité)');
  }
  if (comorbidities.includes('heart-disease')) {
    adjustments.push('Surveillance cardiaque accrue');
  }
  
  // Ajustement selon condition physique
  if (physicalCondition === 'sedentary') {
    duration = Math.round(duration * 1.15); // +15%
    adjustments.push('Intensité réduite (sédentaire)');
  } else if (physicalCondition === 'athletic') {
    duration = Math.round(duration * 0.85); // -15%
    adjustments.push('Objectifs plus ambitieux (sportif)');
  }
  
  // Créer le parcours
  const recoveryPlan = {
    id: uuidv4(),
    patientId,
    templateId,
    templateName: template.name,
    type: template.type,
    duration,
    startDate: new Date().toISOString(),
    currentDay: 1,
    status: 'active',
    phases: template.phases,
    adjustments,
    patientProfile: {
      age,
      comorbidities,
      physicalCondition
    },
    createdAt: new Date().toISOString()
  };
  
  // Sauvegarder
  recoveryPlans.push(recoveryPlan);
  
  res.status(201).json({
    success: true,
    message: 'Parcours de récupération créé avec succès',
    recoveryPlan
  });
});
 
// GET - Récupérer un parcours
app.get('/api/recovery-plan/:id', (req, res) => {
  const plan = recoveryPlans.find(p => p.id === req.params.id);
  
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Parcours non trouvé'
    });
  }
  
  res.json({
    success: true,
    plan
  });
});
 
// GET - Récupérer tous les parcours d'un patient
app.get('/api/recovery-plan/patient/:patientId', (req, res) => {
  const plans = recoveryPlans.filter(p => p.patientId === req.params.patientId);
  
  res.json({
    success: true,
    count: plans.length,
    plans
  });
});
 
// PUT - Mettre à jour la progression
app.put('/api/recovery-plan/:id/progress', (req, res) => {
  const { currentDay } = req.body;
  const plan = recoveryPlans.find(p => p.id === req.params.id);
  
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Parcours non trouvé'
    });
  }
  
  plan.currentDay = currentDay;
  plan.updatedAt = new Date().toISOString();
  
  // Calculer la progression en pourcentage
  const progressPercentage = Math.round((currentDay / plan.duration) * 100);
  
  res.json({
    success: true,
    message: 'Progression mise à jour',
    
      ...plan,
      progressPercentage
    }
  );
});
 
// GET - Liste de tous les parcours
app.get('/api/recovery-plans', (req, res) => {
  res.json({
    success: true,
    count: recoveryPlans.length,
    recoveryPlans
  });
});
 
// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Recovery Plan Service démarré sur le port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📚 Templates disponibles: ${templates.length}`);
});
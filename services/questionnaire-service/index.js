const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;
const ALERT_SERVICE_URL = process.env.ALERT_SERVICE_URL || 'http://localhost:3004';

app.use(cors());
app.use(bodyParser.json());

const questionnaireTemplates = [
  {
    id: 'daily-pain',
    name: 'Evaluation Quotidienne de la Douleur',
    type: 'daily',
    questions: [
      {
        id: 'q1',
        text: 'Sur une echelle de 0 a 10, quel est votre niveau de douleur actuel ?',
        type: 'scale',
        min: 0,
        max: 10,
        required: true,
        alertThreshold: 7
      },
      {
        id: 'q2',
        text: 'Quelle est votre temperature corporelle ?',
        type: 'number',
        unit: 'C',
        required: true,
        alertThreshold: 38.5
      },
      {
        id: 'q3',
        text: 'Avez-vous remarque un saignement au niveau de la plaie ?',
        type: 'boolean',
        required: true
      },
      {
        id: 'q4',
        text: 'Avez-vous remarque un gonflement anormal ?',
        type: 'boolean',
        required: true
      },
      {
        id: 'q5',
        text: 'Avez-vous pris vos medicaments comme prescrit ?',
        type: 'boolean',
        required: true
      }
    ]
  },
  {
    id: 'weekly-mobility',
    name: 'Evaluation Hebdomadaire de la Mobilite',
    type: 'weekly',
    questions: [
      {
        id: 'q1',
        text: 'Pouvez-vous marcher sans assistance ?',
        type: 'choice',
        options: ['Oui, sans probleme', 'Avec une canne', 'Avec des bequilles', 'Non, impossible'],
        required: true
      },
      {
        id: 'q2',
        text: 'Combien de temps pouvez-vous marcher sans vous arreter ?',
        type: 'choice',
        options: ['Moins de 5 min', '5-10 min', '10-20 min', 'Plus de 20 min'],
        required: true
      },
      {
        id: 'q3',
        text: 'Pouvez-vous monter les escaliers ?',
        type: 'choice',
        options: ['Oui, normalement', 'Oui, avec difficulte', 'Non'],
        required: true
      },
      {
        id: 'q4',
        text: 'Sur une echelle de 0 a 10, comment evaluez-vous votre mobilite generale ?',
        type: 'scale',
        min: 0,
        max: 10,
        required: true
      }
    ]
  }
];

const sentQuestionnaires = [];
const responses = [];

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Questionnaire Service', port: PORT });
});

app.get('/api/questionnaire/templates', (req, res) => {
  res.json({
    success: true,
    count: questionnaireTemplates.length,
    questionnaireTemplates
  });
});

app.get('/api/questionnaire/templates/:id', (req, res) => {
  const template = questionnaireTemplates.find(t => t.id === req.params.id);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template non trouve'
    });
  }

  res.json({
    success: true,
    template
  });
});

app.post('/api/questionnaire/send', (req, res) => {
  const { patientId, templateId } = req.body;

  if (!patientId || !templateId) {
    return res.status(400).json({
      success: false,
      message: 'patientId et templateId sont requis'
    });
  }

  const template = questionnaireTemplates.find(t => t.id === templateId);

  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Template non trouve'
    });
  }

  const questionnaire = {
    id: uuidv4(),
    patientId,
    templateId,
    templateName: template.name,
    type: template.type,
    questions: template.questions,
    status: 'sent',
    sentAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  sentQuestionnaires.push(questionnaire);

  res.status(201).json({
    success: true,
    message: 'Questionnaire envoye avec succes',
    questionnaire
  });
});

app.get('/api/questionnaire/patient/:patientId', (req, res) => {
  const patientQuestionnaires = sentQuestionnaires.filter(q => q.patientId === req.params.patientId);

  res.json({
    success: true,
    count: patientQuestionnaires.length,
    patientQuestionnaires
  });
});

app.get('/api/questionnaire/patient/:patientId/pending', (req, res) => {
  const pendingQuestionnaires = sentQuestionnaires.filter(
    q => q.patientId === req.params.patientId && q.status === 'sent'
  );

  res.json({
    success: true,
    count: pendingQuestionnaires.length,
    pendingQuestionnaires
  });
});

app.post('/api/questionnaire/submit', (req, res) => {
  const { questionnaireId, patientId, answers } = req.body;

  if (!questionnaireId || !patientId || !answers) {
    return res.status(400).json({
      success: false,
      message: 'questionnaireId, patientId et answers sont requis'
    });
  }

  const questionnaire = sentQuestionnaires.find(q => q.id === questionnaireId);

  if (!questionnaire) {
    return res.status(404).json({
      success: false,
      message: 'Questionnaire non trouve'
    });
  }

  questionnaire.status = 'completed';
  questionnaire.completedAt = new Date().toISOString();

  const response = {
    id: uuidv4(),
    questionnaireId,
    patientId,
    answers,
    submittedAt: new Date().toISOString()
  };

  responses.push(response);

  const anomalies = [];

  questionnaire.questions.forEach((question, index) => {
    const answer = answers[index];

    if (!answer) return;

    if (question.type === 'scale' && question.alertThreshold) {
      if (answer.value > question.alertThreshold) {
        anomalies.push({
          questionId: question.id,
          question: question.text,
          value: answer.value,
          threshold: question.alertThreshold,
          severity: 'HIGH'
        });
      }
    }

    if (question.type === 'number' && question.alertThreshold) {
      if (answer.value > question.alertThreshold) {
        anomalies.push({
          questionId: question.id,
          question: question.text,
          value: answer.value,
          threshold: question.alertThreshold,
          severity: 'CRITICAL'
        });
      }
    }

    if (question.type === 'boolean' && answer.value === true) {
      if (
        question.text.includes('saignement') ||
        question.text.includes('douleur thoracique') ||
        question.text.includes('essoufflements')
      ) {
        anomalies.push({
          questionId: question.id,
          question: question.text,
          value: answer.value,
          severity: 'CRITICAL'
        });
      }
    }
  });

  if (anomalies.length > 0) {
    axios.post(`${ALERT_SERVICE_URL}/api/alert/create`, {
      patientId,
      source: 'questionnaire',
      sourceId: questionnaireId,
      anomalies,
      timestamp: new Date().toISOString()
    }).catch(err => console.error('Erreur alerte:', err.message));
  }

  res.status(201).json({
    success: true,
    message: 'Reponses enregistrees avec succes',
    responseData: {
      response,
      anomaliesDetected: anomalies.length,
      anomalies
    }
  });
});

app.get('/api/questionnaire/responses/patient/:patientId', (req, res) => {
  const patientResponses = responses.filter(r => r.patientId === req.params.patientId);

  res.json({
    success: true,
    count: patientResponses.length,
    patientResponses
  });
});

app.get('/api/questionnaire/stats/:patientId', (req, res) => {
  const patientId = req.params.patientId;

  const patientResponses = responses.filter(r => r.patientId === patientId);
  const patientQuestionnaires = sentQuestionnaires.filter(q => q.patientId === patientId);

  const completed = patientQuestionnaires.filter(q => q.status === 'completed').length;
  const pending = patientQuestionnaires.filter(q => q.status === 'sent').length;

  const completionRate =
    patientQuestionnaires.length > 0
      ? Math.round((completed / patientQuestionnaires.length) * 100)
      : 0;

  res.json({
    success: true,
    stats: {
      totalQuestionnaires: patientQuestionnaires.length,
      completed,
      pending,
      completionRate,
      totalResponses: patientResponses.length
    }
  });
});

app.listen(PORT, () => {
  console.log(`Questionnaire Service demarre sur le port ${PORT}`);
});
import axios from 'axios';

const CARE_COORDINATION_URL = process.env.REACT_APP_CARE_COORDINATION_URL || 'http://localhost:3001';
const QUESTIONNAIRE_URL = process.env.REACT_APP_QUESTIONNAIRE_URL || 'http://localhost:3002';
const EXERCISE_URL = process.env.REACT_APP_EXERCISE_URL || 'http://localhost:3003';
const ALERT_URL = process.env.REACT_APP_ALERT_URL || 'http://localhost:3004';
const RECOVERY_PLAN_URL = process.env.REACT_APP_RECOVERY_PLAN_URL || 'http://localhost:3005';

export const careCoordinationAPI = axios.create({
  baseURL: CARE_COORDINATION_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const questionnaireAPI = axios.create({
  baseURL: QUESTIONNAIRE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const exerciseAPI = axios.create({
  baseURL: EXERCISE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const alertAPI = axios.create({
  baseURL: ALERT_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const recoveryPlanAPI = axios.create({
  baseURL: RECOVERY_PLAN_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
const alerts = [
  {
    id: 'alert-001',
    patientId: 'patient-001',
    source: 'questionnaire',
    anomalies: [{ type: 'fievre', severity: 'CRITICAL', value: 38.9 }],
    severity: 'CRITICAL',
    status: 'pending',
    title: 'Fièvre 38.9°C',
    message: 'Suspicion infection post-op — Sophie Chami, Orthopédie hanche J+21',
    is_read: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'alert-002',
    patientId: 'patient-002',
    source: 'questionnaire',
    anomalies: [{ type: 'douleur', severity: 'CRITICAL', value: 8 }],
    severity: 'CRITICAL',
    status: 'pending',
    title: 'Douleur thoracique 8/10',
    message: 'Dépassement seuil critique — Ahmed Benjelloun, Cardiaque J+5',
    is_read: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'alert-003',
    patientId: 'patient-003',
    source: 'questionnaire',
    anomalies: [{ type: 'saignement', severity: 'MEDIUM', value: 2 }],
    severity: 'MEDIUM',
    status: 'pending',
    title: 'Saignement modéré',
    message: 'Neurochirurgie J+3 — Lucas Tazi, pansement humide',
    is_read: false,
    priority: 'medium',
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];
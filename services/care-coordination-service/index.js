const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const appointments = [];
const careTeamMembers = [];
const careNotes = [];
const medications = [];

/* =========================
   HEALTH
========================= */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Care Coordination Service', port: PORT });
});

/* =========================
   APPOINTMENTS
========================= */
app.post('/api/appointment/create', (req, res) => {
  const { patientId, doctorId, doctorName, appointmentType, scheduledDate } = req.body;

  if (!patientId || !doctorId || !doctorName || !appointmentType || !scheduledDate) {
    return res.status(400).json({
      success: false,
      message: 'Champs requis manquants'
    });
  }

  const appointment = {
    id: uuidv4(),
    patientId,
    doctorId,
    doctorName,
    appointmentType,
    scheduledDate,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  appointments.push(appointment);

  res.status(201).json({ success: true, appointment });
});

app.get('/api/appointment/patient/:patientId', (req, res) => {
  const data = appointments.filter(a => a.patientId === req.params.patientId);

  res.json({
    success: true,
    appointments: data
  });
});

app.put('/api/appointment/:id/cancel', (req, res) => {
  const appointment = appointments.find(a => a.id === req.params.id);

  if (!appointment) {
    return res.status(404).json({ success: false });
  }

  appointment.status = 'cancelled';

  res.json({ success: true, appointment });
});

/* =========================
   CARE TEAM
========================= */
app.post('/api/careteam/add', (req, res) => {
  const { patientId, memberId, memberName, role } = req.body;

  if (!patientId || !memberId || !memberName || !role) {
    return res.status(400).json({ success: false });
  }

  const member = {
    id: uuidv4(),
    patientId,
    memberId,
    memberName,
    role
  };

  careTeamMembers.push(member);

  res.status(201).json({ success: true, member });
});

app.get('/api/careteam/patient/:patientId', (req, res) => {
  const team = careTeamMembers.filter(m => m.patientId === req.params.patientId);

  res.json({ success: true, team });
});

/* =========================
   CARE NOTES
========================= */
app.post('/api/carenote/create', (req, res) => {
  const { patientId, content } = req.body;

  if (!patientId || !content) {
    return res.status(400).json({ success: false });
  }

  const note = {
    id: uuidv4(),
    patientId,
    content,
    createdAt: new Date().toISOString()
  };

  careNotes.push(note);

  res.status(201).json({ success: true, note });
});

app.get('/api/carenote/patient/:patientId', (req, res) => {
  const notes = careNotes.filter(n => n.patientId === req.params.patientId);

  res.json({ success: true, notes });
});

/* =========================
   MEDICATION
========================= */
app.post('/api/medication/add', (req, res) => {
  const { patientId, medicationName } = req.body;

  if (!patientId || !medicationName) {
    return res.status(400).json({ success: false });
  }

  const medication = {
    id: uuidv4(),
    patientId,
    medicationName,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  medications.push(medication);

  res.status(201).json({ success: true, medication });
});

app.get('/api/medication/patient/:patientId', (req, res) => {
  const meds = medications.filter(m => m.patientId === req.params.patientId);

  res.json({ success: true, medications: meds });
});

app.put('/api/medication/:id/discontinue', (req, res) => {
  const medication = medications.find(m => m.id === req.params.id);

  if (!medication) {
    return res.status(404).json({ success: false });
  }

  medication.status = 'discontinued';
  medication.endDate = new Date().toISOString();

  res.json({
    success: true,
    message: 'Medicament arrete avec succes',
    medication
  });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});
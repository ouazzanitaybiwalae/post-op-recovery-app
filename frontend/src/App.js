import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';

// ============ DONNÉES DEMO ============
const USERS = [
  { id: 1, email: 'admin@physiotrack.com', password: 'admin123', role: 'admin', first_name: 'Dr', last_name: 'Martin' },
  { id: 2, email: 'physio@physiotrack.com', password: 'physio123', role: 'physiotherapist', first_name: 'Karine', last_name: 'Benali' },
  { id: 3, email: 'patient@physiotrack.com', password: 'patient123', role: 'patient', first_name: 'Marie', last_name: 'Moreau' },
];

const PATIENTS = [
  { id: 1, nom: 'Marie Moreau', intervention: 'Orthopédie genou', joursPostOp: 12, progression: 72, statut: 'stable' },
  { id: 2, nom: 'Ahmed Benjelloun', intervention: 'Cardiaque pontage', joursPostOp: 5, progression: 45, statut: 'critique' },
  { id: 3, nom: 'Sophie Chami', intervention: 'Orthopédie hanche', joursPostOp: 21, progression: 61, statut: 'alerte' },
  { id: 4, nom: 'Lucas Tazi', intervention: 'Neurochirurgie', joursPostOp: 3, progression: 28, statut: 'surveillance' },
  { id: 5, nom: 'Fatima Ouali', intervention: 'Orthopédie épaule', joursPostOp: 8, progression: 88, statut: 'stable' },
];

const ALERTES = [
  { id: 1, patient: 'Sophie Chami', type: 'Fièvre', niveau: 'critique', description: 'Température 38.9°C — suspicion infection post-op', heure: '10:23' },
  { id: 2, patient: 'Ahmed Benjelloun', type: 'Douleur thoracique', niveau: 'critique', description: 'Douleur 8/10 — FC 105 bpm', heure: '09:15' },
  { id: 3, patient: 'Lucas Tazi', type: 'Saignement', niveau: 'modere', description: 'Saignement modéré — pansement humide', heure: '08:40' },
];

const PARCOURS = [
  { id: 1, type: 'Orthopédie — Genou', duree: '6 semaines', patients: 8, progression: 72, phases: ['Mobilisation douce', 'Renforcement', 'Autonomie'] },
  { id: 2, type: 'Cardiaque — Pontage', duree: '12 semaines', patients: 5, progression: 45, phases: ['Repos surveillé', 'Réadaptation', 'Retour vie normale'] },
  { id: 3, type: 'Orthopédie — Hanche', duree: '8 semaines', patients: 6, progression: 61, phases: ['Mobilisation', 'Renforcement', 'Marche autonome'] },
  { id: 4, type: 'Neurochirurgie', duree: '10 semaines', patients: 3, progression: 28, phases: ['Repos strict', 'Rééducation', 'Autonomie progressive'] },
  { id: 5, type: 'Orthopédie — Épaule', duree: '6 semaines', patients: 2, progression: 88, phases: ['Immobilisation', 'Mobilisation', 'Renforcement'] },
];

const QUESTIONNAIRES = [
  { id: 1, patient: 'Marie Moreau', type: 'Évaluation quotidienne', statut: 'complété', douleur: 3, date: '26/04/2026' },
  { id: 2, patient: 'Ahmed Benjelloun', type: 'Contrôle cardiaque', statut: 'alerte', douleur: 8, date: '26/04/2026' },
  { id: 3, patient: 'Sophie Chami', type: 'Suivi inflammation', statut: 'alerte', douleur: 7, date: '26/04/2026' },
  { id: 4, patient: 'Lucas Tazi', type: 'Évaluation neurologique', statut: 'en_attente', douleur: null, date: '26/04/2026' },
  { id: 5, patient: 'Fatima Ouali', type: 'Suivi rééducation', statut: 'complété', douleur: 2, date: '26/04/2026' },
];

const EXERCICES = [
  { id: 1, nom: 'Flexion passive genou', categorie: 'Orthopédie', repetitions: '10 rép × 3 séries', duree: '2 min', taux: 87 },
  { id: 2, nom: 'Marche respiratoire', categorie: 'Cardiaque', repetitions: '15 min', duree: '15 min', taux: 54 },
  { id: 3, nom: 'Renforcement quadriceps', categorie: 'Orthopédie', repetitions: '15 rép × 3 séries', duree: '3 min', taux: 92 },
  { id: 4, nom: 'Exercices de sensibilité', categorie: 'Neurochirurgie', repetitions: '5 exercices', duree: '4 min', taux: 38 },
  { id: 5, nom: 'Rotation épaule', categorie: 'Orthopédie', repetitions: '12 rép × 3 séries', duree: '2 min', taux: 88 },
];

const EQUIPE = [
  { id: 1, nom: 'Dr. Martin', role: 'Chirurgien orthopédique', type: 'chirurgien', patients: 8 },
  { id: 2, nom: 'Karine Benali', role: 'Kinésithérapeute', type: 'kine', patients: 12 },
  { id: 3, nom: 'Nadia Lahlou', role: 'Infirmière de suivi', type: 'infirmiere', patients: 15 },
  { id: 4, nom: 'Pierre Rousseau', role: 'Coordinateur de parcours', type: 'coordinateur', patients: 24 },
  { id: 5, nom: 'Dr. Cohen', role: 'Cardiologue', type: 'chirurgien', patients: 5 },
];

// ============ STYLES ============
const S = {
  nav: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  navLink: (active) => ({ color: 'white', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: active ? '600' : '400', background: active ? 'rgba(255,255,255,0.25)' : 'transparent', display: 'flex', alignItems: 'center', gap: '6px' }),
  page: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  h1: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  sub: { fontSize: '13px', color: '#888', marginBottom: '24px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  metric: (color) => ({ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }),
  badge: (color, bg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', color, background: bg }),
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  avatar: (bg) => ({ width: '36px', height: '36px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }),
  progress: { height: '8px', background: '#f0f0f0', borderRadius: '99px', overflow: 'hidden', marginTop: '6px' },
  btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
};

const COLORS = ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#9f7aea'];
const avatarColor = (i) => COLORS[i % COLORS.length];

// ============ COMPOSANTS ============
function Badge({ statut }) {
  const map = {
    stable: ['#276749', '#c6f6d5'],
    critique: ['#c53030', '#fed7d7'],
    alerte: ['#c05621', '#feebc8'],
    surveillance: ['#2b6cb0', '#bee3f8'],
    complété: ['#276749', '#c6f6d5'],
    alerte_q: ['#c53030', '#fed7d7'],
    en_attente: ['#c05621', '#feebc8'],
    modere: ['#c05621', '#feebc8'],
  };
  const key = statut === 'alerte' && !map[statut] ? 'alerte_q' : statut;
  const [c, bg] = map[key] || ['#555', '#eee'];
  return <span style={S.badge(c, bg)}>{statut}</span>;
}

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/parcours', label: 'Parcours', icon: '📋' },
    { path: '/questionnaires', label: 'Questionnaires', icon: '📝' },
    { path: '/exercices', label: 'Exercices', icon: '💪' },
    { path: '/alertes', label: 'Alertes', icon: '🚨' },
    { path: '/coordination', label: 'Coordination', icon: '👥' },
  ];
  return (
    <nav style={S.nav}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>🏥</span>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>PostOp Care</span>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {links.map(({ path, label, icon }) => (
          <Link key={path} to={path} style={S.navLink(location.pathname === path)}>
            {icon} {label}
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'white', fontSize: '13px' }}>👤 {user?.first_name} {user?.last_name}</span>
        <button onClick={onLogout} style={{ ...S.btn, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.5)' }}>
          Déconnexion
        </button>
      </div>
    </nav>
  );
}

// ============ PAGES ============
function PageDashboard() {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>Tableau de bord</h1>
      <p style={S.sub}>Vue d'ensemble — 26 avril 2026</p>

      <div style={S.grid4}>
        {[
          { label: 'Patients actifs', value: 24, color: '#667eea', icon: '👤' },
          { label: 'Alertes actives', value: 3, color: '#e53e3e', icon: '🚨' },
          { label: 'Questionnaires aujourd\'hui', value: 18, color: '#ed8936', icon: '📝' },
          { label: 'Taux de conformité', value: '87%', color: '#48bb78', icon: '✅' },
        ].map((m, i) => (
          <div key={i} style={S.metric(m.color)}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{m.icon}</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a2e' }}>{m.value}</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>👥 Patients récents</h3>
          {PATIENTS.map((p, i) => (
            <div key={p.id} style={S.row}>
              <div style={S.avatar(avatarColor(i))}>{p.nom.split(' ').map(n => n[0]).join('')}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.nom}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{p.intervention} · J+{p.joursPostOp}</div>
                <div style={S.progress}>
                  <div style={{ height: '100%', width: `${p.progression}%`, background: avatarColor(i), borderRadius: '99px' }} />
                </div>
              </div>
              <Badge statut={p.statut} />
            </div>
          ))}
        </div>

        <div style={S.card}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>🚨 Alertes actives</h3>
          {ALERTES.map((a) => (
            <div key={a.id} style={S.row}>
              <div style={{ fontSize: '24px' }}>{a.niveau === 'critique' ? '🔴' : '🟡'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{a.patient} — {a.type}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{a.description}</div>
              </div>
              <span style={{ fontSize: '12px', color: '#aaa' }}>{a.heure}</span>
            </div>
          ))}

          <h3 style={{ marginTop: '20px', marginBottom: '16px', fontSize: '16px' }}>📋 Parcours actifs</h3>
          {PARCOURS.slice(0, 3).map((p, i) => (
            <div key={p.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                <span>{p.type}</span><span>{p.progression}%</span>
              </div>
              <div style={S.progress}>
                <div style={{ height: '100%', width: `${p.progression}%`, background: avatarColor(i), borderRadius: '99px' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{p.patients} patients · {p.duree}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageParcours() {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>📋 Parcours de récupération</h1>
      <p style={S.sub}>Service: recovery-plan-service · Bibliothèque de parcours post-op types</p>
      <div style={S.grid2}>
        {PARCOURS.map((p, i) => (
          <div key={p.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', color: '#1a1a2e' }}>{p.type}</h3>
              <span style={S.badge('#2b6cb0', '#bee3f8')}>{p.duree}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
              {p.patients} patients actifs
            </div>
            <div style={S.progress}>
              <div style={{ height: '100%', width: `${p.progression}%`, background: avatarColor(i), borderRadius: '99px' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>Progression moyenne : {p.progression}%</div>
            <div>
              {p.phases.map((phase, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: avatarColor(i), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>{j + 1}</div>
                  <span style={{ fontSize: '13px', color: '#555' }}>Phase {j + 1} : {phase}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageQuestionnaires() {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>📝 Questionnaires de suivi</h1>
      <p style={S.sub}>Service: questionnaire-service · Modèles validés médicalement</p>
      <div style={S.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              {['Patient', 'Type de questionnaire', 'Douleur (0-10)', 'Date', 'Statut'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {QUESTIONNAIRES.map((q, i) => (
              <tr key={q.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={S.avatar(avatarColor(i))}>{q.patient.split(' ').map(n => n[0]).join('')}</div>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{q.patient}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555' }}>{q.type}</td>
                <td style={{ padding: '12px 16px' }}>
                  {q.douleur !== null ? (
                    <span style={{ fontWeight: '700', color: q.douleur >= 7 ? '#e53e3e' : q.douleur >= 4 ? '#ed8936' : '#48bb78', fontSize: '16px' }}>{q.douleur}/10</span>
                  ) : <span style={{ color: '#aaa' }}>—</span>}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>{q.date}</td>
                <td style={{ padding: '12px 16px' }}><Badge statut={q.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PageExercices() {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>💪 Exercices guidés</h1>
      <p style={S.sub}>Service: exercise-guidance-service · Vidéos, textes, progression, validation</p>
      <div style={S.grid2}>
        {EXERCICES.map((e, i) => (
          <div key={e.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', color: '#1a1a2e' }}>{e.nom}</h3>
              <span style={S.badge('#2b6cb0', '#bee3f8')}>{e.categorie}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              🔁 {e.repetitions} &nbsp;&nbsp; ⏱️ {e.duree}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
              <span>Taux de complétion</span><span style={{ fontWeight: '700', color: e.taux >= 80 ? '#48bb78' : e.taux >= 50 ? '#ed8936' : '#e53e3e' }}>{e.taux}%</span>
            </div>
            <div style={S.progress}>
              <div style={{ height: '100%', width: `${e.taux}%`, background: e.taux >= 80 ? '#48bb78' : e.taux >= 50 ? '#ed8936' : '#e53e3e', borderRadius: '99px' }} />
            </div>
            <div style={{ marginTop: '12px', padding: '10px', background: '#f7f7fa', borderRadius: '8px', fontSize: '12px', color: '#667eea', cursor: 'pointer' }}>
              ▶️ Voir la vidéo guidée
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageAlertes() {
  const [alertes, setAlertes] = useState(ALERTES);
  const traiter = (id) => setAlertes(alertes.filter(a => a.id !== id));
  return (
    <div style={S.page}>
      <h1 style={S.h1}>🚨 Détection des complications</h1>
      <p style={S.sub}>Service: complication-alert-service · Douleur, fièvre, saignement</p>

      <div style={S.grid4}>
        {[
          { label: 'Alertes critiques', value: alertes.filter(a => a.niveau === 'critique').length, color: '#e53e3e' },
          { label: 'Alertes modérées', value: alertes.filter(a => a.niveau === 'modere').length, color: '#ed8936' },
          { label: 'Patients surveillés', value: 24, color: '#667eea' },
          { label: 'Alertes traitées aujourd\'hui', value: 3 - alertes.length + 3, color: '#48bb78' },
        ].map((m, i) => (
          <div key={i} style={S.metric(m.color)}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: m.color }}>{m.value}</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <h3 style={{ marginBottom: '16px' }}>Alertes actives</h3>
        {alertes.length === 0 && <div style={{ textAlign: 'center', color: '#48bb78', padding: '40px', fontSize: '16px' }}>✅ Aucune alerte active</div>}
        {alertes.map(a => (
          <div key={a.id} style={{ ...S.row, alignItems: 'flex-start', padding: '16px 0' }}>
            <div style={{ fontSize: '32px' }}>{a.niveau === 'critique' ? '🔴' : '🟡'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#1a1a2e' }}>{a.patient} — {a.type}</div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{a.description}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>Signalé à {a.heure}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={S.badge(a.niveau === 'critique' ? '#c53030' : '#c05621', a.niveau === 'critique' ? '#fed7d7' : '#feebc8')}>{a.niveau}</span>
              <button onClick={() => traiter(a.id)} style={{ ...S.btn, background: '#48bb78', color: 'white', fontSize: '12px' }}>✓ Traiter</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageCoordination() {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>👥 Coordination de l'équipe</h1>
      <p style={S.sub}>Service: care-coordination-service · Synchronisation entre professionnels</p>
      <div style={S.grid2}>
        <div style={S.card}>
          <h3 style={{ marginBottom: '16px' }}>Équipe soignante</h3>
          {EQUIPE.map((e, i) => (
            <div key={e.id} style={S.row}>
              <div style={S.avatar(avatarColor(i))}>{e.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{e.nom}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{e.role}</div>
              </div>
              <span style={S.badge('#2b6cb0', '#bee3f8')}>{e.patients} patients</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ marginBottom: '16px' }}>Messages récents</h3>
          {[
            { de: 'Dr. Martin', a: 'Karine Benali', msg: 'Sophie Chami: suspendre exercices, infection suspectée', heure: '10:25' },
            { de: 'Nadia Lahlou', a: 'Dr. Cohen', msg: 'Ahmed Benjelloun: douleur 8/10, consultation urgente', heure: '09:30' },
            { de: 'Karine Benali', a: 'Dr. Martin', msg: 'Marie Moreau: excellente progression, phase 3 prête', heure: '08:15' },
          ].map((m, i) => (
            <div key={i} style={{ ...S.row, alignItems: 'flex-start' }}>
              <div style={S.avatar(avatarColor(i))}>{m.de.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{m.de} → {m.a}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{m.msg}</div>
              </div>
              <span style={{ fontSize: '11px', color: '#aaa' }}>{m.heure}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
      navigate('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px' }}>🏥</div>
          <h1 style={{ color: '#667eea', margin: '8px 0 4px' }}>PostOp Care</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Application de suivi post-opératoire</p>
        </div>

        {error && <div style={{ background: '#fed7d7', color: '#c53030', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
            Se connecter
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: '#f7f7fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '8px' }}>Comptes de démonstration :</p>
          {USERS.map(u => (
            <div key={u.id} style={{ fontSize: '12px', color: '#666', marginBottom: '4px', cursor: 'pointer' }}
              onClick={() => { setEmail(u.email); setPassword(u.password); }}>
              <strong>{u.role} :</strong> {u.email} / {u.password}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ APP PRINCIPAL ============
function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  function Layout({ children }) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6fb' }}>
        <Navbar user={user} onLogout={handleLogout} />
        {children}
      </div>
    );
  }

  function PrivateRoute({ children }) {
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <PageLogin onLogin={setUser} />} />
        <Route path="/dashboard" element={<PrivateRoute><PageDashboard /></PrivateRoute>} />
        <Route path="/parcours" element={<PrivateRoute><PageParcours /></PrivateRoute>} />
        <Route path="/questionnaires" element={<PrivateRoute><PageQuestionnaires /></PrivateRoute>} />
        <Route path="/exercices" element={<PrivateRoute><PageExercices /></PrivateRoute>} />
        <Route path="/alertes" element={<PrivateRoute><PageAlertes /></PrivateRoute>} />
        <Route path="/coordination" element={<PrivateRoute><PageCoordination /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
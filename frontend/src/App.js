import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';

// ============ CONFIG API ============
const API = {
  alert:        'http://localhost:5002',
  exercise:     'http://localhost:5003',
  questionnaire:'http://localhost:5004',
  recovery:     'http://localhost:5005',
  coordination: 'http://localhost:5001',
};

// ============ USERS (localStorage) ============
const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));

const ROLES = ['patient', 'chirurgien', 'kinesitherapeute', 'infirmier', 'coordinateur'];

// ============ VIDEOS PAR CATEGORIE D'EXERCICE ============
// Vidéos YouTube pertinentes selon la catégorie médicale
const VIDEOS = {
  'knee':      'https://www.youtube.com/embed/2XaKMBjdEo0',   // Rééducation genou
  'ankle':     'https://www.youtube.com/embed/sTANio_2E0Q',   // Rééducation cheville
  'cardiac':   'https://www.youtube.com/embed/4pKly2JojMw',   // Rééducation cardiaque
  'shoulder':  'https://www.youtube.com/embed/VHSiRFkBRrA',   // Rééducation épaule
  'hip':       'https://www.youtube.com/embed/ow9F7q1q3qs',   // Rééducation hanche
  'back':      'https://www.youtube.com/embed/g8IBh5QnZSA',   // Rééducation dos
  'breathing': 'https://www.youtube.com/embed/tybOi4hjZFQ',   // Exercices respiratoires
  'balance':   'https://www.youtube.com/embed/u9KHBNwmEPs',   // Équilibre & proprioception
  'strength':  'https://www.youtube.com/embed/2W4ZNSwoW_4',   // Renforcement musculaire
  'default':   'https://www.youtube.com/embed/j7rKKpwdXNE',   // Exercices généraux
};

// Mapping catégorie exercice -> clé vidéo
const getVideoKey = (category) => {
  if (!category) return 'default';
  const cat = category.toLowerCase();
  if (cat.includes('knee') || cat.includes('genou'))     return 'knee';
  if (cat.includes('ankle') || cat.includes('cheville'))  return 'ankle';
  if (cat.includes('cardiac') || cat.includes('coeur') || cat.includes('cardio')) return 'cardiac';
  if (cat.includes('shoulder') || cat.includes('epaule')) return 'shoulder';
  if (cat.includes('hip') || cat.includes('hanche'))     return 'hip';
  if (cat.includes('back') || cat.includes('dos'))       return 'back';
  if (cat.includes('breath') || cat.includes('respir'))  return 'breathing';
  if (cat.includes('balance') || cat.includes('equilib')) return 'balance';
  if (cat.includes('strength') || cat.includes('renfor')) return 'strength';
  return 'default';
};

const COLORS = ['#667eea','#48bb78','#ed8936','#e53e3e','#9f7aea','#38b2ac'];
const C = (i) => COLORS[i % COLORS.length];

// ============ STYLES ============
const S = {
  nav: { background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  navLink: (a) => ({ color: 'white', textDecoration: 'none', padding: '8px 13px', borderRadius: '8px', fontSize: '13px', fontWeight: a ? '600' : '400', background: a ? 'rgba(255,255,255,0.25)' : 'transparent', display: 'inline-flex', alignItems: 'center', gap: '5px' }),
  page: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  h1: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  sub: { fontSize: '13px', color: '#888', marginBottom: '24px' },
  g4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' },
  g3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' },
  g2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px' },
  metric: (c) => ({ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${c}` }),
  badge: (c, bg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', color: c, background: bg }),
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  av: (bg) => ({ width: '36px', height: '36px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }),
  btn: (bg, c) => ({ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: bg, color: c || 'white' }),
  inp: { width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  lbl: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  fr: { marginBottom: '14px' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  mbox: { background: 'white', borderRadius: '16px', padding: '28px', width: '560px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  patientBanner: { background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '16px' },
};

// ============ COMPOSANTS UTILS ============
function Modal({ title, onClose, children }) {
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.mbox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', color: '#1a1a2e' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ textAlign: 'center', padding: '40px', color: '#667eea', fontSize: '16px' }}>⏳ Chargement...</div>;
}

function ErrBox({ msg }) {
  return msg ? <div style={{ padding: '10px', background: '#fed7d7', color: '#c53030', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>{msg}</div> : null;
}

function SuccessBox({ msg }) {
  return msg ? <div style={{ padding: '12px', background: '#c6f6d5', color: '#276749', borderRadius: '8px', marginBottom: '16px', fontWeight: '600' }}>{msg}</div> : null;
}

// ============ NAVBAR ============
function Navbar({ user, onLogout }) {
  const loc = useLocation();
  const isPatient = user?.role === 'patient';

  // Navigation selon le rôle
  const proLinks = [
    { path: '/dashboard',      label: 'Dashboard',      icon: '📊' },
    { path: '/parcours',       label: 'Parcours',        icon: '📋' },
    { path: '/questionnaires', label: 'Questionnaires',  icon: '📝' },
    { path: '/exercices',      label: 'Exercices',       icon: '💪' },
    { path: '/alertes',        label: 'Alertes',         icon: '🚨' },
    { path: '/coordination',   label: 'Coordination',    icon: '👥' },
  ];

  // Patient voit : son tableau de bord, ses questionnaires, ses exercices, son parcours
  const patientLinks = [
    { path: '/dashboard',      label: 'Mon suivi',       icon: '🏠' },
    { path: '/mon-parcours',   label: 'Mon parcours',    icon: '📋' },
    { path: '/mes-questionnaires', label: 'Mes questionnaires', icon: '📝' },
    { path: '/mes-exercices',  label: 'Mes exercices',   icon: '💪' },
  ];

  const links = isPatient ? patientLinks : proLinks;

  const roleIcons = { patient: '🤒', chirurgien: '👨‍⚕️', kinesitherapeute: '🏃', infirmier: '👩‍⚕️', coordinateur: '📋' };
  const roleLabels = { patient: 'Patient', chirurgien: 'Chirurgien', kinesitherapeute: 'Kinésithérapeute', infirmier: 'Infirmier(e)', coordinateur: 'Coordinateur' };

  return (
    <nav style={S.nav}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '22px' }}>🏥</span>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '17px' }}>PostOp Care</span>
      </div>
      <div style={{ display: 'flex', gap: '2px' }}>
        {links.map(({ path, label, icon }) => (
          <Link key={path} to={path} style={S.navLink(loc.pathname === path)}>{icon} {label}</Link>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{roleIcons[user?.role]} {user?.prenom} {user?.nom}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{roleLabels[user?.role]}</div>
        </div>
        <button onClick={onLogout} style={S.btn('rgba(255,255,255,0.2)')}>Déconnexion</button>
      </div>
    </nav>
  );
}

// ============ LOGIN ============
function PageLogin({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', nom: '', prenom: '', role: 'patient' });
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(u => u.email === form.email && u.password === form.password);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
      navigate('/dashboard');
    } else setErr('Email ou mot de passe incorrect');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const users = getUsers();
    if (users.find(u => u.email === form.email)) { setErr('Email déjà utilisé'); return; }
    const newUser = {
      id: Date.now().toString(),
      email: form.email,
      password: form.password,
      nom: form.nom,
      prenom: form.prenom,
      role: form.role,
      createdAt: new Date().toISOString()
    };
    saveUsers([...users, newUser]);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    onLogin(newUser);
    navigate('/dashboard');
  };

  const f = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErr(''); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px' }}>🏥</div>
          <h1 style={{ color: '#667eea', margin: '8px 0 4px', fontSize: '24px' }}>PostOp Care</h1>
          <p style={{ color: '#888', fontSize: '13px' }}>Application de suivi post-opératoire</p>
        </div>

        <div style={{ display: 'flex', marginBottom: '24px', background: '#f7f7fa', borderRadius: '10px', padding: '4px' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setErr(''); }}
              style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                background: mode === m ? 'white' : 'transparent', color: mode === m ? '#667eea' : '#888',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              {m === 'login' ? '🔑 Connexion' : '✏️ Inscription'}
            </button>
          ))}
        </div>

        <ErrBox msg={err} />

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={S.fr}><label style={S.lbl}>Email</label><input style={S.inp} type="email" required value={form.email} onChange={f('email')} placeholder="votre@email.com" /></div>
            <div style={{ ...S.fr, marginBottom: '20px' }}><label style={S.lbl}>Mot de passe</label><input style={S.inp} type="password" required value={form.password} onChange={f('password')} placeholder="••••••••" /></div>
            <button type="submit" style={{ ...S.btn('linear-gradient(135deg,#667eea,#764ba2)'), width: '100%', padding: '13px', fontSize: '15px' }}>Se connecter</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={S.g2}>
              <div style={S.fr}><label style={S.lbl}>Prénom *</label><input style={S.inp} required value={form.prenom} onChange={f('prenom')} placeholder="Prénom" /></div>
              <div style={S.fr}><label style={S.lbl}>Nom *</label><input style={S.inp} required value={form.nom} onChange={f('nom')} placeholder="Nom" /></div>
            </div>
            <div style={S.fr}><label style={S.lbl}>Email *</label><input style={S.inp} type="email" required value={form.email} onChange={f('email')} placeholder="votre@email.com" /></div>
            <div style={S.fr}><label style={S.lbl}>Mot de passe *</label><input style={S.inp} type="password" required value={form.password} onChange={f('password')} placeholder="Min. 6 caractères" minLength="6" /></div>
            <div style={{ ...S.fr, marginBottom: '20px' }}>
              <label style={S.lbl}>Rôle *</label>
              <select style={S.inp} value={form.role} onChange={f('role')}>
                <option value="patient">🤒 Patient</option>
                <option value="chirurgien">👨‍⚕️ Chirurgien / Médecin rééducateur</option>
                <option value="kinesitherapeute">🏃 Kinésithérapeute</option>
                <option value="infirmier">👩‍⚕️ Infirmier(e) de suivi</option>
                <option value="coordinateur">📋 Coordinateur de parcours</option>
              </select>
            </div>
            <button type="submit" style={{ ...S.btn('linear-gradient(135deg,#48bb78,#38a169)'), width: '100%', padding: '13px', fontSize: '15px' }}>✓ Créer mon compte</button>
          </form>
        )}

        <div style={{ marginTop: '20px', padding: '14px', background: '#f7f7fa', borderRadius: '8px', fontSize: '12px', color: '#888' }}>
          <strong style={{ color: '#555' }}>Comptes de test :</strong> Inscrivez-vous avec le rôle de votre choix.
          <br />Pour les patients : créez un compte patient pour voir la vue patient complète.
        </div>
      </div>
    </div>
  );
}

// ============ DASHBOARD PROFESSIONNEL ============
function PageDashboard({ user }) {
  const [stats, setStats] = useState({ plans: 0, questionnaires: 0, alertes: 0, exercices: 0 });
  const [alertes, setAlertes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const isPatient = user?.role === 'patient';

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, pRes, eRes] = await Promise.allSettled([
          fetch(`${API.alert}/api/alert`).then(r => r.json()),
          fetch(`${API.recovery}/api/recovery-plans`).then(r => r.json()),
          fetch(`${API.exercise}/api/exercise/library`).then(r => r.json()),
        ]);
        const a = aRes.status === 'fulfilled' ? (aRes.value.alerts || []) : [];
        const p = pRes.status === 'fulfilled' ? (pRes.value.recoveryPlans || []) : [];
        const e = eRes.status === 'fulfilled' ? (eRes.value.exercises || []) : [];
        setAlertes(a.slice(0, 4));
        setPlans(p.slice(0, 3));
        setStats({ alertes: a.length, plans: p.length, exercices: e.length, questionnaires: 0 });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (isPatient) return <PageDashboardPatient user={user} />;
  if (loading) return <div style={S.page}><Spinner /></div>;

  return (
    <div style={S.page}>
      <h1 style={S.h1}>📊 Tableau de bord professionnel</h1>
      <p style={S.sub}>Bienvenue {user?.prenom} {user?.nom} — {user?.role} — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div style={S.g4}>
        <div style={S.metric('#e53e3e')}><div style={{ fontSize: '28px' }}>🚨</div><div style={{ fontSize: '32px', fontWeight: '700', color: '#e53e3e' }}>{stats.alertes}</div><div style={{ fontSize: '13px', color: '#666' }}>Alertes actives</div></div>
        <div style={S.metric('#667eea')}><div style={{ fontSize: '28px' }}>📋</div><div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.plans}</div><div style={{ fontSize: '13px', color: '#666' }}>Parcours créés</div></div>
        <div style={S.metric('#48bb78')}><div style={{ fontSize: '28px' }}>💪</div><div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.exercices}</div><div style={{ fontSize: '13px', color: '#666' }}>Exercices disponibles</div></div>
        <div style={S.metric('#ed8936')}><div style={{ fontSize: '28px' }}>👥</div><div style={{ fontSize: '32px', fontWeight: '700' }}>{getUsers().filter(u => u.role === 'patient').length}</div><div style={{ fontSize: '13px', color: '#666' }}>Patients inscrits</div></div>
      </div>

      <div style={S.g2}>
        <div style={S.card}>
          <h3 style={{ marginBottom: '16px' }}>🚨 Alertes récentes</h3>
          {alertes.length === 0 && <div style={{ color: '#48bb78', textAlign: 'center', padding: '20px' }}>✅ Aucune alerte active</div>}
          {alertes.map((a) => (
            <div key={a.id} style={S.row}>
              <span style={{ fontSize: '22px' }}>{a.severity === 'CRITICAL' ? '🔴' : '🟡'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>Patient: {a.patientId}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{a.anomalies?.map(x => x.type).join(', ')}</div>
              </div>
              <span style={S.badge(a.severity === 'CRITICAL' ? '#c53030' : '#c05621', a.severity === 'CRITICAL' ? '#fed7d7' : '#feebc8')}>{a.severity}</span>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <h3 style={{ marginBottom: '16px' }}>📋 Parcours récents</h3>
          {plans.length === 0 && <div style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>Aucun parcours créé</div>}
          {plans.map((p, i) => (
            <div key={p.id} style={S.row}>
              <div style={S.av(C(i))}>{p.templateName?.[0] || 'P'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{p.templateName}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{p.duration} jours · Patient: {p.patientId}</div>
              </div>
              <span style={S.badge('#276749', '#c6f6d5')}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des patients inscrits */}
      <div style={S.card}>
        <h3 style={{ marginBottom: '16px' }}>👥 Patients inscrits ({getUsers().filter(u => u.role === 'patient').length})</h3>
        {getUsers().filter(u => u.role === 'patient').length === 0 && (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>Aucun patient inscrit pour le moment</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {getUsers().filter(u => u.role === 'patient').map((p, i) => (
            <div key={p.id} style={{ padding: '12px', background: '#f7f7fa', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={S.av(C(i))}>{p.prenom?.[0]}{p.nom?.[0]}</div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{p.prenom} {p.nom}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>ID: {p.id}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ DASHBOARD PATIENT ============
function PageDashboardPatient({ user }) {
  const [myPlan, setMyPlan] = useState(null);
  const [myQuestionnaires, setMyQuestionnaires] = useState([]);
  const [myExercices, setMyExercices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, qRes, eRes] = await Promise.allSettled([
          fetch(`${API.recovery}/api/recovery-plans`).then(r => r.json()),
          fetch(`${API.questionnaire}/api/questionnaire/patient/${user.id}`).then(r => r.json()),
          fetch(`${API.exercise}/api/exercise/session/patient/${user.id}`).then(r => r.json()),
        ]);
        // Trouver le parcours du patient
        const allPlans = pRes.status === 'fulfilled' ? (pRes.value.recoveryPlans || []) : [];
        const monPlan = allPlans.find(p => p.patientId === user.id || p.patientId === `${user.prenom} ${user.nom}`);
        setMyPlan(monPlan || null);
        setMyQuestionnaires(qRes.status === 'fulfilled' ? (qRes.value.patientQuestionnaires || []) : []);
        setMyExercices(eRes.status === 'fulfilled' ? (eRes.value.sessions || eRes.value.exerciseSessions || []) : []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [user.id]);

  if (loading) return <div style={S.page}><Spinner /></div>;

  const qEnAttente = myQuestionnaires.filter(q => q.status === 'sent').length;
  const qCompletes = myQuestionnaires.filter(q => q.status === 'completed').length;

  return (
    <div style={S.page}>
      {/* Bannière de bienvenue patient */}
      <div style={S.patientBanner}>
        <div style={{ fontSize: '48px' }}>🤒</div>
        <div>
          <h1 style={{ color: 'white', fontSize: '22px', margin: '0 0 4px' }}>Bonjour {user?.prenom} {user?.nom} !</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: 0 }}>
            Voici votre espace de suivi post-opératoire personnel. Votre équipe médicale vous accompagne.
          </p>
        </div>
      </div>

      {/* Métriques patient */}
      <div style={S.g3}>
        <div style={S.metric('#ed8936')}>
          <div style={{ fontSize: '28px' }}>📝</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: qEnAttente > 0 ? '#e53e3e' : '#48bb78' }}>{qEnAttente}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Questionnaire(s) à remplir</div>
          {qEnAttente > 0 && <div style={{ fontSize: '12px', color: '#e53e3e', marginTop: '4px', fontWeight: '600' }}>⚠️ Action requise</div>}
        </div>
        <div style={S.metric('#667eea')}>
          <div style={{ fontSize: '28px' }}>💪</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>{myExercices.length}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Session(s) d'exercices</div>
        </div>
        <div style={S.metric('#48bb78')}>
          <div style={{ fontSize: '28px' }}>✅</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>{qCompletes}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Questionnaire(s) complétés</div>
        </div>
      </div>

      {/* Parcours du patient */}
      {myPlan ? (
        <div style={{ ...S.card, borderLeft: '4px solid #667eea' }}>
          <h3 style={{ marginBottom: '12px' }}>📋 Mon parcours de récupération</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={S.badge('#2b6cb0', '#bee3f8')}>{myPlan.templateName}</span>
            <span style={S.badge('#276749', '#c6f6d5')}>{myPlan.duration} jours</span>
            <span style={S.badge('#553c9a', '#e9d8fd')}>{myPlan.status}</span>
          </div>
          {myPlan.adjustments?.length > 0 && (
            <div style={{ padding: '10px', background: '#f0f4ff', borderRadius: '8px', fontSize: '13px', color: '#555' }}>
              🔧 Ajustements pour vous : {myPlan.adjustments.join(' • ')}
            </div>
          )}
        </div>
      ) : (
        <div style={{ ...S.card, textAlign: 'center', padding: '30px', color: '#aaa' }}>
          📋 Aucun parcours assigné pour le moment — votre équipe médicale le créera prochainement
        </div>
      )}

      {/* Questionnaires en attente */}
      {qEnAttente > 0 && (
        <div style={{ ...S.card, border: '2px solid #e53e3e' }}>
          <h3 style={{ marginBottom: '12px', color: '#e53e3e' }}>⚠️ Questionnaire(s) à remplir</h3>
          {myQuestionnaires.filter(q => q.status === 'sent').map(q => (
            <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fff5f5', borderRadius: '8px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: '600' }}>{q.templateName}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Envoyé le {new Date(q.sentAt).toLocaleDateString('fr-FR')}</div>
              </div>
              <Link to="/mes-questionnaires" style={{ ...S.btn('#e53e3e'), textDecoration: 'none' }}>Remplir maintenant →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ MON PARCOURS (PAGE PATIENT) ============
function PageMonParcours({ user }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API.recovery}/api/recovery-plans`).then(r => r.json())
      .then(data => {
        const all = data.recoveryPlans || [];
        // Chercher le parcours par ID ou par nom (prénom + nom)
        const mine = all.filter(p =>
          p.patientId === user.id ||
          p.patientId === `${user.prenom} ${user.nom}` ||
          p.patientId?.toLowerCase().includes(user.prenom?.toLowerCase())
        );
        setPlans(mine);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={S.page}><Spinner /></div>;

  return (
    <div style={S.page}>
      <h1 style={S.h1}>📋 Mon parcours de récupération</h1>
      <p style={S.sub}>Votre programme personnalisé établi par votre équipe médicale</p>

      {plans.length === 0 && (
        <div style={{ ...S.card, textAlign: 'center', padding: '40px', color: '#aaa' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Aucun parcours assigné pour le moment</div>
          <div style={{ fontSize: '13px' }}>Votre chirurgien ou kinésithérapeute créera votre parcours personnalisé</div>
        </div>
      )}

      {plans.map((p, i) => (
        <div key={p.id} style={{ ...S.card, borderLeft: '4px solid #667eea' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '8px' }}>{p.templateName}</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={S.badge('#2b6cb0', '#bee3f8')}>⏱️ {p.duration} jours</span>
                <span style={S.badge('#276749', '#c6f6d5')}>{p.status}</span>
                {p.patientProfile?.age && <span style={S.badge('#553c9a', '#e9d8fd')}>Âge: {p.patientProfile.age} ans</span>}
              </div>
            </div>
          </div>

          {p.adjustments?.length > 0 && (
            <div style={{ padding: '12px', background: '#f0f4ff', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>🔧 Ajustements personnalisés pour vous :</div>
              {p.adjustments.map((a, j) => <div key={j} style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>• {a}</div>)}
            </div>
          )}

          <h3 style={{ marginBottom: '12px', fontSize: '15px' }}>Phases de récupération :</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
            {p.phases?.map((ph, j) => (
              <div key={j} style={{ padding: '14px', background: '#f7f7fa', borderRadius: '10px', borderLeft: `3px solid ${C(j)}` }}>
                <div style={{ fontWeight: '700', color: C(j), marginBottom: '8px', fontSize: '14px' }}>Phase {ph.phase} : {ph.name}</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>📅 Semaines {ph.weeks}</div>
                <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}><strong>Objectifs :</strong> {ph.objectives?.join(', ')}</div>
                <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}><strong>Exercices :</strong> {ph.exercises?.join(', ')}</div>
                {ph.restrictions?.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#e53e3e', marginTop: '6px', padding: '6px', background: '#fff5f5', borderRadius: '4px' }}>
                    ⚠️ {ph.restrictions.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ MES QUESTIONNAIRES (PAGE PATIENT) ============
function PageMesQuestionnaires({ user }) {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showFill, setShowFill] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, qRes] = await Promise.all([
          fetch(`${API.questionnaire}/api/questionnaire/templates`).then(r => r.json()),
          fetch(`${API.questionnaire}/api/questionnaire/patient/${user.id}`).then(r => r.json()),
        ]);
        setTemplates(tRes.questionnaireTemplates || []);
        setQuestionnaires(qRes.patientQuestionnaires || []);
      } catch { setErr('Erreur de connexion au service questionnaire'); }
      setLoading(false);
    };
    load();
  }, [user.id]);

  // Enrichir les questionnaires du patient avec les questions du template
  const getQuestionsForQuestionnaire = (q) => {
    const template = templates.find(t => t.id === q.templateId);
    return template?.questions || q.questions || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const questions = getQuestionsForQuestionnaire(showFill);
    const ansArray = questions.map((q, i) => ({
      questionId: q.id,
      value: answers[i] !== undefined ? answers[i] : ''
    }));
    try {
      const res = await fetch(`${API.questionnaire}/api/questionnaire/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaireId: showFill.id, patientId: user.id, answers: ansArray })
      });
      const data = await res.json();
      if (data.success) {
        const alertMsg = data.responseData?.anomaliesDetected > 0
          ? `✅ Soumis ! ⚠️ ${data.responseData.anomaliesDetected} anomalie(s) détectée(s) — votre équipe médicale est notifiée.`
          : '✅ Questionnaire soumis avec succès ! Merci.';
        setMsg(alertMsg);
        setQuestionnaires(questionnaires.map(q => q.id === showFill.id ? { ...q, status: 'completed' } : q));
        setShowFill(null);
        setAnswers({});
        setTimeout(() => setMsg(''), 6000);
      } else setErr(data.message);
    } catch { setErr('Erreur lors de la soumission'); }
  };

  if (loading) return <div style={S.page}><Spinner /></div>;

  const enAttente = questionnaires.filter(q => q.status === 'sent');
  const completes = questionnaires.filter(q => q.status === 'completed');

  return (
    <div style={S.page}>
      <h1 style={S.h1}>📝 Mes questionnaires de suivi</h1>
      <p style={S.sub}>Remplissez vos questionnaires pour informer votre équipe médicale de votre état de santé</p>

      {msg && <div style={{ padding: '12px', background: msg.includes('⚠️') ? '#feebc8' : '#c6f6d5', color: msg.includes('⚠️') ? '#c05621' : '#276749', borderRadius: '8px', marginBottom: '16px', fontWeight: '600' }}>{msg}</div>}
      <ErrBox msg={err} />

      {/* Modal de remplissage */}
      {showFill && (
        <Modal title={`📝 ${showFill.templateName}`} onClose={() => { setShowFill(null); setAnswers({}); }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Répondez honnêtement — ces informations aident votre équipe médicale à adapter votre suivi.
          </p>
          <form onSubmit={handleSubmit}>
            {getQuestionsForQuestionnaire(showFill).map((q, i) => (
              <div key={q.id} style={{ ...S.fr, padding: '14px', background: '#f7f7fa', borderRadius: '8px' }}>
                <label style={{ ...S.lbl, color: '#333', fontSize: '14px' }}>{i + 1}. {q.text}</label>

                {q.type === 'scale' && (
                  <div>
                    <input type="range" min={q.min || 0} max={q.max || 10}
                      value={answers[i] !== undefined ? answers[i] : (q.min || 0)}
                      onChange={e => setAnswers({ ...answers, [i]: parseInt(e.target.value) })}
                      style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginTop: '4px' }}>
                      <span>{q.min || 0} — Aucune</span>
                      <strong style={{ color: '#667eea', fontSize: '16px' }}>{answers[i] !== undefined ? answers[i] : (q.min || 0)} / {q.max || 10}</strong>
                      <span>{q.max || 10} — Maximum</span>
                    </div>
                  </div>
                )}

                {q.type === 'number' && (
                  <input style={S.inp} type="number" step="0.1"
                    value={answers[i] !== undefined ? answers[i] : ''}
                    onChange={e => setAnswers({ ...answers, [i]: parseFloat(e.target.value) })}
                    placeholder={q.unit ? `Valeur en ${q.unit}` : 'Valeur numérique'} />
                )}

                {q.type === 'boolean' && (
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    {[{ label: '✓ Oui', val: true }, { label: '✗ Non', val: false }].map(({ label, val }) => (
                      <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', padding: '8px 16px', background: answers[i] === val ? '#e8f0fe' : 'white', border: `2px solid ${answers[i] === val ? '#667eea' : '#e2e8f0'}`, borderRadius: '8px' }}>
                        <input type="radio" name={`q${i}`} style={{ display: 'none' }} onChange={() => setAnswers({ ...answers, [i]: val })} />
                        {label}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'choice' && (
                  <select style={{ ...S.inp, marginTop: '6px' }} value={answers[i] || ''} onChange={e => setAnswers({ ...answers, [i]: e.target.value })}>
                    <option value="">Sélectionner une réponse...</option>
                    {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}

                {/* Alerte visuelle si valeur dépasse le seuil */}
                {q.alertThreshold && answers[i] > q.alertThreshold && (
                  <div style={{ marginTop: '8px', padding: '8px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '6px', fontSize: '12px', color: '#c53030', fontWeight: '600' }}>
                    ⚠️ Valeur élevée — Seuil d'alerte : {q.alertThreshold}. Votre équipe sera notifiée.
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button type="submit" style={{ ...S.btn('linear-gradient(135deg,#667eea,#764ba2)'), flex: 1, padding: '13px' }}>✓ Soumettre mes réponses</button>
              <button type="button" onClick={() => { setShowFill(null); setAnswers({}); }} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Questionnaires en attente */}
      <h3 style={{ marginBottom: '12px' }}>📬 À remplir ({enAttente.length})</h3>
      {enAttente.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '30px', color: '#48bb78' }}>
          ✅ Aucun questionnaire en attente — votre suivi est à jour !
        </div>
      ) : (
        enAttente.map((q) => (
          <div key={q.id} style={{ ...S.card, border: '2px solid #e53e3e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>📝 {q.templateName}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>Envoyé le {new Date(q.sentAt).toLocaleDateString('fr-FR')}</div>
              <span style={{ ...S.badge('#c05621', '#feebc8'), marginTop: '6px', display: 'inline-block' }}>En attente de réponse</span>
            </div>
            <button onClick={() => { setShowFill(q); setAnswers({}); }}
              style={{ ...S.btn('linear-gradient(135deg,#e53e3e,#c53030)'), padding: '12px 20px', fontSize: '14px' }}>
              📝 Remplir maintenant
            </button>
          </div>
        ))
      )}

      {/* Questionnaires complétés */}
      {completes.length > 0 && (
        <>
          <h3 style={{ marginBottom: '12px', marginTop: '24px' }}>✅ Questionnaires complétés ({completes.length})</h3>
          {completes.map((q) => (
            <div key={q.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
              <div>
                <div style={{ fontWeight: '600' }}>📝 {q.templateName}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Envoyé le {new Date(q.sentAt).toLocaleDateString('fr-FR')}</div>
              </div>
              <span style={S.badge('#276749', '#c6f6d5')}>✓ Complété</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ============ MES EXERCICES (PAGE PATIENT) ============
function PageMesExercices({ user }) {
  const [sessions, setSessions] = useState([]);
  const [library, setLibrary] = useState([]);
  const [videoModal, setVideoModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [lRes, sRes] = await Promise.allSettled([
          fetch(`${API.exercise}/api/exercise/library`).then(r => r.json()),
          fetch(`${API.exercise}/api/exercise/session/patient/${user.id}`).then(r => r.json()),
        ]);
        const lib = lRes.status === 'fulfilled' ? (lRes.value.exercises || []) : [];
        const ses = sRes.status === 'fulfilled' ? (sRes.value.sessions || sRes.value.exerciseSessions || []) : [];
        setLibrary(lib);
        setSessions(ses);
      } catch { setErr('Erreur de connexion au service exercices'); }
      setLoading(false);
    };
    load();
  }, [user.id]);

  // Résoudre les exercices d'une session
  const getExercicesDeSession = (session) => {
    if (!session.exerciseIds) return [];
    return session.exerciseIds.map(id => library.find(e => e.id === id)).filter(Boolean);
  };

  if (loading) return <div style={S.page}><Spinner /></div>;

  return (
    <div style={S.page}>
      <h1 style={S.h1}>💪 Mes exercices de rééducation</h1>
      <p style={S.sub}>Programme d'exercices prescrit par votre équipe médicale — suivez les instructions et regardez les vidéos guidées</p>

      <ErrBox msg={err} />

      {/* Modal vidéo */}
      {videoModal && (
        <Modal title={`▶️ ${videoModal.name}`} onClose={() => setVideoModal(null)}>
          <iframe
            width="100%" height="300"
            src={VIDEOS[getVideoKey(videoModal.category)] || VIDEOS.default}
            title={videoModal.name} frameBorder="0" allowFullScreen
            style={{ borderRadius: '8px' }}
          />
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={S.badge('#2b6cb0', '#bee3f8')}>{videoModal.category}</span>
              <span style={S.badge('#553c9a', '#e9d8fd')}>🔁 {videoModal.repetitions} rép × {videoModal.sets} séries</span>
              <span style={S.badge('#276749', '#c6f6d5')}>⏱️ {videoModal.duration} min</span>
              <span style={S.badge(videoModal.difficulty === 'beginner' ? '#276749' : videoModal.difficulty === 'intermediate' ? '#c05621' : '#c53030',
                videoModal.difficulty === 'beginner' ? '#c6f6d5' : videoModal.difficulty === 'intermediate' ? '#feebc8' : '#fed7d7')}>
                {videoModal.difficulty}
              </span>
            </div>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>📋 Instructions :</div>
            {videoModal.instructions?.map((ins, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', alignItems: 'flex-start' }}>
                <span style={{ color: '#667eea', fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>
                <span>{ins}</span>
              </div>
            ))}
            {videoModal.precautions?.length > 0 && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#feebc8', borderRadius: '8px' }}>
                <strong style={{ color: '#c05621', fontSize: '13px' }}>⚠️ Précautions importantes :</strong>
                {videoModal.precautions.map((p, i) => <div key={i} style={{ fontSize: '12px', color: '#c05621', marginTop: '4px' }}>• {p}</div>)}
              </div>
            )}
          </div>
        </Modal>
      )}

      {sessions.length === 0 ? (
        <div>
          <div style={{ ...S.card, textAlign: 'center', padding: '40px', color: '#aaa', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💪</div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>Aucun plan d'exercices assigné pour le moment</div>
            <div style={{ fontSize: '13px' }}>Votre kinésithérapeute ou infirmier(e) vous assignera des exercices adaptés</div>
          </div>

          {/* Afficher la bibliothèque complète en lecture seule pour le patient */}
          <h3 style={{ marginBottom: '12px' }}>📚 Bibliothèque d'exercices disponibles</h3>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
            Découvrez les exercices disponibles. Votre équipe médicale sélectionnera ceux adaptés à votre situation.
          </p>
          <div style={S.g2}>
            {library.map((ex, i) => (
              <ExerciceCard key={ex.id} ex={ex} onVideo={() => setVideoModal(ex)} />
            ))}
          </div>
        </div>
      ) : (
        sessions.map((session, si) => (
          <div key={session.id} style={{ ...S.card, borderLeft: '4px solid #48bb78' }}>
            <h3 style={{ marginBottom: '12px' }}>💪 Plan d'exercices #{si + 1}</h3>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
              Prescrit le {new Date(session.createdAt).toLocaleDateString('fr-FR')} · {(session.exerciseIds || []).length} exercice(s)
            </div>
            <div style={S.g2}>
              {getExercicesDeSession(session).map((ex) => (
                <ExerciceCard key={ex.id} ex={ex} onVideo={() => setVideoModal(ex)} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Composant carte exercice réutilisable
function ExerciceCard({ ex, onVideo }) {
  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '15px', color: '#1a1a2e' }}>{ex.name}</h3>
        <span style={S.badge('#2b6cb0', '#bee3f8')}>{ex.category}</span>
      </div>
      <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}>{ex.description}</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <span style={S.badge('#553c9a', '#e9d8fd')}>🔁 {ex.repetitions} rép × {ex.sets} séries</span>
        <span style={S.badge('#276749', '#c6f6d5')}>⏱️ {ex.duration} min</span>
        <span style={S.badge(ex.difficulty === 'beginner' ? '#276749' : ex.difficulty === 'intermediate' ? '#c05621' : '#c53030',
          ex.difficulty === 'beginner' ? '#c6f6d5' : ex.difficulty === 'intermediate' ? '#feebc8' : '#fed7d7')}>
          {ex.difficulty}
        </span>
      </div>
      <button onClick={onVideo}
        style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', borderRadius: '8px', fontSize: '13px', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
        ▶️ Voir la vidéo guidée + Instructions
      </button>
    </div>
  );
}

// ============ PARCOURS (PAGE PRO) ============
function PageParcours({ user }) {
  const [templates, setTemplates] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ patientId: '', templateId: '', age: '', physicalCondition: 'normal', comorbidities: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const patients = getUsers().filter(u => u.role === 'patient');
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          fetch(`${API.recovery}/api/templates`).then(r => r.json()),
          fetch(`${API.recovery}/api/recovery-plans`).then(r => r.json()),
        ]);
        setTemplates(tRes.templates || []);
        setPlans(pRes.recoveryPlans || []);
      } catch { setErr('Erreur chargement'); }
      setLoading(false);
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const selectedPatient = patients.find(p => p.id === form.patientId);
      const res = await fetch(`${API.recovery}/api/recovery-plan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: form.patientId,
          patientName: selectedPatient ? `${selectedPatient.prenom} ${selectedPatient.nom}` : form.patientId,
          templateId: form.templateId,
          age: parseInt(form.age),
          physicalCondition: form.physicalCondition,
          comorbidities: form.comorbidities
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlans([...plans, data.recoveryPlan]);
        setShowForm(false);
        setMsg('✅ Parcours créé avec succès !');
        setForm({ patientId: '', templateId: '', age: '', physicalCondition: 'normal', comorbidities: [] });
        setTimeout(() => setMsg(''), 3000);
      } else setErr(data.message);
    } catch { setErr('Erreur de connexion au service'); }
  };

  if (loading) return <div style={S.page}><Spinner /></div>;

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>📋 Parcours de récupération</h1>
        <button onClick={() => setShowForm(true)} style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>+ Nouveau parcours</button>
      </div>
      <p style={S.sub}>Création de parcours post-op personnalisés selon âge, comorbidités, condition physique</p>

      <SuccessBox msg={msg} />
      <ErrBox msg={err} />

      {showForm && (
        <Modal title="➕ Créer un parcours personnalisé" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate}>
            <div style={S.fr}>
              <label style={S.lbl}>Patient *</label>
              {patients.length > 0 ? (
                <select style={S.inp} required value={form.patientId} onChange={f('patientId')}>
                  <option value="">Sélectionner un patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom} (ID: {p.id})</option>)}
                </select>
              ) : (
                <input style={S.inp} required value={form.patientId} onChange={f('patientId')} placeholder="ID du patient" />
              )}
            </div>
            <div style={S.fr}>
              <label style={S.lbl}>Type de parcours *</label>
              <select style={S.inp} required value={form.templateId} onChange={f('templateId')}>
                <option value="">Sélectionner un parcours...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.baseDuration} jours)</option>)}
              </select>
            </div>
            <div style={S.fr}><label style={S.lbl}>Âge du patient *</label><input style={S.inp} type="number" required min="1" max="120" value={form.age} onChange={f('age')} placeholder="ex: 65" /></div>
            <div style={S.fr}>
              <label style={S.lbl}>Condition physique</label>
              <select style={S.inp} value={form.physicalCondition} onChange={f('physicalCondition')}>
                <option value="sedentary">Sédentaire</option>
                <option value="normal">Normale</option>
                <option value="athletic">Sportif / Athlétique</option>
              </select>
            </div>
            <div style={S.fr}>
              <label style={S.lbl}>Comorbidités</label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[{ val: 'diabetes', label: 'Diabète' }, { val: 'obesity', label: 'Obésité' }, { val: 'heart-disease', label: 'Maladie cardiaque' }].map(({ val, label }) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.comorbidities.includes(val)}
                      onChange={() => setForm({ ...form, comorbidities: form.comorbidities.includes(val) ? form.comorbidities.filter(x => x !== val) : [...form.comorbidities, val] })} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>✓ Créer le parcours</button>
              <button type="button" onClick={() => setShowForm(false)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      {showDetail && (
        <Modal title={`📋 ${showDetail.templateName}`} onClose={() => setShowDetail(null)}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={S.badge('#2b6cb0', '#bee3f8')}>Durée: {showDetail.duration} jours</span>
            <span style={S.badge('#276749', '#c6f6d5')}>{showDetail.status}</span>
            <span style={S.badge('#553c9a', '#e9d8fd')}>Patient: {showDetail.patientId}</span>
          </div>
          {showDetail.adjustments?.length > 0 && (
            <div style={{ padding: '10px', background: '#f0f4ff', borderRadius: '8px', marginBottom: '12px' }}>
              <strong style={{ fontSize: '13px' }}>🔧 Ajustements personnalisés :</strong>
              {showDetail.adjustments.map((a, i) => <div key={i} style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>• {a}</div>)}
            </div>
          )}
          {showDetail.phases?.map((ph, i) => (
            <div key={i} style={{ marginBottom: '16px', padding: '14px', background: '#f7f7fa', borderRadius: '10px' }}>
              <div style={{ fontWeight: '700', color: C(i), marginBottom: '8px' }}>Phase {ph.phase} : {ph.name} (Semaines {ph.weeks})</div>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}><strong>Objectifs :</strong> {ph.objectives?.join(', ')}</div>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}><strong>Exercices :</strong> {ph.exercises?.join(', ')}</div>
              <div style={{ fontSize: '13px', color: '#e53e3e' }}><strong>Restrictions :</strong> {ph.restrictions?.join(', ')}</div>
            </div>
          ))}
        </Modal>
      )}

      <h3 style={{ marginBottom: '12px' }}>📚 Bibliothèque de parcours types ({templates.length} disponibles)</h3>
      <div style={S.g2}>
        {templates.map((t, i) => (
          <div key={t.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '15px', color: '#1a1a2e' }}>{t.name}</h3>
              <span style={S.badge(t.type === 'cardiac' ? '#c53030' : '#2b6cb0', t.type === 'cardiac' ? '#fed7d7' : '#bee3f8')}>{t.type}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>⏱️ Durée de base : {t.baseDuration} jours</div>
            {t.phases?.map((ph, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ ...S.av(C(j)), width: '22px', height: '22px', fontSize: '10px', flexShrink: 0 }}>{ph.phase}</div>
                <span style={{ fontSize: '12px', color: '#555' }}>{ph.name} (sem. {ph.weeks})</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '12px', marginTop: '8px' }}>🗂️ Parcours créés ({plans.length})</h3>
      {plans.length === 0 && <div style={{ ...S.card, textAlign: 'center', color: '#aaa', padding: '40px' }}>Aucun parcours créé — cliquez sur "+ Nouveau parcours"</div>}
      <div style={S.g2}>
        {plans.map((p, i) => (
          <div key={p.id} style={{ ...S.card, cursor: 'pointer' }} onClick={() => setShowDetail(p)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '15px' }}>{p.templateName}</h3>
              <span style={S.badge('#276749', '#c6f6d5')}>{p.status}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>👤 Patient: {p.patientId}</div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>⏱️ {p.duration} jours · Âge: {p.patientProfile?.age} ans</div>
            {p.adjustments?.length > 0 && <div style={{ fontSize: '12px', color: '#667eea', marginTop: '6px' }}>🔧 {p.adjustments.length} ajustement(s) personnalisé(s)</div>}
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>Cliquer pour voir les phases →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ QUESTIONNAIRES (PAGE PRO) ============
function PageQuestionnaires({ user }) {
  const [templates, setTemplates] = useState([]);
  const [sent, setSent] = useState([]);
  const [showSend, setShowSend] = useState(false);
  const [form, setForm] = useState({ patientId: '', templateId: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const patients = getUsers().filter(u => u.role === 'patient');

  useEffect(() => {
    const load = async () => {
      try {
        const tRes = await fetch(`${API.questionnaire}/api/questionnaire/templates`).then(r => r.json());
        setTemplates(tRes.questionnaireTemplates || []);
      } catch { setErr('Erreur chargement'); }
      setLoading(false);
    };
    load();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API.questionnaire}/api/questionnaire/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: form.patientId, templateId: form.templateId })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ Questionnaire envoyé au patient ${form.patientId} !`);
        setSent([...sent, data.questionnaire || { id: Date.now(), patientId: form.patientId, templateId: form.templateId, status: 'sent', sentAt: new Date().toISOString() }]);
        setShowForm(false); setShowSend(false);
        setTimeout(() => setMsg(''), 3000);
      } else setErr(data.message);
    } catch { setErr('Erreur de connexion'); }
  };

  if (loading) return <div style={S.page}><Spinner /></div>;

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>📝 Questionnaires de suivi</h1>
        <button onClick={() => setShowSend(true)} style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>+ Envoyer à un patient</button>
      </div>
      <p style={S.sub}>Modèles validés médicalement — détection automatique des complications</p>

      <SuccessBox msg={msg} />
      <ErrBox msg={err} />

      {showSend && (
        <Modal title="📤 Envoyer un questionnaire à un patient" onClose={() => setShowSend(false)}>
          <form onSubmit={handleSend}>
            <div style={S.fr}>
              <label style={S.lbl}>Patient *</label>
              {patients.length > 0 ? (
                <select style={S.inp} required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">Sélectionner un patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                </select>
              ) : (
                <input style={S.inp} required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} placeholder="ID du patient" />
              )}
            </div>
            <div style={S.fr}>
              <label style={S.lbl}>Modèle de questionnaire *</label>
              <select style={S.inp} required value={form.templateId} onChange={e => setForm({ ...form, templateId: e.target.value })}>
                <option value="">Sélectionner...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>📤 Envoyer</button>
              <button type="button" onClick={() => setShowSend(false)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      <h3 style={{ marginBottom: '12px' }}>📚 Modèles de questionnaires ({templates.length})</h3>
      <div style={S.g2}>
        {templates.map((t, i) => (
          <div key={t.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '15px' }}>{t.name}</h3>
              <span style={S.badge('#2b6cb0', '#bee3f8')}>{t.type}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>{t.questions?.length} questions validées médicalement</div>
            {t.questions?.map((q, j) => (
              <div key={q.id} style={{ fontSize: '12px', color: '#555', padding: '6px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: C(j), fontWeight: '700', flexShrink: 0 }}>{j + 1}.</span>
                <span style={{ flex: 1 }}>{q.text}</span>
                {q.alertThreshold && <span style={{ color: '#e53e3e', fontSize: '10px', flexShrink: 0 }}>⚠️ seuil: {q.alertThreshold}</span>}
              </div>
            ))}
            <button onClick={() => { setShowSend(true); setForm({ ...form, templateId: t.id }); }}
              style={{ ...S.btn('linear-gradient(135deg,#667eea,#764ba2)'), marginTop: '12px', width: '100%' }}>
              📤 Envoyer ce questionnaire
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ EXERCICES (PAGE PRO) ============
function PageExercices({ user }) {
  const [library, setLibrary] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [videoModal, setVideoModal] = useState(null);
  const [form, setForm] = useState({ patientId: '', exerciseIds: [] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const patients = getUsers().filter(u => u.role === 'patient');

  useEffect(() => {
    fetch(`${API.exercise}/api/exercise/library`).then(r => r.json())
      .then(data => setLibrary(data.exercises || []))
      .catch(() => setErr('Erreur chargement'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API.exercise}/api/exercise/plan/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: form.patientId, exerciseIds: form.exerciseIds })
      });
      const data = await res.json();
      if (data.success) { setMsg(`✅ Plan d'exercices assigné au patient ${form.patientId} !`); setShowCreate(false); setTimeout(() => setMsg(''), 3000); }
      else setErr(data.message);
    } catch { setErr('Erreur connexion'); }
  };

  if (loading) return <div style={S.page}><Spinner /></div>;

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>💪 Exercices guidés</h1>
        <button onClick={() => setShowCreate(true)} style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>+ Assigner à un patient</button>
      </div>
      <p style={S.sub}>Bibliothèque d'exercices post-opératoires avec vidéos guidées — assignez des plans personnalisés</p>

      <SuccessBox msg={msg} />
      <ErrBox msg={err} />

      {showCreate && (
        <Modal title="➕ Assigner un plan d'exercices" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div style={S.fr}>
              <label style={S.lbl}>Patient *</label>
              {patients.length > 0 ? (
                <select style={S.inp} required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">Sélectionner un patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                </select>
              ) : (
                <input style={S.inp} required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} placeholder="ID du patient" />
              )}
            </div>
            <div style={S.fr}>
              <label style={S.lbl}>Sélectionner les exercices *</label>
              {library.map(ex => (
                <label key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', marginBottom: '6px', background: form.exerciseIds.includes(ex.id) ? '#f0f4ff' : '#f7f7fa', border: `1px solid ${form.exerciseIds.includes(ex.id) ? '#667eea' : 'transparent'}`, borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.exerciseIds.includes(ex.id)}
                    onChange={() => setForm({ ...form, exerciseIds: form.exerciseIds.includes(ex.id) ? form.exerciseIds.filter(id => id !== ex.id) : [...form.exerciseIds, ex.id] })} />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{ex.name}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{ex.category} · {ex.repetitions} rép × {ex.sets} séries · {ex.duration} min · {ex.difficulty}</div>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={form.exerciseIds.length === 0}
                style={{ ...S.btn(form.exerciseIds.length > 0 ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#ccc'), opacity: form.exerciseIds.length === 0 ? 0.6 : 1 }}>
                ✓ Assigner le plan ({form.exerciseIds.length} exercice(s))
              </button>
              <button type="button" onClick={() => setShowCreate(false)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      {videoModal && (
        <Modal title={`▶️ ${videoModal.name}`} onClose={() => setVideoModal(null)}>
          <iframe width="100%" height="300"
            src={VIDEOS[getVideoKey(videoModal.category)] || VIDEOS.default}
            title={videoModal.name} frameBorder="0" allowFullScreen style={{ borderRadius: '8px' }} />
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>📋 Instructions :</div>
            {videoModal.instructions?.map((ins, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                <span style={{ color: '#667eea', fontWeight: '700' }}>{i + 1}.</span><span>{ins}</span>
              </div>
            ))}
            {videoModal.precautions?.length > 0 && (
              <div style={{ marginTop: '12px', padding: '10px', background: '#feebc8', borderRadius: '8px' }}>
                <strong style={{ color: '#c05621', fontSize: '13px' }}>⚠️ Précautions :</strong>
                {videoModal.precautions.map((p, i) => <div key={i} style={{ fontSize: '12px', color: '#c05621', marginTop: '4px' }}>• {p}</div>)}
              </div>
            )}
          </div>
        </Modal>
      )}

      <h3 style={{ marginBottom: '12px' }}>📚 Bibliothèque ({library.length} exercices)</h3>
      <div style={S.g2}>
        {library.map((ex) => (
          <ExerciceCard key={ex.id} ex={ex} onVideo={() => setVideoModal(ex)} />
        ))}
      </div>
    </div>
  );
}

// ============ ALERTES ============
function PageAlertes({ user }) {
  const [alertes, setAlertes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', source: 'manual', anomalies: [{ type: '', severity: 'HIGH', value: '' }] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const patients = getUsers().filter(u => u.role === 'patient');

  useEffect(() => {
    fetch(`${API.alert}/api/alert`).then(r => r.json())
      .then(data => setAlertes(data.alerts || []))
      .catch(() => setErr('Erreur chargement alertes'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API.alert}/api/alert/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: form.patientId, source: form.source, anomalies: form.anomalies.filter(a => a.type) })
      });
      const data = await res.json();
      if (data.success) {
        setAlertes([data.alert, ...alertes]);
        setMsg('✅ Alerte créée !'); setShowForm(false);
        setTimeout(() => setMsg(''), 3000);
      } else setErr(data.message);
    } catch { setErr('Erreur connexion'); }
  };

  const handleAck = async (id) => {
    try {
      await fetch(`${API.alert}/api/alert/${id}/acknowledge`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acknowledgedBy: user?.id }) });
      setAlertes(alertes.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
    } catch { setErr('Erreur'); }
  };

  const handleResolve = async (id) => {
    try {
      await fetch(`${API.alert}/api/alert/${id}/resolve`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolvedBy: user?.id }) });
      setAlertes(alertes.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    } catch { setErr('Erreur'); }
  };

  if (loading) return <div style={S.page}><Spinner /></div>;

  const pending = alertes.filter(a => a.status === 'pending');
  const acked = alertes.filter(a => a.status === 'acknowledged');
  const resolved = alertes.filter(a => a.status === 'resolved');

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>🚨 Détection des complications</h1>
        <button onClick={() => setShowForm(true)} style={S.btn('#e53e3e')}>+ Signaler une complication</button>
      </div>
      <p style={S.sub}>Douleur, fièvre, saignement — détection automatique via questionnaires + signalement manuel</p>

      <SuccessBox msg={msg} />
      <ErrBox msg={err} />

      {showForm && (
        <Modal title="⚠️ Signaler une complication" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate}>
            <div style={S.fr}>
              <label style={S.lbl}>Patient *</label>
              {patients.length > 0 ? (
                <select style={S.inp} required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">Sélectionner un patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                </select>
              ) : (
                <input style={S.inp} required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} placeholder="ID du patient" />
              )}
            </div>
            <div style={S.fr}>
              <label style={S.lbl}>Source</label>
              <select style={S.inp} value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                <option value="manual">Signalement manuel</option>
                <option value="questionnaire">Via questionnaire</option>
                <option value="exercise">Session d'exercice</option>
              </select>
            </div>
            <div style={S.fr}>
              <label style={S.lbl}>Anomalie détectée *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select style={{ ...S.inp, flex: 1 }} value={form.anomalies[0].type} onChange={e => setForm({ ...form, anomalies: [{ ...form.anomalies[0], type: e.target.value }] })}>
                  <option value="">Type...</option>
                  <option value="douleur">Douleur</option>
                  <option value="fievre">Fièvre</option>
                  <option value="saignement">Saignement</option>
                  <option value="infection">Infection</option>
                  <option value="oedeme">Œdème</option>
                </select>
                <select style={{ ...S.inp, flex: 1 }} value={form.anomalies[0].severity} onChange={e => setForm({ ...form, anomalies: [{ ...form.anomalies[0], severity: e.target.value }] })}>
                  <option value="LOW">Faible</option>
                  <option value="MEDIUM">Modéré</option>
                  <option value="HIGH">Élevé</option>
                  <option value="CRITICAL">Critique</option>
                </select>
                <input style={{ ...S.inp, flex: 1 }} type="number" placeholder="Valeur (ex: 39.5)" value={form.anomalies[0].value}
                  onChange={e => setForm({ ...form, anomalies: [{ ...form.anomalies[0], value: parseFloat(e.target.value) }] })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={S.btn('#e53e3e')}>⚠️ Créer l'alerte</button>
              <button type="button" onClick={() => setShowForm(false)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={S.g4}>
        {[
          { label: 'En attente', value: pending.length, color: '#e53e3e' },
          { label: 'Prises en charge', value: acked.length, color: '#ed8936' },
          { label: 'Résolues', value: resolved.length, color: '#48bb78' },
          { label: 'Total', value: alertes.length, color: '#667eea' },
        ].map((m, i) => (
          <div key={i} style={S.metric(m.color)}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: m.color }}>{m.value}</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {[{ title: '🔴 En attente', list: pending }, { title: '🟡 Prises en charge', list: acked }, { title: '✅ Résolues', list: resolved }].map(({ title, list }) => (
        list.length > 0 && (
          <div key={title} style={S.card}>
            <h3 style={{ marginBottom: '16px' }}>{title} ({list.length})</h3>
            {list.map(a => (
              <div key={a.id} style={{ ...S.row, alignItems: 'flex-start', padding: '14px 0' }}>
                <span style={{ fontSize: '28px' }}>{a.severity === 'CRITICAL' ? '🔴' : a.severity === 'HIGH' ? '🟠' : '🟡'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>Patient: {a.patientId}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                    {a.anomalies?.map((an, i) => <span key={i} style={{ marginRight: '8px' }}>• {an.type} ({an.severity}{an.value ? ': ' + an.value : ''})</span>)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{new Date(a.createdAt).toLocaleString('fr-FR')} · Source: {a.source}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={S.badge(a.severity === 'CRITICAL' ? '#c53030' : '#c05621', a.severity === 'CRITICAL' ? '#fed7d7' : '#feebc8')}>{a.severity}</span>
                  {a.status === 'pending' && <button onClick={() => handleAck(a.id)} style={S.btn('#ed8936')}>Prendre en charge</button>}
                  {a.status === 'acknowledged' && <button onClick={() => handleResolve(a.id)} style={S.btn('#48bb78')}>✓ Résoudre</button>}
                </div>
              </div>
            ))}
          </div>
        )
      ))}
      {alertes.length === 0 && <div style={{ ...S.card, textAlign: 'center', color: '#48bb78', padding: '40px', fontSize: '16px' }}>✅ Aucune alerte active</div>}
    </div>
  );
}

// ============ COORDINATION ============
function PageCoordination({ user }) {
  const [notes, setNotes] = useState([]);
  const [meds, setMeds] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('notes');
  const [form, setForm] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const myId = user?.id;
  const patients = getUsers().filter(u => u.role === 'patient');

  useEffect(() => {
    const load = async () => {
      try {
        const [nRes, mRes, aRes] = await Promise.allSettled([
          fetch(`${API.coordination}/api/carenote/patient/${myId}`).then(r => r.json()),
          fetch(`${API.coordination}/api/medication/patient/${myId}`).then(r => r.json()),
          fetch(`${API.coordination}/api/appointment/patient/${myId}`).then(r => r.json()),
        ]);
        setNotes(nRes.status === 'fulfilled' ? nRes.value.notes || [] : []);
        setMeds(mRes.status === 'fulfilled' ? mRes.value.medications || [] : []);
        setAppointments(aRes.status === 'fulfilled' ? aRes.value.appointments || [] : []);
      } catch {}
    };
    load();
  }, []);

  const handleNote = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API.coordination}/api/carenote/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: form.patientId || myId, content: form.content, authorId: myId, authorRole: user?.role }) });
      const data = await res.json();
      if (data.success) { setNotes([...notes, data.note]); setMsg('✅ Note ajoutée !'); setShowForm(false); setForm({}); setTimeout(() => setMsg(''), 3000); }
      else setErr(data.message || 'Erreur');
    } catch { setErr('Erreur connexion'); }
  };

  const handleMed = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API.coordination}/api/medication/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: form.patientId || myId, medicationName: form.medicationName }) });
      const data = await res.json();
      if (data.success) { setMeds([...meds, data.medication]); setMsg('✅ Médicament ajouté !'); setShowForm(false); setForm({}); setTimeout(() => setMsg(''), 3000); }
    } catch { setErr('Erreur connexion'); }
  };

  const handleAppt = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API.coordination}/api/appointment/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: form.patientId || myId, doctorId: myId, doctorName: form.doctorName || `${user?.prenom} ${user?.nom}`, appointmentType: form.appointmentType, scheduledDate: form.scheduledDate }) });
      const data = await res.json();
      if (data.success) { setAppointments([...appointments, data.appointment]); setMsg('✅ Rendez-vous créé !'); setShowForm(false); setForm({}); setTimeout(() => setMsg(''), 3000); }
    } catch { setErr('Erreur connexion'); }
  };

  const tabs = [{ id: 'notes', label: '📝 Notes de soin' }, { id: 'meds', label: '💊 Médicaments' }, { id: 'appts', label: '📅 Rendez-vous' }];

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>👥 Coordination de soins</h1>
        <button onClick={() => { setShowForm(true); setForm({}); }} style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>+ Ajouter</button>
      </div>
      <p style={S.sub}>Synchronisation entre professionnels — notes cliniques, prescriptions, rendez-vous</p>

      <SuccessBox msg={msg} />
      <ErrBox msg={err} />

      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f7f7fa', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', background: tab === t.id ? 'white' : 'transparent', color: tab === t.id ? '#667eea' : '#888', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {showForm && (
        <Modal title={tab === 'notes' ? '📝 Ajouter une note clinique' : tab === 'meds' ? '💊 Prescrire un médicament' : '📅 Planifier un rendez-vous'} onClose={() => { setShowForm(false); setForm({}); }}>
          <form onSubmit={tab === 'notes' ? handleNote : tab === 'meds' ? handleMed : handleAppt}>
            <div style={S.fr}>
              <label style={S.lbl}>Patient *</label>
              {patients.length > 0 ? (
                <select style={S.inp} required value={form.patientId || ''} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">Sélectionner un patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                </select>
              ) : (
                <input style={S.inp} required value={form.patientId || ''} onChange={e => setForm({ ...form, patientId: e.target.value })} placeholder="ID du patient" />
              )}
            </div>
            {tab === 'notes' && (
              <div style={S.fr}>
                <label style={S.lbl}>Note clinique *</label>
                <textarea style={{ ...S.inp, height: '100px', resize: 'vertical' }} required value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Observations cliniques, évolution, recommandations..." />
              </div>
            )}
            {tab === 'meds' && (
              <div style={S.fr}>
                <label style={S.lbl}>Médicament *</label>
                <input style={S.inp} required value={form.medicationName || ''} onChange={e => setForm({ ...form, medicationName: e.target.value })} placeholder="ex: Paracétamol 1g — 3x/jour pendant 5 jours" />
              </div>
            )}
            {tab === 'appts' && (
              <>
                <div style={S.fr}>
                  <label style={S.lbl}>Type de rendez-vous *</label>
                  <select style={S.inp} required value={form.appointmentType || ''} onChange={e => setForm({ ...form, appointmentType: e.target.value })}>
                    <option value="">Sélectionner...</option>
                    <option>Consultation de suivi post-opératoire</option>
                    <option>Séance de rééducation</option>
                    <option>Contrôle radiologique</option>
                    <option>Bilan sanguin</option>
                    <option>Consultation de kinésithérapie</option>
                  </select>
                </div>
                <div style={S.fr}>
                  <label style={S.lbl}>Praticien responsable</label>
                  <input style={S.inp} value={form.doctorName || `${user?.prenom} ${user?.nom}`} onChange={e => setForm({ ...form, doctorName: e.target.value })} placeholder="Nom du praticien" />
                </div>
                <div style={S.fr}>
                  <label style={S.lbl}>Date et heure *</label>
                  <input style={S.inp} type="datetime-local" required value={form.scheduledDate || ''} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} />
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>✓ Enregistrer</button>
              <button type="button" onClick={() => { setShowForm(false); setForm({}); }} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      {tab === 'notes' && (
        <div>
          {notes.length === 0 && <div style={{ ...S.card, textAlign: 'center', color: '#aaa', padding: '40px' }}>Aucune note — cliquez sur "+ Ajouter"</div>}
          {notes.map((n, i) => (
            <div key={n.id} style={S.card}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={S.av(C(i))}>📝</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>Patient: {n.patientId}</div>
                  <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>{n.content}</div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>{new Date(n.createdAt).toLocaleString('fr-FR')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'meds' && (
        <div>
          {meds.length === 0 && <div style={{ ...S.card, textAlign: 'center', color: '#aaa', padding: '40px' }}>Aucun médicament prescrit — cliquez sur "+ Ajouter"</div>}
          {meds.map((m, i) => (
            <div key={m.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '24px' }}>💊</span>
                <div>
                  <div style={{ fontWeight: '600' }}>{m.medicationName}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Patient: {m.patientId} · {new Date(m.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
              <span style={S.badge(m.status === 'active' ? '#276749' : '#888', m.status === 'active' ? '#c6f6d5' : '#eee')}>{m.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'appts' && (
        <div>
          {appointments.length === 0 && <div style={{ ...S.card, textAlign: 'center', color: '#aaa', padding: '40px' }}>Aucun rendez-vous planifié — cliquez sur "+ Ajouter"</div>}
          {appointments.map((a, i) => (
            <div key={a.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '24px' }}>📅</span>
                <div>
                  <div style={{ fontWeight: '600' }}>{a.appointmentType}</div>
                  <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>Dr. {a.doctorName}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                    {new Date(a.scheduledDate).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>Patient: {a.patientId}</div>
                </div>
              </div>
              <span style={S.badge('#2b6cb0', '#bee3f8')}>{a.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ APP PRINCIPALE ============
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentUser')); } catch { return null; }
  });

  const handleLogout = () => { localStorage.removeItem('currentUser'); setUser(null); };

  function Layout({ children }) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6fb' }}>
        <Navbar user={user} onLogout={handleLogout} />
        {children}
      </div>
    );
  }

  function PR({ children }) {
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
  }

  // Routes selon le rôle
  const isPatient = user?.role === 'patient';

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <PageLogin onLogin={setUser} />} />

        {/* Dashboard (commun, adaptatif selon rôle) */}
        <Route path="/dashboard" element={<PR><PageDashboard user={user} /></PR>} />

        {/* Routes PATIENT uniquement */}
        <Route path="/mon-parcours"       element={<PR><PageMonParcours user={user} /></PR>} />
        <Route path="/mes-questionnaires" element={<PR><PageMesQuestionnaires user={user} /></PR>} />
        <Route path="/mes-exercices"      element={<PR><PageMesExercices user={user} /></PR>} />

        {/* Routes PROFESSIONNELS uniquement */}
        <Route path="/parcours"       element={<PR><PageParcours user={user} /></PR>} />
        <Route path="/questionnaires" element={<PR><PageQuestionnaires user={user} /></PR>} />
        <Route path="/exercices"      element={<PR><PageExercices user={user} /></PR>} />
        <Route path="/alertes"        element={<PR><PageAlertes user={user} /></PR>} />
        <Route path="/coordination"   element={<PR><PageCoordination user={user} /></PR>} />

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

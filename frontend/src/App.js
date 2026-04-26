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

// ============ USERS (inscription en localStorage) ============
const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));

const ROLES = ['patient', 'chirurgien', 'kinesitherapeute', 'infirmier', 'coordinateur'];

const VIDEOS = {
  'knee': 'https://www.youtube.com/embed/2XaKMBjdEo0',
  'ankle': 'https://www.youtube.com/embed/sTANio_2E0Q',
  'cardiac': 'https://www.youtube.com/embed/4pKly2JojMw',
  'default': 'https://www.youtube.com/embed/j7rKKpwdXNE',
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
  g2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px' },
  metric: (c) => ({ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${c}` }),
  badge: (c, bg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', color: c, background: bg }),
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  av: (bg) => ({ width: '36px', height: '36px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }),
  prog: { height: '8px', background: '#f0f0f0', borderRadius: '99px', overflow: 'hidden', marginTop: '6px' },
  btn: (bg, c) => ({ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: bg, color: c || 'white' }),
  inp: { width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  lbl: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  fr: { marginBottom: '14px' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  mbox: { background: 'white', borderRadius: '16px', padding: '28px', width: '520px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
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
  return <div style={{ textAlign: 'center', padding: '40px', color: '#667eea' }}>⏳ Chargement...</div>;
}

function ErrBox({ msg }) {
  return msg ? <div style={{ padding: '10px', background: '#fed7d7', color: '#c53030', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>{msg}</div> : null;
}

// ============ NAVBAR ============
function Navbar({ user, onLogout }) {
  const loc = useLocation();
  const isPatient = user?.role === 'patient';
  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/parcours', label: 'Parcours', icon: '📋', hideFor: ['patient'] },
    { path: '/questionnaires', label: 'Questionnaires', icon: '📝' },
    { path: '/exercices', label: 'Exercices', icon: '💪' },
    { path: '/alertes', label: 'Alertes', icon: '🚨', hideFor: ['patient'] },
    { path: '/coordination', label: 'Coordination', icon: '👥', hideFor: ['patient'] },
  ].filter(l => !l.hideFor?.includes(user?.role));

  const roleIcons = { patient: '🤒', chirurgien: '👨‍⚕️', kinesitherapeute: '🏃', infirmier: '👩‍⚕️', coordinateur: '📋' };

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
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{user?.role}</div>
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
    if (user) { localStorage.setItem('currentUser', JSON.stringify(user)); onLogin(user); navigate('/dashboard'); }
    else setErr('Email ou mot de passe incorrect');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const users = getUsers();
    if (users.find(u => u.email === form.email)) { setErr('Email déjà utilisé'); return; }
    const newUser = { id: Date.now().toString(), email: form.email, password: form.password, nom: form.nom, prenom: form.prenom, role: form.role, createdAt: new Date().toISOString() };
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
              style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', background: mode === m ? 'white' : 'transparent', color: mode === m ? '#667eea' : '#888', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
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
                {ROLES.map(r => <option key={r} value={r}>{r === 'patient' ? '🤒 Patient' : r === 'chirurgien' ? '👨‍⚕️ Chirurgien / Médecin' : r === 'kinesitherapeute' ? '🏃 Kinésithérapeute' : r === 'infirmier' ? '👩‍⚕️ Infirmier(e) de suivi' : '📋 Coordinateur de parcours'}</option>)}
              </select>
            </div>
            <button type="submit" style={{ ...S.btn('linear-gradient(135deg,#48bb78,#38a169)'), width: '100%', padding: '13px', fontSize: '15px' }}>✓ Créer mon compte</button>
          </form>
        )}

        <div style={{ marginTop: '20px', padding: '14px', background: '#f7f7fa', borderRadius: '8px', fontSize: '12px', color: '#888' }}>
          <strong style={{ color: '#555' }}>Comptes de test :</strong> Inscrivez-vous avec le rôle de votre choix pour tester l'application.
        </div>
      </div>
    </div>
  );
}

// ============ DASHBOARD ============
function PageDashboard({ user }) {
  const [stats, setStats] = useState({ plans: 0, questionnaires: 0, alertes: 0, exercices: 0 });
  const [alertes, setAlertes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const isPatient = user?.role === 'patient';

  if (loading) return <div style={S.page}><Spinner /></div>;

  return (
    <div style={S.page}>
      <h1 style={S.h1}>📊 Tableau de bord</h1>
      <p style={S.sub}>Bienvenue {user?.prenom} {user?.nom} ({user?.role}) — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div style={S.g4}>
        <div style={S.metric('#e53e3e')}><div style={{ fontSize: '28px' }}>🚨</div><div style={{ fontSize: '32px', fontWeight: '700', color: '#e53e3e' }}>{stats.alertes}</div><div style={{ fontSize: '13px', color: '#666' }}>Alertes actives</div></div>
        <div style={S.metric('#667eea')}><div style={{ fontSize: '28px' }}>📋</div><div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.plans}</div><div style={{ fontSize: '13px', color: '#666' }}>Parcours créés</div></div>
        <div style={S.metric('#48bb78')}><div style={{ fontSize: '28px' }}>💪</div><div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.exercices}</div><div style={{ fontSize: '13px', color: '#666' }}>Exercices disponibles</div></div>
        <div style={S.metric('#ed8936')}><div style={{ fontSize: '28px' }}>👥</div><div style={{ fontSize: '32px', fontWeight: '700' }}>{getUsers().length}</div><div style={{ fontSize: '13px', color: '#666' }}>Utilisateurs inscrits</div></div>
      </div>

      <div style={S.g2}>
        <div style={S.card}>
          <h3 style={{ marginBottom: '16px' }}>🚨 Alertes récentes</h3>
          {alertes.length === 0 && <div style={{ color: '#48bb78', textAlign: 'center', padding: '20px' }}>✅ Aucune alerte active</div>}
          {alertes.map((a, i) => (
            <div key={a.id} style={S.row}>
              <span style={{ fontSize: '22px' }}>{a.severity === 'CRITICAL' ? '🔴' : '🟡'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{a.title || a.type}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{a.message}</div>
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
                <div style={{ fontSize: '12px', color: '#888' }}>{p.duration} jours · Patient: {p.patientId?.slice(0, 8)}</div>
              </div>
              <span style={S.badge('#276749', '#c6f6d5')}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ PARCOURS ============
function PageParcours({ user }) {
  const [templates, setTemplates] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ patientId: '', templateId: '', age: '', physicalCondition: 'normal', comorbidities: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
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
      } catch (e) { setErr('Erreur chargement'); }
      setLoading(false);
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API.recovery}/api/recovery-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: form.patientId, templateId: form.templateId, age: parseInt(form.age), physicalCondition: form.physicalCondition, comorbidities: form.comorbidities })
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
      <p style={S.sub}>Service: recovery-plan-service · Parcours personnalisés selon âge, comorbidités, condition physique</p>

      {msg && <div style={{ padding: '12px', background: '#c6f6d5', color: '#276749', borderRadius: '8px', marginBottom: '16px', fontWeight: '600' }}>{msg}</div>}
      <ErrBox msg={err} />

      {showForm && (
        <Modal title="➕ Créer un parcours personnalisé" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate}>
            <div style={S.fr}><label style={S.lbl}>ID Patient *</label><input style={S.inp} required value={form.patientId} onChange={f('patientId')} placeholder="ex: patient-001 ou nom du patient" /></div>
            <div style={S.fr}><label style={S.lbl}>Type de parcours *</label>
              <select style={S.inp} required value={form.templateId} onChange={f('templateId')}>
                <option value="">Sélectionner un parcours...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.baseDuration} jours)</option>)}
              </select>
            </div>
            <div style={S.fr}><label style={S.lbl}>Âge du patient *</label><input style={S.inp} type="number" required min="1" max="120" value={form.age} onChange={f('age')} placeholder="ex: 65" /></div>
            <div style={S.fr}><label style={S.lbl}>Condition physique</label>
              <select style={S.inp} value={form.physicalCondition} onChange={f('physicalCondition')}>
                <option value="sedentary">Sédentaire</option>
                <option value="normal">Normale</option>
                <option value="athletic">Sportif / Athlétique</option>
              </select>
            </div>
            <div style={S.fr}><label style={S.lbl}>Comorbidités</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {['diabetes', 'obesity', 'heart-disease'].map(c => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.comorbidities.includes(c)}
                      onChange={() => setForm({ ...form, comorbidities: form.comorbidities.includes(c) ? form.comorbidities.filter(x => x !== c) : [...form.comorbidities, c] })} />
                    {c === 'diabetes' ? 'Diabète' : c === 'obesity' ? 'Obésité' : 'Maladie cardiaque'}
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
          <div style={{ marginBottom: '16px' }}>
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
          </div>
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
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>Cliquer pour voir les phases détaillées →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ QUESTIONNAIRES ============
function PageQuestionnaires({ user }) {
  const [templates, setTemplates] = useState([]);
  const [sent, setSent] = useState([]);
  const [showSend, setShowSend] = useState(false);
  const [showFill, setShowFill] = useState(null);
  const [answers, setAnswers] = useState({});
  const [form, setForm] = useState({ patientId: '', templateId: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const myId = user?.id;

  useEffect(() => {
    const load = async () => {
      try {
        const tRes = await fetch(`${API.questionnaire}/api/questionnaire/templates`).then(r => r.json());
        setTemplates(tRes.questionnaireTemplates || []);
        if (user?.role === 'patient') {
          const qRes = await fetch(`${API.questionnaire}/api/questionnaire/patient/${myId}`).then(r => r.json());
          setSent(qRes.patientQuestionnaires || []);
        }
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
      if (data.success) { setMsg('✅ Questionnaire envoyé !'); setShowSend(false); setTimeout(() => setMsg(''), 3000); }
      else setErr(data.message);
    } catch { setErr('Erreur de connexion'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ansArray = showFill.questions.map((q, i) => ({ questionId: q.id, value: answers[i] || '' }));
    try {
      const res = await fetch(`${API.questionnaire}/api/questionnaire/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaireId: showFill.id, patientId: myId, answers: ansArray })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ Questionnaire soumis ! ${data.responseData.anomaliesDetected > 0 ? '⚠️ ' + data.responseData.anomaliesDetected + ' alerte(s) détectée(s) !' : ''}`);
        setSent(sent.map(q => q.id === showFill.id ? { ...q, status: 'completed' } : q));
        setShowFill(null); setAnswers({});
        setTimeout(() => setMsg(''), 5000);
      }
    } catch { setErr('Erreur soumission'); }
  };

  if (loading) return <div style={S.page}><Spinner /></div>;

  const isPatient = user?.role === 'patient';

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>📝 Questionnaires de suivi</h1>
        {!isPatient && <button onClick={() => setShowSend(true)} style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>+ Envoyer un questionnaire</button>}
      </div>
      <p style={S.sub}>Service: questionnaire-service · Modèles validés médicalement — détection automatique d'anomalies</p>

      {msg && <div style={{ padding: '12px', background: msg.includes('⚠️') ? '#feebc8' : '#c6f6d5', color: msg.includes('⚠️') ? '#c05621' : '#276749', borderRadius: '8px', marginBottom: '16px', fontWeight: '600' }}>{msg}</div>}
      <ErrBox msg={err} />

      {showSend && (
        <Modal title="📤 Envoyer un questionnaire" onClose={() => setShowSend(false)}>
          <form onSubmit={handleSend}>
            <div style={S.fr}><label style={S.lbl}>ID Patient *</label><input style={S.inp} required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} placeholder="ID du patient" /></div>
            <div style={S.fr}><label style={S.lbl}>Modèle de questionnaire *</label>
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

      {showFill && (
        <Modal title={`📝 ${showFill.templateName}`} onClose={() => setShowFill(null)}>
          <form onSubmit={handleSubmit}>
            {showFill.questions?.map((q, i) => (
              <div key={q.id} style={{ ...S.fr, padding: '12px', background: '#f7f7fa', borderRadius: '8px' }}>
                <label style={{ ...S.lbl, color: '#333' }}>{i + 1}. {q.text}</label>
                {q.type === 'scale' && (
                  <div>
                    <input type="range" min={q.min} max={q.max} value={answers[i] || q.min} onChange={e => setAnswers({ ...answers, [i]: parseInt(e.target.value) })} style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
                      <span>{q.min} (aucune)</span><strong style={{ color: '#667eea' }}>{answers[i] || q.min}/{q.max}</strong><span>{q.max} (max)</span>
                    </div>
                  </div>
                )}
                {q.type === 'number' && <input style={S.inp} type="number" step="0.1" value={answers[i] || ''} onChange={e => setAnswers({ ...answers, [i]: parseFloat(e.target.value) })} placeholder={q.unit ? `en ${q.unit}` : ''} />}
                {q.type === 'boolean' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['Oui', 'Non'].map(v => (
                      <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                        <input type="radio" name={`q${i}`} value={v} checked={answers[i] === (v === 'Oui')} onChange={() => setAnswers({ ...answers, [i]: v === 'Oui' })} /> {v}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'choice' && (
                  <select style={S.inp} value={answers[i] || ''} onChange={e => setAnswers({ ...answers, [i]: e.target.value })}>
                    <option value="">Sélectionner...</option>
                    {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {q.alertThreshold && answers[i] > q.alertThreshold && (
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#c53030', fontWeight: '600' }}>⚠️ Valeur au-dessus du seuil d'alerte ({q.alertThreshold})</div>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button type="submit" style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>✓ Soumettre les réponses</button>
              <button type="button" onClick={() => setShowFill(null)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
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
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>{t.questions?.length} questions</div>
            {t.questions?.map((q, j) => (
              <div key={q.id} style={{ fontSize: '12px', color: '#555', padding: '6px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: C(j), fontWeight: '700', flexShrink: 0 }}>{j + 1}.</span>
                <span>{q.text}</span>
                {q.alertThreshold && <span style={{ color: '#e53e3e', fontSize: '10px', marginLeft: 'auto', flexShrink: 0 }}>⚠️ seuil: {q.alertThreshold}</span>}
              </div>
            ))}
            {isPatient && sent.filter(s => s.templateId === t.id && s.status === 'sent').length > 0 && (
              <button onClick={() => setShowFill(sent.find(s => s.templateId === t.id && s.status === 'sent'))}
                style={{ ...S.btn('linear-gradient(135deg,#48bb78,#38a169)'), marginTop: '12px', width: '100%' }}>
                📝 Remplir ce questionnaire
              </button>
            )}
          </div>
        ))}
      </div>

      {isPatient && (
        <>
          <h3 style={{ marginBottom: '12px', marginTop: '8px' }}>📋 Mes questionnaires ({sent.length})</h3>
          {sent.length === 0 && <div style={{ ...S.card, textAlign: 'center', color: '#aaa', padding: '40px' }}>Aucun questionnaire reçu pour le moment</div>}
          {sent.map((q, i) => (
            <div key={q.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600' }}>{q.templateName}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Envoyé le {new Date(q.sentAt).toLocaleDateString('fr-FR')}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={S.badge(q.status === 'completed' ? '#276749' : '#c05621', q.status === 'completed' ? '#c6f6d5' : '#feebc8')}>{q.status}</span>
                {q.status === 'sent' && <button onClick={() => setShowFill(q)} style={S.btn('#667eea')}>Remplir</button>}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ============ EXERCICES ============
function PageExercices({ user }) {
  const [library, setLibrary] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [videoModal, setVideoModal] = useState(null);
  const [form, setForm] = useState({ patientId: '', exerciseIds: [] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const isPatient = user?.role === 'patient';

  useEffect(() => {
    const load = async () => {
      try {
        const lRes = await fetch(`${API.exercise}/api/exercise/library`).then(r => r.json());
        setLibrary(lRes.exercises || []);
        if (isPatient) {
          const pRes = await fetch(`${API.exercise}/api/exercise/session/patient/${user.id}`).then(r => r.json());
          setPlans(pRes.sessions || []);
        }
      } catch { setErr('Erreur chargement'); }
      setLoading(false);
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API.exercise}/api/exercise/plan/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: form.patientId, exerciseIds: form.exerciseIds })
      });
      const data = await res.json();
      if (data.success) { setMsg('✅ Plan d\'exercices créé !'); setShowCreate(false); setTimeout(() => setMsg(''), 3000); }
      else setErr(data.message);
    } catch { setErr('Erreur connexion'); }
  };

  if (loading) return <div style={S.page}><Spinner /></div>;

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>💪 Exercices guidés</h1>
        {!isPatient && <button onClick={() => setShowCreate(true)} style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>+ Créer un plan d'exercices</button>}
      </div>
      <p style={S.sub}>Service: exercise-guidance-service · Bibliothèque d'exercices avec vidéos guidées</p>

      {msg && <div style={{ padding: '12px', background: '#c6f6d5', color: '#276749', borderRadius: '8px', marginBottom: '16px', fontWeight: '600' }}>{msg}</div>}
      <ErrBox msg={err} />

      {showCreate && (
        <Modal title="➕ Créer un plan d'exercices" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div style={S.fr}><label style={S.lbl}>ID Patient *</label><input style={S.inp} required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} placeholder="ID du patient" /></div>
            <div style={S.fr}>
              <label style={S.lbl}>Sélectionner les exercices *</label>
              {library.map(ex => (
                <label key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', marginBottom: '6px', background: '#f7f7fa', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.exerciseIds.includes(ex.id)}
                    onChange={() => setForm({ ...form, exerciseIds: form.exerciseIds.includes(ex.id) ? form.exerciseIds.filter(id => id !== ex.id) : [...form.exerciseIds, ex.id] })} />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{ex.name}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{ex.category} · {ex.repetitions} rép × {ex.sets} séries · {ex.duration} min</div>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>✓ Créer le plan</button>
              <button type="button" onClick={() => setShowCreate(false)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      {videoModal && (
        <Modal title={`▶️ ${videoModal.name}`} onClose={() => setVideoModal(null)}>
          <iframe width="100%" height="300" src={VIDEOS[videoModal.category] || VIDEOS.default}
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
        {library.map((ex, i) => (
          <div key={ex.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '15px' }}>{ex.name}</h3>
              <span style={S.badge('#2b6cb0', '#bee3f8')}>{ex.category}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              🔁 {ex.repetitions} rép × {ex.sets} séries &nbsp;&nbsp; ⏱️ {ex.duration} min
            </div>
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}>{ex.description}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#888' }}>Difficulté</span>
              <span style={S.badge(ex.difficulty === 'beginner' ? '#276749' : ex.difficulty === 'intermediate' ? '#c05621' : '#c53030', ex.difficulty === 'beginner' ? '#c6f6d5' : ex.difficulty === 'intermediate' ? '#feebc8' : '#fed7d7')}>{ex.difficulty}</span>
            </div>
            <button onClick={() => setVideoModal(ex)}
              style={{ marginTop: '12px', width: '100%', padding: '10px', background: '#f0f4ff', border: '1px solid #c3cffe', borderRadius: '8px', fontSize: '13px', color: '#667eea', cursor: 'pointer', fontWeight: '600' }}>
              ▶️ Voir la vidéo guidée + Instructions
            </button>
          </div>
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
      <p style={S.sub}>Service: complication-alert-service · Douleur, fièvre, saignement — détection automatique via questionnaires</p>

      {msg && <div style={{ padding: '12px', background: '#c6f6d5', color: '#276749', borderRadius: '8px', marginBottom: '16px', fontWeight: '600' }}>{msg}</div>}
      <ErrBox msg={err} />

      {showForm && (
        <Modal title="⚠️ Signaler une complication" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate}>
            <div style={S.fr}><label style={S.lbl}>ID Patient *</label><input style={S.inp} required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} placeholder="ID du patient" /></div>
            <div style={S.fr}><label style={S.lbl}>Source</label>
              <select style={S.inp} value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                <option value="manual">Signalement manuel</option>
                <option value="questionnaire">Questionnaire</option>
                <option value="exercise">Session d'exercice</option>
              </select>
            </div>
            <div style={S.fr}>
              <label style={S.lbl}>Anomalie détectée *</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
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
                <input style={{ ...S.inp, flex: 1 }} type="number" placeholder="Valeur" value={form.anomalies[0].value} onChange={e => setForm({ ...form, anomalies: [{ ...form.anomalies[0], value: parseFloat(e.target.value) }] })} />
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
  const myId = user?.id;

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
    const res = await fetch(`${API.coordination}/api/carenote/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: form.patientId || myId, content: form.content }) });
    const data = await res.json();
    if (data.success) { setNotes([...notes, data.note]); setMsg('✅ Note ajoutée !'); setShowForm(false); setTimeout(() => setMsg(''), 3000); }
  };

  const handleMed = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API.coordination}/api/medication/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: form.patientId || myId, medicationName: form.medicationName }) });
    const data = await res.json();
    if (data.success) { setMeds([...meds, data.medication]); setMsg('✅ Médicament ajouté !'); setShowForm(false); setTimeout(() => setMsg(''), 3000); }
  };

  const handleAppt = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API.coordination}/api/appointment/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: form.patientId || myId, doctorId: 'doc-001', doctorName: form.doctorName, appointmentType: form.appointmentType, scheduledDate: form.scheduledDate }) });
    const data = await res.json();
    if (data.success) { setAppointments([...appointments, data.appointment]); setMsg('✅ Rendez-vous créé !'); setShowForm(false); setTimeout(() => setMsg(''), 3000); }
  };

  const tabs = [{ id: 'notes', label: '📝 Notes de soin' }, { id: 'meds', label: '💊 Médicaments' }, { id: 'appts', label: '📅 Rendez-vous' }];

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>👥 Coordination de soins</h1>
        <button onClick={() => setShowForm(true)} style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>+ Ajouter</button>
      </div>
      <p style={S.sub}>Service: care-coordination-service · Notes, médicaments, rendez-vous</p>

      {msg && <div style={{ padding: '12px', background: '#c6f6d5', color: '#276749', borderRadius: '8px', marginBottom: '16px', fontWeight: '600' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f7f7fa', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', background: tab === t.id ? 'white' : 'transparent', color: tab === t.id ? '#667eea' : '#888', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {showForm && (
        <Modal title={tab === 'notes' ? '📝 Ajouter une note' : tab === 'meds' ? '💊 Ajouter un médicament' : '📅 Créer un rendez-vous'} onClose={() => setShowForm(false)}>
          <form onSubmit={tab === 'notes' ? handleNote : tab === 'meds' ? handleMed : handleAppt}>
            <div style={S.fr}><label style={S.lbl}>ID Patient *</label><input style={S.inp} required value={form.patientId || ''} onChange={e => setForm({ ...form, patientId: e.target.value })} placeholder="ID du patient" /></div>
            {tab === 'notes' && <div style={S.fr}><label style={S.lbl}>Contenu de la note *</label><textarea style={{ ...S.inp, height: '100px', resize: 'vertical' }} required value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Observations cliniques..." /></div>}
            {tab === 'meds' && <div style={S.fr}><label style={S.lbl}>Médicament *</label><input style={S.inp} required value={form.medicationName || ''} onChange={e => setForm({ ...form, medicationName: e.target.value })} placeholder="ex: Paracétamol 1g" /></div>}
            {tab === 'appts' && <>
              <div style={S.fr}><label style={S.lbl}>Médecin *</label><input style={S.inp} required value={form.doctorName || ''} onChange={e => setForm({ ...form, doctorName: e.target.value })} placeholder="Nom du médecin" /></div>
              <div style={S.fr}><label style={S.lbl}>Type de rendez-vous *</label>
                <select style={S.inp} required value={form.appointmentType || ''} onChange={e => setForm({ ...form, appointmentType: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  <option>Consultation de suivi</option><option>Rééducation</option><option>Contrôle radiologique</option><option>Bilan sanguin</option>
                </select>
              </div>
              <div style={S.fr}><label style={S.lbl}>Date *</label><input style={S.inp} type="datetime-local" required value={form.scheduledDate || ''} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} /></div>
            </>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={S.btn('linear-gradient(135deg,#667eea,#764ba2)')}>✓ Enregistrer</button>
              <button type="button" onClick={() => setShowForm(false)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
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
                  <div style={{ fontSize: '14px', color: '#333' }}>{n.content}</div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>{new Date(n.createdAt).toLocaleString('fr-FR')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'meds' && (
        <div>
          {meds.length === 0 && <div style={{ ...S.card, textAlign: 'center', color: '#aaa', padding: '40px' }}>Aucun médicament — cliquez sur "+ Ajouter"</div>}
          {meds.map((m, i) => (
            <div key={m.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '24px' }}>💊</span>
                <div>
                  <div style={{ fontWeight: '600' }}>{m.medicationName}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Patient: {m.patientId} · {new Date(m.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
              <span style={S.badge(m.status === 'active' ? '#276749' : '#888', m.status === 'active' ? '#c6f6d5' : '#eee')}>{m.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'appts' && (
        <div>
          {appointments.length === 0 && <div style={{ ...S.card, textAlign: 'center', color: '#aaa', padding: '40px' }}>Aucun rendez-vous — cliquez sur "+ Ajouter"</div>}
          {appointments.map((a, i) => (
            <div key={a.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '24px' }}>📅</span>
                <div>
                  <div style={{ fontWeight: '600' }}>{a.appointmentType}</div>
                  <div style={{ fontSize: '13px', color: '#555' }}>Dr. {a.doctorName}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{new Date(a.scheduledDate).toLocaleString('fr-FR')}</div>
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

// ============ APP ============
export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('currentUser')); } catch { return null; } });
  const handleLogout = () => { localStorage.removeItem('currentUser'); setUser(null); };

  function Layout({ children }) {
    return <div style={{ minHeight: '100vh', background: '#f4f6fb' }}><Navbar user={user} onLogout={handleLogout} />{children}</div>;
  }
  function PR({ children }) {
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <PageLogin onLogin={setUser} />} />
        <Route path="/dashboard" element={<PR><PageDashboard user={user} /></PR>} />
        <Route path="/parcours" element={<PR><PageParcours user={user} /></PR>} />
        <Route path="/questionnaires" element={<PR><PageQuestionnaires user={user} /></PR>} />
        <Route path="/exercices" element={<PR><PageExercices user={user} /></PR>} />
        <Route path="/alertes" element={<PR><PageAlertes user={user} /></PR>} />
        <Route path="/coordination" element={<PR><PageCoordination user={user} /></PR>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';

const USERS = [
  { id: 1, email: 'admin@physiotrack.com', password: 'admin123', role: 'admin', first_name: 'Dr', last_name: 'Martin' },
  { id: 2, email: 'physio@physiotrack.com', password: 'physio123', role: 'physiotherapist', first_name: 'Karine', last_name: 'Benali' },
  { id: 3, email: 'patient@physiotrack.com', password: 'patient123', role: 'patient', first_name: 'Marie', last_name: 'Moreau' },
];

const COLORS = ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#9f7aea', '#38b2ac'];
const avatarColor = (i) => COLORS[i % COLORS.length];

const S = {
  nav: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  navLink: (active) => ({ color: 'white', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: active ? '600' : '400', background: active ? 'rgba(255,255,255,0.25)' : 'transparent', display: 'inline-flex', alignItems: 'center', gap: '6px' }),
  page: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  h1: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  sub: { fontSize: '13px', color: '#888', marginBottom: '24px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px' },
  metric: (color) => ({ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }),
  badge: (color, bg) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', color, background: bg }),
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  avatar: (bg) => ({ width: '36px', height: '36px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }),
  progress: { height: '8px', background: '#f0f0f0', borderRadius: '99px', overflow: 'hidden', marginTop: '6px' },
  btn: (bg, color) => ({ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: bg, color: color || 'white' }),
  input: { width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  formRow: { marginBottom: '14px' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: 'white', borderRadius: '16px', padding: '28px', width: '500px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
};

function Modal({ title, onClose, children }) {
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', color: '#1a1a2e' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
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
          <Link key={path} to={path} style={S.navLink(location.pathname === path)}>{icon} {label}</Link>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'white', fontSize: '13px' }}>👤 {user?.first_name} {user?.last_name}</span>
        <button onClick={onLogout} style={S.btn('rgba(255,255,255,0.2)')}>Déconnexion</button>
      </div>
    </nav>
  );
}

// ===== DASHBOARD =====
function PageDashboard({ patients, alertes, parcours, questionnaires }) {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>📊 Tableau de bord</h1>
      <p style={S.sub}>Vue d'ensemble — {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <div style={S.grid4}>
        {[
          { label: 'Patients actifs', value: patients.length, color: '#667eea', icon: '👤' },
          { label: 'Alertes actives', value: alertes.length, color: '#e53e3e', icon: '🚨' },
          { label: 'Questionnaires', value: questionnaires.length, color: '#ed8936', icon: '📝' },
          { label: 'Parcours actifs', value: parcours.length, color: '#48bb78', icon: '📋' },
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
          <h3 style={{ marginBottom: '16px' }}>👥 Patients</h3>
          {patients.slice(0, 5).map((p, i) => (
            <div key={p.id} style={S.row}>
              <div style={S.avatar(avatarColor(i))}>{p.nom.split(' ').map(n => n[0]).join('')}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.nom}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{p.intervention} · J+{p.joursPostOp}</div>
                <div style={S.progress}><div style={{ height: '100%', width: `${p.progression}%`, background: avatarColor(i), borderRadius: '99px' }} /></div>
              </div>
              <span style={S.badge(p.statut === 'stable' ? '#276749' : p.statut === 'critique' ? '#c53030' : '#c05621', p.statut === 'stable' ? '#c6f6d5' : p.statut === 'critique' ? '#fed7d7' : '#feebc8')}>{p.statut}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ marginBottom: '16px' }}>🚨 Alertes récentes</h3>
          {alertes.slice(0, 5).map((a, i) => (
            <div key={a.id} style={S.row}>
              <span style={{ fontSize: '24px' }}>{a.niveau === 'critique' ? '🔴' : '🟡'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{a.patient} — {a.type}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{a.description}</div>
              </div>
            </div>
          ))}
          {alertes.length === 0 && <div style={{ textAlign: 'center', color: '#48bb78', padding: '20px' }}>✅ Aucune alerte</div>}
        </div>
      </div>
    </div>
  );
}

// ===== PATIENTS / PARCOURS =====
function PageParcours({ parcours, setParcours, patients }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: '', duree: '', intervention: '', phases: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    const nouveau = {
      id: Date.now(),
      type: form.type,
      duree: form.duree,
      patients: 0,
      progression: 0,
      intervention: form.intervention,
      phases: form.phases.split(',').map(p => p.trim()).filter(Boolean),
    };
    setParcours([...parcours, nouveau]);
    setShowForm(false);
    setForm({ type: '', duree: '', intervention: '', phases: '' });
  };

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>📋 Parcours de récupération</h1>
        <button onClick={() => setShowForm(true)} style={S.btn('linear-gradient(135deg, #667eea, #764ba2)')}>+ Nouveau parcours</button>
      </div>
      <p style={S.sub}>Service: recovery-plan-service · Bibliothèque de parcours post-op types</p>

      {showForm && (
        <Modal title="Créer un parcours post-op" onClose={() => setShowForm(false)}>
          <form onSubmit={handleAdd}>
            <div style={S.formRow}><label style={S.label}>Type de chirurgie *</label><input style={S.input} required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="ex: Orthopédie — Genou" /></div>
            <div style={S.formRow}><label style={S.label}>Durée du parcours *</label><input style={S.input} required value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} placeholder="ex: 6 semaines" /></div>
            <div style={S.formRow}><label style={S.label}>Type d'intervention *</label>
              <select style={S.input} value={form.intervention} onChange={e => setForm({ ...form, intervention: e.target.value })}>
                <option value="">Sélectionner...</option>
                <option>Orthopédie</option><option>Cardiaque</option><option>Neurochirurgie</option><option>Digestif</option><option>Urologie</option>
              </select>
            </div>
            <div style={S.formRow}><label style={S.label}>Phases (séparées par virgule) *</label><input style={S.input} required value={form.phases} onChange={e => setForm({ ...form, phases: e.target.value })} placeholder="ex: Repos, Mobilisation, Renforcement" /></div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button type="submit" style={S.btn('linear-gradient(135deg, #667eea, #764ba2)')}>✓ Créer le parcours</button>
              <button type="button" onClick={() => setShowForm(false)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={S.grid2}>
        {parcours.map((p, i) => (
          <div key={p.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', color: '#1a1a2e' }}>{p.type}</h3>
              <span style={S.badge('#2b6cb0', '#bee3f8')}>{p.duree}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>{p.patients} patients actifs</div>
            <div style={S.progress}><div style={{ height: '100%', width: `${p.progression}%`, background: avatarColor(i), borderRadius: '99px' }} /></div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>Progression : {p.progression}%</div>
            {p.phases.map((phase, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ ...S.avatar(avatarColor(i)), width: '24px', height: '24px', fontSize: '11px' }}>{j + 1}</div>
                <span style={{ fontSize: '13px', color: '#555' }}>Phase {j + 1} : {phase}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== QUESTIONNAIRES =====
function PageQuestionnaires({ questionnaires, setQuestionnaires, patients }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient: '', type: '', douleur: '', mobilite: '', fievre: '', saignement: 'non', notes: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    const statut = parseInt(form.douleur) >= 7 || form.fievre >= 38.5 || form.saignement === 'oui' ? 'alerte' : 'complété';
    const nouveau = {
      id: Date.now(),
      patient: form.patient,
      type: form.type,
      statut,
      douleur: parseInt(form.douleur),
      mobilite: form.mobilite,
      fievre: form.fievre,
      saignement: form.saignement,
      notes: form.notes,
      date: new Date().toLocaleDateString('fr-FR'),
    };
    setQuestionnaires([...questionnaires, nouveau]);
    setShowForm(false);
    setForm({ patient: '', type: '', douleur: '', mobilite: '', fievre: '', saignement: 'non', notes: '' });
  };

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>📝 Questionnaires de suivi</h1>
        <button onClick={() => setShowForm(true)} style={S.btn('linear-gradient(135deg, #667eea, #764ba2)')}>+ Nouveau questionnaire</button>
      </div>
      <p style={S.sub}>Service: questionnaire-service · Modèles validés médicalement</p>

      {showForm && (
        <Modal title="Remplir un questionnaire de suivi" onClose={() => setShowForm(false)}>
          <form onSubmit={handleAdd}>
            <div style={S.formRow}><label style={S.label}>Patient *</label>
              <select style={S.input} required value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}>
                <option value="">Sélectionner un patient...</option>
                {patients.map(p => <option key={p.id} value={p.nom}>{p.nom}</option>)}
              </select>
            </div>
            <div style={S.formRow}><label style={S.label}>Type de questionnaire *</label>
              <select style={S.input} required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="">Sélectionner...</option>
                <option>Évaluation quotidienne</option>
                <option>Contrôle cardiaque</option>
                <option>Suivi inflammation</option>
                <option>Évaluation neurologique</option>
                <option>Suivi rééducation</option>
              </select>
            </div>
            <div style={S.formRow}>
              <label style={S.label}>Niveau de douleur (0-10) *</label>
              <input style={S.input} type="number" min="0" max="10" required value={form.douleur} onChange={e => setForm({ ...form, douleur: e.target.value })} placeholder="0 = pas de douleur, 10 = insupportable" />
            </div>
            <div style={S.formRow}>
              <label style={S.label}>Température (°C)</label>
              <input style={S.input} type="number" step="0.1" value={form.fievre} onChange={e => setForm({ ...form, fievre: e.target.value })} placeholder="ex: 37.2" />
            </div>
            <div style={S.formRow}>
              <label style={S.label}>Saignement observé ?</label>
              <select style={S.input} value={form.saignement} onChange={e => setForm({ ...form, saignement: e.target.value })}>
                <option value="non">Non</option>
                <option value="leger">Léger</option>
                <option value="oui">Oui (modéré à sévère)</option>
              </select>
            </div>
            <div style={S.formRow}>
              <label style={S.label}>Mobilité / Progression</label>
              <input style={S.input} value={form.mobilite} onChange={e => setForm({ ...form, mobilite: e.target.value })} placeholder="ex: Bonne, marche 10 min sans aide" />
            </div>
            <div style={S.formRow}>
              <label style={S.label}>Notes complémentaires</label>
              <textarea style={{ ...S.input, height: '80px', resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Observations supplémentaires..." />
            </div>
            {form.douleur >= 7 && <div style={{ padding: '10px', background: '#fed7d7', borderRadius: '8px', color: '#c53030', fontSize: '13px', marginBottom: '12px' }}>⚠️ Douleur élevée — une alerte sera générée automatiquement</div>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button type="submit" style={S.btn('linear-gradient(135deg, #667eea, #764ba2)')}>✓ Soumettre</button>
              <button type="button" onClick={() => setShowForm(false)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={S.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              {['Patient', 'Type', 'Douleur', 'Température', 'Saignement', 'Date', 'Statut'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questionnaires.map((q, i) => (
              <tr key={q.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={S.avatar(avatarColor(i))}>{q.patient.split(' ').map(n => n[0]).join('')}</div>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{q.patient}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555' }}>{q.type}</td>
                <td style={{ padding: '12px 16px' }}>
                  {q.douleur !== null && q.douleur !== undefined
                    ? <span style={{ fontWeight: '700', color: q.douleur >= 7 ? '#e53e3e' : q.douleur >= 4 ? '#ed8936' : '#48bb78', fontSize: '16px' }}>{q.douleur}/10</span>
                    : <span style={{ color: '#aaa' }}>—</span>}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>{q.fievre ? `${q.fievre}°C` : '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>{q.saignement || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>{q.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={S.badge(q.statut === 'complété' ? '#276749' : q.statut === 'alerte' ? '#c53030' : '#c05621', q.statut === 'complété' ? '#c6f6d5' : q.statut === 'alerte' ? '#fed7d7' : '#feebc8')}>{q.statut}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {questionnaires.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Aucun questionnaire — cliquez sur "+ Nouveau questionnaire"</div>}
      </div>
    </div>
  );
}

// ===== EXERCICES =====
function PageExercices({ exercices, setExercices }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', categorie: '', repetitions: '', duree: '', description: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    setExercices([...exercices, { id: Date.now(), ...form, taux: 0 }]);
    setShowForm(false);
    setForm({ nom: '', categorie: '', repetitions: '', duree: '', description: '' });
  };

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>💪 Exercices guidés</h1>
        <button onClick={() => setShowForm(true)} style={S.btn('linear-gradient(135deg, #667eea, #764ba2)')}>+ Nouvel exercice</button>
      </div>
      <p style={S.sub}>Service: exercise-guidance-service · Vidéos, textes, progression, validation</p>

      {showForm && (
        <Modal title="Ajouter un exercice guidé" onClose={() => setShowForm(false)}>
          <form onSubmit={handleAdd}>
            <div style={S.formRow}><label style={S.label}>Nom de l'exercice *</label><input style={S.input} required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="ex: Flexion passive genou" /></div>
            <div style={S.formRow}><label style={S.label}>Catégorie *</label>
              <select style={S.input} required value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                <option value="">Sélectionner...</option>
                <option>Orthopédie</option><option>Cardiaque</option><option>Neurochirurgie</option><option>Respiratoire</option><option>Général</option>
              </select>
            </div>
            <div style={S.formRow}><label style={S.label}>Répétitions / Séries</label><input style={S.input} value={form.repetitions} onChange={e => setForm({ ...form, repetitions: e.target.value })} placeholder="ex: 10 rép × 3 séries" /></div>
            <div style={S.formRow}><label style={S.label}>Durée</label><input style={S.input} value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} placeholder="ex: 15 min" /></div>
            <div style={S.formRow}><label style={S.label}>Description / Instructions</label><textarea style={{ ...S.input, height: '100px', resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Décrivez l'exercice étape par étape..." /></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={S.btn('linear-gradient(135deg, #667eea, #764ba2)')}>✓ Ajouter</button>
              <button type="button" onClick={() => setShowForm(false)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={S.grid2}>
        {exercices.map((e, i) => (
          <div key={e.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', color: '#1a1a2e' }}>{e.nom}</h3>
              <span style={S.badge('#2b6cb0', '#bee3f8')}>{e.categorie}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>🔁 {e.repetitions} &nbsp;&nbsp; ⏱️ {e.duree}</div>
            {e.description && <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', padding: '8px', background: '#f7f7fa', borderRadius: '6px' }}>{e.description}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
              <span>Taux de complétion</span>
              <span style={{ fontWeight: '700', color: e.taux >= 80 ? '#48bb78' : e.taux >= 50 ? '#ed8936' : '#667eea' }}>{e.taux}%</span>
            </div>
            <div style={S.progress}><div style={{ height: '100%', width: `${e.taux}%`, background: e.taux >= 80 ? '#48bb78' : '#667eea', borderRadius: '99px' }} /></div>
            <div style={{ marginTop: '12px', padding: '10px', background: '#f0f4ff', borderRadius: '8px', fontSize: '12px', color: '#667eea', cursor: 'pointer', textAlign: 'center' }}>▶️ Voir la vidéo guidée</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== ALERTES =====
function PageAlertes({ alertes, setAlertes, patients }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient: '', type: '', niveau: 'modere', description: '', douleur: '', temperature: '', saignement: 'non' });

  const handleAdd = (e) => {
    e.preventDefault();
    const nouvelle = {
      id: Date.now(),
      patient: form.patient,
      type: form.type,
      niveau: form.niveau,
      description: form.description,
      douleur: form.douleur,
      temperature: form.temperature,
      saignement: form.saignement,
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setAlertes([...alertes, nouvelle]);
    setShowForm(false);
    setForm({ patient: '', type: '', niveau: 'modere', description: '', douleur: '', temperature: '', saignement: 'non' });
  };

  const traiter = (id) => setAlertes(alertes.filter(a => a.id !== id));

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={S.h1}>🚨 Détection des complications</h1>
        <button onClick={() => setShowForm(true)} style={S.btn('#e53e3e')}>+ Signaler une complication</button>
      </div>
      <p style={S.sub}>Service: complication-alert-service · Douleur, fièvre, saignement</p>

      {showForm && (
        <Modal title="Signaler une complication" onClose={() => setShowForm(false)}>
          <form onSubmit={handleAdd}>
            <div style={S.formRow}><label style={S.label}>Patient *</label>
              <select style={S.input} required value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}>
                <option value="">Sélectionner un patient...</option>
                {patients.map(p => <option key={p.id} value={p.nom}>{p.nom}</option>)}
              </select>
            </div>
            <div style={S.formRow}><label style={S.label}>Type de complication *</label>
              <select style={S.input} required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="">Sélectionner...</option>
                <option>Fièvre</option><option>Douleur thoracique</option><option>Saignement</option><option>Infection</option><option>Œdème</option><option>Autre</option>
              </select>
            </div>
            <div style={S.formRow}><label style={S.label}>Niveau de gravité *</label>
              <select style={S.input} value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}>
                <option value="modere">Modéré</option>
                <option value="critique">Critique</option>
              </select>
            </div>
            <div style={S.formRow}><label style={S.label}>Douleur (0-10)</label><input style={S.input} type="number" min="0" max="10" value={form.douleur} onChange={e => setForm({ ...form, douleur: e.target.value })} /></div>
            <div style={S.formRow}><label style={S.label}>Température (°C)</label><input style={S.input} type="number" step="0.1" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} /></div>
            <div style={S.formRow}><label style={S.label}>Saignement</label>
              <select style={S.input} value={form.saignement} onChange={e => setForm({ ...form, saignement: e.target.value })}>
                <option value="non">Non</option><option value="leger">Léger</option><option value="oui">Oui</option>
              </select>
            </div>
            <div style={S.formRow}><label style={S.label}>Description *</label><textarea style={{ ...S.input, height: '80px', resize: 'vertical' }} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Décrivez les symptômes observés..." /></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={S.btn('#e53e3e')}>⚠️ Créer l'alerte</button>
              <button type="button" onClick={() => setShowForm(false)} style={S.btn('#f0f0f0', '#555')}>Annuler</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={S.grid4}>
        {[
          { label: 'Alertes critiques', value: alertes.filter(a => a.niveau === 'critique').length, color: '#e53e3e' },
          { label: 'Alertes modérées', value: alertes.filter(a => a.niveau === 'modere').length, color: '#ed8936' },
          { label: 'Patients surveillés', value: patients.length, color: '#667eea' },
          { label: 'Total alertes', value: alertes.length, color: '#9f7aea' },
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
            <span style={{ fontSize: '32px' }}>{a.niveau === 'critique' ? '🔴' : '🟡'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>{a.patient} — {a.type}</div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{a.description}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                {a.douleur && `Douleur: ${a.douleur}/10`} {a.temperature && `· T°: ${a.temperature}°C`} {a.saignement !== 'non' && `· Saignement: ${a.saignement}`} · {a.heure}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={S.badge(a.niveau === 'critique' ? '#c53030' : '#c05621', a.niveau === 'critique' ? '#fed7d7' : '#feebc8')}>{a.niveau}</span>
              <button onClick={() => traiter(a.id)} style={S.btn('#48bb78')}>✓ Traiter</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== COORDINATION =====
function PageCoordination({ patients }) {
  const [messages, setMessages] = useState([
    { id: 1, de: 'Dr. Martin', a: 'Karine Benali', msg: 'Sophie Chami: suspendre exercices, infection suspectée', heure: '10:25' },
    { id: 2, de: 'Nadia Lahlou', a: 'Dr. Cohen', msg: 'Ahmed Benjelloun: douleur 8/10, consultation urgente', heure: '09:30' },
    { id: 3, de: 'Karine Benali', a: 'Dr. Martin', msg: 'Marie Moreau: excellente progression, phase 3 prête', heure: '08:15' },
  ]);
  const [form, setForm] = useState({ de: '', a: '', msg: '' });
  const equipe = ['Dr. Martin', 'Karine Benali', 'Nadia Lahlou', 'Pierre Rousseau', 'Dr. Cohen'];

  const handleSend = (e) => {
    e.preventDefault();
    setMessages([{ id: Date.now(), ...form, heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }, ...messages]);
    setForm({ de: '', a: '', msg: '' });
  };

  return (
    <div style={S.page}>
      <h1 style={S.h1}>👥 Coordination de l'équipe</h1>
      <p style={S.sub}>Service: care-coordination-service · Synchronisation entre professionnels du suivi</p>
      <div style={S.grid2}>
        <div>
          <div style={S.card}>
            <h3 style={{ marginBottom: '16px' }}>✉️ Envoyer un message</h3>
            <form onSubmit={handleSend}>
              <div style={S.formRow}><label style={S.label}>De *</label>
                <select style={S.input} required value={form.de} onChange={e => setForm({ ...form, de: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {equipe.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div style={S.formRow}><label style={S.label}>À *</label>
                <select style={S.input} required value={form.a} onChange={e => setForm({ ...form, a: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {equipe.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div style={S.formRow}><label style={S.label}>Message *</label>
                <textarea style={{ ...S.input, height: '80px', resize: 'vertical' }} required value={form.msg} onChange={e => setForm({ ...form, msg: e.target.value })} placeholder="Votre message..." />
              </div>
              <button type="submit" style={S.btn('linear-gradient(135deg, #667eea, #764ba2)')}>📤 Envoyer</button>
            </form>
          </div>

          <div style={S.card}>
            <h3 style={{ marginBottom: '16px' }}>👨‍⚕️ Équipe soignante</h3>
            {[
              { nom: 'Dr. Martin', role: 'Chirurgien orthopédique' },
              { nom: 'Karine Benali', role: 'Kinésithérapeute' },
              { nom: 'Nadia Lahlou', role: 'Infirmière de suivi' },
              { nom: 'Pierre Rousseau', role: 'Coordinateur de parcours' },
              { nom: 'Dr. Cohen', role: 'Cardiologue' },
            ].map((e, i) => (
              <div key={i} style={S.row}>
                <div style={S.avatar(avatarColor(i))}>{e.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{e.nom}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{e.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <h3 style={{ marginBottom: '16px' }}>💬 Messages ({messages.length})</h3>
          {messages.map((m, i) => (
            <div key={m.id} style={{ ...S.row, alignItems: 'flex-start' }}>
              <div style={S.avatar(avatarColor(i))}>{m.de.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{m.de} → {m.a}</div>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{m.msg}</div>
              </div>
              <span style={{ fontSize: '11px', color: '#aaa', whiteSpace: 'nowrap' }}>{m.heure}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== LOGIN =====
function PageLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) { localStorage.setItem('user', JSON.stringify(user)); onLogin(user); navigate('/dashboard'); }
    else setError('Email ou mot de passe incorrect');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px' }}>🏥</div>
          <h1 style={{ color: '#667eea', margin: '8px 0 4px' }}>PostOp Care</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Application de suivi post-opératoire</p>
        </div>
        {error && <div style={{ background: '#fed7d7', color: '#c53030', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={S.formRow}><label style={S.label}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={S.input} /></div>
          <div style={{ ...S.formRow, marginBottom: '24px' }}><label style={S.label}>Mot de passe</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={S.input} /></div>
          <button type="submit" style={{ ...S.btn('linear-gradient(135deg, #667eea 0%, #764ba2 100%)'), width: '100%', padding: '14px', fontSize: '15px' }}>Se connecter</button>
        </form>
        <div style={{ marginTop: '24px', padding: '16px', background: '#f7f7fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '8px' }}>Cliquez pour remplir automatiquement :</p>
          {USERS.map(u => (
            <div key={u.id} onClick={() => { setEmail(u.email); setPassword(u.password); }}
              style={{ fontSize: '12px', color: '#667eea', marginBottom: '6px', cursor: 'pointer', padding: '6px', borderRadius: '6px', background: '#f0f4ff' }}>
              <strong>{u.role} :</strong> {u.email}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== APP PRINCIPAL =====
export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });

  const [patients, setPatients] = useState([
    { id: 1, nom: 'Marie Moreau', intervention: 'Orthopédie genou', joursPostOp: 12, progression: 72, statut: 'stable' },
    { id: 2, nom: 'Ahmed Benjelloun', intervention: 'Cardiaque pontage', joursPostOp: 5, progression: 45, statut: 'critique' },
    { id: 3, nom: 'Sophie Chami', intervention: 'Orthopédie hanche', joursPostOp: 21, progression: 61, statut: 'alerte' },
    { id: 4, nom: 'Lucas Tazi', intervention: 'Neurochirurgie', joursPostOp: 3, progression: 28, statut: 'surveillance' },
    { id: 5, nom: 'Fatima Ouali', intervention: 'Orthopédie épaule', joursPostOp: 8, progression: 88, statut: 'stable' },
  ]);

  const [alertes, setAlertes] = useState([
    { id: 1, patient: 'Sophie Chami', type: 'Fièvre', niveau: 'critique', description: 'Température 38.9°C — suspicion infection post-op', heure: '10:23' },
    { id: 2, patient: 'Ahmed Benjelloun', type: 'Douleur thoracique', niveau: 'critique', description: 'Douleur 8/10 — FC 105 bpm', heure: '09:15' },
    { id: 3, patient: 'Lucas Tazi', type: 'Saignement', niveau: 'modere', description: 'Saignement modéré — pansement humide', heure: '08:40' },
  ]);

  const [parcours, setParcours] = useState([
    { id: 1, type: 'Orthopédie — Genou', duree: '6 semaines', patients: 8, progression: 72, phases: ['Mobilisation douce', 'Renforcement', 'Autonomie'] },
    { id: 2, type: 'Cardiaque — Pontage', duree: '12 semaines', patients: 5, progression: 45, phases: ['Repos surveillé', 'Réadaptation', 'Retour vie normale'] },
    { id: 3, type: 'Orthopédie — Hanche', duree: '8 semaines', patients: 6, progression: 61, phases: ['Mobilisation', 'Renforcement', 'Marche autonome'] },
    { id: 4, type: 'Neurochirurgie', duree: '10 semaines', patients: 3, progression: 28, phases: ['Repos strict', 'Rééducation', 'Autonomie progressive'] },
    { id: 5, type: 'Orthopédie — Épaule', duree: '6 semaines', patients: 2, progression: 88, phases: ['Immobilisation', 'Mobilisation', 'Renforcement'] },
  ]);

  const [questionnaires, setQuestionnaires] = useState([
    { id: 1, patient: 'Marie Moreau', type: 'Évaluation quotidienne', statut: 'complété', douleur: 3, date: '26/04/2026' },
    { id: 2, patient: 'Ahmed Benjelloun', type: 'Contrôle cardiaque', statut: 'alerte', douleur: 8, date: '26/04/2026' },
    { id: 3, patient: 'Sophie Chami', type: 'Suivi inflammation', statut: 'alerte', douleur: 7, date: '26/04/2026' },
    { id: 4, patient: 'Lucas Tazi', type: 'Évaluation neurologique', statut: 'en_attente', douleur: null, date: '26/04/2026' },
    { id: 5, patient: 'Fatima Ouali', type: 'Suivi rééducation', statut: 'complété', douleur: 2, date: '26/04/2026' },
  ]);

  const [exercices, setExercices] = useState([
    { id: 1, nom: 'Flexion passive genou', categorie: 'Orthopédie', repetitions: '10 rép × 3 séries', duree: '2 min', taux: 87, description: '' },
    { id: 2, nom: 'Marche respiratoire', categorie: 'Cardiaque', repetitions: '15 min', duree: '15 min', taux: 54, description: '' },
    { id: 3, nom: 'Renforcement quadriceps', categorie: 'Orthopédie', repetitions: '15 rép × 3 séries', duree: '3 min', taux: 92, description: '' },
    { id: 4, nom: 'Exercices de sensibilité', categorie: 'Neurochirurgie', repetitions: '5 exercices', duree: '4 min', taux: 38, description: '' },
  ]);

  const handleLogout = () => { localStorage.removeItem('user'); setUser(null); };

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

  const props = { patients, setPatients, alertes, setAlertes, parcours, setParcours, questionnaires, setQuestionnaires, exercices, setExercices };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <PageLogin onLogin={setUser} />} />
        <Route path="/dashboard" element={<PrivateRoute><PageDashboard {...props} /></PrivateRoute>} />
        <Route path="/parcours" element={<PrivateRoute><PageParcours {...props} /></PrivateRoute>} />
        <Route path="/questionnaires" element={<PrivateRoute><PageQuestionnaires {...props} /></PrivateRoute>} />
        <Route path="/exercices" element={<PrivateRoute><PageExercices {...props} /></PrivateRoute>} />
        <Route path="/alertes" element={<PrivateRoute><PageAlertes {...props} /></PrivateRoute>} />
        <Route path="/coordination" element={<PrivateRoute><PageCoordination {...props} /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import '../App.css';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    medical_history: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth
          ? user.date_of_birth.split('T')[0]
          : '',
        gender: user.gender || '',
        medical_history: user.medical_history || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        medical_history: formData.medical_history
      };

      const updatedUser = await userService.updateProfile(updateData);
      updateUser(updatedUser);
      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Erreur lors de la mise à jour du profil'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await userService.changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password
      });

      setSuccess('Mot de passe modifié avec succès');
      setIsChangingPassword(false);

      setFormData((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Erreur lors du changement de mot de passe'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="page-container">
      <h1>Mon Profil</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-card">

        {!isEditing ? (
          <div>
            <h2>
              {user?.first_name} {user?.last_name}
            </h2>
            <p>{user?.email}</p>

            <button onClick={() => setIsEditing(true)}>
              Modifier le profil
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Prénom"
            />

            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Nom"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />

            <button type="submit">
              {loading ? 'Chargement...' : 'Enregistrer'}
            </button>

            <button type="button" onClick={handleCancel}>
              Annuler
            </button>

          </form>
        )}
      </div>

      <div className="profile-card">
        <h3>Sécurité</h3>

        {!isChangingPassword ? (
          <button onClick={() => setIsChangingPassword(true)}>
            Changer mot de passe
          </button>
        ) : (
          <form onSubmit={handlePasswordChange}>

            <input
              type="password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              placeholder="Mot de passe actuel"
            />

            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Nouveau mot de passe"
            />

            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirmer mot de passe"
            />

            <button type="submit">
              Modifier
            </button>

            <button
              type="button"
              onClick={() => setIsChangingPassword(false)}
            >
              Annuler
            </button>

          </form>
        )}

        {!isChangingPassword && (
          <p className="security-info">
            Pour des raisons de sécurité, changez régulièrement votre mot de passe.
          </p>
        )}

      </div>
    </div>
  );
};

export default Profile;
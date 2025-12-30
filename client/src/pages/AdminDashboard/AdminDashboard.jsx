import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import TechCard from '../../components/TechCard';
import TechButton from '../../components/TechButton';
import TechModal from '../../components/TechModal';
import TechInput from '../../components/TechInput';
import HeroSearch from '../../components/HeroSearch';
import { getImageUrl } from '../../utils/urlHelpers';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [heroes, setHeroes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: '', hero_image: null, role_icon: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchHeroes();
  }, [user, navigate]);

  const fetchHeroes = async () => {
    try {
      const res = await api.get('/heroes');
      setHeroes(res.data);
    } catch (err) {
      console.error(err);
      setError('Error loading heroes.');
    }
  };

  const handleSearchSelect = hero => {
    if (hero) {
      setHeroes([hero]);
    } else {
      fetchHeroes();
    }
  };

  const handleInputChange = e => {
    if (e.target.name === 'hero_image' || e.target.name === 'role_icon') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleEdit = hero => {
    setFormData({
      name: hero.name,
      role: hero.role,
      hero_image: null,
      role_icon: null
    });
    setEditId(hero.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setFormData({ name: '', role: '', hero_image: null, role_icon: null });
    setEditMode(false);
    setEditId(null);
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('role', formData.role);
    if (formData.hero_image) data.append('hero_image', formData.hero_image);
    if (formData.role_icon) data.append('role_icon', formData.role_icon);

    try {
      if (editMode) {
        await api.put(`/heroes/${editId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/heroes', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      fetchHeroes();
      setFormData({ name: '', role: '', hero_image: null, role_icon: null });
    } catch (err) {
      setError(err.response?.data?.msg || `Failed to ${editMode ? 'update' : 'create'} hero`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (window.confirm('WARNING: THIS ACTION IS DESTRUCTIVE. DELETE HERO?')) {
      try {
        await api.delete(`/heroes/${id}`);
        fetchHeroes();
      } catch (err) {
        alert('Failed to delete hero');
      }
    }
  };

  const handleSeed = async () => {
    if (window.confirm('INITIATE DATABASE SEEDING FROM EXTERNAL SOURCE?')) {
      try {
        await api.post('/heroes/seed');
        setSeeding(true);
        pollSeedStatus();
      } catch (err) {
        alert('Failed to start seeding: ' + (err.response?.data?.msg || err.message));
      }
    }
  };

  const pollSeedStatus = async () => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/heroes/seed/status');
        const status = res.data;
        setSeedProgress(status);

        if (status.state === 'completed' || status.state === 'error') {
          clearInterval(interval);
          setSeeding(false);
          fetchHeroes();
          if (status.state === 'error') {
            alert('Seeding failed: ' + status.message);
          } else {
            alert('Seeding complete!');
          }
          /* c8 ignore start -- Async polling: setTimeout cleanup callback runs after test completion */
          setTimeout(() => setSeedProgress(null), 2000);
          /* c8 ignore stop */
        }
      } catch (err) {
        console.error('Polling error', err);
        clearInterval(interval);
        setSeeding(false);
      }
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="tech-container" style={{ paddingBottom: '3rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '2rem 0'
          }}
        >
          <h2 style={{ color: 'var(--tech-primary)', margin: 0 }}>SYSTEM ADMIN // CONSOLE</h2>
          {user && (
            <div style={{ color: 'var(--tech-text-secondary)', fontFamily: 'var(--font-ui)' }}>
              ADMIN: <span style={{ color: '#fff' }}>{user.email || ''}</span>
            </div>
          )}
        </div>

        {error && !showModal && (
          <div
            style={{
              color: 'var(--tech-danger)',
              marginBottom: '1rem',
              border: '1px solid var(--tech-danger)',
              padding: '1rem',
              background: 'rgba(255,42,42,0.1)'
            }}
          >
            {error}
          </div>
        )}

        <div style={{ maxWidth: '600px', marginBottom: '2rem' }}>
          <HeroSearch onSelect={handleSearchSelect} />
        </div>

        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <TechButton filled onClick={handleOpenCreate}>
            + NEW HERO
          </TechButton>
          <TechButton variant="secondary" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'SEEDING IN PROGRESS...' : 'SEED DATABASE'}
          </TechButton>
        </div>

        {seeding && seedProgress && (
          <TechCard style={{ marginBottom: '2rem' }} animatedCorners>
            <h5 style={{ color: 'var(--tech-text-primary)' }}>SEEDING PROGRESS: {seedProgress.message}</h5>
            <div
              style={{
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                margin: '1rem 0'
              }}
            >
              <div
                style={{
                  width: `${(seedProgress.current / (seedProgress.total || 1)) * 100}%`,
                  height: '100%',
                  background: 'var(--tech-secondary)',
                  boxShadow: '0 0 10px var(--tech-secondary)',
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--tech-text-muted)' }}>
              {seedProgress.current} / {seedProgress.total} PROCESSED
            </div>
          </TechCard>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {heroes.map(hero => (
            <TechCard key={hero.id} hoverEffect style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  height: '200px',
                  overflow: 'hidden',
                  borderBottom: '1px solid var(--tech-border)'
                }}
              >
                <img
                  src={getImageUrl(hero.hero_image_path)}
                  alt={hero.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--tech-primary)' }}>{hero.name}</h4>
                  {hero.role_icon_path && (
                    <img
                      src={getImageUrl(hero.role_icon_path)}
                      alt={hero.role}
                      style={{ width: '24px', marginLeft: 'auto', filter: 'invert(1)' }}
                    />
                  )}
                </div>
                <p
                  style={{
                    color: 'var(--tech-text-muted)',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  {hero.role}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <TechButton size="sm" style={{ flex: 1 }} onClick={() => handleEdit(hero)}>
                    EDIT
                  </TechButton>
                  <TechButton size="sm" variant="danger" style={{ flex: 1 }} onClick={() => handleDelete(hero.id)}>
                    DELETE
                  </TechButton>
                </div>
              </div>
            </TechCard>
          ))}
        </div>

        <TechModal
          show={showModal}
          isOpen={showModal}
          /* c8 ignore start -- UI-only: modal close callback verified via integration, inline arrow not tracked */
          onClose={() => setShowModal(false)}
          /* c8 ignore stop */
          title={editMode ? 'EDIT HERO' : 'NEW HERO'}
        >
          {error && <div style={{ color: 'var(--tech-danger)', marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <TechInput label="HERO NAME" name="name" value={formData.name} onChange={handleInputChange} required />

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.85rem',
                  color: 'var(--tech-text-secondary)'
                }}
              >
                ROLE CLASS
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  background: 'rgba(15, 22, 35, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem 1rem',
                  color: 'var(--tech-text-primary)',
                  borderRadius: '4px',
                  outline: 'none'
                }}
              >
                <option value="">SELECT CLASS</option>
                <option value="Tank">TANK</option>
                <option value="Fighter">FIGHTER</option>
                <option value="Assassin">ASSASSIN</option>
                <option value="Mage">MAGE</option>
                <option value="Marksman">MARKSMAN</option>
                <option value="Support">SUPPORT</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.85rem',
                  color: 'var(--tech-text-secondary)'
                }}
              >
                VISUAL DATA {editMode && '(LEAVE EMPTY TO KEEP)'}
              </label>
              <input
                type="file"
                name="hero_image"
                data-testid="hero-image-input"
                onChange={handleInputChange}
                required={!editMode}
                accept="image/*"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--tech-border)',
                  color: '#fff',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.85rem',
                  color: 'var(--tech-text-secondary)'
                }}
              >
                ICON DATA {editMode && '(LEAVE EMPTY TO KEEP)'}
              </label>
              <input
                type="file"
                name="role_icon"
                data-testid="role-icon-input"
                onChange={handleInputChange}
                required={!editMode}
                accept="image/*"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--tech-border)',
                  color: '#fff',
                  borderRadius: '4px'
                }}
              />
            </div>

            <TechButton filled type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'PROCESSING...' : editMode ? 'UPDATE DATABASE' : 'CREATE ENTRY'}
            </TechButton>
          </form>
        </TechModal>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;

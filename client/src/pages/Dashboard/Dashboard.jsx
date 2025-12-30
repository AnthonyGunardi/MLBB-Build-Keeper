import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HeroService from '../../services/heroService';
import MainLayout from '../../layouts/MainLayout';
import TechCard from '../../components/TechCard';
import TechButton from '../../components/TechButton';
import HeroSearch from '../../components/HeroSearch';
import { getImageUrl } from '../../utils/urlHelpers';

const Dashboard = () => {
  const { user } = useAuth();
  const [heroes, setHeroes] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchHeroes = async () => {
    try {
      const data = await HeroService.getAllHeroes();
      setHeroes(data);
    } catch (err) {
      console.error(err);
      setError('Error loading heroes.');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHeroes();
  }, [user, navigate]);

  const handleSearchSelect = hero => {
    if (hero) {
      setHeroes([hero]);
    } else {
      fetchHeroes();
    }
  };

  return (
    <MainLayout>
      <div className="tech-container" style={{ paddingBottom: '3rem' }}>
        <div
          style={{
            margin: '2rem 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ color: 'var(--tech-primary)', margin: 0 }}>MISSION CONTROL // DASHBOARD</h2>
          <div style={{ color: 'var(--tech-text-secondary)', fontFamily: 'var(--font-ui)' }}>
            OPERATOR: <span style={{ color: '#fff' }}>{user?.email || ''}</span>
          </div>
        </div>

        {error && (
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

        <div style={{ marginBottom: '2rem', maxWidth: '600px' }}>
          <HeroSearch onSelect={handleSearchSelect} />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3
            style={{
              color: '#fff',
              fontSize: '1.2rem',
              fontFamily: 'var(--font-ui)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            Select Hero
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {heroes.map(hero => (
            <TechCard
              key={hero.id}
              hoverEffect
              style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ height: '200px', overflow: 'hidden', borderBottom: '1px solid var(--tech-border)' }}>
                <img
                  src={getImageUrl(hero.hero_image_path)}
                  alt={hero.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                <div
                  style={{
                    color: 'var(--tech-text-muted)',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {hero.role}
                </div>
                <Link to={`/heroes/${hero.id}/builds`} style={{ marginTop: 'auto' }}>
                  <TechButton variant="secondary" style={{ width: '100%' }}>
                    Manage Builds
                  </TechButton>
                </Link>
              </div>
            </TechCard>
          ))}
        </div>

        {heroes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--tech-text-muted)' }}>
            NO DATA FOUND // CONTACT ADMIN
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;

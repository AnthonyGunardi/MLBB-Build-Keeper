import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroService from '../../services/heroService';
import TechCard from '../../components/TechCard';
import TechButton from '../../components/TechButton';
import HeroSearch from '../../components/HeroSearch';
import MainLayout from '../../layouts/MainLayout';
import { getImageUrl } from '../../utils/urlHelpers';

import styles from './HomePage.module.css';

const HomePage = () => {
  const [heroes, setHeroes] = useState([]);

  const fetchHeroes = async () => {
    try {
      const data = await HeroService.getAllHeroes();
      setHeroes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

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
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <h1 className={styles.heroTitle}>
            BUILD<span>KEEPER</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Access the ultimate database of community-verified builds for Mobile Legends.
          </p>
        </div>

        <div style={{ marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          <HeroSearch onSelect={handleSearchSelect} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '2rem'
          }}
        >
          {heroes.map(hero => (
            <TechCard key={hero.id} hoverEffect animatedCorners style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '200px', overflow: 'hidden', borderBottom: '1px solid var(--tech-border)' }}>
                <img
                  src={getImageUrl(hero.hero_image_path)}
                  alt={hero.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#fff' }}>{hero.name}</h3>
                <Link to={`/heroes/${hero.id}/builds`}>
                  <TechButton variant="primary" style={{ width: '100%' }}>
                    View Builds
                  </TechButton>
                </Link>
              </div>
            </TechCard>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;

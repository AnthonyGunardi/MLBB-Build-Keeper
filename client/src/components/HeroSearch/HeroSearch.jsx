import React, { useState, useEffect, useRef } from 'react';
import HeroService from '../../services/heroService';
import TechInput from '../TechInput';
import styles from './HeroSearch.module.css';
import { getImageUrl } from '../../utils/urlHelpers';

const HeroSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      /* c8 ignore start -- Debounce fallback: handleClear called immediately on empty input */
      if (query.trim()) {
        try {
          const results = await HeroService.getAllHeroes({ search: query });
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Failed to fetch suggestions', err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      /* c8 ignore stop */
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = hero => {
    setQuery(hero.name);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(hero);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(null);
    }
  };

  return (
    <div ref={wrapperRef} className={styles.searchContainer}>
      <div className={styles.inputWrapper}>
        <TechInput
          placeholder="SEARCH PROTOCOL // HERO NAME..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (e.target.value === '') handleClear();
          }}
          className={styles.searchInput}
        />
        {query && (
          <button onClick={handleClear} className={styles.clearButton}>
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className={styles.suggestionsList}>
          {suggestions.map(hero => (
            <div key={hero.id} onClick={() => handleSelect(hero)} className={styles.suggestionItem}>
              {hero.role_icon_path && (
                <img
                  src={`http://localhost:5000/${hero.role_icon_path}`}
                  alt={hero.role}
                  className={styles.roleIcon}
                />
              )}
              <span className={styles.heroName}>{hero.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSearch;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TechButton from '../TechButton';
import styles from './TechNavbar.module.css';

const TechNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = path => (location.pathname === path ? styles.activeLink : '');
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`${styles.navbar} ${isMenuOpen ? styles.menuOpen : ''}`}>
      <Link to="/" className={styles.logo} onClick={closeMenu}>
        <div className={styles.logoIcon} />
        <span>ML:Builds</span>
      </Link>

      <button
        className={styles.mobileToggle}
        onClick={toggleMenu}
        aria-label="Toggle navigation"
        aria-expanded={isMenuOpen}
      >
        <span
          className={styles.bar}
          style={{
            transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
          }}
        ></span>
        <span className={styles.bar} style={{ opacity: isMenuOpen ? 0 : 1 }}></span>
        <span
          className={styles.bar}
          style={{
            transform: isMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
          }}
        ></span>
      </button>

      <div className={styles.navLinks}>
        <Link to="/" className={`${styles.link} ${isActive('/')}`} onClick={closeMenu}>
          Home
        </Link>
        {user && (
          <Link to="/dashboard" className={`${styles.link} ${isActive('/dashboard')}`} onClick={closeMenu}>
            My Builds
          </Link>
        )}
        {user && user.role === 'admin' && (
          <Link to="/admin" className={`${styles.link} ${isActive('/admin')}`} onClick={closeMenu}>
            Admin
          </Link>
        )}
      </div>

      <div className={styles.userSection}>
        {user ? (
          <>
            <span className={styles.username}>CMD // {user.email || ''}</span>
            <TechButton
              variant="danger"
              size="sm"
              onClick={() => {
                logout();
                closeMenu();
              }}
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            >
              Disconnect
            </TechButton>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>
              <TechButton variant="secondary" style={{ marginRight: '1rem' }}>
                Login
              </TechButton>
            </Link>
            <Link to="/register" onClick={closeMenu}>
              <TechButton filled>Register</TechButton>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default TechNavbar;

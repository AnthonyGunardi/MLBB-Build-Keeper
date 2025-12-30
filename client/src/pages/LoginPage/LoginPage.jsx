import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import TechCard from '../../components/TechCard';
import TechInput from '../../components/TechInput';
import TechButton from '../../components/TechButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <MainLayout>
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <TechCard title="System Access" animatedCorners style={{ width: '100%', maxWidth: '450px' }}>
          {error && (
            <div
              style={{
                background: 'rgba(255, 42, 42, 0.1)',
                border: '1px solid var(--tech-danger)',
                color: 'var(--tech-danger)',
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '4px'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <TechInput
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <TechInput
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ marginBottom: '2rem' }}
            />

            <TechButton filled type="submit" style={{ width: '100%' }}>
              Initialize Login
            </TechButton>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              color: 'var(--tech-text-secondary)',
              fontSize: '0.9rem'
            }}
          >
            No access credentials?{' '}
            <Link to="/register" style={{ color: 'var(--tech-primary)' }}>
              Request Access
            </Link>
          </div>
        </TechCard>
      </div>
    </MainLayout>
  );
};

export default LoginPage;

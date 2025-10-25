import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.jsx';  

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={authContainer}>
      <div style={authForm}>
        <div style={authHeader}>
          <h2>Welcome Back</h2>
          <p>Sign in to access your secure video library</p>
        </div>

        {error && <div style={errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={formGroup}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              style={inputStyle}
            />
          </div>

          <div style={formGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={authButton}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={authFooter}>
          <p>Don't have an account? <Link to="/signup" style={linkStyle}>Sign up</Link></p>
        </div>

        <div style={securityFeatures}>
          <div style={securityBadge}>
            <i className="fas fa-shield-alt" style={{marginRight: '8px', color: '#10b981'}}></i>
            <span>Your videos are securely isolated from other users</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const authContainer = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '20px'
};

const authForm = {
  background: 'white',
  padding: '3rem',
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  width: '100%',
  maxWidth: '450px'
};

const authHeader = {
  textAlign: 'center',
  marginBottom: '2rem'
};

const formGroup = {
  marginBottom: '1.5rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '1rem',
  transition: 'border-color 0.3s, box-shadow 0.3s'
};

const authButton = {
  display: 'inline-block',
  width: '100%',
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.3s'
};

const authFooter = {
  marginTop: '1.5rem',
  textAlign: 'center',
  color: '#64748b'
};

const linkStyle = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '500'
};

const errorMessage = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  padding: '0.75rem',
  borderRadius: '8px',
  marginBottom: '1rem'
};

const securityFeatures = {
  marginTop: '2rem',
  paddingTop: '1rem',
  borderTop: '1px solid #e5e7eb'
};

const securityBadge = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.9rem',
  color: '#64748b'
};

export default Login;
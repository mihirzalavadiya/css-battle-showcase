import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../App';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const ADMIN_USERNAME = process.env.REACT_APP_ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

    console.log('Environment Variables:', {
      ADMIN_USERNAME,
      ADMIN_PASSWORD,
      inputUsername: credentials.username,
      inputPassword: credentials.password
    });

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      setError('Environment variables not set. Please check .env configuration.');
      return;
    }

    if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
      console.log('Login successful, setting authentication...');
      login();
      navigate('/admin');
    } else {
      console.log('Login failed: credentials do not match');
      setError('Invalid credentials');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <FontAwesomeIcon icon={faLock} className="login-icon" />
          <h2>Admin Login</h2>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 
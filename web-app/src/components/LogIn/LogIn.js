import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LogIn.css'; 
import * as api from 'utilities/api';

function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
      const response = await api.postTokens(email, password);

      if (response.status === 201) {        
        const data = await response.json();
        const token = data.token;

        if (token) {
          localStorage.setItem('userToken', token);
          // Standardized to navigate to /drive/all
          navigate('/drive/all'); 
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Invalid email or password.');
      }
    } catch (error) {
      console.error("Cannot connect to the web server:", error);
      setError("Cannot connect to the server. Please try again later.");
    }
  };

  return (
    <div className="login-page"> {/* Wrapper for full-screen theme background */}
      <div className="login-container">
        <h2 className="login-title">Sign in</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <input 
            className={`login-input ${error ? "input-error" : ""}`}
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            className={`login-input ${error ? "input-error" : ""}`}
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          <button type="submit" className="login-submit-btn">
            Next
          </button>

          <div className="login-footer">
            <button 
              type="button"
              onClick={() => navigate('/signup')}
              className="secondary-btn"
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LogIn;
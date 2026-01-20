import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css'; // Import the CSS file

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <nav className="welcome-nav">
        <button 
          onClick={() => navigate('/login')}
          className="btn-primary"
        >
          Sign in
        </button>
      </nav>

      <h1 className="welcome-title">Store and share files online</h1>
      <p className="welcome-description">
        Secure cloud storage for your Drive application.
      </p>
      
      <div className="welcome-actions">
        <button 
          onClick={() => navigate('/login')}
          className="btn-primary btn-large"
        >
          Go to Drive
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;
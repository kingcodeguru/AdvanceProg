import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from 'utilities/api';
import './SignUp.css';

// Import your default image (this works if it's in src/assets)
import defaultPfp from '../../assets/def_pfp.jpg';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState('');
  const navigate = useNavigate();

  // Helper function to convert a URL/Path to Base64
  const convertPathToBase64 = async (path) => {
    try {
      const response = await fetch(path);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to convert default pfp:", err);
      return "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Determine the final avatar string
    let finalAvatar = avatar;
    if (!finalAvatar) {
      finalAvatar = await convertPathToBase64(defaultPfp);
    }

    try {
      // Send the finalAvatar (either user-uploaded or default base64)
      const signupResponse = await api.postUser({ 
        name, 
        email, 
        password, 
        avatar: finalAvatar 
      });

      if (signupResponse.status === 204) {
        const response = await api.postTokens(email, password);
        if (response.status === 201) {
          const data = await response.json();
          if (data.token) {
            localStorage.setItem('userToken', data.token);
            navigate('/drive/home');
          }
        }
      } else {
        const signupError = await signupResponse.json().catch(() => ({}));
        setError(signupError.error || 'Error creating user');
      }
    } catch (error) {
      console.error("Connection error:", error);
      setError("Cannot connect to the server.");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 className="signup-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="avatar-section">
            <div className="preview-circle">
              {/* If no avatar is uploaded, you could also show the defaultPfp here as a preview */}
              {avatar ? (
                <img src={avatar} alt="Avatar" className="avatar-preview-img" />
              ) : (
                <img src={defaultPfp} alt="Default" className="avatar-preview-img default-opac" />
              )}
            </div>
            <label htmlFor="avatar-upload" className="upload-label-btn">
              {avatar ? "Change Picture" : "Add Profile Picture"}
            </label>
            <input 
              id="avatar-upload"
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <input className="signup-input" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="signup-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="signup-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input className={`signup-input ${error === "Passwords do not match!" ? "input-error" : ""}`} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

          <button type="submit" className="signup-submit-btn">
            Register
          </button>
        </form>

        <div className="signup-footer">
          Already have an account? <Link to="/login" className="signin-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
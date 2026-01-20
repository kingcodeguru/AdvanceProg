// src/components/MainPage/Navbar/Navbar.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useTheme } from 'utilities/ThemeContext';
import * as api from 'utilities/api';

function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState({
    name: localStorage.getItem('userName') || 'User',
    email: localStorage.getItem('userEmail') || '',
    avatar: localStorage.getItem('userAvatar') || ''
  });

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      try {
        const response = await api.getMyDetails(token);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          localStorage.setItem('userName', data.name);
          localStorage.setItem('userAvatar', data.avatar);
          localStorage.setItem('userEmail', data.email);
        } else if (response.status === 401) {
          handleLogout();
        }
      } catch (error) {
        console.error("Navbar sync error:", error);
      }
    };
    fetchUserDetails();
  }, [handleLogout]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/drive/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo-section" onClick={() => navigate('/drive/all')} style={{ cursor: 'pointer' }}>
          <img 
            src="https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" 
            alt="Logo" 
            className="drive-logo" 
          />
          <span className="brand-name">Drive</span>
        </div>
      </div>

      <div className="navbar-center">
        <input 
          type="text" 
          placeholder="Search in Drive" 
          className="search-bar" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="navbar-right">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
          {isDarkMode ? '🌙' : '☀️'}
        </button>

        <div className="user-profile-section">
          <div className="avatar-wrapper" onClick={() => setShowDropdown(!showDropdown)}>
            {userData.avatar ? (
              <img src={userData.avatar} alt="Profile" className="header-avatar" />
            ) : (
              <div className="header-avatar-placeholder">
                {userData.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="large-avatar">
                  {userData.avatar ? (
                    <img src={userData.avatar} alt="Profile" />
                  ) : (
                    userData.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="user-info">
                  <p className="user-display-name">{userData.name}</p>
                  <p className="user-display-email">{userData.email}</p>
                </div>
              </div>
              <hr className="dropdown-divider" />
              <button onClick={handleLogout} className="dropdown-logout-btn">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
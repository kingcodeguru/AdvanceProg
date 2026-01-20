// src/components/MainPage/Sidebar/SidebarButton/SidebarButton.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './SidebarButton.css';

function SidebarButton({ label, icon }) {
  // 1. The mapping logic as requested
  const titleToPath = { 
    'Home': 'all',
    'My Drive': 'my-drive', 
    'Shared with me': 'shared-with-me', 
    'Recent': 'recent', 
    'Starred': 'starred', 
    'Trash': 'bin'
  };

  // 2. Find the path, default to 'all'
  const categoryPath = titleToPath[label] || 'all';

  return (
    <NavLink 
      to={`/drive/${categoryPath}`} 
      className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </NavLink>
  );
}

export default SidebarButton;
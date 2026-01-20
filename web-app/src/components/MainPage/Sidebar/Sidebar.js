// src/components/MainPage/Sidebar/Sidebar.js
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarButton from './SidebarButton/SidebarButton';
import './Sidebar.css';
import * as api from 'utilities/api';

import PlusButton from 'assets/plus_button.svg';
import FolderIcon from 'assets/directory.svg';
import ImageIcon from 'assets/image.svg';
import FileIcon from 'assets/file.svg';

function Sidebar({refreshSignal, setRefreshSignal}) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef(null); 
  const [currentUploadType, setCurrentUploadType] = useState('');

  const folderId = localStorage.getItem('currentDir');

  const triggerRefresh = () => setRefreshSignal(!refreshSignal);

  const menuItems = [
    { label: 'Home', icon: '🏠' },
    { label: 'My Drive', icon: '📁' },
    { label: 'Shared with me', icon: '👥' },
    { label: 'Recent', icon: '🕒' },
    { label: 'Starred', icon: '⭐' },
    { label: 'Trash', icon: '🗑️' },
  ];

  const sendToFileAPI = async (payload) => {
    try {
      const response = await api.postFiledir(payload);
      if (response.ok) {
        const locationHeader = response.headers.get('Location');
        if (locationHeader) {
          const segments = locationHeader.split('/');
          const fid = segments.pop() || segments.pop(); 
          return { id: fid };
        }
        return true; 
      }
    } catch (err) {
      console.error("API Error:", err);
    }
    return null;
  };

  const createTextFile = async () => {
    const name = prompt("Enter text file name:");
    if (!name) return;
    setIsDropdownOpen(false);
    const newFile = await sendToFileAPI({ name, is_file: true, content: "", parent_id: folderId || null, type: "text" });

    if (newFile && newFile.id) navigate(`/drive/files/${newFile.id}`);
    else triggerRefresh();
  };

  const createFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    setIsDropdownOpen(false);
    const success = await sendToFileAPI({ name, is_file: false, parent_id: folderId || null });
    triggerRefresh();
  };

  const uploadFile = (type) => {
    setIsDropdownOpen(false);
    setCurrentUploadType(type);
    fileInputRef.current.accept = type === 'upload-image' ? "image/*" : ".txt, .html";
    fileInputRef.current.click();
    triggerRefresh();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      await sendToFileAPI({ name: file.name, is_file: true, content: event.target.result, parent_id: folderId || null, type: currentUploadType === 'upload-image' ? "image" : "text" });
      triggerRefresh();
    };
    if (currentUploadType === 'upload-image') reader.readAsDataURL(file);
    else reader.readAsText(file);
  };

  return (
    <aside className="sidebar">
      <div className="new-button-wrapper">
        <button className="btn-new" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <span className="icon-mask plus-img" style={{ '--icon-url': `url(${PlusButton})` }} />
          <span className="btn-new-text">New</span>
        </button>

        {isDropdownOpen && (
          <div className="new-dropdown">
            <button className="dropdown-item" onClick={createFolder}>
              <span className="icon-mask dropdown-icon" style={{ '--icon-url': `url(${FolderIcon})` }} />
              <span className="dropdown-label">New folder</span>
            </button>
            <button className="dropdown-item" onClick={createTextFile}>
              <span className="icon-mask dropdown-icon" style={{ '--icon-url': `url(${FileIcon})` }} />
              <span className="dropdown-label">New text file</span>
            </button>
            
            <hr className="dropdown-divider" />
            
            <button className="dropdown-item" onClick={() => uploadFile('upload-text')}>
              <span className="icon-mask dropdown-icon" style={{ '--icon-url': `url(${FileIcon})` }} />
              <span className="dropdown-label">File upload</span>
            </button>
            <button className="dropdown-item" onClick={() => uploadFile('upload-image')}>
              <span className="icon-mask dropdown-icon" style={{ '--icon-url': `url(${ImageIcon})` }} />
              <span className="dropdown-label">Image upload</span>
            </button>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onFileChange} />
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <SidebarButton key={item.label} label={item.label} icon={item.icon} />
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
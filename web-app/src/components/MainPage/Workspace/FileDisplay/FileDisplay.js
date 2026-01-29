// src/components/MainPage/Workspace/FileDisplay/FileDisplay.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ListFileItems from '../../../ListFileItems/ListFileItems';
import * as api from 'utilities/api';
import './FileDisplay.css';
import ListIcon from 'assets/list_view.svg';
import GridIcon from 'assets/grid_view.svg';

function FileDisplay({refreshSignal}) {
  const { category, searchQuery, folderId } = useParams();
  if (folderId) {
    localStorage.setItem('currentDir', folderId);
  } else {
    localStorage.removeItem('currentDir');
  }
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. New state for view mode: true = Line (default), false = Box
  const [isLineView, setIsLineView] = useState(true);
  const [pageName, setPageName] = useState("Unknown");
  const [parent_id, setParentId] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('isLine')) {
      setIsLineView(!localStorage.getItem('isLine'));
    }
  }, [folderId]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      navigate('/');
      return;
    }
    let response;
    try {
      if (searchQuery) {
        response = await api.getFilesBySearch(searchQuery);
        setPageName(`Search results for "${searchQuery}"`);
      } else if (category) {
        response = await api.getFilesByCategory(category);
        setPageName(categoryToName(category));
      } else if (folderId) {
        response = await api.getFileById(folderId);
      } else {
        alert('something went wrong');
        navigate('/');
      }
      if (response.ok) {
        const data = await response.json();
        if (folderId) {
          setFiles(data.sub_filedirs);
          setPageName(data.name)
          setParentId(data.parent_id);
        } else {
          setFiles(data);
        }
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/');
      } else if (response.status === 403) {
        alert("You don't have permission to access this folder.");
        navigate('/drive/home');
      } else {
        const data = await response.json();
        alert(`${data.error}`);
        navigate('/drive/home');
      }
    } catch (error) {
      console.error("Workspace fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [category, searchQuery, navigate, refreshSignal, folderId]);

  const categoryToName = (category) => {
    switch (category) {
      case 'all':
        return 'Home';
      case 'my-drive':
        return 'My Drive';
      case 'shared-with-me':
        return 'Shared with me';
      case 'recent':
        return 'Recent';
      case 'starred':
        return 'Starred';
      case 'bin':
        return 'Trash';
      default:
        return 'Home';
    }
  };
  const viewMode = isLineView ? "line" : "box";
  const onRefresh = () => {
    fetchWorkspaceData();
  };
  const showFooter = searchQuery ? false : true;

  const handleBack = () => {
    navigate(parent_id ? `/drive/directories/${parent_id}` : '/drive/my-drive');
  };

  return (
    <div className="file-display-container">
      <header className="workspace-header">
        <div className="header-left">
          {
            !folderId ? null : (
              <button className="back-btn" onClick={handleBack} title="Back">
                  <span className="material-icons">arrow_back</span>
              </button>
            )
          }
          <h2 className="workspace-title">
            {pageName}
          </h2>
        </div>
        
        {/* Pill-shaped View Toggle */}
        <div className="view-switcher-pill">
          <button 
            className={`switcher-btn left ${isLineView ? 'active' : ''}`}
            onClick={() => setIsLineView(true)}
          >
            {isLineView && <span className="check-mark">✓</span>}
            <span className="icon-mask switcher-icon" style={{ '--icon-url': `url(${ListIcon})` }} />
          </button>
          <button 
            className={`switcher-btn right ${!isLineView ? 'active' : ''}`}
            onClick={() => {
              setIsLineView(!isLineView); 
              localStorage.setItem('isLine', `${!isLineView}`);}}
          >
            {!isLineView && <span className="check-mark">✓</span>}
            <span className="icon-mask switcher-icon" style={{ '--icon-url': `url(${GridIcon})` }} />
          </button>
        </div>
      </header>
      
      {loading ? (
        <div className="loading-spinner">Loading files...</div>
      ) : (
        <ListFileItems files={files} viewMode={viewMode} onRefresh={onRefresh} showFooter={showFooter} />
      )}
    </div>
  );
}

export default FileDisplay;
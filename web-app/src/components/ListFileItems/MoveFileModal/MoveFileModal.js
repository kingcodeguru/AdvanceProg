import React, { useState, useEffect, useCallback } from 'react';
import './MoveFileModal.css'; 
import { getFilesByDirectory, patchFile, getFilesBySearch, getFileById, getRole, getAllFiles, getAllStaredFiles } from '../../../utilities/api';
import { can_edit } from '../../../utilities/roles';

function MoveFileModal({ fileId, fileName, onClose, onMoveSuccess }) {
    

    const [isInit, setIsInit] = useState(true); 
    const [originParentId, setOriginParentId] = useState(null); 
    const [originParentName, setOriginParentName] = useState('My Drive');

    const [activeTab, setActiveTab] = useState('all'); 
    const [currentPath, setCurrentPath] = useState([]);
    const [folders, setFolders] = useState([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(false);
    
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');



    useEffect(() => {
        let mounted = true;
        const initializeModal = async () => {
            try {
                const fileRes = await getFileById(fileId);
                const fileData = fileRes.json ? await fileRes.json() : fileRes;
                
                const parentId = fileData.parent_id;
                if (mounted) setOriginParentId(parentId);

                let startName = 'My Drive';
                let startId = 'root';

                if (parentId && parentId !== 'root') {
                    startId = parentId;
                    try {
                        const parentRes = await getFileById(parentId);
                        const parentData = parentRes.json ? await parentRes.json() : parentRes;
                        startName = parentData.name;
                        if (mounted) setOriginParentName(startName);
                    } catch (e) {
                        startName = 'Unknown Location';
                    }
                }

                if (mounted) {
                    setCurrentPath([{ fid: startId, name: startName }]);
                    setIsInit(false);
                }

            } catch (err) {
                console.error("Init failed", err);
                if (mounted) {
                    setCurrentPath([{ fid: 'root', name: 'My Drive' }]);
                    setIsInit(false);
                }
            }
        };

        initializeModal();
        return () => { mounted = false; };
    }, [fileId]);


    const getFileRole = async (fid) => {
        try {
            return await getRole(fid);
        } catch (error) {
            return 0;
        }
    };

    const currentFolder = currentPath.length > 0 
        ? currentPath[currentPath.length - 1] 
        : { fid: 'root', name: 'My Drive' };

    const showSearchBar = activeTab === 'starred' || (activeTab === 'all' && currentPath.length === 1);



    const loadFolders = useCallback(async () => {
        if (isInit) return;

        setIsLoadingFolders(true);
        try {
            let response;
            let isSearch = false;

            
            const targetId = currentFolder.fid || 'root';

            if (searchQuery.length > 0 && showSearchBar) {
                response = await getFilesBySearch(searchQuery);
                isSearch = true;
            } else if (activeTab === 'starred') {
                response = await getAllStaredFiles();
            } else if (targetId === 'root') {
                response = await getAllFiles();
            } else {
                response = await getFilesByDirectory(targetId);
            }

            if (response && response.ok) {
                let data = await response.json();

                if (!Array.isArray(data)) {
                    data = (data && typeof data === 'object') ? [data] : [];
                }

                
                data = data.map(item => ({
                    ...item,
                    fid: item.fid || item.id,
                    name: item.name || 'Untitled'
                }));

                
                if (!isSearch && targetId === 'root' && activeTab === 'all') {
                    data = data.filter(item => item.parent_id === null);
                }
                if (isSearch && activeTab === 'starred') {
                    data = data.filter(item => item.starred === true);
                }

                const candidates = data.filter(item => 
                    (item.type === 'directory' || item.type === 'dir') && 
                    item.fid !== fileId && 
                    item.fid !== originParentId &&
                    item.fid !== currentFolder.fid
                );


                const allowedFolders = [];
                if (originParentId !== null && !isSearch && currentPath.length === 1 && activeTab === 'all') {
                    allowedFolders.push({fid:null, name: 'My Drive'});
                }
                for (const folder of candidates) {
                    const role = await getFileRole(folder.fid);
                    if (can_edit(role)) {
                        allowedFolders.push(folder);
                    }
                }

                
                setFolders(allowedFolders);
            }
        } catch (error) {
            console.error("Error loading folders:", error);
            setFolders([]);
        } finally {
            setIsLoadingFolders(false);
        }
    }, [isInit, searchQuery, activeTab, currentFolder.fid, fileId, originParentId, showSearchBar]);


    useEffect(() => {
        loadFolders();
    }, [loadFolders]);


    useEffect(() => {
        setSearchQuery('');
    }, [activeTab, currentFolder.fid]);


    const handleFolderClick = (folder) => setSelectedFolder(folder);

    
    const enterFolder = (folder) => {
        if (!folder.fid) return;
        setActiveTab('all');
        setCurrentPath(prev => [...prev, { fid: folder.fid, name: folder.name }]);
        setSelectedFolder(null);
        setSearchQuery('');
    };

    const goBack = () => {
        if (currentPath.length <= 1) return;
        setCurrentPath(prev => {
            const newPath = [...prev];
            newPath.pop();
            return newPath;
        });
        setSelectedFolder(null);
    };

    const handleMove = async () => {
        const destinationId = selectedFolder ? selectedFolder.fid : currentFolder.fid;
        try {
            const res = await patchFile(fileId, { parent_id: destinationId });
            if (res.ok) {
                if (onMoveSuccess) onMoveSuccess();
                onClose();
            } else {
                alert("Failed to move file");
            }
        } catch (error) {
            console.error("Move error:", error);
        }
    };

    const isMoveEnabled = selectedFolder !== null || currentPath.length > 1;

    const renderContent = () => {
        if (isLoadingFolders) {
            return (
                <div style={{ padding: '20px', textAlign: 'center', color: '#5f6368' }}>
                    Loading...
                </div>
            );
        }

        if (searchQuery && folders.length === 0) {
            return (
                <div className="empty-search-state">
                    <img src="/empty_search.png" alt="No results" />
                    <p>No search results to display</p>
                </div>
            );
        }

        return (
            <ul className="folder-list">
                {folders.map(folder => (
                    <li 
                        key={folder.fid} 
                        className={`folder-item ${selectedFolder?.fid === folder.fid ? 'selected' : ''}`}
                        onClick={() => handleFolderClick(folder)}
                        onDoubleClick={() => enterFolder(folder)}
                    >
                        <div className="folder-info">
                            <img src="/dir_logo.png" alt="folder" className="icon-small" />
                            <span>{folder.name}</span>
                        </div>
                        <div className="hover-actions">
                            <button 
                                className="small-move-btn"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                        const res = await patchFile(fileId, { parent_id: folder.fid });
                                        if (res.ok) {
                                            if (onMoveSuccess) onMoveSuccess();
                                            onClose();
                                        }
                                    } catch(err) { console.error(err); }
                                }}
                            >
                                Move
                            </button>
                            <span 
                                className="navigate-arrow" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    enterFolder(folder); 
                                }}
                            >
                                {'>'}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    if (isInit) {
        return (
            <div className="modal-overlay">
                <div className="move-modal-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="move-modal-content">
                <div className="move-header">
                    <h3>Move "{fileName}"</h3>
                    <div className="current-location">
                        {currentPath.length > 1 ? (
                            <>
                                <span onClick={goBack} className="back-text-btn">←</span>
                                <span>{currentFolder.name}</span>
                            </>
                        ) : (
                            <span>Current location: {originParentName}</span>
                        )}
                    </div>
                </div>

                <div className="move-tabs">
                    <button className={activeTab === 'starred' ? 'active' : 'nonactive'} onClick={() => setActiveTab('starred')}>Starred</button>
                    <button className={activeTab === 'all' ? 'active' : 'nonactive'} onClick={() => setActiveTab('all')}>All locations</button>
                </div>

                {showSearchBar && (
                    <div className="search-bar-container">
                        <img src="/search_icon.png" alt="search" className="search-icon-input" />
                        <input 
                            type="text" 
                            placeholder="Search folders" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && <span className="clear-search" onClick={() => setSearchQuery('')}>✕</span>}
                    </div>
                )}

                <div className="move-body">
                    {renderContent()}
                </div>

                <div className="move-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="move-btn" onClick={handleMove} disabled={!isMoveEnabled}>
                        Move
                    </button>
                </div>
            </div>
        </div>
    );
} 

export default MoveFileModal;
import React, { useState, useEffect } from 'react';
import './ShareMenu.css';
import * as api from '../../utilities/api';

// User role definitions
const ROLES = {
    VIEWER: 0,
    EDITOR: 1,
    ADMIN: 2,
    OWNER: 3
};

const ShareMenu = ({ isOpen, onClose, fileId, fileName }) => {
    // Component state management
    const [permissions, setPermissions] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState(ROLES.EDITOR);
    const [currentUserRole, setCurrentUserRole] = useState(ROLES.VIEWER); 
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [myUid, setMyUid] = useState(null);

    // Global event listener for the Enter key
    // Closes the modal if the user is not focused on an input
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (isOpen && e.key === 'Enter') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);

        // Cleanup listener when component unmounts
        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [isOpen, onClose]);

    // EFFECT: Initialize data when modal opens
    useEffect(() => {
        if (isOpen && fileId) {
            initializeData();
        }
    }, [isOpen, fileId]);

    // fetch user details first, then permissions
    const initializeData = async () => {
        try {
            // Get my details using the token
            const meRes = await api.getMyDetails();
            if (meRes.ok) {
                const meData = await meRes.json();
                setMyUid(meData.uid); // Save real UID
                
                // Fetch file permissions using the UID we just got
                fetchPermissions(meData.uid);
            }
        } catch (error) {
            console.error("Error initializing share menu:", error);
        }
    };

    // Show a temporary notification message (Toast)
    const showToast = (message, isError = false) => {
        setToast({ text: message, type: isError ? 'error' : 'success' });
        
        // Hide message after 3 seconds
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    // Get the list of permissions from the server
    const fetchPermissions = async (currentUid) => {
        try {
            const res = await api.getFilePermissions(fileId);

            if (res.ok) {
                const data = await res.json();
                setPermissions(data);
                
                // Determine my role in this file
                // Use the UID passed as argument or from state
                const uidToCheck = currentUid || myUid;
                const myPerm = data.find(p => p.uid === uidToCheck);
                if (myPerm) {
                    setCurrentUserRole(myPerm.role);
                }
            }
        } catch (error) {
            console.error("Server error:", error);
        }
    };

    // Handle adding a new user
    const handleAddUser = async () => {
        if (!newEmail) return;
        setIsLoading(true);

        // Check if the user is already in the list
        const existingPerm = permissions.find(p => p.email === newEmail);


        if (existingPerm) {
            // Prevent modifying the owner via the add input
            if (existingPerm.role === ROLES.OWNER) {
                showToast("Cannot modify owner", true);
                setIsLoading(false);
                return;
            }
            // User exists with the same role
            if (existingPerm.role === parseInt(newRole)) {
                showToast("User already has access", true);
                setIsLoading(false);
                return;
            } 
            // User exists with a different role, update it
            else {
                await handleRoleChange(existingPerm.pid, newRole, existingPerm.uid);
                setNewEmail(''); 
                setIsLoading(false);
                return;
            }
        }

        // Send request to add a new user
        try {
            const res = await api.addFilePermission(fileId, newEmail, parseInt(newRole));

            if (res.ok) {
                setNewEmail(''); 
                fetchPermissions(); 
                showToast("Person added");
            } else if (res.status === 404) {
                showToast("User not found", true);
            } else if (res.status === 409) {
                showToast("User already has access", true);
            } else {
                showToast("Error adding user", true);
            }
        } catch (error) {
            showToast("Server connection error", true);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Enter key inside the email input
    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            // Prevent the global listener from closing the modal
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            if (newEmail.trim().length > 0) {
                handleAddUser();
            }
        }
    };

    // Handle Enter key inside the role dropdown
    const handleSelectKeyDown = (e) => {
        if (e.key === 'Enter') {
            // Prevent default browser behavior and global close
            e.preventDefault(); 
            e.stopPropagation(); 
            e.nativeEvent.stopImmediatePropagation();

            if (newEmail.trim().length > 0) {
                handleAddUser();
            }
        }
    };

    // Update an existing user role
    const handleRoleChange = async (pid, newRoleValue, uidOfUser) => {
        try {
            const res = await api.updateFilePermission(fileId, pid, parseInt(newRoleValue), uidOfUser);

            if (res.ok) {
                fetchPermissions();
                showToast("Permission updated");
            } else {
                showToast("Failed to update", true);
            }
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    // Remove a user permission
    const handleRemoveUser = async (pid) => {
        try {
            const res = await api.deleteFilePermission(fileId, pid);

            if (res.ok) {
                fetchPermissions();
                showToast("Person removed");
            } else {
                showToast("Failed to remove user", true);
            }
        } catch (error) {
            console.error("Error removing user:", error);
        }
    };

    // Copy file link to clipboard
    const handleCopyLink = () => {
        const link = `http://localhost:3000/drive/files/${fileId}`;
        navigator.clipboard.writeText(link).then(() => {
            showToast("Link copied to clipboard");
        });
    };

    // Get the first letter for the avatar
    const getInitials = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    // Generate a background color based on the name string
    const stringToColor = (string) => {
        if (!string) return '#8e24aa';
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + "00000".substring(0, 6 - c.length) + c;
    };

    if (!isOpen) return null;

    // Check if the current user has management rights
    const canManage = currentUserRole >= ROLES.ADMIN;

    return (
        <div className="share-overlay" onClick={onClose}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                
                <div className="share-header">
                    <h2>Share "{fileName}"</h2>
                </div>

                {canManage && (
                    <div className="add-people-container">
                        <input 
                            type="email" 
                            className="add-input"
                            placeholder="Add people" 
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                        />
                        <select 
                            className="role-select-new"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            onKeyDown={handleSelectKeyDown}
                        >
                            <option value={ROLES.VIEWER}>Viewer</option>
                            <option value={ROLES.EDITOR}>Editor</option>
                            <option value={ROLES.ADMIN}>Admin</option>
                        </select>
                        <button 
                            className="btn-send" 
                            onClick={handleAddUser}
                            disabled={!newEmail || isLoading}
                        >
                            Add person
                        </button>
                    </div>
                )}

                <div className="people-list-label">People with access</div>
                
                <div className="people-list">
                    {permissions.map((perm) => {
                        const isRowOwner = perm.role === ROLES.OWNER;
                        const isMe = perm.uid === myUid;

                        return (
                            <div key={perm.pid} className="person-row">
                                <div className="person-left">
                                    <div className="avatar" style={{backgroundColor: stringToColor(perm.name)}}>
                                        {getInitials(perm.name)}
                                    </div>
                                    <div className="person-details">
                                        <span className="person-name">
                                            {perm.name}
                                            {isMe && <span className="you-tag"> (you)</span>}
                                        </span>
                                        <span className="person-email">{perm.email}</span>
                                    </div>
                                </div>

                                <div className="person-actions">
                                    {canManage && !isRowOwner ? (
                                        <select 
                                            className="role-select-existing"
                                            value={perm.role}
                                            onChange={(e) => handleRoleChange(perm.pid, e.target.value, perm.uid)}
                                        >
                                            <option value={ROLES.VIEWER}>Viewer</option>
                                            <option value={ROLES.EDITOR}>Editor</option>
                                            <option value={ROLES.ADMIN}>Admin</option>
                                        </select>
                                    ) : (
                                        <span className="role-text-only">
                                            {perm.role === ROLES.OWNER ? 'Owner' : 
                                             perm.role === ROLES.ADMIN ? 'Admin' :
                                             perm.role === ROLES.EDITOR ? 'Editor' : 'Viewer'}
                                        </span>
                                    )}

                                    {canManage && !isRowOwner && !isMe && (
                                        <button 
                                            className="btn-remove" 
                                            onClick={() => handleRemoveUser(perm.pid)}
                                            title="Remove access"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="share-footer">
                    <button className="btn-copy-link" onClick={handleCopyLink}>
                        🔗 Copy link
                    </button>
                    <button className="btn-done" onClick={onClose}>
                        Done
                    </button>
                </div>

                {toast && (
                    <div className={`toast-message ${toast.type === 'error' ? 'error' : ''}`}>
                        {toast.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareMenu;
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LineFileItem.css';
import FileDirContextMenu from '../../../FileDirContextMenu/FileDirContextMenu';
import { getFileById, getRole } from '../../../../utilities/api';
import { is_owner } from '../../../../utilities/roles';

function LineFileItem({ fileData, onAction }) {
    const navigate = useNavigate();

    const { fid, name, last_modified: date, parent_id, type, owner_avatar: avatarUrl, starred: isStarred } = fileData;

    const [locationName, setLocationName] = useState('Loading...');
    
    const [fileRole, setFileRole] = useState(0);
    const [isRoleLoading, setIsRoleLoading] = useState(true); 

    const [menuPosition, setMenuPosition] = useState(null);

    useEffect(() => {
        const fetchRole = async () => {
            if (!fileData?.fid) return;

            try {
                const role = await getRole(fileData.fid);
                setFileRole(role);
            } catch (error) {
                console.error("Failed to fetch role", error);
                setFileRole(0);
            } finally {
                setIsRoleLoading(false);
            }
        };

        fetchRole();
    }, [fileData]);

    const isMe = is_owner(fileRole);
    const ownerDisplayText = isRoleLoading ? '' : (isMe ? 'me' : fileData.owner_email);


    useEffect(() => {
        const fetchLocation = async () => {
            if (!parent_id || parent_id === 'root') {
                setLocationName('My Drive');
                return;
            }

            try {
                const response = await getFileById(parent_id);
                if (response.ok) {
                    const parentData = await response.json();
                    setLocationName(parentData.name);
                } else {
                    setLocationName('Unknown');
                }
            } catch (error) {
                console.error("Error fetching location:", error);
                setLocationName('Error');
            }
        };

        fetchLocation();
    }, [parent_id]);


    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const anchorRef = useRef(null);

    const getIcon = () => {
        switch(type) {
            case 'text': return '/docs_logo.png';
            case 'image': return '/picture_logo.png';
            case 'directory': return '/dir_logo.png';
            default: return '/docs_logo.png'; 
        }
    };

    const handleMenuAction = (actionName) => {
        setIsMenuOpen(false);
        if (onAction) {
            onAction(actionName);
        }
    };

    const handleRowClick = (e) => {
        e.stopPropagation();
        if (onAction) {
            onAction('open');
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setIsMenuOpen(true);
    };

    const handleLocationClick = (e) => {
        e.stopPropagation();
        if (parent_id === null) {
            navigate('/drive/my-drive');
        } else {
            navigate(`/drive/directories/${parent_id}`);
        }
    };

    return (
        <div className="line-file-item"
            onDoubleClick={handleRowClick}   
            onContextMenu={handleContextMenu}
        >
            
            <div className="col-name">
                <img src={getIcon()} alt="icon" className="file-icon-line" />
                <span className="text-name">{name}</span>
            </div>

            <div className="col-date">{new Date(date).toLocaleDateString()}</div>

            <div className="col-owner">
                <img src={avatarUrl} alt="me" className="owner-avatar-line" />
                <span className="owner-text" title={!isRoleLoading ? fileData.owner_email : ''}>
                    {ownerDisplayText}
                </span>
            </div>

            <div className="col-location">
                <div className='location-pill'
                    onClick={handleLocationClick}>
                    <img src="/dir_logo.png" alt="folder" className="folder-icon-line" style={{filter: 'grayscale(100%)'}} />
                    <span>{locationName}</span>
                </div>
            </div>

            <div className="col-menu">
                <div 
                    className="dots-btn-line" 
                    ref={anchorRef}
                    onClick={(e) => {
                        e.stopPropagation(); 
                        setMenuPosition(null);
                        setIsMenuOpen(true);
                    }}
                >
                    ⋮
                    {isMenuOpen && (
                        <FileDirContextMenu
                            fileID={fid} 
                            onClose={() => setIsMenuOpen(false)} 
                            onAction={handleMenuAction} 
                            isStarred={isStarred}
                            anchorRef={anchorRef}
                            anchorPosition={menuPosition}
                            isTrashed={fileData.trashed}
                        />
                    )}
                </div>
            </div>

        </div>
    );
}

export default LineFileItem;
import React, { useState, useRef } from 'react';
import './BoxFileItem.css';
import FileDirContextMenu from '../../../FileDirContextMenu/FileDirContextMenu';
import FilePreview from '../FilePreview/FilePreview';

function BoxFileItem({ fileData, showFooter = true, onAction }) {
    const {name, starred: isStarred, type, last_modified: lastOpened, owner_avatar: avatarUrl, previewUrl } = fileData;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const anchorRef = useRef(null);

    const getIcon = () => {
        switch(type) {
            case 'text': return '/docs_logo.png';
            case 'image': return '/picture_logo.png';
            case 'directory': return '/dir_logo.png';
            default: return '/docs_logo.png';
        }
    }

    const handleMenuAction = (actionName) => {
        setIsMenuOpen(false);
        if (onAction) {
            onAction(actionName);
        }
    };

    const handleCardClick = (e) => {
        e.stopPropagation();
        if (onAction) {
            onAction('open');
        }
    };

    const handleRightClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        setIsMenuOpen(true);
    };

    return (
        <div 
            className="box-file-wrapper"
            onDoubleClick={handleCardClick}
            onContextMenu={handleRightClick}
        >
            <div className="custom-card-container">
                <div className="card-header-area">
                    <div style={{display: 'flex', alignItems: 'center', width: '90%'}}>
                        <img src={getIcon()} alt={type} className="file-icon-small" />
                        <span className="file-title" title={name}>{name}</span>
                    </div>

                    <div className="action-btn" ref={anchorRef} onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}>
                        ⋮
                        {isMenuOpen && (
                            <FileDirContextMenu
                                fileID={fileData.fid} 
                                onClose={() => setIsMenuOpen(false)} 
                                onAction={handleMenuAction}
                                isStarred={isStarred}
                                anchorRef={anchorRef}
                                isTrashed={fileData.trashed}
                            />
                        )}
                    </div>
                </div>

                <div className="image-container">
                    {/* We pass the whole fileData object to the preview component */}
                    <FilePreview key={fileData.fid} fid={fileData.fid} type={fileData.type} />
                </div>

                {showFooter && (
                    <div className="card-footer-area detailed-footer">
                        {avatarUrl && <img src={avatarUrl} alt="User" className="user-img-footer" />}
                        <span>You opened • {new Date(lastOpened).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BoxFileItem;
import React from 'react';
import './BoxFileItem.css';
import DocsLogo from 'assets/docs_logo.png';
import PictureLogo from 'assets/picture_logo.png';
import DirLogo from 'assets/dir_logo-removebg.png';

function BoxFileItem({ name, type, date, avatarUrl, previewUrl, showFooter = true }) {

    const getIcon = () => {
        switch(type) {
            case 'text':
                return DocsLogo;
            case 'image':
                return PictureLogo;
            case 'directory':
                return DirLogo;
            default:
                return;
        }
    };

    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-4 mb-4">
            <div className="custom-card-container">
                
                <div className="card-header-area">
                    <div style={{display: 'flex', alignItems: 'center', width: '90%'}}>
                        <img src={getIcon()} alt={type} className="file-icon-small" />
                        <span className="file-title" title={name}>{name}</span>
                    </div>
                    <div className="action-btn">⋮</div>
                </div>

                <div className="image-container">
                    <img src={previewUrl} alt="File Preview" className="main-image" />
                </div>

                {showFooter ? (
                    
                    <div className="card-footer-area detailed-footer">
                        <img src={avatarUrl} alt="User" className="user-img-footer" />
                        <span>You opened • {new Date(date).toLocaleDateString()}</span>
                    </div>
                ) : (
                    
                    <div className="card-footer-area"></div>
                )}
            </div>
        </div>
    );
}

export default BoxFileItem;
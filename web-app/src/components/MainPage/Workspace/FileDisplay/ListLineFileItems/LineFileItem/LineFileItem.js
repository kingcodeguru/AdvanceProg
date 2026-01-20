import React from 'react';
import './LineFileItem.css';
import DocsLogo from 'assets/docs_logo.png';
import PictureLogo from 'assets/picture_logo.png';
import DirLogo from 'assets/dir_logo-removebg.png';


function LineFileItem({ name, date, owner, location, type, avatarUrl, lastOpened }) {

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
        <div className="line-file-item">
            
            <div className="col-name">
                <img 
                    src={getIcon()} 
                    alt="icon" 
                    className="file-icon-line" 
                />
                <span className="text-name">{name}</span>
            </div>

            <div className="col-date">
                {new Date(date).toLocaleDateString()}
            </div>

            <div className="col-owner">
                <img 
                    src={avatarUrl}
                    alt="me" 
                    className="owner-avatar-line" 
                />
                <span>{owner}</span>
            </div>

            <div className="col-location">
                <div className='location-pill'>
                    <img 
                        src={DirLogo}
                        alt="folder" 
                        className="folder-icon-line" 
                        style={{filter: 'grayscale(100%)'}} 
                    />
                    <span>{location}</span>
                </div>
            </div>

            <div className="col-menu">
                <div className="dots-btn-line">⋮</div>
            </div>

        </div>
    );
}

export default LineFileItem;
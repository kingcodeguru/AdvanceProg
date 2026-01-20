import React from 'react';
import LineFileItem from './LineFileItem/LineFileItem';
import './ListLineFileItems.css';
import EmptyFolder from '../../../assets/empty_folder-removebg.png';

function ListLineFileItems({ files, onAction }) {
    
    if (!files || files.length === 0) {
            return (
                <div className="empty-folder-container">
                    <img src={EmptyFolder} alt="Empty Folder" className="empty-folder-icon" />
                </div>
            );
    }

    return (
        <div className="list-container">
            <div className="list-header">
                <div className="col-name header-cell">Name</div>
                <div className="col-date header-cell">Date modified</div>
                <div className="col-owner header-cell">Owner</div>
                <div className="col-location2 header-cell">Location</div>
                <div className="col-menu header-cell">
                    <button className="header-icon-btn" >
                        <img src="/sort_icon.png" alt="menu icon" />
                    </button>
                </div>
            </div>

            <div className="files-list">
                {files.map((file) => (
                    <LineFileItem 
                        key={file.fid} 
                        fileData={file}
                        onAction={(actionName) => onAction(actionName, file)}
                    />
                ))}
            </div>
        </div>
    );
}

export default ListLineFileItems;
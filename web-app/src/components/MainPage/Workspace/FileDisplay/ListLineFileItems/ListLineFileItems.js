import React from 'react';
import LineFileItem from './LineFileItem/LineFileItem';
import './ListLineFileItems.css';
import SortIcon from 'assets/share_icon.png'
import EmptyFolder from 'assets/empty_folder-removebg.png';

function ListLineFileItems({ files }) {
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
                        <img src={SortIcon} alt="menu icon" />
                    </button>
                </div>
            </div>

            <div className="files-list">
                {files.map((file) => (
                    <LineFileItem 
                        key={file.id} 
                        name={file.name}
                        date={new Date(file.last_modified).toLocaleString()}
                        owner={file.owner_name}
                        location={file.location}
                        type={file.type}
                        avatarUrl={file.owner_avatar}
                    />
                ))}
            </div>
        </div>
    );
}

export default ListLineFileItems;
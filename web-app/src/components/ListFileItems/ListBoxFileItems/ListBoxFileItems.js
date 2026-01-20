import React from 'react';
import BoxFileItem from './BoxFileItem/BoxFileItem';
import EmptyFolder from '../../../assets/empty_folder-removebg.png';
import './ListBoxFileItems.css';

function ListBoxFileItems({ files, showFooter = true, onAction }) {

    if (!files || files.length === 0) {
            return (
                <div className="empty-folder-container">
                    <img src={EmptyFolder} alt="Empty Folder" className="empty-folder-icon" />
                </div>
            );
    }

    return (
        <div className="list-box-wrapper"> 
            <div className="files-grid-container"> 
                {files.map((file) => (
                    <BoxFileItem 
                        key={file.fid}
                        fileData={file}
                        showFooter={showFooter}
                        onAction={(actionName) => onAction(actionName, file)}
                    />
                ))}
            </div>
        </div>
    );
}

export default ListBoxFileItems;
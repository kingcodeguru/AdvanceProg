import React from 'react';
import BoxFileItem from './BoxFileItem/BoxFileItem';
import EmptyFolder from '../../../assets/empty_folder-removebg.png';

function ListBoxFileItems({ files }) {

    if (!files || files.length === 0) {
        return (
            <div className="empty-folder-container">
                <img src={EmptyFolder} alt="Empty Folder" className="empty-folder-icon" />
            </div>
        );
    }

    return (
        <div className="container-fluid p-4"> 
            
            <div className="row"> 
                {files.map((file) => (
                    <BoxFileItem 
                        key={file.id}
                        name={file.name}
                        type={file.type}
                        date={file.last_viewed}
                        avatarUrl={file.owner_avatar}
                        previewUrl={file.previewUrl}
                        showFooter={true}
                    />
                ))}
            </div>
        </div>
    );
}

export default ListBoxFileItems;
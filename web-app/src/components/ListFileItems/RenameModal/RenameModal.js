import React, { useState, useEffect, useRef } from 'react';
import './RenameModal.css'; 

const RenameModal = ({ fileName, onClose, onRename }) => {
    const [nameWithoutExt, setNameWithoutExt] = useState("");
    const [extension, setExtension] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (fileName) {
            const lastDotIndex = fileName.lastIndexOf('.');
            if (lastDotIndex > 0) {
                setNameWithoutExt(fileName.substring(0, lastDotIndex));
                setExtension(fileName.substring(lastDotIndex));
            } else {
                setNameWithoutExt(fileName);
                setExtension("");
            }

            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 10);
        }
    }, [fileName]);

    const handleSave = async () => {
        if (!nameWithoutExt.trim()) return;

        try {
            const finalName = nameWithoutExt + extension;
            await onRename(finalName); 
        } catch (error) {
            console.error("Rename failed:", error);
        } finally {
            onClose();
        }
    };

    if (!fileName) return null;

    return (
        <div className="rename-modal-overlay"> 
            
            <div className="rename-modal-content">
                <h3>Rename</h3>
                
                <div className="rename-input-wrapper">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={nameWithoutExt} 
                        onChange={(e) => setNameWithoutExt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    {extension && <span className="extension-text">{extension}</span>}
                </div>

                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="ok-btn" onClick={handleSave}>OK</button>
                </div>
            </div>
        </div>
    );
};

export default RenameModal;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import './ImageViewer.css';
import * as api from 'utilities/api';

const ImageViewer = () => {
    const { fileId } = useParams(); 
    const navigate = useNavigate();
    
    // File data states
    const [imageSrc, setImageSrc] = useState(null);
    const [fileName, setFileName] = useState("Image"); 
    const [loading, setLoading] = useState(true);

    // View controls states (Zoom and Rotate)
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const loadFileContent = async () => {
            const token = localStorage.getItem('userToken'); 
            
            if (!token) {
                alert("Please log in first");
                navigate('/login');
                return;
            }

            try {
                const response = await api.getFileById(fileId);

                if (!response.ok) throw new Error('Failed to load image');

                const data = await response.json();
                
                // save the content and the name
                setImageSrc(data.content); 
                if (data.name) {
                    setFileName(data.name);
                }

            } catch (error) {
                console.error("Error loading image:", error);
            } finally {
                setLoading(false);
            }
        };

        loadFileContent();
    }, [fileId, navigate]);

    const handleBack = () => {
        window.history.back();
    };

    // Image Manipulation Funcs

    const handleZoomIn = () => {
        setScale(prevScale => prevScale + 0.1);
    };

    const handleZoomOut = () => {
        // Don't let the image disappear (limit to 20%)
        if (scale > 0.2) {
            setScale(prevScale => prevScale - 0.1);
        }
    };

    const handleRotate = () => {
        setRotation(prevRotation => prevRotation + 90);
    };

    return (
        <div className="image-viewer-container">
            <div className="viewer-toolbar">
                {/* Left side: Back button and Title */}
                <div className="toolbar-left">
                    <button className="btn back-btn" onClick={handleBack} title="Back">
                        <span className="material-icons">arrow_back</span>
                    </button>
                    <div className="viewer-title">{fileName}</div>
                </div>

                {/* Right side: Image Actions (Zoom, Rotate) */}
                <div className="toolbar-actions">
                    <button className="icon-btn" onClick={handleZoomOut} title="Zoom Out">
                        <span className="material-icons">zoom_out</span>
                    </button>
                    <button className="icon-btn" onClick={handleZoomIn} title="Zoom In">
                        <span className="material-icons">zoom_in</span>
                    </button>
                    <button className="icon-btn" onClick={handleRotate} title="Rotate">
                        <span className="material-icons">rotate_right</span>
                    </button>
                </div>
            </div>

            <div className="image-display-area">
                {loading ? (
                    <div className="loading-text">Loading image...</div>
                ) : imageSrc ? (
                    <img 
                        src={imageSrc} 
                        alt={fileName} 
                        className="displayed-image"
                        // Apply the Zoom and Rotate styles dynamically
                        style={{ 
                            transform: `scale(${scale}) rotate(${rotation}deg)` 
                        }}
                        onError={(e) => { e.target.style.display='none'; alert("Error: Could not display image content."); }}
                    />
                ) : (
                    <div className="error-text">No image content found</div>
                )}
            </div>
        </div>
    );
};

export default ImageViewer;
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from 'utilities/api';
import './TextEditor.css';

const TextEditor = () => {
    // Get the file ID from the URL
    const { fileId } = useParams(); 
    const navigate = useNavigate();
    
    // UI states to manage the look of the editor
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentColor, setCurrentColor] = useState("#000000");
    const [fontSize, setFontSize] = useState(3);
    const [isSaving, setIsSaving] = useState(false);
    const [fileName, setFileName] = useState("Document");
    const [isReadOnly, setIsReadOnly] = useState(false);
    
    // State for the "Toast" notification
    const [saveStatus, setSaveStatus] = useState(null); // null, 'success', or 'error'

    // This is remembers exactly where the user selected text.
    const selectionRange = useRef(null);

    // This state keeps track of which buttons should be active.
    const [activeFormats, setActiveFormats] = useState({
        bold: false, italic: false, underline: false,
        justifyLeft: false, justifyCenter: false, justifyRight: false,
        insertOrderedList: false, insertUnorderedList: false,
    });

    // A reference to the actual div element where we type
    const editorRef = useRef(null);

    // colors for the picker
    const colors = [
        "#000000", "#434343", "#666666", "#999999", "#cccccc", "#efefef",
        "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", 
        "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"
    ];

    // Load the file content when the component starts
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

                if (!response.ok) throw new Error('Failed to load file');

                const data = await response.json();

                if (data.name) {
                    setFileName(data.name);
                }

                if (data.role === 0) {
                    setIsReadOnly(true);
                }
                
                if (editorRef.current) {
                    editorRef.current.innerHTML = data.content || ""; 
                }
            } catch (error) {
                console.error("Error loading file:", error);
                if (editorRef.current) {
                    editorRef.current.innerHTML = "Error loading content...";
                }
            }
        };

        loadFileContent();
    }, [fileId, navigate]);

    // func that save the changes to the server
    const handleSave = async () => {
        const token = localStorage.getItem('userToken');

        if (!token) {
            alert("Session expired. Please log in again.");
            navigate('/login');
            return;
        }

        setIsSaving(true);
        setSaveStatus(null); // Reset status
        
        const contentToSave = editorRef.current.innerHTML;

        try {
            const response = await api.patchFile(fileId, { content: contentToSave });

            if (!response.ok) throw new Error('Failed to save');
            
            // Show success message
            console.log("File saved");
            setSaveStatus('success');

            // Hide the message automatically after 3 seconds
            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
            
        } catch (error) {
            console.error("Error saving file:", error);
            setSaveStatus('error');
             // Hide the error message automatically after 3 seconds
             setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        window.history.back();
    };

    // Helper functions
    const updateToolbarState = () => {
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        });
        const currentSize = document.queryCommandValue('fontSize');
        if (currentSize) setFontSize(parseInt(currentSize));
    };

    const formatDoc = (cmd, value = null) => {
        document.execCommand(cmd, false, value);
        updateToolbarState();
        if (editorRef.current) editorRef.current.focus();
    };

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) selectionRange.current = selection.getRangeAt(0);
    };

    const restoreSelection = () => {
        const selection = window.getSelection();
        if (selectionRange.current) {
            selection.removeAllRanges();
            selection.addRange(selectionRange.current);
        }
    };

    const toggleColorPicker = () => {
        if (!showColorPicker) {
            saveSelection();
            setShowColorPicker(true);
        } else {
            setShowColorPicker(false);
        }
    };

    const applyPresetColor = (e, color) => {
        e.preventDefault();
        restoreSelection();
        formatDoc('foreColor', color);
        setCurrentColor(color);
        setShowColorPicker(false);
    };

    const changeFontSize = (step) => {
        let newSize = fontSize + step;
        if (newSize < 1) newSize = 1;
        if (newSize > 7) newSize = 7;
        formatDoc('fontSize', newSize);
        setFontSize(newSize);
    };

    return (
        <div className="editor-container">
            
            {/* Custom Styles for the Toast Notification */}
            <style>{`
                .toast-notification {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #333;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    font-family: 'Roboto', sans-serif;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: fadeIn 0.3s ease-in-out;
                }
                .toast-notification.success {
                    background-color: #2e7d32; /* Green for success */
                }
                .toast-notification.error {
                    background-color: #c62828; /* Red for error */
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>

            {/* Notification Logic */}
            {saveStatus === 'success' && (
                <div className="toast-notification success">
                    <span className="material-icons" style={{fontSize: '18px'}}>check_circle</span>
                    Saved successfully to Drive
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="toast-notification error">
                    <span className="material-icons" style={{fontSize: '18px'}}>error</span>
                    Error saving file
                </div>
            )}

            {showColorPicker && (
                <div className="screen-overlay" onClick={() => setShowColorPicker(false)} />
            )}

            <div className="toolbar">
                <button className="btn tool-btn back-to-drive-btn" onClick={handleBack} title="Back">
                    <span className="material-icons">arrow_back</span>
                </button>

                <span style={{
                    marginLeft: '10px',
                    marginRight: '10px',
                    fontWeight: '500',
                    color: '#444',
                    maxWidth: '200px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block'
                    }}>
                    {fileName}
                </span>
                
                <div className="divider"></div>

                {!isReadOnly && (
                    <>
                        <div className="toolbar-group">
                            <button className="btn tool-btn" onMouseDown={(e) => { e.preventDefault(); formatDoc('undo'); }}>
                                <span className="material-icons">undo</span>
                            </button>
                            <button className="btn tool-btn" onMouseDown={(e) => { e.preventDefault(); formatDoc('redo'); }}>
                                <span className="material-icons">redo</span>
                            </button>
                        </div>

                        <div className="toolbar-group font-size-group">
                            <button className="btn tool-btn font-btn" onClick={() => changeFontSize(-1)}>-</button>
                            <span className="font-size-display">{fontSize}</span>
                            <button className="btn tool-btn font-btn" onClick={() => changeFontSize(1)}>+</button>
                        </div>

                        <div className="divider"></div>

                        <div className="toolbar-group">
                            <button className={`btn tool-btn ${activeFormats.bold ? 'active' : ''}`} onMouseDown={(e) => { e.preventDefault(); formatDoc('bold'); }}><b>B</b></button>
                            <button className={`btn tool-btn ${activeFormats.italic ? 'active' : ''}`} onMouseDown={(e) => { e.preventDefault(); formatDoc('italic'); }}><i>I</i></button>
                            <button className={`btn tool-btn ${activeFormats.underline ? 'active' : ''}`} onMouseDown={(e) => { e.preventDefault(); formatDoc('underline'); }}><u>U</u></button>
                        </div>

                        <div className="toolbar-group relative-container">
                            <button 
                                className="btn tool-btn text-color-btn" 
                                onClick={toggleColorPicker}
                            >
                                <span className="text-icon">A</span>
                                <div className="color-bar" style={{backgroundColor: currentColor}}></div>
                            </button>

                            {showColorPicker && (
                                <div className="color-popup">
                                    <div className="color-grid">
                                        {colors.map((color) => (
                                            <div 
                                                key={color} 
                                                className="color-swatch" 
                                                style={{backgroundColor: color}} 
                                                onMouseDown={(e) => applyPresetColor(e, color)} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="divider"></div>
                        
                        <div className="toolbar-group">
                            <button className={`btn tool-btn ${activeFormats.justifyLeft ? 'active' : ''}`} onMouseDown={(e) => { e.preventDefault(); formatDoc('justifyLeft'); }}><span className="material-icons">format_align_left</span></button>
                            <button className={`btn tool-btn ${activeFormats.justifyCenter ? 'active' : ''}`} onMouseDown={(e) => { e.preventDefault(); formatDoc('justifyCenter'); }}><span className="material-icons">format_align_center</span></button>
                            <button className={`btn tool-btn ${activeFormats.justifyRight ? 'active' : ''}`} onMouseDown={(e) => { e.preventDefault(); formatDoc('justifyRight'); }}><span className="material-icons">format_align_right</span></button>
                        </div>

                        <div className="toolbar-group">
                            <button className={`btn tool-btn ${activeFormats.insertOrderedList ? 'active' : ''}`} onMouseDown={(e) => { e.preventDefault(); formatDoc('insertOrderedList'); }}><span className="material-icons">format_list_numbered</span></button>
                            <button className={`btn tool-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`} onMouseDown={(e) => { e.preventDefault(); formatDoc('insertUnorderedList'); }}><span className="material-icons">format_list_bulleted</span></button>
                        </div>

                        {/* Save Button */}
                        <button className="share-btn" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </>
                )}

                {isReadOnly && (
                    <div style={{marginLeft: 'auto', color: '#5f6368', fontWeight: '500', fontSize: '14px', paddingRight: '10px'}}>
                        View Only
                    </div>
                )}
            </div>

            <div className="editor-scroll-area">
                <div 
                    ref={editorRef}
                    className="document-page" 
                    contentEditable={!isReadOnly}
                    spellCheck="false"
                    onKeyUp={updateToolbarState}
                    onMouseUp={updateToolbarState}
                ></div>
            </div>
        </div>
    );
};

export default TextEditor;
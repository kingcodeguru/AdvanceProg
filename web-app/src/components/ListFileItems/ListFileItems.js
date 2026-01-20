import React, { useState } from 'react';
import { patchFile, deleteFile, setStar, getFileById, getFilesByDirectory } from '../../utilities/api';
import RenameModal from './RenameModal/RenameModal';
import MoveFileModal from './MoveFileModal/MoveFileModal'; 
import ShareMenu from '../ShareMenu/ShareMenu';
import { useNavigate } from 'react-router-dom';

import ListBoxFileItems from './ListBoxFileItems/ListBoxFileItems';
import ListLineFileItems from './ListLineFileItems/ListLineFileItems';

const ListFileItems = ({ files, viewMode, onRefresh, showFooter }) => {
    const navigate = useNavigate();
    
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

    

    const handleRenameSubmit = async (newName) => {
        if (!selectedFile) return;
        try {
            const response = await patchFile(selectedFile.fid, { name: newName });
            if (response.ok) {
                setIsRenameModalOpen(false);
                setSelectedFile(null);
                if (onRefresh) onRefresh();
            } else {
                console.error("Rename failed");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleStar = async (file, newStatus) => {
        try {
            const response = await setStar(file.fid, newStatus);
            if (response.ok && onRefresh) onRefresh();
        } catch (error) {
            console.error("Error toggling star", error);
        }
    };

    const deleteAction = async (file) => {
        if (file.trashed) {
            try {
                const response = await deleteFile(file.fid);
                if (response.ok && onRefresh) onRefresh();
                else {
                    const content = await response.json();
                    alert(response.status + ": " + content.error);
                }
            } catch (error) { 
                console.error(error); 
            }
        } else {
            try {
                const response = await patchFile(file.fid, { trashed: true });
                if (response.ok && onRefresh) onRefresh();
                else {
                    const content = await response.json();
                    alert(response.status + ": " + content.error);
                }
            } catch (error) { 
                console.error(error); 
            }
        }
    };


    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    //normal end

    // const downloadSingleFile = async (file) => {
    //     try {
    //         const response = await getFileById(file.fid);
    //         if (!response.ok) return;
    //         const fileData = await response.json();
    //         if (!fileData || fileData.content === undefined) return;

    //         let blob;
    //         const isImage = file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i);

    //         if (isImage) {
    //             try {
    //                 const cleanContent = fileData.content.replace(/^data:image\/\w+;base64,/, "");
    //                 const byteCharacters = atob(cleanContent);
    //                 const byteNumbers = new Array(byteCharacters.length);
    //                 for (let i = 0; i < byteCharacters.length; i++) {
    //                     byteNumbers[i] = byteCharacters.charCodeAt(i);
    //                 }
    //                 const byteArray = new Uint8Array(byteNumbers);
    //                 blob = new Blob([byteArray], { type: "application/octet-stream" });
    //             } catch (e) {
    //                 blob = new Blob([fileData.content], { type: "text/plain" });
    //             }
    //         } else {
    //             blob = new Blob([fileData.content], { type: "text/plain" });
    //         }

    //         const url = window.URL.createObjectURL(blob);
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.setAttribute('download', file.name);
    //         document.body.appendChild(link);
    //         link.click();
    //         link.parentNode.removeChild(link);
    //         window.URL.revokeObjectURL(url);
    //     } catch (error) {
    //         console.error("Error downloading file:", file.name, error);
    //     }
    // };


    //html end
    const downloadSingleFile = async (file) => {
        try {
            const response = await getFileById(file.fid);
            if (!response.ok) return;
            const fileData = await response.json();
            if (!fileData || fileData.content === undefined) return;

            let blob;
            const isImage = file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i);

            if (isImage) {
                try {
                    const cleanContent = fileData.content.replace(/^data:image\/\w+;base64,/, "");
                    const byteCharacters = atob(cleanContent);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    blob = new Blob([byteArray], { type: "application/octet-stream" });
                } catch (e) {
                    blob = new Blob([fileData.content], { type: "text/plain" });
                }
            } else {
                blob = new Blob([fileData.content], { type: "text/plain" });
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const lastDotIndex = file.name.lastIndexOf('.');
            const baseName = lastDotIndex !== -1 
                ? file.name.substring(0, lastDotIndex) 
                : file.name;

            const finalName = `${baseName}.html`;

            link.setAttribute('download', finalName);
            
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", file.name, error);
        }
    };



    const getAllFilesFromFolder = async (folderId, filesList = []) => {
        try {
            const res = await getFilesByDirectory(folderId);
            if (!res.ok) return filesList;
            const items = await res.json();

            for (const item of items) {
                if (item.type === 'directory') {
                    await getAllFilesFromFolder(item.fid, filesList);
                } else {
                    filesList.push(item);
                }
            }
        } catch (error) {
            console.error(error);
        }
        return filesList;
    };

    const handleDownload = async (file) => {
        if (file.type === 'directory') {
            const allFiles = await getAllFilesFromFolder(file.fid);
            
            if (allFiles.length === 0) {
                alert("The folder is empty");
                return;
            }

            for (const singleFile of allFiles) {
                await downloadSingleFile(singleFile);
                await delay(500); 
            }
        } else {
            await downloadSingleFile(file);
        }
    };

    const openAction = (file) => { 
        if (file.type === 'directory') {
            navigate(`/drive/directories/${file.fid}`);
        } else if (file.type === 'text') {
            navigate(`/drive/files/${file.fid}`);
        } else if (file.type === 'image') {
            navigate(`/drive/images/${file.fid}`);
        } else {
            alert('unmatching file type: ' + file.type);
        }
    };

    const shareFileAction = (file) => { 
        setSelectedFile(file);
        setIsShareMenuOpen(true);
    };

    const copyLinkAction = (file) => { 
        const link = `${window.location.origin}/drive/files/${file.fid}`;
        navigator.clipboard.writeText(link).catch((err) => {
            console.error(err);
        });
    };

    const restoreFile = async (file) => {
        try {
            const response = await patchFile(file.fid, { trashed: false });
            if (response.ok && onRefresh) onRefresh();
            else {
                const content = await response.json();
                alert(response.status + ": " + content.error);
            }
        } catch (error) { 
            console.error(error); 
        }
    };

    const handleAction = async (actionName, file) => {
        
        setSelectedFile(file);

        const actions = {
            'rename': () => setIsRenameModalOpen(true),
            'move': () => setIsMoveModalOpen(true),     
            'add_star': () => toggleStar(file, true),
            'remove_star': () => toggleStar(file, false),
            'delete': () => deleteAction(file),
            'download': () => handleDownload(file),
            'open': () => openAction(file),
            'share_file': () => shareFileAction(file),
            'copy_link': () => copyLinkAction(file),
            'restore': () => restoreFile(file)
        };

        const selectedAction = actions[actionName];
        if (selectedAction) await selectedAction();
    };
    

    return (
        <>
            
            {viewMode === 'line' ? (
                <ListLineFileItems 
                    files={files} 
                    onAction={handleAction} 
                />
            ) : (
                <ListBoxFileItems 
                    files={files} 
                    showFooter={showFooter} 
                    onAction={handleAction} 
                />
            )}

            
            {isRenameModalOpen && selectedFile && (
                <RenameModal 
                    fileName={selectedFile.name} 
                    onClose={() => { setIsRenameModalOpen(false); setSelectedFile(null); }}
                    onRename={handleRenameSubmit} 
                />
            )}

            {isMoveModalOpen && selectedFile && (
                <MoveFileModal 
                    fileId={selectedFile.fid}
                    fileName={selectedFile.name}
                    onClose={() => { setIsMoveModalOpen(false); setSelectedFile(null); }}
                    onMoveSuccess={() => {
                       if (onRefresh) onRefresh();
                    }}
                />
            )}

            {isShareMenuOpen && selectedFile && (
                <ShareMenu
                    isOpen={isShareMenuOpen}
                    fileId={selectedFile.fid}
                    fileName={selectedFile.name}
                    onClose={() => { setIsShareMenuOpen(false); setSelectedFile(null); }}
                />
            )}
        </>
    );
};

export default ListFileItems;
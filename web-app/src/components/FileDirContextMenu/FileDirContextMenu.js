import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './FileDirContextMenu.css';
import { can_change_permissions, can_edit, can_view } from '../../utilities/roles'; 
import { getRole, getFileById } from '../../utilities/api'; 

function FileDirContextMenu({ fileID, onClose, onAction, isStarred, anchorRef, anchorPosition, isTrashed }) {
    
    const menuRef = useRef(null);
    const [menuStyle, setMenuStyle] = useState({ opacity: 0 }); 

    const [roles, setRoles] = useState({
        fileRole: 0,
        parentRole: 0,
        isLoading: true 
    });

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const fRole = await getRole(fileID);
                let pId = "";
                try {
                    const fileData = await getFileById(fileID);
                    if (fileData.ok) { 
                        const json = await fileData.json();
                        pId = json.parent_id;
                    } else if (fileData.parent_id) { 
                        pId = fileData.parent_id;
                    }
                } catch (e) { console.error("Error getting parent ID", e); }

                let pRole = 0;
                if (pId && pId !== 'root') {
                    pRole = await getRole(pId);
                } else {
                     pRole = 2; 
                }

                if (isMounted) {
                    setRoles({
                        fileRole: fRole || 0,
                        parentRole: pRole || 0,
                        isLoading: false
                    });
                }
            } catch (error) {
                console.error("Error fetching roles:", error);
                if (isMounted) setRoles(prev => ({ ...prev, isLoading: false }));
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [fileID]);


    useLayoutEffect(() => {
        if (!menuRef.current) return;
        if (!anchorPosition && (!anchorRef || !anchorRef.current)) return;

        const menuRect = menuRef.current.getBoundingClientRect();
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        let newStyle = { 
            position: 'fixed', 
            opacity: 1,
            zIndex: 9999 
        }; 

        let baseLeft = 0, baseTop = 0, baseRight = 0, baseBottom = 0;

        if (anchorPosition) {
            baseLeft = anchorPosition.x;
            baseTop = anchorPosition.y;
            baseRight = anchorPosition.x; 
            baseBottom = anchorPosition.y;
        } else if (anchorRef && anchorRef.current) {
            const anchorRect = anchorRef.current.getBoundingClientRect();
            baseLeft = anchorRect.left;
            baseTop = anchorRect.bottom;
            baseRight = anchorRect.right;
            baseBottom = anchorRect.top;
        }

        if (baseLeft + menuRect.width > screenW) {
            newStyle.left = (baseRight - menuRect.width) + 'px';
            newStyle.transformOrigin = 'top right';
        } else {
            newStyle.left = baseLeft + 'px';
            newStyle.transformOrigin = 'top left';
        }

        if (baseTop + menuRect.height > screenH) {
            const bottomPoint = anchorPosition ? anchorPosition.y : baseBottom;
            newStyle.top = (bottomPoint - menuRect.height) + 'px';
            newStyle.transformOrigin = 'bottom ' + (newStyle.transformOrigin.includes('left') ? 'left' : 'right');
        } else {
            newStyle.top = baseTop + 'px';
        }

        setMenuStyle(newStyle);

    }, [anchorRef, anchorPosition, roles.isLoading]);


    const handleSubMenuEnter = (e) => {
        const item = e.currentTarget;
        const submenu = item.querySelector('.submenu');
        if (!submenu) return;

        const rect = item.getBoundingClientRect();
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        
        const submenuW = 200; 
        const submenuH = submenu.scrollHeight || 200;

        if (rect.right + submenuW > screenW) {
            submenu.classList.add('open-left');
        } else {
            submenu.classList.remove('open-left');
        }

        if (rect.top + submenuH > screenH) {
            submenu.classList.add('open-up');
        } else {
            submenu.classList.remove('open-up');
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                 if (anchorRef.current && anchorRef.current.contains(event.target)) {
                     return; 
                 }
                 onClose();
            }
        }

        document.addEventListener("click", handleClickOutside, true);
        window.addEventListener("scroll", onClose, true); 
        window.addEventListener("resize", onClose, true);

        return () => {
            document.removeEventListener("click", handleClickOutside, true);
            window.removeEventListener("scroll", onClose, true);
            window.removeEventListener("resize", onClose, true);
        };
    }, [onClose, anchorRef]);

    const handleItemClick = (actionName, e) => {
        e.stopPropagation();
        onAction(actionName);
        onClose();
    };

    if (roles.isLoading) return null; 

    const { fileRole, parentRole } = roles;

    const content = (
        <div 
            className="file-dir-context-menu" 
            ref={menuRef} 
            style={menuStyle}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
            {can_view(fileRole) && (
                <div className="menu-item" onClick={(e) => handleItemClick('open', e)}>
                <img src="/open_icon.png" alt="" className="menu-icon-img" /> Open
                </div>
            )}

            {can_view(fileRole) && (
                <div className="menu-item" onClick={(e) => handleItemClick('download', e)}>
                <img src="/download_icon.png" alt="" className="menu-icon-img" /> Download
                </div>
            )}

            {can_edit(fileRole) && (
                <div className="menu-item" onClick={(e) => handleItemClick('rename', e)}>
                <img src="/rename_icon.png" alt="" className="menu-icon-img" /> Rename
                </div>
            )}

            <div className="menu-divider"></div>

            {can_change_permissions(fileRole) && (
                <div 
                className="menu-item has-submenu" 
                onMouseEnter={handleSubMenuEnter}
                >
                <img src="/share_icon.png" alt="" className="menu-icon-img" />
                Share
                <span className="arrow-icon">▶</span>
                <div className="submenu">
                     <div className="menu-item" onClick={(e) => handleItemClick('share_file', e)}>
                        <img src="/share_person_icon.png" alt="" className="menu-icon-img" /> Share
                    </div>
                     <div className="menu-item" onClick={(e) => handleItemClick('copy_link', e)}>
                        <img src="/link_icon.png" alt="" className="menu-icon-img" /> Copy link
                    </div>
                </div>
                </div>
            )}

            <div 
                className="menu-item has-submenu"
                onMouseEnter={handleSubMenuEnter}
            >
                <img src="/organize_icon.png" alt="" className="menu-icon-img" />
                Organize
                <span className="arrow-icon">▶</span>
                <div className="submenu">
                    {can_edit(fileRole) && can_edit(parentRole) && (
                        <div className="menu-item" onClick={(e) => handleItemClick('move', e)}>
                        <img src="/move_folder_icon.png" alt="" className="menu-icon-img" /> Move
                        </div>
                    )}
                    
                    {can_view(fileRole) && (
                        <div className="menu-item" onClick={(e) => handleItemClick(isStarred ? 'remove_star' : 'add_star', e)}>
                         <svg 
                            width="20" height="20" 
                            viewBox="0 0 24 24" 
                            className="menu-icon-svg"
                            style={{ minWidth: '20px' }} 
                            fill={isStarred ? "#fbbc04" : "none"} 
                            stroke={isStarred ? "none" : "#5f6368"}
                            strokeWidth="2"
                        >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        {isStarred ? "Remove from starred" : "Add to starred"}
                        </div>
                    )}
                </div>
            </div>

            <div className="menu-divider"></div>
            
            {can_edit(fileRole) && (

                <div className="menu-item" onClick={(e) => handleItemClick('delete', e)}>
                        <img src="/remove_icon.png" alt="" className="menu-icon-img" /> Remove
                </div>
            )}
            {can_edit(fileRole) && isTrashed && (
                <div className="menu-item" onClick={(e) => handleItemClick('restore', e)}>
                    <img src="/restore_icon.png" alt="" className="menu-icon-img" /> Restore
                </div>
            )}

        </div>
    );

    return ReactDOM.createPortal(content, document.body);
}

export default FileDirContextMenu;
import React, { useState, useEffect } from 'react';
import './FilePreview.css';
import * as api from 'utilities/api';

import text from 'assets/Liel-Text.png';
import directory from 'assets/Tamar-Folder.png';
import image from 'assets/Orel-Image.png';

const FilePreview = ({ type }) => {
    const typeToImage = {
        'image': image,
        'text': text,
        'directory': directory
    }

    return (
        <img 
            src={typeToImage[type]} 
            alt="preview" 
            className="preview-image-content"
        />
    );
};

export default FilePreview;
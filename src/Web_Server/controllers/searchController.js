const Model = require('../services/fileService');
const { HttpError, handleError } = require('../utilities/errors/HttpError');
const token2uid = require('../utilities/tokens/token2uid'); // Added

const CODES = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401, // Added for token check
    SERVER_ERROR: 500
};

const getMatchingFiles = async (req, res) => {
    const query = req.params.query;
    
    // Extract UID from Token
    const authHeader = req.headers.authorization;
    const uid = token2uid(authHeader); 
    
    if (!uid) {
        return res.status(CODES.UNAUTHORIZED).json({ error: 'Valid token required' });
    }

    if (!query) {
        return res.status(CODES.BAD_REQUEST).json({ error: 'Search query is required' });
    }

    try {
        const matchingFiles = await Model.getMatchingFiles(uid, query);
        return res.status(CODES.OK).json(matchingFiles);
    } catch (error) {
        return handleError(error, res);
    }
};

module.exports = {
    getMatchingFiles
};
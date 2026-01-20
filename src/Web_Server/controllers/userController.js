const { postUser: postUserModel, getUser: getUserModel } = require('../models/userModel');
const { HttpError, handleError } = require('../utilities/errors/HttpError');
const vp = require('../utilities/validation/validParameters');             // Valid check for parameters
const token2uid = require('../utilities/tokens/token2uid');                            // converts token to uid

// HTTP Status codes
const CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    SERVER_ERROR: 500
};

const postUser = async (req, res) => {
    // Get data from body
    const { name, password, email, avatar } = req.body;

    try {
        const user = { name, password, email, avatar };
        vp.validateUser(user);
        // Create user in model, ignore uid
        await postUserModel(user);
        // Return success - nothing to return
        return res.status(CODES.NO_CONTENT).end();
    } catch (error) {
        return handleError(error, res);
    }
};

const getMe = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).send("No token provided");
    const userId = token2uid(authHeader);

    try {
        // Get user details
        const userDetails = await getUserModel(userId);
        return res.status(CODES.OK).json(userDetails);
    } catch (error) {
        return handleError(error, res);
    }
};

const getUser = async (req, res) => {
    // receive user ID from request parameters
    const userId = req.params.id;

    if (!userId) {
        return res.status(CODES.BAD_REQUEST).json({ error: 'User ID is required' });
    }

    try {
        // Get user details
        const userDetails = await getUserModel(userId);
        // you can view only this fields through this command
        const filteredUserDetails = { id: userDetails.id, name: userDetails.name, email: userDetails.email, avatar: userDetails.avatar };
        return res.status(CODES.OK).json(filteredUserDetails);
    } catch (error) {
        return handleError(error, res);
    }
};

module.exports = {
    postUser,
    getUser,
    getMe
};
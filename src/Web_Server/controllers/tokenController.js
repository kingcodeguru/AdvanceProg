const jwt = require("jsonwebtoken");
const { key } = require("../utilities/tokens/key.json"); 
const { postTokens: postTokensModel } = require('../services/userService');
const { HttpError, handleError } = require('../utilities/errors/HttpError');

const CODES = {
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    SERVER_ERROR: 500
};

const postTokens = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(CODES.BAD_REQUEST).json({ error: 'email and password are required' });
    }

    try {
        const uid = await postTokensModel(email, password);

        // the payload is some kind of hidden data that is inside the key.
        // we are giving a user the token when inside is the uid.
        const payload = { uid };

        // sign the token, 1 hour timeout for the token
        const token = jwt.sign(payload, key, { expiresIn: '1h' });
        return res.status(CODES.CREATED).json({ token });

    } catch (error) {
        return handleError(error, res);
    }
};

module.exports = {
    postTokens,
};
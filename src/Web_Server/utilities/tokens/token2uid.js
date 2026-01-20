// jwt library for tokens
const jwt = require("jsonwebtoken");
const { key } = require("./key.json"); // Import the key from the JSON file

/**
 * Extracts the user ID from a JWT token.
 * @param {string} token - The Bearer token from the header.
 * @returns {string|null} - The uid if valid, otherwise null.
 */
const token2uid = (token) => {
    try {
        // If the token starts with "Bearer ", remove it
        const actualToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
        const decoded = jwt.verify(actualToken, key);
        return decoded.uid; // Returning the uid we put in the payload
    } catch (err) {
        console.error("Token translation error:", err.message);
        return null;
    }
};

module.exports = token2uid;
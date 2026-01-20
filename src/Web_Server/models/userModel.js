// This javascript file contains the functions that are in the model, i.e. the logical happens
// here and so is the communication with the file system.

const idg = require('../utilities/ID/idGenerator');                         // id generator - to get unique IDs
const db = require('../utilities/database/DataManager');                    // Database
const vv = require('../utilities/validation/validValues');                  // Valid values
const { HttpError, STATUSCODE } = require('../utilities/errors/HttpError'); // HttpError for error handling
const { getSingleUser } = require('../utilities/database/getSingle');

//###############################
// User Related functions
//###############################

/**
 * This function creates a new user.
 * @param {User} user 
 * @returns {string}
 * @throws {Error} when cannot create the user
 */
function postUser(user) {
    // check if user is valid
    vv.validateUser(user);

    user.uid = idg.generateId();
    try {
        db.PostUser(user);
    } catch (error) {
        throw new HttpError(STATUSCODE.CONFLICT, "user with this email already exists");
    }
    return user.uid;
}

/**
 * This function returns the user with the given id.
 * @param {string} uid 
 * @returns {User}
 * @throws {Error} when cannot find the user
 */
function getUser(uid) {
    return getSingleUser(uid);
}

/**
 * This function checks if name and password are valid and if so - returns the uid.
 * @param {name: string} name
 * @param {password: string} password 
 * @returns {uid}
 */
function postTokens(email, password) {
    let list_users = db.LogIn(email, password);
    if (list_users.length == 0) {
        throw new HttpError(STATUSCODE.UNAUTHORIZED, "wrong name or password");
    } else if (list_users.length > 1) {
        throw new HttpError(STATUSCODE.INTERNAL_SERVER_ERROR, "server error - uid isn't unique");
    } else {
        return list_users[0].uid;
    }
}

/**
 * This function returns the uid of the user with the given email.
 * @param {string} email 
 * @returns {string} uid
 * @throws {Error} when cannot find the user
 */
function getUidByEmail(email) {
    let list_users = db.GetUserByEmail(email);
    if (list_users.length === 0) {
        throw new HttpError(STATUSCODE.NOT_FOUND, "User not found");
    } else if (list_users.length > 1) {
        throw new HttpError(STATUSCODE.INTERNAL_SERVER_ERROR, "Server error - email isn't unique");
    } else {
        return list_users[0].uid;
    }
}

module.exports = {
    postUser,
    getUser,
    postTokens,
    getUidByEmail
}

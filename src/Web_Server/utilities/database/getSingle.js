// This file is a helper file that many other js files use.
// It's point is to avoid unnecessary redundancy of repeating function.

const db = require('./DataManager');                                          // Database
const { HttpError, STATUSCODE } = require('../errors/HttpError'); // HttpError for error handling

/**
 * 
 * @param {string} fid 
 * @returns The single file with the given id
 * @throws {HttpError} when cannot find the file or when there is more than one
 */
async function getSingleFile(fid) {
    const list_files = await db.GetFileDir(fid);
    if (list_files.length == 0) {
        throw new HttpError(STATUSCODE.NOT_FOUND, `couldn't find filedir ${fid}`);
    } else if (list_files.length > 1) {
        throw new HttpError(STATUSCODE.INTERNAL_SERVER_ERROR, "server error - fid isn't unique");
    }
    return list_files[0];
}

/**
 * @param {string} uid 
 * @returns the user with the given id
 * @throws {HttpError} when cannot find the user
 */
async function getSingleUser(uid) {
    // Check if user exists
    const userList = await db.GetUser(uid);
    if (userList.length == 0) {
        throw new HttpError(STATUSCODE.NOT_FOUND, `couldn't find user ${uid}`);
    }
    if (userList.length > 1) {
        throw new HttpError(STATUSCODE.INTERNAL_SERVER_ERROR, "server error - uid isn't unique");
    }
    const {password, ...userWithoutPassword} = userList[0]; // remove password field
    return userWithoutPassword;
}

/**
 * @param {string} pid 
 * @returns the permission with the given id
 * @throws {HttpError} when cannot find the permission
 */
async function getSinglePermission(pid) {
    // Check if user exists
    const permList = await db.GetPermissionsByPid(pid);
    if (permList.length == 0) {
        throw new HttpError(STATUSCODE.NOT_FOUND, `couldn't find permission ${pid}`);
    }
    if (permList.length > 1) {
        throw new HttpError(STATUSCODE.INTERNAL_SERVER_ERROR, "server error - pid isn't unique");
    }
    return permList[0]
}

/**
 * 
 * @param {string} uid 
 * @param {string} fid 
 * @returns the role of the user with uid in the file with fid
 */
async function getRole(uid, fid) {
    // Receive list of premissions
    const list_premissions = await db.GetPermissions(uid, fid);
    if (list_premissions.length == 0) {
        // the user have no access to the file
        throw new HttpError(STATUSCODE.FORBIDDEN, `user ${uid} cannot access the file/dir ${fid}`);
    } else if (list_premissions.length > 1) {
        // Some kind of error
        throw new HttpError(STATUSCODE.INTERNAL_SERVER_ERROR, "server error - role isn't unique");
    } else {
        return list_premissions[0].role
    }
}

module.exports = {
    getSingleFile,
    getSingleUser,
    getSinglePermission,
    getRole
}
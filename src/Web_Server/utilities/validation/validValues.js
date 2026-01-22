const { HttpError, STATUSCODE } = require('../errors/HttpError');
const db = require('../database/DataManager');  // Database
const ROLES = require('../roles/roles');        // Roles

// get 4 function that simplify getting things from the database
const { getSingleFile, getSingleUser, getSinglePermission, getRole } = require('../database/getSingle');
/**
 * for each existing argument, check if the argument is valid according to this:
 * user.name: could be any string.
 * user.avatar: must be base64 string.
 * user.password: could be any string.
 * user.email: must be a valid email address.
 * @param {User} user 
 */
async function validateUser(user) {
    // check name
    if (user.name !== undefined) {
        if (typeof user.name !== 'string') {throw new HttpError(STATUSCODE.BAD_REQUEST, "name isn't string");}
    }
    // check avatar
    if (user.avatar !== undefined) {
        if (typeof user.avatar !== 'string') {throw new HttpError(STATUSCODE.BAD_REQUEST, "avatar isn't string");}
        // base64:
        const base64Regex = /^data:image\/(?:jpeg|png|gif);base64,[A-Za-z0-9+/]+={0,2}$/;
        if (!base64Regex.test(user.avatar)) {throw new HttpError(STATUSCODE.BAD_REQUEST, "avatar isn't base64 string");}
    }
    // check password
    if (user.password !== undefined) {
        if (typeof user.password !== 'string') {throw new HttpError(STATUSCODE.BAD_REQUEST, "password isn't string");}
        if (user.password.length < 6) {throw new HttpError(STATUSCODE.BAD_REQUEST, "password must be at least 6 characters");}
        if (user.password.length > 100) {throw new HttpError(STATUSCODE.BAD_REQUEST, "password must be at most 100 characters");}
        // password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,100}$/;
        if (!passwordRegex.test(user.password)) {
            throw new HttpError(STATUSCODE.BAD_REQUEST, "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
        }
    }
    // check email
    if (user.email !== undefined) {
        if (typeof user.email !== 'string') {throw new HttpError(STATUSCODE.BAD_REQUEST, "email isn't string");}
        // email adderss:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {throw new HttpError(STATUSCODE.BAD_REQUEST, "email isn't valid");}
    }
    // creating new empty list of starred files
    user.starred_files = [];
}

/**
 * for each existing argument, check if the argument is valid according to this:
 * filedir.name: only one word!
 * filedir.parent_id: id of an existing directory or null to represent root
 * filedir.is_file: boolean
 * @param {User} user 
 */
async function validateFileDir(filedir, is_patch=false) {
    if (is_patch) {
        await validateFileDirPatch(filedir);
    } else {
        await validateFileDirPost(filedir);
    }
}

async function validateFileDirPatch(filedir) {
    // check name
    if (filedir.name !== undefined) {
        if (typeof filedir.name !== 'string') {throw new HttpError(STATUSCODE.BAD_REQUEST, "name isn't string");}
    }
    // check is_file
    if (filedir.is_file !== undefined) {
        if (typeof filedir.is_file !== 'boolean') {throw new HttpError(STATUSCODE.BAD_REQUEST, "is_file isn't boolean");}
    }

    // fid is a field of filedir
    if (filedir.fid !== undefined) {
        // cannot change id!
        throw new HttpError(STATUSCODE.BAD_REQUEST, "Cannot change fid");
    }
    // is_file is a field of filedir
    if (filedir.is_file !== undefined) {
        // cannot change is_file!
        throw new HttpError(STATUSCODE.BAD_REQUEST, "Cannot change is_file");
    }
    if (filedir.parent_id !== undefined && filedir.parent_id !== null) {
        const new_parent_id = filedir.parent_id;
        const new_parent = await getSingleFile(new_parent_id);
        if (new_parent.is_file) {
            // new parent_id must be existing directory
            throw new HttpError(STATUSCODE.BAD_REQUEST, "new parent_id must be directory");
        }
    }
    if (filedir.trashed !== undefined) {
        if (typeof filedir.trashed !== 'boolean') {throw new HttpError(STATUSCODE.BAD_REQUEST, "trashed isn't boolean");}
    }
}

const possible_types = ['text', 'image', 'directory'];

async function validateFileDirPost(filedir) {
    // types
    if (typeof filedir.name !== 'string') {throw new HttpError(STATUSCODE.BAD_REQUEST, "name isn't string");}
    if (typeof filedir.is_file !== 'boolean') {throw new HttpError(STATUSCODE.BAD_REQUEST, "is_file isn't boolean");}
    if (filedir.parent_id !== null && typeof filedir.parent_id !== 'string') {throw new HttpError(STATUSCODE.BAD_REQUEST, "parent_id isn't string");}

    if (typeof filedir.type !== 'string') {throw new HttpError(STATUSCODE.BAD_REQUEST, "type isn't string");}
    if (!possible_types.includes(filedir.type)) {throw new HttpError(STATUSCODE.BAD_REQUEST, `type must be one of: ${possible_types.join(', ')}`);}

    // if parent_id is undefined - set it to be the main directory
    if (filedir.parent_id === undefined) {
        filedir.parent_id = null;
    }
    // parent exists
    if (filedir.parent_id !== null) {
        // parent_id is not null - check it
        const dir = await getSingleFile(filedir.parent_id);
        if (dir.is_file) {
            throw new HttpError(STATUSCODE.BAD_REQUEST, "parent_id isn't a directory");
        }
    }
    // mark as not trashed as default
    filedir.trashed = false;

}
/**
 * for each existing argument, check if the argument is valid according to this:
 * permission.fid: id of an existing file or directory
 * permission.role: 1 number between 1 and the number of roles
 * permission.uid: id of an existing user
 */
async function validatePermission(permission, is_patch=false) {
    if (is_patch) {
        await validatePermissionPatch(permission);
    } else {
        await validatePermissionPost(permission);
    }
}

async function validatePermissionPost(permission) {
    // check fid
    if (typeof permission.fid !== 'string') {throw new HttpError(STATUSCODE.BAD_REQUEST, "fid isn't string");}
    // check for the fileidr - if such file/directory exist
    await getSingleFile(permission.fid); // check if file exsits

    // check uid
    if (typeof permission.uid !== 'string') {throw new HttpError(STATUSCODE.BAD_REQUEST, "uid isn't string");}
    // check for the user - if such user exist
    await getSingleUser(permission.uid); // check if user exsits

    // check role
    if (!Number.isInteger(permission.role)) {throw new HttpError(STATUSCODE.BAD_REQUEST, "role isn't integer");}
    // check for the role
    if (!(ROLES.MIN_ROLE <= permission.role && permission.role <= ROLES.MAX_ROLE)) {
        throw new HttpError(STATUSCODE.BAD_REQUEST, `role isn't between ${ROLES.MIN_ROLE} and ${ROLES.MAX_ROLE}.`);
    }
}
async function validatePermissionPatch(permission) {
    // fid
    if (permission.fid === undefined) {
        // cannot change fid!
        throw new HttpError(STATUSCODE.BAD_REQUEST, "Cannot change fid");
    }

    // uid
    if (permission.uid === undefined) {
        // cannot change uid!
        throw new HttpError(STATUSCODE.BAD_REQUEST, "Cannot change uid");
    }

    // check role
    if (!Number.isInteger(permission.role)) {throw new HttpError(STATUSCODE.BAD_REQUEST, "role isn't integer");}
    // check for the role
    if (!(ROLES.MIN_ROLE <= permission.role && permission.role <= ROLES.MAX_ROLE)) {
        throw new HttpError(STATUSCODE.BAD_REQUEST, `role isn't between ${ROLES.MIN_ROLE} and ${ROLES.MAX_ROLE}.`);
    }
}

module.exports = { 
    validateUser,
    validateFileDir,
    validatePermission
};

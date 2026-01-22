// This javascript file contains the functions that are in the model, i.e. the logical happens
// here and so is the communication with the file system.

const idg = require('../utilities/ID/idGenerator');                         // id generator - to get unique IDs
const db = require('../utilities/database/DataManager');                    // Database
const fs = require('../utilities/file_server/fileServerConnection');        // File Server
const ROLES = require('../utilities/roles/roles');                          // Roles
const vv = require('../utilities/validation/validValues');                  // Valid values
const { HttpError, STATUSCODE } = require('../utilities/errors/HttpError'); // HttpError for error handling

// get 4 function that simplify getting things from the database
const { getSingleFile, 
    getSingleUser, 
    getSinglePermission, 
    getRole } 
    = require('../utilities/database/getSingle');


/**
 * There are some fields that provided automatically on the file.
 * 'name' of a file is a field that is saved on the DB.
 * 'starred' of a file is not such, because it can change between different users.
 * but when a user receive a list of file it expect it to have the hidden fields.
 * and so, this helper function provide with several more fields the file doesn't have
 * but the user doesn't know it:
 * 1. starred
 * 2. Owner (user) - name, email, avatar
 * 3. parent dir's name
 * @param {File} file 
 */
async function additionalFields(file, uid) {
    const user = await getSingleUser(uid);
    file.starred = user.starred_files.includes(file.fid);

    let l_perm = await db.GetPermissionsAll(file.fid);
    l_perm = l_perm.filter(perm => perm.role === ROLES.owner);
    const owner = await getSingleUser(l_perm[0].uid);

    file.owner_avatar = owner.avatar;
    file.owner_name = owner.name;
    file.owner_email = owner.email;

    file.location = file.parent_id ? (await getSingleFile(file.parent_id)).name : "My Drive";

    return file;
}

/**
 * perform additionalFields on each file
 * it can also filter files that are trashed - if flag is set to true
 */
async function addFieldsForAll(files, uid, filterTrashed = true) {
    const filtered = [];
    for (const file of files) {
        if (filterTrashed && file.trashed) {
            continue;
        }
        filtered.push(await additionalFields(file, uid));
    }
    return filtered;
}

//###############################
// Search Related functions
//###############################

/**
 * every text file is saved in html format - so that we could control sizes, color etc...
 * This function receive a string in html format and returns the visible text content.
 * @param {string} html 
 * @returns {bool}
 */
function getVisibleText(html) {
    return html
        .replace(/<[^>]*>/g, '') // Matches anything inside <> brackets
        .replace(/&nbsp;/g, ' ')  // Optional: Clean up common entities
        .trim();
}

/**
 * This function returns a list of files and directories matching the query.
 * @param {string} query 
 * @returns {File[]}
 */
async function getMatchingFiles(uid, query) {
    query = query.toLowerCase();
    await getSingleUser(uid); // check if user exists
    // search is non-case-sensitive

    // Create a set to avoid duplicates
    const fileFidSet = new Set();

    // Search Files by name

    // Search for files that contains the query in their names
    const files = await db.SearchFilesByName(uid, query);
    for (const file of files) {
        fileFidSet.add(file.fid);
    }
    // Search for files that contains the query in their content
    const getFilesOfUser = await db.GetAllFileDirs(uid);
    for (const file of getFilesOfUser) {
        if (!file.is_file) {
            // for directories, continue
            continue;
        }
        const fileFid = file.fid;
        const response = await fs.get(file.fid);
        if (response.status_code != STATUSCODE.OK) {
            // Some kind of error in front of the file server
            // console.log(`could not get file: ${fileFid} from file server. Continue searching...`);
        }
        const fileContent = response.data;
        if (getVisibleText(fileContent).toLowerCase().includes(query) && file.trashed === false && file.type == 'text') {
            fileFidSet.add(fileFid);
        }
    }

    
    // Convert the set to an array with the files data and return

    const filesToReturn = [];
    for (const fid of fileFidSet) {
        filesToReturn.push(await getSingleFile(fid));
    }

    return await addFieldsForAll(filesToReturn, uid);
}

//###############################
// File Related functions
//###############################


const queryToFilter = {
    "all": async (uid, file) => file.trashed === false,
    "my-drive": async (uid, file) => (await getRole(uid, file.fid)) === ROLES.owner && file.trashed === false && file.parent_id === null,
    "starred": async (uid, file) => (await getSingleUser(uid)).starred_files.includes(file.fid) && file.trashed === false,
    "shared-with-me": async (uid, file) => (await getRole(uid, file.fid)) !== ROLES.owner && file.trashed === false,
    "bin": async (uid, file) => file.trashed === true,
    "recent": async (uid, file) => file.last_modified >= Date.now() - 7 * 24 * 60 * 60 * 1000
};

/**
 * This function returns a list of all files and directories.
 * @param {string} uid
 * @param {string} q - optional query for specific filtering, one of the following: "my-drive", "starred", "shared-with-me", "bin".
 * @returns {File[]}
 */
async function getAllFiles(uid, q) {
    await getSingleUser(uid); // check if user exists
    if (q === undefined) {
        q = "all";
    }
    if (!queryToFilter[q]) {
        // If the query is not valid, throw an error
        throw new HttpError(STATUSCODE.BAD_REQUEST, `Invalid query. query ${q} is not supported. must be one of: ${Object.keys(queryToFilter).join(", ")}`);
    }
    const files = await db.GetAllFileDirs(uid);

    const filtered = [];
    for (const file of files) {
        const isMatch = await queryToFilter[q](uid, file);
        if (isMatch) {
            filtered.push(file);
        }
    }

    return await addFieldsForAll(filtered, uid, q !== "bin");
}

/**
 * Create a new file.
 * @param {string} uid
 * @param {File} filedir 
 * @returns {string}
 * @throws {Error} when cannot create the file
 */
async function postFile(uid, filedir, content) {
    await getSingleUser(uid);                                  // check if user exists
    await vv.validateFileDir(filedir);                         // check if filedir is valid structure

    const fid = idg.generateId(); // generate id for file
    const pid = idg.generateId(); // generate id for permission
    filedir.fid = fid;            // update filedir id to the new id

    // create permission
    const perm = {
        pid: pid,
        fid: fid,
        uid: uid,
        role: ROLES.owner // owner is the only user that created the file
    }
    // if file, update file server
    if (filedir.is_file) {
        // post file at file server
        const response = await fs.post(filedir.fid, content);
        // some kind of error from the file server, throw error
        if (response.status_code != STATUSCODE.CREATED) {
            throw new HttpError(response.status_code, "file server error");
        }
    }
    
    try {
        await db.PostFileDir(filedir);
        await db.PostPermission(perm);
    } catch (error) {
        throw new HttpError(STATUSCODE.CONFLICT);
    }
    return fid;
}

/**
 * This function returns the file/directory with the given id.
 * @param {string} uid
 * @param {string} fid 
 * @returns {File}
 * @throws {Error} when cannot find the file
 */
async function getFileById(uid, fid) {
    await getSingleUser(uid);                  // check if user exists
    const filedir = await getSingleFile(fid);  // check if file exists
    // Receive list of premissions
    const role = await getRole(uid, fid);
    if (!ROLES.can_view(role)) {
        // the user have no sufficient permissions
        throw new HttpError(STATUSCODE.FORBIDDEN);
    } else {
        filedir.role = role;
        if (filedir.is_file) {
            const response = await fs.get(fid);
            if (response.status_code != STATUSCODE.OK) {
                throw new HttpError(response.status_code);
            }
            // add file content
            filedir.content = response.data;
            return filedir;
        } else {
            // add subfiles and subdirectories to the field that is the sub filedirs of a directory
            filedir.sub_filedirs = await addFieldsForAll(await db.GetSubFileDirs(fid), uid);
            return filedir;
        }
    }
}

/**
 * This function updates the file with the given id.
 * @param {string} uid
 * @param {string} fid 
 * @param {File} file
 * @throws {Error} when cannot update the file
 */
async function patchFileById(uid, fid, file, content) {
    // check if filedir is valid structure
    await vv.validateFileDir(file, is_patch=true);

    await getSingleUser(uid);                 // check if user exists
    const filedir = await getSingleFile(fid); // check if file exists

    // check if the user is authorized to change the file:
    const file_role = await getRole(uid, fid);
    if (!ROLES.can_edit(file_role)) {
        // the user have no sufficient permissions
        throw new HttpError(STATUSCODE.FORBIDDEN, "not enough permission in: file = " + fid);
    }
    
    // checking if the user wants to change file's parent dir.
    if (file.parent_dir !== undefined) {
        // 1. check src dir
        if (filedir.parent_id !== null) {
            const parent_role = await getRole(uid, filedir.parent_id);
            if (!ROLES.can_edit(parent_role)) {
                // the user have no sufficient permissions
                throw new HttpError(STATUSCODE.FORBIDDEN, "not enough permission in: src directory = " + file.parent_dir);
            }
        }
        // 2. check dst dir
        if (file.parent_dir !== undefined && file.parent_dir !== null) {
            // trying to change parent dir to something that is not the main directory
            const new_parent_role = await getRole(uid, file.parent_dir);
            if (!ROLES.can_edit(new_parent_role)) {
                // the user have no sufficient permissions
                throw new HttpError(STATUSCODE.FORBIDDEN, "not enough permission in: dst directory = " + file.parent_dir);
            }
        }
    }
    
    // checked for authorazation, now patching the file
    // If filedir is file and there is change in content - update the content in the file server
    if (filedir.is_file && content !== undefined) {
        const response = await fs.patch(fid, content);
        if (response.status_code != STATUSCODE.NO_CONTENT) {
            // Some kind of error in front of the file server
            throw new HttpError(response.status_code);
        }
    }
    const old_file = await getSingleFile(fid);
    // trying to delete directory (move to trash) - check if contain sub files
    if (!old_file.is_file && file.trashed === true) {
        // check if the dir has sub files and directories
        const sub_filedirs = await db.GetSubFileDirs(fid);
        if (sub_filedirs.length > 0) {
            throw new HttpError(STATUSCODE.BAD_REQUEST, "cannot delete/trash directory with sub files and directories");
        }
    }
    file.last_modified = Date.now();
    const updated_file = {...old_file, ...file};
    // Update the file with the new data
    await db.PatchFileDir(updated_file);
}

/**
 * This function deletes the file with the given id.
 * @param {string} uid
 * @param {string} fid
 */
async function deleteFileById(uid, fid) {
    await getSingleUser(uid);                 // check if user exists
    const filedir = await getSingleFile(fid); // check if file exists
    // check if the user is authorized to delete the file
    const role = await getRole(uid, fid);
    // the user have access to the file and can erase it from his owm, maybe to others too.
    if (ROLES.can_edit(role)) {
        // an editor is deleting the file - delete all permissions and then the file
        // Get file json
        // Delete all permissions
        const file_permissions = await db.GetPermissionsAll(fid);
        for (const pid in file_permissions) {
            await db.DeletePermission(pid);
        }
        // delete file from file server (if it is a file and not directory)
        if (filedir.is_file) {
            const response = await fs.delete(fid);
            if (response.status_code != STATUSCODE.NO_CONTENT) {
                // Some kind of error in front of the file server
                throw new HttpError(response.status_code, "cannot delete file from file server");
            }
        } else {
            // check if the dir has sub files and directories
            const sub_filedirs = await db.GetSubFileDirs(fid);
            if (sub_filedirs.length > 0) {
                throw new HttpError(STATUSCODE.BAD_REQUEST, "cannot delete directory with sub files and directories");
            }
        }
        // delete file from database
        await db.DeleteFileDir(fid);
    } else {
        // non-editor user is deleting the file - delete the permission to it
        // delete permission
        await db.DeletePermission(role.pid);
    }
}

/**
 * This function returns the permissions of the file with the given id.
 * @param {string} uid
 * @param {string} fid 
 * @returns {Permission[]}
 * @throws {Error} when cannot find the file
 */
async function getPermissionById(uid, fid) {
    const role = await getRole(uid, fid);
    if (!ROLES.can_view(role)) {
        // the user have no sufficient permissions
        throw new HttpError(STATUSCODE.FORBIDDEN, `user ${uid} cannot access the file/dir ${fid}`);
    } else {
        // the user have sufficient permissions
        return await db.GetPermissionsAll(fid);
    }
}

/**
 * This function adds a new permission to the file with the given id.
 * @param {string} uid
 * @param {Permission} permission
 */
async function postPermissionById(uid, permission) {
    // check if permission is valid
    await vv.validatePermission(permission);
    await getSingleUser(uid);               // check if user exists
    await getSingleFile(permission.fid);
    const role = await getRole(uid, permission.fid);
    if (!ROLES.can_change_permissions(role)) {
        // the user have no sufficient permissions
        throw new HttpError(STATUSCODE.FORBIDDE, `user ${uid} cannot change the permissions of the file/dir ${permission.fid}`);
    } else {
        // check if permissions exists:
        // Receive list of premissions
        const list_premissions = await db.GetPermissions(permission.uid, permission.fid);
        if (list_premissions.length == 1) {
            throw new HttpError(STATUSCODE.CONFLICT, "permission already exists");
        } else if (list_premissions.length > 1) {
            // Some kind of error
            throw new HttpError(STATUSCODE.INTERNAL_SERVER_ERROR, "server error - role isn't unique");
        }
        // o.w - we have no permissions on that file which is great because we are trying to create one
        const pid = idg.generateId(); // new premission id
        permission.pid = pid;
        try {
            await db.PostPermission(permission);
            return pid;
        } catch (error) {
            throw new HttpError(STATUSCODE.CONFLICT, "pid already exists");
        }
    }
}

/**
 * This function updates the permission with the given id.
 * @param {string} uid
 * @param {string} pid 
 * @param {Permission} permission
 * @throws {Error} when cannot update the permission
 */
async function patchPermissionByIdAndPid(uid, pid, permission) {
    // check if permission is valid
    await vv.validatePermission(permission, is_patch=true);
    await getSingleUser(uid);               // check if user exists


    const old_permission = await getSinglePermission(pid);

    //check if pid is the permission for uid and permission.fid
    if (old_permission.uid != permission.uid || old_permission.fid != permission.fid) {
        throw new HttpError(STATUSCODE.NOT_FOUND, `couldn't find permission ${pid} for user ${uid} and file/dir ${permission.fid}`);
    }

    const role = await getRole(uid, permission.fid);
    if (!ROLES.can_change_permissions(role)) {
        throw new HttpError(STATUSCODE.FORBIDDEN, `user ${uid} cannot change the permissions of the file/dir ${permission.fid}`);
    }

    // Cannot change the owner of a file!!!
    if (permission.role == ROLES.owner) {
        throw new HttpError(STATUSCODE.FORBIDDEN, "cannot demote owner");
    }

    // Cannot become the owner of a file!!!
    if (permission.role == ROLES.owner) {
        throw new HttpError(STATUSCODE.FORBIDDEN, "cannot promote to owner");
    }

    // set permissions id to the given one
    permission.pid = pid;
    await db.PatchPermission(permission);
}

/**
 * This function deletes the permission with the given id.
 * @param {string} uid
 * @param {string} fid
 * @param {string} pid
 * @throws {Error} when cannot delete the permission
 */
async function deletePermissionByIdAndPid(uid, fid, pid) {
    
    const permission = await getSinglePermission(pid);

    //check if pid is the permission for uid and permission.fid
    if (permission.fid != fid) {
        throw new HttpError(STATUSCODE.NOT_FOUND, `couldn't find permission ${pid} for file/dir ${permission.fid}`);
    }
    
    const role = await getRole(uid, fid);
    if (!ROLES.can_change_permissions(role)) {
        throw new HttpError(STATUSCODE.FORBIDDEN);
    }

    // Cannot delete the owner of a file!!!
    if (permission.role == ROLES.owner) {
        throw new HttpError(STATUSCODE.FORBIDDEN, "cannot delete owner");
    }

    await db.DeletePermission(pid);
}

async function patchStarred(uid, fid, starred) {
    if (starred === undefined) {
        return; // nothing to do
    }
    if (typeof starred !== 'boolean') {
        throw new HttpError(STATUSCODE.BAD_REQUEST, "starred must be a boolean");
    }
    const user = await getSingleUser(uid);
    await getRole(uid, fid); // check that the user has access to this file

    if (starred) {
        if (!user.starred_files.includes(fid)) {
            // if starring a file, add it to the list
            user.starred_files.push(fid);
        }
    } else {
        // if unstarring a file, remove it from the list
        user.starred_files = user.starred_files.filter(id => id !== fid);
    }
    try {
        await db.PatchUser(uid, user);
    } catch (error) {
        throw new HttpError(STATUSCODE.INTERNAL_SERVER_ERROR, "couldn't perform action");
    }
}

module.exports = {
    getMatchingFiles,
    getAllFiles,
    postFile,
    getFileById,
    patchFileById,
    deleteFileById,
    getPermissionById,
    postPermissionById,
    patchPermissionByIdAndPid,
    deletePermissionByIdAndPid,
    patchStarred
}
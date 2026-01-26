const User = require('../../models/User');
const FileDir = require('../../models/FileDir');
const Permission = require('../../models/Permission');

//User: {uid, name, avatar, password, creation_date, email}
//FileDir: {fid, name, parent_id, is_file}
//Permission: {pid, fid, uid, role}

// Users:

/**
 * add user
 * @param {Object} userData 
 * @throws {Error} 
 */
async function PostUser(userData) {
    const newUser = new User(userData);
    await newUser.save();
}
 
/**
 * 
 * @param {string} uid 
 * @returns a list of users with the given uid (suppose to be length == 1)
 */
async function GetUser(uid) {
    const users = await User.find({ uid: uid });
    return users.map(user => user.toObject());
}

/**
 * 
 * @param {string} name 
 * @returns a list of users with the given name (suppose to be length == 1)
 */
async function GetUserByName(name) {
    const users = await User.find({ name: name });
    return users.map(user => user.toObject());
}

/**
 * Update user
 * @param {string} uid 
 * @param {Object} userData 
 * @throws {Error} if user not found
 */
async function PatchUser(uid, userData) {
    const result = await User.updateOne({ uid: uid }, userData);

    if (result.matchedCount === 0) {
        throw new Error("404 user not found");
    }
}

/**
 * 
 * @param {string} name 
 * @param {string} password 
 * @returns a list of users with the given name and password
 */
async function LogIn(email, password) {
    return await User.find({ email, password }).lean();
}

/**
 * * @param {string} uid
 * @returns a list of all files and directories of that user
 */
async function GetAllFileDirs(uid) {
    // check if user exists
    const userExists = await User.exists({ uid: uid });
    if (!userExists) {
        return [];
    }

    // Find permissions for this user
    // We use .distinct('fid') to get an array of just the File IDs
    const userPermissions = await Permission.find({ uid: uid }).distinct('fid');

    // Find all files whose ID is in the userPermissions array
    // The $in operator is perfect for matching an array of IDs
    const files = await FileDir.find({ 
        fid: { $in: userPermissions } 
    }).lean();

    return files;
}

// Files:

/**
 * * @param {string} fid
 * @returns a list of all subfiles and subdirectories of directory with fid
 */
async function GetSubFileDirs(fid) {
    return await FileDir.find({ parent_id: fid }).lean();
}

/**
 * adds file of directory and it adds them to the list of files and to the parent directory
 * @param {FileDir} FileDir 
 * @throws {Error} if the file already exists
 */
async function PostFileDir(fileData) {
    const newFile = new FileDir(fileData); // will throw error if fid defined.
    await newFile.save();
}

/**
 * 
 * @param {string} fid 
 * @returns a list of files with the given fid
 */
async function GetFileDir(fid) {
    return await FileDir.find({ fid: fid }).lean();
}

/**
 * updates the file
 * @param {FileDir} FileDir 
 */
async function PatchFileDir(fileData) {
    const updatedFile = await FileDir.findOneAndUpdate(
        { fid: fileData.fid },
        fileData,
        { new: true }
    );
}

/**
 * deletes the file from the file list and from his parent dir sub_file_dir list
 * @param {string} fid 
 */
async function DeleteFileDir(fid) {
    await FileDir.deleteOne({ fid: fid });
}

/**
 * * @param {string} uid 
 * @param {string} fid 
 * @returns {Promise<Array>} a list of permissions with the given fid and uid
 */
async function GetPermissions(uid, fid) {
    return await Permission.find({ 
        uid: uid, 
        fid: fid 
    }).lean();
}

/**
 * 
 * @param {string} fid 
 * @returns a list of permissions with the given fid
 */
async function GetPermissionsAll(fid) {
    return await Permission.find({ fid: fid }).lean();
}

/**
 * 
 * @param {string} pid 
 * @returns a list of permissions with the given pid
 */
async function GetPermissionsByPid(pid) {
    return await Permission.find({ pid: pid }).lean();
}

/**
 * adds permission to the permission list
 * @param {Permission} Permission 
 * @throws {Error} if the permission already exists
 */
async function PostPermission(permissionData) {
    const newPermission = new Permission(permissionData);
    await newPermission.save();
}

/**
 * updates the permission
 * @param {Object} permissionData 
 */
async function PatchPermission(permissionData) {
    await Permission.findOneAndUpdate(
        { pid: permissionData.pid },
        permissionData,
        { new: true, runValidators: true }
    );
}

/**
 * deletes the permission from the permissions list
 * @param {string} pid 
 */
async function DeletePermission(pid) {
    await Permission.deleteOne({ pid: pid });
}

// Search:


/**
 * @param {string} uid
 * @param {string} query 
 * @returns {Promise<Array>} a list of file_dirs that include the query in their names. 
 */
async function SearchFilesByName(uid, query) {
    // Get all fid the user has permission to see
    const userPermissions = await Permission.find({ uid: uid }).distinct('fid');

    // Search for files that are in that ID list AND match the name query
    // 'i' makes the regex case-insensitive, matching your .toLowerCase() logic
    const filesContainingQuery = await FileDir.find({
        fid: { $in: userPermissions },
        name: { $regex: query, $options: 'i' }
    }).lean();

    return filesContainingQuery;
}

/**
 * @param {string} email 
 * @returns {Promise<Array>} a list of users with the given email
 */
async function GetUserByEmail(email) {
    return await User.find({ email: email }).lean();
}




module.exports = {
    PostUser,
    GetUser,
    GetUserByName,
    PatchUser,
    LogIn,
    GetAllFileDirs,
    PostFileDir,
    GetFileDir,
    PatchFileDir,
    DeleteFileDir,
    GetPermissions,
    GetPermissionsAll,
    GetPermissionsByPid,
    PostPermission,
    PatchPermission,
    DeletePermission,
    SearchFilesByName,
    GetSubFileDirs,
    GetUserByEmail
}

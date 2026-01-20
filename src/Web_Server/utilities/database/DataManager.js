
//our demo database
let database = {
    "users": [],
    "files": [],
    "permissions": []
}

//our json strucures:


//User: {uid, name, avatar, password, creation_date, email}
//FileDir: {fid, name, parent_id, is_file}
//Permission: {pid, fid, uid, role}


// Users:


/**
 * add user - assumes that it is without files
 * @param {User} userData 
 * @throws {Error} throws an error if the users uid already exists
 */
function PostUser(userData) {
    // check for unique keys. unique user keys must be uid and email
    const boolExistsUid = database.users.some(user => user.uid == userData.uid || user.email == userData.email);
    if (boolExistsUid) {
        throw new Error("409 user already exists");
    }
    database.users.push(userData);
}
 
/**
 * 
 * @param {string} uid 
 * @returns a list of users with the given uid (suppose to be length == 1)
 */
function GetUser(uid) {
    const users = database.users.filter(user => user.uid == uid);
    return structuredClone(users);
}

/**
 * 
 * @param {string} name 
 * @returns a list of users with the given name (suppose to be length == 1)
 */
function GetUserByName(name) {
    const users = database.users.filter(user => user.name == name);
    return structuredClone(users);
}

/**
 * @param {string} uid
 * @param {User} user
 */
function PatchUser(uid, user) {
    const user_index = database.users.findIndex(u => u.uid == uid);
    if (user_index == -1) {
        throw new Error("user not found");
    }
    database.users[user_index] = user;
}

/**
 * 
 * @param {string} name 
 * @param {string} password 
 * @returns a list of users with the given name and password
 */
function LogIn(email, password) {
    return structuredClone(database.users.filter(user => user.email == email && user.password == password));
}

/**
 * 
 * @param {string} uid
 * @returns a list of all files and directories of that user
 */
function GetAllFileDirs(uid) {
    const user = database.users.find(user => user.uid == uid);
    if (user == undefined) {
        return [];
    }
    const userPermissions = database.permissions.filter(permission => permission.uid == uid);
    const files = database.files.filter(file => userPermissions.some(permission => permission.fid == file.fid));
    return structuredClone(files);
}




// Files:


/**
 * 
 * @param {string} fid
 * @returns a list of all subfiles and subdirectories of directory with fid
 */
function GetSubFileDirs(fid) {
    return structuredClone(database.files.filter(file => file.parent_id == fid));
}

/**
 * adds file of directory and it adds them to the list of files and to the parent directory
 * @param {FileDir} FileDir 
 * @throws {Error} if the file already exists
 */
function PostFileDir(FileDir) {
    const boolExistsFid = database.files.some(file => file.fid == FileDir.fid);
    if (boolExistsFid) {
        throw new Error("409 file already exists");
    }
    database.files.push(FileDir);
}

/**
 * 
 * @param {string} fid 
 * @returns a list of files with the given fid
 */
function GetFileDir(fid) {
    const files = database.files.filter(file => file.fid == fid);
    return structuredClone(files);
}

/**
 * updates the file
 * @param {FileDir} FileDir 
 */
function PatchFileDir(FileDir) {
    // get previous version of the file file (throw exception if not exists, but it should always exists)
    const file_index = database.files.findIndex(file => file.fid == FileDir.fid);
    if (file_index == -1) {
        // Never suppose to happent because model checked for the existing of the file
        return;
    }

    database.files[file_index] = FileDir;
}


/**
 * deletes the file from the file list and from his parent dir sub_file_dir list
 * @param {string} fid 
 */
function DeleteFileDir(fid) {
    database.files = database.files.filter(file => file.fid != fid);
}


/**
 * 
 * @param {string} fid 
 * @param {string} uid
 * @returns a list of permissions with the given fid and uid
 */
function GetPermissions(uid, fid) {
    const permissions = database.permissions.filter(permission => permission.uid == uid && permission.fid == fid);
    return structuredClone(permissions);
}


/**
 * 
 * @param {string} fid 
 * @returns a list of permissions with the given fid
 */
function GetPermissionsAll(fid) {
    const permissions = database.permissions.filter(permission => permission.fid == fid);
    return structuredClone(permissions);
}

/**
 * 
 * @param {string} pid 
 * @returns a list of permissions with the given pid
 */
function GetPermissionsByPid(pid) {
    const permissions = database.permissions.filter(permission => permission.pid == pid);
    return structuredClone(permissions);
}


/**
 * adds permission to the permission list
 * @param {Permission} Permission 
 * @throws {Error} if the permission already exists
 */
function PostPermission(Permission) {
    const boolExistsPid = database.permissions.some(permission => permission.pid == Permission.pid);
    if (boolExistsPid) {
        throw new Error("409 permission already exists");
    }
    database.permissions.push(Permission);
}


/**
 * updates the permission
 * @param {Permission} Permission 
 */
function PatchPermission(Permission) {
    const permission_index = database.permissions.findIndex(permission => permission.pid == Permission.pid);
    database.permissions[permission_index] = Permission;
}


/**
 * deletes the permission from the permissions list
 * @param {string} pid 
 */
function DeletePermission(pid) {
    database.permissions = database.permissions.filter(permission => permission.pid != pid);
}



// Search:


/**
 * 
 * @param {string} uid
 * @param {string} query 
 * @returns a list of file_dirs that include the query in their names. 
 */
function SearchFilesByName(uid, query) {
    const userPermissions = database.permissions.filter(permission => permission.uid == uid);
    const files_for_user = database.files.filter(file => userPermissions.some(permission => permission.fid == file.fid));
    const filesContainingQuery = files_for_user.filter(file => file.name.toLowerCase().includes(query));
    return structuredClone(filesContainingQuery);
}

/**
 * @param {string} email 
 * @returns a list of users with the given email (supposed to be length == 1)
 */
function GetUserByEmail(email) {
    const users = database.users.filter(user => user.email === email);
    return structuredClone(users);
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

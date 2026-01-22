const { 
    getAllFiles: getAllFilesModel, 
    postFile: postFileModel, 
    getFileById: getFileByIdModel, 
    patchFileById: patchFileByIdModel, 
    deleteFileById: deleteFileByIdModel,
    getPermissionById: getPermissionByIdModel,
    postPermissionById: postPermissionByIdModel,
    patchPermissionByIdAndPid: patchPermissionByIdAndPidModel,
    deletePermissionByIdAndPid: deletePermissionByIdAndPidModel,
    patchStarred: patchStarredModel
} = require('../services/fileService');
const { getUidByEmail, getUser } = require('../services/userService');
const { HttpError, handleError } = require('../utilities/errors/HttpError');
const vp = require('../utilities/validation/validParameters');
const token2uid = require('../utilities/tokens/token2uid');

const CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    SERVER_ERROR: 500
};

// helper function that receive req and returns the uid
const getUid = (req) => token2uid(req.headers.authorization);

const getAllFiles = async (req, res) => {
    const uid = getUid(req);
    if (!uid) return res.status(CODES.UNAUTHORIZED).json({ error: 'Valid token required' });

    // optional query for specific filtering, for example: "my-drive", "starred", etc.
    const { q } = req.query;

    try {
        const files = await getAllFilesModel(uid, q);
        return res.status(CODES.OK).json(files);
    } catch (error) {
        return handleError(error, res);
    }
};

const postFile = async (req, res) => {
    const uid = getUid(req);
    const { type, name, content, parent_id, is_file } = req.body;

    if (!uid) return res.status(CODES.UNAUTHORIZED).json({ error: 'Valid token required' });
    if (!name || (is_file && content === undefined)) {
        return res.status(CODES.BAD_REQUEST).json({ error: 'Name and content are required for files' });
    }

    try {
        const filedir = { name, parent_id, is_file, type };
        await vp.validateFileDir(filedir);
        const fid = await postFileModel(uid, filedir, content);
        return res.status(CODES.CREATED).location(`/api/files/${fid}`).end();
    } catch (error) {
        return handleError(error, res);
    }
};

const getFileById = async (req, res) => {
    const uid = getUid(req);
    const fid = req.params.id;
    
    if (!uid || !fid) return res.status(CODES.UNAUTHORIZED).json({ error: 'Token and File ID are required' });

    try {
        const file = await getFileByIdModel(uid, fid);
        return res.status(CODES.OK).json(file);
    } catch (error) {
        return handleError(error, res);
    }
};

const patchFileById = async (req, res) => {
    const uid = getUid(req);
    const fid = req.params.id;
    const { content, starred, ...filedir } = req.body;

    if (!uid || !fid) return res.status(CODES.UNAUTHORIZED).json({ error: 'Token and File ID are required' });

    try {
        await patchFileByIdModel(uid, fid, filedir, content);
        await patchStarredModel(uid, fid, starred);
        return res.status(CODES.NO_CONTENT).send();
    } catch (error) {
        return handleError(error, res);
    }
};

const deleteFileById = async (req, res) => {
    const uid = getUid(req);
    const fid = req.params.id;

    if (!uid || !fid) return res.status(CODES.UNAUTHORIZED).json({ error: 'Token and File ID are required' });
    
    try {
        await deleteFileByIdModel(uid, fid);
        return res.status(CODES.NO_CONTENT).send();
    } catch (error) {
        return handleError(error, res);
    }
};

const getPermissionById = async (req, res) => {
    const uid = getUid(req);
    const fid = req.params.id;

    if (!uid || !fid) return res.status(CODES.UNAUTHORIZED).json({ error: 'Token and File ID are required' });

    try {
        const permissions = await getPermissionByIdModel(uid, fid);

        const enrichedPermissions = [];

        for (const perm of permissions) {
            try {
                const user = await getUser(perm.uid);
                enrichedPermissions.push({
                    ...perm,
                    name: user.name,
                    email: user.email
                });
            } catch (err) {
                enrichedPermissions.push(perm);
            }
        }
        return res.status(CODES.OK).json(enrichedPermissions);
    } catch (error) {
        return handleError(error, res);
    }
};

const postPermissionById = async (req, res) => {
    const uid = getUid(req);
    const fid = req.params.id;
    
    const { email, role } = req.body;

    if (!uid) return res.status(CODES.UNAUTHORIZED).json({ error: 'Valid token required' });

    try {
        if (!email) {
            return res.status(CODES.BAD_REQUEST).json({ error: 'Email is required' });
        } 
        // Create clean object
        const userToPromote = await getUidByEmail(email);
        const permission = { uid: userToPromote, role, fid }; // fid injected safely here
        // check if the permission json have valid structure and data
        await vp.validatePermission(permission);
        const pid = await postPermissionByIdModel(uid, permission);
        const userDetails = await getUser(userToPromote);
        return res.status(CODES.CREATED)
            .location(`/api/files/${fid}/permissions/${pid}`)
            .json({ pid, 
            uid: userToPromote,
            name: userDetails.name,
            email: userDetails.email,
            role,
            message: "Permission added successfully"
        });
    } catch (error) {
        return handleError(error, res);
    }
};

const patchPermissionByIdAndPid = async (req, res) => {
    const uid = getUid(req);
    const pid = req.params.pid;
    const fid = req.params.id;
    const { role, uid: userToPromote } = req.body;

    if (!uid) return res.status(CODES.UNAUTHORIZED).json({ error: 'Valid token required' });

    try {
        const permissionUpdate = { role, fid, uid: userToPromote };
        await patchPermissionByIdAndPidModel(uid, pid, permissionUpdate);
        return res.status(CODES.NO_CONTENT).send();
    } catch (error) {
        return handleError(error, res);
    }
};

const deletePermissionByIdAndPid = async (req, res) => {
    const uid = getUid(req);
    const { id: fid, pid } = req.params;

    if (!uid || !fid || !pid) {
        return res.status(CODES.UNAUTHORIZED).json({ error: 'Valid token and IDs are required' });
    }

    try {
        await deletePermissionByIdAndPidModel(uid, fid, pid);
        return res.status(CODES.NO_CONTENT).send();
    } catch (error) {
        return handleError(error, res);
    }
};

module.exports = {
    getAllFiles,
    postFile,
    getFileById,
    patchFileById,
    deleteFileById,
    getPermissionById,
    postPermissionById,
    patchPermissionByIdAndPid,
    deletePermissionByIdAndPid
};
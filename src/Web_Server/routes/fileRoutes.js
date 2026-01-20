const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');


router.get('/', fileController.getAllFiles);
router.post('/', fileController.postFile);


router.get('/:id', fileController.getFileById);
router.patch('/:id', fileController.patchFileById);
router.delete('/:id', fileController.deleteFileById);


router.get('/:id/permissions', fileController.getPermissionById);
router.post('/:id/permissions', fileController.postPermissionById);


router.patch('/:id/permissions/:pid', fileController.patchPermissionByIdAndPid);
router.delete('/:id/permissions/:pid', fileController.deletePermissionByIdAndPid);

module.exports = router;
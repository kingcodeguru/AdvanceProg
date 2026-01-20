const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.postUser);

// first define me so that the router will go to getMe when the url is /api/users/me
router.get('/me', userController.getMe);
router.get('/:id', userController.getUser);

module.exports = router;
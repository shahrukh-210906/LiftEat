const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/profileController');

const router = express.Router();
router.get('/', auth, controller.getProfile);
router.put('/', auth, controller.updateProfile);
router.get('/export', auth, controller.exportUserData);
router.delete('/delete', auth, controller.deleteAccount);

module.exports = router;

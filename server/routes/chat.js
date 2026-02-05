const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getWidgetTip, chatWithAI } = require('../controllers/chatController');

router.post('/tip', auth, getWidgetTip);
router.post('/', auth, chatWithAI);

module.exports = router;
const router = require('express').Router();
const auth = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');
const { getWidgetTip, chatWithAI } = require('../controllers/chatController');
router.use(auth);
router.get('/history', async (req, res) => {
  const history = await ChatMessage.find({ user: req.user.id }).sort({ createdAt: -1, _id: -1 }).limit(200);
  res.json(history.reverse().map(item => ({ id: item._id, user_id: item.user, role: item.role, content: item.content, created_at: item.createdAt })));
});
router.delete('/history', async (req, res) => {
  await ChatMessage.deleteMany({ user: req.user.id });
  res.json({ success: true });
});
router.post('/tip', getWidgetTip);
router.post('/', chatWithAI);
module.exports = router;

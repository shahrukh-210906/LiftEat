const gemini = require('../services/gemini');
const { loadContext, instruction } = require('../services/coachContext');
const ChatMessage = require('../models/ChatMessage');
const getWidgetTip = async (req, res) => {
  try {
    const { memory } = await loadContext(req.user.id);
    const page = ['dashboard', 'workout', 'diet'].includes(req.body.page) ? req.body.page : 'dashboard';
    const tip = await gemini.generate({ system: instruction + JSON.stringify(memory), messages: [{ role: 'user', content: `Give one short personalized tip for my ${page} page.` }] });
    res.json({ tip });
  } catch { res.json({ tip: 'Stay consistent and give yourself time to recover.' }); }
};
const chatWithAI = async (req, res) => {
  const { message } = req.body;
  if (typeof message !== 'string' || !message.trim() || message.length > 4000) return res.status(400).json({ error: 'Enter a message of 1-4000 characters' });
  try {
    const { memory, history } = await loadContext(req.user.id);
    const reply = await gemini.generate({ system: instruction + JSON.stringify(memory), messages: [...history, { role: 'user', content: message.trim() }] });
    await ChatMessage.insertMany([
      { user: req.user.id, role: 'user', content: message.trim() },
      { user: req.user.id, role: 'assistant', content: reply },
    ]);
    res.json({ reply });
  } catch (error) {
    res.status(503).json({ error: error.message === 'GEMINI_NOT_CONFIGURED' ? 'The AI coach needs a Gemini API key configured on the server.' : 'The AI coach is unavailable. Please try again later.' });
  }
};
module.exports = { getWidgetTip, chatWithAI };

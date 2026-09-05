const { Ollama } = require('ollama');
const Profile = require('../models/Profile');
const WorkoutSession = require('../models/WorkoutSession');
const ChatMessage = require('../models/ChatMessage');
const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });
const getWidgetTip = async (req, res) => {
  try {
    const response = await ollama.chat({ model: process.env.OLLAMA_CHAT_MODEL || 'llama3.1',
      messages: [{ role: 'user', content: 'Give one short fitness tip for the ' + req.body.page + ' page. Context: ' + JSON.stringify(req.body.contextData) }], stream: false });
    res.json({ tip: response.message.content });
  } catch { res.json({ tip: 'Stay consistent and give yourself time to recover.' }); }
};
const chatWithAI = async (req, res) => {
  const { message } = req.body;
  if (typeof message !== 'string' || !message.trim() || message.length > 4000) return res.status(400).json({ error: 'Enter a message of 1–4000 characters' });
  try {
    const [profile, lastWorkout, history] = await Promise.all([
      Profile.findOne({ user: req.user.id }),
      WorkoutSession.findOne({ user: req.user.id, is_active: false }).sort({ completed_at: -1 }),
      ChatMessage.find({ user: req.user.id }).sort({ createdAt: -1, _id: -1 }).limit(20),
    ]);
    const response = await ollama.chat({ model: process.env.OLLAMA_CHAT_MODEL || 'llama3.1', stream: false,
      messages: [
        { role: 'system', content: 'You are LiftEat Coach. Keep answers concise. Name: ' + (profile?.full_name || 'Athlete') + '. Goal: ' + (profile?.fitness_goal || 'General fitness') + '. Last workout: ' + (lastWorkout?.name || 'None') },
        ...history.reverse().map(item => ({ role: item.role, content: item.content })),
        { role: 'user', content: message.trim() },
      ] });
    await ChatMessage.insertMany([
      { user: req.user.id, role: 'user', content: message.trim() },
      { user: req.user.id, role: 'assistant', content: response.message.content },
    ]);
    res.json({ reply: response.message.content });
  } catch (error) {
    console.error('Chat failed:', error.message);
    res.status(503).json({ error: 'The AI coach is unavailable. Please try again later.' });
  }
};
module.exports = { getWidgetTip, chatWithAI };

const { Ollama } = require('ollama');
const Profile = require('../models/Profile');
const WorkoutSession = require('../models/WorkoutSession');

// Initialize connection to your local AI
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

const getWidgetTip = async (req, res) => {
  try {
    const { page, contextData } = req.body;
    const prompt = `
      Provide a single, short (max 15 words) motivating tip for a user on the ${page} page.
      Context: ${JSON.stringify(contextData)}
    `;

    const response = await ollama.chat({
      model: 'llama3.1',
      messages: [{ role: 'user', content: prompt }],
      stream: false
    });

    res.json({ tip: response.message.content });
  } catch (err) {
    console.error("Tip Error:", err.message);
    res.json({ tip: "Stay consistent! 💪" });
  }
};

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    // 1. GET USER CONTEXT
    const profile = await Profile.findOne({ user: req.user.id });
    const lastWorkout = await WorkoutSession.findOne({ user: req.user.id })
      .sort({ date: -1 })
      .limit(1);

    // 2. CREATE THE PERSONA
    const systemPrompt = `
      You are 'LiftEat Coach', an expert fitness assistant.
      USER DETAILS: Name: ${req.user.name || 'Athlete'}, Goal: ${profile?.fitness_goal || 'General Fitness'}
      LAST WORKOUT: ${lastWorkout ? lastWorkout.name : "None"}
      RULES: Keep answers concise.
    `;

    // 3. SEND TO LOCAL GPU
    const response = await ollama.chat({
      model: 'llama3.1',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
    });

    res.json({ reply: response.message.content });
  } catch (err) {
    console.error("❌ AI Error:", err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ reply: "⚠️ My brain is asleep! (Ensure Ollama is running)." });
    }
    res.status(500).send('Server Error');
  }
};

module.exports = { getWidgetTip, chatWithAI };
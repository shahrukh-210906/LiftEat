// server/routes/vision.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Ollama } = require('ollama');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');

// Setup file upload (Memory storage for speed)
const upload = multer({ storage: multer.memoryStorage() });
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

// @route   POST api/vision/analyze-body
// @desc    Analyze body shape from photo
router.post('/analyze-body', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No image uploaded' });

    console.log("... 👀 AI is looking at the photo ...");

    // 1. Convert image buffer to base64 for Ollama
    const imageBase64 = req.file.buffer.toString('base64');

    // 2. The "8 Body Shapes" Prompt
    const prompt = `
      Analyze this physique for a fitness assessment. 
      Classify the body into one of these 8 shapes: 
      [Ectomorph, Mesomorph, Endomorph, Ecto-Mesomorph, Meso-Endomorph, Endo-Ectomorph, Athletic, Sedentary].
      
      Output ONLY a JSON object like this:
      {
        "body_type": "Mesomorph",
        "est_body_fat": "15-18%",
        "muscle_mass": "Moderate",
        "suggestion": "Focus on hypertrophy."
      }
    `;

    // 3. Send to Llama 3.2 Vision
    const response = await ollama.chat({
      model: 'llama3.2-vision',
      messages: [{
        role: 'user',
        content: prompt,
        images: [imageBase64]
      }],
      format: 'json', // Force JSON output
      stream: false
    });

    const analysis = JSON.parse(response.message.content);

    // 4. Save to Profile
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.ai_analysis = analysis; // Add this field to your Profile Schema first!
      await profile.save();
    }

    res.json(analysis);

  } catch (err) {
    console.error("Vision Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
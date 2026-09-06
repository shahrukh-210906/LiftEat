const multer = require('multer');
const MealDraft = require('../models/MealDraft');
const { validItems } = require('./mealTextController');
const mealVision = require('../services/mealVision');

const supportedFile = (_req, file, done) => {
  const accepted = mealVision.SUPPORTED.has(file.mimetype);
  done(accepted ? null : Object.assign(new Error('Upload a JPEG, PNG or WebP image'), { status: 400 }), accepted);
};
exports.upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: supportedFile }).single('image');

const active = new Set();
exports.parse = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a meal photo to analyze.' });
  if (!mealVision.hasImageSignature(req.file.buffer, req.file.mimetype)) return res.status(400).json({ error: 'The uploaded file is not a valid supported image.' });
  if (active.has(req.user.id)) return res.status(429).json({ error: 'Your previous meal photo is still processing.' });
  active.add(req.user.id);
  try {
    let plan;
    try {
      plan = await mealVision.analyze({ buffer: req.file.buffer, mimeType: req.file.mimetype, filename: req.file.originalname });
      if (!plan || !validItems(plan.items) || !Array.isArray(plan.assumptions) || plan.assumptions.length > 12 || plan.assumptions.some(value => typeof value !== 'string' || value.length > 200)) throw new Error('VISION_INVALID_OUTPUT');
    } catch (error) {
      if (error.message === 'VISION_NOT_CONFIGURED') return res.status(503).json({ error: 'The meal photo service is not configured on the server.' });
      if (error.message === 'VISION_NO_MEAL') return res.status(422).json({ error: 'No clear meal was found. Try a well-lit photo showing the full plate.' });
      if (['VISION_REQUEST_FAILED', 'VISION_INVALID_OUTPUT'].includes(error.message) || error.name === 'TimeoutError' || error.name === 'TypeError') return res.status(503).json({ error: 'Meal photo analysis is unavailable. You can still describe or add the meal manually.' });
      throw error;
    }
    const draft = await MealDraft.create({ user: req.user.id, ...plan, source: 'photo', expiresAt: new Date(Date.now() + 86400000) });
    res.status(201).json({ id: draft.id, items: plan.items, assumptions: plan.assumptions, expires_at: draft.expiresAt, estimated: true, source: 'photo' });
  } catch (error) { next(error); }
  finally { active.delete(req.user.id); }
};

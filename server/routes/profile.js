const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Get Profile
router.get('/', auth, async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      // Create default if missing
      const user = await User.findById(req.user.id);
      if (!user) return res.status(401).json({ error: 'Account not found' });
      profile = await Profile.create({ user: req.user.id, full_name: user.fullName });
    }
    if (!profile.full_name) {
      const user = await User.findById(req.user.id);
      profile.full_name = user?.fullName || 'Athlete';
      await profile.save();
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// Update Profile
router.put('/', auth, async (req, res, next) => {
  try {
    const allowed = ['full_name', 'body_type', 'fitness_goal', 'weight_kg', 'height_cm', 'age', 'gender', 'daily_calorie_goal', 'daily_protein_goal', 'daily_carbs_goal', 'daily_fat_goal', 'onboarding_complete'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );
    if (!profile.full_name) {
      const user = await User.findById(req.user.id);
      profile.full_name = user?.fullName || 'Athlete';
      await profile.save();
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

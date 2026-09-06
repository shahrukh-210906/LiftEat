const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkoutSession = require('../models/WorkoutSession');
const WorkoutExercise = require('../models/WorkoutExercise');
const DietLog = require('../models/DietLog');
const Snapshot = require('../models/InsightSnapshot');
router.get('/insights', auth, async (req, res) => {
  const snapshot = await require('../services/insights').refresh(req.user.id);
  res.json({ computed_at: snapshot.computedAt || null, cards: snapshot.cards.filter(card => !snapshot.dismissed.includes(card.id)), refreshing: !snapshot.computedAt });
});
router.post('/insights/:id/dismiss', auth, async (req, res) => {
  const snapshot = await Snapshot.findOneAndUpdate({ user: req.user.id, 'cards.id': req.params.id }, { $addToSet: { dismissed: req.params.id } }, { new: true });
  if (!snapshot) return res.status(404).json({ error: 'Insight not found' });
  res.json({ success: true });
});

router.get('/stats', auth, async (req, res) => {
  // 1. Last Workout
  const lastWorkout = await WorkoutSession.findOne({ user: req.user.id, is_active: false })
    .sort({ completed_at: -1 });

  // 2. Exercise Count for Last Workout
  let lastWorkoutExerciseCount = 0;
  if (lastWorkout) {
    lastWorkoutExerciseCount = await WorkoutExercise.countDocuments({ workout_session: lastWorkout._id });
  }

  // 3. Today's Diet
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todaysDiet = await DietLog.find({ user: req.user.id, logged_at: { $gte: startOfDay } });

  // 4. Weekly Workout Count
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyWorkoutCount = await WorkoutSession.countDocuments({
    user: req.user.id,
    is_active: false,
    completed_at: { $gte: oneWeekAgo }
  });

  res.json({
    activeWorkout: await WorkoutSession.findOne({ user: req.user.id, is_active: true }).sort({ started_at: -1 }).select('_id name started_at'),
    lastWorkout,
    lastWorkoutExerciseCount,
    todaysDiet,
    weeklyWorkoutCount
  });
});

module.exports = router;

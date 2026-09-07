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

const dateKey = value => new Date(value).toISOString().slice(0, 10);
const estimatedOneRepMax = set => Math.round(Number(set.weight) * (1 + Number(set.reps) / 30));

router.get('/progress', auth, async (req, res, next) => {
  try {
    const allowedDays = new Set([30, 90, 180]);
    const now = new Date();
    let start;
    if (req.query.range === 'ytd') start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    else {
      const days = Number(req.query.range || 30);
      if (!allowedDays.has(days)) return res.status(400).json({ error: 'Choose a valid progress range' });
      start = new Date(now);
      start.setUTCDate(start.getUTCDate() - days + 1);
      start.setUTCHours(0, 0, 0, 0);
    }

    const sessions = await WorkoutSession.find({
      user: req.user.id,
      is_active: false,
      completed_at: { $gte: start, $lte: now },
    }).select('_id completed_at').sort({ completed_at: 1 }).lean();
    const workoutIds = sessions.map(session => session._id);
    const [exercises, nutrition] = await Promise.all([
      WorkoutExercise.find({ workout_session: { $in: workoutIds } }).select('workout_session exercise_name sets').lean(),
      DietLog.find({ user: req.user.id, logged_at: { $gte: start, $lte: now } })
        .select('logged_at calories protein carbs fat').sort({ logged_at: 1 }).lean(),
    ]);

    const sessionDates = new Map(sessions.map(session => [String(session._id), session.completed_at]));
    const records = new Map();
    const strengthByDate = new Map();
    const exerciseFrequency = new Map();
    for (const exercise of exercises) {
      const completedAt = sessionDates.get(String(exercise.workout_session));
      if (!completedAt) continue;
      const day = dateKey(completedAt);
      for (const set of exercise.sets || []) {
        if (!set.completed || !Number.isFinite(set.weight) || set.weight <= 0 || !Number.isFinite(set.reps) || set.reps <= 0) continue;
        const oneRepMax = estimatedOneRepMax(set);
        const current = records.get(exercise.exercise_name);
        if (!current || oneRepMax > current.estimated1RM) {
          records.set(exercise.exercise_name, {
            exercise: exercise.exercise_name,
            estimated1RM: oneRepMax,
            weight: set.weight,
            reps: set.reps,
            date: day,
          });
        }
        if (!strengthByDate.has(day)) strengthByDate.set(day, { date: day });
        const point = strengthByDate.get(day);
        point[exercise.exercise_name] = Math.max(point[exercise.exercise_name] || 0, oneRepMax);
        exerciseFrequency.set(exercise.exercise_name, (exerciseFrequency.get(exercise.exercise_name) || 0) + 1);
      }
    }

    const strengthExercises = [...exerciseFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
    const strengthTrends = [...strengthByDate.values()]
      .map(point => Object.fromEntries(Object.entries(point).filter(([key]) => key === 'date' || strengthExercises.includes(key))));

    const workoutsByDate = new Map();
    for (const session of sessions) {
      const day = dateKey(session.completed_at);
      workoutsByDate.set(day, (workoutsByDate.get(day) || 0) + 1);
    }
    const nutritionByDate = new Map();
    for (const log of nutrition) {
      const day = dateKey(log.logged_at);
      const total = nutritionByDate.get(day) || { date: day, calories: 0, protein: 0, carbs: 0, fat: 0 };
      for (const field of ['calories', 'protein', 'carbs', 'fat']) total[field] += Number(log[field]) || 0;
      nutritionByDate.set(day, total);
    }

    res.json({
      range: { start: start.toISOString(), end: now.toISOString() },
      personalRecords: [...records.values()].sort((a, b) => b.estimated1RM - a.estimated1RM).slice(0, 5),
      workoutConsistency: [...workoutsByDate.entries()].map(([date, count]) => ({ date, count })),
      strengthExercises,
      strengthTrends,
      nutritionTrends: [...nutritionByDate.values()].map(point => ({
        ...point,
        calories: Math.round(point.calories),
        protein: Math.round(point.protein),
        carbs: Math.round(point.carbs),
        fat: Math.round(point.fat),
      })),
    });
  } catch (error) { next(error); }
});

module.exports = router;

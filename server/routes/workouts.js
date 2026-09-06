const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkoutSession = require('../models/WorkoutSession');
const WorkoutExercise = require('../models/WorkoutExercise');
const WorkoutRoutine = require('../models/WorkoutRoutine');
const Exercise = require('../models/Exercise');
router.use(auth);
const aiWorkout = require('../controllers/aiWorkoutController');
router.post('/ai/generate', aiWorkout.generate);
router.post('/ai/:id/save', aiWorkout.save);
router.get('/overview', async (req, res) => {
  const [activeWorkout, routines] = await Promise.all([
    WorkoutSession.findOne({ user: req.user.id, is_active: true }).sort({ started_at: -1 }),
    WorkoutRoutine.find({ user: req.user.id, status: { $ne: 'draft' } }).populate('exercises.exercise', '-notes').sort({ created_at: -1 }).limit(6),
  ]);
  res.json({ activeWorkout, routines });
});
router.get('/routines', async (req, res) => {
  res.json(await WorkoutRoutine.find({ user: req.user.id, status: { $ne: 'draft' } }).populate('exercises.exercise', '-notes').sort({ created_at: -1 }));
});
router.post('/routines', async (req, res) => {
  const { name, exercises } = req.body;
  if (typeof name !== 'string' || !name.trim() || !Array.isArray(exercises) || !exercises.length || exercises.length > 100) return res.status(400).json({ error: 'Name your routine and select 1–100 exercises' });
  const entries = exercises.map(ex => ({ exercise: ex?._id || ex?.exercise, sets: ex?.sets ?? 3 }));
  if (entries.some(ex => !ex.exercise || !Number.isInteger(ex.sets) || ex.sets < 1 || ex.sets > 100)) return res.status(400).json({ error: 'Each exercise needs 1–100 target sets' });
  const ids = [...new Set(entries.map(ex => String(ex.exercise)))];
  if (await Exercise.countDocuments({ _id: { $in: ids } }) !== ids.length) return res.status(400).json({ error: 'Exercise not found' });
  res.status(201).json(await WorkoutRoutine.create({ user: req.user.id, name: name.trim(), exercises: entries }));
});
router.delete('/routines/:id', async (req, res) => {
  const routine = await WorkoutRoutine.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!routine) return res.status(404).json({ error: 'Routine not found' });
  res.json({ success: true });
});
router.post('/start', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  res.status(201).json(await WorkoutSession.create({ user: req.user.id, name: name || 'Quick Workout' }));
});
router.post('/start/:routineId', async (req, res) => {
  const routine = await WorkoutRoutine.findOne({ _id: req.params.routineId, user: req.user.id, status: { $ne: 'draft' } }).populate('exercises.exercise', '-notes');
  if (!routine) return res.status(404).json({ error: 'Routine not found' });
  if (routine.exercises.some(item => !item.exercise)) return res.status(409).json({ error: 'This routine contains a removed exercise. Please recreate it.' });
  const session = await WorkoutSession.create({ user: req.user.id, name: routine.name });
  try {
    await WorkoutExercise.insertMany(routine.exercises.map((item, index) => ({
      workout_session: session._id, exercise_base: item.exercise._id,
      exercise_name: item.exercise.name, muscle_group: item.exercise.bodyPart,
      order_index: index, target_sets: item.sets, target_reps: item.reps, rest_seconds: item.rest_seconds, sets: [],
    })));
  } catch (error) {
    await WorkoutExercise.deleteMany({ workout_session: session._id });
    await session.deleteOne();
    throw error;
  }
  res.status(201).json(session);
});
router.get('/:id', async (req, res) => {
  const session = await WorkoutSession.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const exercises = await WorkoutExercise.find({ workout_session: session._id }).populate('exercise_base', '-notes').sort({ order_index: 1 });
  res.json({ session, exercises });
});
router.post('/:id/exercises', async (req, res) => {
  const session = await WorkoutSession.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (!session.is_active) return res.status(409).json({ error: 'This workout is already finished' });
  if (!req.body.exerciseId) return res.status(400).json({ error: 'Select an exercise' });
  const base = await Exercise.findById(req.body.exerciseId).select('-notes');
  if (!base) return res.status(404).json({ error: 'Exercise not found' });
  const exercise = await WorkoutExercise.create({
    workout_session: session._id, exercise_base: base._id, exercise_name: base.name,
    muscle_group: base.bodyPart, order_index: await WorkoutExercise.countDocuments({ workout_session: session._id }), sets: [],
  });
  await exercise.populate('exercise_base', '-notes');
  res.status(201).json(exercise);
});
router.put('/:id/finish', async (req, res) => {
  const session = await WorkoutSession.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (!session.is_active) return res.json(session);
  session.is_active = false;
  session.completed_at = new Date();
  session.duration_minutes = Math.max(0, Math.floor((session.completed_at - session.started_at) / 60000));
  if (typeof req.body.name === 'string' && req.body.name.trim()) session.name = req.body.name.trim();
  await session.save();
  res.json(session);
});
async function ownedActiveExercise(req, res, next) {
  const exercise = await WorkoutExercise.findById(req.params.exerciseId);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
  const session = await WorkoutSession.findOne({ _id: exercise.workout_session, user: req.user.id });
  if (!session) return res.status(404).json({ error: 'Exercise not found' });
  if (!session.is_active) return res.status(409).json({ error: 'This workout is already finished' });
  req.workoutExercise = exercise;
  next();
}
router.post('/exercises/:exerciseId/sets', ownedActiveExercise, async (req, res) => {
  const { reps, weight } = req.body;
  if (!Number.isInteger(reps) || reps <= 0 || !Number.isFinite(weight) || weight < 0) return res.status(400).json({ error: 'Enter positive whole reps and a non-negative weight' });
  const exercise = req.workoutExercise;
  exercise.sets.push({ set_number: exercise.sets.length + 1, reps, weight, completed: true });
  await exercise.save();
  await exercise.populate('exercise_base', '-notes');
  res.json(exercise);
});
router.get('/exercises/:exerciseId/progression', ownedActiveExercise, async (req, res) => {
  const increment = req.query.increment === undefined ? 2.5 : Number(req.query.increment);
  if (!Number.isFinite(increment) || increment < 0.25 || increment > 10 || Array.isArray(req.query.increment)) return res.status(400).json({ error: 'Choose an increment from 0.25 to 10 kg' });
  const current = req.workoutExercise;
  const history = current.exercise_base ? await WorkoutSession.aggregate([
    { $match: { user: new (require('mongoose').Types.ObjectId)(req.user.id), is_active: false, completed_at: { $type: 'date', $lte: new Date() }, _id: { $ne: current.workout_session } } },
    { $sort: { completed_at: -1, _id: -1 } },
    { $lookup: { from: WorkoutExercise.collection.name, localField: '_id', foreignField: 'workout_session', as: 'exercises' } },
    { $set: { exercises: { $filter: { input: '$exercises', as: 'e', cond: { $eq: ['$$e.exercise_base', current.exercise_base] } } } } },
    // Duplicate entries in a session are ambiguous; do not count them twice.
    { $match: { 'exercises.0': { $exists: true } } }, { $limit: 2 },
    { $project: { _id: 0, completed_at: 1, sets: { $cond: [{ $eq: [{ $size: '$exercises' }, 1] }, { $arrayElemAt: ['$exercises.sets', 0] }, []] } } },
  ]) : [];
  const safeHistory = history.map(h => ({ completed_at: h.completed_at, sets: h.sets.map(s => ({ weight: s.weight, reps: s.reps, completed: s.completed })) }));
  res.json(require('../services/progression').recommend(current, safeHistory, increment));
});
router.delete('/exercises/:exerciseId/sets/:setId', ownedActiveExercise, async (req, res) => {
  const exercise = req.workoutExercise;
  if (!exercise.sets.some(set => String(set._id) === req.params.setId)) return res.status(404).json({ error: 'Set not found' });
  exercise.sets = exercise.sets.filter(set => String(set._id) !== req.params.setId);
  exercise.sets.forEach((set, index) => { set.set_number = index + 1; });
  await exercise.save();
  await exercise.populate('exercise_base', '-notes');
  res.json(exercise);
});
module.exports = router;

const ChatMessage = require('../models/ChatMessage');
const DietLog = require('../models/DietLog');
const Exercise = require('../models/Exercise');
const ExerciseSet = require('../models/ExerciseSet');
const InsightSnapshot = require('../models/InsightSnapshot');
const MealDraft = require('../models/MealDraft');
const Profile = require('../models/Profile');
const SavedMeal = require('../models/SavedMeal');
const User = require('../models/User');
const WorkoutExercise = require('../models/WorkoutExercise');
const WorkoutRoutine = require('../models/WorkoutRoutine');
const WorkoutSession = require('../models/WorkoutSession');

const allowedProfileFields = [
  'full_name', 'body_type', 'fitness_goal', 'weight_kg', 'height_cm', 'age',
  'gender', 'daily_calorie_goal', 'daily_protein_goal', 'daily_carbs_goal',
  'daily_fat_goal', 'onboarding_complete',
];

exports.getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(401).json({ error: 'Account not found' });
      profile = await Profile.create({ user: user.id, full_name: user.fullName });
    }
    if (!profile.full_name) {
      const user = await User.findById(req.user.id);
      profile.full_name = user?.fullName || 'Athlete';
      await profile.save();
    }
    res.json(profile);
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedProfileFields.includes(key)),
    );
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true },
    );
    if (!profile.full_name) {
      const user = await User.findById(req.user.id);
      profile.full_name = user?.fullName || 'Athlete';
      await profile.save();
    }
    res.json(profile);
  } catch (error) { next(error); }
};

exports.exportUserData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workouts = await WorkoutSession.find({ user: userId }).lean();
    const workoutIds = workouts.map(workout => workout._id);
    const [account, profile, diet, savedMeals, mealDrafts, workoutExercises, routines, chat, insights, exercises] = await Promise.all([
      User.findById(userId).select('email fullName createdAt').lean(),
      Profile.findOne({ user: userId }).lean(),
      DietLog.find({ user: userId }).lean(),
      SavedMeal.find({ user: userId }).lean(),
      MealDraft.find({ user: userId }).lean(),
      WorkoutExercise.find({ workout_session: { $in: workoutIds } }).lean(),
      WorkoutRoutine.find({ user: userId }).lean(),
      ChatMessage.find({ user: userId }).lean(),
      InsightSnapshot.findOne({ user: userId }).lean(),
      Exercise.find({ $or: [{ 'notes.user': userId }, { 'ratings.user': userId }] }).select('name notes ratings').lean(),
    ]);

    const exerciseContributions = exercises.map(exercise => ({
      exercise: exercise._id,
      name: exercise.name,
      notes: exercise.notes.filter(note => String(note.user) === userId),
      ratings: exercise.ratings.filter(rating => String(rating.user) === userId),
    }));
    const legacyExerciseSets = await ExerciseSet.find({
      workout_exercise: { $in: workoutExercises.map(exercise => exercise._id) },
    }).lean();
    const exportData = {
      exportedAt: new Date().toISOString(),
      account,
      profile,
      nutrition: { logs: diet, savedMeals, drafts: mealDrafts },
      training: { sessions: workouts, exercises: workoutExercises, legacyExerciseSets, routines },
      coach: { messages: chat, insights },
      exerciseContributions,
    };

    res.attachment('lifteat-data-export.json');
    res.type('application/json').send(JSON.stringify(exportData, null, 2));
  } catch (error) { next(error); }
};

async function removeExerciseContributions(userId) {
  const exercises = await Exercise.find({ $or: [{ 'notes.user': userId }, { 'ratings.user': userId }] });
  await Promise.all(exercises.map(async exercise => {
    exercise.notes = exercise.notes.filter(note => String(note.user) !== userId);
    exercise.ratings = exercise.ratings.filter(rating => String(rating.user) !== userId);
    const counts = { INJURED: 0, NO_FEEL: 0, MODERATE: 0, EFFECTIVE: 0 };
    for (const rating of exercise.ratings) counts[rating.value] += 1;
    exercise.stats = { counts, total: exercise.ratings.length };
    await exercise.save();
  }));
}

exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Account not found' });

    if (user.firebaseUid && process.env.FIREBASE_PROJECT_ID) {
      try {
        await require('../firebase').auth().deleteUser(user.firebaseUid);
      } catch (error) {
        if (error.code !== 'auth/user-not-found') throw error;
      }
    }

    const workoutIds = await WorkoutSession.find({ user: userId }).distinct('_id');
    const workoutExerciseIds = await WorkoutExercise.find({ workout_session: { $in: workoutIds } }).distinct('_id');
    await Promise.all([
      Profile.deleteOne({ user: userId }),
      DietLog.deleteMany({ user: userId }),
      SavedMeal.deleteMany({ user: userId }),
      MealDraft.deleteMany({ user: userId }),
      ExerciseSet.deleteMany({ workout_exercise: { $in: workoutExerciseIds } }),
      WorkoutExercise.deleteMany({ workout_session: { $in: workoutIds } }),
      WorkoutSession.deleteMany({ user: userId }),
      WorkoutRoutine.deleteMany({ user: userId }),
      ChatMessage.deleteMany({ user: userId }),
      InsightSnapshot.deleteOne({ user: userId }),
      removeExerciseContributions(userId),
    ]);
    await User.deleteOne({ _id: userId });
    res.json({ message: 'Account and all associated data permanently deleted.' });
  } catch (error) { next(error); }
};

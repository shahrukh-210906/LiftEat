const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const Exercise = require('./models/Exercise');

dotenv.config();

const RAW_REPO_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

const getStandardBodyPart = (ex) => {
  const category = (ex.category || '').toLowerCase();
  const muscle = (ex.primaryMuscles[0] || '').toLowerCase();

  // 1. Prioritize Cardio category
  if (category === 'cardio') return 'cardio';

  // 2. Map specific muscles to broad groups
  if (['abdominals'].includes(muscle)) return 'abs';
  if (['quadriceps', 'hamstrings', 'calves', 'glutes', 'adductors', 'abductors'].includes(muscle)) return 'legs';
  if (['biceps', 'triceps', 'forearms'].includes(muscle)) return 'arms';
  if (['chest', 'pectorals'].includes(muscle)) return 'chest';
  if (['lats', 'middle back', 'lower back', 'traps', 'trapezius'].includes(muscle)) return 'back';
  if (['shoulders', 'deltoids'].includes(muscle)) return 'shoulders';

  return muscle || 'full body';
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    console.log('⬇️  Downloading exercises...');
    
    const { data } = await axios.get(RAW_REPO_URL);

    const formattedExercises = data.map(ex => ({
      name: ex.name,
      category: ex.category,
      bodyPart: getStandardBodyPart(ex), // Applies the normalization
      equipment: ex.equipment || 'body weight',
      images: ex.images.map(img => `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`),
      instructions: ex.instructions
    }));

    console.log(`🌱 Seeding ${formattedExercises.length} exercises...`);
    // Preserve existing IDs, private notes, ratings and routine references.
    await Exercise.bulkWrite(formattedExercises.map(exercise => ({
      updateOne: { filter: { name: exercise.name }, update: { $set: exercise }, upsert: true }
    })));

    console.log('🚀 SUCCESS! Database populated.');
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Failed:", err.message);
    process.exit(1);
  }
};

seedDB();

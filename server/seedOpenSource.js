const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const Exercise = require('./models/Exercise');

dotenv.config();

const RAW_REPO_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    console.log('⬇️  Downloading 800+ exercises from Open Source DB...');
    const { data } = await axios.get(RAW_REPO_URL);

    // Transform data to match our schema
    const formattedExercises = data.map(ex => ({
      name: ex.name,
      category: ex.category,
      bodyPart: ex.primaryMuscles[0] || 'full body',
      equipment: ex.equipment || 'body weight',
      // The dataset provides simplified image paths, we format them to full URLs
      images: ex.images.map(img => `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`),
      instructions: ex.instructions
    }));

    console.log(`🧹 Clearing old exercises...`);
    await Exercise.deleteMany({});

    console.log(`🌱 Seeding ${formattedExercises.length} exercises...`);
    await Exercise.insertMany(formattedExercises);

    console.log('🚀 SUCCESS! Database populated.');
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Failed:", err.message);
    process.exit(1);
  }
};

seedDB();
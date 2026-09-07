const mongoose = require('mongoose');
const MealDraft = require('../models/MealDraft');

async function enforceUploadRetention() {
  try {
    // Uploaded photos are processed in memory and never persisted. This removes
    // expired AI review records if MongoDB's TTL cleanup has not run yet.
    const result = await MealDraft.deleteMany({ expiresAt: { $lte: new Date() } });
    console.log(`[Retention] Removed ${result.deletedCount} expired meal review records.`);
    return result.deletedCount;
  } catch (error) {
    console.error('[Retention] Failed to remove expired meal review records:', error);
    throw error;
  }
}

if (require.main === module) {
  require('../config/env');
  mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    .then(async () => {
      await enforceUploadRetention();
      await mongoose.disconnect();
    })
    .catch(error => {
      console.error('[Retention] Job failed:', error);
      process.exitCode = 1;
    });
}

module.exports = enforceUploadRetention;

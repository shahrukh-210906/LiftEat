require('./config/env');
const mongoose = require('mongoose');
const runBackupAndVerify = require('./jobs/backup');
const enforceUploadRetention = require('./jobs/retention');

async function start() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Set MONGODB_URI in the project root .env');

  if (process.env.FIREBASE_PROJECT_ID) require('./firebase').auth();
  else if (!process.env.JWT_SECRET) throw new Error('Configure Firebase or JWT_SECRET');

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });

  const stopInsights = require('./jobs/insights').startInsightJob();
  const backupTimer = process.env.BACKUP_ENABLED === 'true' ? setInterval(() => {
    runBackupAndVerify().catch(err => console.error('[Backup] Scheduled job failed:', err));
  }, 24 * 60 * 60 * 1000) : null;

  // Schedule daily upload retention cleanup (runs every 24 hours)
  const retentionTimer = setInterval(() => {
    enforceUploadRetention().catch(err => console.error('[Retention] Scheduled job failed:', err));
  }, 24 * 60 * 60 * 1000);

  const server = require('./app').listen(process.env.PORT || 5000, () => console.log('LiftEat API is ready'));
  const shutdown = () => server.close(async () => {
    if (backupTimer) clearInterval(backupTimer);
    clearInterval(retentionTimer);
    await stopInsights();
    await mongoose.disconnect();
    process.exit(0);
  });

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Startup failed. Check MongoDB connectivity and server authentication configuration.', err);
  process.exit(1);
});

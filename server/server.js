require('dotenv').config();
const mongoose = require('mongoose');
async function start() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Set MONGODB_URI in server/.env');
  if (process.env.FIREBASE_PROJECT_ID) require('./firebase').auth();
  else if (!process.env.JWT_SECRET) throw new Error('Configure Firebase or JWT_SECRET');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const server = require('./app').listen(process.env.PORT || 5000, () => console.log('LiftEat API is ready'));
  const shutdown = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
start().catch(() => { console.error('Startup failed. Check MongoDB connectivity and server authentication configuration.'); process.exit(1); });

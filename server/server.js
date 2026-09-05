require('dotenv').config();
const mongoose = require('mongoose');
async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) throw new Error('Set MONGO_URI and JWT_SECRET in server/.env');
  await mongoose.connect(process.env.MONGO_URI);
  const app = require('./app');
  const server = app.listen(process.env.PORT || 5000, () => console.log('LiftEat API is ready'));
  const shutdown = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
start().catch(error => { console.error(error.message); process.exit(1); });

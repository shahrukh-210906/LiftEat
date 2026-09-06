const mongoose = require('mongoose');
const Snapshot = require('../models/InsightSnapshot');
const Profile = require('../models/Profile');
const Workout = require('../models/WorkoutSession');
const Diet = require('../models/DietLog');
const DAY = 86400000;
const FRESH = 5 * 60000;
function cardsFor({ recent = 0, previous = 0, last = null, nutrition = {}, proteinGoal = null }, now) {
  const day = now.toISOString().slice(0, 10);
  const cards = [];
  const add = (id, title, body, action, href) => cards.push({ id: `${day}:${id}`, title, body, action, href });
  if (!last) add('first-workout', 'Your next step: a first workout', 'No completed workouts are recorded yet. Start a routine when you are ready.', 'Choose a workout', '/workout');
  else if (now - new Date(last) >= 7 * DAY) add('return', 'Plan your next session', 'Your last completed workout was at least 7 days ago. Review your routine and choose a manageable session.', 'Review routines', '/routines');
  else add('week', 'Your training week', `${recent} completed session${recent === 1 ? '' : 's'} in the past 7 days, compared with ${previous} in the preceding 7 days. Check your logs before planning what comes next.`, 'Review workouts', '/workout');
  if (!nutrition.entries) add('food', 'Keep your food log up to date', 'No meals are logged in the past 24 hours. Logging your next meal will give you a clearer nutrition picture.', 'Log a meal', '/diet');
  else {
    const protein = Math.round(nutrition.protein || 0);
    add('nutrition', 'Your recent nutrition log', `${nutrition.entries} entr${nutrition.entries === 1 ? 'y' : 'ies'} in the past 24 hours: ${Math.round(nutrition.calories || 0)} kcal and ${protein} g protein.${proteinGoal ? ` Your current daily protein target is ${proteinGoal} g.` : ''} These are logged totals; missing meals are not counted.`, 'Review nutrition', '/diet');
  }
  if (recent >= 3) add('consistency', 'Three or more sessions recorded', 'You have completed at least three workouts in the past 7 days. Review how you feel and leave room for recovery.', 'Review your plan', '/routines');
  else add('plan', 'Make your next workout easier to start', 'Choose your available equipment and time to generate a workout you can review and save.', 'Build a routine', '/routines');
  return cards;
}
async function compute(userId, now) {
  const user = new mongoose.Types.ObjectId(userId);
  const week = new Date(now - 7 * DAY);
  const fortnight = new Date(now - 14 * DAY);
  const [workouts, meals, profile] = await Promise.all([
    Workout.aggregate([{ $match: { user, is_active: false, completed_at: { $lte: now, $type: 'date' } } }, { $group: { _id: null, last: { $max: '$completed_at' }, recent: { $sum: { $cond: [{ $gte: ['$completed_at', week] }, 1, 0] } }, previous: { $sum: { $cond: [{ $and: [{ $gte: ['$completed_at', fortnight] }, { $lt: ['$completed_at', week] }] }, 1, 0] } } } }]),
    Diet.aggregate([{ $match: { user, logged_at: { $gte: new Date(now - DAY), $lte: now } } }, { $group: { _id: null, entries: { $sum: 1 }, calories: { $sum: '$calories' }, protein: { $sum: '$protein' } } }]),
    Profile.findOne({ user }).select('daily_protein_goal').lean(),
  ]);
  return cardsFor({ ...workouts[0], nutrition: meals[0] || {}, proteinGoal: profile?.daily_protein_goal }, now);
}
async function refresh(userId, now = new Date()) {
  let snapshot = await Snapshot.findOne({ user: userId });
  if (snapshot?.computedAt && now - snapshot.computedAt < FRESH) return snapshot;
  if (!snapshot) {
    try { snapshot = await Snapshot.create({ user: userId }); }
    catch (error) { if (error.code !== 11000) throw error; snapshot = await Snapshot.findOne({ user: userId }); }
  }
  // Database lease prevents duplicate refreshes across server processes.
  const leaseUntil = new Date(now.getTime() + 60000);
  const leased = await Snapshot.findOneAndUpdate({ _id: snapshot._id, $and: [
    { $or: [{ refreshingUntil: { $exists: false } }, { refreshingUntil: { $lte: now } }] },
    { $or: [{ computedAt: { $exists: false } }, { computedAt: { $lte: new Date(now - FRESH) } }] },
  ] }, { $set: { refreshingUntil: leaseUntil } }, { new: true });
  if (!leased) return await Snapshot.findById(snapshot._id) || snapshot;
  try {
    const cards = await compute(userId, now);
    return await Snapshot.findOneAndUpdate({ _id: snapshot._id, refreshingUntil: leaseUntil }, { $set: { cards, computedAt: now }, $unset: { refreshingUntil: 1 }, $pull: { dismissed: { $in: leased.dismissed.filter(id => !id.startsWith(now.toISOString().slice(0, 10) + ':')) } } }, { new: true }) || snapshot;
  } catch (error) {
    await Snapshot.updateOne({ _id: snapshot._id, refreshingUntil: leaseUntil }, { $unset: { refreshingUntil: 1 } });
    throw error;
  }
}
module.exports = { cardsFor, refresh, FRESH };


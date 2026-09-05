const firebase = require('../firebase');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return res.status(401).json({ error: 'Please sign in' });
  if (!process.env.FIREBASE_PROJECT_ID) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded.id || !decoded.exp) throw new Error('Invalid token');
      req.user = decoded;
      return next();
    } catch { return res.status(401).json({ error: 'Please sign in again' }); }
  }
  let decoded;
  try { decoded = await firebase.auth().verifyIdToken(token, true); }
  catch { return res.status(401).json({ error: 'Please sign in again' }); }
  if (!decoded.uid || !decoded.email) return res.status(401).json({ error: 'An email account is required' });
  try {
    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      const email = decoded.email.toLowerCase();
      const existing = await User.findOne({ email });
      if (existing) {
        // Only a verified Firebase email can claim an existing legacy account.
        if (existing.firebaseUid || !decoded.email_verified) return res.status(409).json({ error: 'Verify your Firebase email before linking an existing account' });
        user = await User.findOneAndUpdate({ _id: existing._id, firebaseUid: { $exists: false } }, { $set: { firebaseUid: decoded.uid } }, { new: true });
        if (!user) return res.status(409).json({ error: 'Please retry signing in' });
      } else {
        try { user = await User.create({ firebaseUid: decoded.uid, email, fullName: decoded.name || email.split('@')[0] }); }
        catch (error) {
          if (error.code !== 11000) throw error;
          user = await User.findOne({ firebaseUid: decoded.uid });
          if (!user) return res.status(409).json({ error: 'Account already exists' });
        }
      }
    }
    req.user = { id: user.id };
    next();
  } catch (error) { next(error); }
};
module.exports = protect;

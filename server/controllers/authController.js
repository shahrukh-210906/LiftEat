const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
function session(user) {
  return { token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
    user: { id: user._id, email: user.email, fullName: user.fullName } };
}
const registerUser = async (req, res) => {
  const { email, password, fullName } = req.body;
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72 ||
      typeof fullName !== 'string' || !fullName.trim()) {
    return res.status(400).json({ error: 'Enter a valid email, name and password of at least 8 characters (maximum 72 bytes)' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ error: 'Email is already registered' });
  const user = await User.create({ email: normalizedEmail, password: await bcrypt.hash(password, 12), fullName: fullName.trim() });
  try { await Profile.create({ user: user._id, full_name: user.fullName }); }
  catch (error) { await user.deleteOne(); throw error; }
  res.status(201).json(session(user));
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Enter your email and password' });
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid email or password' });
  res.json(session(user));
};
module.exports = { registerUser, loginUser };

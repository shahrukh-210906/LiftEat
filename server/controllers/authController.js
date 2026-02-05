const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

// @desc    Register new user
// @route   POST /api/auth/signup
const registerUser = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({ email, password: hashedPassword, fullName });
    // Create initial profile
    await Profile.create({ user: user._id, full_name: fullName });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, email, fullName } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/signin
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email, fullName: user.fullName } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser };
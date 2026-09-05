const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
router.use((req, res, next) => process.env.FIREBASE_PROJECT_ID
  ? res.status(410).json({ error: 'Sign in through Firebase Authentication' }) : next());

router.post('/signup', registerUser);
router.post('/signin', loginUser);

module.exports = router;

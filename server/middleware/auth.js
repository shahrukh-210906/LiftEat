const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // 1. Get the token from the header
  const token = req.header('Authorization');

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // 3. Verify token (Format is usually "Bearer <token>")
    // We split to remove "Bearer " if your frontend sends it that way. 
    // If your frontend sends just the token, you can skip the split.
    const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
    if (!decoded.id || !decoded.exp) return res.status(401).json({ error: 'Please sign in again' });

    // 4. Add user from payload to request object
    req.user = decoded;
    
    // 5. Move to the next middleware/route handler
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;

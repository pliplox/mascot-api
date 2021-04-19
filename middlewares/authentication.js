const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// ======================================================
// Token verification
// ======================================================
const authUser = (req, res, next) => {
  const token = req.get('Authorization');
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const { user } = decodedToken;
    req.currentUser = user;
    req.userId = user._id;
    return next();
  } catch (error) {
    return res.status(400).send(error);
  }
};

const authRole = role => async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (user.role !== role) {
    res.status(401);
    return res.send("You don't have sufficients permissions to access this");
  }

  return next();
};

module.exports = { authUser, authRole };

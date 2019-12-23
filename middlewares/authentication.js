const jwt = require('jsonwebtoken');

// ======================================================
// Token verification
// ======================================================
module.exports = (req, res, next) => {
  const token = req.get('Authorization');
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userId = decodedToken.user._id;
    return next();
  } catch (error) {
    return res.status(400).send(error);
  }
};

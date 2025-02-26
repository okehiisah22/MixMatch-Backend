const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization?.startsWith('Bearer')) {
      return res
        .status(401)
        .json({ success: false, message: 'You are not logged in' });
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'You are not logged in' });
    }

    const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decodedJwt.email });

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'You are not logged in' });
  }
};

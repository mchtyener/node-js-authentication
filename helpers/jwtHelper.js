const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/TokenBlacklist'); // Kara liste modelini ekleyin

const generateToken = (user) => {
  const payload = {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

  return token;
};

const verifyToken = async (token) => {
  try {
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return { valid: false, message: 'Token blacklisted' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, message: err.message };
  }
};

module.exports = {
  generateToken,
  verifyToken,
};

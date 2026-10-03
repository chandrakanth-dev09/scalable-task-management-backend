const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return sendError(res, 409, 'Email already registered');
  }

  const userId = await User.create(name, email, password);

  const token = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  return sendSuccess(res, 201, 'User registered successfully', {
    userId,
    name,
    email,
    token
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return sendError(res, 401, 'Invalid email or password');
  }

  const isPasswordValid = await User.comparePassword(password, user.password);
  if (!isPasswordValid) {
    return sendError(res, 401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  return sendSuccess(res, 200, 'Login successful', {
    userId: user.id,
    name: user.name,
    email: user.email,
    token
  });
});

module.exports = {
  register,
  login
};

const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Update lastLogin
    admin.lastLogin = new Date();
    await admin.save();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return sendError(res, 'Server security configuration missing.', 500);
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      secret,
      { expiresIn }
    );

    return sendSuccess(
      res,
      {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      'Authentication successful'
    );
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return sendError(res, 'Administrator not found.', 404);
    }
    return sendSuccess(res, admin, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  return sendSuccess(res, {}, 'Logged out successfully');
};

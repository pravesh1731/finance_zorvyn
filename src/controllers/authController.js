const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { createError } = require("../middleware/errorHandler");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// register 
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError("An account with this email already exists.", 409));
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

//login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return next(createError("Invalid email or password.", 401));
    }

    if (!user.isActive) {
      return next(createError("Your account has been deactivated. Contact an admin.", 403));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

//get profile
const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = { register, login, getProfile };

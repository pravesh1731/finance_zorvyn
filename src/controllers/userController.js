const { User } = require("../models/User");
const { createError } = require("../middleware/errorHandler");

// get all users admin only
const getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// get user by id admin only
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(createError("User not found.", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// patch user by id admin only
const updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;

    // Admins shouldn't be able to demote themselves — that could lock everyone out
    if (req.params.id === req.user._id.toString() && role && role !== req.user.role) {
      return next(createError("You cannot change your own role.", 403));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(createError("User not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (err) {
    next(err);
  }
};

// delete user by id admin only
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return next(createError("You cannot delete your own account.", 403));
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(createError("User not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return next(createError("Current password is incorrect.", 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, changePassword };

const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
} = require("../controllers/userController");

const { authenticate, authorize } = require("../middleware/auth");
const { updateUserValidator, changePasswordValidator } = require("../validators/userValidators");
const { validate } = require("../middleware/validate");

// auth
router.use(authenticate);

router.patch("/me/password", changePasswordValidator, validate, changePassword);



router.use(authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUserValidator, validate, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;

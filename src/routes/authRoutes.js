const express = require("express");
const router = express.Router();

const { register, login, getProfile } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { registerValidator, loginValidator } = require("../validators/authValidators");
const { validate } = require("../middleware/validate");

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", authenticate, getProfile);

module.exports = router;

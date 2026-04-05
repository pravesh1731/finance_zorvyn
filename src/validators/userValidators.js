const { body } = require("express-validator");

const updateUserValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty().withMessage("Name cannot be empty")
    .isLength({ max: 100 }).withMessage("Name cannot exceed 100 characters"),

  body("role")
    .optional()
    .isIn(["viewer", "analyst", "admin"]).withMessage("Role must be viewer, analyst, or admin"),

  body("isActive")
    .optional()
    .isBoolean().withMessage("isActive must be true or false"),
];

const changePasswordValidator = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

module.exports = { updateUserValidator, changePasswordValidator };

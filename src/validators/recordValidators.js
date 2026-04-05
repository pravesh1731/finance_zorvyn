const { body, query } = require("express-validator");
const { CATEGORIES, TYPES } = require("../models/Record");

const createRecordValidator = [
  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ min: 0.01 }).withMessage("Amount must be a positive number"),

  body("type")
    .notEmpty().withMessage("Type is required")
    .isIn(TYPES).withMessage(`Type must be one of: ${TYPES.join(", ")}`),

  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
];

const updateRecordValidator = [
  body("amount")
    .optional()
    .isFloat({ min: 0.01 }).withMessage("Amount must be a positive number"),

  body("type")
    .optional()
    .isIn(TYPES).withMessage(`Type must be one of: ${TYPES.join(", ")}`),

  body("category")
    .optional()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
];

const recordFilterValidator = [
  query("type")
    .optional()
    .isIn(TYPES).withMessage(`Type must be one of: ${TYPES.join(", ")}`),

  query("category")
    .optional()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),

  query("startDate")
    .optional()
    .isISO8601().withMessage("startDate must be a valid date"),

  query("endDate")
    .optional()
    .isISO8601().withMessage("endDate must be a valid date"),

  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];

module.exports = { createRecordValidator, updateRecordValidator, recordFilterValidator };

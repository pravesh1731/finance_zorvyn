const mongoose = require("mongoose");


const CATEGORIES = [
  "salary",
  "freelance",
  "investment",
  "rent",
  "utilities",
  "food",
  "transport",
  "healthcare",
  "entertainment",
  "education",
  "taxes",
  "other",
];

const TYPES = ["income", "expense"];

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: TYPES,
      required: [true, "Type is required (income or expense)"],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, "Category is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    // Track who created and last modified this record
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

recordSchema.index({ date: -1 });
recordSchema.index({ type: 1, date: -1 });
recordSchema.index({ category: 1 });

const Record = mongoose.model("Record", recordSchema);

module.exports = { Record, CATEGORIES, TYPES };

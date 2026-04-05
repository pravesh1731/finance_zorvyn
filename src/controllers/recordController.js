const { Record } = require("../models/Record");
const { createError } = require("../middleware/errorHandler");

// query filter 
const buildFilter = ({ type, category, startDate, endDate }) => {
  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  return filter;
};

// get records
const getRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sortBy = "date", order = "desc", ...filterParams } = req.query;

    const filter = buildFilter(filterParams);
    const sortOrder = order === "asc" ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      Record.find(filter)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Record.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      records,
    });
  } catch (err) {
    next(err);
  }
};

//get records by id
const getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!record) {
      return next(createError("Record not found.", 404));
    }

    res.status(200).json({
      success: true,
      record,
    });
  } catch (err) {
    next(err);
  }
};

// create records only by analyst or admin
const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;

    const record = await Record.create({
      amount,
      type,
      category,
      date: date || new Date(),
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Record created successfully.",
      record,
    });
  } catch (err) {
    next(err);
  }
};

//patch records for id only by analyst, admin
const updateRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;

    const record = await Record.findByIdAndUpdate(
      req.params.id,
      { amount, type, category, date, description, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!record) {
      return next(createError("Record not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "Record updated successfully.",
      record,
    });
  } catch (err) {
    next(err);
  }
};

// delete records by admin only
const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);

    if (!record) {
      return next(createError("Record not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "Record deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecords, getRecordById, createRecord, updateRecord, deleteRecord };

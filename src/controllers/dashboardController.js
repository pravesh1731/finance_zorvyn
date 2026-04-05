const { Record } = require("../models/Record");

// dashboard summary 
const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = buildDateFilter(startDate, endDate);

    const result = await Record.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    const summary = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };

    result.forEach(({ _id, total, count }) => {
      summary[_id] = total;
      summary[`${_id}Count`] = count;
    });

    summary.netBalance = summary.income - summary.expense;

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (err) {
    next(err);
  }
};

// summary by-category
const getByCategory = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;

    const matchStage = buildDateFilter(startDate, endDate);
    if (type) matchStage.type = type;

    const result = await Record.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categories = {};
    result.forEach(({ _id, total, count }) => {
      if (!categories[_id.category]) {
        categories[_id.category] = { category: _id.category };
      }
      categories[_id.category][_id.type] = total;
      categories[_id.category][`${_id.type}Count`] = count;
    });

    res.status(200).json({
      success: true,
      data: Object.values(categories),
    });
  } catch (err) {
    next(err);
  }
};

// summary by monthly-trends
const getMonthlyTrends = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const result = await Record.aggregate([
      {
        $match: {
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(2000, i).toLocaleString("default", { month: "long" }),
      income: 0,
      expense: 0,
      net: 0,
    }));

    result.forEach(({ _id, total }) => {
      const month = months[_id.month - 1];
      month[_id.type] = total;
    });

    months.forEach((m) => {
      m.net = m.income - m.expense;
    });

    res.status(200).json({
      success: true,
      year: parseInt(year),
      data: months,
    });
  } catch (err) {
    next(err);
  }
};

// summary by weekly-trends
const getWeeklyTrends = async (req, res, next) => {
  try {
    const weeksBack = 8;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeksBack * 7);

    const result = await Record.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            week: { $week: "$date" },
            year: { $year: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

//get recent transactions
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const records = await Record.find()
      .populate("createdBy", "name")
      .sort({ date: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (err) {
    next(err);
  }
};

const buildDateFilter = (startDate, endDate) => {
  const filter = {};

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

module.exports = { getSummary, getByCategory, getMonthlyTrends, getWeeklyTrends, getRecentActivity };

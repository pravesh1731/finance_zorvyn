const express = require("express");
const router = express.Router();

const {
  getSummary,
  getByCategory,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
} = require("../controllers/dashboardController");

const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.use(authorize("analyst", "admin"));

router.get("/summary", getSummary);
router.get("/by-category", getByCategory);
router.get("/monthly-trends", getMonthlyTrends);
router.get("/weekly-trends", getWeeklyTrends);
router.get("/recent", getRecentActivity);

module.exports = router;

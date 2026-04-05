const express = require("express");
const router = express.Router();

const {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordController");

const { authenticate, authorize } = require("../middleware/auth");
const {
  createRecordValidator,
  updateRecordValidator,
  recordFilterValidator,
} = require("../validators/recordValidators");
const { validate } = require("../middleware/validate");


router.use(authenticate);


router.get("/", recordFilterValidator, validate, getRecords);
router.get("/:id", getRecordById);


router.post("/", authorize("analyst", "admin"), createRecordValidator, validate, createRecord);
router.patch("/:id", authorize("analyst", "admin"), updateRecordValidator, validate, updateRecord);


router.delete("/:id", authorize("admin"), deleteRecord);

module.exports = router;

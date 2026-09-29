const express = require("express");
const router = express.Router();

const {
  getLeaveTypes,
} = require("../controllers/leaveType.controller");

router.get("/", getLeaveTypes);

module.exports = router;
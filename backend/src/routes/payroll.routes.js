const express = require("express");
const { getMonthlyPayroll } = require("../controllers/payroll.controller");
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { ROLES } = require("../config/constants");
const router = express.Router();
router.use(protect);
router.get("/monthly", allowRoles(ROLES.ADMIN, ROLES.ADMIN), getMonthlyPayroll);
module.exports = router;

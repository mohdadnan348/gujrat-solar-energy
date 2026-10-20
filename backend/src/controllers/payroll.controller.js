const payrollService = require("../services/payroll.service");

const getMonthlyPayroll = async (req, res, next) => {
  try {
    const data = await payrollService.getMonthlyPayroll({
      month: req.query.month, year: req.query.year, employee: req.query.employee,
    });
    return res.status(200).json({ success: true, message: "Payroll calculated successfully", data });
  } catch (error) { next(error); }
};

module.exports = { getMonthlyPayroll };

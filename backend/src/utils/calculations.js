// backend/src/utils/calculations.js

const calculatePercentage = (value, total) => {
  if (!total || total === 0) {
    return 0;
  }

  return (value / total) * 100;
};

const calculateTotal = (values = []) => {
  return values.reduce((total, value) => {
    return total + (Number(value) || 0);
  }, 0);
};

const calculateAverage = (values = []) => {
  if (!values.length) {
    return 0;
  }

  const total = calculateTotal(values);

  return total / values.length;
};

const calculateDifference = (value1, value2) => {
  return (Number(value1) || 0) - (Number(value2) || 0);
};

const calculateGrowthPercentage = (oldValue, newValue) => {
  const oldAmount = Number(oldValue) || 0;
  const newAmount = Number(newValue) || 0;

  if (oldAmount === 0) {
    return 0;
  }

  return ((newAmount - oldAmount) / oldAmount) * 100;
};

const roundNumber = (value, decimals = 2) => {
  const number = Number(value) || 0;

  return Number(number.toFixed(decimals));
};

module.exports = {
  calculatePercentage,
  calculateTotal,
  calculateAverage,
  calculateDifference,
  calculateGrowthPercentage,
  roundNumber,
};
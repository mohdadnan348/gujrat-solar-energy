const getCurrentDate = () => {
  return new Date();
};

const formatDate = (date) => {
  if (!date) return null;

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value.toISOString().split("T")[0];
};

const formatDateTime = (date) => {
  if (!date) return null;

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value.toISOString();
};

const isValidDate = (date) => {
  if (!date) return false;

  const value = new Date(date);

  return !Number.isNaN(value.getTime());
};

const addDays = (date, days) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  value.setDate(value.getDate() + Number(days));

  return value;
};

const subtractDays = (date, days) => {
  return addDays(date, -Number(days));
};

const getStartOfDay = (date = new Date()) => {
  const value = new Date(date);

  value.setHours(0, 0, 0, 0);

  return value;
};

const getEndOfDay = (date = new Date()) => {
  const value = new Date(date);

  value.setHours(23, 59, 59, 999);

  return value;
};

module.exports = {
  getCurrentDate,
  formatDate,
  formatDateTime,
  isValidDate,
  addDays,
  subtractDays,
  getStartOfDay,
  getEndOfDay,
};
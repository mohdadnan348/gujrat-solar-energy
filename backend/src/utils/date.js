const isValidDate = (value) => {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

const startOfDay = (value = new Date()) => {
  const date = new Date(value);

  if (!isValidDate(date)) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
};

const endOfDay = (value = new Date()) => {
  const date = new Date(value);

  if (!isValidDate(date)) {
    return null;
  }

  date.setHours(23, 59, 59, 999);

  return date;
};

const startOfMonth = (value = new Date()) => {
  const date = new Date(value);

  if (!isValidDate(date)) {
    return null;
  }

  date.setDate(1);
  date.setHours(0, 0, 0, 0);

  return date;
};

const endOfMonth = (value = new Date()) => {
  const date = new Date(value);

  if (!isValidDate(date)) {
    return null;
  }

  date.setMonth(date.getMonth() + 1, 0);
  date.setHours(23, 59, 59, 999);

  return date;
};

const addDays = (value, days = 0) => {
  const date = new Date(value);

  if (!isValidDate(date)) {
    return null;
  }

  date.setDate(
    date.getDate() + Number(days)
  );

  return date;
};

const subtractDays = (value, days = 0) => {
  return addDays(value, -Number(days));
};

const getDateRange = (
  startDate,
  endDate
) => {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  if (!start || !end) {
    return null;
  }

  return {
    $gte: start,
    $lte: end,
  };
};

const formatDate = (
  value,
  locale = "en-IN"
) => {
  if (!isValidDate(value)) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    locale,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
};

const formatDateTime = (
  value,
  locale = "en-IN"
) => {
  if (!isValidDate(value)) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    locale,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
};

module.exports = {
  isValidDate,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  addDays,
  subtractDays,
  getDateRange,
  formatDate,
  formatDateTime,
};
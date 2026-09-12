const generateNumber = (prefix = "", length = 8) => {
  const timestamp = Date.now().toString();

  const randomPart = Math.floor(
    Math.random() * Math.pow(10, length)
  )
    .toString()
    .padStart(length, "0");

  return `${prefix}${timestamp}${randomPart}`;
};

module.exports = generateNumber;
const crypto = require("crypto");

const generateId = (length = 16) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

module.exports = generateId;
const crypto = require("crypto");

const generateId = (prefix = "") => {
  const timestamp = Date.now().toString(36);

  const randomPart = crypto
    .randomBytes(4)
    .toString("hex");

  const id = `${timestamp}-${randomPart}`;

  return prefix
    ? `${prefix}-${id}`.toUpperCase()
    : id.toUpperCase();
};

module.exports = generateId;
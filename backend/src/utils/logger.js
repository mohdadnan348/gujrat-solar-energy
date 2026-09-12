const fs = require("fs");
const path = require("path");

const logsDirectory = path.join(__dirname, "../../logs");

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const writeLog = (level, message, meta = {}) => {
  const logFile = path.join(logsDirectory, "app.log");

  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...(Object.keys(meta).length > 0 && { meta }),
  };

  fs.appendFileSync(
    logFile,
    `${JSON.stringify(logEntry)}\n`,
    "utf8"
  );
};

const info = (message, meta = {}) => {
  writeLog("INFO", message, meta);
};

const warn = (message, meta = {}) => {
  writeLog("WARN", message, meta);
};

const error = (message, meta = {}) => {
  writeLog("ERROR", message, meta);
};

const debug = (message, meta = {}) => {
  writeLog("DEBUG", message, meta);
};

module.exports = {
  info,
  warn,
  error,
  debug,
};
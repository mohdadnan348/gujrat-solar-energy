const logger = {
  info(message, meta = {}) {
    console.log(
      `[INFO] ${new Date().toISOString()} - ${message}`,
      Object.keys(meta).length ? meta : ""
    );
  },

  warn(message, meta = {}) {
    console.warn(
      `[WARN] ${new Date().toISOString()} - ${message}`,
      Object.keys(meta).length ? meta : ""
    );
  },

  error(message, error = null, meta = {}) {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`
    );

    if (error) {
      console.error(error);
    }

    if (Object.keys(meta).length) {
      console.error(meta);
    }
  },

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[DEBUG] ${new Date().toISOString()} - ${message}`,
        Object.keys(meta).length ? meta : ""
      );
    }
  },
};

module.exports = logger;
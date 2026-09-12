const fs = require("fs");
const path = require("path");

const ensureDirectoryExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

const deleteFile = (filePath) => {
  if (fileExists(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }

  return false;
};

const getFileExtension = (fileName) => {
  return path.extname(fileName).toLowerCase();
};

const getFileName = (filePath) => {
  return path.basename(filePath);
};

const getFileSize = (filePath) => {
  if (!fileExists(filePath)) {
    return 0;
  }

  const stats = fs.statSync(filePath);
  return stats.size;
};

const createUniqueFileName = (originalName) => {
  const extension = getFileExtension(originalName);
  const baseName = path.basename(originalName, extension)
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .substring(0, 100);

  return `${baseName}-${Date.now()}${extension}`;
};

module.exports = {
  ensureDirectoryExists,
  fileExists,
  deleteFile,
  getFileExtension,
  getFileName,
  getFileSize,
  createUniqueFileName,
};
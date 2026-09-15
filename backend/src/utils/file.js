const fs = require("fs");
const path = require("path");

const ensureDirectory = (directoryPath) => {
  if (!directoryPath) {
    throw new Error("Directory path is required");
  }

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, {
      recursive: true,
    });
  }

  return directoryPath;
};

const fileExists = (filePath) => {
  if (!filePath) return false;

  return fs.existsSync(filePath);
};

const getFileExtension = (filePath) => {
  if (!filePath) return "";

  return path.extname(filePath).toLowerCase();
};

const getFileName = (filePath) => {
  if (!filePath) return "";

  return path.basename(filePath);
};

const getFileNameWithoutExtension = (
  filePath
) => {
  if (!filePath) return "";

  return path.basename(
    filePath,
    path.extname(filePath)
  );
};

const getFileSize = (filePath) => {
  if (!fileExists(filePath)) {
    return 0;
  }

  const stats = fs.statSync(filePath);

  return stats.size;
};

const deleteFile = async (filePath) => {
  if (!fileExists(filePath)) {
    return false;
  }

  await fs.promises.unlink(filePath);

  return true;
};

const readFile = async (filePath) => {
  if (!fileExists(filePath)) {
    throw new Error("File not found");
  }

  return fs.promises.readFile(filePath);
};

const writeFile = async (
  filePath,
  data
) => {
  if (!filePath) {
    throw new Error("File path is required");
  }

  const directory = path.dirname(filePath);

  ensureDirectory(directory);

  await fs.promises.writeFile(
    filePath,
    data
  );

  return filePath;
};

const moveFile = async (
  sourcePath,
  destinationPath
) => {
  if (!fileExists(sourcePath)) {
    throw new Error("Source file not found");
  }

  ensureDirectory(
    path.dirname(destinationPath)
  );

  await fs.promises.rename(
    sourcePath,
    destinationPath
  );

  return destinationPath;
};

const copyFile = async (
  sourcePath,
  destinationPath
) => {
  if (!fileExists(sourcePath)) {
    throw new Error("Source file not found");
  }

  ensureDirectory(
    path.dirname(destinationPath)
  );

  await fs.promises.copyFile(
    sourcePath,
    destinationPath
  );

  return destinationPath;
};

const sanitizeFileName = (fileName) => {
  if (!fileName) return "";

  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .trim();
};

const generateUniqueFileName = (
  originalName
) => {
  const extension =
    getFileExtension(originalName);

  const baseName = sanitizeFileName(
    getFileNameWithoutExtension(
      originalName
    )
  );

  return `${baseName || "file"}-${Date.now()}${extension}`;
};

module.exports = {
  ensureDirectory,
  fileExists,
  getFileExtension,
  getFileName,
  getFileNameWithoutExtension,
  getFileSize,
  deleteFile,
  readFile,
  writeFile,
  moveFile,
  copyFile,
  sanitizeFileName,
  generateUniqueFileName,
};
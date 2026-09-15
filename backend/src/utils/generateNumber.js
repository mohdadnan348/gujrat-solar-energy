const generateNumber = async ({
  Model,
  field,
  prefix = "",
  padding = 5,
  start = 1,
} = {}) => {
  if (!Model) {
    throw new Error("Model is required");
  }

  if (!field) {
    throw new Error("Field is required");
  }

  const lastDocument = await Model.findOne({
    [field]: {
      $exists: true,
      $ne: null,
    },
  })
    .sort({ createdAt: -1 })
    .select(field)
    .lean();

  let nextNumber = start;

  if (lastDocument?.[field]) {
    const value = String(lastDocument[field]);

    const matches = value.match(/\d+$/);

    if (matches) {
      nextNumber =
        Number(matches[0]) + 1;
    }
  }

  const number = String(nextNumber).padStart(
    padding,
    "0"
  );

  return prefix
    ? `${prefix}-${number}`
    : number;
};

module.exports = generateNumber;
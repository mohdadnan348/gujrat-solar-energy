const getPagination = (page = 1, limit = 10) => {
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.max(parseInt(limit, 10) || 10, 1);

  const skip = (currentPage - 1) * perPage;

  return {
    page: currentPage,
    limit: perPage,
    skip,
  };
};

const getPaginationMeta = (totalItems, page, limit) => {
  const total = Number(totalItems) || 0;
  const currentPage = Number(page) || 1;
  const perPage = Number(limit) || 10;

  const totalPages = Math.ceil(total / perPage);

  return {
    totalItems: total,
    totalPages,
    currentPage,
    limit: perPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

module.exports = {
  getPagination,
  getPaginationMeta,
};
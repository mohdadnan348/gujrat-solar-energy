import { useCallback, useMemo, useState } from "react";

const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
  totalItems = 0,
} = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = useMemo(() => {
    if (!totalItems || totalItems <= 0) return 1;

    return Math.max(1, Math.ceil(totalItems / limit));
  }, [totalItems, limit]);

  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const nextPage = useCallback(() => {
    setPage((currentPage) =>
      currentPage < totalPages ? currentPage + 1 : currentPage
    );
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setPage((currentPage) =>
      currentPage > 1 ? currentPage - 1 : currentPage
    );
  }, []);

  const goToPage = useCallback(
    (targetPage) => {
      const nextPageNumber = Number(targetPage);

      if (!Number.isFinite(nextPageNumber)) return;

      setPage(
        Math.min(
          Math.max(1, Math.floor(nextPageNumber)),
          totalPages
        )
      );
    },
    [totalPages]
  );

  const changeLimit = useCallback((newLimit) => {
    const parsedLimit = Number(newLimit);

    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      return;
    }

    setLimit(Math.floor(parsedLimit));
    setPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  const startItem =
    totalItems > 0 ? (page - 1) * limit + 1 : 0;

  const endItem =
    totalItems > 0
      ? Math.min(page * limit, totalItems)
      : 0;

  return {
    page,
    limit,
    totalPages,
    totalItems,
    startItem,
    endItem,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    setPage: goToPage,
    changeLimit,
    setLimit: changeLimit,
    resetPagination,
  };
};

export default usePagination;
export const calculatePaginationIndices = <T extends { contractAddress: string }>(
  list: T[],
  cursor: string | undefined,
  perPage: number,
) => {
  let startIndex = 0;

  if (cursor) {
    const cursorIndex = list.findIndex((item) => item.contractAddress === cursor);
    startIndex = cursorIndex !== -1 ? cursorIndex + 1 : 0;
  }

  return {
    startIndex,
    endIndex: startIndex + perPage,
  };
};

export const getNextCursor = <T extends { contractAddress: string }>(
  items: T[],
  totalItems: number,
  startIndex: number,
  perPage: number,
): string | null => {
  return items.length === perPage && startIndex + perPage < totalItems
    ? items[items.length - 1].contractAddress
    : null;
};

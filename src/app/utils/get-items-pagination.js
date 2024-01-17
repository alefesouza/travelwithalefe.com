import { ITEMS_PER_PAGE } from './constants';

const getItemsPagination = (items, type, page = 1, isWebStories = false) => {
  const typeItems = items.filter((p) => p.type === type);

  return {
    total: typeItems.length,
    pageNumber: Math.ceil(typeItems.length / ITEMS_PER_PAGE),
    items: isWebStories
      ? typeItems
      : typeItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
  };
};

export default getItemsPagination;

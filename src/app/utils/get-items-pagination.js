import { ITEMS_PER_PAGE, SCROLLER_ITEMS_PER_PAGE } from './constants';

const getItemsPagination = (
  items,
  type,
  page = 1,
  isWebStories = false,
  isScroller = false
) => {
  const typeItems = items.filter((p) => p.type === type);
  const pagination = isScroller ? SCROLLER_ITEMS_PER_PAGE : ITEMS_PER_PAGE;

  return {
    total: typeItems.length,
    pageNumber: Math.ceil(typeItems.length / pagination),
    items: isWebStories
      ? typeItems
      : typeItems.slice((page - 1) * pagination, page * pagination),
  };
};

export default getItemsPagination;

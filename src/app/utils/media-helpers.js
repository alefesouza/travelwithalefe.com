import { ITEMS_PER_PAGE } from './constants';

/**
 * Expand galleries in media list
 * @param {import('@/typings/media').Media[]} medias
 * @returns {import('@/typings/media').Media[]}
 */
export function expandMediaGalleries(medias) {
  let expandedList = [];

  medias.forEach((item) => {
    expandedList.push(item);

    if (item.gallery && item.gallery.length) {
      const galleryItems = item.gallery.map((g, i) => ({
        ...item,
        ...g,
        is_gallery: true,
        img_index: i + 2,
      }));
      expandedList.push(...galleryItems);
    }
  });

  return expandedList;
}

/**
 * Paginate media array
 * @param {import('@/typings/media').Media[]} medias
 * @param {number} page
 * @returns {import('@/typings/media').Media[]}
 */
export function paginateMedia(medias, page) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  return medias.slice(start, start + ITEMS_PER_PAGE);
}

/**
 * Build pagination base URL
 * @param {string} country
 * @param {string | null} city
 * @param {boolean} expandGalleries
 * @param {'asc' | 'desc' | 'random'} sort
 * @returns {string}
 */
export function buildPaginationBase(country, city, expandGalleries, sort) {
  let base = `/countries/${country}${
    city ? '/cities/' + city : ''
  }/page/{page}`;

  if (expandGalleries) {
    base += '/expand';
  }

  if (sort !== 'desc') {
    base += '?sort=' + sort;
  }

  return base;
}

/**
 * Get ordered dates from cities
 */
export function getOrderedDates(cities) {
  const dates = cities.flatMap((c) => [c.start, c.end]);
  return dates.sort(function (a, b) {
    a = a.split('/').reverse().join('');
    b = b.split('/').reverse().join('');
    return a > b ? 1 : a < b ? -1 : 0;
  });
}

/**
 * Filter and sort main locations
 * @param {import('@/typings/location').Location[]} locations
 * @param {number} [limit=10]
 * @returns {import('@/typings/location').Location[]}
 */
export function getMainLocations(locations, limit = 10) {
  return locations
    .filter((l) => !l.hide_in_main_visited && l.total)
    .sort((a, b) => b.total - b.totals.maps - (a.total - a.totals.maps))
    .slice(0, limit);
}

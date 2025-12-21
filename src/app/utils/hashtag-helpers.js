import removeDiacritics from './remove-diacritics';
import getSort from './get-sort';

/**
 * Parse hashtag route parameters
 * @param {string[]} slug
 * @param {Record<string, string>} searchParams
 * @returns {{hashtag: string, page: number, expandGalleries: boolean, sort: string, isWebStories: boolean}}
 */
export function getHashtagDataFromRoute(slug, searchParams) {
  const [hashtag, path1, path2, path3] = slug;

  let page = path1 === 'page' ? path2 : 1;
  page = parseInt(page);
  page = isNaN(page) ? 1 : page;

  const expandGalleries = path1 === 'expand' || path3 === 'expand';
  const isWebStories = path1 === 'webstories' || path3 === 'webstories';
  const sort = getSort(searchParams);

  return {
    hashtag: removeDiacritics(decodeURIComponent(hashtag)).toLowerCase(),
    page,
    expandGalleries,
    sort,
    isWebStories,
  };
}

/**
 * Build breadcrumbs for hashtag pages
 * @param {string} basePath
 * @param {string} currentHashtag
 * @param {number} page
 * @param {boolean} expandGalleries
 * @param {(key: string) => string} i18n
 * @param {(path: string) => string} host
 * @returns {Array<{name: string, item: string}>}
 */
export function getHashtagBreadcrumbs(
  basePath,
  currentHashtag,
  page,
  expandGalleries,
  i18n,
  host
) {
  let currentPath = basePath;

  const breadcrumbs = [
    {
      name: 'Hashtags',
      item: host('/hashtags'),
    },
    {
      name: `#${currentHashtag}`,
      item: host(basePath),
    },
  ];

  if (page > 1) {
    currentPath += '/page/' + page;
    breadcrumbs.push({
      name: i18n('Page') + ' ' + page,
      item: currentPath,
    });
  }

  if (expandGalleries) {
    breadcrumbs.push({
      name: i18n('Expand Galleries'),
      item: currentPath + '/expand',
    });
  }

  return breadcrumbs;
}

import countries from './countries';
import getSort from './get-sort';

/**
 * Parses route parameters to extract country, city, page, and sorting options
 * @param {string[]} slug
 * @param {Record<string, string>} searchParams
 * @returns {{country: string, city: string | null, page: number, expandGalleries: boolean, sort: string}}
 */
export function getDataFromRoute(slug, searchParams) {
  const [country, path1, path2, path3, path4, path5] = slug;

  let city = null;
  if (path1 === 'cities') {
    city = path2;
  }

  let page = path1 === 'page' ? path2 : path3 === 'page' ? path4 : 1;
  page = parseInt(page);
  page = isNaN(page) ? 1 : page;

  const expandGalleries =
    path1 === 'expand' || path3 === 'expand' || path5 === 'expand';

  let sort = getSort(searchParams);

  return {
    country,
    city,
    page,
    expandGalleries,
    sort,
  };
}

/**
 * Retrieves country data and validates city if provided
 * @param {string} slug
 * @param {Record<string, string>} searchParams
 * @returns {import('@/app/utils/countries').CountryData | false}
 */
export function getCountry(slug, searchParams) {
  let { country, city } = getDataFromRoute(slug, searchParams);

  const theCountry = countries.find((c) => c.slug === country);

  if (
    !theCountry ||
    (city && !theCountry.cities.find((c) => c.slug === city))
  ) {
    return false;
  }

  return theCountry;
}

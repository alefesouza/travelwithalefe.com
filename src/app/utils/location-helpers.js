import getSort from './get-sort';

/**
 * Parse location route parameters
 */
export function getLocationDataFromRoute(
  slug,
  searchParams,
  isWebStories = false
) {
  const [location, path5, path6, path7, path8] = slug;

  let page = path5 === 'page' ? path6 : 1;
  page = parseInt(page);
  page = isNaN(page) ? 1 : page;

  const expandGalleries = path5 === 'expand' || path7 === 'expand';
  const sort = getSort(searchParams, isWebStories);

  return {
    page,
    expandGalleries,
    sort,
    isWebStories: path5 === 'webstories' || path7 === 'webstories',
    location: decodeURIComponent(location).toLowerCase(),
  };
}

/**
 * Get possible city slugs for locations that may have multiple visits
 * @param {{slug: string, travel_number?: number}} theCity
 * @returns {string[]}
 */
export function getPossibleCities(theCity) {
  let possibleCities = [theCity.slug];

  if (theCity.travel_number) {
    for (let i = 2; i <= theCity.travel_number; i++) {
      possibleCities.push(theCity.slug + '-' + i);
    }
  }

  return possibleCities;
}

/**
 * Build breadcrumbs for location pages
 */
export function getLocationBreadcrumbs(
  countryData,
  cityData,
  locationData,
  page,
  expandGalleries,
  i18n,
  host,
  isBR
) {
  let currentPath = host(
    '/countries/' + countryData.slug + '/cities/' + cityData.slug
  );

  const breadcrumbs = [
    {
      name: i18n(countryData.name),
      item: host('/countries/' + countryData.slug),
    },
    {
      name: isBR && cityData.name_pt ? cityData.name_pt : cityData.name,
      item: currentPath,
    },
  ];

  currentPath += '/locations/' + locationData.slug;
  breadcrumbs.push({
    name:
      isBR && locationData.name_pt ? locationData.name_pt : locationData.name,
    item: currentPath,
  });

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

/**
 * Determines the appropriate link for a country.
 * If the country has only one city with only stories, returns the stories page URL.
 * Otherwise, returns the country page URL.
 *
 * @param {import('@/typings/countries').Country} country - The country object
 * @returns {string} The URL path for the country
 */
export function getCountryLink(country) {
  // Check if country has exactly one city with only stories
  if (
    country.cities &&
    country.cities.length === 1 &&
    country.cities[0].totals.stories > 0 &&
    country.cities[0].totals.posts < 3 &&
    !country.cities[0].totals.photos360 &&
    !country.cities[0].totals.videos &&
    !country.cities[0].totals.shorts &&
    !country.cities[0].totals.maps
  ) {
    return `/countries/${country.slug}/cities/${country.cities[0].slug}/stories`;
  }

  return `/countries/${country.slug}`;
}

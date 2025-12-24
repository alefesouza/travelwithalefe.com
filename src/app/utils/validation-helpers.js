import { cachedCountries, cachedCities } from './cache-data';
import { notFound } from 'next/navigation';

/**
 * Validate that country and city exist in cache
 * @param {string} country
 * @param {string} [city]
 * @returns {true} Returns true if valid, calls notFound() if invalid
 */
export function validateCountryCity(country, city) {
  if (
    !cachedCountries.includes(country) ||
    (city && !cachedCities.includes(city))
  ) {
    return notFound();
  }
  return true;
}

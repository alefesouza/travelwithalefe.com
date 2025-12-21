import {
  cachedCountries,
  cachedCities,
  cachedHashtags,
  cachedLocations,
} from './cache-data';
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

/**
 * Validate that hashtag exists in cache
 * @param {string} hashtag
 * @returns {true} Returns true if valid, calls notFound() if invalid
 */
export function validateHashtag(hashtag) {
  if (!cachedHashtags.includes(hashtag)) {
    return notFound();
  }
  return true;
}

/**
 * Validate that location exists in cache
 * @param {string} location
 * @returns {true} Returns true if valid, calls notFound() if invalid
 */
export function validateLocation(location) {
  if (!cachedLocations.includes(location)) {
    return notFound();
  }
  return true;
}

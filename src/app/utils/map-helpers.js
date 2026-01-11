import { getFirestore } from 'firebase-admin/firestore';
import { theCachedLocations } from '../utils/cache-locations';
import countries from '../utils/countries';

/**
 * @typedef {import('@/typings/location').Location} Location
 */

/**
 * Get locations from cache or countries data
 * @returns {Location[]}
 */
function getLocationsFromCache() {
  const locations = theCachedLocations.filter(
    (l) => l.latitude && l.longitude && !l.hide_in_map
  );

  countries.forEach((data) => {
    locations.push(
      ...data.cities
        .filter((c) => !c.hide_in_map)
        .map((c) => ({
          latitude: c.latitude,
          longitude: c.longitude,
          name: c.name,
          name_pt: c.name_pt || null,
          is_placeholder: true,
          city: c.slug,
          country: data.slug,
        }))
    );
  });

  return locations;
}

/**
 * Fetch locations from Firestore
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @returns {Promise<Location[]>}
 */
async function fetchLocationsFromFirestore(db) {
  const firestoreCache = db.doc('/caches/static_pages/static_pages/locations');

  if (firestoreCache.exists) {
    const cacheDoc = await firestoreCache.get();
    const cacheData = cacheDoc.data();

    if (cacheData && Array.isArray(cacheData.locations)) {
      return cacheData.locations;
    }
  }

  const locations = [];

  const locationsSnapshot = await db.collectionGroup('locations').get();
  locationsSnapshot.forEach((doc) => {
    const data = doc.data();

    if (!data.latitude || !data.longitude || data.hide_in_map) {
      return;
    }

    locations.push(data);
  });

  const countriesSnapshot = await db.collectionGroup('countries').get();
  countriesSnapshot.forEach((doc) => {
    const data = doc.data();

    locations.push(
      ...data.cities
        .filter((c) => !c.hide_in_map)
        .map((c) => ({
          latitude: c.latitude,
          longitude: c.longitude,
          name: c.name,
          name_pt: c.name_pt || null,
          is_placeholder: true,
          city: c.slug,
          country: data.slug,
        }))
    );
  });

  firestoreCache.set({ locations });

  return locations;
}

/**
 * Fetch locations with proper caching
 * @param {boolean} useCache - Whether to use cache
 * @returns {Promise<Location[]>}
 */
export async function fetchLocations(useCache) {
  if (useCache) {
    return getLocationsFromCache();
  }

  const db = getFirestore();

  return fetchLocationsFromFirestore(db);
}

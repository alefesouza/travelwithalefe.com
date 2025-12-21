import { getFirestore } from 'firebase-admin/firestore';
import { headers } from 'next/headers';
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

  return locations;
}

/**
 * Fetch locations with proper caching
 * @param {boolean} useCache - Whether to use cache
 * @param {boolean} editMode - Whether in edit mode
 * @returns {Promise<Location[]>}
 */
export async function fetchLocations(useCache, editMode) {
  if (useCache) {
    return getLocationsFromCache();
  }

  const db = getFirestore();
  const cacheRef = '/caches/static_pages/static_pages/locations';

  if (editMode) {
    return fetchLocationsFromFirestore(db);
  }

  const cache = await db.doc(cacheRef).get();

  if (!cache.exists) {
    const locations = await fetchLocationsFromFirestore(db);

    await db.doc(cacheRef).set({
      locations,
      last_update: new Date().toISOString().split('T')[0],
      user_agent: headers().get('user-agent'),
    });

    return locations;
  }

  return cache.data().locations;
}

import { getFirestore } from 'firebase-admin/firestore';
import { cachedMedias } from '@/app/utils/cache-medias';
import { theCachedLocations } from '@/app/utils/cache-locations';
import { sortByDateDesc, sortByDateAsc } from '@/app/utils/media-sorting';

/**
 * Fetch location metadata
 * @param {boolean} useCache
 * @param {string} country
 * @param {string} city
 * @param {string} location
 * @returns {Promise<any>}
 */
export async function fetchLocationMetadata(useCache, country, city, location) {
  if (useCache) {
    return theCachedLocations.find(
      (m) => m.country === country && m.city === city && m.slug === location
    );
  }

  const db = getFirestore();
  const mediaRef = await db
    .collection('countries')
    .doc(country)
    .collection('cities')
    .doc(city)
    .collection('locations')
    .doc(location)
    .get();

  return mediaRef.data();
}

/**
 * Fetch location media from cache
 * @param {string} country
 * @param {string[]} possibleCities
 * @param {string} location
 * @param {string} sort
 * @returns {import('@/typings/media').Media[]}
 */
function fetchLocationMediaFromCache(country, possibleCities, location, sort) {
  let photosSnapshot = cachedMedias.filter(
    (m) =>
      m.country === country &&
      possibleCities.includes(m.city) &&
      m.locations &&
      m.locations.includes(location)
  );

  photosSnapshot = photosSnapshot.sort(
    sort === 'desc' ? sortByDateDesc : sortByDateAsc
  );

  return photosSnapshot;
}

/**
 * Fetch location media from Firestore
 * @param {FirebaseFirestore.Firestore} db
 * @param {string[]} possibleCities
 * @param {string} location
 * @param {string} sort
 * @param {boolean} shouldCache
 * @param {string} cacheRef
 * @returns {Promise<import('@/typings/media').Media[]>}
 */
async function fetchLocationMediaFromFirestore(
  db,
  possibleCities,
  location,
  sort,
  shouldCache,
  cacheRef
) {
  const photosSnapshot = await db
    .collectionGroup('medias')
    .where('locations', 'array-contains', location)
    .where('city', 'in', possibleCities)
    .orderBy('order', sort)
    .get();

  const photos = [];
  photosSnapshot.forEach((photo) => {
    const data = photo.data();
    data.path = photo.ref.path;
    photos.push(data);
  });

  if (shouldCache) {
    db.doc(cacheRef).set({
      photos,
      last_update: new Date().toISOString().split('T')[0],
    });
  }

  return photos;
}

/**
 * Fetch location media with proper caching
 * @param {boolean} useCache
 * @param {string} country
 * @param {string[]} possibleCities
 * @param {string} location
 * @param {string} sort
 * @param {boolean} isRandom
 * @param {boolean} isWebStories
 * @param {string} city
 * @param {boolean} editMode
 * @returns {Promise<import('@/typings/media').Media[]>}
 */
export async function fetchLocationMedia(
  useCache,
  country,
  possibleCities,
  location,
  sort,
  isRandom,
  isWebStories,
  city,
  editMode
) {
  if (useCache) {
    return fetchLocationMediaFromCache(country, possibleCities, location, sort);
  }

  const db = getFirestore();
  const cacheRef = `/caches/locations/locations-cache/${city}-${location}/sort/${
    sort === 'asc' ? 'asc' : 'desc'
  }`;

  let cache = null;

  if (editMode) {
    cache = { exists: false };
  } else {
    cache = await db.doc(cacheRef).get();
  }

  if (!cache.exists || isWebStories) {
    const shouldCache = !isRandom && !cache.exists && !isWebStories;
    return fetchLocationMediaFromFirestore(
      db,
      possibleCities,
      location,
      sort,
      shouldCache,
      cacheRef
    );
  }

  return cache.data().photos;
}

import { cachedMedias } from './cache-medias';
import { ITEMS_PER_PAGE } from './constants';

/**
 * Fetch medias from cache
 * @param {string} country
 * @param {string | null} city
 * @param {number} page
 * @returns {{instagramHighLights: import('@/typings/media').Media[], shortVideos: import('@/typings/media').Media[], youtubeVideos: import('@/typings/media').Media[], _360photos: import('@/typings/media').Media[], instagramPhotos: import('@/typings/media').Media[], mapsPhotos: import('@/typings/media').Media[]}}
 */
export function fetchMediasFromCache(country, city, page) {
  const filterFn = city
    ? (m) => m.country === country && m.city === city
    : (m) => m.country === country;

  const allMedias = cachedMedias.filter(filterFn);

  const result = {
    instagramHighLights: [],
    shortVideos: [],
    youtubeVideos: [],
    _360photos: [],
    instagramPhotos: [],
    mapsPhotos: [],
  };

  if (page === 1) {
    result.instagramHighLights = allMedias.filter((m) => m.is_highlight);
    result.shortVideos = allMedias.filter((m) => m.type === 'short-video');
    result.youtubeVideos = allMedias.filter((m) => m.type === 'youtube');
    result._360photos = allMedias.filter((m) => m.type === '360photo');
  }

  result.instagramPhotos = allMedias.filter((m) => m.type === 'post');
  result.mapsPhotos = allMedias.filter((m) => m.type === 'maps');

  return result;
}

/**
 * Fetch medias from Firestore
 * @param {any} db - Firestore database instance
 * @param {string} country
 * @param {string | null} city
 * @param {number} page
 * @param {'asc' | 'desc'} sort
 * @param {number} totalPhotos
 * @param {number} totalMapsPhotos
 * @returns {Promise<{instagramHighLights: import('@/typings/media').Media[], shortVideos: import('@/typings/media').Media[], youtubeVideos: import('@/typings/media').Media[], _360photos: import('@/typings/media').Media[], instagramPhotos: import('@/typings/media').Media[], mapsPhotos: import('@/typings/media').Media[]}>}
 */
export async function fetchMediasFromFirestore(
  db,
  country,
  city,
  page,
  sort,
  totalPhotos,
  totalMapsPhotos
) {
  // Fetch from Firestore
  const result = {
    instagramHighLights: [],
    shortVideos: [],
    youtubeVideos: [],
    _360photos: [],
    instagramPhotos: [],
    mapsPhotos: [],
  };

  // Fetch highlights, videos, etc. for page 1
  if (page === 1) {
    const [highlights, shorts, youtube, photos360] = await Promise.all([
      fetchHighlights(db, country, city, sort),
      fetchShortVideos(db, country, city, sort),
      fetchYoutubeVideos(db, country, city, sort),
      fetch360Photos(db, country, city, sort),
    ]);

    result.instagramHighLights = highlights;
    result.shortVideos = shorts;
    result.youtubeVideos = youtube;
    result._360photos = photos360;
  }

  // Fetch posts and maps
  const [posts, maps] = await Promise.all([
    fetchPosts(db, country, city, sort, totalPhotos),
    fetchMaps(db, country, city, sort, totalMapsPhotos),
  ]);

  result.instagramPhotos = posts;
  result.mapsPhotos = maps;

  return result;
}

async function fetchHighlights(db, country, city, sort) {
  let snapshot;

  if (city) {
    snapshot = await db
      .collection('countries')
      .doc(country)
      .collection('cities')
      .doc(city)
      .collection('medias')
      .where('is_highlight', '==', true)
      .get();
  } else {
    snapshot = await db
      .collectionGroup('medias')
      .where('country', '==', country)
      .where('is_highlight', '==', true)
      .orderBy('date', sort)
      .get();
  }

  return snapshotToArray(snapshot);
}

async function fetchShortVideos(db, country, city, sort) {
  let snapshot;

  if (city) {
    snapshot = await db
      .collection('countries')
      .doc(country)
      .collection('cities')
      .doc(city)
      .collection('medias')
      .where('type', '==', 'short-video')
      .orderBy('order', sort)
      .get();
  } else {
    snapshot = await db
      .collectionGroup('medias')
      .where('country', '==', country)
      .where('type', '==', 'short-video')
      .orderBy('city_location_id', sort)
      .orderBy('order', sort)
      .get();
  }

  return snapshotToArray(snapshot);
}

async function fetchYoutubeVideos(db, country, city, sort) {
  let snapshot;

  if (city) {
    snapshot = await db
      .collection('countries')
      .doc(country)
      .collection('cities')
      .doc(city)
      .collection('medias')
      .where('type', '==', 'youtube')
      .orderBy('order', sort)
      .get();
  } else {
    snapshot = await db
      .collectionGroup('medias')
      .where('country', '==', country)
      .where('type', '==', 'youtube')
      .orderBy('city_location_id', sort)
      .orderBy('order', sort)
      .get();
  }

  return snapshotToArray(snapshot);
}

async function fetch360Photos(db, country, city, sort) {
  let snapshot;

  if (city) {
    snapshot = await db
      .collection('countries')
      .doc(country)
      .collection('cities')
      .doc(city)
      .collection('medias')
      .where('type', '==', '360photo')
      .orderBy('order', sort)
      .get();
  } else {
    snapshot = await db
      .collectionGroup('medias')
      .where('country', '==', country)
      .where('type', '==', '360photo')
      .orderBy('city_location_id', sort)
      .orderBy('order', sort)
      .get();
  }

  return snapshotToArray(snapshot);
}

async function fetchPosts(db, country, city, sort, totalPhotos) {
  if (totalPhotos === 0) return [];

  let query;
  const indexField = city ? 'city_index' : 'country_index';

  if (city) {
    query = db
      .collection('countries')
      .doc(country)
      .collection('cities')
      .doc(city)
      .collection('medias')
      .where('type', '==', 'post');
  } else {
    query = db
      .collectionGroup('medias')
      .where('country', '==', country)
      .where('type', '==', 'post');
  }

  query = query.orderBy(indexField, sort).limit(ITEMS_PER_PAGE);

  const snapshot = await query.get();
  return snapshotToArray(snapshot);
}

async function fetchMaps(db, country, city, sort, totalMapsPhotos) {
  if (totalMapsPhotos === 0) return [];

  let query;
  const indexField = city ? 'city_index' : 'country_index';

  if (city) {
    query = db
      .collection('countries')
      .doc(country)
      .collection('cities')
      .doc(city)
      .collection('medias')
      .where('type', '==', 'maps');
  } else {
    query = db
      .collectionGroup('medias')
      .where('country', '==', country)
      .where('type', '==', 'maps');
  }

  query = query.orderBy(indexField, sort).limit(ITEMS_PER_PAGE);

  const snapshot = await query.get();
  return snapshotToArray(snapshot);
}

function snapshotToArray(snapshot) {
  const result = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    data.path = doc.ref.path;
    result.push(data);
  });
  return result;
}

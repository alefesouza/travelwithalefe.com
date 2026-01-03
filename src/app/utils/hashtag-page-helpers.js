import { getFirestore } from 'firebase-admin/firestore';
import { cachedMedias } from '../utils/cache-medias';
import { theCachedHashtags } from '../utils/cache-hashtags';
import { sortByDateDesc, sortByDateAsc } from '../utils/media-sorting';

/**
 * Find hashtag by name or name_pt
 * @param {boolean} useCache
 * @param {string} hashtag
 * @returns {Promise<{hashtagPt: any, hashtagEn: any}>}
 */
export async function findHashtag(useCache, hashtag) {
  let hashtagPt = null;
  let hashtagEn = null;

  if (useCache) {
    hashtagPt = theCachedHashtags.find((h) => h.name_pt === hashtag);
    if (!hashtagPt) {
      hashtagEn = theCachedHashtags.find((h) => h.name === hashtag);
    }
  } else {
    const db = getFirestore();
    const hashtagPtSnapshot = await db
      .collection('hashtags')
      .where('name_pt', '==', hashtag)
      .get();

    hashtagPtSnapshot.forEach((doc) => {
      hashtagPt = doc.data();
    });

    if (!hashtagPt) {
      const hashtagEnDoc = await db.collection('hashtags').doc(hashtag).get();
      hashtagEn = hashtagEnDoc.data();
    }
  }

  return { hashtagPt, hashtagEn };
}

/**
 * Find alternate hashtag
 * @param {boolean} useCache
 * @param {string} hashtag
 * @returns {Promise<any>}
 */
export async function findAlternateHashtag(useCache, hashtag) {
  if (useCache) {
    return theCachedHashtags.find(
      (h) => h.alternate_tags && h.alternate_tags.includes(hashtag)
    );
  }

  const db = getFirestore();
  const hashtagAlternateDoc = await db
    .collection('hashtags')
    .where('alternate_tags', 'array-contains', hashtag)
    .get();

  let hashtagAlternate = null;
  hashtagAlternateDoc.forEach((doc) => {
    hashtagAlternate = doc.data();
  });

  return hashtagAlternate;
}

/**
 * Fetch cover photo for hashtag
 * @param {boolean} useCache
 * @param {string} hashtagName
 * @param {string} sort
 * @param {boolean} isWebStories
 * @returns {Promise<any>}
 */
export async function fetchHashtagCover(
  useCache,
  hashtagName,
  sort,
  isWebStories
) {
  let cover = null;

  if (useCache) {
    let coverSnapshot = cachedMedias.filter(
      (m) => m.highlight_hashtags && m.highlight_hashtags.includes(hashtagName)
    );

    if (!coverSnapshot.length) {
      coverSnapshot = cachedMedias.filter(
        (m) => m.hashtags && m.hashtags.includes(hashtagName)
      );

      coverSnapshot = coverSnapshot.sort(
        sort === 'desc' ? sortByDateDesc : sortByDateAsc
      );

      coverSnapshot = coverSnapshot.slice(0, isWebStories ? 1 : 2);
    }

    coverSnapshot.forEach((data) => {
      if ((cover && cover.type === 'post') || !cover) {
        cover = data;
      }
    });
  } else {
    const db = getFirestore();
    let coverSnapshot = await db
      .collectionGroup('medias')
      .where('highlight_hashtags', 'array-contains', hashtagName)
      .limit(1)
      .get();

    if (coverSnapshot.size === 0) {
      coverSnapshot = await db
        .collectionGroup('medias')
        .where('hashtags', 'array-contains', hashtagName)
        .orderBy('date', sort)
        .limit(isWebStories ? 1 : 2)
        .get();
    }

    coverSnapshot.forEach((photo) => {
      const data = photo.data();

      if ((cover && cover.type === 'post') || !cover) {
        cover = data;
      }
    });
  }

  return cover;
}

/**
 * Fetch media for hashtag from cache
 * @param {string} hashtag
 * @param {string} sort
 * @returns {any[]}
 */
function fetchHashtagMediaFromCache(hashtag, sort) {
  let photosSnapshot = cachedMedias.filter(
    (m) => m.hashtags && m.hashtags.includes(hashtag)
  );

  photosSnapshot = photosSnapshot.sort(
    sort === 'desc' ? sortByDateDesc : sortByDateAsc
  );

  return photosSnapshot;
}

/**
 * Fetch media for hashtag from Firestore
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} hashtag
 * @param {string} sort
 * @param {boolean} shouldCache
 * @param {string} cacheRef
 * @returns {Promise<any[]>}
 */
async function fetchHashtagMediaFromFirestore(
  db,
  hashtag,
  sort,
  shouldCache,
  cacheRef
) {
  const photosSnapshot = await db
    .collectionGroup('medias')
    .where('hashtags', 'array-contains', hashtag)
    .orderBy('date', sort)
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
 * Fetch media for hashtag with proper caching
 * @param {boolean} useCache
 * @param {string} hashtag
 * @param {string} sort
 * @param {boolean} isWebStories
 * @param {boolean} editMode
 * @returns {Promise<any[]>}
 */
export async function fetchHashtagMedia(
  useCache,
  hashtag,
  sort,
  isWebStories,
  editMode
) {
  if (useCache) {
    return fetchHashtagMediaFromCache(hashtag, sort);
  }

  const db = getFirestore();
  const cacheRef = `/caches/hashtags/hashtags-cache/${hashtag}/sort/${
    sort === 'asc' ? 'asc' : 'desc'
  }`;

  let cache = null;

  if (editMode) {
    cache = { exists: false };
  } else {
    cache = await db.doc(cacheRef).get();
  }

  if (!cache.exists || isWebStories) {
    const shouldCache = !cache.exists;
    return fetchHashtagMediaFromFirestore(
      db,
      hashtag,
      sort,
      shouldCache,
      cacheRef
    );
  }

  return cache.data().photos;
}

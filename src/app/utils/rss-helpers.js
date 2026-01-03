import { getFirestore } from 'firebase-admin/firestore';
import { cachedMedias } from './cache-medias';
import { ITEMS_PER_PAGE } from './constants';

/**
 * Fetch media for home RSS feed from cache
 * @param {string} type - Optional media type filter
 * @returns {any[]}
 */
function fetchHomeRSSFromCache(type) {
  let photosSnapshot = cachedMedias;

  if (type) {
    photosSnapshot = photosSnapshot.filter((m) => m.type === type);
  }

  photosSnapshot = photosSnapshot
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, ITEMS_PER_PAGE);

  return photosSnapshot;
}

/**
 * Fetch media for home RSS feed from Firestore
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @param {string} type - Optional media type filter
 * @returns {Promise<any[]>}
 */
async function fetchHomeRSSFromFirestore(db, type) {
  let photosSnapshot = db
    .collectionGroup('medias')
    .limit(ITEMS_PER_PAGE)
    .orderBy('createdAt', 'desc');

  if (type) {
    photosSnapshot = photosSnapshot.where('type', '==', type);
  }

  photosSnapshot = await photosSnapshot.get();

  const photos = [];
  photosSnapshot.forEach((doc) => {
    const data = doc.data();
    data.path = doc.ref.path;
    photos.push(data);
  });

  return photos;
}

/**
 * Fetch media for home RSS feed
 * @param {boolean} useCache - Whether to use cache
 * @param {string} type - Optional media type filter
 * @returns {Promise<any[]>}
 */
export async function fetchHomeRSSFeed(useCache, type) {
  if (useCache) {
    return fetchHomeRSSFromCache(type);
  }

  const db = getFirestore();

  return fetchHomeRSSFromFirestore(db, type);
}

/**
 * Fetch media for hashtag RSS feed from cache
 * @param {string} hashtagName - Hashtag name
 * @param {string} type - Optional media type filter
 * @param {number} rssLimit - RSS item limit
 * @returns {any[]}
 */
function fetchHashtagRSSFromCache(hashtagName, type, rssLimit) {
  let photosSnapshot = cachedMedias.filter(
    (m) => m.hashtags && m.hashtags.includes(hashtagName)
  );

  if (type) {
    photosSnapshot = photosSnapshot.filter((m) => m.type === type);
  }

  photosSnapshot = photosSnapshot
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, rssLimit || ITEMS_PER_PAGE);

  return photosSnapshot;
}

/**
 * Fetch media for hashtag RSS feed from Firestore
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @param {string} hashtagName - Hashtag name
 * @param {string} type - Optional media type filter
 * @param {number} rssLimit - RSS item limit
 * @returns {Promise<any[]>}
 */
async function fetchHashtagRSSFromFirestore(db, hashtagName, type, rssLimit) {
  let photosSnapshot = db
    .collectionGroup('medias')
    .where('hashtags', 'array-contains', hashtagName);

  if (type) {
    photosSnapshot = photosSnapshot.where('type', '==', type);
  }

  photosSnapshot = await photosSnapshot
    .limit(rssLimit ? rssLimit : ITEMS_PER_PAGE)
    .orderBy('createdAt', 'desc')
    .get();

  const photos = [];
  photosSnapshot.forEach((doc) => {
    const data = doc.data();
    data.path = doc.ref.path;
    photos.push(data);
  });

  return photos;
}

/**
 * Fetch media for hashtag RSS feed
 * @param {boolean} useCache - Whether to use cache
 * @param {string} hashtagName - Hashtag name
 * @param {string} type - Optional media type filter
 * @param {number} rssLimit - RSS item limit
 * @returns {Promise<any[]>}
 */
export async function fetchHashtagRSSFeed(
  useCache,
  hashtagName,
  type,
  rssLimit
) {
  if (useCache) {
    return fetchHashtagRSSFromCache(hashtagName, type, rssLimit || 10);
  }

  const db = getFirestore();

  return fetchHashtagRSSFromFirestore(db, hashtagName, type, rssLimit);
}

/**
 * Expand gallery items for RSS feed
 * @param {any[]} instagramPhotos - Instagram photos array
 * @param {any} finalHashtag - Hashtag object (optional)
 * @returns {any[]}
 */
export function expandGalleriesForRSS(instagramPhotos, finalHashtag) {
  let expandedList = [];

  instagramPhotos.forEach((item) => {
    expandedList = [...expandedList, item];

    if (item.gallery && item.gallery.length) {
      const gallery = item.gallery.map((g, i) => ({
        ...item,
        ...g,
        is_gallery: true,
        img_index: i + 2,
      }));
      const itemWithHashtag = gallery.findIndex(
        (g) =>
          g.item_hashtags &&
          finalHashtag &&
          g.item_hashtags.includes(finalHashtag.name)
      );

      if (itemWithHashtag > -1) {
        delete gallery[itemWithHashtag].is_gallery;
        expandedList[expandedList.length - 1] = gallery[itemWithHashtag];

        item.file_type = 'image';
        gallery[itemWithHashtag] = item;
      }

      if (finalHashtag && finalHashtag.rss_limit === 2000) {
        expandedList = [...expandedList, ...gallery];
      } else {
        if (item.rss && finalHashtag && item.rss.includes(finalHashtag.name)) {
          expandedList = [...expandedList, ...gallery];
        } else {
          expandedList = [
            ...expandedList,
            ...gallery.filter(
              (g) =>
                g.rss_include &&
                finalHashtag &&
                g.rss_include.includes(finalHashtag.name)
            ),
          ];
        }
      }
    }
  });

  return expandedList;
}

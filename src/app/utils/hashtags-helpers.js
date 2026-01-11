import { getFirestore } from 'firebase-admin/firestore';
import { theCachedHashtags } from '../utils/cache-hashtags';

/**
 * @typedef {import('@/typings/hashtag').Hashtag} Hashtag
 */

/**
 * Fetch main hashtags from cache
 * @returns {Hashtag[]}
 */
function fetchMainHashtagsFromCache() {
  return theCachedHashtags
    .filter((h) => !h.is_place && !h.hide_on_cloud)
    .sort((a, b) => b.total - a.total)
    .slice(0, 100);
}

/**
 * Fetch main hashtags from Firestore
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @returns {Promise<Hashtag[]>}
 */
async function fetchMainHashtagsFromFirestore(db) {
  const hashtags = [];
  const hashtagsSnapshot = await db
    .collection('hashtags')
    .where('is_place', '==', false)
    .where('hide_on_cloud', '==', false)
    .limit(100)
    .orderBy('total', 'desc')
    .get();

  hashtagsSnapshot.forEach((doc) => {
    hashtags.push(doc.data());
  });

  return hashtags;
}

/**
 * Fetch all hashtags from cache
 * @param {boolean} isBR - Whether to use Brazilian Portuguese names
 * @returns {string[]}
 */
function fetchAllHashtagsFromCache(isBR) {
  return isBR
    ? theCachedHashtags.map((h) => h.name_pt || h.name)
    : theCachedHashtags.map((h) => h.name);
}

/**
 * Fetch all hashtags from Firestore
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @param {boolean} isBR - Whether to use Brazilian Portuguese names
 * @returns {Promise<string[]>}
 */
async function fetchAllHashtagsFromFirestore(db, isBR) {
  const allHashtagsRef = await db
    .collection('caches')
    .doc('static_pages')
    .collection('static_pages')
    .doc('hashtags')
    .get();
  const allHashtagsData = allHashtagsRef.data();
  return allHashtagsData.hashtags.map((h) =>
    isBR && h.name_pt ? h.name_pt : h.name
  );
}

/**
 * Fetch main and all hashtags
 * @param {boolean} useCache - Whether to use cache
 * @param {boolean} isBR - Whether to use Brazilian Portuguese names
 * @returns {Promise<{hashtags: Hashtag[], allHashtags: string[]}>}
 */
export async function fetchHashtags(useCache, isBR) {
  if (useCache) {
    return {
      hashtags: fetchMainHashtagsFromCache(),
      allHashtags: fetchAllHashtagsFromCache(isBR),
    };
  }

  const db = getFirestore();

  return {
    hashtags: await fetchMainHashtagsFromFirestore(db),
    allHashtags: await fetchAllHashtagsFromFirestore(db, isBR),
  };
}

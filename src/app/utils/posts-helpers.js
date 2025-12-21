import { getFirestore } from 'firebase-admin/firestore';
import { cachedMedias } from '@/app/utils/cache-medias';

/**
 * Fetch media from cache or Firestore
 * @param {boolean} useCache
 * @param {string} country
 * @param {string} city
 * @param {string[]} media
 * @returns {Promise<import('@/typings/media').Media | null>}
 */
export async function fetchMedia(useCache, country, city, media) {
  const mediaId = media[0].includes(city + '-')
    ? media[0]
    : city + '-post-' + media[0];

  if (useCache) {
    return (
      cachedMedias.find(
        (m) =>
          m.country === country && m.city === city && m.path.includes(mediaId)
      ) || null
    );
  }

  const db = getFirestore();
  const mediaRef = await db
    .collection('countries')
    .doc(country)
    .collection('cities')
    .doc(city)
    .collection('medias')
    .doc(mediaId)
    .get();

  const mediaData = mediaRef.data();
  if (mediaData && !useCache) {
    mediaData.path = mediaRef.ref.path;
  }

  return mediaData || null;
}

/**
 * Expand media gallery items
 * @param {import('@/typings/media').Media} theMedia
 * @returns {import('@/typings/media').Media}
 */
export function expandMediaGallery(theMedia) {
  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({
      ...theMedia,
      ...g,
      is_gallery: true,
      img_index: i + 2,
    }));
  }
  return theMedia;
}

/**
 * Fetch media by original ID (for redirects)
 * @param {boolean} useCache
 * @param {string} country
 * @param {string} city
 * @param {string} originalId
 * @returns {Promise<import('@/typings/media').Media | null>}
 */
export async function fetchMediaByOriginalId(
  useCache,
  country,
  city,
  originalId
) {
  if (useCache) {
    return (
      cachedMedias.find(
        (m) =>
          m.country === country &&
          m.city === city &&
          m.original_id === originalId
      ) || null
    );
  }

  const db = getFirestore();
  const mediaSnapshot = await db
    .collection('countries')
    .doc(country)
    .collection('cities')
    .doc(city)
    .collection('medias')
    .where('original_id', '==', originalId)
    .get();

  if (mediaSnapshot.size === 0) {
    return null;
  }

  let mediaData = null;
  mediaSnapshot.forEach((doc) => {
    mediaData = doc.data();
  });

  return mediaData;
}

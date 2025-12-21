import { getFirestore } from 'firebase-admin/firestore';
import { headers } from 'next/headers';
import { cachedMedias } from '@/app/utils/cache-medias';
import { sortByDateDesc, sortByDateAsc } from '@/app/utils/media-sorting';

/**
 * Add story link to media items
 * @param {import('@/typings/media').Media} data
 */
function addStoryLink(data) {
  if (data.type === 'story') {
    data.link =
      'https://www.instagram.com/stories/highlights/' + data.original_id + '/';
  }
  return data;
}

/**
 * Fetch stories from cache
 * @param {string} country
 * @param {string} city
 * @param {boolean} isWebStories
 * @param {string} sort
 * @returns {import('@/typings/media').Media[]}
 */
function fetchStoriesFromCache(country, city, isWebStories, sort) {
  let photosSnapshot = cachedMedias.filter(
    (m) => m.country === country && m.city === city
  );

  if (!isWebStories) {
    photosSnapshot = photosSnapshot.filter((m) => m.type === 'story');
  }

  photosSnapshot = photosSnapshot.sort(
    sort === 'desc' ? sortByDateDesc : sortByDateAsc
  );

  return photosSnapshot.map(addStoryLink);
}

/**
 * Fetch stories from Firestore
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} country
 * @param {string} city
 * @param {boolean} isWebStories
 * @param {string} sort
 * @param {boolean} shouldCache
 * @param {string} cacheRef
 * @returns {Promise<import('@/typings/media').Media[]>}
 */
async function fetchStoriesFromFirestore(
  db,
  country,
  city,
  isWebStories,
  sort,
  shouldCache,
  cacheRef
) {
  let photosSnapshot = await db
    .collection('countries')
    .doc(country)
    .collection('cities')
    .doc(city)
    .collection('medias');

  if (!isWebStories) {
    photosSnapshot = photosSnapshot.where('type', '==', 'story');
  }

  photosSnapshot = await photosSnapshot.orderBy('order', sort).get();

  const photos = [];
  photosSnapshot.forEach((photo) => {
    const data = photo.data();
    data.path = photo.ref.path;
    photos.push(addStoryLink(data));
  });

  if (shouldCache) {
    db.doc(cacheRef).set({
      photos,
      last_update: new Date().toISOString().split('T')[0],
      user_agent: headers().get('user-agent'),
    });
  }

  return photos;
}

/**
 * Expand posts with galleries for web stories
 * @param {import('@/typings/media').Media[]} posts
 * @returns {import('@/typings/media').Media[]}
 */
export function expandPostsForWebStories(posts) {
  let expandedList = [];

  posts.forEach((item) => {
    expandedList = [...expandedList, item];

    if (item.gallery && item.gallery.length) {
      const gallery = item.gallery.map((g, i) => ({
        ...item,
        ...g,
        is_gallery: true,
        img_index: i + 2,
      }));
      const itemWithHashtag = gallery.findIndex((g) => g.item_hashtags);

      if (itemWithHashtag > -1) {
        delete gallery[itemWithHashtag].is_gallery;
        expandedList[expandedList.length - 1] = gallery[itemWithHashtag];

        item.file_type = 'image';
        gallery[itemWithHashtag] = item;
      }

      if (posts.length <= 5 || item.is_compilation) {
        expandedList = [...expandedList, ...gallery];
      } else if (gallery.some((g) => g.rss_include)) {
        expandedList = [
          ...expandedList,
          ...gallery.filter((g) => g.rss_include),
        ];
      }
    }
  });

  return expandedList;
}

/**
 * Fetch stories with proper caching
 * @param {boolean} useCache
 * @param {string} country
 * @param {string} city
 * @param {boolean} isWebStories
 * @param {string} sort
 * @param {boolean} isRandom
 * @param {any} cache
 * @param {string} cacheRef
 * @returns {Promise<import('@/typings/media').Media[]>}
 */
export async function fetchStories(
  useCache,
  country,
  city,
  isWebStories,
  sort,
  isRandom,
  cache,
  cacheRef
) {
  if (useCache) {
    return fetchStoriesFromCache(country, city, isWebStories, sort);
  }

  const db = getFirestore();

  if (!cache.exists || isWebStories) {
    const shouldCache = !isRandom && !isWebStories && !cache.exists;
    return fetchStoriesFromFirestore(
      db,
      country,
      city,
      isWebStories,
      sort,
      shouldCache,
      cacheRef
    );
  }

  return cache.data().photos;
}

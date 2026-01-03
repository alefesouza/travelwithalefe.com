import { getFirestore } from 'firebase-admin/firestore';
// import { headers } from 'next/headers';

/**
 * Fetch data from cache or generate new cache
 * @param {string} cacheRef - Cache reference path
 * @param {Function} fetchCallback - Callback to fetch data if cache doesn't exist
 * @returns {Promise<any>} Cached or fetched data
 */
export async function fetchWithCache(cacheRef, fetchCallback) {
  const db = getFirestore();
  const cache = await db.doc(cacheRef).get();

  if (!cache.exists) {
    const data = await fetchCallback(db);

    await db.doc(cacheRef).set({
      ...data,
      last_update: new Date().toISOString().split('T')[0],
      // user_agent: headers().get('user-agent'),
    });

    return data;
  }

  return cache.data();
}

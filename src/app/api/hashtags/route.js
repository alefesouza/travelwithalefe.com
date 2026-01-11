import { getFirestore } from 'firebase-admin/firestore';
import { customInitApp } from '@/app/firebase';
import useHost from '@/app/hooks/use-host';
import logAccess from '@/app/utils/log-access';
import { theCachedHashtags } from '@/app/utils/cache-hashtags';
import { USE_CACHE } from '@/app/utils/constants';

customInitApp();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const withLocations = searchParams.get('with_locations');

  const host = useHost();
  const isBR = process.env.NEXT_PUBLIC_LOCALE === 'pt-BR';

  let allHashtags = [];

  if (USE_CACHE) {
    allHashtags = theCachedHashtags;
  } else {
    const db = getFirestore();

    const firestoreCachedHashtagsRef = await db
      .collection('caches')
      .doc('static_pages')
      .collection('static_pages')
      .doc('hashtags')
      .get();
    const firestoreCachedHashtags = firestoreCachedHashtagsRef.data();

    allHashtags = firestoreCachedHashtags
      ? firestoreCachedHashtags.hashtags
      : [];

    if (!firestoreCachedHashtags || firestoreCachedHashtags.a_should_update) {
      const snapshot = await db.collection('hashtags').get();
      const hashtagDocs = [];

      snapshot.forEach((item) => {
        const data = item.data();
        hashtagDocs.push(data);
      });

      allHashtags = hashtagDocs.map((h) => ({
        name: h.name,
        name_pt: h.name_pt || null,
        is_location: h.is_location || false,
      }));

      await firestoreCachedHashtagsRef.ref.set({
        a_should_update: false,
        hashtags: allHashtags,
      });
    }
  }

  if (!withLocations || withLocations !== 'true') {
    allHashtags = allHashtags.filter((h) => !h.is_location);
  }

  const hashtags = allHashtags.map((h) =>
    isBR && h.name_pt ? h.name_pt : h.name
  );

  logAccess(host('/api/hashtags?with_locations=' + withLocations));

  return new Response(JSON.stringify(hashtags), {
    headers: { 'Content-Type': 'application/json' },
  });
}

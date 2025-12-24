import { getFirestore } from 'firebase-admin/firestore';
import { customInitApp } from '@/app/firebase';
import useHost from '@/app/hooks/use-host';
import logAccess from '@/app/utils/log-access';
import { theCachedHashtags } from '@/app/utils/cache-hashtags';
import { USE_CACHE } from '@/app/utils/constants';

customInitApp();

export async function GET() {
  const host = await useHost();
  const isBR = host().includes('viajarcomale.com.br');

  let theHashtags = [];

  if (USE_CACHE) {
    theHashtags = isBR
      ? theCachedHashtags.map((h) => h.name_pt || h.name)
      : theCachedHashtags.map((h) => h.name);
  } else {
    const db = getFirestore();

    const allHashtagsRef = await db
      .collection('caches')
      .doc('static_pages')
      .collection('static_pages')
      .doc('hashtags')
      .get();
    const allHashtags = allHashtagsRef.data();

    if (!allHashtags || allHashtags.a_should_update) {
      const snapshot = await db.collection('hashtags').get();
      const hashtagDocs = [];

      snapshot.forEach((item) => {
        const data = item.data();
        hashtagDocs.push(data);
      });

      const hashtags = hashtagDocs.map((h) => h.name).filter((h) => h);
      const hashtagsPt = hashtagDocs
        .map((h) => h.name_pt || h.name)
        .filter((h) => h);

      theHashtags = isBR ? hashtagsPt : hashtags;

      await allHashtagsRef.ref.set({
        a_should_update: false,
        hashtags_pt: hashtagsPt,
        hashtags,
      });
    }

    if (theHashtags.length === 0) {
      theHashtags = isBR ? allHashtags.hashtags_pt : allHashtags.hashtags;
    }
  }

  logAccess(host('/api/hashtags'));

  return new Response(JSON.stringify(theHashtags), {
    headers: { 'Content-Type': 'application/json' },
  });
}

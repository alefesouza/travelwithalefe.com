import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { customInitApp } from '@/app/firebase';
import useHost from '@/app/hooks/use-host';
import logAccess from '@/app/utils/log-access';

customInitApp();

export async function GET() {
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const db = getFirestore();
  const allHashtagsRef = await db
    .collection('caches')
    .doc('static_pages')
    .collection('static_pages')
    .doc('hashtags')
    .get();
  const allHashtags = allHashtagsRef.data();
  let theHashtags = [];

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

  logAccess(db, host('/api/hashtags'));

  return new Response(JSON.stringify(theHashtags), {
    headers: { 'Content-Type': 'application/json' },
  });
}

import { getFirestore } from 'firebase-admin/firestore';
import logAccess from '../utils/log-access';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '../utils/constants';
import Link from 'next/link';
import ShareButton from '../components/share-button';
import HashtagCloud from '../components/hashtag-cloud';
import shuffle from '../utils/array-shuffle';
import defaultMetadata from '../utils/default-metadata';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import AdSense from '../components/adsense';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const title = 'Hashtags - ' + SITE_NAME;
  const description = i18n(
    'Navigate through my website with main and random hashtags.'
  );

  return defaultMetadata(title, description);
}

export default async function MapPage() {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isAndroid =
    new UAParser(headers().get('user-agent')).getOS().name === 'Android';

  const cacheRef = '/caches/static_pages/static_pages/hashtags_page';

  const db = getFirestore();
  const cache = await db.doc(cacheRef).get();

  let hashtags = [];

  if (!cache.exists) {
    const hashtagsSnapshot = await db
      .collection('hashtags')
      .where('is_place', '==', false)
      .where('hide_on_cloud', '==', false)
      .limit(100)
      .orderBy('total', 'desc')
      .get();

    hashtagsSnapshot.forEach((photo) => {
      const data = photo.data();

      hashtags = [...hashtags, data];
    });

    db.doc(cacheRef).set({
      hashtags,
      last_update: new Date().toISOString().split('T')[0],
    });
  } else {
    hashtags = cache.data().hashtags;
  }

  const allHashtagsRef = await db
    .collection('caches')
    .doc('static_pages')
    .collection('static_pages')
    .doc('hashtags')
    .get();
  const allHashtagsData = allHashtagsRef.data();
  const allHashtags = isBR
    ? allHashtagsData.hashtags_pt
    : allHashtagsData.hashtags;

  logAccess(db, host('/hashtags'));

  return (
    <div>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/" id="back-button" scroll={false}>
            <img
              src={host('/images/back.svg')}
              alt={i18n('Back')}
              width="32px"
            ></img>
          </Link>

          <ShareButton />
        </div>
      </div>

      <div className="container">
        <div>
          <h2 style={{ marginBottom: 0 }}>Hashtags</h2>
          <div>{i18n('Click on a hashtag to see my content about it.')}</div>
        </div>

        <div>
          <h3>{i18n('Main Hashtags')}</h3>
          <HashtagCloud
            theHashtags={hashtags
              .filter((h) => !h.is_place)
              .map((h) => ({
                text: '#' + (isBR && h.name_pt ? h.name_pt : h.name),
                value: h.total,
              }))}
            isBR={isBR}
            isAndroid={isAndroid}
          />
        </div>

        <div>
          <h3>{i18n('Random Hashtags')}</h3>
          <HashtagCloud
            theHashtags={shuffle(allHashtags)
              .slice(0, 100)
              .map((c) => ({ text: '#' + c, value: 5 }))}
            isBR={isBR}
            shuffleText={i18n('Shuffle')}
            isRandom
            isAndroid={isAndroid}
          />
        </div>
      </div>

      {/* @ad */}
      <div className="ad">
        <AdSense index={1} />
      </div>
    </div>
  );
}

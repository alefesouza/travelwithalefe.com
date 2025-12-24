import { getFirestore } from 'firebase-admin/firestore';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import Link from 'next/link';
import ShareButton from '../components/share-button';
import HashtagCloud from '../components/hashtag-cloud';
import logAccess from '../utils/log-access';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME, USE_CACHE } from '../utils/constants';
import defaultMetadata from '../utils/default-metadata';
import { isBrazilianHost } from '../utils/locale-helpers';
import { fetchWithCache } from '../utils/cache-helpers';
import { fetchHashtags } from '../utils/hashtags-helpers';
import { shuffleArray } from '../utils/media-sorting';
import RandomPostButton from '../components/random-post-button';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const title = 'Hashtags - ' + i18n(SITE_NAME);
  const description = i18n(
    'Navigate through my website with main and random hashtags.'
  );

  return defaultMetadata(title, description);
}

export default async function MapPage() {
  const i18n = useI18n();
  const host = useHost();
  const isBR = isBrazilianHost(host());
  const isAndroid =
    new UAParser(headers().get('user-agent')).getOS().name === 'Android';

  const { hashtags, allHashtags } = await fetchHashtags(
    USE_CACHE,
    isBR,
    fetchWithCache
  );

  logAccess(host('/hashtags'));

  return (
    <div>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/" id="back-button" scroll={false} prefetch={false}>
            <img
              src={host('/images/back.svg')}
              alt={i18n('Back')}
              width="32px"
            />
          </Link>

          <RandomPostButton text={i18n('Random post')} />

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
            theHashtags={shuffleArray(allHashtags)
              .slice(0, 100)
              .map((c) => ({ text: '#' + c, value: 5 }))}
            isBR={isBR}
            shuffleText={i18n('Shuffle')}
            isRandom
            isAndroid={isAndroid}
          />
        </div>
      </div>
    </div>
  );
}

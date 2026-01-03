import { getFirestore } from 'firebase-admin/firestore';
import Link from 'next/link';
import ShareButton from '../components/share-button';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '../utils/constants';
import defaultMetadata from '../utils/default-metadata';
import logAccess from '../utils/log-access';
import { getLocalizedText } from '../utils/locale-helpers';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const title = i18n('About') + ' - ' + i18n(SITE_NAME);
  const description = i18n('About Travel with Alefe website.');

  return defaultMetadata(title, description);
}

export default async function About() {
  const i18n = useI18n();
  const host = useHost();

  const db = getFirestore();
  const aboutRef = await db.doc('/pages/about').get();
  const aboutData = aboutRef.data();

  logAccess(host('/about'));

  return (
    <>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/" id="back-button" scroll={false} prefetch={false}>
            <img
              src={host('/images/back.svg')}
              alt={i18n('Back')}
              width="32px"
            />
          </Link>

          <ShareButton />
        </div>
      </div>
      <div
        className="page"
        dangerouslySetInnerHTML={{
          __html: getLocalizedText(host(), aboutData.text, aboutData.text_pt),
        }}
      />
    </>
  );
}

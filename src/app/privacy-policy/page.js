import { getFirestore } from 'firebase-admin/firestore';
import Link from 'next/link';
import ShareButton from '../components/share-button';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '../utils/constants';
import defaultMetadata from '../utils/default-metadata';
import logAccess from '../utils/log-access';
import { getLocalizedText } from '../utils/locale-helpers';
import RandomPostButton from '../components/random-post-button';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = await useI18n();

  const title = i18n('Privacy Policy') + ' - ' + i18n(SITE_NAME);
  const description = i18n("Travel with Alefe's website privacy policy.");

  return defaultMetadata(title, description);
}

export default async function PrivacyPolicy() {
  const i18n = await useI18n();
  const host = await useHost();

  const db = getFirestore();
  const privacyPolicy = await db.doc('/pages/privacy-policy').get();
  const privacyPolicyData = privacyPolicy.data();

  logAccess(host('/privacy-policy'));

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

          <RandomPostButton text={i18n('Random post')} />

          <ShareButton />
        </div>
      </div>
      <div
        className="page"
        dangerouslySetInnerHTML={{
          __html: getLocalizedText(
            host(),
            privacyPolicyData.text,
            privacyPolicyData.text_pt
          ),
        }}
      />
    </>
  );
}

import { getFirestore } from 'firebase-admin/firestore';
import Link from 'next/link';
import ShareButton from '../components/share-button';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '../utils/constants';
import defaultMetadata from '../utils/default-metadata';
import logAccess from '../utils/log-access';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const title = i18n('Privacy Policy') + ' - ' + i18n(SITE_NAME);
  const description = i18n("Travel with Alefe's website privacy policy.");

  return defaultMetadata(title, description);
}

export default async function PrivacyPolicy() {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const db = getFirestore();
  const privacyPolicy = await db.doc('/pages/privacy-policy').get();
  const privacyPolicyData = privacyPolicy.data();

  logAccess(db, host('/privacy-policy'));

  return (
    <>
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
      <div
        className="page"
        dangerouslySetInnerHTML={{
          __html:
            isBR && privacyPolicyData.text_pt
              ? privacyPolicyData.text_pt
              : privacyPolicyData.text,
        }}
      ></div>
    </>
  );
}

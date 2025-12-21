import { getFirestore } from 'firebase-admin/firestore';
import Link from 'next/link';
import ShareButton from '@/app/components/share-button';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME, USE_CACHE } from '@/app/utils/constants';
import defaultMetadata from '@/app/utils/default-metadata';
import logAccess from '@/app/utils/log-access';
import styles from '../page.module.css';
import Editable from '@/app/components/editable/editable';
import useEditMode from '@/app/utils/use-edit-mode';
import { theCachedCoupons } from '@/app/utils/cache-coupons';
import { cachedCoupons } from '@/app/utils/cache-data';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params: { coupon } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  let couponData = null;

  if (USE_CACHE) {
    couponData = theCachedCoupons.find((c) => c.slug === coupon);

    if (!couponData) {
      return notFound();
    }
  } else {
    if (!cachedCoupons.includes(coupon)) {
      return notFound();
    }

    const db = getFirestore();
    const couponRef = await db.collection('coupons').doc(coupon).get();

    if (!couponRef.exists) {
      return notFound();
    }

    couponData = couponRef.data();
  }

  const title =
    (isBR && couponData.title_pt ? couponData.title_pt : couponData.title) +
    ' - ' +
    i18n('Coupons') +
    ' - ' +
    i18n(SITE_NAME);
  const description =
    isBR && couponData.description_pt
      ? couponData.description_pt
      : couponData.description;

  return defaultMetadata(title, description);
}

export default async function Coupons({ params: { coupon }, searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const editMode = useEditMode(searchParams);

  const db = getFirestore();
  let couponData = null;

  if (USE_CACHE) {
    couponData = theCachedCoupons.find((c) => c.slug === coupon);

    if (!couponData) {
      return notFound();
    }
  } else {
    const couponRef = await db.collection('coupons').doc(coupon).get();

    if (!couponRef.exists) {
      return notFound();
    }

    couponData = couponRef.data();
  }

  logAccess(host('/coupons/' + coupon));

  return (
    <>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/coupons" id="back-button" scroll={false}>
            <img
              src={host('/images/back.svg')}
              alt={i18n('Back')}
              width="32px"
            ></img>
          </Link>

          <ShareButton />
        </div>
      </div>
      <div className="page container">
        <h2>
          {isBR && couponData.title_pt ? couponData.title_pt : couponData.title}
        </h2>

        {editMode.editMode && (
          <Editable
            item={JSON.stringify(couponData, null, 2)}
            path={couponData.path}
            {...editMode}
          />
        )}

        <div className={'instagram_media_gallery_item ' + styles.coupon}>
          <div className={styles.coupon_body}>
            <div className={styles.coupon_body_padding}>
              {isBR && couponData.description_pt
                ? couponData.description_pt
                : couponData.description}
            </div>
            <div style={{ textAlign: 'center' }}>
              {couponData.link && (
                <a
                  className="btn"
                  href={couponData.link}
                  style={{
                    margin: '20px 0',
                    marginBottom: couponData.code ? 0 : 20,
                  }}
                  target="_blank"
                >
                  {i18n('Click here to open the referral link')}
                </a>
              )}
              {couponData.code && (
                <div className={styles.coupon_code}>
                  {i18n('Code')}: <h4>{couponData.code}</h4>
                  <button
                    className="btn"
                    data-copy={couponData.code}
                    style={{ padding: '2px 8px' }}
                  >
                    {i18n('Copy')}
                  </button>
                </div>
              )}
            </div>
            {couponData.how_i_use && (
              <div className={styles.coupon_body_padding}>
                <b>{i18n('How I Use')}:</b>{' '}
                {!isBR && couponData.isBR && '(Brazil only) '}
                {isBR && couponData.how_i_use_pt
                  ? couponData.how_i_use_pt
                  : couponData.how_i_use}
                {couponData.regulation && (
                  <div style={{ marginTop: 14, textAlign: 'center' }}>
                    <a href={couponData.regulation} target="_blank">
                      {i18n('Regulation')}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

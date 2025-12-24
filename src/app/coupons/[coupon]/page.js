import { getFirestore } from 'firebase-admin/firestore';
import { notFound } from 'next/navigation';
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
import { getLocalizedText, isBrazilianHost } from '@/app/utils/locale-helpers';
import RandomPostButton from '@/app/components/random-post-button';

/**
 * @typedef {import('@/typings/coupon').Coupon} Coupon
 */

/**
 * Fetch coupon data from cache or Firestore
 * @param {string} couponSlug - Coupon slug
 * @returns {Promise<Coupon>}
 */
async function fetchCoupon(couponSlug) {
  if (USE_CACHE) {
    const couponData = theCachedCoupons.find((c) => c.slug === couponSlug);
    if (!couponData) return notFound();
    return couponData;
  }

  if (!cachedCoupons.includes(couponSlug)) {
    return notFound();
  }

  const db = getFirestore();
  const couponRef = await db.collection('coupons').doc(couponSlug).get();

  if (!couponRef.exists) {
    return notFound();
  }

  return couponRef.data();
}

export async function generateMetadata({ params: paramsPromise }) {
  const { coupon } = await paramsPromise;

  const i18n = useI18n();
  const host = await useHost();

  const couponData = await fetchCoupon(coupon);

  const title =
    getLocalizedText(host(), couponData.title, couponData.title_pt) +
    ' - ' +
    i18n('Coupons') +
    ' - ' +
    i18n(SITE_NAME);
  const description = getLocalizedText(
    host(),
    couponData.description,
    couponData.description_pt
  );

  return defaultMetadata(title, description);
}

export default async function Coupons({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}) {
  const { coupon } = await paramsPromise;
  const searchParams = await searchParamsPromise;

  const i18n = useI18n();
  const host = await useHost();
  const isBR = isBrazilianHost(host());
  const editMode = await useEditMode(searchParams);

  const couponData = await fetchCoupon(coupon);

  logAccess(host('/coupons/' + coupon));

  return (
    <>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link
            href="/coupons"
            id="back-button"
            scroll={false}
            prefetch={false}
          >
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
      <div className="page container">
        <h2>
          {getLocalizedText(host(), couponData.title, couponData.title_pt)}
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
              {getLocalizedText(
                host(),
                couponData.description,
                couponData.description_pt
              )}
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
                {getLocalizedText(
                  host(),
                  couponData.how_i_use,
                  couponData.how_i_use_pt
                )}
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

import { getFirestore } from 'firebase-admin/firestore';
import Link from 'next/link';
import ShareButton from '@/app/components/share-button';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '@/app/utils/constants';
import defaultMetadata from '@/app/utils/default-metadata';
import logAccess from '@/app/utils/log-access';
import styles from './page.module.css';
import { redirect } from 'next/navigation';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const title = i18n('Coupons') + ' - ' + SITE_NAME;
  const description = i18n(
    'Use Viajar com Alê to get discounts on products and services.'
  );

  return defaultMetadata(title, description);
}

export default async function Coupons() {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const cacheRef = '/caches/static_pages/static_pages/coupons';

  const db = getFirestore();
  const cache = await db.doc(cacheRef).get();

  const couponsPageRef = await db.doc('/pages/coupons').get();
  const couponsPageData = couponsPageRef.data();

  let coupons = [];

  if (!cache.exists) {
    const couponsSnapshot = await db
      .collection('coupons')
      .orderBy('order', 'desc')
      .get();
    couponsSnapshot.forEach((doc) => {
      const data = doc.data();
      coupons.push(data);
    });

    db.doc(cacheRef).set({
      coupons,
      last_update: new Date().toISOString().split('T')[0],
    });
  } else {
    coupons = cache.data().coupons;
  }

  logAccess(db, host('/coupons'));

  if (!isBR) {
    coupons.sort((a, b) => {
      return a.isBR === b.isBR ? 0 : b.isBR ? -1 : 1;
    });
  }

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
            isBR && couponsPageData.text_pt
              ? couponsPageData.text_pt
              : couponsPageData.text,
        }}
      />
      <div className="container">
        <div className="instagram_highlights_items">
          {coupons.map((item) => (
            <div
              className={'instagram_media_gallery_item ' + styles.coupon}
              key={item.slug}
            >
              <div className={styles.coupon_header}>
                <h3>
                  <Link href={host('/coupons/' + item.slug)} prefetch={false}>
                    {item.name}
                  </Link>
                </h3>
                <ShareButton
                  text={isBR ? item.description_pt : item.description}
                  url={host('/coupons/' + item.slug)}
                />
              </div>
              <div className={styles.coupon_body}>
                <div>
                  {isBR && item.description_pt
                    ? item.description_pt
                    : item.description}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {item.code && (
                    <div className={styles.coupon_code}>
                      {i18n('Code')}: <h4>{item.code}</h4>
                    </div>
                  )}
                  {item.link && (
                    <a
                      className="btn"
                      href={item.link}
                      style={{ margin: '20px 0' }}
                    >
                      {i18n('Click here')}
                    </a>
                  )}
                </div>
                {item.how_i_use && (
                  <>
                    <b>{i18n('How I Use')}:</b>{' '}
                    {isBR && item.how_i_use_pt
                      ? item.how_i_use_pt
                      : item.how_i_use}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

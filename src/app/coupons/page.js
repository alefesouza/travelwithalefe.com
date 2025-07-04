import { getFirestore } from 'firebase-admin/firestore';
import Link from 'next/link';
import ShareButton from '@/app/components/share-button';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from '@/app/utils/constants';
import defaultMetadata from '@/app/utils/default-metadata';
import logAccess from '@/app/utils/log-access';
import styles from './page.module.css';
// @ad
import AdSense from '../components/adsense';
import Editable from '../components/editable/editable';
import useEditMode from '../utils/use-edit-mode';

const Coupon = ({ item, editMode }) => {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  return (
    <div className={'instagram_media_gallery_item ' + styles.coupon}>
      <div className={styles.coupon_header}>
        <h3>
          <Link
            href={host('/coupons/' + item.slug)}
            prefetch={false}
            style={{ color: '#000000' }}
          >
            {item.name}
          </Link>
        </h3>
        <ShareButton
          text={isBR ? item.description_pt : item.description}
          url={host('/coupons/' + item.slug)}
        />
      </div>
      <div className={styles.coupon_body}>
        <div className={styles.coupon_body_padding}>
          {isBR && item.description_pt ? item.description_pt : item.description}
        </div>
        <div style={{ textAlign: 'center' }}>
          {item.link && (
            <a
              className="btn"
              href={item.link}
              style={{
                margin: '20px 0',
                marginBottom: item.code ? 0 : 20,
              }}
              target="_blank"
            >
              {i18n('Click here to open the referral link')}
            </a>
          )}
          {item.code && (
            <div className={styles.coupon_code}>
              {i18n('Code')}: <h4>{item.code}</h4>
              <button
                className="btn"
                data-copy={item.code}
                style={{ padding: '2px 8px' }}
              >
                {i18n('Copy')}
              </button>
            </div>
          )}
        </div>
        {item.how_i_use && (
          <div className={styles.coupon_body_padding}>
            <b>{i18n('How I Use')}:</b> {!isBR && item.isBR && '(Brazil only) '}
            {isBR && item.how_i_use_pt ? item.how_i_use_pt : item.how_i_use}
            {item.regulation && (
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <a href={item.regulation} target="_blank">
                  {i18n('Regulation')}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {editMode.editMode && (
        <Editable
          item={JSON.stringify(item, null, 2)}
          path={item.path}
          {...editMode}
        />
      )}
    </div>
  );
};

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const db = getFirestore();

  const couponsPageRef = await db.doc('/pages/coupons').get();
  const couponsPageData = couponsPageRef.data();

  const title = i18n('Coupons') + ' - ' + i18n(SITE_NAME);
  const description = isBR
    ? couponsPageData.description_pt
    : couponsPageData.description;

  return defaultMetadata(title, description);
}

export default async function Coupons({ searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const editMode = useEditMode(searchParams);

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
      data.id = data.slug;
      coupons.push(data);
    });

    db.doc(cacheRef).set({
      coupons,
      last_update: new Date().toISOString().split('T')[0],
      user_agent: headers().get('user-agent'),
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
        dangerouslySetInnerHTML={{
          __html:
            isBR && couponsPageData.text_pt
              ? couponsPageData.text_pt
              : couponsPageData.text,
        }}
      />
      <div className="container">
        <div style={{ marginBottom: 20 }}>
          <b>{i18n('Quick Access')}</b>:{' '}
          {coupons.map((c, i) => (
            <span key={c.slug}>
              <Link href={host('/coupons/' + c.slug)}>{c.name}</Link>
              {i < coupons.length - 1 && ', '}
            </span>
          ))}
        </div>
        <div className="instagram_highlights_items">
          {coupons.slice(0, 8).map((item) => (
            <Coupon item={item} key={item.slug} editMode={editMode} />
          ))}
        </div>
      </div>

      <div className="container-fluid ad">
        <AdSense index={0} />
      </div>

      <div className="container">
        <div className="instagram_highlights_items">
          {coupons.slice(8).map((item) => (
            <Coupon item={item} key={item.slug} editMode={editMode} />
          ))}
        </div>
      </div>

      {/* @ad */}
      <div className="ad">
        <AdSense index={1} />
      </div>
    </>
  );
}

import { getFirestore } from 'firebase-admin/firestore';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShareButton from '@/app/components/share-button';
import CouponCard from '@/app/components/coupon';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME, USE_CACHE } from '@/app/utils/constants';
import defaultMetadata from '@/app/utils/default-metadata';
import logAccess from '@/app/utils/log-access';
import useEditMode from '../utils/use-edit-mode';
import { theCachedCoupons } from '../utils/cache-coupons';
import { getLocalizedText, isBrazilianHost } from '../utils/locale-helpers';
import styles from './page.module.css';

/**
 * @typedef {import('@/typings/coupon').Coupon} Coupon
 */

/**
 * Fetch coupons from Firestore
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @returns {Promise<{coupons: Coupon[]}>}
 */
async function fetchCouponsFromFirestore(db) {
  const coupons = [];
  const couponsSnapshot = await db
    .collection('coupons')
    .orderBy('order', 'desc')
    .get();

  couponsSnapshot.forEach((doc) => {
    const data = doc.data();
    data.id = data.slug;
    coupons.push(data);
  });

  return { coupons };
}

/**
 * Sort coupons for non-BR hosts (BR-only coupons last)
 * @param {Coupon[]} coupons - Array of coupons
 * @param {boolean} isBR - Whether current host is BR
 * @returns {Coupon[]}
 */
function sortCouponsByRegion(coupons, isBR) {
  if (isBR) return coupons;

  return [...coupons].sort((a, b) => {
    return a.isBR === b.isBR ? 0 : b.isBR ? -1 : 1;
  });
}

let couponsPageData = {
  description_pt:
    'Nessa página você pode encontrar os meus cupons de desconto e links de indicação para os serviços que eu uso nas minhas viagens e no meu dia a dia.',
  description:
    'On this page you can find my discount coupons and referral links for the services I use in my travels and in my daily life.',
};

export async function generateMetadata() {
  const i18n = useI18n();
  const host = useHost();

  if (!USE_CACHE) {
    const db = getFirestore();
    const couponsPageRef = await db.doc('/pages/coupons').get();
    couponsPageData = couponsPageRef.data();
  }

  if (!couponsPageData) {
    return notFound();
  }

  const title = i18n('Coupons') + ' - ' + i18n(SITE_NAME);
  const description = getLocalizedText(
    host(),
    couponsPageData.description,
    couponsPageData.description_pt
  );

  return defaultMetadata(title, description, 'coupons');
}

export default async function Coupons({ searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = isBrazilianHost(host());
  const editMode = await useEditMode(searchParams);

  let coupons = [];

  if (USE_CACHE) {
    coupons = theCachedCoupons;
  } else {
    const db = getFirestore();
    const couponsPageRef = await db.doc('/pages/coupons').get();
    couponsPageData = couponsPageRef.data();

    const cacheData = await fetchCouponsFromFirestore(db);
    coupons = cacheData.coupons;
  }

  logAccess(host('/coupons'));

  coupons = sortCouponsByRegion(coupons, isBR);

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
      <div className="container">
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ marginBottom: 0 }}>{i18n('Discount Coupons')}</h2>
          <div>
            {getLocalizedText(
              host(),
              couponsPageData.description,
              couponsPageData.description_pt
            )}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <b>{i18n('Quick Access')}</b>:{' '}
          {coupons.map((c, i) => (
            <span key={c.slug}>
              <Link href={host('/coupons/' + c.slug)} prefetch={false}>
                {c.name}
              </Link>
              {i < coupons.length - 1 && ', '}
            </span>
          ))}
        </div>
        <div className={styles.coupons_grid}>
          {coupons.map((item) => (
            <CouponCard item={item} key={item.slug} editMode={editMode} />
          ))}
        </div>
      </div>
    </>
  );
}

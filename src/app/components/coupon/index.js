import Link from 'next/link';
import ShareButton from '@/app/components/share-button';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import Editable from '@/app/components/editable/editable';
import styles from '../../coupons/page.module.css';

/**
 * @typedef {import('@/typings/coupon').Coupon} Coupon
 * @typedef {import('@/typings/components').EditModeProps} EditModeProps
 */

/**
 * Coupon card component
 * @param {Object} props
 * @param {Coupon} props.item - Coupon data
 * @param {EditModeProps} props.editMode - Edit mode configuration
 * @returns {JSX.Element}
 */
export default async function CouponCard({ item, editMode }) {
  const i18n = await useI18n();
  const host = await useHost();
  const isBR = process.env.NEXT_PUBLIC_LOCALE === 'pt-BR';

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
}

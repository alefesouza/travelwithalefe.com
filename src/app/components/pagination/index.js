import useI18n from '@/app/hooks/use-i18n';
import styles from './index.module.css';
import { ITEMS_PER_PAGE } from '@/app/utils/constants';
import BasePagination from './base-pagination';

export default function Pagination({
  base,
  currentPage,
  pageNumber,
  total,
  textPosition,
  isGallery,
  label,
}) {
  const i18n = useI18n();

  const pageTotal = currentPage * ITEMS_PER_PAGE + 1;
  const totalText = (
    <div
      style={{
        marginTop: textPosition === 'bottom' ? 14 : 0,
        marginBottom: textPosition === 'top' ? 14 : 0,
      }}
    >
      {i18n('Showing')} {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
      {pageTotal < total ? pageTotal : total} {i18n('of')} {total}{' '}
      {label ? label : 'posts'}
    </div>
  );

  return (
    <div className={styles.pagination}>
      {!isGallery && textPosition === 'top' && totalText}

      <div className={styles.mobile_pagination}>
        <BasePagination
          pageNumber={pageNumber}
          currentPage={currentPage}
          base={base}
          isGallery={isGallery}
          maxPages={5}
        />
      </div>

      <div className={styles.desktop_pagination}>
        <BasePagination
          pageNumber={pageNumber}
          currentPage={currentPage}
          base={base}
          isGallery={isGallery}
          maxPages={10}
          withLabel
        />
      </div>

      {!isGallery && textPosition === 'bottom' && totalText}
    </div>
  );
}

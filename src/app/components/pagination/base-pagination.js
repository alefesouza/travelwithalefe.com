import Link from 'next/link';
import styles from './index.module.css';
import useI18n from '@/app/hooks/use-i18n';

export default async function BasePagination({
  pageNumber,
  currentPage,
  base,
  isGallery,
  maxPages,
  withLabel,
}) {
  const i18n = useI18n();

  let pages = Array.from({ length: pageNumber }, (_, i) => i + 1);

  let mobilePages = [];

  if (pageNumber <= maxPages) {
    mobilePages = pages;
  } else {
    if (currentPage === pageNumber) {
      mobilePages.push(currentPage - 2);
    }

    if (currentPage !== 1) {
      mobilePages.push(currentPage - 1);
    }

    mobilePages.push(currentPage);

    if (currentPage !== pageNumber) {
      mobilePages.push(currentPage + 1);
    }

    if (currentPage === 1) {
      mobilePages.push(currentPage + 2);
    }
  }

  return (
    <>
      <Link
        href={
          currentPage == 2 && !isGallery
            ? base.replace('/page/{page}', '')
            : base.replace('{page}', currentPage - 1)
        }
        className={currentPage == 1 ? styles.pagination_disabled : null}
        prefetch={false}
      >
        {withLabel ? i18n('Previous') : '<'}
      </Link>
      {currentPage > 2 && pageNumber > maxPages && (
        <>
          <Link
            href={base.replace('/page/{page}', '')}
            className={styles.page_number}
            prefetch={false}
          >
            1
          </Link>
          <a href="#" className={styles.skip} prefetch={false}>
            …
          </a>
        </>
      )}
      {mobilePages.length > 1 &&
        mobilePages.map((p) => (
          <Link
            key={p}
            href={
              p == 1 && !isGallery
                ? base.replace('/page/{page}', '')
                : base.replace('{page}', p)
            }
            className={
              styles.page_number +
              (p == currentPage ? ' ' + styles.page_number_active : '')
            }
            prefetch={false}
          >
            {p}
          </Link>
        ))}
      {currentPage < pageNumber - 2 && pageNumber > maxPages && (
        <a href="#" className={styles.skip}>
          …
        </a>
      )}
      {currentPage < pageNumber - 1 && pageNumber > maxPages && (
        <Link
          href={base.replace('{page}', pageNumber)}
          className={styles.page_number}
          prefetch={false}
        >
          {pageNumber}
        </Link>
      )}
      <Link
        href={base.replace('{page}', currentPage + 1)}
        className={
          currentPage == pageNumber ? styles.pagination_disabled : null
        }
        prefetch={false}
      >
        {withLabel ? i18n('Next') : '>'}
      </Link>
    </>
  );
}

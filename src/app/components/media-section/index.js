import Link from 'next/link';
import Pagination from '../pagination';
import Media from '../media';

/**
 * @param {import('@/typings/components').MediaSectionProps} props
 */
export default function MediaSection({
  title,
  medias,
  isBR,
  expandGalleries,
  editMode,
  isRandom,
  page,
  paginationBase,
  pageNumber,
  total,
  i18n,
  country,
  city,
  sort,
  newShuffle,
  useCache,
  label = null,
  showExpandLink = true,
}) {
  if (medias.length === 0) return null;

  const getExpandLink = () => {
    return (
      `/countries/${country}${city ? '/cities/' + city : ''}${
        page ? '/page/' + page : ''
      }${!expandGalleries ? '/expand' : ''}` +
      (sort !== 'desc' ? '?sort=' + sort : '')
    );
  };

  return (
    <div className="container-fluid">
      <div className="instagram_photos">
        <div className="instagram_photos_title">
          <h3>{title}</h3>
        </div>

        {!isRandom && pageNumber > 1 && (
          <Pagination
            base={paginationBase}
            currentPage={Number(page) || 1}
            pageNumber={pageNumber}
            total={total}
            textPosition="bottom"
            label={label}
          />
        )}

        {showExpandLink && sort !== 'random' && (
          <div className="center_link">
            <Link href={getExpandLink()} scroll={false} prefetch={false}>
              {expandGalleries
                ? i18n('Minimize Galleries')
                : i18n('Expand Galleries')}
            </Link>
          </div>
        )}

        <div className="instagram_highlights_items">
          {medias.map((media) => (
            <Media
              key={media.id}
              media={media}
              isBR={isBR}
              expandGalleries={expandGalleries}
              isListing
              editMode={editMode}
            />
          ))}
        </div>

        {!useCache && isRandom && (
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <Link
              href={`?sort=random${useCache ? '' : '&shuffle=' + newShuffle}`}
              scroll={false}
              prefetch={false}
              className="shuffle"
            >
              <button className="btn btn-primary">{i18n('Shuffle')}</button>
            </Link>
          </div>
        )}

        {!isRandom && pageNumber > 1 && (
          <div style={{ marginTop: 30 }}>
            <Pagination
              base={paginationBase}
              currentPage={Number(page) || 1}
              pageNumber={pageNumber}
              total={total}
              textPosition="top"
              label={label}
            />
          </div>
        )}
      </div>
    </div>
  );
}

import useI18n from '../../hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import {
  SITE_NAME,
  USE_CACHE,
  WEBSTORIES_ITEMS_PER_PAGE,
} from '@/app/utils/constants';
import Scroller from '@/app/components/scroller';
import { notFound, permanentRedirect } from 'next/navigation';
import Media from '@/app/components/media';
import ShareButton from '@/app/components/share-button';
import randomIntFromInterval from '@/app/utils/random-int';
import WebStories from '@/app/components/webstories';
import removeDiacritics from '@/app/utils/remove-diacritics';
import logAccess from '@/app/utils/log-access';
import getSort from '@/app/utils/get-sort';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import defaultMetadata from '@/app/utils/default-metadata';
import { headers } from 'next/headers';
import getItemsPagination from '@/app/utils/get-items-pagination';
import expandPosts from '@/app/utils/expand-posts';
import SortPicker from '@/app/components/sort-picker';
import Pagination from '@/app/components/pagination';
import useEditMode from '@/app/utils/use-edit-mode';
import Editable from '@/app/components/editable/editable';
import { RSS_HASHTAGS } from '@/app/utils/rss-hashtags';
import { cachedHashtags } from '@/app/utils/cache-data';
import { theCachedHashtags } from '../../utils/cache-hashtags';
import { cachedMedias } from '../../utils/cache-medias';
import {
  getHashtagDataFromRoute,
  getHashtagBreadcrumbs,
} from '@/app/utils/hashtag-helpers';
import {
  findHashtag,
  findAlternateHashtag,
  fetchHashtagCover,
  fetchHashtagMedia,
} from '@/app/utils/hashtag-page-helpers';
import {
  sortByDateDesc,
  sortByDateAsc,
  sortMediaArrays,
  shuffleArray,
} from '@/app/utils/media-sorting';
import { expandMediaGalleries, paginateMedia } from '@/app/utils/media-helpers';

export async function generateMetadata({
  params: { theHashtag },
  searchParams,
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  let { hashtag, page, expandGalleries, isWebStories } =
    getHashtagDataFromRoute(theHashtag, searchParams);

  if (USE_CACHE) {
    if (
      !theCachedHashtags.find(
        (h) => h.name === hashtag || h.name_pt === hashtag
      )
    ) {
      return notFound();
    }
  } else {
    if (!cachedHashtags.includes(hashtag)) {
      return notFound();
    }
  }

  // if (
  //   theHashtag.length > 2 ||
  //   (theHashtag[1] &&
  //     theHashtag[1] !== 'expand' &&
  //     theHashtag[1] !== 'webstories')
  // ) {
  //   redirect(`/hashtags/${hashtag}`);
  // }

  const title = [
    '#' + hashtag,
    page > 1 ? i18n('Page') + ' ' + page : null,
    'Hashtags',
    isWebStories ? 'Web Stories' : '',
    i18n(SITE_NAME),
  ]
    .filter((c) => c)
    .join(' - ');
  const description = i18n(
    'Photos and videos taken by Travel with Alefe with the hashtag #:hashtag:.',
    {
      hashtag,
    }
  );

  const { hashtagPt, hashtagEn } = await findHashtag(USE_CACHE, hashtag);

  if (!hashtagPt && !hashtagEn) {
    const hashtagAlternate = await findAlternateHashtag(USE_CACHE, hashtag);

    if (hashtagAlternate) {
      permanentRedirect(
        (headers().get('x-pathname').includes('/webstories')
          ? '/webstories'
          : '') +
          '/hashtags/' +
          (isBR && hashtagAlternate.name_pt
            ? hashtagAlternate.name_pt
            : hashtagAlternate.name)
      );
    } else {
      return notFound();
    }
  }

  const finalHashtag = hashtagPt || hashtagEn;

  if (finalHashtag.is_country && finalHashtag?.metadata?.country_slug) {
    permanentRedirect('/countries/' + finalHashtag.metadata.country_slug);
  }

  if (finalHashtag.is_city && finalHashtag?.metadata?.city_slug) {
    const hasWebStories = headers().get('x-pathname').includes('/webstories');

    permanentRedirect(
      (hasWebStories ? '/webstories' : '') +
        '/countries/' +
        finalHashtag.metadata.country_slug +
        '/cities/' +
        finalHashtag.metadata.city_slug +
        (hasWebStories ? '/stories' : '')
    );
  }

  const sort = getSort(searchParams, false, false);
  const cover = await fetchHashtagCover(
    USE_CACHE,
    finalHashtag.name,
    sort,
    isWebStories
  );

  if (!cover) {
    return notFound();
  }

  const defaultMeta = defaultMetadata(title, description, cover);

  const enUrl =
    'https://travelwithalefe.com' +
    (isWebStories ? '/webstories' : '') +
    '/hashtags/' +
    finalHashtag.name +
    (expandGalleries ? '/expand' : '');
  const ptUrl =
    'https://viajarcomale.com.br' +
    (isWebStories ? '/webstories' : '') +
    '/hashtags/' +
    (finalHashtag.name_pt ? finalHashtag.name_pt : finalHashtag.name) +
    (expandGalleries ? '/expand' : '');

  const maxPages = Math.ceil(finalHashtag.total / WEBSTORIES_ITEMS_PER_PAGE);

  return {
    ...defaultMeta,
    openGraph: {
      ...defaultMeta.openGraph,
      url: isBR ? ptUrl : enUrl,
    },
    alternates: {
      canonical: isBR ? ptUrl : enUrl,
      languages: {
        'x-default': enUrl,
        en: enUrl,
        pt: ptUrl,
      },
      types: {
        'application/rss+xml': RSS_HASHTAGS.includes(hashtag)
          ? host('/rss/hashtags/' + hashtag)
          : null,
      },
    },
    ...(!isWebStories && page <= maxPages
      ? {
          icons: {
            // Why Next.js doesn't just allow us to create custom <link> tags directly...
            other: {
              rel: 'amphtml',
              url:
                host('/webstories/hashtags/' + hashtag) +
                (page > 1 ? '/page/' + page : ''),
            },
          },
        }
      : null),
  };
}

export default async function Country({
  params: { theHashtag },
  searchParams,
}) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const editMode = useEditMode(searchParams);

  let { hashtag, page, expandGalleries, isWebStories, sort } =
    getHashtagDataFromRoute(theHashtag, searchParams);

  if (USE_CACHE) {
    if (
      !theCachedHashtags.find(
        (h) => h.name === hashtag || h.name_pt === hashtag
      )
    ) {
      return notFound();
    }
  } else {
    if (!cachedHashtags.includes(hashtag)) {
      return notFound();
    }
  }

  const { hashtagPt, hashtagEn } = await findHashtag(USE_CACHE, hashtag);

  const finalHashtag = hashtagPt || hashtagEn;

  if (!finalHashtag) {
    return notFound();
  }

  hashtag = finalHashtag.name;

  let isRandom = sort === 'random';

  if (isRandom) {
    sort = 'desc';
  }

  let photos = await fetchHashtagMedia(
    USE_CACHE,
    hashtag,
    sort,
    isRandom,
    isWebStories,
    editMode
  );

  if (!photos.length) {
    const hashtagAlternate = await findAlternateHashtag(USE_CACHE, hashtag);

    if (hashtagAlternate) {
      permanentRedirect(
        '/hashtags/' +
          (isBR && hashtagAlternate.name_pt
            ? hashtagAlternate.name_pt
            : hashtagAlternate.name)
      );
    } else {
      return notFound();
    }
  }

  if (isRandom) {
    photos = shuffleArray(photos);

    sort = 'random';
  }

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  let {
    total: postsTotal,
    pageNumber: postsPageNumber,
    items: instagramPhotos,
  } = getItemsPagination(photos, 'post', page, isWebStories);
  const {
    total: storiesTotal,
    pageNumber: storiesPageNumber,
    items: instagramStories,
  } = getItemsPagination(photos, 'story', page, isWebStories);
  const {
    total: shortsTotal,
    pageNumber: shortsPageNumber,
    items: shortVideos,
  } = getItemsPagination(photos, 'short-video', page, isWebStories);
  const {
    total: videosTotal,
    pageNumber: videosPageNumber,
    items: youtubeVideos,
  } = getItemsPagination(photos, 'youtube', page, isWebStories);
  const {
    total: _360photosTotal,
    pageNumber: _360photosPageNumber,
    items: _360photos,
  } = getItemsPagination(photos, '360photo', page, isWebStories);
  let {
    total: mapsTotal,
    pageNumber: mapsPageNumber,
    items: mapsPhotos,
  } = getItemsPagination(photos, 'maps', page, isWebStories);

  instagramPhotos = expandPosts(
    instagramPhotos,
    expandGalleries,
    isWebStories,
    finalHashtag.name
  );

  let allItems = [
    ...instagramStories,
    ...instagramPhotos,
    ..._360photos,
    ...youtubeVideos,
    ...shortVideos,
    ...mapsPhotos,
  ];

  if (allItems.length === 0) {
    return notFound();
  }

  if (isWebStories) {
    const maxPages = Math.max(
      instagramStories.length,
      instagramPhotos.length,
      _360photos.length,
      youtubeVideos.length,
      shortVideos.length,
      mapsPhotos.length
    );

    const items = allItems.slice(
      (page - 1) * WEBSTORIES_ITEMS_PER_PAGE,
      page * WEBSTORIES_ITEMS_PER_PAGE
    );

    const previousPageItem = allItems[(page - 2) * WEBSTORIES_ITEMS_PER_PAGE];
    const nextPageItem = allItems[page * WEBSTORIES_ITEMS_PER_PAGE];

    return (
      <WebStories
        title={`#${hashtagPt ? hashtagPt.name_pt : hashtag}`}
        storyTitle={`#${hashtagPt ? hashtagPt.name_pt : hashtag}`}
        items={items}
        hashtag={hashtagPt ? hashtagPt.name_pt : hashtag}
        previousPageItem={previousPageItem}
        nextPageItem={nextPageItem}
        page={page}
        maxPages={maxPages}
        path={`/webstories/hashtags/${hashtagPt ? hashtagPt.name_pt : hashtag}`}
      />
    );
  }

  logAccess(
    host('/hashtags/') +
      hashtag +
      (expandGalleries ? '/expand' : '') +
      ('?sort=' + sort)
  );

  const currentHashtag = decodeURIComponent(
    hashtagPt ? hashtagPt.name_pt : hashtag
  );

  const maxPages = Math.ceil(finalHashtag.total / WEBSTORIES_ITEMS_PER_PAGE);

  const webStoriesHref = host(
    '/webstories/hashtags/' +
      currentHashtag +
      (page > 1 && page <= maxPages ? '/page/' + page : '')
  );

  const basePath = '/hashtags/' + currentHashtag;
  const paginationBase = `${basePath}/page/{page}${
    expandGalleries ? '/expand' : ''
  }`;

  const breadcrumbs = getBreadcrumbs(
    basePath,
    currentHashtag,
    page,
    expandGalleries
  );

  const _360photosComponent = (
    <>
      {_360photos.length > 1 && (
        <SortPicker
          i18n={i18n}
          sort={sort}
          paginationBase={paginationBase}
          type="360photos"
          isRandom={isRandom}
          newShuffle={newShuffle}
          useCache={USE_CACHE}
        />
      )}

      {_360photos.length > 0 && (
        <Scroller
          title={i18n('360 Photos')}
          items={_360photos}
          is360Photos
          editMode={editMode}
        >
          {!isRandom && _360photosPageNumber > 1 && (
            <Pagination
              base={paginationBase}
              currentPage={Number(page) || 1}
              pageNumber={_360photosPageNumber}
              total={_360photosTotal}
              textPosition="bottom"
              label={i18n('360 Photos').toLowerCase()}
            />
          )}
        </Scroller>
      )}
    </>
  );

  const _360videosComponent = (
    <>
      {youtubeVideos.length > 1 && (
        <SortPicker
          i18n={i18n}
          sort={sort}
          paginationBase={paginationBase}
          type="youtube"
          isRandom={isRandom}
          newShuffle={newShuffle}
          useCache={USE_CACHE}
        />
      )}

      {youtubeVideos.length > 0 && (
        <Scroller
          title={i18n('YouTube Videos')}
          items={youtubeVideos}
          isYouTubeVideos
          editMode={editMode}
        >
          {!isRandom && videosPageNumber > 1 && (
            <Pagination
              base={paginationBase}
              currentPage={Number(page) || 1}
              pageNumber={videosPageNumber}
              total={videosTotal}
              textPosition="bottom"
              label={i18n('YouTube Videos').toLowerCase()}
            />
          )}
        </Scroller>
      )}
    </>
  );

  return (
    <div>
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            href="/hashtags"
            id="back-button"
            className={styles.history_back_button}
            scroll={false}
            style={{ display: 'flex' }}
          >
            <img src="/images/back.svg" alt={i18n('Back')} width={32}></img>
          </Link>

          <div style={{ display: 'flex', gap: 16 }}>
            {finalHashtag.pinterest_link && (
              <a
                href={
                  isBR
                    ? finalHashtag.pinterest_link_pt
                    : finalHashtag.pinterest_link
                }
                target="_blank"
              >
                <img
                  src="/logos/pinterest.svg"
                  alt={i18n('Pinterest Icon')}
                  width={32}
                  height={32}
                ></img>
              </a>
            )}
            {(RSS_HASHTAGS.includes(finalHashtag.name) ||
              RSS_HASHTAGS.includes(finalHashtag.name_pt)) && (
              <a
                href={host(
                  '/rss/hashtags/' +
                    (hashtagPt ? finalHashtag.name_pt : finalHashtag.name)
                )}
                target="_blank"
              >
                <img
                  src="/images/rss.svg"
                  alt={i18n('RSS Icon')}
                  width={32}
                  height={32}
                ></img>
              </a>
            )}
            <ShareButton />
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <h2>#{currentHashtag}</h2>
      </div>

      {editMode.editMode && (
        <Editable
          item={JSON.stringify(finalHashtag, null, 2)}
          path={finalHashtag.path}
          {...editMode}
        />
      )}

      {finalHashtag.name === '360video' && _360videosComponent}

      {finalHashtag.name === '360photo' && _360photosComponent}

      <div className={styles.galleries}>
        {instagramStories.length > 1 && (
          <SortPicker
            i18n={i18n}
            sort={sort}
            paginationBase={paginationBase}
            type="stories"
            isRandom={isRandom}
            newShuffle={newShuffle}
            useCache={USE_CACHE}
          />
        )}

        {instagramStories.length > 0 && (
          <Scroller
            title="Stories"
            items={instagramStories}
            isStories
            webStoriesHref={webStoriesHref}
            sort={sort}
            editMode={editMode}
          >
            {!isRandom && storiesPageNumber > 1 && (
              <Pagination
                base={paginationBase}
                currentPage={Number(page) || 1}
                pageNumber={storiesPageNumber}
                total={storiesTotal}
                textPosition="bottom"
                label={'stories'}
              />
            )}
          </Scroller>
        )}

        {instagramStories.length === 0 && (
          <div className="center_link" style={{ marginTop: 28 }}>
            <a
              href={webStoriesHref + (sort !== 'desc' ? '?sort=' + sort : '')}
              target="_blank"
            >
              {i18n('Open in Stories format')}
            </a>
          </div>
        )}

        {shortVideos.length > 1 && (
          <SortPicker
            i18n={i18n}
            sort={sort}
            paginationBase={paginationBase}
            type="short"
            isRandom={isRandom}
            newShuffle={newShuffle}
            useCache={USE_CACHE}
          />
        )}

        {shortVideos.length > 0 && (
          <Scroller
            title={i18n('Short Videos')}
            items={shortVideos}
            isShortVideos
            editMode={editMode}
          >
            {!isRandom && shortsPageNumber > 1 && (
              <Pagination
                base={paginationBase}
                currentPage={Number(page) || 1}
                pageNumber={shortsPageNumber}
                total={shortsTotal}
                textPosition="bottom"
                label={i18n('Short Videos').toLowerCase()}
              />
            )}
          </Scroller>
        )}

        {finalHashtag.name !== '360video' && _360videosComponent}

        {finalHashtag.name !== '360photo' && _360photosComponent}

        {instagramPhotos.filter((p) => !p.file_type).length > 1 && (
          <SortPicker
            i18n={i18n}
            sort={sort}
            paginationBase={paginationBase}
            type="photos"
            isRandom={isRandom}
            newShuffle={newShuffle}
            useCache={USE_CACHE}
          />
        )}

        {instagramPhotos.filter((p) => !p.file_type).length > 0 && (
          <div className="container-fluid">
            <div className={styles.instagram_photos}>
              <div className={styles.instagram_photos_title}>
                <h3>{i18n('Posts')}</h3>
              </div>

              {!isRandom && postsPageNumber > 1 && (
                <Pagination
                  base={paginationBase}
                  currentPage={Number(page) || 1}
                  pageNumber={postsPageNumber}
                  total={postsTotal}
                  textPosition="bottom"
                />
              )}

              {sort !== 'random' && (
                <div className="center_link">
                  <Link
                    href={
                      `/hashtags/${currentHashtag}${
                        page ? '/page/' + page : ''
                      }${!expandGalleries ? '/expand' : ''}` +
                      (sort !== 'desc' ? '?sort=' + sort : '')
                    }
                    scroll={false}
                    prefetch={false}
                  >
                    {expandGalleries
                      ? i18n('Minimize Galleries')
                      : i18n('Expand Galleries')}
                  </Link>
                </div>
              )}

              <div className="instagram_highlights_items">
                {instagramPhotos.map((p) => (
                  <Media
                    key={p.id}
                    media={p}
                    isBR={isBR}
                    expandGalleries={expandGalleries}
                    isListing
                    editMode={editMode}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {mapsPhotos.filter((p) => !p.file_type).length > 1 && (
          <SortPicker
            i18n={i18n}
            sort={sort}
            paginationBase={paginationBase}
            type="maps"
            isRandom={isRandom}
            newShuffle={newShuffle}
            useCache={USE_CACHE}
          />
        )}

        {mapsPhotos.length > 0 && (
          <div className="container-fluid">
            <div className={styles.instagram_photos}>
              <div className={styles.instagram_photos_title}>
                <h3>{i18n('Places Photos')}</h3>
              </div>

              {!isRandom && mapsPageNumber > 1 && (
                <Pagination
                  base={paginationBase}
                  currentPage={Number(page) || 1}
                  pageNumber={mapsPageNumber}
                  total={mapsTotal}
                  textPosition="bottom"
                  label={i18n('Places Photos').toLowerCase()}
                />
              )}

              <div className="instagram_highlights_items">
                {mapsPhotos.map((p) => (
                  <Media
                    key={p.id}
                    media={p}
                    isBR={isBR}
                    expandGalleries={expandGalleries}
                    isListing
                    editMode={editMode}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <StructuredBreadcrumbs breadcrumbs={breadcrumbs} />
    </div>
  );
}

function getBreadcrumbs(basePath, currentHashtag, page, expandGalleries) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();

  let currentPath = basePath;

  const breadcrumbs = [
    {
      name: 'Hashtags',
      item: host('/hashtags'),
    },
    {
      name: `#${currentHashtag}`,
      item: host(basePath),
    },
  ];

  if (page > 1) {
    currentPath += '/page/' + page;
    breadcrumbs.push({
      name: i18n('Page') + ' ' + page,
      item: currentPath,
    });
  }

  if (expandGalleries) {
    breadcrumbs.push({
      name: i18n('Expand Galleries'),
      item: currentPath + '/expand',
    });
  }

  return breadcrumbs;
}

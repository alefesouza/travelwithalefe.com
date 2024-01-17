import useI18n from '../../hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { SITE_NAME } from '@/app/utils/constants';
import Scroller from '@/app/components/scroller';
import { permanentRedirect, redirect } from 'next/navigation';
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
// @ad
import AdSense from '@/app/components/adsense';
import addAds from '@/app/utils/add-ads';
import getItemsPagination from '@/app/utils/get-items-pagination';
import expandPosts from '@/app/utils/expand-posts';
import SortPicker from '@/app/components/sort-picker';
import Pagination from '@/app/components/pagination';

function getDataFromRoute(slug, searchParams) {
  const [hashtag, path1, path2, path3] = slug;
  // {hashtag}
  // {hashtag}/page/{page}
  // {hashtag}/expand
  // {hashtag}/page/{page}/expand

  let page = path1 === 'page' ? path2 : 1;
  page = parseInt(page);
  page = isNaN(page) ? 1 : page;

  const expandGalleries = path1 === 'expand' || path3 === 'expand';
  const isWebStories = path1 === 'webstories' || path3 === 'webstories';
  const sort = getSort(searchParams);

  return {
    hashtag: removeDiacritics(decodeURIComponent(hashtag)),
    page,
    expandGalleries,
    sort,
    isWebStories,
  };
}

export async function generateMetadata({
  params: { theHashtag },
  searchParams,
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  let { hashtag, page, expandGalleries, isWebStories } = getDataFromRoute(
    theHashtag,
    searchParams
  );

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
    SITE_NAME,
  ]
    .filter((c) => c)
    .join(' - ');
  const description = i18n(
    'Photos and videos taken by Viajar com Alê with the hashtag #:hashtag:.',
    {
      hashtag,
    }
  );

  const db = getFirestore();
  const hashtagPtSnapshot = await db
    .collection('hashtags')
    .where('name_pt', '==', hashtag)
    .get();
  let hashtagPt = null;
  let hashtagEn = null;

  hashtagPtSnapshot.forEach((doc) => {
    hashtagPt = doc.data();
  });

  if (!hashtagPt) {
    const hashtagEnDoc = await db.collection('hashtags').doc(hashtag).get();
    hashtagEn = hashtagEnDoc.data();
  }

  if (!hashtagPt && !hashtagEn) {
    const hashtagAlternateDoc = await db
      .collection('hashtags')
      .where('alternate_tags', 'array-contains', hashtag)
      .get();
    let hashtagAlternate = null;

    hashtagAlternateDoc.forEach((doc) => {
      hashtagAlternate = doc.data();
    });

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
      redirect('/hashtags');
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
  let coverSnapshot = await db
    .collectionGroup('medias')
    .where('highlight_hashtags', 'array-contains', finalHashtag.name)
    .limit(1)
    .get();

  if (coverSnapshot.size === 0) {
    coverSnapshot = await db
      .collectionGroup('medias')
      .where('hashtags', 'array-contains', finalHashtag.name)
      .orderBy('date', sort)
      .limit(isWebStories ? 1 : 2)
      .get();
  }

  let cover = null;

  coverSnapshot.forEach((photo) => {
    const data = photo.data();

    if ((cover && cover.type === 'post') || !cover) {
      cover = data;
    }
  });

  if (!cover) {
    redirect('/hashtags');
  }

  const defaultMeta = defaultMetadata(title, description, cover);

  const enUrl =
    'https://viajarcomale.com' +
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
        'application/rss+xml': host('/rss/hashtags/' + hashtag),
      },
    },
    ...(!isWebStories
      ? {
          icons: {
            // Why Next.js doesn't just allow us to create custom <link> tags directly...
            other: {
              rel: 'amphtml',
              url: host('/webstories/hashtags/' + hashtag),
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

  let { hashtag, page, expandGalleries, isWebStories, sort } = getDataFromRoute(
    theHashtag,
    searchParams
  );

  const db = getFirestore();
  const hashtagPtSnapshot = await db
    .collection('hashtags')
    .where('name_pt', '==', hashtag)
    .get();
  let hashtagPt = null;
  let hashtagEn = null;

  hashtagPtSnapshot.forEach((doc) => {
    hashtagPt = doc.data();
  });

  if (!hashtagPt) {
    const hashtagEnDoc = await db.collection('hashtags').doc(hashtag).get();
    hashtagEn = hashtagEnDoc.data();
  }

  const finalHashtag = hashtagPt || hashtagEn;

  hashtag = finalHashtag.name;

  const cacheRef = `/caches/hashtags/hashtags-cache/${hashtag}/sort/${
    sort === 'asc' ? 'asc' : 'desc'
  }`;

  const cache = await db.doc(cacheRef).get();
  // const cache = { exists: false };

  let isRandom = sort === 'random';

  if (isRandom) {
    sort = 'desc';
  }

  let photos = [];

  if (!cache.exists || isWebStories) {
    const photosSnapshot = await db
      .collectionGroup('medias')
      .where('hashtags', 'array-contains', hashtag)
      .orderBy('date', sort)
      .get();

    photosSnapshot.forEach((photo) => {
      const data = photo.data();
      data.path = photo.ref.path;

      photos = [...photos, data];
    });

    if (!photos.length) {
      const hashtagAlternateDoc = await db
        .collection('hashtags')
        .where('alternate_tags', 'array-contains', hashtag)
        .get();
      let hashtagAlternate = null;

      hashtagAlternateDoc.forEach((doc) => {
        hashtagAlternate = doc.data();
      });

      if (hashtagAlternate) {
        permanentRedirect(
          '/hashtags/' +
            (isBR && hashtagAlternate.name_pt
              ? hashtagAlternate.name_pt
              : hashtagAlternate.name)
        );
      } else {
        redirect('/hashtags');
      }
    }

    if (!isRandom && !cache.exists) {
      db.doc(cacheRef).set({
        photos,
        last_update: new Date().toISOString().split('T')[0],
      });
    }
  } else {
    photos = cache.data().photos;
  }

  if (isRandom) {
    photos = photos
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
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
  } = getItemsPagination(photos, '360photos', page, isWebStories);
  let {
    total: mapsTotal,
    pageNumber: mapsPageNumber,
    items: mapsPhotos,
  } = getItemsPagination(photos, 'maps', page, isWebStories);

  instagramPhotos = expandPosts(instagramPhotos, expandGalleries, isWebStories);

  if (isWebStories) {
    let items = [
      ...instagramStories,
      ...instagramPhotos,
      ..._360photos,
      ...youtubeVideos,
      ...shortVideos,
      ...mapsPhotos,
    ].slice(0, 100);

    return (
      <WebStories
        title={`#${hashtagPt ? hashtagPt.name_pt : hashtag}`}
        storyTitle={`#${hashtagPt ? hashtagPt.name_pt : hashtag}`}
        items={items}
        hashtag={hashtagPt ? hashtagPt.name_pt : hashtag}
      />
    );
  }

  // @ad
  instagramPhotos = addAds(instagramPhotos);

  // @ad
  mapsPhotos = addAds(mapsPhotos);

  logAccess(
    db,
    host('/hashtags/') +
      hashtag +
      (expandGalleries ? '/expand' : '') +
      ('?sort=' + sort)
  );

  const currentHashtag = decodeURIComponent(
    hashtagPt ? hashtagPt.name_pt : hashtag
  );

  const webStoriesHref = host('/webstories/hashtags/' + currentHashtag);

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
          type="360photos"
          basePath={basePath}
          sort={sort}
          newShuffle={newShuffle}
        />
      )}

      {_360photos.length > 0 && (
        <Scroller title={i18n('360 Photos')} items={_360photos} is360Photos>
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
            <ShareButton />
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <h2>#{currentHashtag}</h2>
      </div>

      {finalHashtag.name === '360photo' && _360photosComponent}

      <div className={styles.galleries}>
        {instagramStories.length > 1 && (
          <SortPicker
            type="stories"
            basePath={basePath}
            sort={sort}
            newShuffle={newShuffle}
          />
        )}

        {instagramStories.length > 0 && (
          <Scroller
            title="Stories"
            items={instagramStories}
            isStories
            webStoriesHref={webStoriesHref}
            sort={sort}
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
          <div className="center_link">
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
            type="short"
            basePath={basePath}
            sort={sort}
            newShuffle={newShuffle}
          />
        )}

        {shortVideos.length > 0 && (
          <Scroller
            title={i18n('Short Videos')}
            items={shortVideos}
            isShortVideos
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

        {youtubeVideos.length > 1 && (
          <SortPicker
            type="youtube"
            basePath={basePath}
            sort={sort}
            newShuffle={newShuffle}
          />
        )}

        {youtubeVideos.length > 0 && (
          <Scroller
            title={i18n('YouTube Videos')}
            items={youtubeVideos}
            isYouTubeVideos
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

        {finalHashtag.name !== '360photo' && _360photosComponent}

        {/* @ad */}
        {(shortVideos.length > 0 ||
          youtubeVideos.length > 0 ||
          _360photos.length > 0) &&
          (instagramPhotos.length >= 8 || mapsPhotos.length >= 8) && (
            <div className="container-fluid ad" style={{ textAlign: 'center' }}>
              <AdSense index={1} />
            </div>
          )}

        {instagramPhotos.filter((p) => !p.file_type).length > 1 && (
          <SortPicker
            type="photos"
            basePath={basePath}
            sort={sort}
            newShuffle={newShuffle}
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
                  <div key={p.id} className={p.type === 'ad' ? 'row-ad' : null}>
                    {/* @ad */}
                    {p.type === 'ad' ? (
                      <AdSense index={p.id} />
                    ) : (
                      <Media
                        key={p.id}
                        media={p}
                        isBR={isBR}
                        expandGalleries={expandGalleries}
                        isListing
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mapsPhotos.filter((p) => !p.file_type).length > 1 && (
          <SortPicker
            type="maps"
            basePath={basePath}
            sort={sort}
            newShuffle={newShuffle}
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
                  <div key={p.id} className={p.type === 'ad' ? 'row-ad' : null}>
                    {/* @ad */}
                    {p.type === 'ad' ? (
                      <AdSense index={p.id} />
                    ) : (
                      <Media
                        key={p.id}
                        media={p}
                        isBR={isBR}
                        expandGalleries={expandGalleries}
                        isListing
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* @ad */}
      <div className="container-fluid ad" style={{ textAlign: 'center' }}>
        <AdSense index={2} />
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

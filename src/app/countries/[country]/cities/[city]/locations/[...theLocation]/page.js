import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { SITE_NAME, WEBSTORIES_ITEMS_PER_PAGE } from '@/app/utils/constants';
import Scroller from '@/app/components/scroller';
import { notFound } from 'next/navigation';
import Media from '@/app/components/media';
import ShareButton from '@/app/components/share-button';
import randomIntFromInterval from '@/app/utils/random-int';
import WebStories from '@/app/components/webstories';
import logAccess from '@/app/utils/log-access';
import getSort from '@/app/utils/get-sort';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import defaultMetadata from '@/app/utils/default-metadata';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import expandDate from '@/app/utils/expand-date';
// @ad
import AdSense from '@/app/components/adsense';
import addAds from '@/app/utils/add-ads';
import expandPosts from '@/app/utils/expand-posts';
import getItemsPagination from '@/app/utils/get-items-pagination';
import SortPicker from '@/app/components/sort-picker';
import Pagination from '@/app/components/pagination';
import useEditMode from '@/app/utils/use-edit-mode';
import Editable from '@/app/components/editable/editable';

function getDataFromRoute(slug, searchParams) {
  const [location, path5, path6, path7, path8] = slug;
  // {country}/cities/{city}/locations/{location}
  // {country}/cities/{city}/locations/{location}/expand
  // {country}/cities/{city}/locations/{location}/page/{page}
  // {country}/cities/{city}/locations/{location}/page/{page}/expand

  let page = path5 === 'page' ? path6 : 1;
  page = parseInt(page);
  page = isNaN(page) ? 1 : page;

  const expandGalleries = path5 === 'expand' || path7 === 'expand';
  const isWebStories = path5 === 'webstories' || path7 === 'webstories';
  const sort = getSort(searchParams, isWebStories);

  return {
    page,
    expandGalleries,
    sort,
    isWebStories,
    location: decodeURIComponent(location).toLowerCase(),
  };
}

async function getCountry(country, city) {
  const db = getFirestore();
  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (!countryData) {
    return notFound();
  }

  if (city && !countryData.cities.find((c) => c.slug === city)) {
    return false;
  }

  return countryData;
}

export async function generateMetadata({
  params: { country, city, theLocation },
  searchParams,
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  let { page, location, isWebStories } = getDataFromRoute(
    theLocation,
    searchParams
  );

  // if (
  //   theLocation.length > 2 ||
  //   (theLocation[1] &&
  //     theLocation[1] !== 'expand' &&
  //     theLocation[1] !== 'webstories')
  // ) {
  //   redirect(
  //     `/countries/${country}/cities/${city}/locations/${theLocation[0]}`
  //   );
  // }

  const countryData = await getCountry(country, city);

  if (!countryData) {
    return notFound();
  }

  let theCity = null;

  if (city) {
    theCity = countryData.cities.find((c) => c.slug === city);
  }

  if (!theCity) {
    return notFound();
  }

  const db = getFirestore();
  const mediaRef = await db
    .collection('countries')
    .doc(country)
    .collection('cities')
    .doc(city)
    .collection('locations')
    .doc(location)
    .get();
  const theMedia = mediaRef.data();

  if (!theMedia) {
    return notFound();
  }

  const finalLocation = [
    isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
    i18n(countryData.name),
  ].join(' - ');
  const title = [
    (isBR && theMedia.name_pt ? theMedia.name_pt : theMedia.name) +
      (theMedia.alternative_names
        ? ' (' + theMedia.alternative_names.join(', ') + ')'
        : ''),
    page > 1 ? i18n('Page') + ' ' + page : null,
    finalLocation,
    isWebStories ? 'Web Stories' : '',
    i18n(SITE_NAME),
  ]
    .filter((c) => c)
    .join(' - ');
  const description = i18n(
    'Photos and videos taken by Travel with Alefe in :location:',
    {
      location: theMedia.name,
    }
  );

  const sort = getSort(searchParams, false, false);
  let coverSnapshot = await db
    .collectionGroup('medias')
    .where('locations', 'array-contains', location)
    .where('city', '==', city)
    .orderBy('date', sort)
    .limit(isWebStories ? 1 : 2)
    .get();

  let cover = null;

  coverSnapshot.forEach((photo) => {
    const data = photo.data();

    if ((cover && cover.type === 'post') || !cover) {
      cover = data;
    }
  });

  if (!cover) {
    return notFound();
  }

  const maxPages = Math.ceil(theMedia.total / WEBSTORIES_ITEMS_PER_PAGE);

  return {
    ...defaultMetadata(title, description, cover),
    ...(!isWebStories && page <= maxPages
      ? {
          icons: {
            // Why Next.js doesn't just allow us to create custom <link> tags directly...
            other: {
              rel: 'amphtml',
              url: host(
                '/webstories/countries/' +
                  country +
                  '/cities/' +
                  city +
                  '/locations/' +
                  location +
                  (page > 1 ? '/page/' + page : '')
              ),
            },
          },
        }
      : null),
  };
}

export default async function Country({
  params: { country, city, theLocation },
  searchParams,
}) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';
  const editMode = useEditMode(searchParams);

  let { page, expandGalleries, sort, location, isWebStories } =
    getDataFromRoute(theLocation, searchParams);

  const countryData = await getCountry(country, city);

  if (!countryData) {
    return notFound();
  }

  let theCity = countryData.cities.find((c) => c.slug === city);

  const cacheRef = `/caches/locations/locations-cache/${city}-${location}/sort/${
    sort === 'asc' ? 'asc' : 'desc'
  }`;

  const db = getFirestore();

  let cache = null;

  if (editMode) {
    cache = { exists: false };
  } else {
    cache = await db.doc(cacheRef).get();
  }

  let isRandom = sort === 'random';

  if (isRandom) {
    sort = 'desc';
  }

  let photos = [];

  const mediaRef = await db
    .collection('countries')
    .doc(country)
    .collection('cities')
    .doc(city)
    .collection('locations')
    .doc(location)
    .get();
  let theMedia = mediaRef.data();

  if (!cache.exists || isWebStories) {
    const photosSnapshot = await db
      .collectionGroup('medias')
      .where('locations', 'array-contains', location)
      .where('city', '==', city)
      .orderBy('order', sort)
      .get();

    photosSnapshot.forEach((photo) => {
      const data = photo.data();
      data.path = photo.ref.path;
      photos = [...photos, data];
    });

    if (!photos.length) {
      return notFound();
    }

    if (!isRandom && !cache.exists && !isWebStories) {
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

  logAccess(
    db,
    host((isWebStories ? '/webstories' : '') + '/locations/') +
      location +
      (expandGalleries ? '/expand' : '') +
      ('?sort=' + sort)
  );

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  const basePath = `/countries/${country}/cities/${city}/locations/${location}`;

  const paginationBase = `${basePath}/page/{page}${
    expandGalleries ? '/expand' : ''
  }`;

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
    location
  );

  const allItems = [
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
    const title = [
      (isBR && theMedia.name_pt ? theMedia.name_pt : theMedia.name) +
        (theMedia.alternative_names
          ? ' (' + theMedia.alternative_names.join(', ') + ')'
          : ''),
      isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
      i18n(countryData.name),
    ].join(' - ');

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
        title={title}
        storyTitle={title}
        items={items}
        countryData={countryData}
        isLocation
        previousPageItem={previousPageItem}
        nextPageItem={nextPageItem}
        page={page}
        maxPages={maxPages}
        path={`/webstories/countries/${country}/cities/${city}/locations/${theMedia.slug}`}
      />
    );
  }

  const breadcrumbs = getBreadcrumbs(
    countryData,
    theCity,
    theMedia,
    page,
    expandGalleries,
    isBR
  );

  const dates = instagramStories.flatMap((c) => c.date);
  const orderedDates = dates.sort(function (a, b) {
    a = a.split('/').reverse().join('');
    b = b.split('/').reverse().join('');
    return a > b ? 1 : a < b ? -1 : 0;
  });

  const maxPages = Math.ceil(theMedia.total / WEBSTORIES_ITEMS_PER_PAGE);

  // @ad
  instagramPhotos = addAds(instagramPhotos);

  // @ad
  mapsPhotos = addAds(mapsPhotos);

  const webStoriesHref = host(
    '/webstories/countries/' +
      country +
      '/cities/' +
      city +
      '/locations/' +
      location +
      (page > 1 && page <= maxPages ? '/page/' + page : '')
  );

  return (
    <div>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link
            href={`/countries/${country}/cities/${city}`}
            id="back-button"
            className={styles.history_back_button}
            scroll={false}
          >
            <img src="/images/back.svg" alt={i18n('Back')} width="32px"></img>
          </Link>

          <div style={{ display: 'flex', gap: 16 }}>
            {theMedia.latitude !== 0 && theMedia.longitude !== 0 && (
              <a
                href={`https://www.google.com/maps/search/${theMedia.name}/@${theMedia.latitude},${theMedia.longitude},13z`}
                target="_blank"
                title={i18n('Open in Google Maps')}
              >
                <img
                  src={host('/images/google-maps.svg')}
                  width={32}
                  height={32}
                  alt={i18n('Google Maps logo')}
                />
              </a>
            )}
            <ShareButton />
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <h2
          className={isWindows ? 'windows-header' : null}
          style={{ marginBottom: 0 }}
        >
          {isBR && theMedia.name_pt ? theMedia.name_pt : theMedia.name}
          {theMedia.alternative_names &&
            ' (' + theMedia.alternative_names.join(', ') + ')'}{' '}
          -{' '}
          <Link
            href={`/countries/${country}/cities/${city}`}
            style={{ textDecoration: 'underline' }}
          >
            {isBR && theCity.name_pt ? theCity.name_pt : theCity.name}
          </Link>{' '}
          -{' '}
          <Link
            href={`/countries/${country}`}
            style={{ textDecoration: 'underline' }}
          >
            {i18n(countryData.name)}
          </Link>{' '}
          {isWindows ? (
            <img
              src={host('/flags/' + countryData.slug + '.png')}
              alt={i18n(countryData.name)}
              width={26}
              height={26}
            />
          ) : (
            countryData.flag
          )}
        </h2>

        <div>
          {orderedDates.length
            ? expandDate(orderedDates[0], isBR) +
              ' - ' +
              expandDate(orderedDates[orderedDates.length - 1], isBR)
            : expandDate(theCity.start, isBR) +
              ' - ' +
              expandDate(theCity.end, isBR)}
        </div>
      </div>

      {editMode.editMode && (
        <Editable
          item={JSON.stringify(theMedia, null, 2)}
          path={theMedia.path}
          {...editMode}
        />
      )}

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

        {_360photos.length > 1 && (
          <SortPicker
            type="360photos"
            basePath={basePath}
            sort={sort}
            newShuffle={newShuffle}
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
                      `/countries/${country}/cities/${city}/locations/${location}${
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
                        editMode={editMode}
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
                <h3>{i18n('Place Photos')}</h3>
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
                        editMode={editMode}
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

function getBreadcrumbs(
  countryData,
  theCity,
  theMedia,
  page,
  expandGalleries,
  isBR
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const country = countryData.slug;
  const city = theCity.slug;

  const breadcrumbs = [
    {
      name: i18n(countryData.name),
      item: `/countries/${country}`,
    },
    {
      name: isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
      item: `/countries/${country}/cities/${city}`,
    },
    {
      name: isBR && theMedia.name_pt ? theMedia.name_pt : theMedia.name,
      item: `/countries/${country}/cities/${city}/locations/${theMedia.slug}`,
    },
  ];

  let currentPath = `/countries/${country}/cities/${city}/locations/${theMedia.slug}`;

  if (page > 0) {
    currentPath += '/page/' + page;
    breadcrumbs.push({
      name: i18n('Page') + ' ' + page,
      item: currentPath,
    });
  }

  if (expandGalleries) {
    breadcrumbs.push({
      name: i18n('Expand Galleries'),
      item: `${currentPath}/expand`,
    });
  }

  return breadcrumbs;
}

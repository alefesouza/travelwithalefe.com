import useI18n from '../../hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from '../page.module.css';
import {
  ITEMS_PER_PAGE,
  SITE_NAME,
  WEBSTORIES_ITEMS_PER_PAGE,
} from '@/app/utils/constants';
import Pagination from '@/app/components/pagination';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import arrayShuffle from '@/app/utils/array-shuffle';
import Scroller from '@/app/components/scroller';
import randomIntFromInterval from '@/app/utils/random-int';
import Media from '@/app/components/media';
import ShareButton from '@/app/components/share-button';
import logAccess from '@/app/utils/log-access';
import defaultMetadata from '@/app/utils/default-metadata';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import expandDate from '@/app/utils/expand-date';
import LocationsMap from '@/app/components/locations-map';
// @ad
import AdSense from '@/app/components/adsense';
import addAds from '@/app/utils/add-ads';
import { notFound } from 'next/navigation';

function getDataFromRoute(slug, searchParams) {
  const [country, path1, path2, path3, path4, path5] = slug;
  // {country}
  // {country}/page/{page}
  // {country}/expand
  // {country}/page/{page}/expand
  // {country}/cities/{city}
  // {country}/cities/{city}/page/{page}
  // {country}/cities/{city}/page/{page}/expand

  let city = null;

  if (path1 === 'cities') {
    city = path2;
  }

  let page = path1 === 'page' ? path2 : path3 === 'page' ? path4 : 1;
  page = parseInt(page);
  page = isNaN(page) ? 1 : page;

  const expandGalleries =
    path1 === 'expand' || path3 === 'expand' || path5 === 'expand';
  let sort =
    (searchParams.sort &&
      ['asc', 'desc', 'random'].includes(searchParams.sort) &&
      searchParams.sort) ||
    'desc';

  return {
    country,
    city,
    page,
    expandGalleries,
    sort,
  };
}

async function getCountry(db, slug, searchParams) {
  let { country, city } = getDataFromRoute(slug, searchParams);

  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (city && !countryData.cities.find((c) => c.slug === city)) {
    return false;
  }

  return countryData;
}

export async function generateMetadata({ params: { slug }, searchParams }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  const db = getFirestore();
  const countryData = await getCountry(db, slug, searchParams);

  if (!countryData) {
    return notFound();
  }

  let { city, country, page } = getDataFromRoute(slug, searchParams);
  let theCity = null;

  if (city) {
    theCity = countryData.cities.find((c) => c.slug === city);
  }

  const location = [
    theCity ? (isBR && theCity.name_pt ? theCity.name_pt : theCity.name) : '',
    i18n(countryData.name),
  ]
    .filter((c) => c)
    .join(' - ');
  const title = [
    location,
    page > 1 ? i18n('Page') + ' ' + page : null,
    i18n(SITE_NAME),
  ]
    .filter((c) => c)
    .join(' - ');
  const description = i18n(
    'Photos and videos taken by Travel with Alefe in :location:.',
    {
      location,
    }
  );

  let coverSnapshot = null;
  let cover = null;

  if (city) {
    coverSnapshot = await db
      .collection('countries')
      .doc(countryData.slug)
      .collection('cities')
      .doc(city)
      .collection('medias')
      .where('is_highlight', '==', true)
      .limit(1)
      .get();
  } else {
    coverSnapshot = await db
      .collectionGroup('medias')
      .where('country', '==', countryData.slug)
      .where('is_highlight', '==', true)
      .orderBy('date', 'desc')
      .limit(1)
      .get();
  }

  coverSnapshot.forEach((photo) => {
    const data = photo.data();

    cover = data;
  });

  let maxPages = null;

  if (theCity) {
    maxPages = Math.ceil(theCity.total / WEBSTORIES_ITEMS_PER_PAGE);
  }

  return {
    ...defaultMetadata(title, description, cover),
    ...(city && page <= maxPages
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
                  '/stories' +
                  (page > 1 ? '/page/' + page : '')
              ),
            },
          },
        }
      : null),
  };
}

export default async function Country({ params: { slug }, searchParams }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';

  if (slug.length > 6) {
    return notFound();
  }

  if (searchParams.shuffle) {
    const theShuffle = parseInt(searchParams.shuffle);

    if (
      theShuffle != searchParams.shuffle ||
      theShuffle < 1 ||
      theShuffle > 15
    ) {
      return notFound();
    }
  }

  if (
    searchParams.sort == 'random' &&
    (!searchParams.shuffle || Object.keys(searchParams).length > 2)
  ) {
    return notFound();
  }

  const db = getFirestore();
  const countryData = await getCountry(db, slug, searchParams);

  if (!countryData) {
    return notFound();
  }

  let { country, city, page, sort, expandGalleries } = getDataFromRoute(
    slug,
    searchParams
  );

  const cacheRef = `/caches/countries/countries-cache/${country}/caches${
    city ? '/' + city : '/country'
  }/page/${page}/sort/${sort === 'asc' ? 'asc' : 'desc'}`;

  const cache = await db.doc(cacheRef).get();
  // const cache = { exists: false };

  let instagramHighLightsSnapshot = [];
  let shortVideosSnapshot = [];
  let instagramPhotosSnapshot = [];
  let youtubeSnapshot = [];
  let _360PhotosSnapshot = [];
  let mapsPhotosSnapshot = [];
  let isRandom = sort === 'random';
  let randomArray = [];

  const cityData = countryData.cities.reduce((prev, curr, i) => {
    prev[curr.slug] = curr;

    return prev;
  }, {});

  const totalPhotos = city
    ? cityData[city]?.totals?.posts
    : countryData?.totals?.posts;
  const paginationStart =
    sort === 'asc'
      ? (page - 1) * ITEMS_PER_PAGE
      : totalPhotos - (page - 1) * ITEMS_PER_PAGE;

  const totalMapsPhotos = city
    ? cityData[city]?.totals?.maps
    : countryData?.totals?.maps;
  const paginationMapsStart =
    sort === 'asc'
      ? (page - 1) * ITEMS_PER_PAGE
      : totalMapsPhotos - (page - 1) * ITEMS_PER_PAGE;

  let instagramHighLights = [];
  let shortVideos = [];
  let youtubeVideos = [];
  let _360photos = [];
  let mapsPhotos = [];
  let instagramPhotos = [];

  if (!cache.exists || isRandom) {
    if (isRandom) {
      sort = 'desc';

      const array = Array.from(Array(totalPhotos).keys());
      randomArray = arrayShuffle(array).slice(0, ITEMS_PER_PAGE);
      const arrayMaps = Array.from(Array(totalMapsPhotos).keys());
      randomArrayMaps = arrayShuffle(arrayMaps).slice(0, ITEMS_PER_PAGE);
    }

    if (!cache.exists) {
      if (page == 1) {
        if (city) {
          instagramHighLightsSnapshot = await db
            .collection('countries')
            .doc(country)
            .collection('cities')
            .doc(city)
            .collection('medias')
            .where('is_highlight', '==', true)
            .get();
          shortVideosSnapshot = await db
            .collection('countries')
            .doc(country)
            .collection('cities')
            .doc(city)
            .collection('medias')
            .where('type', '==', 'short-video')
            .orderBy('order', sort)
            .get();
          youtubeSnapshot = await db
            .collection('countries')
            .doc(country)
            .collection('cities')
            .doc(city)
            .collection('medias')
            .where('type', '==', 'youtube')
            .orderBy('order', sort)
            .get();
          _360PhotosSnapshot = await db
            .collection('countries')
            .doc(country)
            .collection('cities')
            .doc(city)
            .collection('medias')
            .where('type', '==', '360photo')
            .orderBy('order', sort)
            .get();
        } else {
          instagramHighLightsSnapshot = await db
            .collectionGroup('medias')
            .where('country', '==', country)
            .where('is_highlight', '==', true)
            .orderBy('date', sort)
            .get();
          shortVideosSnapshot = await db
            .collectionGroup('medias')
            .where('country', '==', country)
            .where('type', '==', 'short-video')
            .orderBy('city_location_id', sort)
            .orderBy('order', sort)
            .get();
          youtubeSnapshot = await db
            .collectionGroup('medias')
            .where('country', '==', country)
            .where('type', '==', 'youtube')
            .orderBy('city_location_id', sort)
            .orderBy('order', sort)
            .get();
          _360PhotosSnapshot = await db
            .collectionGroup('medias')
            .where('country', '==', country)
            .where('type', '==', '360photo')
            .orderBy('city_location_id', sort)
            .orderBy('order', sort)
            .get();
        }
      }
    }

    if (city) {
      if (isRandom && totalPhotos > 0) {
        instagramPhotosSnapshot = await db
          .collection('countries')
          .doc(country)
          .collection('cities')
          .doc(city)
          .collection('medias')
          .where('type', '==', 'post')
          .where('city_index', 'in', randomArray)
          .get();
      } else {
        instagramPhotosSnapshot = await db
          .collection('countries')
          .doc(country)
          .collection('cities')
          .doc(city)
          .collection('medias')
          .where('type', '==', 'post')
          .orderBy('city_index', sort);
      }

      if (isRandom && totalMapsPhotos > 0) {
        mapsPhotosSnapshot = await db
          .collection('countries')
          .doc(country)
          .collection('cities')
          .doc(city)
          .collection('medias')
          .where('type', '==', 'maps')
          .where('city_index', 'in', randomMapsArray)
          .get();
      } else {
        mapsPhotosSnapshot = await db
          .collection('countries')
          .doc(country)
          .collection('cities')
          .doc(city)
          .collection('medias')
          .where('type', '==', 'maps')
          .orderBy('city_index', sort);
      }
    } else {
      if (isRandom && totalPhotos > 0) {
        instagramPhotosSnapshot = await db
          .collectionGroup('medias')
          .where('country', '==', country)
          .where('type', '==', 'post')
          .where('country_index', 'in', randomArray)
          .get();
      } else {
        instagramPhotosSnapshot = await db
          .collectionGroup('medias')
          .where('country', '==', country)
          .where('type', '==', 'post')
          .orderBy('country_index', sort);
      }

      if (isRandom && totalMapsPhotos > 0) {
        mapsPhotosSnapshot = await db
          .collectionGroup('medias')
          .where('country', '==', country)
          .where('type', '==', 'maps')
          .where('country_index', 'in', randomMapsArray)
          .get();
      } else {
        mapsPhotosSnapshot = await db
          .collectionGroup('medias')
          .where('country', '==', country)
          .where('type', '==', 'maps')
          .orderBy('country_index', sort);
      }
    }

    if (!isRandom) {
      if (sort === 'asc') {
        instagramPhotosSnapshot =
          instagramPhotosSnapshot.startAt(paginationStart);
        mapsPhotosSnapshot = mapsPhotosSnapshot.startAt(paginationMapsStart);
      } else {
        instagramPhotosSnapshot =
          instagramPhotosSnapshot.startAfter(paginationStart);
        mapsPhotosSnapshot = mapsPhotosSnapshot.startAfter(paginationMapsStart);
      }

      instagramPhotosSnapshot = await instagramPhotosSnapshot
        .limit(ITEMS_PER_PAGE)
        .get();

      mapsPhotosSnapshot = await mapsPhotosSnapshot.limit(ITEMS_PER_PAGE).get();
    }

    if (!cache.exists) {
      instagramHighLightsSnapshot.forEach((media) => {
        const data = media.data();
        data.path = media.ref.path;
        instagramHighLights = [...instagramHighLights, data];
      });

      shortVideosSnapshot.forEach((media) => {
        const data = media.data();
        data.path = media.ref.path;
        shortVideos = [...shortVideos, data];
      });

      youtubeSnapshot.forEach((media) => {
        const data = media.data();
        data.path = media.ref.path;
        youtubeVideos = [...youtubeVideos, data];
      });

      _360PhotosSnapshot.forEach((media) => {
        const data = media.data();
        data.path = media.ref.path;
        _360photos = [..._360photos, data];
      });
    }

    if (!cache.exists || isRandom) {
      if (totalPhotos > 0) {
        instagramPhotosSnapshot.forEach((photo) => {
          const data = photo.data();
          data.path = photo.ref.path;
          instagramPhotos = [...instagramPhotos, data];
        });
      }

      if (totalMapsPhotos > 0) {
        mapsPhotosSnapshot.forEach((photo) => {
          const data = photo.data();
          data.path = photo.ref.path;
          mapsPhotos = [...mapsPhotos, data];
        });
      }
    }

    if (!isRandom && !cache.exists) {
      db.doc(cacheRef).set({
        instagramHighLights,
        shortVideos,
        youtubeVideos,
        instagramPhotos,
        _360photos,
        mapsPhotos,
        last_update: new Date().toISOString().split('T')[0],
      });
    }
  }

  if (cache.exists) {
    const cacheData = cache.data();
    instagramHighLights = cacheData.instagramHighLights;
    shortVideos = cacheData.shortVideos;
    youtubeVideos = cacheData.youtubeVideos;
    _360photos = cacheData._360photos;

    if (!isRandom) {
      instagramPhotos = cacheData.instagramPhotos;
      mapsPhotos = cacheData.mapsPhotos;
    }
  }

  if (
    [
      ...instagramHighLights,
      ...shortVideos,
      ...youtubeVideos,
      ..._360photos,
      ...instagramPhotos,
      ...mapsPhotos,
    ].length === 0
  ) {
    return notFound();
  }

  const index = city ? 'city_index' : 'country_index';

  if (isRandom) {
    instagramHighLights = instagramHighLights
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    shortVideos = shortVideos
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    youtubeVideos = youtubeVideos
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    _360photos = _360photos
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    instagramPhotos = instagramPhotos.sort(
      (a, b) => randomArray.indexOf(a[index]) - randomArray.indexOf(b[index])
    );
    mapsPhotos = mapsPhotos.sort(
      (a, b) => randomArray.indexOf(a[index]) - randomArray.indexOf(b[index])
    );
    sort = 'random';
  }

  if (expandGalleries) {
    let expandedList = [];

    instagramPhotos.forEach((item) => {
      expandedList = [...expandedList, item];

      if (item.gallery && item.gallery.length) {
        expandedList = [
          ...expandedList,
          ...item.gallery.map((g, i) => ({
            ...item,
            ...g,
            is_gallery: true,
            img_index: i + 2,
          })),
        ];
      }
    });

    instagramPhotos = expandedList;
  }

  let paginationBase = null;
  const pageNumber = Math.ceil(totalPhotos / ITEMS_PER_PAGE);
  const pageMapsNumber = Math.ceil(totalMapsPhotos / ITEMS_PER_PAGE);

  paginationBase = `/countries/${country}${
    city ? '/cities/' + city : ''
  }/page/{page}${expandGalleries ? '/expand' : ''}`;
  paginationBase += sort !== 'desc' ? '?sort=' + sort : '';

  let currentPath = host('/countries/' + countryData.slug);

  const breadcrumbs = [
    {
      name: i18n(countryData.name),
      item: currentPath,
    },
  ];

  if (city) {
    currentPath += '/cities/' + city;
    breadcrumbs.push({
      name:
        isBR && cityData[city].name_pt
          ? cityData[city].name_pt
          : cityData[city].name,
      item: currentPath,
    });
  }

  if (page && page > 1) {
    currentPath += '/page/' + page;
    breadcrumbs.push({ name: i18n('Page') + ' ' + page, item: currentPath });
  }

  if (expandGalleries) {
    currentPath += '/expand';

    breadcrumbs.push({ name: i18n('Expand Galleries'), item: currentPath });
  }

  logAccess(db, currentPath + ('?sort=' + sort));

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  const sortPicker = (type) => (
    <div className="container-fluid">
      <div className="sort_picker">
        <span>{i18n('Sorting')}:</span>

        {[
          { name: 'Latest', value: 'desc' },
          { name: 'Oldest', value: 'asc' },
          { name: 'Random', value: 'random' },
        ].map((o) => (
          <Link
            key={o.value}
            href={
              o.value === 'random'
                ? sort === 'random'
                  ? paginationBase.split('?')[0].replace('/page/{page}', '')
                  : paginationBase.split('?')[0].replace('/page/{page}', '') +
                    '?sort=random&shuffle=' +
                    newShuffle
                : o.value !== 'desc'
                ? '?sort=' + o.value
                : paginationBase.split('?')[0].replace('/page/{page}', '')
            }
            scroll={false}
          >
            <label>
              <input
                type="radio"
                name={'sort-' + type}
                value={o.value}
                checked={sort === o.value}
                readOnly
              />
              {i18n(o.name)}
            </label>
          </Link>
        ))}
      </div>

      {isRandom && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link
            href={'?sort=random&shuffle=' + newShuffle}
            scroll={false}
            prefetch={false}
            className="shuffle"
          >
            <button className="btn btn-primary">{i18n('Shuffle')}</button>
          </Link>
        </div>
      )}
    </div>
  );

  let orderedDates = [];

  countryData.cities = countryData.cities.sort((a, b) => b.order - a.order);

  if (!city) {
    const dates = countryData.cities.flatMap((c) => [c.start, c.end]);
    orderedDates = dates.sort(function (a, b) {
      a = a.split('/').reverse().join('');
      b = b.split('/').reverse().join('');
      return a > b ? 1 : a < b ? -1 : 0;
    });
  }

  // @ad
  instagramPhotos = addAds(instagramPhotos);

  // @ad
  mapsPhotos = addAds(mapsPhotos);

  const locationsCacheRef = '/caches/static_pages/static_pages/locations';
  const locationsCache = await db.doc(locationsCacheRef).get();
  let locations = locationsCache
    .data()
    .locations.filter((l) => l.country === country);

  if (city) {
    locations = locations.filter((l) => l.city === city);
  }

  const mainLocations = locations
    .filter((l) => !l.hide_in_main_visited && l.total)
    .sort((a, b) => b.total - b.totals.maps - (a.total - a.totals.maps))
    .slice(0, 10);

  return (
    <div>
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

      <div className="container-fluid">
        <h2
          className={isWindows ? 'windows-header' : null}
          style={{ marginBottom: 0 }}
        >
          {city
            ? (isBR && cityData[city].name_pt
                ? cityData[city].name_pt
                : cityData[city].name) + ' - '
            : ''}
          {i18n(countryData.name)}{' '}
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
          {city
            ? expandDate(cityData[city].start, isBR) +
              ' - ' +
              expandDate(cityData[city].end, isBR)
            : expandDate(orderedDates[0], isBR) +
              ' - ' +
              expandDate(orderedDates[orderedDates.length - 1], isBR)}
        </div>
      </div>

      <ul className="nav nav-tabs">
        <Link
          className={`nav-link${!city ? ' active' : ''}`}
          aria-current="page"
          href={
            `/countries/${country}${expandGalleries ? '/expand' : ''}` +
            (sort !== 'desc' ? '?sort=' + sort : '')
          }
        >
          {i18n('All')}
        </Link>
        {countryData.cities.map((c) => (
          <li key={c.slug} className="nav-item">
            <Link
              className={`nav-link${city === c.slug ? ' active' : ''}`}
              aria-current="page"
              href={
                `/countries/${country}/cities/${c.slug}${
                  expandGalleries ? '/expand' : ''
                }` +
                (sort !== 'desc' && sort !== 'random' ? '?sort=' + sort : '')
              }
              prefetch={false}
            >
              {isBR && c.name_pt ? c.name_pt : c.name}
            </Link>
          </li>
        ))}
      </ul>

      {mainLocations.length > 0 && (
        <div className="container-fluid" style={{ marginTop: 16 }}>
          <b>{i18n('Main visited places')}</b>:{' '}
          {mainLocations.map((l, i) => (
            <span key={l.slug}>
              <Link
                href={host(
                  '/countries/' +
                    l.country +
                    '/cities/' +
                    l.city +
                    '/locations/' +
                    l.slug
                )}
                target="_blank"
              >
                {isBR && l.name_pt ? l.name_pt : l.name}
              </Link>
              {i < mainLocations.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}

      <div
        className="container"
        style={{ marginTop: 16, paddingLeft: 0, paddingRight: 0 }}
      >
        <LocationsMap
          locations={locations}
          loadingText={i18n('Loading')}
          resetZoomText={i18n('Reset Zoom')}
          apiKey={process.env.NEXT_MAPS_API_KEY}
          mapContainerStyle={{
            width: '100%',
            height: 600,
          }}
          defaultZoom={city ? cityData[city].mapZoom : countryData.mapZoom}
          withLoadButton={true}
          visitedLabel={i18n('Load visited places map')}
          centerPosition={
            city
              ? {
                  lat: cityData[city].latitude,
                  lng: cityData[city].longitude,
                }
              : {
                  lat: countryData.latitude,
                  lng: countryData.longitude,
                }
          }
        />
      </div>

      {instagramHighLights.length > 1 && sortPicker('stories')}

      <div className={styles.galleries}>
        {instagramHighLights.length > 0 && (
          <Scroller
            title="Stories"
            items={instagramHighLights}
            isInstagramHighlights
            cityData={cityData}
            sort={sort}
          />
        )}

        {shortVideos.length > 1 && sortPicker('short')}

        {shortVideos.length > 0 && (
          <Scroller
            title={i18n('Short Videos')}
            items={shortVideos}
            isShortVideos
          />
        )}

        {youtubeVideos.length > 1 && sortPicker('youtube')}

        {youtubeVideos.length > 0 && (
          <Scroller
            title={i18n('YouTube Videos')}
            items={youtubeVideos}
            isYouTubeVideos
          />
        )}

        {_360photos.length > 1 && sortPicker('360photos')}

        {_360photos.length > 0 && (
          <Scroller title={i18n('360 Photos')} items={_360photos} is360Photos />
        )}

        {/* @ad */}
        {(instagramHighLights.length > 0 ||
          shortVideos.length > 0 ||
          youtubeVideos.length > 0 ||
          _360photos.length > 0) &&
          (instagramPhotos.length >= 8 || mapsPhotos.length >= 8) && (
            <div className="container-fluid ad">
              <AdSense index={1} />
            </div>
          )}

        {instagramPhotos.filter((p) => !p.file_type).length > 1 &&
          sortPicker('photos')}

        {instagramPhotos.length > 0 && (
          <div className="container-fluid">
            <div className={styles.instagram_photos}>
              <div className={styles.instagram_photos_title}>
                <h3>{i18n('Posts')}</h3>
              </div>

              {!isRandom && pageNumber > 1 && (
                <Pagination
                  base={paginationBase}
                  currentPage={Number(page) || 1}
                  pageNumber={pageNumber}
                  total={totalPhotos}
                  textPosition="bottom"
                />
              )}

              {sort !== 'random' && (
                <div className="center_link">
                  <Link
                    href={
                      `/countries/${country}${city ? '/cities/' + city : ''}${
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
                {instagramPhotos.map((p, i) => (
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

              {isRandom && (
                <div style={{ textAlign: 'center', marginTop: 30 }}>
                  <Link
                    href={'?sort=random&shuffle=' + newShuffle}
                    scroll={false}
                    prefetch={false}
                    className="shuffle"
                  >
                    <button className="btn btn-primary">
                      {i18n('Shuffle')}
                    </button>
                  </Link>
                </div>
              )}

              {!isRandom && pageNumber > 1 && (
                <div style={{ marginTop: 30 }}>
                  <Pagination
                    base={paginationBase}
                    currentPage={Number(page) || 1}
                    pageNumber={pageNumber}
                    total={totalPhotos}
                    textPosition="top"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* @ad */}
        {instagramPhotos.length > 16 && (
          <div className="container-fluid ad" style={{ textAlign: 'center' }}>
            <AdSense index={5} />
          </div>
        )}

        {mapsPhotos.filter((p) => !p.file_type).length > 1 &&
          sortPicker('maps')}

        {mapsPhotos.length > 0 && (
          <div className="container-fluid">
            <div className={styles.instagram_photos}>
              <div className={styles.instagram_photos_title}>
                <h3>{i18n('Places Photos')}</h3>
              </div>

              {!isRandom && pageMapsNumber > 1 && (
                <Pagination
                  base={paginationBase}
                  currentPage={Number(page) || 1}
                  pageNumber={pageMapsNumber}
                  total={totalMapsPhotos}
                  textPosition="bottom"
                  label={i18n('items')}
                />
              )}

              <div className="instagram_highlights_items">
                {mapsPhotos.map((p, i) => (
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

              {isRandom && (
                <div style={{ textAlign: 'center', marginTop: 30 }}>
                  <Link
                    href={'?sort=random&shuffle=' + newShuffle}
                    scroll={false}
                    prefetch={false}
                    className="shuffle"
                  >
                    <button className="btn btn-primary">
                      {i18n('Shuffle')}
                    </button>
                  </Link>
                </div>
              )}

              {!isRandom && pageMapsNumber > 1 && (
                <div style={{ marginTop: 30 }}>
                  <Pagination
                    base={paginationBase}
                    currentPage={Number(page) || 1}
                    pageNumber={pageMapsNumber}
                    total={totalMapsPhotos}
                    textPosition="top"
                    label={i18n('items')}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* @ad */}
      <div className="container-fluid ad" style={{ textAlign: 'center' }}>
        <AdSense index={2} />
      </div>

      {breadcrumbs.length && (
        <StructuredBreadcrumbs breadcrumbs={breadcrumbs} />
      )}
    </div>
  );
}

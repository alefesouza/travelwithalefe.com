import useI18n from '../../hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from '../page.module.css';
import {
  ITEMS_PER_PAGE,
  SITE_NAME,
  USE_CACHE,
  WEBSTORIES_ITEMS_PER_PAGE,
} from '@/app/utils/constants';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import Scroller from '@/app/components/scroller';
import randomIntFromInterval from '@/app/utils/random-int';
import ShareButton from '@/app/components/share-button';
import logAccess from '@/app/utils/log-access';
import defaultMetadata from '@/app/utils/default-metadata';
import expandDate from '@/app/utils/expand-date';
import LocationsMap from '@/app/components/locations-map';
import { notFound } from 'next/navigation';
import useEditMode from '@/app/utils/use-edit-mode';
import { cachedCities, cachedCountries } from '@/app/utils/cache-data';
import { cachedMedias } from '@/app/utils/cache-medias';
import { theCachedLocations } from '@/app/utils/cache-locations';
import { getDataFromRoute, getCountry } from '@/app/utils/route-helpers';
import { sortMediaArrays } from '@/app/utils/media-sorting';
import {
  fetchMediasFromCache,
  fetchMediasFromFirestore,
} from '@/app/utils/media-fetcher';
import {
  expandMediaGalleries,
  paginateMedia,
  buildPaginationBase,
  getOrderedDates,
  getMainLocations,
} from '@/app/utils/media-helpers';
import SortPicker from '@/app/components/sort-picker';
import CityTabs from '@/app/components/city-tabs';
import MainLocations from '@/app/components/main-locations';
import MediaSection from '@/app/components/media-section';
import RandomPostButton from '@/app/components/random-post-button';

export async function generateMetadata({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}) {
  const { slug } = await paramsPromise;
  const searchParams = await searchParamsPromise;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = process.env.NEXT_PUBLIC_LOCALE === 'pt-BR';

  const countryData = getCountry(slug, searchParams);

  if (!countryData) {
    return notFound();
  }

  let { city, country, page } = getDataFromRoute(slug, searchParams);

  if (
    !cachedCountries.includes(country) ||
    (city && !cachedCities.includes(city))
  ) {
    return notFound();
  }

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

  let cover = null;
  let coverSnapshot = null;

  if (USE_CACHE) {
    if (city) {
      cover = cachedMedias.find(
        (m) =>
          m.country === countryData.slug && m.city === city && m.is_highlight
      );
    } else {
      const countryMedias = cachedMedias.filter(
        (m) => m.country === countryData.slug && m.is_highlight
      );
      countryMedias.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      cover = countryMedias[0];
    }
  } else {
    const db = getFirestore();
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
  }

  let maxPages = null;

  if (theCity) {
    maxPages = Math.ceil(theCity.total / WEBSTORIES_ITEMS_PER_PAGE);
  }

  return {
    ...defaultMetadata(
      title,
      description,
      `countries/${slug.join('/')}`,
      cover
    ),
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

export default async function Country({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}) {
  const { slug } = await paramsPromise;
  const searchParams = await searchParamsPromise;

  const i18n = useI18n();
  const host = useHost();
  const isBR = process.env.NEXT_PUBLIC_LOCALE === 'pt-BR';
  const editMode = await useEditMode(searchParams);

  if (slug.length > 6) {
    return notFound();
  }

  const countryData = getCountry(slug, searchParams);

  if (!countryData) {
    return notFound();
  }

  let { country, city, page, sort, expandGalleries } = getDataFromRoute(
    slug,
    searchParams
  );

  if (
    !cachedCountries.includes(country) ||
    (city && !cachedCities.includes(city))
  ) {
    return notFound();
  }

  const cityData = countryData.cities.reduce((prev, curr) => {
    prev[curr.slug] = curr;
    return prev;
  }, {});

  if (city && !cityData[city]) {
    return notFound();
  }

  const totalPhotos = city
    ? cityData[city]?.totals?.posts
    : countryData?.totals?.posts;

  const totalMapsPhotos = city
    ? cityData[city]?.totals?.maps
    : countryData?.totals?.maps;

  // Fetch medias based on cache mode
  let medias;
  if (USE_CACHE) {
    medias = fetchMediasFromCache(country, city, page);
  } else {
    const db = getFirestore();
    medias = await fetchMediasFromFirestore(
      db,
      country,
      city,
      page,
      sort,
      totalPhotos,
      totalMapsPhotos
    );
  }

  let {
    instagramHighLights,
    shortVideos,
    youtubeVideos,
    _360photos,
    instagramPhotos,
    mapsPhotos,
  } = medias;

  // Apply sorting
  const mediaArrays = [
    instagramHighLights,
    shortVideos,
    youtubeVideos,
    _360photos,
    instagramPhotos,
    mapsPhotos,
  ];

  if (sort === 'desc' || sort === 'asc') {
    [
      instagramHighLights,
      shortVideos,
      youtubeVideos,
      _360photos,
      instagramPhotos,
      mapsPhotos,
    ] = sortMediaArrays(mediaArrays, sort);
  }

  // Apply pagination
  instagramPhotos = paginateMedia(instagramPhotos, page);
  mapsPhotos = paginateMedia(mapsPhotos, page);

  // Check if any content exists
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

  // Expand galleries if needed
  if (expandGalleries) {
    instagramPhotos = expandMediaGalleries(instagramPhotos);
  }

  // Expand galleries if needed
  if (expandGalleries) {
    instagramPhotos = expandMediaGalleries(instagramPhotos);
  }

  // Build pagination
  const pageNumber = Math.ceil(totalPhotos / ITEMS_PER_PAGE);
  const pageMapsNumber = Math.ceil(totalMapsPhotos / ITEMS_PER_PAGE);
  const paginationBase = buildPaginationBase(
    country,
    city,
    expandGalleries,
    sort
  );

  // Build breadcrumbs
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

  logAccess(currentPath + ('?sort=' + sort));

  const newShuffle = !USE_CACHE ? randomIntFromInterval(1, 15) : null;

  // Sort cities and get ordered dates
  countryData.cities = countryData.cities.sort((a, b) => b.order - a.order);
  const orderedDates = city ? [] : getOrderedDates(countryData.cities);

  // Get locations
  let locations = [];
  if (USE_CACHE) {
    locations = theCachedLocations.filter((l) => l.country === country);
  } else {
    const db = getFirestore();
    const locationsCacheRef = '/caches/static_pages/static_pages/locations';
    const locationsCache = await db.doc(locationsCacheRef).get();
    locations = locationsCache
      .data()
      .locations.filter((l) => l.country === country);
  }

  if (city) {
    const theCity = cityData[city];
    if (theCity.main_city) {
      locations = locations.filter((l) => l.city === theCity.main_city);
    } else {
      locations = locations.filter((l) => l.city === city);
    }
  }

  const mainLocations = getMainLocations(locations);

  return (
    <div>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link
            href={city ? `/countries/${country}` : `/`}
            id="back-button"
            scroll={false}
            prefetch={false}
          >
            <img
              src={host('/images/back.svg')}
              alt={i18n('Back')}
              width="32px"
            ></img>
          </Link>

          <RandomPostButton text={i18n('Random post')} />

          <ShareButton />
        </div>
      </div>

      <div className="container-fluid">
        <h2 style={{ marginBottom: 0 }}>
          {city
            ? (isBR && cityData[city].name_pt
                ? cityData[city].name_pt
                : cityData[city].name) + ' - '
            : ''}
          {i18n(countryData.name)}{' '}
          <span
            className="country-emoji-flag"
            data-country-slug={countryData.slug}
            data-country-name={i18n(countryData.name)}
            suppressHydrationWarning
          >
            {countryData.flag}
          </span>
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

      <CityTabs
        countrySlug={country}
        cities={countryData.cities}
        currentCity={city}
        expandGalleries={expandGalleries}
        sort={sort}
        i18n={i18n}
        isBR={isBR}
      />

      <MainLocations
        locations={mainLocations}
        i18n={i18n}
        isBR={isBR}
        host={host}
      />

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

      {instagramHighLights.length > 1 && (
        <SortPicker
          i18n={i18n}
          sort={sort}
          paginationBase={paginationBase}
          type="stories"
          newShuffle={newShuffle}
          useCache={USE_CACHE}
        />
      )}

      <div className={styles.galleries}>
        {instagramHighLights.length > 0 && (
          <Scroller
            title="Stories"
            items={instagramHighLights}
            isInstagramHighlights
            cityData={cityData}
            sort={sort}
            editMode={editMode}
          />
        )}

        {shortVideos.length > 1 && (
          <SortPicker
            i18n={i18n}
            sort={sort}
            paginationBase={paginationBase}
            type="short"
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
          />
        )}

        {youtubeVideos.length > 1 && (
          <SortPicker
            i18n={i18n}
            sort={sort}
            paginationBase={paginationBase}
            type="youtube"
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
          />
        )}

        {_360photos.length > 1 && (
          <SortPicker
            i18n={i18n}
            sort={sort}
            paginationBase={paginationBase}
            type="360photos"
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
          />
        )}

        {instagramPhotos.filter((p) => !p.file_type).length > 1 && (
          <SortPicker
            i18n={i18n}
            sort={sort}
            paginationBase={paginationBase}
            type="photos"
            newShuffle={newShuffle}
            useCache={USE_CACHE}
          />
        )}

        {instagramPhotos.length > 0 && (
          <MediaSection
            title={i18n('Posts')}
            medias={instagramPhotos}
            isBR={isBR}
            expandGalleries={expandGalleries}
            editMode={editMode}
            page={page}
            paginationBase={paginationBase}
            pageNumber={pageNumber}
            total={totalPhotos}
            i18n={i18n}
            country={country}
            city={city}
            sort={sort}
            newShuffle={newShuffle}
            useCache={USE_CACHE}
          />
        )}

        {mapsPhotos.filter((p) => !p.file_type).length > 1 && (
          <SortPicker
            i18n={i18n}
            sort={sort}
            paginationBase={paginationBase}
            type="maps"
            newShuffle={newShuffle}
            useCache={USE_CACHE}
          />
        )}

        {mapsPhotos.length > 0 && (
          <MediaSection
            title={i18n('Places Photos')}
            medias={mapsPhotos}
            isBR={isBR}
            expandGalleries={expandGalleries}
            editMode={editMode}
            page={page}
            paginationBase={paginationBase}
            pageNumber={pageMapsNumber}
            total={totalMapsPhotos}
            i18n={i18n}
            country={country}
            city={city}
            sort={sort}
            newShuffle={newShuffle}
            useCache={USE_CACHE}
            label={i18n('items')}
          />
        )}
      </div>

      {breadcrumbs.length && (
        <StructuredBreadcrumbs breadcrumbs={breadcrumbs} />
      )}
    </div>
  );
}

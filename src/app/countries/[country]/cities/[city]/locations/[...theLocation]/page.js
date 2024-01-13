import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { SITE_NAME } from '@/app/utils/constants';
import Scroller from '@/app/components/scroller';
import { redirect } from 'next/navigation';
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

async function getCountry(country, city) {
  const db = getFirestore();
  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (!countryData) {
    redirect('/');
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
  const isWebStories = theLocation[1] === 'webstories';

  if (
    theLocation.length > 2 ||
    (theLocation[1] &&
      theLocation[1] !== 'expand' &&
      theLocation[1] !== 'webstories')
  ) {
    redirect(
      `/countries/${country}/cities/${city}/locations/${theLocation[0]}`
    );
  }

  const countryData = await getCountry(country, city);

  if (!countryData) {
    redirect('/');
  }

  let theCity = null;

  if (city) {
    theCity = countryData.cities.find((c) => c.slug === city);
  }

  if (!theCity) {
    redirect('/');
  }

  const location = decodeURIComponent(theLocation[0]);

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
    redirect(`/countries/${country}/cities/${city}`);
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
    finalLocation,
    isWebStories ? 'Web Stories' : '',
    SITE_NAME,
  ]
    .filter((c) => c)
    .join(' - ');
  const description = i18n(
    'Photos and videos taken by Viajar com Alê in :location:',
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
    redirect(`/countries/${country}/cities/${city}`);
  }

  return {
    ...defaultMetadata(title, description, cover),
    ...(!isWebStories
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
                  location
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

  const [queryLocation, expand] = theLocation;
  const location = decodeURIComponent(queryLocation);

  const expandGalleries = expand === 'expand';
  let sort = getSort(searchParams, theLocation[1] === 'webstories');

  const countryData = await getCountry(country, city);

  if (!countryData) {
    redirect('/');
  }

  let theCity = countryData.cities.find((c) => c.slug === city);

  const cacheRef = `/caches/locations/locations-cache/${city}-${location}/sort/${
    sort === 'asc' ? 'asc' : 'desc'
  }`;

  const db = getFirestore();
  const cache = await db.doc(cacheRef).get();
  // const cache = { exists: false };

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

  const isWebStories = theLocation[1] === 'webstories';

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
      redirect(`/countries/${country}/cities/${city}`);
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
      (expand ? '/expand' : '') +
      ('?sort=' + sort)
  );

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  const basePath = `/countries/${country}/cities/${city}/locations/${location}`;

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
            key={o}
            href={
              o.value === 'random'
                ? sort === 'random'
                  ? basePath
                  : basePath + '?sort=random&shuffle=' + newShuffle
                : o.value !== 'desc'
                ? '?sort=' + o.value
                : basePath
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
    </div>
  );

  let instagramPhotos = photos.filter(
    (p) => p.type === 'post' || p.type === 'post-gallery'
  );
  const instagramStories = photos.filter((p) => p.type === 'story');
  const shortVideos = photos.filter((p) => p.type === 'short-video');
  const youtubeVideos = photos.filter((p) => p.type === 'youtube');
  const _360photos = photos.filter((p) => p.type === '360photo');
  const mapsPhotos = photos.filter((p) => p.type === 'maps');

  if (sort == 'desc') {
    instagramStories.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  } else if (sort == 'asc') {
    instagramStories.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  }

  let expandedList = [];

  instagramPhotos.forEach((item) => {
    expandedList = [...expandedList, item];

    if (item.gallery && item.gallery.length) {
      const gallery = item.gallery.map((g, i) => ({
        ...item,
        ...g,
        is_gallery: true,
        img_index: i + 2,
      }));
      const itemWithLocation = gallery.findIndex(
        (g) => g.item_locations && g.item_locations.includes(location)
      );

      if (itemWithLocation > -1) {
        delete gallery[itemWithLocation].is_gallery;
        expandedList[expandedList.length - 1] = gallery[itemWithLocation];

        item.file_type = 'image';
        gallery[itemWithLocation] = item;
      }

      if (expandGalleries || (isWebStories && !item.is_compilation)) {
        expandedList = [...expandedList, ...gallery];
      }
    }
  });

  instagramPhotos = expandedList;

  if (expand == 'webstories') {
    const title = [
      (isBR && theMedia.name_pt ? theMedia.name_pt : theMedia.name) +
        (theMedia.alternative_names
          ? ' (' + theMedia.alternative_names.join(', ') + ')'
          : ''),
      isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
      i18n(countryData.name),
    ].join(' - ');

    return (
      <WebStories
        title={title}
        storyTitle={title}
        items={[
          ...instagramStories,
          ...instagramPhotos,
          ..._360photos,
          ...youtubeVideos,
          ...shortVideos,
          ...mapsPhotos,
        ]}
        countryData={countryData}
        isLocation
      />
    );
  }

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

  if (expandGalleries) {
    breadcrumbs.push({
      name: i18n('Expand Galleries'),
      item: `/countries/${country}/cities/${city}/locations/${theMedia.slug}/expand`,
    });
  }

  const dates = instagramStories.flatMap((c) => c.date);
  const orderedDates = dates.sort(function (a, b) {
    a = a.split('/').reverse().join('');
    b = b.split('/').reverse().join('');
    return a > b ? 1 : a < b ? -1 : 0;
  });

  const webStoriesHref = host(
    '/webstories/countries/' +
      country +
      '/cities/' +
      city +
      '/locations/' +
      location
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

      <div className={styles.galleries}>
        {instagramStories.length > 1 && sortPicker('stories')}

        {instagramStories.length > 0 && (
          <Scroller
            title="Stories"
            items={instagramStories}
            isStories
            webStoriesHref={webStoriesHref}
            sort={sort}
          />
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

        {mapsPhotos.filter((p) => !p.file_type).length > 1 &&
          sortPicker('maps')}

        {mapsPhotos.filter((p) => !p.file_type).length > 0 && (
          <div className="container-fluid">
            <div className={styles.instagram_photos}>
              <div className={styles.instagram_photos_title}>
                <h3>{i18n('Place Photos')}</h3>
              </div>

              <div className="instagram_highlights_items">
                {mapsPhotos.map((p) => (
                  <Media
                    key={p.id}
                    media={p}
                    isBR={isBR}
                    expandGalleries={expandGalleries}
                    isListing
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

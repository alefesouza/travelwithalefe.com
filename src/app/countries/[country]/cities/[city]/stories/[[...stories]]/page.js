import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import {
  SITE_NAME,
  USE_CACHE,
  WEBSTORIES_ITEMS_PER_PAGE,
} from '@/app/utils/constants';
import { notFound, redirect } from 'next/navigation';
import Media from '@/app/components/media';
import ShareButton from '@/app/components/share-button';
import randomIntFromInterval from '@/app/utils/random-int';
import WebStories from '@/app/components/webstories';
import logAccess from '@/app/utils/log-access';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import defaultMetadata from '@/app/utils/default-metadata';
import { headers } from 'next/headers';
import Country, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';
import { UAParser } from 'ua-parser-js';
import expandDate from '@/app/utils/expand-date';
import useEditMode from '@/app/utils/use-edit-mode';
import countries from '@/app/utils/countries';
import { cachedMedias } from '@/app/utils/cache-medias';
import { getCountry } from '@/app/utils/route-helpers';
import {
  sortByDateDesc,
  sortByDateAsc,
  shuffleArray,
} from '@/app/utils/media-sorting';
import { isBrazilianHost } from '@/app/utils/locale-helpers';
import {
  fetchStories,
  expandPostsForWebStories,
} from '@/app/utils/stories-helpers';
import SortPicker from '@/app/components/sort-picker';
import getSort from '@/app/utils/get-sort';

export async function generateMetadata({ params: { country, city, stories } }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = isBrazilianHost(host());
  const isWebStories = stories && stories[stories.length - 1] === 'webstories';

  const countryData = getCountry([country, 'cities', city], {});

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

  let theMedia = null;

  const db = getFirestore();

  if (USE_CACHE) {
    theMedia = cachedMedias.find(
      (m) =>
        m.country === country &&
        m.city === city &&
        m.type === 'story' &&
        m.is_highlight
    );
  } else {
    const instagramHighLightsSnapshot = await db
      .collection('countries')
      .doc(country)
      .collection('cities')
      .doc(city)
      .collection('medias')
      .where('type', '==', 'story')
      .where('is_highlight', '==', true)
      .get();

    instagramHighLightsSnapshot.forEach((media) => {
      const data = media.data();
      theMedia = data;
    });
  }

  if (stories && stories[stories.length - 1] !== 'webstories') {
    return generateMediaMetadata({
      params: {
        country,
        city,
        media: [city + '-story-' + stories[0]],
      },
    });
  }

  if (stories) {
    if (
      stories.length > 3 ||
      stories[stories.length - 1] !== 'webstories' ||
      (stories[0] !== 'webstories' &&
        stories[0] !== 'page' &&
        isNaN(stories[0])) ||
      (stories[0] !== 'webstories' && isNaN(stories[1]))
    ) {
      redirect(`/countries/${country}/cities/${city}/stories`);
    }
  }

  const location = [
    isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
    i18n(countryData.name),
  ].join(' - ');
  const title = [location, isWebStories ? 'Web Stories' : '', i18n(SITE_NAME)]
    .filter((c) => c)
    .join(' - ');
  const description = i18n('Travel with Alefe stories in :location:', {
    location: isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
  });

  return {
    ...defaultMetadata(title, description, theMedia),
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
                  '/stories'
              ),
            },
          },
        }
      : null),
  };
}

export default async function Highlight({
  params: { country, city, stories },
  searchParams,
}) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = isBrazilianHost(host());
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';
  const editMode = useEditMode(searchParams);

  const isWebStories = stories && stories[stories.length - 1] === 'webstories';
  let sort = getSort(searchParams, isWebStories, false, 'asc');

  const countryData = getCountry([country, 'cities', city], searchParams);

  if (!countryData) {
    return notFound();
  }

  let theCity = countryData.cities.find((c) => c.slug === city);

  if (stories && stories[stories.length - 1] !== 'webstories') {
    return MediaPage({
      params: {
        country,
        city,
        media: [city + '-story-' + stories[0]],
      },
      searchParams,
    });
  }

  let cache = null;
  let cacheRef = null;

  if (!USE_CACHE) {
    cacheRef = `/caches/stories/stories-cache/${theCity.slug}/sort/${
      sort === 'asc' ? 'asc' : 'desc'
    }`;

    const db = getFirestore();

    if (editMode) {
      cache = { exists: false };
    } else {
      cache = await db.doc(cacheRef).get();
    }
  }

  let isRandom = sort === 'random';

  if (isRandom) {
    sort = 'desc';
  }

  let photos = await fetchStories(
    USE_CACHE,
    country,
    city,
    isWebStories,
    sort,
    isRandom,
    cache,
    cacheRef
  );

  if (!photos.length) {
    return notFound();
  }

  if (isRandom) {
    photos = shuffleArray(photos);
    sort = 'random';
  }

  logAccess(
    host((isWebStories ? '/webstories' : '') + '/stories/') +
      theCity.slug +
      ('?sort=' + sort)
  );

  let instagramStories = photos.filter((p) => p.type === 'story');

  if (isWebStories) {
    const posts = photos.filter((p) => p.type === 'post');
    const expandedList = expandPostsForWebStories(posts);

    const page =
      stories[0] === 'page' && !isNaN(stories[1]) ? Number(stories[1]) : 1;

    const storyTitle = [
      isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
      i18n(countryData.name),
    ].join(' - ');

    const _360photos = photos.filter((p) => p.type === '360photo');
    const shortVideos = photos.filter((p) => p.type === 'short-video');
    const videos = photos.filter((p) => p.type === 'youtube');
    const maps = photos.filter((p) => p.type === 'maps');

    const allItems = [
      ...instagramStories,
      ...expandedList,
      ..._360photos,
      ...shortVideos,
      ...videos,
      ...maps,
    ];

    const maxPages = Math.max(posts.length, maps.length);

    let items = [];

    items = allItems.slice(
      (page - 1) * WEBSTORIES_ITEMS_PER_PAGE,
      page * WEBSTORIES_ITEMS_PER_PAGE
    );

    const previousPageItem = allItems[(page - 2) * WEBSTORIES_ITEMS_PER_PAGE];
    const nextPageItem = allItems[page * WEBSTORIES_ITEMS_PER_PAGE];

    return (
      <WebStories
        title={storyTitle}
        storyTitle={storyTitle}
        items={items.filter((c) => !c.rss_ignore)}
        previousPageItem={previousPageItem}
        nextPageItem={nextPageItem}
        page={page}
        maxPages={maxPages}
        path={`/webstories/countries/${country}/cities/${city}`}
        firstPagePath={`/webstories/countries/${country}/cities/${city}/stories`}
        countryData={countryData}
      />
    );
  }

  let newShuffle = randomIntFromInterval(1, 15);

  if (newShuffle == searchParams.shuffle) {
    newShuffle = randomIntFromInterval(1, 15);
  }

  const basePath = '/countries/' + country + '/cities/' + city + '/stories';

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
      name: 'Stories',
      item: basePath,
    },
  ];

  return (
    <div>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link
            href={'/countries/' + country + '/cities/' + city}
            id="back-button"
            className={styles.history_back_button}
            scroll={false}
          >
            <img src="/images/back.svg" alt={i18n('Back')} width="32px"></img>
          </Link>

          <div style={{ display: 'flex', gap: 16 }}>
            {
              <a
                href={host(
                  '/webstories/countries/' +
                    country +
                    '/cities/' +
                    city +
                    '/stories' +
                    (sort !== 'asc' ? '?sort=' + sort : '')
                )}
                target="_blank"
                title={i18n('Play')}
              >
                <img
                  src={host('/images/play.svg')}
                  width={32}
                  height={32}
                  alt={i18n('Play')}
                />
              </a>
            }
            <ShareButton />
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <h2
          style={{ marginBottom: 0 }}
          className={isWindows ? 'windows-header' : null}
        >
          {i18n('Stories')} -{' '}
          <Link
            href={'/countries/' + country + '/cities/' + city}
            scroll={false}
            prefetch={false}
            style={{ textDecoration: 'underline' }}
          >
            {isBR && theCity.name_pt ? theCity.name_pt : theCity.name}
          </Link>{' '}
          -{' '}
          <Link
            href={'/countries/' + country}
            scroll={false}
            prefetch={false}
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
          {expandDate(theCity.start, isBR)} - {expandDate(theCity.end, isBR)}
        </div>
      </div>

      <div className="center_link" style={{ marginTop: 28 }}>
        <a
          href={host(
            '/webstories/countries/' +
              country +
              '/cities/' +
              city +
              '/stories' +
              (sort !== 'asc' ? '?sort=' + sort : '')
          )}
          target="_blank"
        >
          {i18n('Open in Stories format')}
        </a>
      </div>

      <div className={styles.galleries}>
        {instagramStories.filter((p) => !p.file_type).length > 1 && (
          <SortPicker
            i18n={i18n}
            sort={sort}
            paginationBase={basePath}
            type="stories"
            isRandom={isRandom}
            newShuffle={newShuffle}
            useCache={USE_CACHE}
          />
        )}

        {instagramStories.filter((p) => !p.file_type).length > 0 && (
          <div className="container-fluid">
            <div className={styles.instagram_photos}>
              <div className={styles.instagram_photos_title}>
                <h3>{i18n('Stories')}</h3>
              </div>

              <div className="instagram_highlights_items">
                {instagramStories.map((p) => (
                  <Media
                    media={p}
                    isBR={isBR}
                    key={p.id}
                    hasPoster
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

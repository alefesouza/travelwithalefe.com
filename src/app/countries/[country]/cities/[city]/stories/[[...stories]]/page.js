import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { SITE_NAME, WEBSTORIES_ITEMS_PER_PAGE } from '@/app/utils/constants';
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
// @ad
import AdSense from '@/app/components/adsense';
import addAds from '@/app/utils/add-ads';
import useEditMode from '@/app/utils/use-edit-mode';

async function getCountry(country, city) {
  const db = getFirestore();
  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (city && !countryData.cities.find((c) => c.slug === city)) {
    return false;
  }

  return countryData;
}

export async function generateMetadata({ params: { country, city, stories } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWebStories = stories && stories[stories.length - 1] === 'webstories';

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

  let theMedia = null;

  const db = getFirestore();

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
  const isBR = host().includes('viajarcomale.com.br');
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';
  const editMode = useEditMode(searchParams);

  let sort =
    (searchParams.sort &&
      ['asc', 'desc', 'random'].includes(searchParams.sort) &&
      searchParams.sort) ||
    'asc';

  const countryData = await getCountry(country, city);

  if (!countryData) {
    return notFound();
  }

  let theCity = countryData.cities.find((c) => c.slug === city);

  if (stories && stories[stories.length - 1] !== 'webstories') {
    return Country({
      params: {
        country,
        city,
        media: [city + '-story-' + stories[0]],
      },
      searchParams,
    });
  }

  const cacheRef = `/caches/stories/stories-cache/${theCity.slug}/sort/${
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
  const isWebStories = stories && stories[stories.length - 1] === 'webstories';

  if (isRandom) {
    sort = 'desc';
  }

  let photos = [];

  if (!cache.exists || isWebStories) {
    let photosSnapshot = await db
      .collection('countries')
      .doc(country)
      .collection('cities')
      .doc(city)
      .collection('medias');

    if (!isWebStories) {
      photosSnapshot = photosSnapshot.where('type', '==', 'story');
    }

    photosSnapshot = await photosSnapshot.orderBy('order', sort).get();

    photosSnapshot.forEach((photo) => {
      const data = photo.data();
      data.path = photo.ref.path;

      if (data.type === 'story') {
        data.link =
          'https://www.instagram.com/stories/highlights/' +
          data.original_id +
          '/';
      }

      photos = [...photos, data];
    });

    if (!photos.length) {
      return notFound();
    }

    if (!isRandom && !isWebStories && !cache.exists) {
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
    host((isWebStories ? '/webstories' : '') + '/stories/') +
      theCity.slug +
      ('?sort=' + sort)
  );

  let instagramStories = photos.filter((p) => p.type === 'story');

  if (isWebStories) {
    let expandedList = [];
    let posts = photos.filter((p) => p.type === 'post');

    posts.forEach((item) => {
      expandedList = [...expandedList, item];

      if (item.gallery && item.gallery.length) {
        const gallery = item.gallery.map((g, i) => ({
          ...item,
          ...g,
          is_gallery: true,
          img_index: i + 2,
        }));
        const itemWithHashtag = gallery.findIndex((g) => g.item_hashtags);

        if (itemWithHashtag > -1) {
          delete gallery[itemWithHashtag].is_gallery;
          expandedList[expandedList.length - 1] = gallery[itemWithHashtag];

          item.file_type = 'image';
          gallery[itemWithHashtag] = item;
        }

        if (posts.length <= 5 || item.is_compilation) {
          expandedList = [...expandedList, ...gallery];
        } else if (gallery.some((g) => g.rss_include)) {
          expandedList = [
            ...expandedList,
            ...gallery.filter((g) => g.rss_include),
          ];
        }
      }
    });

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

  // @ad
  instagramStories = addAds(instagramStories);

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
                : o.value !== 'asc'
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
        {instagramStories.filter((p) => !p.file_type).length > 1 &&
          sortPicker('photos')}

        {instagramStories.filter((p) => !p.file_type).length > 0 && (
          <div className="container-fluid">
            <div className={styles.instagram_photos}>
              <div className={styles.instagram_photos_title}>
                <h3>{i18n('Stories')}</h3>
              </div>

              <div className="instagram_highlights_items">
                {instagramStories.map((p) => (
                  <div key={p.id} className={p.type === 'ad' ? 'row-ad' : null}>
                    {/* @ad */}
                    {p.type === 'ad' ? (
                      <AdSense index={p.id} />
                    ) : (
                      <Media
                        media={p}
                        isBR={isBR}
                        key={p.id}
                        hasPoster
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

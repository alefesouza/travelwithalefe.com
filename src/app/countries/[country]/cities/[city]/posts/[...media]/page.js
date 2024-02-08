import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import { getFirestore } from 'firebase-admin/firestore';
import styles from './page.module.css';
import { permanentRedirect, redirect } from 'next/navigation';
import Media from '@/app/components/media';
import Link from 'next/link';
import ShareButton from '@/app/components/share-button';
import StructuredBreadcrumbs from '@/app/components/structured-breadcrumbs';
import Script from 'next/script';
import Pagination from '@/app/components/pagination';
import getMetadata from '@/app/utils/get-metadata';
import defaultMetadata from '@/app/utils/default-metadata';
import logAccess from '@/app/utils/log-access';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import expandDate from '@/app/utils/expand-date';
import getTypePath from '@/app/utils/get-type-path';
/* @ad */
import AdSense from '@/app/components/adsense';
import getTypeLabel from '@/app/utils/get-type-label';

async function getCountry(country, city) {
  const db = getFirestore();
  const countryDoc = await db.collection('countries').doc(country).get();
  const countryData = countryDoc.data();

  if (city && !countryData.cities.find((c) => c.slug === city)) {
    return false;
  }

  return countryData;
}

function getSelectedMedia(media, theMedia, country, city) {
  let mediaIndex = null;

  if (media[1]) {
    mediaIndex = parseInt(media[1]);

    if (
      mediaIndex != media[1] ||
      mediaIndex < 1 ||
      (!theMedia.gallery && mediaIndex > 1) ||
      mediaIndex > (theMedia.gallery || []).length + 1
    ) {
      redirect(
        '/countries/' + country + '/cities/' + city + '/posts/' + media[0]
      );
    }

    if (mediaIndex !== 1) {
      theMedia = theMedia.gallery[mediaIndex - 2];
      delete theMedia.is_gallery;
    }

    delete theMedia.gallery;
  }

  return {
    mediaIndex,
    selectedMedia: theMedia,
  };
}

export async function generateMetadata({ params: { country, city, media } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

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

  const db = getFirestore();
  const mediaRef = await db
    .collection('countries')
    .doc(country)
    .collection('cities')
    .doc(city)
    .collection('medias')
    .doc(media[0].includes(city + '-') ? media[0] : city + '-post-' + media[0])
    .get();
  let theMedia = mediaRef.data();

  if (!theMedia) {
    redirect('/countries/' + country + '/cities/' + city);
  }

  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({
      ...theMedia,
      ...g,
      is_gallery: true,
      img_index: i + 2,
    }));
  }

  const { selectedMedia } = getSelectedMedia(media, theMedia, country, city);

  theMedia = selectedMedia;

  const { title, description } = getMetadata(theMedia, isBR);

  return defaultMetadata(
    title,
    description,
    theMedia,
    media[1] ||
      theMedia.type === 'story' ||
      theMedia.type === 'youtube' ||
      theMedia.type === 'short-video' ||
      theMedia.type === '360-photo' ||
      theMedia.type === 'maps'
  );
}

export default async function Country({ params: { country, city, media } }) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';

  if (media.length > 2) {
    redirect(
      `/countries/${country}/cities/${city}/posts/${media[0]}/${media[1]}`
    );
  }

  const db = getFirestore();

  if (
    !media[0].includes(city + '-story-') &&
    !media[0].includes(city + '-youtube-') &&
    !media[0].includes(city + '-short-video-') &&
    !media[0].includes(city + '-360photo-') &&
    !media[0].includes(city + '-maps-') &&
    isNaN(parseInt(media[0]))
  ) {
    let base = '/countries/' + country + '/cities/' + city;

    const mediaSnapshot = await db
      .collection('countries')
      .doc(country)
      .collection('cities')
      .doc(city)
      .collection('medias')
      .where('original_id', '==', media[0])
      .get();

    if (mediaSnapshot.size == 0) {
      redirect(base);
    }

    mediaSnapshot.forEach((doc) => {
      const data = doc.data();

      permanentRedirect(
        base +
          '/posts/' +
          data.id.replace(city + '-post-', '') +
          (media[1] ? '/' + media[1] : '')
      );
    });

    return;
  }

  const countryData = await getCountry(country, city);

  if (!countryData) {
    redirect('/');
  }

  let theCity = countryData.cities.find((c) => c.slug === city);

  if (!theCity) {
    redirect('/');
  }

  const mediaRef = await db
    .collection('countries')
    .doc(country)
    .collection('cities')
    .doc(city)
    .collection('medias')
    .doc(media[0].includes(city + '-') ? media[0] : city + '-post-' + media[0])
    .get();
  let theMedia = mediaRef.data();

  if (!theMedia) {
    redirect('/countries/' + country + '/cities/' + city);
  }

  theMedia.path = mediaRef.ref.path;

  let galleryLength = 0;

  if (theMedia.gallery && theMedia.gallery.length) {
    theMedia.gallery = theMedia.gallery.map((g, i) => ({
      ...theMedia,
      ...g,
      is_gallery: true,
      img_index: i + 2,
    }));
    galleryLength = theMedia.gallery.length + 1;
  }

  const { mediaIndex, selectedMedia } = getSelectedMedia(
    media,
    theMedia,
    country,
    city
  );
  theMedia = selectedMedia;

  const { shortDescription, locationDescription, cityDescription } =
    getMetadata(theMedia);

  const breadcrumbs = [
    {
      name: i18n(countryData.name),
      item: '/countries/' + country,
    },
    {
      name: isBR && theCity.name_pt ? theCity.name_pt : theCity.name,
      item: '/countries/' + country + '/cities/' + city,
    },
  ];

  if (theMedia.type === 'story') {
    breadcrumbs.push({
      name: i18n('Stories'),
      item: '/countries/' + country + '/cities/' + city + '/stories',
    });
  }

  const split = theMedia.id.split('-');
  let mediaId = split[split.length - 1];

  const mainPath =
    '/countries/' +
    country +
    '/cities/' +
    city +
    '/' +
    getTypePath(theMedia.type) +
    '/';
  const basePath = mainPath + mediaId;

  breadcrumbs.push({
    name:
      [shortDescription, locationDescription].filter((c) => c).join(' - ') ||
      cityDescription,
    item: basePath,
  });

  if (media[1]) {
    breadcrumbs.push({
      name: 'Item ' + media[1],
      item: basePath + '/' + media[1],
    });
  }

  const paginationBase = basePath + '/{page}';

  logAccess(
    db,
    host(
      '/' +
        city +
        '/' +
        getTypePath(theMedia.type) +
        '/' +
        mediaId +
        (media[1] ? '/' + media[1] : '')
    )
  );

  const header = (
    <div
      style={{
        marginBottom: media[1] || theMedia.type === 'story' ? null : '0.83em',
      }}
    >
      <h2
        className={isWindows ? 'windows-header' : null}
        style={{
          justifyContent:
            media[1] || theMedia.type === 'story' ? 'center' : null,
          marginBottom: 0,
        }}
      >
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
  );

  const isSingleMedia =
    media[1] ||
    theMedia.type === 'story' ||
    theMedia.type === 'youtube' ||
    theMedia.type === 'short-video' ||
    theMedia.type === '360photo' ||
    theMedia.type === 'maps';

  return (
    <>
      <div className="container">
        <div className="media_navigation">
          <Link
            href={
              '/countries/' +
              country +
              '/cities/' +
              city +
              (theMedia.type === 'story' ? '/stories' : '') +
              (mediaIndex
                ? '/posts/' + theMedia.id.replace(city + '-post-', '')
                : '')
            }
            id="back-button"
            scroll={false}
            prefetch={false}
          >
            <img src="/images/back.svg" alt={i18n('Back')} width="32px"></img>
          </Link>

          <ShareButton />
        </div>

        {!isSingleMedia && <div>{header}</div>}
      </div>

      <div
        className={
          (isSingleMedia ? 'container-fluid ' : 'container ') + styles.media
        }
        style={{
          marginTop:
            media[1] || theMedia.type === 'story' || theMedia.type === 'maps'
              ? 14
              : null,
          maxWidth: isSingleMedia ? 1000 : null,
          padding:
            isSingleMedia &&
            (theMedia.type === 'youtube' || theMedia.type === '360photo')
              ? 0
              : null,
        }}
      >
        <Media
          media={theMedia}
          isBR={isBR}
          withoutLink={isSingleMedia}
          expandGalleries
          fullQuality
          isMain
          showMapIcon
        />
      </div>

      <div className="container">
        {media[1] && galleryLength > 0 && (
          <div style={{ marginTop: 24 }}>
            <Pagination
              base={paginationBase}
              currentPage={Number(media[1]) || 1}
              pageNumber={galleryLength}
              isGallery
              total={5}
            />
          </div>
        )}
      </div>

      {theMedia.gallery &&
        theMedia.gallery.length > 0 &&
        theMedia.gallery.map((g, i) => (
          <div key={g.file} style={{ marginTop: 16 }}>
            {/* @ad */}
            {((i === 3 && theMedia.gallery.length >= 6) ||
              (i === 6 && theMedia.gallery.length >= 9)) && (
              <div className="container-fluid ad">
                <AdSense index={i} />
              </div>
            )}
            <div className="container">
              <Media
                key={g.file}
                media={g}
                isBR={isBR}
                expandGalleries
                fullQuality
                isListing
              />
            </div>
          </div>
        ))}

      <div className="container single-pagination-buttons">
        {theMedia.previous ? (
          <Link
            href={
              mainPath +
              theMedia.previous.replace(
                city + '-' + getTypePath(theMedia.type, true) + '-',
                ''
              )
            }
            className="btn"
          >
            &lt; {i18n(getTypeLabel(theMedia.type, 'Previous'))}
          </Link>
        ) : (
          <div />
        )}
        {theMedia.next ? (
          <Link
            href={
              mainPath +
              theMedia.next.replace(
                city + '-' + getTypePath(theMedia.type, true) + '-',
                ''
              )
            }
            className="btn"
          >
            {i18n(getTypeLabel(theMedia.type, 'Next'))} &gt;
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* @ad */}
      <div className="container-fluid ad">
        <AdSense index={0} />
      </div>

      <div className="container">
        {isSingleMedia && <div style={{ textAlign: 'center' }}>{header}</div>}

        <StructuredBreadcrumbs breadcrumbs={breadcrumbs} />

        {theMedia.type === 'short-video' && !theMedia.is_photos && (
          <Script
            id="tiktok-loader"
            async
            src="https://www.tiktok.com/embed.js"
          ></Script>
        )}
        {theMedia.type === '360photo' && (
          <Script
            async
            id="pannellum-loader"
            src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
          ></Script>
        )}
        {(theMedia.type === 'post' ||
          theMedia.type === 'story' ||
          theMedia.type === 'maps') && (
          <Script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.js"></Script>
        )}
      </div>
    </>
  );
}

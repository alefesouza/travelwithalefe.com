import { parse } from 'js2xmlparser';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { getFirestore } from 'firebase-admin/firestore';
import {
  FILE_DOMAIN,
  ITEMS_PER_PAGE,
  SITE_NAME,
  USE_CACHE,
} from '@/app/utils/constants';
import removeDiacritics from '@/app/utils/remove-diacritics';
import getMetadata from '@/app/utils/get-metadata';
import getTypePath from '@/app/utils/get-type-path';
import logAccess from '@/app/utils/log-access';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { customInitApp } from '@/app/firebase';
import useEditMode from '@/app/utils/use-edit-mode';
import { RSS_HASHTAGS } from '@/app/utils/rss-hashtags';
import { findHashtag } from '@/app/utils/hashtag-page-helpers';
import {
  fetchHomeRSSFeed,
  fetchHashtagRSSFeed,
  expandGalleriesForRSS,
} from '@/app/utils/rss-helpers';

customInitApp();

export async function GET(req) {
  const i18n = useI18n();
  const host = await useHost();
  const isBR = host().includes('viajarcomale.com.br');
  let { pathname, searchParams } = new URL(req.url);

  const editMode = await useEditMode(searchParams);

  let type = searchParams.get('type');

  pathname = pathname.toLowerCase();

  let hashtag = null;
  let finalHashtag = null;

  let photos = [];

  if (pathname === '/rss') {
    if (type && type !== 'short-video' && type !== '360photo') {
      return notFound();
    }

    photos = await fetchHomeRSSFeed(USE_CACHE, type, editMode);
  } else {
    const split = pathname.split('/');

    if (pathname.includes('/hashtags/')) {
      hashtag = removeDiacritics(decodeURIComponent(split[3]));
    }

    if (!hashtag) {
      return notFound();
    }

    if (!RSS_HASHTAGS.includes(hashtag)) {
      return notFound();
    }

    const { hashtagPt, hashtagEn } = await findHashtag(USE_CACHE, hashtag);
    finalHashtag = hashtagPt || hashtagEn;

    if (!finalHashtag) {
      redirect('/hashtags');
    }

    if (type && type !== 'maps' && type !== 'youtube') {
      return;
    }

    photos = await fetchHashtagRSSFeed(
      USE_CACHE,
      finalHashtag.name,
      type,
      finalHashtag.rss_limit,
      editMode
    );

    if (photos.length === 0) {
      return notFound();
    }
  }

  let instagramPhotos = photos.filter(
    (p) => p.type === 'post' || p.type === 'post-gallery'
  );
  const instagramStories = photos.filter((p) => p.type === 'story');
  const shortVideos = photos.filter((p) => p.type === 'short-video');
  const youtubeVideos = photos
    .filter((p) => p.type === 'youtube')
    .map((c) => ({
      ...c,
      file: c.image,
    }));
  const _360photos = photos.filter((p) => p.type === '360photo');
  const mapsPhotos = photos.filter((p) => p.type === 'maps');

  instagramStories.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  instagramPhotos = expandGalleriesForRSS(instagramPhotos, finalHashtag);

  const title = hashtag
    ? '#' + hashtag + ' - Hashtags - ' + i18n(SITE_NAME)
    : i18n(SITE_NAME) + ' - ' + i18n('Main Feed');
  const description = i18n(
    hashtag
      ? 'Photos and videos taken by Travel with Alefe with the hashtag #:hashtag:.'
      : 'Main feed with the most recent photos and videos by Travel with Alefe.',
    {
      hashtag,
    }
  );

  let items = [
    ...instagramStories,
    ...instagramPhotos,
    ...shortVideos,
    ...youtubeVideos,
    ..._360photos,
    ...mapsPhotos,
  ];

  if (USE_CACHE) {
    items = items.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    items = items.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
  }

  let obj = {
    '@': {
      version: '2.0',
      'xmlns:atom': 'http://www.w3.org/2005/Atom',
      'xmlns:media': 'http://search.yahoo.com/mrss/',
      'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
    },
    channel: {
      title,
      link: host(pathname.replace('/rss', '')),
      description,
      copyright: i18n(SITE_NAME) + ' - @viajarcomale',
      language: isBR ? 'pt-BR' : 'en-US',
      category: 'Travel',
      editor: 'contato@viajarcomale.com (' + i18n(SITE_NAME) + ')',
      webMaster: 'contact@alefesouza.com (Alefe Souza)',
      ['atom:link']: {
        '@': {
          href: host(pathname),
          rel: 'self',
          type: 'application/rss+xml',
        },
      },
      image: {
        title,
        description,
        url: host('/icons/144x144.png'),
        link: host(pathname.replace('/rss', '')),
        width: 144,
        height: 144,
      },
      item: items
        .filter((c) => !c.rss_ignore)
        .map((p) => {
          let { title, description } = getMetadata(p, isBR);
          description += p.hashtags
            ? ' - Hashtags: #' +
              (isBR && p.hashtags_pt ? p.hashtags_pt : p.hashtags).join(' #')
            : '';

          const [, country, , city] = p.path.split('/');

          const mediaId = p.id
            .replace(city + '-story-', '')
            .replace(city + '-post-', '')
            .replace(city + '-youtube-', '')
            .replace(city + '-short-video-', '')
            .replace(city + '-360photo-', '')
            .replace(city + '-maps-', '');

          const link = host(
            `/countries/${country}/cities/${city}/${getTypePath(
              p.type
            )}/${mediaId}${p.img_index ? '/' + p.img_index : ''}`
          );

          const media = {
            '@': {
              url: p.type === 'youtube' ? p.image : FILE_DOMAIN + p.file,
              medium: p.file.includes('.mp4') ? 'video' : 'image',
              width: p.width,
              height: p.height,
              type: p.file.includes('.mp4') ? 'video/mp4' : 'image/jpeg',
            },
            ['media:credit']: {
              '@': {
                role: 'photographer',
                scheme: 'urn:ebu',
              },
              '#': 'Alefe Souza',
            },
            ['media:copyright']:
              'https://creativecommons.org/licenses/by-nc/4.0/',
          };

          if (p.file.includes('.mp4')) {
            media['media:thumbnail'] = {
              '@': {
                url: FILE_DOMAIN + p.file.replace('.mp4', '-thumb.png'),
                width: p.width,
                height: p.height,
              },
            };
          }

          return {
            title,
            description,
            link,
            guid: {
              '@': {
                isPermaLink: true,
              },
              '#': link,
            },
            pubDate: USE_CACHE
              ? new Date(p.date).toUTCString()
              : p.createdAt.toDate().toUTCString(),
            category: 'Travel',
            ['media:category']: p.hashtags
              ? isBR && p.hashtags_pt
                ? p.hashtags_pt
                : p.hashtags
              : [],
            ['media:content']: media,
            ['dc:creator']: 'Alefe Souza',
          };
        }),
    },
  };

  logAccess(hashtag ? host('/rss/hashtags/') + hashtag : host('/rss'));

  obj = parse('rss', obj, { declaration: { include: false } });
  const declaration = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="${host('/rss_styles/style.xsl')}" ?>
`;

  return new Response(declaration + obj, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

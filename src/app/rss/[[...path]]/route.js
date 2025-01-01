import { parse } from 'js2xmlparser';
import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { getFirestore } from 'firebase-admin/firestore';
import { FILE_DOMAIN, ITEMS_PER_PAGE, SITE_NAME } from '@/app/utils/constants';
import removeDiacritics from '@/app/utils/remove-diacritics';
import getMetadata from '@/app/utils/get-metadata';
import getTypePath from '@/app/utils/get-type-path';
import logAccess from '@/app/utils/log-access';
import { redirect } from 'next/navigation';
import { customInitApp } from '@/app/firebase';
import useEditMode from '@/app/utils/use-edit-mode';

customInitApp();

export async function GET(req) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  let { pathname, searchParams } = new URL(req.url);

  const editMode = useEditMode(searchParams);

  let type = searchParams.get('type');

  pathname = pathname.toLowerCase();

  let hashtag = null;
  let finalHashtag = null;

  let photos = [];

  const db = getFirestore();

  if (pathname === '/rss') {
    if (type && type !== 'short-video' && type !== '360photo') {
      return;
    }

    const cacheRef = `/caches/feeds/pages/home${type ? '-' + type : ''}`;

    let cache = null;

    if (editMode) {
      cache = { exists: false };
    } else {
      cache = await db.doc(cacheRef).get();
    }

    if (!cache.exists) {
      let photosSnapshot = db
        .collectionGroup('medias')
        .limit(ITEMS_PER_PAGE)
        .orderBy('createdAt', 'desc');

      if (type) {
        photosSnapshot = photosSnapshot.where('type', '==', type);
      }

      photosSnapshot = await photosSnapshot.get();

      photosSnapshot.forEach((doc) => {
        const data = doc.data();
        data.path = doc.ref.path;

        photos.push(data);
      });

      db.doc(cacheRef).set({
        photos,
        last_update: new Date().toISOString().split('T')[0],
      });
    } else {
      photos = cache.data().photos;
    }
  } else {
    const split = pathname.split('/');

    if (pathname.includes('/hashtags/')) {
      hashtag = removeDiacritics(decodeURIComponent(split[3]));
    }

    if (!hashtag) {
      return notFound();
    }

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

    finalHashtag = hashtagPt || hashtagEn;

    if (!finalHashtag) {
      redirect('/hashtags');
    }

    if (type && type !== 'maps' && type !== 'youtube') {
      return;
    }

    const cacheRef = `/caches/feeds/hashtags-cache/${finalHashtag.name}${
      type ? '-' + type : ''
    }/sort/desc`;

    let cache = null;

    if (editMode) {
      cache = { exists: false };
    } else {
      cache = await db.doc(cacheRef).get();
    }

    if (!cache.exists) {
      let photosSnapshot = db
        .collectionGroup('medias')
        .where('hashtags', 'array-contains', finalHashtag.name);

      if (type) {
        photosSnapshot = photosSnapshot.where('type', '==', type);
      }

      photosSnapshot = await photosSnapshot
        .limit(finalHashtag.rss_limit ? finalHashtag.rss_limit : ITEMS_PER_PAGE)
        .orderBy('createdAt', 'desc')
        .get();

      photosSnapshot.forEach((doc) => {
        const data = doc.data();
        data.path = doc.ref.path;

        photos.push(data);
      });

      if (photos.length === 0) {
        return notFound();
      }

      db.doc(cacheRef).set({
        photos,
        last_update: new Date().toISOString().split('T')[0],
      });
    } else {
      photos = cache.data().photos;
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
      const itemWithHashtag = gallery.findIndex(
        (g) =>
          g.item_hashtags &&
          finalHashtag &&
          g.item_hashtags.includes(finalHashtag.name)
      );

      if (itemWithHashtag > -1) {
        delete gallery[itemWithHashtag].is_gallery;
        expandedList[expandedList.length - 1] = gallery[itemWithHashtag];

        item.file_type = 'image';
        gallery[itemWithHashtag] = item;
      }

      if (finalHashtag.rss_limit === 2000) {
        expandedList = [...expandedList, ...gallery];
      } else {
        if (item.rss && item.rss.includes(finalHashtag.name)) {
          expandedList = [...expandedList, ...gallery];
        } else {
          expandedList = [
            ...expandedList,
            ...gallery.filter(
              (g) => g.rss_include && g.rss_include.includes(finalHashtag.name)
            ),
          ];
        }
      }
    }
  });

  instagramPhotos = expandedList;

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

  const items = [
    ...instagramStories,
    ...instagramPhotos,
    ...shortVideos,
    ...youtubeVideos,
    ..._360photos,
    ...mapsPhotos,
  ].sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

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
            pubDate: p.createdAt.toDate().toUTCString(),
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

  logAccess(db, hashtag ? host('/rss/hashtags/') + hashtag : host('/rss'));

  obj = parse('rss', obj, { declaration: { include: false } });
  const declaration = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="${host('/rss_styles/style.xsl')}" ?>
`;

  return new Response(declaration + obj, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

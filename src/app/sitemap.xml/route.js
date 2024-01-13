import { parse } from 'js2xmlparser';
import useHost from '@/app/hooks/use-host';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { FILE_DOMAIN, ITEMS_PER_PAGE } from '../utils/constants';
import { customInitApp } from '../firebase';
import logAccess from '../utils/log-access';
import getMetadata from '../utils/get-metadata';

customInitApp();

export async function GET() {
  // const host = (string = '') =>
  //   new URL(string, 'https://viajarcomale.com/').toString();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const lastmod = '2024-01-13';

  const db = getFirestore();
  const reference = host('sitemap.xml')
    .split('//')[1]
    .replaceAll('/', '-')
    .replace('www.', '');

  const storage = getStorage();
  const cacheExists = await storage
    .bucket('viajarcomale.appspot.com')
    .file(reference)
    .exists();

  let obj = {};

  if (!cacheExists[0]) {
    const countriesSnapshot = await db.collection('countries').get();
    let countries = [];

    countriesSnapshot.forEach((country) => {
      countries = [...countries, country.data()];
    });

    const mediasSnapshot = await db.collectionGroup('medias').get();
    const medias = [];
    mediasSnapshot.forEach((doc) => {
      const data = doc.data();
      data.path = doc.ref.path;
      medias.push(data);
    });
    const locationsSnapshot = await db.collectionGroup('locations').get();
    const locations = [];
    locationsSnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.is_placeholder) {
        return;
      }

      locations.push(data);
    });
    const hashtagsSnapshot = await db.collectionGroup('hashtags').get();
    let hashtags = [];
    hashtagsSnapshot.forEach((doc) => {
      hashtags.push(doc.data());
    });
    hashtags = hashtags.filter((h) => !h.is_country && !h.is_city);
    const highlights = medias.filter((m) => m.is_highlight);

    const mediaProcessing = (media, gallery, position) => {
      const item = gallery || media;

      if (!item) {
        return {};
      }

      if (
        item.type === 'youtube' ||
        item.type === 'short-video' ||
        item.file.includes('.mp4')
      ) {
        const { title, description, embedVideo, image } = getMetadata(
          media,
          isBR,
          position
        );

        const data = {
          'video:video': [
            {
              'video:thumbnail_loc':
                item.type === 'youtube' || item.type === 'short-video'
                  ? image
                  : FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png'),
              [item.type === 'youtube' || item.type === 'short-video'
                ? 'video:player_loc'
                : 'video:content_loc']: embedVideo
                ? embedVideo
                : FILE_DOMAIN + item.file,
              'video:title': title,
              'video:description': description,
              'video:publication_date': media.date
                ? media.date.replace(' ', 'T') + '+03:00'
                : media.cityData.end + 'T12:00:00+03:00',
              'video:family_friendly': 'yes',
              'video:requires_subscription': 'no',
              'video:live': 'no',
            },
          ],
        };

        if (item.duration) {
          data['video:video'][0]['video:duration'] = parseInt(item.duration);
        }

        return data;
      }

      return {
        'image:image': [
          {
            'image:loc': FILE_DOMAIN + item.file,
          },
        ],
      };
    };

    const makeLoc = (loc, extra = '', enName = '', ptName = '') => {
      const theLoc = host(loc) + extra;

      return {
        loc: isBR ? theLoc.replace(enName, ptName || enName) : theLoc,
        'xhtml:link': [
          {
            '@': {
              rel: 'alternate',
              hreflang: 'en',
              href: 'https://viajarcomale.com' + loc + extra,
            },
          },
          {
            '@': {
              rel: 'alternate',
              hreflang: 'pt',
              href: ('https://viajarcomale.com.br' + loc + extra).replace(
                enName,
                ptName || enName
              ),
            },
          },
        ],
        lastmod,
      };
    };

    obj = {
      '@': {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1',
        'xmlns:video': 'http://www.google.com/schemas/sitemap-video/1.1',
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
      },
      url: [
        {
          ...makeLoc('/'),
        },
        {
          ...makeLoc('/countries'),
        },
        {
          ...makeLoc('/map'),
        },
        {
          ...makeLoc('/hashtags'),
        },
        {
          ...makeLoc('/about'),
        },
        {
          ...makeLoc('/privacy-policy'),
        },
        ...countries.flatMap((c) => [
          {
            ...makeLoc('/countries/' + c.slug),
          },
          {
            ...makeLoc('/countries/' + c.slug + '/expand'),
          },
          ...Array.from(
            {
              length: Math.ceil(c?.totals?.posts / ITEMS_PER_PAGE - 1),
            },
            (_, i) => [
              {
                ...makeLoc('/countries/' + c.slug + '/page/' + (i + 2)),
              },
              {
                ...makeLoc(
                  '/countries/' + c.slug + '/page/' + (i + 2) + '/expand'
                ),
              },
            ]
          ),
        ]),
        ...countries
          .map((c) =>
            c.cities.map((city) => [
              {
                ...makeLoc('/countries/' + c.slug + '/cities/' + city.slug),
              },
              {
                ...makeLoc(
                  '/countries/' + c.slug + '/cities/' + city.slug + '/expand'
                ),
              },
              ...Array.from(
                {
                  length: Math.ceil(city?.totals?.posts / ITEMS_PER_PAGE - 1),
                },
                (_, i) => [
                  {
                    ...makeLoc(
                      '/countries/' +
                        c.slug +
                        '/cities/' +
                        city.slug +
                        '/page/' +
                        (i + 2)
                    ),
                  },
                  {
                    ...makeLoc(
                      '/countries/' +
                        c.slug +
                        '/cities/' +
                        city.slug +
                        '/page/' +
                        (i + 2) +
                        '/expand'
                    ),
                  },
                ]
              ),
            ])
          )
          .flat(2),
        ...highlights.map((m) => ({
          ...makeLoc(
            '/countries/' + m.country + '/cities/' + m.city + '/stories'
          ),
        })),
        ...locations.map((m) => ({
          ...makeLoc(
            '/countries/' + m.country + '/cities/' + m.city + '/locations/',
            decodeURIComponent(m.slug)
          ),
        })),
        ...locations
          .filter((m) => m?.totals?.posts > 0)
          .map((m) => ({
            ...makeLoc(
              '/countries/' + m.country + '/cities/' + m.city + '/locations/',
              decodeURIComponent(m.slug) + '/expand'
            ),
          })),
        ...hashtags.map((h) => ({
          ...makeLoc(
            '/hashtags/',
            decodeURIComponent(h.name),
            h.name,
            h.name_pt
          ),
        })),
        ...hashtags
          .filter((h) => h?.totals?.posts > 0)
          .map((h) => ({
            ...makeLoc(
              '/hashtags/',
              decodeURIComponent(h.name) + '/expand',
              h.name,
              h.name_pt
            ),
          })),
        ...medias
          .filter((m) => m.type === 'story')
          .map((m) => {
            const [, country, , city] = m.path.split('/');

            return {
              ...makeLoc(
                '/countries/' +
                  country +
                  '/cities/' +
                  city +
                  '/stories/' +
                  m.id.replace(city + '-story-', '')
              ),
              ...mediaProcessing(m, null),
            };
          }),
        ...medias
          .filter((m) => m.type === 'youtube')
          .map((m) => {
            const [, country, , city] = m.path.split('/');

            return {
              ...makeLoc(
                '/countries/' +
                  country +
                  '/cities/' +
                  city +
                  '/videos/' +
                  m.id.replace(city + '-youtube-', '')
              ),
              ...mediaProcessing(m, null),
            };
          }),
        ...medias
          .filter((m) => m.type === 'short-video')
          .map((m) => {
            const [, country, , city] = m.path.split('/');

            return {
              ...makeLoc(
                '/countries/' +
                  country +
                  '/cities/' +
                  city +
                  '/short-videos/' +
                  m.id.replace(city + '-short-video-', '')
              ),
              ...mediaProcessing(m, null),
            };
          }),
        ...medias
          .filter((m) => m.type === '360photo')
          .map((m) => {
            const [, country, , city] = m.path.split('/');

            return {
              ...makeLoc(
                '/countries/' +
                  country +
                  '/cities/' +
                  city +
                  '/360-photos/' +
                  m.id.replace(city + '-360photo-', '')
              ),
              ...mediaProcessing(m, null),
            };
          }),
        ...medias
          .filter((m) => m.type === 'maps')
          .map((m) => {
            const [, country, , city] = m.path.split('/');

            return {
              ...makeLoc(
                '/countries/' +
                  country +
                  '/cities/' +
                  city +
                  '/maps/' +
                  m.id.replace(city + '-maps-', '')
              ),
              ...mediaProcessing(m, null),
            };
          }),
        ...medias
          .filter((m) => m.type === 'post')
          .flatMap((m) => {
            const [, country, , city] = m.path.split('/');

            return [
              {
                ...makeLoc(
                  '/countries/' +
                    country +
                    '/cities/' +
                    city +
                    '/posts/' +
                    m.id.replace(city + '-post-', '')
                ),
              },
              {
                ...makeLoc(
                  '/countries/' +
                    country +
                    '/cities/' +
                    city +
                    '/posts/' +
                    m.id.replace(city + '-post-', '') +
                    '/1'
                ),
                ...mediaProcessing(m, null),
              },
              ...(m.gallery
                ? m.gallery.map((g, i) => ({
                    ...makeLoc(
                      '/countries/' +
                        country +
                        '/cities/' +
                        city +
                        '/posts/' +
                        m.id.replace(city + '-post-', '') +
                        '/' +
                        (i + 2)
                    ),
                    ...mediaProcessing(m, g, i + 2),
                  }))
                : []),
            ];
          }),
      ],
    };

    obj = parse('urlset', obj, { declaration: { encoding: 'UTF-8' } });
    storage.bucket('viajarcomale.appspot.com').file(reference).save(obj);
  }

  if (cacheExists[0]) {
    const contents = await storage
      .bucket('viajarcomale.appspot.com')
      .file(reference)
      .download();
    obj = contents;
  }

  logAccess(db, host('/sitemap.xml').replace('https://viajarcomale', ''));

  return new Response(obj, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

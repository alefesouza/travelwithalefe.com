import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { headers } from 'next/headers';
import { FILE_DOMAIN, FILE_DOMAIN_SQUARE, SITE_NAME } from './constants';
import getMetadata from './get-metadata';

export default function defaultMetadata(title, description, media, isSingle) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const headersList = headers();
  const isWebStories = headersList.get('x-pathname').includes('/webstories');
  let pathname =
    (isWebStories ? '/webstories' : '') +
    headersList.get('x-pathname').replace('/webstories', '');

  const defaultTitle = i18n(SITE_NAME);
  const defaultDescription = i18n(
    'Travel photos and links to Travel with Alefe social networks.'
  );

  const canonical = new URL(
    pathname,
    isBR ? 'https://viajarcomale.com.br' : 'https://travelwithalefe.com'
  ).toString();

  let images = [];

  let metadata = {};

  if (media) {
    metadata = getMetadata(media, isBR);
  }

  if (media) {
    images = [
      {
        url:
          media.type === 'youtube' || media.type === 'short-video'
            ? metadata.image
            : (media.type === 'story' ? FILE_DOMAIN_SQUARE : FILE_DOMAIN) +
              media.file.replace('.mp4', '-thumb.png'),
        width: media.width,
        height: media.type === 'story' ? media.width : media.height,
        type:
          media.file && media.file.includes('.png')
            ? 'image/png'
            : 'image/jpeg',
        alt: metadata.description,
      },
    ];
  } else {
    images = [
      {
        url: host('cover.jpg'),
        width: 1280,
        height: 630,
        type: 'image/jpeg',
        alt: description || defaultDescription,
      },
    ];
  }

  const isVideo =
    media &&
    (media.type === 'youtube' ||
      media.type === 'short-video' ||
      media.file.includes('.mp4'));

  return {
    title: title || defaultTitle,
    description: description || defaultDescription,
    openGraph: {
      title: title || defaultTitle,
      description: description || defaultDescription,
      images,
      url: canonical,
      videos:
        isSingle && isVideo
          ? [
              {
                url: metadata.embedVideo
                  ? metadata.embedVideo
                  : FILE_DOMAIN + media.file,
                width: media.width || 1280,
                height: media.height || 720,
                type:
                  media.file && media.file.includes('.mp4')
                    ? 'video/mp4'
                    : 'text/html',
              },
            ]
          : null,
      type: isSingle && isVideo ? 'video.movie' : 'website',
      ...(isSingle && isVideo
        ? {
            duration: media.duration ? Math.ceil(media.duration) : null,
            releaseDate: media.date.replace(' ', 'T') + '+03:00',
            directors: ['Alefe Souza - ' + i18n(SITE_NAME)],
            tags:
              isBR && media.hashtags_pt
                ? media.hashtags_pt
                : media.hashtags || [],
          }
        : null),
    },
    twitter: {
      title: title || defaultTitle,
      description: description || defaultDescription,
      images,
    },
    other: {
      title: title || defaultTitle,
      image: images[0].url,
    },
    alternates: {
      canonical,
      languages: {
        'x-default': 'https://travelwithalefe.com' + pathname,
        en: 'https://travelwithalefe.com' + pathname,
        pt: 'https://viajarcomale.com.br' + pathname,
      },
    },
  };
}

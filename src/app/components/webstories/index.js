import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import {
  FILE_DOMAIN,
  FILE_DOMAIN_LANDSCAPE,
  FILE_DOMAIN_PORTRAIT,
  FILE_DOMAIN_SQUARE,
  SITE_NAME,
} from '@/app/utils/constants';
import SchemaData from '../schema-data';
import getMetadata from '@/app/utils/get-metadata';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import expandDate from '@/app/utils/expand-date';
import getTypePath from '@/app/utils/get-type-path';

export default async function WebStories({
  title,
  storyTitle,
  items,
  countryData,
  hashtag,
  isLocation,
}) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const headersList = headers();
  const isWindows =
    new UAParser(headersList.get('user-agent')).getOS().name === 'Windows';

  let highlightItem = items.find((i) => i.is_highlight);

  if (hashtag) {
    const highlight = items.find(
      (i) => i.highlight_hashtags && i.highlight_hashtags.includes(hashtag)
    );

    if (highlight) {
      highlightItem = highlight;
    }
  }

  let firstItem = highlightItem ? highlightItem : items[0] || {};

  const theCover = firstItem?.file?.replace('.mp4', '-thumb.png');

  const needSplit = storyTitle.split(' ').length == 1;

  const { description } = getMetadata(firstItem, isBR);

  let firstLandscape = items.find((i) => i.width > i.height);
  const firstPortrait = items.find((i) => i.height > i.width);
  const firstSquare = items.find((i) => i.width === i.height);

  if (firstLandscape && firstLandscape.type === 'youtube') {
    const url = new URL(item.link);
    const youtubeId = url.searchParams.get('v');

    firstLandscape.file = 'https://img.youtube.com/vi/' + youtubeId + '/0.jpg';
  }

  const portraitPhoto =
    firstItem.type === 'story'
      ? FILE_DOMAIN_PORTRAIT + theCover
      : firstPortrait
      ? FILE_DOMAIN + firstPortrait.file
      : null;

  const landscapePhoto =
    firstItem.type === 'story'
      ? FILE_DOMAIN_LANDSCAPE + theCover
      : firstLandscape
      ? firstLandscape.type === 'youtube'
        ? firstLandscape.file
        : FILE_DOMAIN + firstLandscape.file
      : null;

  const squarePhoto =
    firstItem.type === 'story'
      ? FILE_DOMAIN_SQUARE + theCover
      : firstSquare
      ? FILE_DOMAIN + firstSquare.file
      : null;

  return (
    <amp-story
      standalone
      title={title}
      publisher={SITE_NAME}
      publisher-logo-src={host('/icons/96x96.png')}
      poster-portrait-src={portraitPhoto}
      poster-landscape-src={portraitPhoto || squarePhoto || landscapePhoto}
      poster-square-src={squarePhoto}
    >
      <amp-story-page id="cover" auto-advance-after="2s">
        <amp-story-grid-layer template="fill">
          <amp-img
            src={FILE_DOMAIN + theCover}
            width={firstItem.width}
            height={firstItem.height}
            layout="responsive"
            alt={description}
            className="darker"
          ></amp-img>
          <SchemaData media={firstItem} isWebStories={true} />
        </amp-story-grid-layer>
        <amp-story-grid-layer template="vertical">
          <amp-img
            src={host('/icons/96x96.png')}
            srcSet={host('/icons/192x192.png') + ' 2x'}
            width={96}
            height={96}
          ></amp-img>
          <div className="header-container">
            <h1
              className="common-text story-title"
              style={{
                fontSize:
                  storyTitle.length >= 35 && needSplit
                    ? 17
                    : storyTitle.length >= 30 && needSplit
                    ? 22
                    : storyTitle.length >= 25 && needSplit
                    ? 28
                    : 32,
              }}
            >
              {storyTitle}
            </h1>

            <div className="flag-container">
              {countryData ? (
                isWindows ? (
                  <amp-img
                    src={host('/flags/' + countryData.slug + '.png')}
                    alt={i18n(countryData.name)}
                    width={55}
                    height={55}
                  />
                ) : (
                  ' ' + countryData.flag
                )
              ) : null}
            </div>
          </div>
        </amp-story-grid-layer>
        <amp-story-page-outlink layout="nodisplay">
          <a href="" className="cover-link">
            {i18n('Open')}
          </a>
        </amp-story-page-outlink>
      </amp-story-page>
      {items.map((item) => {
        const { description, shortDescription, locationDescription } =
          getMetadata(item, isBR);
        const [, country, , city] = item.path.split('/');

        const originalId =
          item.id + (item.img_index ? '-' + item.img_index : '');
        item.id = item.id
          .replace(city + '-post-', '')
          .replace(city + '-story-', '')
          .replace(city + '-youtube-', '')
          .replace(city + '-short-video-', '')
          .replace(city + '-360photo-', '')
          .replace(city + '-maps-', '');

        if (item.type === 'youtube') {
          const url = new URL(item.link);
          const youtubeId = url.searchParams.get('v');

          item.file = 'https://img.youtube.com/vi/' + youtubeId + '/0.jpg';
        }

        return (
          <amp-story-page
            key={originalId}
            id={originalId}
            auto-advance-after={
              item.file.includes('.mp4')
                ? originalId + '-video'
                : item.type === '360photo'
                ? '10s'
                : '5s'
            }
            itemScope
            itemType={
              item.file.includes('.mp4')
                ? 'http://schema.org/VideoObject'
                : 'http://schema.org/ImageObject'
            }
          >
            <amp-story-grid-layer
              template={
                item.type === 'story' ||
                item.type === 'short-video' ||
                (item.type === 'maps' && item.height > item.width)
                  ? 'fill'
                  : 'vertical'
              }
              className={
                item.type === 'story' ||
                item.type === 'short-video' ||
                (item.type === 'maps' && item.height > item.width)
                  ? null
                  : 'no-padding'
              }
            >
              {item.file.includes('.mp4') ? (
                <amp-video
                  width={item.width || 1080}
                  height={item.height || 1350}
                  layout="responsive"
                  poster={FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')}
                  id={originalId + '-video'}
                  autoplay
                  cache="google"
                >
                  <source src={FILE_DOMAIN + item.file} type="video/mp4" />
                </amp-video>
              ) : (
                <>
                  <amp-img
                    src={
                      item.type === 'youtube'
                        ? item.file
                        : FILE_DOMAIN + item.file.replace('.mp4', '-thumb.png')
                    }
                    width={(item.type === 'youtube' ? 480 : item.width) || 1080}
                    height={
                      (item.type === 'youtube' ? 360 : item.height) || 1350
                    }
                    layout="responsive"
                    alt={description}
                    animate-in={item.type === '360photo' ? 'pan-right' : null}
                    animate-in-duration={
                      item.type === '360photo' ? '10s' : null
                    }
                  ></amp-img>
                </>
              )}

              <SchemaData media={item} isWebStories={true} />
            </amp-story-grid-layer>
            <amp-story-grid-layer
              template="vertical"
              className={
                item.type === 'short-video' ||
                item.type === 'youtube' ||
                item.type === 'post' ||
                item.type === 'maps'
                  ? 'end-content'
                  : null
              }
            >
              <div className="common-text username">
                <span className="username-text">@viajarcomale</span>{' '}
                {!(
                  item.city === 'sao-paulo' &&
                  (item.date.startsWith('2023-09') ||
                    item.date.startsWith('2023-08'))
                ) && (
                  <div className="date">
                    {expandDate(item.date, isBR, true)}
                  </div>
                )}
              </div>

              {(item.type === '360photo' ||
                item.type === 'short-video' ||
                item.type === 'youtube' ||
                item.type === 'post' ||
                (item.type === 'maps' && !isLocation)) && (
                <div className="post-type-container" justify-self="center">
                  <h1
                    className="common-text"
                    style={{
                      fontSize:
                        item.type === 'post' || item.type === 'maps' ? 22 : 24,
                      lineHeight:
                        item.type === 'post' || item.type === 'maps'
                          ? '24px'
                          : '30px',
                    }}
                  >
                    {i18n(
                      item.type === '360photo'
                        ? '360 Photo'
                        : item.type === 'short-video'
                        ? 'Short Video'
                        : item.type === 'youtube'
                        ? 'YouTube Video'
                        : ''
                    )}
                    {item.type === 'youtube' && <br />}
                    {item.type === 'youtube'
                      ? isBR & item.title_pt
                        ? item.title_pt
                        : item.title
                      : null}
                    {item.type === 'post'
                      ? 'Post: ' +
                        shortDescription +
                        (item.gallery
                          ? ' - ' +
                            (item.gallery.length + 1) +
                            ' ' +
                            i18n('items')
                          : '')
                      : null}
                    {item.type !== 'maps' && <br />}
                    {item.type !== 'youtube' &&
                      item.type !== 'post' &&
                      item.type !== 'maps' &&
                      i18n(
                        item.type === '360photo'
                          ? 'swipe up to navigate'
                          : 'swipe up to watch'
                      )}
                    {item.type === 'maps' && !isLocation
                      ? '📍 ' + locationDescription
                      : ''}
                  </h1>
                </div>
              )}
            </amp-story-grid-layer>
            {item.type === '360photo' && !isLocation && locationDescription && (
              <amp-story-grid-layer template="vertical" className="end-content">
                <div className="post-type-container" justify-self="center">
                  <h1
                    className="common-text"
                    style={{
                      fontSize: 24,
                      lineHeight: '30px',
                    }}
                  >
                    📍 {locationDescription}
                  </h1>
                </div>
              </amp-story-grid-layer>
            )}
            <amp-story-page-outlink layout="nodisplay">
              <a
                href={host(
                  '/countries/' +
                    country +
                    '/cities/' +
                    city +
                    '/' +
                    getTypePath(item.type) +
                    '/' +
                    item.id
                )}
                target="_blank"
              >
                {i18n(
                  item.type === '360photo' ||
                    item.type === 'short-video' ||
                    item.type === 'youtube' ||
                    item.type === 'post'
                    ? 'Swipe up'
                    : 'Open'
                )}
              </a>
            </amp-story-page-outlink>
          </amp-story-page>
        );
      })}
      <amp-story-page id="end">
        <amp-story-grid-layer template="fill">
          <amp-img
            src={
              FILE_DOMAIN +
              '/stories/united-states/death-valley/story-18285703003137254-4.jpg'
            }
            width={firstItem.width}
            height={firstItem.height}
            layout="responsive"
            alt={description}
            className="darker"
          ></amp-img>
          <SchemaData media={firstItem} isWebStories={true} />
        </amp-story-grid-layer>
        <amp-story-grid-layer template="vertical">
          <amp-img
            src={host('/icons/96x96.png')}
            srcSet={host('/icons/192x192.png') + ' 2x'}
            width={96}
            height={96}
            justify-self="center"
          ></amp-img>
          <div className="end-text-container" justify-self="center">
            <h1 className="common-text end-text">
              {i18n('Swipe up for more travel photos and videos')}
            </h1>
          </div>
        </amp-story-grid-layer>
        <amp-story-page-outlink layout="nodisplay">
          <a href={host('/')}>{i18n('Swipe up')}</a>
        </amp-story-page-outlink>
      </amp-story-page>
      <amp-story-auto-analytics
        gtag-id={
          isBR ? process.env.NEXT_GA_TRACKING_BR : process.env.NEXT_GA_TRACKING
        }
      ></amp-story-auto-analytics>
    </amp-story>
  );
}

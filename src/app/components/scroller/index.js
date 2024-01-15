import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import Link from 'next/link';
import styles from './index.module.css';
import { FILE_DOMAIN, FILE_DOMAIN_500 } from '@/app/utils/constants';
import ShareButton from '../share-button';
import Hashtags from '../hashtags';
import SchemaData from '../schema-data';
import expandDate from '@/app/utils/expand-date';
import getTypePath from '@/app/utils/get-type-path';
// @ad
import AdSense from '../adsense';

export default function Scroller({
  title,
  items,
  isShortVideos,
  isInstagramHighlights,
  isYouTubeVideos,
  is360Photos,
  isStories,
  webStoriesHref,
  sort,
}) {
  const i18n = useI18n();
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  // @ad
  let inserted = 0;

  // @ad
  items.forEach((_, i) => {
    if (i % 8 === 0 && i !== 0) {
      items.splice(i + inserted, 0, {
        type: 'ad',
        id: 'ad-' + i,
      });
      inserted++;
    }
  });

  // @ad
  if ((items.length - inserted) % 8 === 0) {
    items.push({
      type: 'ad',
      id: 'ad-' + (items.length - 1),
    });
  }

  return (
    <div data-scroller>
      <div className="container-fluid">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <h3>{i18n(title)}</h3>
          <a
            href="#"
            className="maximize-button"
            style={{
              textDecoration: 'underline',
              display: 'none',
            }}
            data-maximize={styles.instagram_highlights_items}
            data-minimize={styles.scroller_items}
            data-maxtext={i18n('Maximize')}
            data-mintext={i18n('Minimize')}
          >
            {i18n('Maximize')}
          </a>
        </div>
      </div>

      {isStories && (
        <div className="center_link">
          <a
            href={webStoriesHref + (sort !== 'desc' ? '?sort=' + sort : '')}
            target="_blank"
          >
            {i18n('Open in Stories format')}
          </a>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div className={styles.scroller_left_arrow}>‹</div>

        <div
          className={
            styles.scroller_items +
            (is360Photos || isYouTubeVideos ? ' ' + styles.scroller_360 : '')
          }
          data-scroller-scroll
        >
          {items.map((p) => {
            const originalId = p.id;
            // @ad
            const [, country, , city] =
              p.type !== 'ad' ? p.path.split('/') : '';
            p.id = p.id
              .replace(city + '-post-', '')
              .replace(city + '-story-', '')
              .replace(city + '-youtube-', '')
              .replace(city + '-short-video-', '')
              .replace(city + '-360photo-', '')
              .replace(city + '-maps-', '');

            return (
              <div
                key={originalId}
                className={[
                  styles.scroller_item,
                  is360Photos || isYouTubeVideos ? styles.item_360_photo : '',
                  isInstagramHighlights ? styles.is_gallery : '',
                  p.type === 'ad' ? styles.ad + ' scroller-ad' : '',
                ]
                  .filter((c) => c)
                  .join(' ')}
                itemScope
                itemType="http://schema.org/ImageObject"
              >
                {/* @ad */}
                {p.type === 'ad' ? (
                  <AdSense index={p.id} isScroller />
                ) : (
                  <>
                    <Link
                      href={
                        isInstagramHighlights
                          ? host(
                              '/countries/' +
                                country +
                                '/cities/' +
                                city +
                                '/stories'
                            )
                          : host(
                              '/countries/' +
                                country +
                                '/cities/' +
                                city +
                                '/' +
                                getTypePath(p.type) +
                                '/' +
                                p.id
                            )
                      }
                      style={{ display: 'block', position: 'relative' }}
                      className={is360Photos ? styles.item_360_photo : ''}
                      prefetch={false}
                    >
                      {isStories && p.file.includes('.mp4') ? (
                        <img
                          src={
                            FILE_DOMAIN + p.file.replace('.mp4', '-thumb.png')
                          }
                          srcSet={
                            isYouTubeVideos
                              ? p.image
                              : `${
                                  FILE_DOMAIN_500 +
                                  p.file.replace('.mp4', '-thumb.png')
                                } 500w, ${
                                  FILE_DOMAIN +
                                  p.file.replace('.mp4', '-thumb.png')
                                } ${p.width || 1440}w`
                          }
                          alt={isBR ? p.description_pt : p.description}
                          className={styles.vertical_content}
                          loading="lazy"
                          itemProp="contentUrl"
                        />
                      ) : (
                        <img
                          src={
                            isYouTubeVideos
                              ? p.image
                              : FILE_DOMAIN +
                                p.file.replace('.mp4', '-thumb.png')
                          }
                          srcSet={
                            isYouTubeVideos
                              ? p.image
                              : `${
                                  FILE_DOMAIN_500 +
                                  p.file.replace('.mp4', '-thumb.png')
                                } 500w, ${
                                  FILE_DOMAIN +
                                  p.file.replace('.mp4', '-thumb.png')
                                } ${p.width || 1440}w`
                          }
                          sizes={
                            !isYouTubeVideos
                              ? `(max-width: 500px) 500px, ${p.width}px`
                              : ''
                          }
                          alt={isBR ? p.description_pt : p.description}
                          className={
                            !isYouTubeVideos && !is360Photos
                              ? styles.vertical_content
                              : isYouTubeVideos
                              ? styles.youtube_video
                              : ''
                          }
                          loading="lazy"
                          itemProp="contentUrl"
                        />
                      )}

                      {(p.file_type === 'video' || p?.file?.includes('.mp4')) &&
                        isStories && (
                          <div className="instagram_media_play_button">
                            <img src="/images/play.svg" alt="Play" />
                          </div>
                        )}
                    </Link>

                    {isShortVideos && (
                      <div className={styles.short_video_links}>
                        {['tiktok', 'instagram', 'youtube', 'kwai'].map(
                          (item) =>
                            p[item + '_link'] && (
                              <a
                                href={p[item + '_link']}
                                target="_blank"
                                key={item}
                              >
                                <img
                                  src={host('/logos/' + item + '.png')}
                                  alt={item + 'Video'}
                                />
                              </a>
                            )
                        )}

                        <ShareButton
                          text={isBR ? p.description_pt : p.description}
                          url={host(
                            '/countries/' +
                              country +
                              '/cities/' +
                              city +
                              '/' +
                              getTypePath(p.type) +
                              '/' +
                              p.id
                          )}
                        />
                      </div>
                    )}

                    {isInstagramHighlights && (
                      <div className={styles.external_links}>
                        {
                          <a
                            href={
                              'https://www.instagram.com/stories/highlights/' +
                              p.original_id
                            }
                            target="_blank"
                          >
                            <img
                              src={host('/logos/instagram.png')}
                              alt={i18n('Instagram Icon')}
                            />
                          </a>
                        }

                        <ShareButton
                          text={
                            isBR && p.cityData.name_pt
                              ? p.cityData.name_pt
                              : p.cityData.name
                          }
                          url={host(
                            '/countries/' +
                              country +
                              '/cities/' +
                              city +
                              '/stories'
                          )}
                        />
                      </div>
                    )}

                    {(isStories || isYouTubeVideos || is360Photos) && (
                      <div className={styles.external_links}>
                        {isStories && (
                          <a
                            href={
                              'https://www.instagram.com/stories/highlights/' +
                              p.original_id +
                              '/'
                            }
                            target="_blank"
                          >
                            <img
                              src={host('/logos/instagram.png')}
                              alt={i18n('Instagram Icon')}
                            />
                          </a>
                        )}

                        {isYouTubeVideos && (
                          <a href={p.link} target="_blank">
                            <img
                              src={host('/logos/youtube.png')}
                              alt={i18n('YouTube Icon')}
                            />
                          </a>
                        )}

                        <ShareButton
                          text={isBR ? p.description_pt : p.description}
                          url={host(
                            '/countries/' +
                              p.country +
                              '/cities/' +
                              p.city +
                              '/' +
                              getTypePath(p.type) +
                              '/' +
                              p.id
                          )}
                        />
                      </div>
                    )}

                    {isInstagramHighlights && (
                      <>
                        <div>
                          {isBR && p.cityData.name_pt
                            ? p.cityData.name_pt
                            : p.cityData.name}
                        </div>
                        <div
                          className="center_link"
                          style={{ marginTop: 18, marginBottom: 0 }}
                        >
                          <Link
                            href={
                              '/webstories/countries/' +
                              p.country +
                              '/cities/' +
                              p.city +
                              '/stories' +
                              (sort !== 'desc' ? '?sort=' + sort : '')
                            }
                            target="_blank"
                            prefetch={false}
                          >
                            {i18n('Open in Stories format')}
                          </Link>
                        </div>
                      </>
                    )}

                    {isYouTubeVideos && (
                      <div itemProp="title">
                        <b>{isBR ? p.title_pt : p.title}</b>
                      </div>
                    )}

                    {!isInstagramHighlights && (
                      <div>
                        {isBR && p.description_pt
                          ? p.description_pt
                          : p.description}
                      </div>
                    )}

                    {!isInstagramHighlights && p.type === 'story' && (
                      <div style={{ marginTop: 4 }}>
                        {expandDate(p.date, isBR)}
                      </div>
                    )}

                    {!isInstagramHighlights &&
                      p.locations &&
                      p.location_data &&
                      p.location_data.length > 0 && (
                        <div
                          style={{ marginTop: 4 }}
                          className={styles.location}
                        >
                          {i18n(
                            p.location_data.length > 1 ? 'Places' : 'Place'
                          )}
                          :{' '}
                          <span>
                            {p.location_data.map((location, i) => (
                              <>
                                <Link
                                  href={
                                    '/countries/' +
                                    p.country +
                                    '/cities/' +
                                    p.city +
                                    '/locations/' +
                                    location.slug
                                  }
                                  key={location.slug}
                                  prefetch={false}
                                >
                                  {isBR && location.name_pt
                                    ? location.name_pt
                                    : location.name}
                                  {location.alternative_names &&
                                    location.alternative_names.length > 0 &&
                                    ' (' +
                                      location.alternative_names.join(', ') +
                                      ')'}
                                </Link>
                                {i < p.location_data.length - 1 ? ', ' : ''}
                              </>
                            ))}
                          </span>
                        </div>
                      )}

                    {!isInstagramHighlights &&
                      p.hashtags &&
                      p.hashtags.length > 0 && (
                        <Hashtags item={p} isBR={isBR} />
                      )}

                    <SchemaData
                      media={p}
                      withOptional={isInstagramHighlights}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.scroller_right_arrow}>›</div>
      </div>
    </div>
  );
}

import './globals.css';
import { customInitApp } from './firebase';
customInitApp();
import Script from 'next/script';
import useHost from './hooks/use-host';
import useI18n from './hooks/use-i18n';
import { SITE_NAME } from './utils/constants';
import { headers } from 'next/headers';
import NavbarLinks from './components/navbar-links';
import defaultMetadata from './utils/default-metadata';
import getCookie from './utils/get-cookies';
import Sidebar from './components/sidebar';
import Link from 'next/link';
import Autocomplete from './components/autocomplete';

export async function generateMetadata() {
  return defaultMetadata();
}

export default function RootLayout({ children }) {
  const host = useHost();
  const i18n = useI18n();
  const isBR = host().includes('viajarcomale.com.br');
  const headersList = headers();
  const pathname = headersList.get('x-pathname');
  const isAMP = pathname.includes('/webstories');

  const paths = pathname.split('/');
  const isMediaSingle =
    paths[1] === 'countries' &&
    paths[3] === 'cities' &&
    (paths[5] === 'posts' ||
      paths[5] === 'stories' ||
      paths[5] === 'videos' ||
      paths[5] === 'short-videos' ||
      paths[5] === '360-photos' ||
      paths[5] === 'maps') &&
    paths[6] &&
    (paths[5] === 'stories' ||
      paths[5] === 'videos' ||
      paths[5] === 'short-videos' ||
      paths[5] === '360-photos' ||
      paths[5] === 'maps' ||
      paths[7]);

  const isSubPage = pathname !== '/';

  const ignoreAnalytics =
    getCookie('ignore_analytics') || host().includes('localhost');

  const sharedTags = (
    <>
      <meta name="author" content="Alefe Souza" />

      <meta name="theme-color" content="#2096cc" />

      <link rel="shortcut icon" href={host('favicon.ico')} />

      <link rel="manifest" href={host('manifest.json')} />
      <link rel="image_src" href={host('profile-photo-2x.jpg')} />

      <meta name="apple-mobile-web-app-title" content={i18n(SITE_NAME)} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <link
        rel="apple-touch-icon"
        sizes="60x60"
        href={host('icons/60x60.jpg')}
      />
      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href={host('icons/76x76.jpg')}
      />
      <link
        rel="apple-touch-icon"
        sizes="120x120"
        href={host('icons/120x120.jpg')}
      />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href={host('icons/152x152.jpg')}
      />
      <link
        rel="apple-touch-icon"
        sizes="167x167"
        href={host('icons/167x167.jpg')}
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={host('icons/180x180.jpg')}
      />

      <meta property="og:locale" content={i18n('en_US')} />
      <meta property="og:site_name" content={i18n(SITE_NAME)} />
      <meta property="fb:app_id" content="2951171431683266" />
      <meta property="fb:page_id" content="61550287721638" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@viajarcomale" />
      <meta name="twitter:site:id" content="1693645649789480960" />
      <meta name="twitter:creator" content="@alefesouza" />
      <meta name="twitter:creator:id" content="84677172" />

      {isBR ? (
        <meta
          name="facebook-domain-verification"
          content={process.env.NEXT_FACEBOOK_DOMAIN_VERIFICATION_BR}
        />
      ) : (
        <meta
          name="facebook-domain-verification"
          content={process.env.NEXT_FACEBOOK_DOMAIN_VERIFICATION}
        />
      )}
    </>
  );

  return (
    <html lang={i18n('en')}>
      {(ignoreAnalytics ||
        (pathname.includes('/webstories') &&
          headersList
            .get('x-searchparams')
            .includes('ignore_analytics=true'))) &&
        !host().includes('localhost') && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 12,
              height: 12,
              background: '#ff0000',
              borderRadius: 12,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        )}
      {!isAMP && (
        <head prefix={isMediaSingle ? 'video: https://ogp.me/ns/video#' : null}>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {sharedTags}
          {isMediaSingle &&
            (paths[5] === 'stories' || paths[5] === 'posts') && (
              <link
                rel="stylesheet"
                id="viewer-css"
                href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.css"
              />
            )}

          {isMediaSingle && paths[5] === '360-photos' && (
            <link
              rel="stylesheet"
              id="pannellum-css"
              href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
            />
          )}
          {pathname === '/' && (
            <>
              <Script
                id="ld-website"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'http://schema.org',
                    '@type': 'WebSite',
                    url: host(''),
                    author: 'Alefe Souza',
                    name: i18n(SITE_NAME),
                    alternateName: [
                      i18n(SITE_NAME),
                      '@ViajarComAlê',
                      'viajarcomale',
                      'VCA',
                      'Viajar com Alefe',
                    ],
                    description: i18n(
                      'Travel photos and links to Travel with Alefe social networks.'
                    ),
                    potentialAction: {
                      '@type': 'SearchAction',
                      target: {
                        '@type': 'EntryPoint',
                        urlTemplate: host('') + 'hashtags/{search_term_string}',
                      },
                      'query-input': 'required name=search_term_string',
                    },
                  }),
                }}
              ></Script>
              <Script
                id="ld-organization"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'http://schema.org',
                    '@type': 'Organization',
                    url: host(''),
                    logo: host('/icons/512x512.png'),
                    email: 'mailto:contato@viajarcomale.com',
                    sameAs: [
                      'https://instagram.com/viajarcomale',
                      'https://tiktok.com/@viajarcomale',
                      'https://youtube.com/@viajarcomale',
                      'https://twitter.com/viajarcomale',
                    ],
                  }),
                }}
              ></Script>
            </>
          )}
          {!ignoreAnalytics && (
            <>
              {/* eslint-disable-next-line @next/next/next-script-for-ga */}
              <script
                id="gtm"
                dangerouslySetInnerHTML={{
                  __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${
          isBR
            ? process.env.NEXT_GTM_TRACKING_BR
            : process.env.NEXT_GTM_TRACKING
        }');`,
                }}
              />
            </>
          )}
          {/* @ad */}
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6770185635428450"
            crossOrigin="anonymous"
          ></script>
        </head>
      )}

      {isAMP && (
        <>
          <head>
            {sharedTags}
            <script
              async
              src="https://cdn.ampproject.org/v0.js"
              className="amp-asset"
            ></script>
            <script
              async
              custom-element="amp-story"
              src="https://cdn.ampproject.org/v0/amp-story-1.0.js"
              className="amp-asset"
            ></script>
            <script
              async
              custom-element="amp-story-auto-analytics"
              src="https://cdn.ampproject.org/v0/amp-story-auto-analytics-0.1.js"
              className="amp-asset"
            ></script>
            <script
              async
              custom-element="amp-video"
              src="https://cdn.ampproject.org/v0/amp-video-0.1.js"
              className="amp-asset"
            ></script>
            <script
              async
              custom-element="amp-story"
              src="https://cdn.ampproject.org/v0/amp-story-1.0.js"
              className="amp-asset"
            ></script>
            {/* @ad */}
            <script
              async
              custom-element="amp-story-auto-ads"
              src="https://cdn.ampproject.org/v0/amp-story-auto-ads-0.1.js"
              className="amp-asset"
            ></script>
          </head>
          <body>{children}</body>
        </>
      )}

      {!isAMP && (
        <body
          className={[
            isSubPage ? 'sub-page' : null,
            isMediaSingle ? 'single-media-page' : null,
            getCookie('window_controls_overlay')
              ? 'window-controls-overlay'
              : null,
          ]
            .filter((c) => c)
            .join(' ')}
        >
          {!ignoreAnalytics && (
            <noscript>
              <iframe
                src={
                  'https://www.googletagmanager.com/ns.html?id=' +
                  (isBR
                    ? process.env.NEXT_GTM_TRACKING_BR
                    : process.env.NEXT_GTM_TRACKING)
                }
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              ></iframe>
            </noscript>
          )}

          <div className="background"></div>

          <div id="loader-spinner">
            <span className="loader"></span>
          </div>

          <nav className="navbar mobile-navbar">
            <div
              className="container"
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <Link className="navbar-brand" href="/">
                <img
                  src="/icons/96x96.png"
                  width={48}
                  height={48}
                  alt={i18n('Travel with Alefe Icon')}
                />
                <span className="site-name">{i18n(SITE_NAME)}</span>
              </Link>

              <NavbarLinks />
            </div>
          </nav>

          <header className="container">
            <div id="title-bar">
              <img
                src={host('/icons/72x72.png')}
                alt={i18n('Travel with Alefe Icon')}
                width={36}
                height={36}
              />

              <span>{i18n(SITE_NAME)}</span>

              <NavbarLinks />
            </div>

            <div className="mobile-autocomplete">
              <Autocomplete />
            </div>
          </header>

          <div className="main-container">
            <aside
              className={'sidebar' + (pathname === '/' ? ' home-page' : '')}
            >
              <Sidebar />
            </aside>
            <main className={'main' + (pathname === '/' ? ' home-page' : '')}>
              {children}
            </main>
          </div>

          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <Script id="app" src={host('app.js')} />

          {!ignoreAnalytics && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${
                  isBR
                    ? process.env.NEXT_GA_TRACKING_BR
                    : process.env.NEXT_GA_TRACKING
                }`}
              />
              <script
                async
                id="analytics"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag() { dataLayer.push(arguments); }
                    gtag('js', new Date());

                    gtag('config', '${
                      isBR
                        ? process.env.NEXT_GA_TRACKING_BR
                        : process.env.NEXT_GA_TRACKING
                    }');
                  `,
                }}
              />
            </>
          )}
        </body>
      )}
    </html>
  );
}

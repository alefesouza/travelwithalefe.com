import './globals.css';
import { customInitApp } from './firebase';
customInitApp();
import useHost from './hooks/use-host';
import useI18n from './hooks/use-i18n';
import { SITE_NAME } from './utils/constants';
import NavbarLinks from './components/navbar-links';
import defaultMetadata from './utils/default-metadata';
import Sidebar from './components/sidebar';
import Link from 'next/link';
import Autocomplete from './components/autocomplete';
import useEditMode from './utils/use-edit-mode';

export async function generateMetadata() {
  return defaultMetadata();
}

export default async function RootLayout({ children }) {
  const host = useHost();
  const i18n = useI18n();
  const isBR = process.env.NEXT_PUBLIC_LOCALE === 'pt-BR';

  const ignoreAnalytics = process.env.NODE_ENV === 'development';

  const editMode = await useEditMode();

  const sharedTags = (
    <>
      <meta name="author" content="Alefe Souza" />

      <meta name="theme-color" content="#2096cc" />

      <link rel="shortcut icon" href={host('favicon.ico')} />

      <link rel="manifest" href={host('manifest.json')} />
      <link rel="image_src" href={host('profile-photo-2x.jpg')} />

      <meta name="apple-mobile-web-app-title" content={i18n(SITE_NAME)} />
      <meta name="mobile-web-app-capable" content="yes" />
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
      <meta
        name="fediverse:creator"
        content={
          isBR
            ? '@viajarcomale@mastodon.social'
            : '@travelwithalefe@mastodon.social'
        }
      />

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {sharedTags}
        <link
          rel="stylesheet"
          id="viewer-css"
          href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.css"
        />
        <link
          rel="stylesheet"
          id="pannellum-css"
          href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
        />
        <script
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
        ></script>
        <script
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
        ></script>
      </head>

      <body suppressHydrationWarning>
        <div className="background"></div>

        <div id="loader-spinner" suppressHydrationWarning>
          <span className="loader"></span>
        </div>

        <nav className="navbar mobile-navbar" suppressHydrationWarning>
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <Link className="navbar-brand" href="/" prefetch={false}>
              <img
                src="/icons/96x96.png"
                width={48}
                height={48}
                alt={i18n('Travel with Alefe Icon')}
              />
              <span className="site-name" suppressHydrationWarning>
                {i18n(SITE_NAME)}
              </span>
            </Link>

            <NavbarLinks />
          </div>
        </nav>

        <header className="container" suppressHydrationWarning>
          <div id="title-bar">
            <Link href="/" className="title-bar-logo" prefetch={false}>
              <img
                src={host('/icons/72x72.png')}
                alt={i18n('Travel with Alefe Icon')}
                width={36}
                height={36}
              />
            </Link>

            <Link href="/" prefetch={false} className="title-bar-title">
              <span>{i18n(SITE_NAME)}</span>
            </Link>

            <NavbarLinks />
          </div>

          <div className="mobile-autocomplete">
            <Autocomplete />
          </div>
        </header>

        <div className="main-container">
          <aside className={'sidebar'} suppressHydrationWarning>
            <Sidebar />
          </aside>
          <main className={'main'} suppressHydrationWarning>
            {children}
          </main>
        </div>

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

        <script async src={host('/app.js')}></script>
        {editMode.editMode && (
          <>
            <script
              async
              src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"
            ></script>

            <script
              async
              src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"
            ></script>
          </>
        )}
      </body>
    </html>
  );
}

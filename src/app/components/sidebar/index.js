import links from '@/app/utils/links';
import HomeButton from '@/app/components/home-button';
import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import styles from '@/app/page.module.css';
import countries from '@/app/utils/countries';
import { UAParser } from 'ua-parser-js';
import { headers } from 'next/headers';
import Top from '@/app/components/top';
import Footer from '@/app/components/footer';
import Autocomplete from '@/app/components/autocomplete';
import NavbarLinks from '@/app/components/navbar-links';
import { SITE_NAME } from '@/app/utils/constants';
import AdSense from '@/app/components/adsense';
import socialLinks from '@/app/utils/social-links';

export default async function Sidebar({ isSubPage }) {
  const host = useHost();
  const i18n = useI18n();
  const isBR = host().includes('viajarcomale.com.br');
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';

  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: `<!-- ${isWindows ? 's' : 'n'}---
        ${headers().get('user-agent')}---
        ${new UAParser(headers().get('user-agent')).getOS().name} -->`,
        }}
      ></div>
      <nav className="navbar">
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
      <div className="container">
        <Autocomplete />
      </div>

      <div style={{ marginTop: 36 }}>
        {isSubPage ? (
          <AdSense index="sidebar" isTopBanner isSidebar />
        ) : (
          <AdSense index="main" isTopBanner />
        )}
      </div>

      <Top />
      <div className="container">
        <h2 className={styles.headline}>
          {i18n('My photos and videos by country')}
        </h2>
        <div className={styles.country_selector}>
          {countries.map((c) => (
            <Link
              href={`/countries/${c.slug}`}
              key={c.name}
              className={styles.country}
              prefetch={false}
            >
              <div className={styles.country_flag}>
                {isWindows ? (
                  <img
                    src={host('/flags/' + c.slug + '.png')}
                    alt={i18n(c.name)}
                    width={30}
                    height={30}
                  />
                ) : (
                  c.flag
                )}
              </div>
              <span>{i18n(c.name)}</span>
            </Link>
          ))}
        </div>
        <div className="list-group">
          {links.slice(0, 5).map((l) => (
            <HomeButton
              key={l.text}
              text={i18n(l.text)}
              url={isBR && l.url_pt ? l.url_pt : l.url}
              image={l.image ? host(l.image) : null}
              subpage={l.subpage}
            />
          ))}
          <div style={{ display: 'flex', gap: 16 }}>
            {socialLinks.slice(0, 2).map((l) => (
              <HomeButton
                key={l.text}
                text={i18n(l.text)}
                url={isBR && l.url_pt ? l.url_pt : l.url}
                image={l.image ? host(l.image) : null}
                subpage={l.subpage}
                style={{ width: '50%' }}
                rel="me"
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {socialLinks.slice(2, 4).map((l) => (
              <HomeButton
                key={l.text}
                text={i18n(l.text)}
                url={isBR && l.url_pt ? l.url_pt : l.url}
                image={l.image ? host(l.image) : null}
                subpage={l.subpage}
                style={{ width: '50%' }}
                rel="me"
              />
            ))}
          </div>
          {links.slice(5, 10).map((l) => (
            <HomeButton
              key={l.text}
              text={i18n(l.text)}
              url={isBR && l.url_pt ? l.url_pt : l.url}
              image={l.image ? host(l.image) : null}
              subpage={l.subpage}
            />
          ))}
          <a
            href="#"
            id="add-to-home"
            className="list-group-item list-group-item-action"
            style={{ display: 'none' }}
          >
            {i18n('Add to Home Screen')}
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}

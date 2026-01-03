import links from '@/app/utils/links';
import HomeButton from '@/app/components/home-button';
import useI18n from '@/app/hooks/use-i18n';
import useHost from '@/app/hooks/use-host';
import Link from 'next/link';
import styles from '@/app/page.module.css';
import countries from '@/app/utils/countries';
import { getCountryLink } from '@/app/utils/country-link-helper';
import Top from '@/app/components/top';
import Footer from '@/app/components/footer';
import Autocomplete from '@/app/components/autocomplete';
import NavbarLinks from '@/app/components/navbar-links';
import { SITE_NAME } from '@/app/utils/constants';
import socialLinks from '@/app/utils/social-links';
import RandomPostButton from '@/app/components/random-post-button';

export default async function Sidebar() {
  const host = await useHost();
  const i18n = await useI18n();
  const isBR = process.env.NEXT_PUBLIC_LOCALE === 'pt-BR';

  return (
    <>
      <nav className="navbar" suppressHydrationWarning>
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
            <span className="site-name">{i18n(SITE_NAME)}</span>
          </Link>

          <NavbarLinks />
        </div>
      </nav>
      <div className="container">
        <Autocomplete />
      </div>

      <Top />
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          <h2 className={styles.headline}>
            {i18n('My photos and videos by country')}
          </h2>
          <RandomPostButton text={i18n('Random post')} />
        </div>
        <div className={styles.country_selector}>
          {countries
            .sort((a, b) => a.order - b.order)
            .map((c) => (
              <Link
                href={getCountryLink(c)}
                key={c.name}
                className={styles.country}
                prefetch={false}
              >
                <div
                  className={'country-emoji-flag ' + styles.country_flag}
                  data-country-slug={c.slug}
                  data-country-name={i18n(c.name)}
                  suppressHydrationWarning
                >
                  {c.flag}
                </div>
                <span>{i18n(c.name)}</span>
              </Link>
            ))}
        </div>
        <div className="list-group">
          {links.slice(0, 6).map((l) => (
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
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {socialLinks.slice(2, 5).map((l) => (
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
          {links.slice(6, 15).map((l) => (
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

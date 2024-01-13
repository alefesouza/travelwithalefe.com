import links from './utils/links';
import HomeButton from './components/home-button';
import useI18n from './hooks/use-i18n';
import useHost from './hooks/use-host';
import Link from 'next/link';
import defaultMetadata from './utils/default-metadata';
import styles from './page.module.css';
import countries from './utils/countries';
import { UAParser } from 'ua-parser-js';
import { headers } from 'next/headers';

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();

  const defaultMeta = defaultMetadata();

  return {
    ...defaultMeta,
    alternates: {
      ...defaultMeta.alternates,
      types: {
        'application/rss+xml': host('/rss'),
      },
    },
  };
}

export default async function Home() {
  const host = useHost();
  const i18n = useI18n();
  const isBR = host().includes('viajarcomale.com.br');
  const isWindows =
    new UAParser(headers().get('user-agent')).getOS().name === 'Windows';

  return (
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
        {links.map((l) => (
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
  );
}

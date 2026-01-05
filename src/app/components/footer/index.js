import useHost from '@/app/hooks/use-host';
import useI18n from '@/app/hooks/use-i18n';
import { UAParser } from 'ua-parser-js';
import styles from './index.module.css';
import Link from 'next/link';

export default async function Footer() {
  const host = useHost();
  const i18n = useI18n();
  const isBR = process.env.NEXT_PUBLIC_LOCALE === 'pt-BR';

  return (
    <footer>
      <div className="container">
        <div className="bottom_links">
          <a href="https://instagram.com/viajarcomale" target="_blank">
            <img
              src={host('logos/instagram.png')}
              width={32}
              height={32}
              alt={i18n('Instagram Icon')}
            />
          </a>
          <a href="https://tiktok.com/@viajarcomale" target="_blank">
            <img
              src={host('logos/tiktok.png')}
              width={32}
              height={32}
              alt={i18n('TikTok Icon')}
            />
          </a>
          <a href="https://youtube.com/c/alefesouza" target="_blank">
            <img
              src={host('logos/youtube.png')}
              width={32}
              height={22}
              alt={i18n('YouTube Icon')}
            />
          </a>
          <a href="mailto:contato@viajarcomale.com" className="email_icon">
            @
          </a>
        </div>

        <div className="stickers">
          <img
            src={host('icons/144x144.png')}
            srcSet={host('icons/any.svg')}
            width={144}
            height={144}
            alt={i18n('Travel with Alefe Icon')}
          />
        </div>
      </div>

      <div className={styles.footer + ' container'}>
        <div className={styles.footer_links}>
          <div>
            <a
              href={
                isBR
                  ? 'https://travelwithalefe.com'
                  : 'https://viajarcomale.com.br'
              }
              id="language-switcher"
              suppressHydrationWarning
            >
              {isBR ? 'English Website' : 'Site em Português'}
            </a>
            <span>•</span>
            <a href={host('/rss')} target="_blank">
              RSS Feed
            </a>
          </div>
          <div>
            <span className={styles.hide_mobile}>•</span>
            <Link href={host('/privacy-policy')} prefetch={false}>
              {i18n('Privacy Policy')}
            </Link>
            <span>•</span>
            <Link href={host('/contact')} target="_blank" prefetch={false}>
              {i18n('Contact')}
            </Link>
          </div>
        </div>

        <div
          className="developed-by"
          dangerouslySetInnerHTML={{
            __html: i18n('Developed by AS.dev').replace(
              'AS.dev',
              '<a href="https://as.dev" target="_blank">AS.dev</a>'
            ),
          }}
        />

        <div style={{ marginTop: '4px' }}>
          <a
            href={host('https://github.com/alefesouza/travelwithalefe.com')}
            target="_blank"
          >
            {i18n('Available on GitHub')}
          </a>
        </div>
      </div>
    </footer>
  );
}

import useHost from '@/app/hooks/use-host';
import { headers } from 'next/headers';
import useI18n from '@/app/hooks/use-i18n';
import { UAParser } from 'ua-parser-js';
import styles from './index.module.css';
import Link from 'next/link';

export default async function Footer() {
  const host = await useHost();
  const i18n = await useI18n();
  const isBR = host().includes('viajarcomale.com.br');
  const headersList = await headers();
  const isWindows =
    new UAParser((await headers()).get('user-agent')).getOS().name ===
    'Windows';

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
          <img
            src={host('images/asexplore-144.png')}
            srcSet={host('images/asexplore-288.png') + ' 2x'}
            width={144}
            height={144}
            alt={i18n('ASExplore Icon')}
          />
        </div>
      </div>

      <div className={styles.footer + ' container'}>
        <div className={styles.footer_links}>
          <div>
            <a
              href={
                (isBR
                  ? 'https://travelwithalefe.com'
                  : 'https://viajarcomale.com.br') +
                headersList.get('x-pathname')
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
            __html:
              i18n('Developed by AS.dev').replace(
                'AS.dev',
                '<a href="https://as.dev" target="_blank">AS.dev</a>'
              ) +
              (isWindows
                ? '<br><br>' +
                  i18n('Flag emojis by Twemoji').replace(
                    'Twemoji',
                    '<a href="https://twemoji.twitter.com/" target="_blank">Twemoji</a>'
                  )
                : ''),
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

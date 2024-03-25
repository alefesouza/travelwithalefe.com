import useHost from '../hooks/use-host';
import useI18n from '../hooks/use-i18n';
import { SITE_NAME } from '../utils/constants';

export async function GET() {
  const host = useHost();
  const i18n = useI18n();

  const icons = [36, 48, 72, 96, 144, 192, 288, 512];

  const obj = {
    name: i18n(SITE_NAME),
    short_name: i18n(SITE_NAME),
    description: i18n(
      'Travel photos and links to Travel with Alefe social networks.'
    ),
    categories: ['travel'],
    lang: i18n('en-US'),
    start_url: '/?source=pwa',
    display: 'standalone',
    orientation: 'any',
    background_color: '#2096cc',
    theme_color: '#2096cc',
    display_override: ['window-controls-overlay', 'minimal-ui'],
    edge_side_panel: {},
    icons: [
      ...icons.map((size) => ({
        src: host(`icons/${size}x${size}.png`),
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any',
      })),
      {
        src: host('icons/any.svg'),
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: host('icons/any-maskable.svg'),
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: i18n('Albums'),
        short_name: i18n('Albums'),
        description: i18n('Access Travel with Alefe Albums'),
        url: '/countries?source=pwa',
        icons: [
          {
            src: host('icons/96x96.png'),
            sizes: '96x96',
          },
        ],
      },
      {
        name: 'Instagram',
        short_name: 'Instagram',
        description: i18n('Access Travel with Alefe Instagram'),
        url: '/instagram?source=pwa',
        icons: [
          {
            src: host('logos/instagram96.png'),
            sizes: '96x96',
          },
        ],
      },
      {
        name: 'TikTok',
        short_name: 'TikTok',
        description: i18n('Access Travel with Alefe TikTok'),
        url: '/tiktok?source=pwa',
        icons: [
          {
            src: host('logos/tiktok96.png'),
            sizes: '96x96',
          },
        ],
      },
      {
        name: 'YouTube',
        short_name: 'YouTube',
        description: i18n('Access Travel with Alefe YouTube channel'),
        url: '/youtube?source=pwa',
        icons: [
          {
            src: host('logos/youtube96.png'),
            sizes: '96x96',
          },
        ],
      },
    ],
    screenshots: [
      {
        src: host('screenshots/1.jpg'),
        type: 'image/jpeg',
        sizes: '390x844',
      },
      {
        src: host('screenshots/2.jpg'),
        type: 'image/jpeg',
        sizes: '390x844',
      },
      {
        src: host('screenshots/3.jpg'),
        type: 'image/jpeg',
        sizes: '390x844',
      },
      {
        src: host('screenshots/4.jpg'),
        type: 'image/jpeg',
        sizes: '1280x800',
        form_factor: 'wide',
      },
      {
        src: host('screenshots/5.jpg'),
        type: 'image/jpeg',
        sizes: '1280x800',
        form_factor: 'wide',
      },
      {
        src: host('screenshots/6.jpg'),
        type: 'image/jpeg',
        sizes: '1280x800',
        form_factor: 'wide',
      },
    ],
    protocol_handlers: [
      {
        protocol: 'web+viajarcomale',
        url: '/link?url=%s',
      },
      {
        protocol: 'web+vca',
        url: '/link?url=%s',
      },
    ],
  };

  return new Response(JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json' },
  });
}

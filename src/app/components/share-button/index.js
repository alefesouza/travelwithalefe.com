'use client';

import { SITE_NAME } from '@/app/utils/constants';
import useI18nClient from '@/app/hooks/use-i18n-client';

export default function ShareButton({ text, url }) {
  const i18n = useI18nClient();

  const onShareClick = () => {
    if ('share' in navigator) {
      const shareData = {
        title: i18n(SITE_NAME),
        text: text || document.title,
        url: url || window.location.href,
      };

      navigator.share(shareData);
      return;
    }

    const clipBoard = navigator.clipboard;
    clipBoard
      .writeText((text || document.title) + ' ' + (url || window.location.href))
      .then(() => {
        alert(i18n('Link copied to clipboard.'));
      });
  };

  return (
    <div role="button" onClick={onShareClick} style={{ height: 32 }}>
      <img
        src="/images/share.svg"
        alt={i18n('Share')}
        title={i18n('Share')}
        width="32px"
        style={{ cursor: 'pointer' }}
      ></img>
    </div>
  );
}

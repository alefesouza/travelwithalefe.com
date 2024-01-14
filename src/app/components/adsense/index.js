'use client';
/* @ad */
import { useEffect, useRef } from 'react';

export default function AdSense({ index, isScroller }) {
  const loaded = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      if (loaded.current === index) {
        return;
      }

      loaded.current = index;
      (adsbygoogle = window.adsbygoogle || []).push({});
    }

    setTimeout(() => {
      if (
        typeof window !== 'undefined' &&
        window.adsbygoogle &&
        document.querySelector('.adsbygoogle:not([data-ad-status])') &&
        loaded.current !== index
      ) {
        (adsbygoogle = window.adsbygoogle || []).push({});
        loaded.current = index;
      }
    }, 1000);
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: 'block',
        textAlign: 'center',
        margin: '0 auto',
        height: isScroller ? 280 : null,
      }}
      data-ad-client="ca-pub-6770185635428450"
      data-ad-slot={isScroller ? '8751581776' : '2160336859'}
      data-ad-format="auto"
      data-full-width-responsive={isScroller ? 'false' : 'true'}
      data-adtest="on"
    ></ins>
  );
}

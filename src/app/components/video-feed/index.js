'use client';

import mediaToUrl from '@/app/utils/media-to-url';
import { VerticalFeed } from '../vertical-feed';

import styles from './style.module.css';
import { useState } from 'react';
import { FILE_DOMAIN } from '@/app/utils/constants';
import Link from 'next/link';

export default function VideoFeed({
  openText,
  swipeUpText,
  tapToUnmuteText,
  iOSVideoFeedWarningMessage,
  iOSVideoFeedWarningMessage2,
  initialVideos,
}) {
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const startMuted =
    (typeof window !== 'undefined' && !window.navbarClicked) ||
    (typeof navigator !== 'undefined' &&
      !navigator.userActivation?.hasBeenActive);

  const [showSwipeUp, setShowSwipeUp] = useState(true);
  const [showUnmuteButton, setShowUnmuteButton] = useState(startMuted);
  const [videos, setVideos] = useState(
    initialVideos.map((video) => ({
      ...video,
      src: FILE_DOMAIN + video.file,
      muted: startMuted,
      controls: false,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleItemVisible = async (item, index) => {
    if (index !== 0) {
      setShowSwipeUp(false);
    }

    if (index !== videos.length - 2) {
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    const response = await fetch('/api/random-videos');
    const json = await response.json();
    const newVideos = json.videos;

    setVideos((prevVideos) =>
      [...prevVideos, ...newVideos].map((video) => ({
        ...video,
        src: FILE_DOMAIN + video.file,
      }))
    );

    setIsLoading(false);
  };

  const renderVideoOverlay = (item, index) => {
    return (
      <>
        <div
          style={{
            position: 'absolute',
            right: '20px',
            bottom: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              padding: '8px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Link
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
              href={mediaToUrl(item)}
            >
              <span style={{ color: 'white', fontSize: '14px' }}>
                {openText}
              </span>
            </Link>
          </div>
        </div>

        {index === 0 && showUnmuteButton && (
          <div
            className={styles.unmuteButtonContainer}
            suppressHydrationWarning
          >
            <div className={styles.unmuteButton}>
              <span style={{ fontSize: '20px' }}>🔊</span>
              {tapToUnmuteText}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <VerticalFeed
      items={videos}
      onItemVisible={handleItemVisible}
      className={styles.video_feed}
      renderItemOverlay={renderVideoOverlay}
      isIOS={isIOS}
      suppressHydrationWarning
      iOSVideoFeedWarningMessage={iOSVideoFeedWarningMessage}
      iOSVideoFeedWarningMessage2={iOSVideoFeedWarningMessage2}
      swipeUpComponent={
        showSwipeUp && (
          <div className={styles.swipeUpIndicator}>
            <div className={styles.swipeUpText}>{swipeUpText}</div>
            <div className={styles.swipeUpArrow}>↑</div>
          </div>
        )
      }
    />
  );
}

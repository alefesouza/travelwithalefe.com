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
  refreshText,
  homeText,
  iOSVideoFeedWarningMessage,
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

    const newVideos = await getMoreVideos();

    setVideos((prevVideos) =>
      [...prevVideos, ...newVideos].map((video) => ({
        ...video,
        src: FILE_DOMAIN + video.file,
      }))
    );
  };

  const getMoreVideos = async () => {
    setIsLoading(true);

    const response = await fetch('/api/random-videos');
    const json = await response.json();
    const newVideos = json.videos;

    setIsLoading(false);

    return newVideos;
  };

  const handleRefreshClick = async () => {
    const newVideos = await getMoreVideos();

    setVideos(
      newVideos.map((video) => ({
        ...video,
        src: FILE_DOMAIN + video.file,
      }))
    );

    document.getElementById('vertical-feed-container').scrollTo({
      top: 0,
    });

    window.navbarClicked = true;
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
          <Link
            className={styles.button}
            href={mediaToUrl(item)}
            title={openText}
            prefetch={false}
          >
            <img src="/images/open.svg" width={24} height={24} alt={openText} />
          </Link>
          <button
            className={styles.button}
            onClick={handleRefreshClick}
            title={refreshText}
          >
            <img
              src="/images/refresh.svg"
              width={24}
              height={24}
              alt={refreshText}
            />
          </button>
          <Link
            className={styles.button + ' ' + styles.homeButton}
            href="/"
            prefetch={false}
            title={homeText}
          >
            <img src="/images/home.svg" width={24} height={24} alt={homeText} />
          </Link>
        </div>

        {index === 0 &&
          typeof window !== 'undefined' &&
          !window.unmutedVideo && (
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

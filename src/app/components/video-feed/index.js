'use client';

import mediaToUrl from '@/app/utils/media-to-url';
import { VerticalFeed } from '../vertical-feed';

import styles from './style.module.css';
import { useEffect, useState } from 'react';
import { FILE_DOMAIN } from '@/app/utils/constants';
import Link from 'next/link';

export default function VideoFeed({
  openText,
  swipeUpText,
  tapToUnmuteText,
  initialVideos,
}) {
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const [showSwipeUp, setShowSwipeUp] = useState(true);
  const [showUnmuteButton, setShowUnmuteButton] = useState(
    (isIOS && !window.videosClicked) ||
      (typeof navigator !== 'undefined' &&
        !navigator.userActivation?.hasBeenActive)
  );
  const [videos, setVideos] = useState(
    initialVideos.map((video) => ({
      ...video,
      src: FILE_DOMAIN + video.file,
      muted:
        (isIOS && !window.videosClicked) ||
        (typeof navigator !== 'undefined' &&
          !navigator.userActivation?.hasBeenActive),
      controls: false,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(
    initialVideos.length > 0 ? initialVideos[0].id : null
  );

  const handleItemVisible = async (item, index) => {
    if (index !== 0) {
      setShowSwipeUp(false);
    }

    setCurrentVideoId(item.id);

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

  const handleUnmute = () => {
    setShowUnmuteButton(false);

    const currentVideo = document.getElementById(currentVideoId);
    if (currentVideo) {
      currentVideo.muted = false;
      currentVideo.setAttribute('controls', 'true');

      setVideos((prevVideos) => {
        return prevVideos.map((video) => {
          if (video.id === currentVideoId) {
            return { ...video, muted: false };
          }
          return video;
        });
      });
    }
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
          <div onClick={handleUnmute} className={styles.unmuteButtonContainer}>
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
      currentVideoId={currentVideoId}
      suppressHydrationWarning
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

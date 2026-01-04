'use client';

import mediaToUrl from '@/app/utils/media-to-url';
import { VerticalFeed } from '../vertical-feed';

import styles from './style.module.css';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function VideoFeed({ openText, swipeUpText, initialVideos }) {
  const [userInteracted, setUserInteracted] = useState(
    typeof navigator !== 'undefined' && navigator.userActivation?.hasBeenActive
  );
  const [showSwipeUp, setShowSwipeUp] = useState(true);
  const [videos, setVideos] = useState(
    initialVideos.map((video) => ({
      ...video,
      src: video.file,
      controls: true,
      autoPlay: true,
      muted: !(
        typeof navigator !== 'undefined' &&
        navigator.userActivation?.hasBeenActive
      ),
      loop: true,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeUp(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleItemVisible = async (item, index) => {
    if (index === 1) {
      setShowSwipeUp(false);
    }

    if (!userInteracted && navigator.userActivation.hasBeenActive) {
      setUserInteracted(true);
      setVideos((prevVideos) =>
        prevVideos.map((video) => ({
          ...video,
          autoPlay: true,
          muted: false,
        }))
      );
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

    const { hasBeenActive } = navigator.userActivation;

    setVideos((prevVideos) =>
      [...prevVideos, ...newVideos].map((video) => ({
        ...video,
        src: video.file,
        controls: true,
        autoPlay: true,
        muted: !hasBeenActive,
        loop: true,
      }))
    );

    setIsLoading(false);
  };

  const renderVideoOverlay = (item) => {
    return (
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
          <button
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
            onClick={() => {
              router.push(mediaToUrl(item));
            }}
          >
            <span style={{ color: 'white', fontSize: '14px' }}>{openText}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <VerticalFeed
      items={videos}
      onItemVisible={handleItemVisible}
      className={styles.video_feed}
      renderItemOverlay={renderVideoOverlay}
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

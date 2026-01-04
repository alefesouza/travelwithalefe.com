'use client';

import mediaToUrl from '@/app/utils/media-to-url';
import { VerticalFeed } from '../vertical-feed';

import styles from './style.module.css';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FILE_DOMAIN } from '@/app/utils/constants';
import Link from 'next/link';

export default function VideoFeed({ openText, swipeUpText, initialVideos }) {
  const [showSwipeUp, setShowSwipeUp] = useState(true);
  const [videos, setVideos] = useState(
    initialVideos.map((video) => ({
      ...video,
      src: FILE_DOMAIN + video.file,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);

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
            <span style={{ color: 'white', fontSize: '14px' }}>{openText}</span>
          </Link>
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

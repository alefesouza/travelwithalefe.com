import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from 'react';

export const VerticalFeed = ({
  items,
  onEndReached,
  loadingComponent,
  errorComponent,
  className,
  style,
  onItemVisible,
  onItemHidden,
  onItemClick,
  threshold = 0.75,
  scrollBehavior = 'smooth',
  renderItemOverlay,
  swipeUpComponent,
  isIOS,
  currentVideoId,
}) => {
  const containerRef = useRef(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});

  const handleMediaLoad = useCallback((index) => {
    setLoadingStates((prev) => ({ ...prev, [index]: false }));
  }, []);

  const handleMediaError = useCallback((index) => {
    setErrorStates((prev) => ({ ...prev, [index]: true }));
    setLoadingStates((prev) => ({ ...prev, [index]: false }));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(
            entry.target.getAttribute('data-index') || '0',
            10
          );
          const item = items[index];

          if (entry.isIntersecting) {
            const video = entry.target.querySelector('video');

            if (video) {
              if (
                (isIOS && !window.videosClicked) ||
                (typeof navigator !== 'undefined' &&
                  !navigator.userActivation?.hasBeenActive)
              ) {
                video.setAttribute('muted', 'true');
                video.muted = true;
              } else {
                video.removeAttribute('muted');
                video.muted = false;
              }

              video.play().catch((error) => {
                console.error('Error playing video:', error);
              });
            }
            onItemVisible?.(item, index);
          } else {
            const video = entry.target.querySelector('video');
            if (video) {
              video.pause();
            }
            onItemHidden?.(item, index);
          }
        });
      },
      {
        threshold,
      }
    );

    const mediaElements =
      containerRef.current?.querySelectorAll('[data-index]') || [];
    mediaElements.forEach((media) => observer.observe(media));

    return () => {
      observer.disconnect();
    };
  }, [items, onItemVisible, onItemHidden, threshold]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !onEndReached) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      onEndReached();
    }
  }, [onEndReached]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!containerRef.current) return;

      const { scrollTop, clientHeight } = containerRef.current;
      const scrollAmount = clientHeight;

      if (!containerRef.current.scrollTo) return;

      switch (e.key) {
        case 'ArrowDown':
          containerRef.current.scrollTo({
            top: scrollTop + scrollAmount,
            behavior: scrollBehavior,
          });
          break;
        case 'ArrowUp':
          containerRef.current.scrollTo({
            top: scrollTop - scrollAmount,
            behavior: scrollBehavior,
          });
          break;
      }
    },
    [scrollBehavior]
  );

  const defaultRenderItem = useCallback(
    (item, index) => {
      const isLoading = loadingStates[index] ?? true;
      const hasError = errorStates[index] ?? false;

      return (
        <div
          key={item.id || index}
          data-index={index}
          onClick={() => onItemClick?.(item, index)}
          style={{
            height: '100dvh',
            scrollSnapAlign: 'start',
            position: 'relative',
            cursor: onItemClick ? 'pointer' : 'default',
          }}
          role="region"
          aria-label={`video ${index + 1}`}
        >
          {isLoading && loadingComponent}
          {hasError && errorComponent}
          <video
            src={item.src}
            muted={item.muted ?? true}
            playsInline
            loop
            onLoadedData={() => handleMediaLoad(index)}
            onError={() => handleMediaError(index)}
            onClick={(event) => {
              event.target.setAttribute('controls', 'true');
              event.target.removeAttribute('muted');
              event.target.muted = false;
            }}
            id={item.id}
            poster={item.src.replace('.mp4', '-thumb.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: hasError ? 'none' : 'block',
            }}
            data-current={item.id === currentVideoId}
            suppressHydrationWarning
          />
          {renderItemOverlay && renderItemOverlay(item, index)}
        </div>
      );
    },
    [
      loadingStates,
      errorStates,
      loadingComponent,
      errorComponent,
      handleMediaLoad,
      handleMediaError,
      onItemClick,
      renderItemOverlay,
    ]
  );

  const mediaElements = useMemo(
    () =>
      items ? items.map((item, index) => defaultRenderItem(item, index)) : [],
    [items, defaultRenderItem]
  );

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="feed"
      aria-label="Vertical video feed"
      className={className}
      style={{
        height: '100dvh',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        outline: 'none',
        position: 'relative',
        ...style,
      }}
    >
      {mediaElements}

      {swipeUpComponent}
    </div>
  );
};

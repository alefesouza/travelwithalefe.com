'use client';

import ReactWordcloud from '@/app/components/lib/react-wordcloud';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import { useState } from 'react';
import { shuffleArray } from '@/app/utils/media-sorting';

export default function HashtagCloud({
  theHashtags,
  isRandom,
  shuffleText,
  isAndroid,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [hashtags, setHashtags] = useState(theHashtags);

  const callbacks = {
    getWordTooltip: (word) => `${word.text}`,
  };

  const handleShuffle = async () => {
    const today = new Date().toISOString().split('T')[0];

    if (today === localStorage.getItem('hashtags_updated')) {
      const hashtags = JSON.parse(localStorage.getItem('hashtags')).map(
        (h) => ({ text: '#' + h, value: 5 })
      );
      setHashtags(shuffleArray(hashtags).slice(0, 100));
      return;
    }

    setIsLoading(true);

    const result = await fetch('/api/hashtags');
    const data = await result.text();

    setIsLoading(false);

    const hashtags = JSON.parse(data).map((h) => ({ text: '#' + h, value: 5 }));
    setHashtags(shuffleArray(hashtags).slice(0, 100));

    localStorage.setItem('hashtags', data);
    localStorage.setItem(
      'hashtags_updated',
      new Date().toISOString().split('T')[0]
    );
  };

  const options = {
    fontFamily: 'Impact',
    fontSizes: [14, 40],
    scale: 'linear',
    spiral: 'archimedean',
    fontWeight: isAndroid ? 'bold' : 'normal',
    rotations: 0,
    rotationAngles: [-180, 180],
    transitionDuration: 0,
  };

  return (
    <div>
      {isRandom && (
        <div className="center_link" style={{ marginBottom: 16 }}>
          <button onClick={handleShuffle} disabled={isLoading}>
            {shuffleText}
          </button>
        </div>
      )}

      <div>
        <ReactWordcloud
          className="hashtag-cloud"
          words={
            typeof window !== 'undefined' && window.innerWidth < 680 && isRandom
              ? hashtags.slice(0, 50)
              : hashtags
          }
          options={options}
          callbacks={callbacks}
          size={[
            typeof window !== 'undefined' && window.innerWidth < 680
              ? window.innerWidth - 24
              : 680,
            isRandom ? 700 : 420,
          ]}
        />
      </div>
    </div>
  );
}

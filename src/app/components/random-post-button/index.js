'use client';

import { useRouter } from 'next/navigation';
import styles from './random-post-button.module.css';
import { useState } from 'react';

export default function RandomPostButton({ text }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRandomPost = async () => {
    setIsLoading(true);

    try {
      // Fetch random media URL from API
      const response = await fetch('/api/random');
      const data = await response.json();

      // Navigate to the random post
      router.push(data.url);
    } catch (error) {
      console.error('Error fetching random post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={styles.randomButtonContainer + ' random-post-button-container'}
    >
      <button
        className={styles.randomButton + ' random-post-button'}
        aria-label={text}
        onClick={handleRandomPost}
        disabled={isLoading}
      >
        🎲 {text}
      </button>
    </div>
  );
}

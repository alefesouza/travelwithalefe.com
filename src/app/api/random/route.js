import { NextResponse } from 'next/server';
import { cachedMedias } from '@/app/utils/cache-medias';
import getTypePath from '@/app/utils/get-type-path';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // Get a random media from the cache
  const randomIndex = Math.floor(Math.random() * cachedMedias.length);
  const randomMedia = cachedMedias[randomIndex];

  // Process the media ID
  let mediaId = randomMedia.id
    .replace(randomMedia.city + '-post-', '')
    .replace(randomMedia.city + '-story-', '')
    .replace(randomMedia.city + '-youtube-', '')
    .replace(randomMedia.city + '-short-video-', '')
    .replace(randomMedia.city + '-360photo-', '')
    .replace(randomMedia.city + '-maps-', '')
    .replace('road-trip-sea-las-story-', '')
    .replace('road-trip-sea-las-post-', '');

  // Construct the URL
  const url = `/countries/${randomMedia.country}/cities/${
    randomMedia.city
  }/${getTypePath(randomMedia.type)}/${mediaId}`;

  return NextResponse.json(
    { url },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

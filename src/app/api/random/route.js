import { NextResponse } from 'next/server';
import getTypePath from '@/app/utils/get-type-path';
import { getFirestore } from 'firebase-admin/firestore';
import { customInitApp } from '../../firebase';

customInitApp();

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = false;

export async function GET() {
  const db = getFirestore();
  const randomMedias = await db.collection('pages').doc('random').get();
  const cachedMedias = randomMedias.exists
    ? JSON.parse(randomMedias.data().value)
    : [];

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

  const headers = new Headers();
  headers.append(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0'
  );
  headers.append('Pragma', 'no-cache');
  headers.append('Expires', '0');

  return NextResponse.json(
    { url },
    {
      headers,
    }
  );
}

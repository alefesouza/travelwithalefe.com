import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { customInitApp } from '../../firebase';
import mediaToUrl from '@/app/utils/media-to-url';

customInitApp();

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = false;

export async function GET() {
  const db = getFirestore();
  const randomMedias = await db.collection('pages').doc('random').get();
  const cachedMedias = randomMedias.exists ? randomMedias.data().value : [];

  // Get a random media from the cache
  const randomIndex = Math.floor(Math.random() * cachedMedias.length);
  const randomMedia = cachedMedias[randomIndex];

  const url = mediaToUrl(randomMedia);

  return NextResponse.json({ url });
}

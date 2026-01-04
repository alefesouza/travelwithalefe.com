import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { customInitApp } from '../../firebase';
import getRandomVideos from '@/app/utils/get-random-videos';

customInitApp();

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = false;

export async function GET() {
  const db = getFirestore();

  const videos = await getRandomVideos(db);

  return NextResponse.json({ videos });
}

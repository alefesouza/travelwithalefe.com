import { notFound } from 'next/navigation';

const VALID_MEDIA_TYPES = [
  'posts',
  'stories',
  'videos',
  'short-videos',
  '360-photos',
  'maps',
  'locations',
];

/**
 * Catch-all route to validate media types and return 404 for invalid paths
 * Example: /countries/guatemala/cities/antigua-guatemala/posdfts/3 → 404
 */
export default async function CatchAllMediaTypePage({ params: paramsPromise }) {
  const { type } = await paramsPromise;

  // Check if the first segment (media type) is valid
  if (type && type.length > 0) {
    const mediaType = type[0];

    if (!VALID_MEDIA_TYPES.includes(mediaType)) {
      return notFound();
    }
  }

  // If it's a valid media type but the specific route doesn't exist,
  // Next.js will handle the 404
  return notFound();
}

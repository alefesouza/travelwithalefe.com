import { headers } from 'next/headers';

export default async function useHost() {
  const headersList = await headers();

  const firebaseURL = headersList.get('x-forwarded-host');
  const protocol =
    process.env.NODE_ENV === 'production' ? 'https://' : 'http://';

  const baseURL = process.env.NEXT_PUBLIC_SITE_URL;

  return (path) => {
    return new URL(
      path,
      firebaseURL ? protocol + firebaseURL : baseURL
    ).toString();
  };
}

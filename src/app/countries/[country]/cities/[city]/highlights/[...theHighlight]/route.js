import { permanentRedirect } from 'next/navigation';

export async function GET(req) {
  const { pathname } = new URL(req.url);
  let [, , country, , city] = pathname.split('/');

  permanentRedirect(
    (pathname.includes('/webstories') ? '/webstories' : '') +
      '/countries/' +
      country +
      '/cities/' +
      city +
      '/stories'
  );
}

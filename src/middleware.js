import { NextResponse } from 'next/server';

export default function middleware(req) {
  const headers = new Headers(req.headers);
  const origin = headers.get('x-forwarded-host');
  const pathname = req.nextUrl.pathname;

  const searchParams = req.nextUrl.searchParams;
  const searchParamsString = searchParams.toString();

  console.log(
    headers.get('user-agent'),
    origin + pathname + (searchParamsString ? '?' + searchParamsString : '')
  );

  if (origin && origin === 'viajarcomale.com') {
    return NextResponse.redirect(
      new URL(
        pathname,
        `https://${origin.replace('viajarcomale', 'travelwithalefe')}`
      ),
      { status: 301 }
    );
  }

  if (
    (pathname.startsWith('/medias') ||
      pathname.startsWith('/360photos') ||
      pathname.startsWith('/maps') ||
      pathname.startsWith('/stories') ||
      pathname.startsWith('/resize')) &&
    (pathname.endsWith('.jpg') || pathname.endsWith('.png'))
  ) {
    return NextResponse.redirect(
      'https://storage.googleapis.com/files.viajarcomale.com' + pathname,
      { status: 301 }
    );
  }

  if (
    pathname.endsWith('/webstories') &&
    searchParams.get('fixer') !== 'true'
  ) {
    return NextResponse.redirect(
      new URL(
        '/webstories' + pathname.replace('/webstories', ''),
        origin
          ? `https://${origin.replace('www.', '')}`
          : process.env.NEXT_PUBLIC_SITE_URL
      ),
      { status: 301 }
    );
  }

  if (origin && origin.includes('www.travelwithalefe.com')) {
    return NextResponse.redirect(
      new URL(pathname, `https://${origin.replace('www.', '')}`),
      { status: 301 }
    );
  }

  if (origin && origin.includes('www.viajarcomale.com')) {
    return NextResponse.redirect(
      new URL(pathname, `https://${origin.replace('www.', '')}`)
    );
  }

  headers.set('x-pathname', pathname);
  headers.set('x-searchparams', searchParams.toString());

  return NextResponse.next({
    request: {
      headers,
    },
  });
}

import useHost from '@/app/hooks/use-host';
import { redirect } from 'next/navigation';
import { customInitApp } from '@/app/firebase';
import logAccess from '@/app/utils/log-access';

customInitApp();

// Remove Next.js assets from Web Stories pages.
export async function GET(req) {
  const host = useHost();
  const isBR = process.env.NEXT_PUBLIC_LOCALE === 'pt-BR';
  let { pathname, searchParams } = new URL(req.url);
  let sort = searchParams.get('sort');
  sort = sort === 'asc' ? 'asc' : 'desc';

  pathname = pathname.toLowerCase();

  const ignoreAnalytics = process.env.NODE_ENV === 'development';

  const request = await fetch(
    host(pathname.replace('/webstories', '') + '/webstories') +
      '?fixer=true' +
      (sort !== 'desc' ? '&sort=' + sort : ''),
    {
      headers: {
        'User-Agent': req.headers.get('user-agent'),
      },
    }
  );

  if (request.redirected) {
    redirect(request.url);
  }

  const data = await request.text();

  let $ = require('cheerio').load(data);

  $('meta[name="viewport"]').remove();
  $('link[rel="stylesheet"]').remove();
  $('link[rel="preload"]').remove();
  $('script').remove();

  $('link[href^="/_next"]').remove();
  $('script:not(.amp-asset)').remove();
  $('script.amp-asset').attr('class', '');
  $('next-route-announcer').remove();
  $('nextjs-portal').remove();

  $ = require('cheerio').load(`
    <!DOCTYPE html>
    <html amp>
    <head>
      ${$('head').html()}
      <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
      <script
        async
        src="https://cdn.ampproject.org/v0.js"
      ></script>
      <script
        async
        custom-element="amp-story"
        src="https://cdn.ampproject.org/v0/amp-story-1.0.js"
      ></script>
      <script
        async
        custom-element="amp-story-auto-analytics"
        src="https://cdn.ampproject.org/v0/amp-story-auto-analytics-0.1.js"
      ></script>
      <script
        async
        custom-element="amp-video"
        src="https://cdn.ampproject.org/v0/amp-video-0.1.js"
      ></script>
    </head>
    <body>
    ${$('main.main').html()}
    </body>
    </html>
  `);

  if ($('amp-story-page').length <= 1) {
    redirect(pathname.replace('/webstories', ''));
  }

  const url = isBR
    ? 'https://viajarcomale.com.br'
    : 'https://travelwithalefe.com';

  const canonicalHref = url + pathname.replace('/webstories', '');

  const enHref =
    'https://travelwithalefe.com/webstories' +
    pathname.replace('/webstories', '');
  const ptHref =
    'https://viajarcomale.com.br/webstories' +
    pathname.replace('/webstories', '');

  $('link[rel="canonical"]').attr('href', canonicalHref);
  $('link[hreflang="x-default"]').attr('href', isBR ? ptHref : enHref);
  $('link[hreflang="en"]').attr('href', enHref);
  $('link[hreflang="pt"]').attr('href', ptHref);
  $('[standalone]').attr('standalone', '');
  $('[autoplay]').attr('autoplay', '');
  $('[itemscope]').attr('itemscope', '');
  $('head').append(
    `<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>`
  );
  $('head').append(
    `<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>`
  );
  $('head').append(
    '<style amp-custom>' +
      `
      .header-container { 
        width: 100%;
        margin-left: 6px;
        margin-right: 6px;
      }

      .common-text {
        background: #ffffff;
        width: auto;
        padding-top: 2px;
        padding-bottom: 2px;
        padding-left: 10px;
        padding-right: 10px;
        border-radius: 5px;
        font-weight: bold;
        font-family: system-ui,-apple-system,Roboto,Arial,sans-serif;
        -webkit-box-decoration-break: clone;
        box-decoration-break: clone;
        display: inline;
        padding-bottom: 5px;
      }
      
      .story-title {
        line-height: 40px;
      }

      .username {
        color: #fff;
        background: none;
        position: absolute;
        top: 8px;
        left: 5px;
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.8);
        padding-bottom: 0;
        height: 48px;
        gap: 8px;
        padding-top: 0px;
        padding-bottom: 0px;
        padding-left: 10px;
        padding-right: 10px;
      }

      .username-text {
        height: 20px;
        line-height: 18px;
        font-size: 20px;
      }

      .date {
        font-weight: normal;
        font-size: 12px;
        margin-top: 1px;
      }

      .post-type-container {
        width: 90%;
        text-align: center;
        padding-top: 32px;
      }

      .end-text {
        font-size: 32px;
        line-height: 40px;
      }

      .end-text-container {
        width: 100%;
        text-align: center;
      }

      .flag-container {
        display: flex;
        justify-content: center;
        margin-top: 10px;
        font-size: 55px;
      }

      .no-padding {
        padding-left: 0;
        padding-right: 0;
        align-content: center;
      }

      .end-content {
        align-content: end;
        padding-bottom: 115px;
      }

      .darker { filter: brightness(70%); }
      `
        .replaceAll(' ', '')
        .replaceAll('\n', '') +
      '</style>'
  );

  let html = $.html();

  logAccess(host(pathname + ('?sort=' + sort)));

  if (ignoreAnalytics) {
    let $ = require('cheerio').load(html.toString());
    $('amp-story-auto-analytics').remove();
    $('[custom-element="amp-story-auto-analytics"]').remove();
    html = $.html();
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

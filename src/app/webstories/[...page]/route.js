import useHost from '@/app/hooks/use-host';
import { redirect, permanentRedirect } from 'next/navigation';
import getCookie from '@/app/utils/get-cookies';
import { getStorage } from 'firebase-admin/storage';
import { customInitApp } from '@/app/firebase';
import { getFirestore } from 'firebase-admin/firestore';
import logAccess from '@/app/utils/log-access';

customInitApp();

// Remove Next.js assets from Web Stories pages.
export async function GET(req) {
  const host = useHost();
  let { pathname, searchParams } = new URL(req.url);
  let sort = searchParams.get('sort');
  sort = sort === 'asc' ? 'asc' : 'desc';

  pathname = pathname.toLowerCase();

  if (pathname.includes('/highlights/')) {
    const [, , , country, , city] = pathname.split('/');
    pathname =
      '/webstories/countries/' + country + '/cities/' + city + '/stories';

    permanentRedirect(pathname);
  }

  const ignoreAnalytics =
    getCookie('ignore_analytics') || host().includes('localhost');

  const reference =
    'webstories/' +
    host(pathname + '-' + sort + '.html')
      .split('//')[1]
      .replaceAll('/', '-')
      .replace('www.', '')
      .replace('viajarcomale', '');

  const storage = getStorage();
  let cacheExists = [false];

  if (sort !== 'random') {
    cacheExists = await storage
      .bucket('viajarcomale.appspot.com')
      .file(reference)
      .exists();
  }

  let html = '';

  if (!cacheExists[0] || sort === 'random') {
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

    if ($('amp-story-page').length <= 1) {
      redirect(pathname.replace('/webstories', ''));
    }

    $('link[href^="/_next"]').remove();
    $('script:not(.amp-asset)').remove();
    $('script.amp-asset').attr('class', '');
    $('next-route-announcer').remove();
    $('nextjs-portal').remove();
    $('html').attr('amp', '');
    $('[standalone]').attr('standalone', '');
    $('[autoplay]').attr('autoplay', '');
    $('[itemscope]').attr('itemscope', '');
    $('.cover-link').attr('href', host(pathname.replace('/webstories', '')));
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

    // @ad
    $('amp-story').append(
      `<amp-story-auto-ads><script type="application/json">{ "ad-attributes": { "type": "adsense", "data-ad-client": "${process.env.NEXT_GOOGLE_ADSENSE_ACCOUNT}", "data-ad-slot": "${process.env.NEXT_GOOGLE_ADSENSE_WEB_STORIES_AD_SLOT}" } }</script></amp-story-auto-ads>`
    );

    html = $.html();

    if (sort !== 'random') {
      storage.bucket('viajarcomale.appspot.com').file(reference).save(html);
    }
  } else {
    const contents = await storage
      .bucket('viajarcomale.appspot.com')
      .file(reference)
      .download();
    html = contents;
  }

  const db = getFirestore();
  logAccess(db, host(pathname + ('?sort=' + sort)));

  if (ignoreAnalytics) {
    let $ = require('cheerio').load(html.toString());
    $('amp-story-auto-analytics').remove();
    $('[custom-element="amp-story-auto-analytics"]').remove();
    // @ad
    $('amp-story-auto-ads').remove();
    $('[custom-element="amp-story-auto-ads"]').remove();
    html = $.html();
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

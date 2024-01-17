(() => {
  let deferredPrompt;
  const addToHomeBtn = document.querySelector('#add-to-home');

  window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;

    if (!addToHomeBtn) {
      return;
    }

    addToHomeBtn.style.display = 'block';

    addToHomeBtn.addEventListener('click', (event) => {
      event.preventDefault();

      addToHomeBtn.style.display = 'none';

      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted to install Viajar com Alê');
        } else {
          console.log('User dismissed to install Viajar com Alê');
        }
        deferredPrompt = null;
      });
    });
  });

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          '/serviceworker.js',
          {
            scope: '/',
          }
        );
        if (registration.installing) {
          console.log('Service worker installing');
        } else if (registration.waiting) {
          console.log('Service worker installed');
        } else if (registration.active) {
          console.log('Service worker active');
        }
      } catch (error) {
        console.error(`Registration failed with ${error}`);
      }
    }
  };

  registerServiceWorker();

  // This is the best workaround I found to add DOM events without
  // messing with the SSR on Next.js 14, please don't judge me.
  const countryRoutes = window.location.origin + '/countries';
  const hashtagRoutes = window.location.origin + '/hashtags';

  function showSpinner(e) {
    const link = e?.target?.href || e?.target?.closest('a')?.href;

    if ((e?.target?.closest('a')?.target || e?.target?.target) === '_blank') {
      return;
    }

    if (e?.metaKey || !link) {
      return;
    }

    if (
      !link.includes(window.location.origin + '/') ||
      link.includes(window.location.origin + window.location.pathname + '#') ||
      link === window.location.href
    ) {
      return;
    }

    document.querySelector('#loader-spinner').style.display = 'block';
  }

  let firstPage = window.location.pathname;

  function onBackClick(e) {
    if (window.location.pathname === firstPage) {
      firstPage = e.target.parentElement.pathname;
      return;
    }

    e.preventDefault();

    history.back();
  }

  let shuffleClicks = 0;

  const today = new Date().toISOString().split('T')[0];
  let totalShuffleClicksToday = localStorage.getItem(
    'total_shuffle_clicks_today'
  );
  let totalShuffleClicksTodayDate = localStorage.getItem(
    'total_shuffle_clicks_today_date'
  );

  if (totalShuffleClicksToday >= 25) {
    [...document.querySelectorAll('.shuffle')].forEach((item) => {
      item.style.display = 'none';
    });
  }

  function onShuffleClick() {
    if (totalShuffleClicksTodayDate !== today) {
      localStorage.setItem('total_shuffle_clicks_today_date', today);
      localStorage.setItem('total_shuffle_clicks_today', '0');
      totalShuffleClicksTodayDate = today;
      totalShuffleClicksToday = 0;
    }

    shuffleClicks++;

    if (shuffleClicks >= 5 || totalShuffleClicksToday >= 25) {
      [...document.querySelectorAll('.shuffle')].forEach((item) => {
        item.style.display = 'none';
      });
    }

    if (!totalShuffleClicksToday) {
      localStorage.setItem('total_shuffle_clicks_today', '1');
      totalShuffleClicksToday = 1;
    } else {
      localStorage.setItem(
        'total_shuffle_clicks_today',
        ++totalShuffleClicksToday
      );
    }

    let count = 30;
    const initialText = this.textContent;

    [...document.querySelectorAll('.shuffle button')].forEach((item) => {
      item.disabled = true;
      item.textContent = count;
    });

    count--;

    const internal = setInterval(() => {
      [...document.querySelectorAll('.shuffle button')].forEach((item) => {
        item.disabled = true;
        item.textContent = count;
      });

      if (count == 0) {
        [...document.querySelectorAll('.shuffle button')].forEach((item) => {
          item.disabled = false;
          item.textContent = initialText;
        });

        clearInterval(internal);
      }

      count--;
    }, 1000);
  }

  function onNavbarLinkClick(e) {
    if (e?.metaKey) {
      return;
    }

    const navLinks = [...document.querySelectorAll('.navbar .nav-link')];

    navLinks.forEach((item) => {
      item.parentElement.classList.remove('active');
    });

    this.parentElement.classList.add('active');
  }

  function initNavbarLinkClick() {
    const navLinks = [...document.querySelectorAll('.navbar .nav-link')];

    navLinks.forEach((item) => {
      item.removeEventListener('click', onNavbarLinkClick);
      item.addEventListener('click', onNavbarLinkClick);
    });
  }

  function initPanorama(fullQuality) {
    if (!document.querySelector('#pannellum-css')) {
      // Required because the script does not run on router navigation.
      const link = document.createElement('link');
      link.href =
        'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      link.id = 'pannellum-css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    const loadFullQuality = document.querySelector('#load-full-quality');

    if (loadFullQuality) {
      loadFullQuality.onclick = () => {
        initPanorama(true);
      };

      if (fullQuality) {
        loadFullQuality.remove();
      }
    }

    const pannellumLoader = document.querySelector('#pannellum-loader');

    if (!pannellumLoader) {
      // Required because the script does not run on router navigation.
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.id = 'pannellum-loader';
      script.setAttribute('async', '');
      script.onload = initPanorama;
      document.head.appendChild(script);
      return;
    }

    const panorama = document.querySelector('#panorama');

    const canvas = document.getElementById('max-texture-size');
    const gl = canvas.getContext('experimental-webgl');
    const maxWidth = gl.getParameter(gl.MAX_TEXTURE_SIZE);

    pannellum.viewer('panorama', {
      type: 'equirectangular',
      panorama: fullQuality
        ? panorama.dataset.photo
        : maxWidth > 8192
        ? panorama.dataset.resize11968
        : panorama.dataset.resize8192,
      autoLoad: true,
      autoRotate: -2,
      preview: panorama.dataset.thumbnail,
      strings: {
        loadingLabel: window.location.host.includes('viajarcomale.com.br')
          ? 'Carregando...'
          : 'Loading...',
      },
      yaw: panorama.dataset.yaw || 0,
    });
  }

  function setupLinks(tag) {
    const currentUrl = window.location.href;

    const routeLinks = [...document.querySelectorAll(tag + ' a')];

    routeLinks.forEach((a) => {
      a.removeEventListener('click', showSpinner);
      a.addEventListener('click', showSpinner);
    });

    const languageSwitcherLink = currentUrl.includes('viajarcomale.com.br')
      ? currentUrl.replace('viajarcomale.com.br', 'viajarcomale.com')
      : currentUrl.replace('viajarcomale.com', 'viajarcomale.com.br');
    document.querySelector('#language-switcher').href = languageSwitcherLink;
    if (document.querySelector('#portuguese-language-switcher a')) {
      document.querySelector('#portuguese-language-switcher a').href =
        languageSwitcherLink;
    }

    const backButton = document.querySelector('#back-button');

    if (backButton) {
      backButton.removeEventListener('click', onBackClick);
      backButton.addEventListener('click', onBackClick);
    }

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches
    ) {
      document.querySelectorAll('a[target=_blank]').forEach(function (a) {
        if (a.href.includes('/webstories/')) {
          return;
        }

        a.removeAttribute('target');
      });
    }

    [...document.querySelectorAll('.shuffle button')].forEach((item) => {
      item.removeEventListener('click', onShuffleClick);
      item.addEventListener('click', onShuffleClick);
    });

    initNavbarLinkClick();

    const navLinks = [
      ...document.querySelectorAll('.navbar .nav-link'),
      ...document.querySelectorAll('#title-bar .nav-link'),
    ];

    navLinks.forEach((item) => {
      item.parentElement.classList.remove('active');
    });

    if (window.location.pathname == '/') {
      document
        .querySelector('.navbar .nav-item:nth-child(1)')
        .classList.add('active');
      document
        .querySelector('#title-bar .nav-item:nth-child(1)')
        .classList.add('active');
    } else if (window.location.pathname == '/map') {
      document
        .querySelector('.navbar .nav-item:nth-child(2)')
        .classList.add('active');
      document
        .querySelector('#title-bar .nav-item:nth-child(2)')
        .classList.add('active');
    } else if (window.location.pathname == '/hashtags') {
      document
        .querySelector('.navbar .nav-item:nth-child(3)')
        .classList.add('active');
      document
        .querySelector('#title-bar .nav-item:nth-child(3)')
        .classList.add('active');
    } else if (window.location.pathname == '/coupons') {
      document
        .querySelector('.navbar .nav-item:nth-child(4)')
        .classList.add('active');
      document
        .querySelector('#title-bar .nav-item:nth-child(4)')
        .classList.add('active');
    } else if (window.location.pathname == '/about') {
      document
        .querySelector('.navbar .nav-item:nth-child(5)')
        .classList.add('active');
      document
        .querySelector('#title-bar .nav-item:nth-child(5)')
        .classList.add('active');
    }

    document.querySelectorAll('[data-copy]').forEach((item) => {
      item.onclick = function () {
        const clipBoard = navigator.clipboard;

        clipBoard.writeText(this.dataset.copy).then(() => {
          alert(
            window.location.host.includes('viajarcomale.com.br')
              ? 'Copiado para a área de transferência.'
              : 'Copied to clipboard.'
          );
        });
      };
    });

    const { pathname } = window.location;

    const paths = pathname.split('/');
    const isMediaSingle =
      paths[1] === 'countries' &&
      paths[3] === 'cities' &&
      (paths[5] === 'posts' ||
        paths[5] === 'stories' ||
        paths[5] === 'videos' ||
        paths[5] === 'short-videos' ||
        paths[5] === '360-photos' ||
        paths[5] === 'maps') &&
      paths[6] &&
      (paths[5] === 'stories' ||
        paths[5] === 'videos' ||
        paths[5] === 'short-videos' ||
        paths[5] === '360-photos' ||
        paths[5] === 'maps' ||
        paths[7]);

    if (pathname !== '/') {
      document.querySelector('body').classList.add('sub-page');
    } else {
      document.querySelector('body').classList.remove('sub-page');
    }

    if (isMediaSingle) {
      document.querySelector('body').classList.add('single-media-page');

      if (paths[5] === 'short-videos') {
        const tiktokLoader = document.querySelector('#tiktok-loader');

        if (tiktokLoader) {
          tiktokLoader.remove();

          // Required because the script does not run on router navigation.
          const script = document.createElement('script');
          script.src = 'https://www.tiktok.com/embed.js';
          script.id = 'tiktok-loader';
          script.setAttribute('async', '');
          document.head.appendChild(script);
        }
      }

      if (paths[5] === '360-photos') {
        if (window.panorama) {
          initPanorama();
        } else {
          setTimeout(() => {
            initPanorama();
          }, 1000);
        }
      }

      const image = document.querySelector('img[itemprop="contentUrl"]');

      if (image) {
        const initViewer = () => {
          if (!document.querySelector('#viewer-css')) {
            // Required because the script does not run on router navigation.
            const link = document.createElement('link');
            link.href =
              'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.css';
            link.id = 'viewer-css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
          }

          new Viewer(image, {
            toolbar: {
              zoomIn: 1,
              zoomOut: 1,
              oneToOne: 0,
              reset: 0,
              prev: 0,
              play: {
                show: 0,
                size: 'large',
              },
              next: 0,
              rotateLeft: 0,
              rotateRight: 0,
              flipHorizontal: 0,
              flipVertical: 0,
            },
          });
        };

        setTimeout(() => {
          initViewer();
        }, 1000);
      }
    } else {
      document.querySelector('body').classList.remove('single-media-page');
    }
  }

  function setupScroller() {
    const highlightVideoItems = document.querySelectorAll('[data-scroller]');

    Array.from(highlightVideoItems).forEach((theScroller) => {
      const scroller = theScroller.querySelector('[data-scroller-scroll]');
      const highlightScrollLeft = scroller.previousElementSibling;
      const highlightScrollRight = scroller.nextElementSibling;
      const maximizeButton = theScroller.querySelector('.maximize-button');

      if (highlightScrollLeft.onclick) {
        return;
      }

      if (scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth) {
        highlightScrollRight.style.display = 'flex';
        maximizeButton.style.display = 'flex';
      }

      highlightScrollLeft.onclick = function () {
        scroller.scrollLeft -= scroller.clientWidth * 0.75;
      };

      highlightScrollRight.onclick = function () {
        scroller.scrollLeft += scroller.clientWidth * 0.75;
      };

      maximizeButton.onclick = function (e) {
        e.preventDefault();
        scroller.dataset.maximized =
          scroller.dataset.maximized === 'yes' ? 'no' : 'yes';

        scroller.classList.toggle(this.dataset.maximize);
        scroller.classList.toggle('instagram_highlights_items');
        scroller.classList.toggle('container-fluid');
        scroller.classList.toggle(this.dataset.minimize);
        highlightScrollRight.style.display = 'none';
        highlightScrollLeft.style.display = 'none';
        this.textContent =
          scroller.dataset.maximized === 'yes'
            ? this.dataset.mintext
            : this.dataset.maxtext;

        if (
          scroller.dataset.maximized === 'no' &&
          scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth
        ) {
          scroller.scrollLeft = 0;
          highlightScrollRight.style.display = 'flex';
        }
      };

      scroller.onscroll = function () {
        if (this.scrollLeft === 0) {
          highlightScrollLeft.style.display = 'none';
        } else if (this.scrollLeft + this.clientWidth >= this.scrollWidth) {
          highlightScrollRight.style.display = 'none';
        }

        if (this.scrollLeft > 0) {
          highlightScrollLeft.style.display = 'flex';
        }

        if (this.scrollLeft + this.clientWidth < this.scrollWidth) {
          highlightScrollRight.style.display = 'flex';
        }
      };
    });
  }

  const elementToObserve = document.querySelector('head');

  observer = new MutationObserver(function () {
    if (
      document.querySelector(
        '[data-ad-status="unfilled"]:not(.adsbygoogle-noablate)'
      )
    ) {
      document
        .querySelectorAll(
          '[data-ad-status="unfilled"]:not(.adsbygoogle-noablate)'
        )
        .forEach((el) => {
          el.parentElement.style.display = 'none';
        });
    }

    if (
      navigator.language.startsWith('pt') &&
      !document.querySelector('#portuguese-language-switcher') &&
      !window.matchMedia('(display-mode: standalone)').matches &&
      !window.matchMedia('(display-mode: window-controls-overlay)').matches &&
      !window.location.origin.includes('viajarcomale.com.br')
    ) {
      const portugueseLanguageSwitcher = document.createElement('div');
      portugueseLanguageSwitcher.id = 'portuguese-language-switcher';
      const portugueseLanguageSwitcherLink = document.createElement('a');
      portugueseLanguageSwitcherLink.className = 'language';
      portugueseLanguageSwitcherLink.href =
        'https://viajarcomale.com.br' + window.location.pathname;
      portugueseLanguageSwitcherLink.textContent = 'Clique aqui para português';
      portugueseLanguageSwitcher.appendChild(portugueseLanguageSwitcherLink);
      document.querySelector('header').appendChild(portugueseLanguageSwitcher);
    }

    const panorama = document.querySelector('#panorama');

    if (panorama) {
      if (!panorama.classList.contains('pnlm-container')) {
        initPanorama();

        document.querySelector('#loader-spinner').style.display = 'none';
      }

      return;
    }

    if (document.querySelector('.tiktok-embed iframe')) {
      return;
    }

    document.querySelector('#loader-spinner').style.display = 'none';

    setupLinks('body');

    if (
      window.location.href.includes(countryRoutes) ||
      window.location.href.includes(hashtagRoutes)
    ) {
      setupScroller();
    }
  });

  if (elementToObserve) {
    observer.observe(elementToObserve, {
      characterData: false,
      childList: true,
      attributes: true,
      subtree: true,
    });
  }

  setupLinks('body');

  if (
    window.location.href.includes(countryRoutes) ||
    window.location.href.includes(hashtagRoutes)
  ) {
    setupScroller();
  }

  if ('windowControlsOverlay' in navigator) {
    const body = document.querySelector('body');

    function setCookie(name, value, days) {
      var expires = '';
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }

    function getCookie(name) {
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return '';
    }

    navigator.windowControlsOverlay.addEventListener('geometrychange', () => {
      const isOverlayVisible = navigator.windowControlsOverlay.visible;

      const session = getCookie('__session');

      if (isOverlayVisible) {
        body.classList.add('window-controls-overlay');

        if (!session.includes('window_controls_overlay')) {
          setCookie(
            '__session',
            session + (session ? '&' : '') + 'window_controls_overlay%3Dtrue',
            30
          );
        }
        return;
      }

      body.classList.remove('window-controls-overlay');
      setCookie(
        '__session',
        session
          .replace('&window_controls_overlay%3Dtrue', '')
          .replace('window_controls_overlay%3Dtrue', ''),
        30
      );
    });
  }

  window.addEventListener('pageshow', function () {
    document.querySelector('#loader-spinner').style.display = 'none';
  });

  initNavbarLinkClick();
})();

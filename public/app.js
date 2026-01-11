// Utility functions
const utils = {
  isBrazilian: () => window.location.host.includes('viajarcomale.com.br'),

  getCurrentLanguageSwitcherUrl: () => {
    return !utils.isBrazilian()
      ? document.querySelector('link[rel="alternate"][hreflang="pt"]').href
      : document.querySelector('link[rel="alternate"][hreflang="x-default"]')
          .href;
  },

  showAlert: (messageEN, messagePT) => {
    alert(utils.isBrazilian() ? messagePT : messageEN);
  },

  getText: (textEN, textPT) => (utils.isBrazilian() ? textPT : textEN),
};

const pwa = {
  isStandaloneMode: () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches,

  isWindowControlsOverlayMode: () =>
    window.matchMedia('(display-mode: window-controls-overlay)').matches,

  checkWindowControlsOverlay: () => {
    const body = document.querySelector('body');

    const isOverlayVisible = navigator.windowControlsOverlay.visible;

    if (isOverlayVisible) {
      body.classList.add('window-controls-overlay');
      return;
    }

    body.classList.remove('window-controls-overlay');
  },
};

// Navigation utilities
const navigation = {
  showSpinner: (e) => {
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

    if (link.includes(window.location.origin + '/videos')) {
      return;
    }

    document.querySelector('#loader-spinner').style.display = 'block';
  },

  hideSpinner: () => {
    document.querySelector('#loader-spinner').style.display = 'none';
  },

  updateNavbarActiveState: () => {
    const navLinks = [
      ...document.querySelectorAll('.navbar .nav-link'),
      ...document.querySelectorAll('#title-bar .nav-link'),
    ];

    navLinks.forEach((item) => item.parentElement.classList.remove('active'));

    const { pathname } = window.location;
    const navItemSelectors = {
      '/videos': 1,
      '/map': 2,
      '/hashtags': 3,
      '/coupons': 4,
      '/about': 5,
    };

    const navIndex = navItemSelectors[pathname];

    if (navIndex) {
      document
        .querySelectorAll(`.navbar .nav-item:nth-child(${navIndex})`)
        .forEach((item) => item.classList.add('active'));
      document
        .querySelector(`#title-bar .nav-item:nth-child(${navIndex})`)
        ?.classList.add('active');
      document
        .querySelector(`.sidebar .navbar .nav-item:nth-child(${navIndex})`)
        ?.classList.add('active');
    }
  },

  onNavbarLinkClick: function (e) {
    if (e?.metaKey) {
      return;
    }

    const navLinks = [...document.querySelectorAll('.navbar .nav-link')];
    navLinks.forEach((item) => item.parentElement.classList.remove('active'));
    this.parentElement.classList.add('active');

    window.navbarClicked = true;
    window.unmutedVideo = true;

    console.log('Navbar link clicked');
  },

  initNavbarLinkClick: () => {
    const navLinks = [...document.querySelectorAll('.navbar-nav .nav-link')];
    navLinks.forEach((item) => {
      item.removeEventListener('click', navigation.onNavbarLinkClick);
      item.addEventListener('click', navigation.onNavbarLinkClick);
    });
  },
};

// Scroller functionality
const scroller = {
  setup: () => {
    const pageScrollerItems = document.querySelectorAll('[data-scroller]');
    const onlyStories =
      pageScrollerItems.length === 1 &&
      pageScrollerItems[0].dataset.onlyStories === 'true';

    Array.from(pageScrollerItems).forEach((theScroller) => {
      const scrollElement = theScroller.querySelector('[data-scroller-scroll]');
      const scrollLeft = scrollElement.previousElementSibling;
      const scrollRight = scrollElement.nextElementSibling;
      const maximizeButton = theScroller.querySelector('.maximize-button');

      if (scrollLeft.onclick) {
        return;
      }

      // Auto-expand if only stories on the page
      if (onlyStories) {
        scrollElement.dataset.maximized = 'yes';
        scrollElement.classList.add('scroller_instagram_highlights_items');
        scrollElement.classList.add('instagram_highlights_items');
        scrollElement.classList.add('container-fluid');
        scrollElement.classList.remove('scroller_scroller_items');
        maximizeButton.textContent = maximizeButton.dataset.mintext;
        maximizeButton.style.display = 'flex';
        scrollRight.style.display = 'none';
        scrollLeft.style.display = 'none';
      } else if (
        scrollElement.scrollLeft + scrollElement.clientWidth <
        scrollElement.scrollWidth
      ) {
        scrollRight.style.display = 'flex';
        maximizeButton.style.display = 'flex';
      }

      scrollLeft.onclick = () => {
        scrollElement.scrollLeft -= scrollElement.clientWidth * 0.75;
      };

      scrollRight.onclick = () => {
        scrollElement.scrollLeft += scrollElement.clientWidth * 0.75;
      };

      maximizeButton.onclick = function (e) {
        e.preventDefault();
        scrollElement.dataset.maximized =
          scrollElement.dataset.maximized === 'yes' ? 'no' : 'yes';

        scrollElement.classList.toggle(this.dataset.maximize);
        scrollElement.classList.toggle('instagram_highlights_items');
        scrollElement.classList.toggle('container-fluid');
        scrollElement.classList.toggle(this.dataset.minimize);
        scrollRight.style.display = 'none';
        scrollLeft.style.display = 'none';
        this.textContent =
          scrollElement.dataset.maximized === 'yes'
            ? this.dataset.mintext
            : this.dataset.maxtext;

        if (
          scrollElement.dataset.maximized === 'no' &&
          scrollElement.scrollLeft + scrollElement.clientWidth <
            scrollElement.scrollWidth
        ) {
          scrollElement.scrollLeft = 0;
          scrollRight.style.display = 'flex';
        }
      };

      scrollElement.onscroll = function () {
        if (this.scrollLeft === 0) {
          scrollLeft.style.display = 'none';
        } else if (this.scrollLeft + this.clientWidth >= this.scrollWidth) {
          scrollRight.style.display = 'none';
        }

        if (this.scrollLeft > 0) {
          scrollLeft.style.display = 'flex';
        }

        if (this.scrollLeft + this.clientWidth < this.scrollWidth) {
          scrollRight.style.display = 'flex';
        }
      };
    });
  },
};

// Panorama viewer
const panorama = {
  initScript: (callback) => {
    const pannellumLoader = document.querySelector('#pannellum-loader');

    if (!pannellumLoader) {
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.id = 'pannellum-loader';
      script.setAttribute('async', '');
      script.onload = callback;
      document.body.appendChild(script);
      return;
    }

    callback();
  },

  init: (fullQuality) => {
    const loadFullQuality = document.querySelector('#load-full-quality');

    if (loadFullQuality) {
      loadFullQuality.onclick = () => panorama.init(true);
      if (fullQuality) {
        loadFullQuality.remove();
      }
    }

    panorama.initScript(() => {
      const panoramaEl = document.querySelector('#panorama');
      const canvas = document.getElementById('max-texture-size');
      const gl = canvas.getContext('experimental-webgl');
      const maxWidth = gl.getParameter(gl.MAX_TEXTURE_SIZE);

      pannellum.viewer('panorama', {
        type: 'equirectangular',
        panorama: fullQuality
          ? panoramaEl.dataset.photo
          : maxWidth > 8192
          ? panoramaEl.dataset.resize11968
          : panoramaEl.dataset.resize8192,
        autoLoad: true,
        autoRotate: -2,
        preview: panoramaEl.dataset.thumbnail,
        strings: {
          loadingLabel: utils.getText('Loading...', 'Carregando...'),
        },
        yaw: panoramaEl.dataset.yaw || 0,
      });
    });
  },
};

// Media viewers
const mediaViewers = {
  initTikTok: () => {
    const tiktokLoader = document.querySelector('#tiktok-loader');
    if (tiktokLoader) {
      tiktokLoader.remove();
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.id = 'tiktok-loader';
      script.setAttribute('async', '');
      document.body.appendChild(script);
    }
  },

  initYouTube: () => {
    const userAgent = navigator.userAgent;
    if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
      const { youtubeId } =
        document.querySelector('[data-youtube-id]')?.dataset || {};
      if (youtubeId) {
        window.location.replace(
          'vnd.youtube://www.youtube.com/watch?v=' +
            youtubeId +
            '&sub_confirmation=1'
        );
      }
    }
  },

  initImageViewer: () => {
    const image = document.querySelector('img[itemprop="contentUrl"]');
    if (!image) return;

    setTimeout(() => {
      new Viewer(image, {
        toolbar: {
          zoomIn: 1,
          zoomOut: 1,
          oneToOne: 0,
          reset: 0,
          prev: 0,
          play: { show: 0, size: 'large' },
          next: 0,
          rotateLeft: 0,
          rotateRight: 0,
          flipHorizontal: 0,
          flipVertical: 0,
        },
      });
    }, 1000);
  },
};

// Page detection and setup
const pageDetection = {
  isMediaSingle: () => {
    const { pathname } = window.location;
    const paths = pathname.split('/');
    return (
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
        paths[7])
    );
  },

  getMediaType: () => {
    const paths = window.location.pathname.split('/');
    return paths[5];
  },

  updateBodyClasses: () => {
    const body = document.querySelector('body');
    const main = document.querySelector('.main');
    const sidebar = document.querySelector('.sidebar');
    const siteName = document.querySelector('.site-name');
    const { pathname } = window.location;

    if (pathname !== '/') {
      body.classList.add('sub-page');
      main.classList.remove('home-page');
      sidebar.classList.remove('home-page');
      siteName.style.display = 'none';
    } else {
      body.classList.remove('sub-page');
      main.classList.add('home-page');
      sidebar.classList.add('home-page');
      siteName.style.display = 'block';
    }

    if (pathname === '/videos') {
      main.style.paddingTop = pathname === '/videos' ? '0px' : '';
      main.style.paddingBottom = pathname === '/videos' ? '0px' : '';
      document.querySelector('.mobile-navbar').style.display = 'none';

      if (!pwa.isWindowControlsOverlayMode()) {
        document.querySelector('header').style.display = 'none';
      }

      window.videosClicked = true;
    } else {
      main.style.paddingTop = '';
      main.style.paddingBottom = '';
      document.querySelector('.mobile-navbar').style.display = '';
      document.querySelector('header').style.display = '';
    }

    if (pageDetection.isMediaSingle()) {
      body.classList.add('single-media-page');
    } else {
      body.classList.remove('single-media-page');
    }

    pwa.checkWindowControlsOverlay();
  },
};

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
          console.log('User accepted to install Travel with Alefe');
        } else {
          console.log('User dismissed to install Travel with Alefe');
        }
        deferredPrompt = null;
      });
    });
  });

  function setupLinks(tag) {
    const routeLinks = [...document.querySelectorAll(tag + ' a')];
    routeLinks.forEach((a) => {
      a.removeEventListener('click', navigation.showSpinner);
      a.addEventListener('click', navigation.showSpinner);
    });

    document
      .querySelectorAll('.random-post-button')
      .forEach(function (randomPostButton) {
        randomPostButton.removeEventListener('click', navigation.showSpinner);
        randomPostButton.addEventListener('click', navigation.showSpinner);
      });

    const languageSwitcherLink = utils.getCurrentLanguageSwitcherUrl();

    if (document.querySelector('#language-switcher')) {
      document.querySelector('#language-switcher').href = languageSwitcherLink;
    }

    if (document.querySelector('#portuguese-language-switcher a')) {
      document.querySelector('#portuguese-language-switcher a').href =
        languageSwitcherLink;
    }

    if (pwa.isStandaloneMode()) {
      document.querySelectorAll('a[target=_blank]').forEach(function (a) {
        if (!a.href.includes('/webstories/')) {
          a.removeAttribute('target');
        }
      });
    }

    navigation.initNavbarLinkClick();
    navigation.updateNavbarActiveState();

    document.querySelectorAll('[data-copy]').forEach((item) => {
      item.onclick = function () {
        navigator.clipboard.writeText(this.dataset.copy).then(() => {
          utils.showAlert(
            'Copied to clipboard.',
            'Copiado para a área de transferência.'
          );
        });
      };
    });

    pageDetection.updateBodyClasses();

    const isMediaSingle = pageDetection.isMediaSingle();

    if (isMediaSingle) {
      const mediaType = pageDetection.getMediaType();
      if (mediaType === 'short-videos') {
        mediaViewers.initTikTok();
      }

      if (mediaType === '360-photos') {
        if (window.panorama) {
          panorama.init();
        } else {
          setTimeout(() => panorama.init(), 1000);
        }
      }

      if (mediaType === 'videos') {
        mediaViewers.initYouTube();
      }

      mediaViewers.initImageViewer();
    }
  }

  function setupScroller() {
    scroller.setup();
  }

  function headObserverFn() {
    if (
      navigator.language.startsWith('pt') &&
      !document.querySelector('#portuguese-language-switcher') &&
      !pwa.isStandaloneMode() &&
      !utils.isBrazilian() &&
      !pageDetection.isMediaSingle()
    ) {
      const portugueseLanguageSwitcher = document.createElement('div');
      portugueseLanguageSwitcher.id = 'portuguese-language-switcher';
      const portugueseLanguageSwitcherLink = document.createElement('a');
      portugueseLanguageSwitcherLink.className = 'language';
      portugueseLanguageSwitcherLink.href = document.querySelector(
        'link[rel="alternate"][hreflang="pt"]'
      ).href;
      portugueseLanguageSwitcherLink.textContent = 'Clique aqui para português';
      portugueseLanguageSwitcher.appendChild(portugueseLanguageSwitcherLink);
      document.querySelector('header').appendChild(portugueseLanguageSwitcher);
    }

    if (navigator.userAgentData?.platform === 'Windows') {
      document.querySelectorAll('.country-emoji-flag').forEach((item) => {
        item.innerHTML = `
          <img
            src="/flags/${item.dataset.countrySlug}.png"
            alt="${item.dataset.countryName}"
            height="${window
              .getComputedStyle(item, null)
              .getPropertyValue('font-size')}"
          />
        `;
      });
    }

    const panoramaEl = document.querySelector('#panorama');

    if (panoramaEl) {
      if (!panoramaEl.classList.contains('pnlm-container')) {
        panorama.init();
        navigation.hideSpinner();
      }
      return;
    }

    if (document.querySelector('.tiktok-embed iframe')) {
      return;
    }

    navigation.hideSpinner();

    setupLinks('body');

    const { pathname } = window.location;
    if (pathname.includes('/countries') || pathname.includes('/hashtags')) {
      setupScroller();
    }
  }

  const headObserver = new MutationObserver(headObserverFn);

  headObserver.observe(document.querySelector('head'), {
    characterData: false,
    childList: true,
    attributes: true,
    subtree: true,
  });

  setupLinks('body');

  const { pathname } = window.location;
  if (pathname.includes('/countries') || pathname.includes('/hashtags')) {
    setupScroller();
  }

  if ('windowControlsOverlay' in navigator) {
    navigator.windowControlsOverlay.addEventListener('geometrychange', () => {
      pwa.checkWindowControlsOverlay();
    });

    pwa.checkWindowControlsOverlay();
  }

  window.addEventListener('pageshow', navigation.hideSpinner);

  navigation.initNavbarLinkClick();

  headObserverFn();

  setTimeout(() => {
    document.querySelector('.main-container').click();
  }, 500);
})();

// Utility functions
const utils = {
  isBrazilian: () => window.location.host.includes('viajarcomale.com.br'),

  isStandaloneMode: () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches,

  getCurrentLanguageSwitcherUrl: () => {
    const currentUrl = window.location.href;
    return utils.isBrazilian()
      ? currentUrl.replace('viajarcomale.com.br', 'travelwithalefe.com')
      : currentUrl.replace('travelwithalefe.com', 'viajarcomale.com.br');
  },

  showAlert: (messageEN, messagePT) => {
    alert(utils.isBrazilian() ? messagePT : messageEN);
  },

  getText: (textEN, textPT) => (utils.isBrazilian() ? textPT : textEN),

  setCookie: (name, value, days) => {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  },

  getCookie: (name) => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return '';
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

    document.querySelector('#loader-spinner').style.display = 'block';
  },

  hideSpinner: () => {
    document.querySelector('#loader-spinner').style.display = 'none';
  },

  firstPage: window.location.pathname,

  onBackClick: function (e) {
    if (window.location.pathname === this.firstPage) {
      this.firstPage = e.target.parentElement.pathname;
      return;
    }

    e.preventDefault();
    history.back();
  },

  updateNavbarActiveState: () => {
    const navLinks = [
      ...document.querySelectorAll('.navbar .nav-link'),
      ...document.querySelectorAll('#title-bar .nav-link'),
    ];

    navLinks.forEach((item) => item.parentElement.classList.remove('active'));

    const { pathname } = window.location;
    const navItemSelectors = {
      '/': 1,
      '/map': 2,
      '/hashtags': 3,
      '/coupons': 4,
      '/about': 5,
    };

    const navIndex = navItemSelectors[pathname];
    if (navIndex) {
      document
        .querySelector(`.navbar .nav-item:nth-child(${navIndex})`)
        ?.classList.add('active');
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
  },

  initNavbarLinkClick: () => {
    const navLinks = [...document.querySelectorAll('.navbar .nav-link')];
    navLinks.forEach((item) => {
      item.removeEventListener('click', navigation.onNavbarLinkClick);
      item.addEventListener('click', navigation.onNavbarLinkClick);
    });
  },
};

// Shuffle functionality
const shuffle = {
  clicks: 0,
  today: new Date().toISOString().split('T')[0],

  getTotalClicksToday: () =>
    parseInt(localStorage.getItem('total_shuffle_clicks_today') || '0'),

  getTotalClicksTodayDate: () =>
    localStorage.getItem('total_shuffle_clicks_today_date'),

  setTotalClicksToday: (value) =>
    localStorage.setItem('total_shuffle_clicks_today', value.toString()),

  setTotalClicksTodayDate: (value) =>
    localStorage.setItem('total_shuffle_clicks_today_date', value),

  hideButtons: () => {
    [...document.querySelectorAll('.shuffle')].forEach((item) => {
      item.style.display = 'none';
    });
  },

  init: () => {
    const totalClicksToday = shuffle.getTotalClicksToday();
    if (totalClicksToday >= 25) {
      shuffle.hideButtons();
    }
  },

  onClick: function () {
    const totalClicksToday = shuffle.getTotalClicksToday();
    const totalClicksTodayDate = shuffle.getTotalClicksTodayDate();

    if (totalClicksTodayDate !== shuffle.today) {
      shuffle.setTotalClicksTodayDate(shuffle.today);
      shuffle.setTotalClicksToday(0);
    }

    shuffle.clicks++;

    const newTotal = totalClicksToday + 1;
    shuffle.setTotalClicksToday(newTotal);

    if (shuffle.clicks >= 5 || newTotal >= 25) {
      shuffle.hideButtons();
    }

    let count = 30;
    const initialText = this.textContent;

    const buttons = [...document.querySelectorAll('.shuffle button')];
    buttons.forEach((item) => {
      item.disabled = true;
      item.textContent = count;
    });

    count--;

    const interval = setInterval(() => {
      buttons.forEach((item) => {
        item.disabled = true;
        item.textContent = count;
      });

      if (count === 0) {
        buttons.forEach((item) => {
          item.disabled = false;
          item.textContent = initialText;
        });
        clearInterval(interval);
      }

      count--;
    }, 1000);
  },
};

// Scroller functionality
const scroller = {
  setup: () => {
    const highlightVideoItems = document.querySelectorAll('[data-scroller]');

    Array.from(highlightVideoItems).forEach((theScroller) => {
      const scrollElement = theScroller.querySelector('[data-scroller-scroll]');
      const scrollLeft = scrollElement.previousElementSibling;
      const scrollRight = scrollElement.nextElementSibling;
      const maximizeButton = theScroller.querySelector('.maximize-button');

      if (scrollLeft.onclick) {
        return;
      }

      if (
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
    if (!document.querySelector('#pannellum-css')) {
      const link = document.createElement('link');
      link.href =
        'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      link.id = 'pannellum-css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

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

    if (!document.querySelector('#viewer-css')) {
      const link = document.createElement('link');
      link.href =
        'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.css';
      link.id = 'viewer-css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

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

    if (pageDetection.isMediaSingle()) {
      body.classList.add('single-media-page');
    } else {
      body.classList.remove('single-media-page');
    }
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

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          '/serviceworker.js',
          {
            scope: '/',
          }
        );
        const states = {
          installing: 'Service worker installing',
          waiting: 'Service worker installed',
          active: 'Service worker active',
        };
        for (const [state, message] of Object.entries(states)) {
          if (registration[state]) console.log(message);
        }
      } catch (error) {
        console.error(`Registration failed with ${error}`);
      }
    }
  };

  registerServiceWorker();

  function setupLinks(tag) {
    const routeLinks = [...document.querySelectorAll(tag + ' a')];
    routeLinks.forEach((a) => {
      a.removeEventListener('click', navigation.showSpinner);
      a.addEventListener('click', navigation.showSpinner);
    });

    const languageSwitcherLink = utils.getCurrentLanguageSwitcherUrl();
    document.querySelector('#language-switcher').href = languageSwitcherLink;
    if (document.querySelector('#portuguese-language-switcher a')) {
      document.querySelector('#portuguese-language-switcher a').href =
        languageSwitcherLink;
    }

    const backButton = document.querySelector('#back-button');
    if (backButton) {
      backButton.removeEventListener(
        'click',
        navigation.onBackClick.bind(navigation)
      );
      backButton.addEventListener(
        'click',
        navigation.onBackClick.bind(navigation)
      );
    }

    if (utils.isStandaloneMode()) {
      document.querySelectorAll('a[target=_blank]').forEach(function (a) {
        if (!a.href.includes('/webstories/')) {
          a.removeAttribute('target');
        }
      });
    }

    [...document.querySelectorAll('.shuffle button')].forEach((item) => {
      item.removeEventListener('click', shuffle.onClick);
      item.addEventListener('click', shuffle.onClick);
    });

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
      !utils.isStandaloneMode() &&
      !utils.isBrazilian()
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

  shuffle.init();
  setupLinks('body');

  const { pathname } = window.location;
  if (pathname.includes('/countries') || pathname.includes('/hashtags')) {
    setupScroller();
  }

  if ('windowControlsOverlay' in navigator) {
    const body = document.querySelector('body');

    navigator.windowControlsOverlay.addEventListener('geometrychange', () => {
      const isOverlayVisible = navigator.windowControlsOverlay.visible;
      const session = utils.getCookie('__session');

      if (isOverlayVisible) {
        body.classList.add('window-controls-overlay');

        if (!session.includes('window_controls_overlay')) {
          utils.setCookie(
            '__session',
            session + (session ? '&' : '') + 'window_controls_overlay%3Dtrue',
            30
          );
        }
        return;
      }

      body.classList.remove('window-controls-overlay');
      utils.setCookie(
        '__session',
        session
          .replace('&window_controls_overlay%3Dtrue', '')
          .replace('window_controls_overlay%3Dtrue', ''),
        30
      );
    });
  }

  window.addEventListener('pageshow', navigation.hideSpinner);

  navigation.initNavbarLinkClick();

  headObserverFn();

  setTimeout(() => {
    document.querySelector('.main-container').click();
  }, 500);
})();

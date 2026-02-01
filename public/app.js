// Utility functions
const utils = {
  isBrazilian: () => window.location.host.includes('viajarcomale.com.br'),

  getCurrentLanguageSwitcherUrl: () => {
    return !utils.isBrazilian()
      ? document.querySelector('link[rel="alternate"][hreflang="pt"]').href
      : document.querySelector('link[rel="alternate"][hreflang="x-default"]')
          .href;
  },

  showModal: (messageEN, messagePT, html = '', intervalId = null) => {
    const message = utils.isBrazilian() ? messagePT : messageEN;

    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'gemini-modal-overlay';
    modalOverlay.className = 'gemini-modal-overlay';

    const modalContainer = document.createElement('div');
    modalContainer.id = 'gemini-modal-container';
    modalContainer.className = 'gemini-modal-container';

    const modalContent = document.createElement('div');
    modalContent.className = 'gemini-modal-content';
    modalContent.innerHTML = `
      <p>${message}</p>
      ${html}
      <button class="gemini-modal-close-button">X</button>
      <button class="btn btn-primary modal-close-bottom">${utils.isBrazilian() ? 'Fechar' : 'Close'}</button>
    `;

    modalContainer.appendChild(modalContent);
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);

    // Close functionality
    const closeButtonTop = modalContent.querySelector(
      '.gemini-modal-close-button',
    );
    const closeButtonBottom = modalContent.querySelector('.modal-close-bottom');
    const closeModal = () => {
      clearInterval(intervalId); // Clear the interval
      document.body.removeChild(modalOverlay);
    };

    closeButtonTop.addEventListener('click', closeModal);
    closeButtonBottom.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    return closeModal;
  },

  getText: (textEN, textPT) => (utils.isBrazilian() ? textPT : textEN),
};

const pwa = {
  isStandaloneMode: () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches,

  isWindowControlsOverlayMode: () =>
    window.matchMedia('(display-mode: window-controls-overlay)').matches,
};

// Push Notifications
const pushNotifications = {
  // Check if browser supports push notifications
  isSupported: () =>
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window,

  // Check if user is already subscribed
  isSubscribed: () =>
    localStorage.getItem('pushNotificationSubscribed') === 'true',

  // Get the topic based on domain
  getTopic: () =>
    utils.isBrazilian() ? 'daily-content-pt' : 'daily-content-en',

  // Update button visibility based on subscription state
  updateButtonVisibility: () => {
    const enableBtns = document.querySelectorAll('#enable-push-notifications');
    const disableBtns = document.querySelectorAll(
      '#disable-push-notifications',
    );

    if (enableBtns.length === 0 && disableBtns.length === 0) return;

    if (!pushNotifications.isSupported()) {
      enableBtns.forEach((btn) => (btn.style.display = 'none'));
      disableBtns.forEach((btn) => (btn.style.display = 'none'));
      return;
    }

    if (pushNotifications.isSubscribed()) {
      enableBtns.forEach((btn) => (btn.style.display = 'none'));
      disableBtns.forEach((btn) => (btn.style.display = 'block'));
    } else if (Notification.permission !== 'denied') {
      enableBtns.forEach((btn) => (btn.style.display = 'block'));
      disableBtns.forEach((btn) => (btn.style.display = 'none'));
    } else {
      enableBtns.forEach((btn) => (btn.style.display = 'none'));
      disableBtns.forEach((btn) => (btn.style.display = 'none'));
    }
  },

  // Request permission and subscribe to topic
  requestPermissionAndSubscribe: async () => {
    let notificationImage1 = null;
    let notificationImage2 = null;
    let currentImage = 1;

    const intervalId = setInterval(() => {
      if (currentImage === 1) {
        notificationImage1.style.display = 'none';
        notificationImage2.style.display = 'block';
        currentImage = 2;
      } else {
        notificationImage1.style.display = 'block';
        notificationImage2.style.display = 'none';
        currentImage = 1;
      }
    }, 2000); // Change image every 1 second

    // Show explanatory dialog while requesting permission
    const closePushModal = utils.showModal(
      'By enabling push notifications, you will receive a notification with random content every day.',
      'Ao ativar as notificações push, você receberá uma notificação com conteúdo aleatório todos os dias.',
      `<div id="gemini-notification-images" style="text-align: center; margin-top: 10px;">
        <img id="notification-image-1" src="/images/notification_1.png" alt="Notification Image 1" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
        <img id="notification-image-2" src="/images/notification_2.png" alt="Notification Image 2" style="max-width: 100%; height: auto; display: none; margin: 0 auto;" />
      </div>`,
      intervalId,
    );

    notificationImage1 = document.getElementById('notification-image-1');
    notificationImage2 = document.getElementById('notification-image-2');

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Get FCM token and subscribe to topic
        const { getToken, getMessaging } =
          await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging.js');
        const { initializeApp } =
          await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js');

        // Initialize Firebase (use existing config if available)
        const firebaseConfig = {
          apiKey: 'AIzaSyAF_eks-zMMusYpr0a-lZPfhxsMEo-2MS8',
          authDomain: 'viajarcomale.firebaseapp.com',
          projectId: 'viajarcomale',
          storageBucket: 'viajarcomale.appspot.com',
          messagingSenderId: '207097887664',
          appId: utils.isBrazilian
            ? '1:207097887664:web:b0f038dd322c756f77b475'
            : '1:207097887664:web:2a746899ec96057577b475',
          measurementId: 'G-82XD635PJV',
        };

        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        // Get token with service worker
        const token = await getToken(messaging, {
          serviceWorkerRegistration: registration,
        });

        if (token) {
          // Subscribe to topic via Cloud Function
          const topic = utils.isBrazilian()
            ? 'daily-content-pt'
            : 'daily-content-en';

          const response = await fetch(
            'https://us-central1-viajarcomale.cloudfunctions.net/subscribeToTopic',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, topic }),
            },
          );

          if (response.ok) {
            // Save subscription state to localStorage
            localStorage.setItem('pushNotificationSubscribed', 'true');
            localStorage.setItem('pushNotificationTopic', topic);
            localStorage.setItem('pushNotificationToken', token);

            // Update button visibility
            pushNotifications.updateButtonVisibility();

            utils.showModal(
              'Push notifications enabled successfully!',
              'Notificações push ativadas com sucesso!',
            );
            closePushModal();
          } else {
            throw new Error('Failed to subscribe to topic');
          }
        }
      } else if (permission === 'denied') {
        utils.showModal(
          'Permission denied. You can enable notifications in browser settings.',
          'Permissão negada. Você pode ativar as notificações nas configurações do navegador.',
        );
        pushNotifications.updateButtonVisibility();
        closePushModal();
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      utils.showModal(
        'Push notifications are not supported in this browser.',
        'Notificações push não são suportadas neste navegador.',
      );
    }
  },

  // Unsubscribe from push notifications
  unsubscribeFromNotifications: async () => {
    try {
      const token = localStorage.getItem('pushNotificationToken');
      const topic = localStorage.getItem('pushNotificationTopic');

      if (token && topic) {
        const response = await fetch(
          'https://us-central1-viajarcomale.cloudfunctions.net/unsubscribeFromTopic',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, topic }),
          },
        );

        if (!response.ok) {
          console.error('Failed to unsubscribe from topic');
        }
      }

      // Clear subscription state from localStorage
      localStorage.removeItem('pushNotificationSubscribed');
      localStorage.removeItem('pushNotificationTopic');
      localStorage.removeItem('pushNotificationToken');

      // Update button visibility
      pushNotifications.updateButtonVisibility();

      utils.showModal(
        'Push notifications disabled.',
        'Notificações push desativadas.',
      );
    } catch (error) {
      console.error('Error disabling push notifications:', error);
    }
  },

  // Initialize push notification buttons
  init: () => {
    const enableBtns = document.querySelectorAll('#enable-push-notifications');
    const disableBtns = document.querySelectorAll(
      '#disable-push-notifications',
    );

    if (enableBtns.length === 0 && disableBtns.length === 0) return;

    // Update button visibility
    pushNotifications.updateButtonVisibility();

    // Add click handler for enable button
    enableBtns.forEach((enableBtn) => {
      enableBtn.addEventListener('click', (event) => {
        event.preventDefault();
        pushNotifications.requestPermissionAndSubscribe();
      });
    });

    // Add click handler for disable button
    disableBtns.forEach((disableBtn) => {
      disableBtn.addEventListener('click', (event) => {
        event.preventDefault();
        pushNotifications.unsubscribeFromNotifications();
      });
    });
  },
};

// Add checkWindowControlsOverlay to pwa object
pwa.checkWindowControlsOverlay = () => {
  const body = document.querySelector('body');

  const isOverlayVisible = navigator.windowControlsOverlay.visible;

  if (isOverlayVisible) {
    body.classList.add('window-controls-overlay');
    return;
  }

  body.classList.remove('window-controls-overlay');
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
        maximizeButton.style.display = 'none';
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
            '&sub_confirmation=1',
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

    if ('windowControlsOverlay' in navigator) {
      pwa.checkWindowControlsOverlay();
    }
  },
};

(() => {
  let deferredPrompt;
  const addToHomeBtns = document.querySelectorAll('#add-to-home');

  window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;

    if (addToHomeBtns.length === 0) {
      return;
    }

    addToHomeBtns.forEach((addToHomeBtn) => {
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
          utils.showModal(
            'Copied to clipboard.',
            'Copiado para a área de transferência.',
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
        'link[rel="alternate"][hreflang="pt"]',
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

  // Initialize push notifications button
  pushNotifications.init();

  headObserverFn();

  setTimeout(() => {
    document.querySelector('.main-container').click();
  }, 500);
})();

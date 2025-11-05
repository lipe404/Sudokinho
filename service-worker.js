/**
 * Service Worker para PWA - Cache offline
 */

const CACHE_NAME = 'sudokinho-v1.0.0';
const RUNTIME_CACHE = 'sudokinho-runtime-v1.0.0';

// Arquivos para cache estático
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/js/main.js',
  '/js/game/GameController.js',
  '/js/game/GameState.js',
  '/js/game/SudokuGenerator.js',
  '/js/ui/GridManager.js',
  '/js/ui/AudioController.js',
  '/js/ui/ModalManager.js',
  '/js/ui/ImageMode.js',
  '/js/utils/Helpers.js',
  '/js/utils/Timer.js',
  '/js/utils/Validator.js',
  '/js/utils/HistoryManager.js',
  '/js/utils/SaveManager.js',
  '/js/animations/AnimationManager.js',
  '/midia/music.mp3',
  '/imgs/icon.ico',
  '/imgs/icon.jpg'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando arquivos estáticos');
        return cache.addAll(STATIC_CACHE_URLS.map(url => {
          try {
            return new Request(url, { mode: 'no-cors' });
          } catch (e) {
            return url;
          }
        })).catch((error) => {
          console.warn('[Service Worker] Erro ao cachear alguns arquivos:', error);
          // Continuar mesmo se alguns arquivos falharem
          return Promise.resolve();
        });
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      return self.clients.claim();
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requisições de APIs externas (exceto recursos do próprio site)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && !url.pathname.startsWith('/imgs/') && !url.pathname.startsWith('/midia/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retornar do cache se disponível
        if (cachedResponse) {
          return cachedResponse;
        }

        // Buscar da rede
        return fetch(event.request)
          .then((response) => {
            // Não cachear respostas inválidas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar resposta para cache
            const responseToCache = response.clone();

            // Cachear em runtime cache
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Erro ao buscar recurso:', error);
            // Retornar página offline se disponível
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


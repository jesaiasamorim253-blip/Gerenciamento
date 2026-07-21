// Service worker do Gerê — permite instalar como app e funcionar offline.
// Estratégia: SEMPRE busca a versão mais nova na rede primeiro (assim
// qualquer atualização aparece na hora). Só usa a cópia salva em cache
// quando o celular está sem internet. Os dados do app (operações, etc.)
// não ficam aqui — ficam no localStorage, que este arquivo não mexe.

const CACHE_NOME = 'gere-cache-v2';
const ARQUIVOS_PARA_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_PARA_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NOME)
          .map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
  evento.respondWith(
    fetch(evento.request)
      .then((respostaRede) => {
        const copia = respostaRede.clone();
        caches.open(CACHE_NOME).then((cache) => cache.put(evento.request, copia));
        return respostaRede;
      })
      .catch(() => {
        return caches.match(evento.request).then((respostaCache) => respostaCache || caches.match('./index.html'));
      })
  );
});

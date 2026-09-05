// injected.js - page dünyasında çalışır, window.socket ve ChatV2'ye erişir
(function() {
  function send(count) {
    window.postMessage({ type: 'ITEMSATIS_UNREAD', count }, '*');
  }

  function countUnread() {
    // 1. En güvenilir: ChatV2'nin kendi sayımı (aynı selector)
    const nodes = document.querySelectorAll('#chat-conversation-list .chat-item.is-unread');
    if (nodes.length) return nodes.length;
    // 2. window üzerinden erişim (bazı sürümlerde global)
    try {
      // ChatV2 bazen unread'i data üzerinden tutar, DOM fallback yeterli
    } catch(e){}
    return 0;
  }

  function hookSocket() {
    const sock = window.socket;
    if (!sock || !sock.on) return false;
    // ChatV2 eventleri: receiveMessageList.v1 en önemli
    const events = [
      'receiveMessageList.v1',
      'receiveMessageWithPagination.v1',
      'receiveMessage.v1',
      'receiveMessageDetails.v1',
      'chatRead.v1'
    ];
    events.forEach(ev => {
      try {
        sock.on(ev, () => {
          setTimeout(() => send(countUnread()), 300);
        });
      } catch(e){}
    });
    // iAmConnected sonrası da say
    try { sock.on('iAmConnected', () => setTimeout(() => send(countUnread()), 800)); } catch(e){}
    return true;
  }

  // Socket hazır olana kadar dene
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (hookSocket()) {
      clearInterval(timer);
      send(countUnread());
    }
    if (tries > 40) clearInterval(timer);
  }, 500);

  // DOM observer - liste değişince say
  const obs = new MutationObserver(() => {
    send(countUnread());
  });
  function startDomObs() {
    const list = document.getElementById('chat-conversation-list');
    if (list) {
      obs.observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
      send(countUnread());
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      startDomObs();
      setTimeout(() => send(countUnread()), 1000);
    });
  } else {
    startDomObs();
    setTimeout(() => send(countUnread()), 800);
  }
  setInterval(() => send(countUnread()), 2500);
})();

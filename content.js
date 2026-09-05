// content.js - header badge + DOM observer
(function() {
  // Gizli mod sayfa yüklenir yüklenmez uygulansın (göz kırpması olmasın)
  try {
    if (localStorage.getItem('is_bal_hidden') === '1' && document.documentElement) {
      document.documentElement.classList.add('is-bal-hidden');
    }
  } catch(e) {}
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('injected.js');
  s.onload = () => s.remove();
  (document.head || document.documentElement).appendChild(s);

  let headerIcons = [];
  let lastCount = -1;

  function findHeaderIcons() {
    const all = Array.from(document.querySelectorAll('a[href="/mesajlarim.html"]'));
    return all.filter(a => {
      const hasIcon = a.querySelector('img,svg,i') || a.id === 'mobileChatCountBadge';
      if (!hasIcon) return false;
      const style = window.getComputedStyle(a);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = a.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return false;
      if (a.offsetParent === null && style.position !== 'fixed') {
        const inHeader = a.closest('header');
        if (!inHeader) return false;
      }
      return true;
    });
  }

  function ensureBadge(icon) {
    if (!icon.classList.contains('is-badge-host')) icon.classList.add('is-badge-host');
    let badge = icon.querySelector('.is-header-chat-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'is-header-chat-badge';
      badge.textContent = '0';
      icon.appendChild(badge);
    } else {
      // eski site class'larını ve kopyalanmış inline stilleri temizle
      badge.classList.remove('floating', 'ui', 'red', 'label');
      badge.removeAttribute('style');
    }
    return badge;
  }

  function getUnreadFromDOM() {
    const list = document.querySelectorAll('#chat-conversation-list .chat-item.is-unread');
    if (list.length > 0) return list.length;
    const mini = document.getElementById('mcv2-badge');
    if (mini && !mini.classList.contains('hidden')) {
      const n = parseInt(mini.textContent.trim(), 10);
      if (!isNaN(n)) return n > 9 ? 9 : n;
    }
    return 0;
  }

  function updateHeader(count) {
    if (count === lastCount) return;
    lastCount = count;
    headerIcons = findHeaderIcons();
    if (headerIcons.length === 0) headerIcons = findHeaderIcons();
    headerIcons.forEach(icon => {
      const badge = ensureBadge(icon);
      if (count > 0) {
        badge.textContent = count > 9 ? '9+' : String(count);
        badge.classList.add('show');
      } else {
        badge.classList.remove('show');
      }
    });
  }

  window.addEventListener('message', (e) => {
    if (e.source !== window) return;
    if (e.data && e.data.type === 'ITEMSATIS_UNREAD') {
      updateHeader(Number(e.data.count) || 0);
    }
  });

  let debounce = null;
  const observer = new MutationObserver(() => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const c = getUnreadFromDOM();
      updateHeader(c);
      maskBalances();
    }, 150);
  });

  // Bakiye gizle/göster - cüzdan etiketi + dropdown bakiyeleri, seçim hatırlanır
  const BAL_KEY = 'is_bal_hidden';
  const BAL_SEL = '.Wallet .floating.ui.green.label, .item-user .user-text span, .blokeBakiyeDiv .badge';
  const EYE_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
  const EYE_SHUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>';
  function setBalIcon(btn, hidden) {
    btn.innerHTML = hidden ? EYE_SHUT : EYE_OPEN;
  }
  function isBalHidden() {
    try { return localStorage.getItem(BAL_KEY) === '1'; } catch(e) { return false; }
  }
  function setBalHidden(v) {
    try { localStorage.setItem(BAL_KEY, v ? '1' : '0'); } catch(e) {}
  }
  function maskBalances() {
    const hide = isBalHidden();
    document.querySelectorAll(BAL_SEL).forEach(el => {
      const cur = el.textContent;
      if (!el.dataset.balOrig) el.dataset.balOrig = cur;
      else if (hide && cur !== '*******' && /\d/.test(cur)) el.dataset.balOrig = cur;
      el.textContent = hide ? '*******' : (el.dataset.balOrig || cur);
    });
    // yanlış yerde kalmış wrapleri temizle (cüzdan li'sinin hemen sonrasında olmayanlar)
    document.querySelectorAll('li.is-bal-li').forEach(el => {
      const prev = el.previousElementSibling;
      if (!prev || !prev.classList || !prev.classList.contains('bakiyeDropdown')) el.remove();
    });
    // cüzdan içi eski butonları temizle
    document.querySelectorAll('li.bakiyeDropdown .is-bal-toggle').forEach(b => b.remove());
    // cüzdan li'sinin DIŞINA, hemen yanına ayrı li (hover/tıklama alanına girmez)
    document.querySelectorAll('li.bakiyeDropdown').forEach(li => {
      const ul = li.parentElement;
      if (!ul) return;
      let wrap = li.nextElementSibling;
      if (!wrap || !wrap.classList || !wrap.classList.contains('is-bal-li')) {
        wrap = document.createElement('li');
        wrap.className = 'is-bal-li';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'is-bal-toggle';
        btn.title = 'Bakiyeyi gizle/göster';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const nowHidden = !isBalHidden();
          setBalHidden(nowHidden);
          try { document.documentElement.classList.toggle('is-bal-hidden', nowHidden); } catch(err) {}
          document.querySelectorAll('.is-bal-toggle').forEach(t => setBalIcon(t, nowHidden));
          maskBalances();
        });
        wrap.appendChild(btn);
        li.after(wrap);
      }
      const btn = wrap.querySelector('.is-bal-toggle');
      if (btn) setBalIcon(btn, hide);
    });
  }

  function startObserve() {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    setTimeout(() => { updateHeader(getUnreadFromDOM()); maskBalances(); }, 800);
    setInterval(markMiniChat, 1000);
    markMiniChat();
  }

  // Mini widget (fixed/absolute) ile tam sayfa chat'i ayır - sadece mini'ye üst z-index
  function markMiniChat() {
    const frame = document.querySelector('.chat-v2-frame');
    if (!frame) return;
    const style = window.getComputedStyle(frame);
    const isMini = style.position === 'fixed' || style.position === 'absolute';
    frame.classList.toggle('is-mini', isMini);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserve);
  } else {
    startObserve();
  }
  setInterval(() => { updateHeader(getUnreadFromDOM()); maskBalances(); }, 2000);
})();

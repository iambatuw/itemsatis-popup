# ItemSatış Popup & Chat Badge

Chrome / Brave / Edge uzantısı — ItemSatış sohbet deneyimini iyileştirir.

## Özellikler

- **Header chat badge** — Üst bardaki sohbet ikonuna okunmamış mesaj sayısını kırmızı rozet olarak ekler. Sabit ölçülü kendi stili var (esnemez), konumu mavi bildirim rozetiyle aynı köşeye ayarlı.
- **ChatV2 uyumlu** — Socket.IO eventlerini dinler (`receiveMessageList.v1`, `receiveMessage.v1`, `chatRead.v1`...), `#chat-conversation-list .chat-item.is-unread` sayımıyla header'ı günceller. Socket yoksa DOM observer fallback'i var.
- **Bakiye gizleme** — Cüzdanın solunda "Bakiyeyi Gizle / Bakiye Göster" butonu. Gizliyken cüzdan + profil + bekleyen bakiyeler `*******` görünür. Seçim `localStorage`'da saklanır, bütün sayfalarda geçerlidir ve sayfa açılır açılmaz CSS ile uygulanır (göz kırpması yok).
- **Mini chat her zaman üstte** — Mini sohbet widget'ı navbar barının üstünde açılır, profil / bakiye / bildirim dropdown menüleri chat'in de üstünde kalır. Tam sayfa `mesajlarim.html` etkilenmez.
- **Banner & widget temizliği** — Masaüstü banner şeridi, `alfa-livechat`, fırsat görseli, sidebar widget, yapay zekâ sohbet satırı ve X kapatma butonu görünmez yapılır ama DOM'da kalır (site JS'i bozulmaz, "Toplu Stok Ekle" çalışır).
- **Kullanıcı bilgisi paneli scroll** — Mini sohbette `i` butonuyla açılan bilgi panelinin içi kayar.

## Kurulum

1. `chrome://extensions` adresini aç
2. Sağ üstten **Geliştirici modu**'nu etkinleştir
3. **Paketlenmemiş öğe yükle** → bu klasörü seç
4. `www.itemsatis.com` üzerinde çalışır

## Dosyalar

| Dosya | Açıklama |
|---|---|
| `manifest.json` | MV3 manifest, `itemsatis.com/*` eşleşme |
| `content.js` | Isolated world: badge DOM yönetimi, mini/tam sayfa ayrımı, bakiye maskeleme |
| `injected.js` | Page world: `window.socket` ChatV2 event hook + okunmamış sayımı |
| `style.css` | Badge stili, gizleme kuralları, z-index katmanları, bakiye maskesi |

## Katman sırası

`profil/bildirim dropdown (100000)` > `mini chat (90000)` > `navbar barı` > `sayfa içeriği`

# ItemSatış Popup & Chat Badge

Chrome / Brave / Edge uzantısı — ItemSatış sohbet deneyimini iyileştirir.

## Özellikler

- **Header chat badge** — Üst bardaki sohbet ikonuna okunmamış mesaj sayısını kırmızı rozet olarak ekler. Sitenin mavi bildirim rozetiyle birebir aynı stil (`floating ui label`), konumu her saniye mavi rozetten kopyalanır.
- **ChatV2 uyumlu** — Socket.IO eventlerini dinler (`receiveMessageList.v1`, `receiveMessage.v1`, `chatRead.v1`...), `#chat-conversation-list .chat-item.is-unread` sayımıyla header'ı günceller. Socket yoksa DOM observer fallback'i var.
- **Mini chat her zaman üstte** — Mini sohbet widget'ı navbar barının üstünde açılır, profil / bakiye / bildirim dropdown menüleri chat'in de üstünde kalır. Tam sayfa `mesajlarim.html` etkilenmez.
- **Banner & widget temizliği** — Masaüstü banner şeridi, `alfa-livechat`, fırsat görseli, sidebar widget ve yapay zekâ sohbet satırı görünmez yapılır ama DOM'da kalır (site JS'i bozulmaz, "Toplu Stok Ekle" çalışır).
- **Kullanıcı bilgisi paneli scroll** — Mini sohbette `i` butonuyla açılan bilgi panelinin içi kayar, avatar/kullanıcı adı üstte sabit kalır.

## Kurulum

1. `chrome://extensions` adresini aç
2. Sağ üstten **Geliştirici modu**'nu etkinleştir
3. **Paketlenmemiş öğe yükle** → bu klasörü seç
4. `www.itemsatis.com` üzerinde çalışır

## Dosyalar

| Dosya | Açıklama |
|---|---|
| `manifest.json` | MV3 manifest, `itemsatis.com/*` eşleşme |
| `content.js` | Isolated world: badge DOM yönetimi, mini/tam sayfa ayrımı, rozet konum senkronu |
| `injected.js` | Page world: `window.socket` ChatV2 event hook + okunmamış sayımı |
| `style.css` | Badge stili, gizleme kuralları, z-index katmanları |

## Katman sırası

`profil/bildirim dropdown (100000)` > `mini chat (90000)` > `navbar barı` > `sayfa içeriği`

## Lisans

MIT

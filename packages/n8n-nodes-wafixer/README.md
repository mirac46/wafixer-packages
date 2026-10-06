# n8n-nodes-wafixer

WAFixer için **n8n community nodes** — WhatsApp, Messenger ve Instagram mesajlarını dinle ve yanıtla, Facebook/Instagram
yorumlarına yanıt ver, Facebook Lead Ads lead'lerini işle. Trigger ve action node'larıyla iki tıklamada akış kur.

## Kurulum

### Yöntem 1 — n8n GUI üzerinden (önerilen)

1. n8n'i aç → **Settings** → **Community Nodes**
2. **Install a community node** butonuna bas
3. Paket adına yaz: `n8n-nodes-wafixer`
4. **Install**

### Yöntem 2 — npm üzerinden manuel (self-hosted)

```bash
cd ~/.n8n/custom
npm install n8n-nodes-wafixer
```

n8n'i yeniden başlat. Node panelinde "WAFixer" ve "WAFixer Trigger" görünecek.

## Credential ekleme

1. n8n → **Credentials** → **New** → **WAFixer API**
2. **Base URL:** `https://wafixer.com` (varsayılan). WAFixer sana başka bir adres vermediyse değiştirme;
   `api.wafixer.com` henüz genel kullanımda değil.
3. **API Key:** Panel → **Ayarlar → API Anahtarları** sekmesinden **Yeni Anahtar Oluştur** ile üretilen `wfx_...` ile başlayan anahtar
4. **Webhook Signing Secret** (isteğe bağlı): oturumun webhook imza sırrı (`whsec_...`). Doluysa WAFixer Trigger
   imzası geçersiz ya da 5 dakikadan eski olayları **401** ile reddeder; boşsa imza aranmaz.
5. **Test** butonuyla doğrula → ✓ yeşil
6. **Save**

> **Not:** Panel `wfx_` ön ekli kullanıcı anahtarlarını otomatik tanır. Anahtar bir kez gösterilir, kaybedersen yenisini üret.
> Credential kaydedilince WAFixer action ve trigger node'larında oturumlar otomatik listelenir. Bağlı oturumlar `Active`, yeniden QR isteyenler `QR Required` etiketiyle görünür.

## Node 1: WAFixer (Action)

Beş kaynak (**Resource**): Message, Chat, Comment, Lead, Session. Eski akışlar değişmeden **Message** kaynağında
çalışır.

### Message — 19 operation

| Operation | Ne yapar |
|---|---|
| **Send Text** | Düz metin |
| **Send Media** | Resim / video / döküman / audio (URL veya base64) |
| **Send Audio (PTT)** | Sesli mesaj |
| **Send Sticker** | Sticker |
| **Send Location** | Konum |
| **Send Contact** | Kişi kartı |
| **Send Reaction** | Mesaja emoji reaksiyon |
| **Send Poll** | Anket |
| **Send Buttons** | Butonlu interaktif mesaj |
| **Send List** | Listeli interaktif mesaj |
| **Reply to Message** | Trigger event'inden gelen mesaja alıntılı yanıt (en sık kullanım) |
| **Mark as Read** | Mesajları okundu işaretle |
| **Send Presence** | "Yazıyor / kaydediyor / online" |
| **Send Video Note (PTV)** | Yuvarlak kısa video |
| **Send Template** | Meta'da onaylı şablon; yalnız WhatsApp Cloud API oturumu, 24 saat penceresi dışında konuşma açar. **Components (JSON)** Meta biçiminde değişkenler |
| **Post Status** | WhatsApp durumu (story): metin, resim, video, ses; tüm kişilere ya da seçilen numaralara. Yalnız QR oturumu |
| **Edit Message** | Gönderdiğin mesajın metnini değiştirir (WhatsApp, 15 dakika içinde) |
| **Delete for Everyone** | Gönderilen mesajı herkes için siler |
| **Download Media** | Trigger'dan gelen mesajın medyasını base64 indirir (`base64`, `mimetype`) |

**Messenger / Instagram Options** (Send Text, Reply to Message):
- **Quick Replies** — mesajın altında en çok 13 düğme; dokunulan düğme trigger'da
  `data.message.buttonsResponseMessage.selectedButtonId` olarak gelir.
- **Human Agent** — yanıtı bir kişi elle yazdıysa açılır; 24 saat penceresi kapalıyken son mesajdan 7 güne kadar
  gönderim sağlar. Otomatik yanıtlarda açılmaz.

Messenger/Instagram'da **Number** alanı PSID/IGSID'dir: trigger'daki `data.key.remoteJid`'in `@` öncesi.
Kanalda olmayan işlem (Send List, Send Location…) açıklamalı bir hata verir.

### Comment — Facebook Sayfa ve Instagram yorumları

Facebook yorumları Sayfanın Messenger oturumunda, Instagram yorumları Instagram oturumunda.

| Operation | Ne yapar |
|---|---|
| **Get Many** | Yorumları yeniden eskiye listeler; her yorum gönderi özetiyle (`post`) tek öğe. Filtreler: Post ID, Parent Comment ID, Status, Top-Level Only, Unread Only, Since, Until |
| **Reply** | Yoruma herkese açık yanıt (Sayfa/hesap adına) |
| **Mark as Read** | Belirli yorumlar, bir gönderinin yorumları ya da hepsi |
| **Import** | Bir gönderinin yorum geçmişini içe aktarır (içe aktarılanlar için trigger olayı gelmez) |
| **Hide or Show** | Yorumu gizler ya da yeniden gösterir (**Hidden**) |
| **Delete** | Yorumu Facebook/Instagram'da siler |
| **Private Reply** | Yorum sahibine özel mesaj (DM); yorumdan sonraki 7 gün içinde, yorum başına bir kez |

### Lead — Facebook Lead Ads

| Operation | Ne yapar |
|---|---|
| **Get Many** | Lead'leri listeler. Filtreler: Status (çoklu), Fetch Status, Form ID, Page ID, Unread Only, Since, Until, Updated Since |
| **Get** | Tek lead |
| **Update** | Status (`new`, `contacted`, `qualified`, `discarded`), Note, Read |
| **Get Forms** | Lead formları; **Sync From Meta** ile önce Meta'dan yeniden okur |

**Comment ID** ve **Lead ID** alanları varsayılan olarak trigger olayından ya da listelenen öğeden dolar.

### Chat — sohbetler, kişiler, kayıtlı mesajlar

| Operation | Ne yapar |
|---|---|
| **Check WhatsApp Numbers** | Virgülle ayrılmış numaraların WhatsApp hesabı var mı; numara başına bir öğe (`exists`, `jid`) |
| **Get Many Messages** | Bir sohbetin kayıtlı mesajları, sayfa sayfa (**Limit**, **Page**); her öğede `_page` (`total`, `pages`, `currentPage`) |
| **Get Chat** | Tek sohbet (**Remote JID**) |
| **Get Many Chats** | Oturumun sohbetleri |
| **Get Many Contacts** | Kayıtlı kişiler; filtre: Name, Remote JID |
| **Get Profile Picture** | Kişinin profil resmi adresi; gizliyse `null` |
| **Block or Unblock** | Kişiyi engeller ya da engeli kaldırır |
| **Archive or Unarchive** | Sohbeti arşivler / listeye geri alır |
| **Mark as Unread** | Sohbeti okunmamış işaretler |

**Remote JID** varsayılan olarak trigger'daki `data.key.remoteJid`'dir: WhatsApp `905...@s.whatsapp.net`, Messenger
`PSID@messenger`, Instagram `IGSID@instagram`. Archive ve Mark as Unread sohbetin son mesajının anahtarını ister;
o da trigger'dan gelir.

### Session — oturumlar

| Operation | Ne yapar |
|---|---|
| **Get Many** | API key'in eriştiği oturumlar, kanal ve bağlantı durumuyla (Session alanı gizlenir) |
| **Get Connection State** | `open`, `connecting`, `close`; QR oturumunda otomatik yeniden bağlanma durumu `reconnect` (`phase`: `reconnecting` ya da `awaiting_qr`, `attempt`, `maxAttempts`, `nextAttemptAt`) |
| **Restart** | Oturumu yeniden başlatır, otomatik deneme sayacını sıfırlar; eşlenmemiş QR oturumunda yeni QR üretir |

**Session** → credential'daki API key ile erişilebilen WAFixer oturumları listeden seçilir; Messenger ve Instagram
oturumlarının yanında kanal yazar (`Active - Klinik (Messenger)`). `Active` oturumlar çalışmaya hazırdır;
`QR Required` ve `Reconnect Required` oturumlar önce WAFixer panelinden yeniden bağlanmalıdır.

## Node 2: WAFixer Trigger

Bir WAFixer instance'ında belirli olaylar gerçekleştiğinde akışı **otomatik tetikler**. Workflow aktif edildiğinde n8n webhook URL'ini WAFixer'a otomatik kaydeder, durdurulunca temizler.

**Dinlenebilir olaylar:**
- New Message (`messages.upsert`) — gelen mesaj
- Outgoing Message (`send.message`) — senin gönderdiğin mesaj
- Message Status (`messages.update`) — okundu / teslim edildi
- Connection State (`connection.update`) — bağlandı / koptu; Messenger/Instagram'da `data.reason`:
  `token_invalid`, `subscription_lost`, `revoked`. QR oturumunda `data.reconnect`: `reconnecting` (sonraki deneme
  `nextAttemptAt`'te) ya da `awaiting_qr` (eşlenmemiş oturumda denemeler bitti, QR okutulmalı)
- QR Code Updated (`qrcode.updated`) — yeni QR (`data.qrcode.base64`) ya da QR deneme sınırı doldu
- Message Edited (`messages.edited`), Outgoing Message Edited (`send.message.update`)
- Session Status (`status.instance`), Session Logged Out (`logout.instance`), Session Deleted (`remove.instance`;
  bu ikisinde `data` `null`)
- Label Changed / Label Assigned (`labels.*`) — WhatsApp Business etiketleri
- Comment Received / Updated / Removed / Reply Sent / Private Reply Sent (`comment.*`) — Facebook ve Instagram
  yorumları; Removed `data.reason` (`deleted_by_owner`, `removed_on_meta`) taşır. Private Reply Sent ile aynı mesaj
  Outgoing Message olarak da gelir; `data.message.id` ile tekilleştir.
- Lead Received / Updated (`lead.*`) — Facebook Lead Ads
- Yeni kişi, yeni grup, üye ekle/çıkar, çağrı, Typebot ve sunucunun kabul ettiği diğer olaylar; liste
  `wafixer-sdk`'daki `WEBHOOK_EVENTS`'ten gelir.

Hiç olay seçilmezse geçmiş eşitleme olayları (Message History Synced, Contacts Synced, Chats Synced) dışındaki
bütün olaylar kaydedilir; o üçü çok büyük gövde taşır, yalnız açıkça seçilince gelir.

**Options:**
- **Channels** — yalnız seçilen kanalların olayları (WhatsApp, Messenger, Instagram); boşsa hepsi
- **Send Media as Base64** — medyayı payload içine gömer (büyük payload, ama harici URL gerekmez)
- **Ignore Outgoing Messages** — kendi gönderdiğin mesajları filtreler

Olaylar en az bir kez teslim edilir; yorumları `data.comment.id`, lead'leri `data.id` ile tekilleştir.

**İmza doğrulama:** webhook adresini bilen biri sahte olay gönderip akışı tetikleyemesin diye oturuma imza sırrı
tanımla ve aynı değeri credential'daki **Webhook Signing Secret** alanına yaz. Sır
`POST /webhook/signingSecret/{oturum}` ile üretilir (ya da `wafixer-sdk` → `webhook.rotateSigningSecret`); değer yalnız
o yanıtta bir kez görünür. Sır tanımlıyken WAFixer her olayı `X-Wafixer-Signature` ve `X-Wafixer-Timestamp`
başlıklarıyla gönderir; tetikleyici imzayı ham gövdeyle doğrular, tutmayan isteği 401 ile reddeder ve akışı başlatmaz.

## Tipik Akış: Otomatik Yanıt Botu

```
[WAFixer Trigger]
   ↓ (yeni mesaj geldi)
[IF: text == "merhaba"]
   ↓
[WAFixer: Reply to Message]
   ↓ ("Merhaba, size nasıl yardımcı olabilirim?")
[WAFixer: Send Presence — composing 1500ms]
   ↓
[WAFixer: Mark as Read]
```

## Reply to Message — Önemli detay

Trigger node'un çıktısı ile Reply node'u sıralı bağlandığında, **Webhook Event** alanı otomatik olarak `={{ $json }}` ile dolar. Yani trigger'dan gelen tam payload'ı alır, alıntı (quoted) ve hedef numarayı kendisi çıkarır. Sen sadece **Reply Text** alanına yazdığın metni girersin.

## Versiyonlama

`0.x` sürümleri alpha'dır; API yüzeyi stabilleşince `1.0.0`'a geçilir. Değişiklikler:
[CHANGELOG.md](./CHANGELOG.md) ve [Releases](https://github.com/mirac46/wafixer-packages/releases).

## Sorun giderme

**"Bu kanalda yetkin yok"**: API key panel'in global key'i mi, yoksa instance-specific token mu? Global olmalı.

**Trigger çalışmıyor**: Workflow'un **active** olması gerek (sağ üst toggle). Ayrıca WAFixer panelinden o instance'ın webhook ayarı el ile değiştirilmemeli — Trigger node otomatik yönetir.

**"24-hour messaging window is closed"**: Messenger/Instagram'da kullanıcının son mesajından 24 saat geçti.
Kişi elle yanıt veriyorsa **Human Agent** açılabilir (7 güne kadar); otomasyon kullanıcının yeniden yazmasını bekler.

**"missing permissions"** (yorum/lead): Meta bağlantısı gereken izinleri içermiyor; oturumu WAFixer panelinden
yeniden bağla. Lead'lerde Business Suite → Lead Erişimi ayarını da kontrol et.

**"Etkinliğe göre URL" konfüzyonu**: Trigger node `byEvents=false` set eder, kafa karışmasın diye.

## Lisans

MIT

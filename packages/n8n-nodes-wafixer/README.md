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
2. **Base URL:** `https://wafixer.com` (kendi WAFixer URL'in)
3. **API Key:** Panel → **Ayarlar → API Anahtarları** sekmesinden **Yeni Anahtar Oluştur** ile üretilen `wfx_...` ile başlayan anahtar
4. **Test** butonuyla doğrula → ✓ yeşil
5. **Save**

> **Not:** Panel `wfx_` ön ekli kullanıcı anahtarlarını otomatik tanır. Anahtar bir kez gösterilir, kaybedersen yenisini üret.
> Credential kaydedilince WAFixer action ve trigger node'larında oturumlar otomatik listelenir. Bağlı oturumlar `Active`, yeniden QR isteyenler `QR Required` etiketiyle görünür.

## Node 1: WAFixer (Action)

Üç kaynak (**Resource**): Message, Comment, Lead. Eski akışlar değişmeden **Message** kaynağında çalışır.

### Message — 13 operation

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
  `token_invalid`, `subscription_lost`, `revoked`
- Comment Received / Updated / Removed / Reply Sent / Private Reply Sent (`comment.*`) — Facebook ve Instagram
  yorumları; Removed `data.reason` (`deleted_by_owner`, `removed_on_meta`) taşır. Private Reply Sent ile aynı mesaj
  Outgoing Message olarak da gelir; `data.message.id` ile tekilleştir.
- Lead Received / Updated (`lead.*`) — Facebook Lead Ads
- Yeni kişi, yeni grup, üye ekle/çıkar, çağrı, vb.

**Options:**
- **Channels** — yalnız seçilen kanalların olayları (WhatsApp, Messenger, Instagram); boşsa hepsi
- **Send Media as Base64** — medyayı payload içine gömer (büyük payload, ama harici URL gerekmez)
- **Ignore Outgoing Messages** — kendi gönderdiğin mesajları filtreler

Olaylar en az bir kez teslim edilir; yorumları `data.comment.id`, lead'leri `data.id` ile tekilleştir.

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

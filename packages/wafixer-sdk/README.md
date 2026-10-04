# wafixer-sdk

Resmi WAFixer TypeScript SDK'sı — WhatsApp, Messenger ve Instagram **mesaj işlemleri**, Facebook/Instagram
**yorumları** ve **Facebook Lead Ads**.

> Webhook'tan gelen mesaja yanıt ver, medya gönder, butonlu mesaj at, "yazıyor" göster, mesajı okundu işaretle,
> yoruma herkese açık yanıt ver, lead'in durumunu güncelle. Hepsi tek satırda, tip-güvenli.

## Kurulum

```bash
npm install wafixer-sdk
# veya
pnpm add wafixer-sdk
# veya
yarn add wafixer-sdk
```

## Hızlı Başlangıç

```typescript
import { Wafixer } from 'wafixer-sdk'

const wa = new Wafixer({
  baseUrl: 'https://wafixer.com',
  apiKey: 'YOUR_API_KEY',
})

// API key'in erişebildiği oturumlar
const sessions = await wa.instances.list()
const activeSessions = sessions.filter((s) => s.connectionStatus === 'open')

// Düz metin
await wa.messages.sendText('SatisHatti', {
  number: '905321788329',
  text: 'Merhaba 👋',
})

// Resim + caption
await wa.messages.sendMedia('SatisHatti', {
  number: '905321788329',
  mediatype: 'image',
  media: 'https://picsum.photos/600/400',
  caption: 'Yeni ürün!',
})

// Sesli mesaj
await wa.messages.sendAudio('SatisHatti', {
  number: '905321788329',
  audio: 'https://example.com/voice.ogg',
})
```

## Webhook'tan gelen mesaja yanıt verme

n8n veya kendi backend'inde webhook handler içinde:

```typescript
import { Wafixer, parseWebhookEvent, getMessageText } from 'wafixer-sdk'

const wa = new Wafixer({ baseUrl: 'https://wafixer.com', apiKey: '...' })

// Express handler örneği
app.post('/wa-webhook', async (req, res) => {
  const event = parseWebhookEvent(req.body)
  if (event?.event !== 'messages.upsert') return res.json({ ok: true })

  const text = getMessageText(event.data)
  if (text?.toLowerCase() === 'merhaba') {
    // Yanıt + alıntılı (quoted) — alıntı otomatik
    await wa.messages.replyTo(event, { text: 'Sana da merhaba 🌟' })
    // Yazıyor göstergesi (1.5 sn)
    await wa.chat.sendPresence(event.instance, {
      number: event.data.key.remoteJid.split('@')[0],
      presence: 'composing',
      delay: 1500,
    })
    // Mesajı okundu işaretle
    await wa.chat.markEventAsRead(event)
    // Reaksiyon ekle
    await wa.messages.reactTo(event, '👋')
  }

  res.json({ ok: true })
})
```

## Messenger ve Instagram

Messenger ve Instagram oturumları WhatsApp oturumlarıyla aynı uçları kullanır; kanal oturumdan gelir. Alıcı
(`number`) PSID/IGSID'dir: webhook'taki `data.key.remoteJid`'in `@` öncesi (`getChannelUserId(event)`).
`replyTo`, `markEventAsRead` ve `reactTo` webhook olayından bunu kendisi çıkarır.

```typescript
import { WafixerWindowClosedError, getChannelUserId } from 'wafixer-sdk'

// Oturumun kanalı ve yetenekleri (istemci sabit yazmaz)
const [session] = await wa.instances.get({ instanceName: 'Klinik Sayfa' })
session.channel // 'MESSENGER'
session.capabilities?.window // { standardHours: 24, humanAgentDays: 7 }

// Hızlı yanıtlı metin; dokunulan seçenek messages.upsert'te buttonsResponseMessage olarak gelir
await wa.messages.sendText('Klinik Sayfa', {
  number: getChannelUserId(event),
  text: 'Size nasıl yardımcı olabilirim?',
  quickReplies: [
    { title: 'Randevu', payload: 'randevu' },
    { title: 'E-posta', type: 'user_email' },
  ],
})

// 24 saat penceresi kapalıysa
try {
  await wa.messages.replyTo(event, { text: 'Merhaba' })
} catch (e) {
  if (e instanceof WafixerWindowClosedError && e.humanAgentAvailable) {
    // Yalnız bir insan temsilci elle yazdıysa: humanAgent 7 güne kadar gönderir.
    // Otomasyon ve AI Agent yanıtları humanAgent göndermez.
    console.log('İnsan temsilci şu ana kadar yanıt verebilir:', e.humanAgentExpires)
  }
}
```

Bağlantı yönetimi:

```typescript
// Barındırılan bağlantı adresi: kullanıcı Facebook ile bağlanmayı wafixer panelinde tamamlar
const { url } = await wa.instances.metaMessagingSession({
  channel: 'INSTAGRAM',
  returnUrl: 'https://uygulamaniz.example/entegrasyonlar',
})

const status = await wa.instances.metaMessaging.status('Klinik Sayfa') // ACTIVE | TOKEN_INVALID | SUBSCRIPTION_LOST | REVOKED
if (status.status === 'SUBSCRIPTION_LOST') await wa.instances.metaMessaging.resubscribe('Klinik Sayfa')
await wa.instances.metaMessaging.disconnect('Klinik Sayfa') // abonelik kalkar, sohbetler kalır
```

## Yorumlar (Facebook Sayfa ve Instagram)

Facebook yorumları Sayfanın Messenger oturumunda, Instagram yorumları Instagram oturumunda okunur.

```typescript
const { comments, posts, nextCursor } = await wa.comment.find('Klinik Sayfa', { unread: true, limit: 20 })
await wa.comment.reply('Klinik Sayfa', comments[0].id, { text: 'Bilgi için DM gönderdik.' })
await wa.comment.markRead('Klinik Sayfa', { commentIds: comments.map((c) => c.id) })

// Geçmişi içe aktar (içe aktarılan yorumlar için olay gelmez)
await wa.comment.import('Klinik Sayfa', { postId: posts[0].id, limit: 500 })

// comment.received olayına yanıt
const event = parseWebhookEvent(req.body)
if (event?.event === 'comment.received') await wa.comment.replyToEvent(event, { text: 'Teşekkürler!' })

// Moderasyon
await wa.comment.hide('Klinik Sayfa', comments[0].id, { hidden: true }) // false: yeniden göster
await wa.comment.delete('Klinik Sayfa', comments[0].id) // comment.removed, reason: deleted_by_owner

// Yorum sahibine özel (DM) yanıt: yorumdan sonraki 7 gün içinde, yorum başına bir kez
const { message } = await wa.comment.privateReply('Klinik Sayfa', comments[0].id, { text: 'Detayları buradan iletiyoruz.' })
```

Özel yanıt sohbete giden mesaj olarak yazılır ve iki olay üretir: `comment.private_reply.sent` ve `send.message`;
ikisini `message.id` ile tekilleştirin. 7 gün geçtiyse `WafixerWindowClosedError` (`window: 'private_reply'`), yorum
zaten yanıtlandıysa `WafixerConflictError` (`reason: 'private_reply_already_sent'`) fırlar.

## Facebook Lead Ads

Lead Sayfası bir oturuma bağlanır; formlar, lead'ler ve `lead.*` olayları o oturuma aittir.

```typescript
const { leads, nextCursor } = await wa.leads.items('Klinik', { status: ['new'], unread: true })
await wa.leads.items.update('Klinik', leads[0].id, { status: 'contacted', note: 'Arandı', read: true })

// Kaçırılan olayları telafi
await wa.leads.items('Klinik', { updatedSince: '2026-10-01T00:00:00Z' })

// Formlar ve geçmiş içe aktarma (varsayılan son 90 gün)
const { forms } = await wa.leads.forms.sync('Klinik')
await wa.leads.forms.import('Klinik', forms[0].formId)
```

## API Yüzeyi

### Messages

| Metod | Ne yapar |
|---|---|
| `sendText(instance, input)` | Düz metin; Messenger/Instagram'da `quickReplies`, `humanAgent` |
| `sendMedia(instance, input)` | Resim / video / döküman / audio |
| `sendAudio(instance, input)` | Sesli mesaj (PTT) |
| `sendPtv(instance, input)` | Push-to-video kısa video |
| `sendSticker(instance, input)` | Sticker |
| `sendButtons(instance, input)` | Buton mesajı (reply / url / call / copy / pix) |
| `sendList(instance, input)` | Listeli interaktif mesaj (`footerText` verilmezse boş gönderilir) |
| `sendPoll(instance, input)` | Anket |
| `sendLocation(instance, input)` | Konum (`name` / `address` verilmezse boş gönderilir) |
| `sendContact(instance, input)` | Kişi kartı |
| `sendReaction(instance, input)` | Bir mesaja emoji reaksiyon |
| `sendTemplate(instance, input)` | Meta Business template (Cloud API) |
| `deleteForEveryone(instance, input)` | Mesajı herkesten sil |
| `updateMessage(instance, input)` | Bir mesajın metnini düzenle |
| `downloadMedia(event)` | Webhook event'indeki medyayı base64 olarak indir |
| `replyTo(event, input)` | Webhook event'ine alıntılı yanıt (`quickReplies`, `humanAgent` geçer) |
| `replyWithMedia(event, input)` | Webhook event'ine medya ile yanıt |
| `reactTo(event, emoji)` | Webhook event'ine reaksiyon |

Messenger/Instagram'da desteklenmeyen işlem (`sendList`, `sendLocation`, `sendPoll`…) `WafixerUnsupportedChannelError` fırlatır.

### Chat

| Metod | Ne yapar |
|---|---|
| `markAsRead(instance, input)` | Mesajları okundu işaretle (mavi tik) |
| `markEventAsRead(event)` | Webhook event'ini okundu işaretle |
| `sendPresence(instance, input)` | Yazıyor / kaydediyor / online göstergesi; `delay` ms bekler, sonra `paused` gönderir (`delay` zorunlu) |
| `updatePresence(instance, input)` | Beklemeden presence gönderir; `presence` boş ve `subscribe: true` ise yalnız karşı tarafın presence akışına abone olur |
| `archiveChat(instance, input)` | Sohbet arşivle |
| `markChatUnread(instance, input)` | Sohbeti okunmamış işaretle |

### Instances

| Metod | Ne yapar |
|---|---|
| `list()` | API key'in erişebildiği oturumlar; `channel` ve `capabilities` dahil |
| `get({ instanceName, instanceId, number })` | Belirli oturumu getirir |
| `connectionState(instance)` | Canlı bağlantı durumunu döndürür |
| `connect(instance, number?)` | Kapalı QR oturumunda bağlantı/QR akışını başlatır |
| `logout(instance)` / `delete(instance)` | Oturumu kapatır / siler |
| `metaMessagingSession({ channel, returnUrl })` | Messenger/Instagram için barındırılan bağlantı adresi |
| `metaMessaging.status(instance)` | Bağlantı durumu, izinler, abone olunan alanlar, son hata (token yok) |
| `metaMessaging.resubscribe(instance)` | Webhook aboneliğini yeniden kurar ve doğrular |
| `metaMessaging.disconnect(instance)` | Bağlantıyı ayırır (Meta aboneliği kalkar, sohbetler kalır) |
| `metaMessaging.config()` / `discover()` / `connect()` / `reconnect()` | Kendi Facebook Login akışını kuranlar için |

### Comment

| Metod | Uç |
|---|---|
| `status(instance)` | `GET /comment/status/{instance}` — eksik izinler, depolama, abonelik |
| `find(instance, filter?)` | `POST /comment/find/{instance}` — `postId`, `parentId`, `topLevelOnly`, `status`, `unread`, `since`, `until`, `limit`, `cursor` |
| `detail(instance, commentId)` | `GET /comment/detail/{instance}/{commentId}` — yorum, gönderi, üst yorum, yanıtlar |
| `reply(instance, commentId, { text })` | `POST /comment/reply/{instance}/{commentId}` |
| `replyToEvent(event, { text })` | `comment.received` olayına yanıt |
| `markRead(instance, input)` | `POST /comment/markRead/{instance}` — `commentIds`, `postId` ya da `all: true` |
| `import(instance, { postId, limit? })` | `POST /comment/import/{instance}` |
| `hide(instance, commentId, { hidden })` | `POST /comment/hide/{instance}/{commentId}` — `{ comment, changed }` |
| `delete(instance, commentId)` | `DELETE /comment/delete/{instance}/{commentId}` — `{ comment, changed }` |
| `privateReply(instance, commentId, { text })` | `POST /comment/privateReply/{instance}/{commentId}` — `{ comment, message }` |
| `privateReplyToEvent(event, { text })` | `comment.received` olayının sahibine özel yanıt |

### Leads

| Metod | Uç |
|---|---|
| `config(instance)` | `GET /leads/config/{instance}` |
| `discover(instance, { userToken })` | `POST /leads/discover/{instance}` |
| `connect(instance, { pageId, selectionRef? })` | `POST /leads/connect/{instance}` |
| `pages(instance)` / `pages.disconnect(instance, pageId)` | `GET /leads/pages/{instance}` / `DELETE /leads/pages/{instance}/{pageId}` |
| `forms(instance, { pageId? })` | `GET /leads/forms/{instance}` |
| `forms.sync(instance, { pageId? })` | `POST /leads/forms/{instance}/sync` |
| `forms.import(instance, formId, { since?, until? })` | `POST /leads/forms/{instance}/{formId}/import` |
| `items(instance, query?)` | `GET /leads/items/{instance}` — `status` (dizi), `fetchStatus`, `formId`, `pageId`, `since`, `until`, `updatedSince`, `unread`, `limit`, `cursor` |
| `items.get` / `items.update` / `items.delete` / `items.retry` | `GET` / `PATCH` / `DELETE /leads/items/{instance}/{leadId}`, `POST …/retry` |

### Webhook

| Metod | Ne yapar |
|---|---|
| `set(instance, { enabled, url, events?, byEvents?, base64?, headers? })` | Oturumun webhook ayarı; `events` `WEBHOOK_EVENTS` adlarından (`COMMENT_RECEIVED`, `LEAD_RECEIVED`…), boş liste = hepsi |
| `find(instance)` | Kayıtlı ayar |

## Webhook event tipleri

```typescript
import { parseWebhookEvent, isWebhookEvent, type AnyWebhookEvent } from 'wafixer-sdk'

function handle(payload: AnyWebhookEvent) {
  switch (payload.event) {
    case 'messages.upsert':
      console.log(payload.channel, payload.data.message?.conversation)
      break
    case 'connection.update':
      // Messenger/Instagram: reason 'token_invalid' | 'subscription_lost' | 'revoked'
      console.log(payload.data.state, payload.data.reason)
      break
    case 'comment.received':
      console.log(payload.data.comment.text, payload.data.post?.permalink)
      break
    case 'lead.received':
      console.log(payload.data.fullName, payload.data.email, payload.data.fields)
      break
  }
}

const event = parseWebhookEvent(req.body) // nesne, JSON metni ya da ham Buffer; tanınmazsa null
if (event) handle(event)
if (isWebhookEvent(req.body, 'lead.updated')) console.log(req.body.data.changes)
```

Yeni olaylar: `comment.received`, `comment.updated` (`data.change`: `edited`, `hidden`, `unhidden`), `comment.removed`
(`data.reason`: `deleted_by_owner`, `removed_on_meta`), `comment.reply.sent` (`data.comment.sentByApi`),
`comment.private_reply.sent` (`data.message`), `lead.received`, `lead.updated` (`data.changes`). Webhook ayarında adları
`COMMENT_EVENTS` ve `LEAD_EVENTS` sabitlerindedir. Teslim en az bir kezdir; yorumları `comment.id`, lead'leri
`id` ile tekilleştirin.

## Hata yönetimi

Sunucunun `{ error, code, details }` gövdesi tipli hataya çevrilir; `code` sunucudaki koddur
(`WINDOW_CLOSED`, `LEADS_ACCESS_DENIED`…), `details` ayrıntıdır.

| Sınıf | Ne zaman |
|---|---|
| `WafixerAuthError` | 401 |
| `WafixerPermissionError` | 403; `missingScopes` (eksik Meta izinleri) |
| `WafixerNotFoundError` | 404 (`NOT_FOUND`, `CHANNEL_NOT_CONNECTED`) |
| `WafixerValidationError` | 400 / 413 / 422 |
| `WafixerUnsupportedChannelError` | 400 `UNSUPPORTED_ON_CHANNEL`; `operation` |
| `WafixerWindowClosedError` | 422 `WINDOW_CLOSED`; `humanAgentAvailable`, `windowExpires`, `humanAgentExpires`; yoruma özel yanıtta `window: 'private_reply'` |
| `WafixerConflictError` | 409 (`IMPORT_IN_PROGRESS`, `CHANNEL_ALREADY_CONNECTED`…); `reason` (`details.reason`: `private_reply_already_sent`, `own_comment`…) |
| `WafixerChannelAuthError` | 409 `CHANNEL_TOKEN_INVALID`; oturum yeniden bağlanmalı |
| `WafixerRateLimitError` | 429 `RATE_LIMITED`; `retryAfter` (saniye) |
| `WafixerUnavailableError` | 503 (`CHANNEL_NOT_CONFIGURED`, `LEADS_UNAVAILABLE`, `APP_NOT_LIVE`) |
| `WafixerError` | diğerleri; ağ hatasında `status: null`, `code` ağ kodu |

```typescript
import { WafixerAuthError, WafixerNotFoundError, WafixerRateLimitError } from 'wafixer-sdk'

try {
  await wa.messages.sendText('Yok', { number: '...', text: '...' })
} catch (e) {
  if (e instanceof WafixerAuthError) console.log('apiKey hatalı')
  if (e instanceof WafixerNotFoundError) console.log('Instance bulunamadı')
  if (e instanceof WafixerRateLimitError) console.log('bekle', e.retryAfter)
}
```

## Sözleşme tipleri

Messenger/Instagram, yorum ve lead tipleri wafixer'ın kanal sözleşmesinden (`channels-v1` OpenAPI, sürüm
1.1.0) üretilir: kaynak `openapi/channels-v1.openapi.json`, çıktı `src/generated/channels-v1.ts`. Sözleşme
değişince:

```bash
# yol, wafixer.com deposundaki backend/openapi/channels-v1.openapi.json dosyasıdır
npm run generate:types -w wafixer-sdk -- --source <yol>
```

Testler üretilen dosyanın belgeyle uyuştuğunu denetler.

## Sürüm notları

[CHANGELOG.md](./CHANGELOG.md) ve [Releases](https://github.com/mirac46/wafixer-packages/releases).

## Lisans

MIT

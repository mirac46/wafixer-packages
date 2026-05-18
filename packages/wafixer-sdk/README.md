# wafixer-sdk

Resmi WAFixer TypeScript SDK'sı — WhatsApp **mesaj işlemleri** odaklı.

> Webhook'tan gelen mesaja yanıt ver, medya gönder, butonlu mesaj at, "yazıyor" göster, mesajı okundu işaretle. Hepsi tek satırda, tip-güvenli.

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
import { Wafixer, type MessagesUpsertEvent, getMessageText } from 'wafixer-sdk'

const wa = new Wafixer({ baseUrl: 'https://wafixer.com', apiKey: '...' })

// Express handler örneği
app.post('/wa-webhook', async (req, res) => {
  const event = req.body as MessagesUpsertEvent
  if (event.event !== 'messages.upsert') return res.json({ ok: true })

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

## API Yüzeyi (mesaj odaklı)

### Messages

| Metod | Ne yapar |
|---|---|
| `sendText(instance, input)` | Düz metin mesajı |
| `sendMedia(instance, input)` | Resim / video / döküman / audio |
| `sendAudio(instance, input)` | Sesli mesaj (PTT) |
| `sendPtv(instance, input)` | Push-to-video kısa video |
| `sendSticker(instance, input)` | Sticker |
| `sendButtons(instance, input)` | Buton mesajı (reply / url / call / copy / pix) |
| `sendList(instance, input)` | Listeli interaktif mesaj |
| `sendPoll(instance, input)` | Anket |
| `sendLocation(instance, input)` | Konum |
| `sendContact(instance, input)` | Kişi kartı |
| `sendReaction(instance, input)` | Bir mesaja emoji reaksiyon |
| `sendTemplate(instance, input)` | Meta Business template (Cloud API) |
| `deleteForEveryone(instance, input)` | Mesajı herkesten sil |
| `updateMessage(instance, input)` | Bir mesajın metnini düzenle |
| `replyTo(event, input)` | Webhook event'ine alıntılı yanıt |
| `replyWithMedia(event, input)` | Webhook event'ine medya ile yanıt |
| `reactTo(event, emoji)` | Webhook event'ine reaksiyon |

### Chat

| Metod | Ne yapar |
|---|---|
| `markAsRead(instance, input)` | Mesajları okundu işaretle (mavi tik) |
| `markEventAsRead(event)` | Webhook event'ini okundu işaretle |
| `sendPresence(instance, input)` | Yazıyor / kaydediyor / online göstergesi |
| `archiveChat(instance, input)` | Sohbet arşivle |
| `markChatUnread(instance, input)` | Sohbeti okunmamış işaretle |

### Instances

| Metod | Ne yapar |
|---|---|
| `list()` | API key'in erişebildiği oturumları listeler |
| `get({ instanceName, instanceId, number })` | Belirli oturumu getirir |
| `connectionState(instance)` | Canlı bağlantı durumunu döndürür |
| `connect(instance, number?)` | Kapalı QR oturumunda bağlantı/QR akışını başlatır |

## Webhook event tipleri

```typescript
import type {
  MessagesUpsertEvent,
  MessagesUpdateEvent,
  ConnectionUpdateEvent,
  PresenceUpdateEvent,
  ContactsUpsertEvent,
  CallEvent,
  AnyWebhookEvent,
} from 'wafixer-sdk'

function handle(payload: AnyWebhookEvent) {
  switch (payload.event) {
    case 'messages.upsert':
      console.log(payload.data.message?.conversation)
      break
    case 'connection.update':
      console.log(payload.data.state)
      break
    // ...
  }
}
```

## Hata yönetimi

```typescript
import { WafixerAuthError, WafixerNotFoundError } from 'wafixer-sdk'

try {
  await wa.messages.sendText('Yok', { number: '...', text: '...' })
} catch (e) {
  if (e instanceof WafixerAuthError) console.log('apiKey hatalı')
  if (e instanceof WafixerNotFoundError) console.log('Instance bulunamadı')
}
```

## Lisans

MIT

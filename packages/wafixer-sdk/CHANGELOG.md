# Değişiklik günlüğü — wafixer-sdk

Biçim: sürüm başına Yeni / Değişiklikler / Düzeltmeler. Etiketler `wafixer-sdk@x.y.z`; GitHub Releases notları
commit mesajlarından üretilir.

## 0.2.0

Sunucu: wafixer.com 2.3.12, kanal sözleşmesi `channels-v1` 1.1.0 (yorumlar 1.1.0).

### Yeni

- **Messenger ve Instagram:** `instances.metaMessagingSession({ channel, returnUrl })` (barındırılan bağlantı
  adresi); `instances.metaMessaging.status`, `resubscribe`, `disconnect` ve kendi Facebook Login akışı için
  `config`, `discover`, `connect`, `reconnect`; `instances.logout`, `instances.delete`.
- `WafixerInstance.channel` (`QR`, `META`, `WAFIXER`, `MESSENGER`, `INSTAGRAM`) ve `capabilities` (hızlı yanıt,
  pencere, medya türleri).
- `SendTextInput.quickReplies` (en çok 13) ve `humanAgent`; `replyTo` ikisini de geçirir.
- **Yorumlar:** `comment.status`, `find` (süzgeçler gövdede, imleçli), `detail`, `reply`, `replyToEvent`,
  `markRead`, `import`; moderasyon: `hide` (gizle/göster), `delete`, `privateReply` ve `privateReplyToEvent`
  (yorum sahibine özel yanıt, 7 gün içinde, yorum başına bir kez).
- **Facebook Lead Ads:** `leads.config`, `discover`, `connect`, `pages` / `pages.disconnect`, `forms` /
  `forms.sync` / `forms.import`, `items` / `items.get` / `items.update` / `items.delete` / `items.retry`.
  `items` süzgeçlerinde `status` dizi olabilir, `unread` boolean.
- **Webhook:** `webhook.set` / `webhook.find`; `WEBHOOK_EVENTS` (sunucunun kabul ettiği adlar), `COMMENT_EVENTS`,
  `LEAD_EVENTS`, `webhookEventConstant`, `isWebhookEventConstant`.
- **Olaylar:** `comment.received`, `comment.updated`, `comment.removed` (`reason`), `comment.reply.sent`,
  `comment.private_reply.sent`, `lead.received`, `lead.updated` tipleri; `COMMENT_PRIVATE_REPLY_SENT` sabiti;
  `connection.update` için `reason` (`token_invalid`, `subscription_lost`, `revoked`); zarfta `channel`; `MessageData.origin`, `appId`, `buttonsResponseMessage`.
- `parseWebhookEvent` (nesne, JSON metni ya da Buffer), `isWafixerWebhookEvent`, `isWebhookEvent`,
  `getChannelUserId`; `getMessageText` hızlı yanıt ve postback metnini de okur.
- **Tipli hatalar:** `{ error, code, details }` gövdesi `WafixerWindowClosedError` (`humanAgentAvailable`,
  `windowExpires`, `humanAgentExpires`, `window`), `WafixerUnsupportedChannelError` (`operation`),
  `WafixerPermissionError` (`missingScopes`), `WafixerConflictError` (`reason`), `WafixerChannelAuthError`,
  `WafixerRateLimitError` (`retryAfter`), `WafixerUnavailableError` sınıflarına eşlenir; `toWafixerError`
  dışa açık.
- Sözleşme tipleri `openapi/channels-v1.openapi.json`'dan üretilir (`npm run generate:types`); testler üretilen
  dosyanın belgeyle uyuştuğunu denetler.

### Değişiklikler

- `WafixerError.code` artık sunucunun `code` alanıdır (ör. `VALIDATION_ERROR`); sunucu kod göndermezse eskisi gibi
  `UNAUTHORIZED` / `NOT_FOUND` / `BAD_REQUEST` ya da ağ hatası kodu. Yeni alan `details`.
- `WafixerValidationError.status` gerçek HTTP durumunu taşır (422 için önceden 400 yazıyordu).
- 403, 409, 429 ve 503 yanıtları genel `WafixerError` yerine kendi sınıflarıyla gelir; hepsi `WafixerError`
  türevidir, mevcut `instanceof WafixerError` denetimleri değişmez.
- Eski uçların `response.message` dizisi `; ` ile birleştirilerek mesaj olur.
- `MessageData.pushName` `null` olabilir (Messenger/Instagram'da profil adı alınamadığında).

## 0.1.2

- `chat.updatePresence`: beklemeden presence gönderir; `subscribe: true` ile karşı tarafın presence akışına abone
  olur.
- `instances` kaynağı: `list`, `get`, `connectionState`, `connect`; `WafixerInstance` ve ilgili tipler dışa açıldı.
- `sendLocation` eksik `name` / `address`, `sendList` eksik `footerText` alanını boş metinle gönderir; API bu
  alanları zorunlu tuttuğu için önceki sürümde bu çağrılar 400 dönüyordu.
- `SendPresenceInput.delay` zorunlu (API zaten zorunlu tutuyordu).
- `axios` alt sınırı `^1.20.0` (güvenlik düzeltmeleri).

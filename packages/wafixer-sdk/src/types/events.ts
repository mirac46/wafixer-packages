/**
 * Webhook event payload tipleri.
 * Bu tipler kullanıcının webhook handler'ında (Express, Next.js, n8n)
 * gelen veriyi tip-güvenli işleyebilmesi için tasarlanmıştır.
 */

import type { MessageKey } from './common'
import type {
  ConnectionUpdateReason,
  LeadWebhookEnvelope,
  SessionReconnect,
  MetaCommentEventData,
  MetaCommentPrivateReplyEventData,
  MetaCommentReplyEventData,
  WafixerChannel,
} from './contracts'

export type WebhookEventName =
  | 'messages.upsert'
  | 'messages.update'
  | 'messages.edited'
  | 'messages.delete'
  | 'send.message'
  | 'send.message.update'
  | 'connection.update'
  | 'qrcode.updated'
  | 'status.instance'
  | 'logout.instance'
  | 'remove.instance'
  | 'labels.edit'
  | 'labels.association'
  | 'presence.update'
  | 'contacts.upsert'
  | 'contacts.update'
  | 'chats.upsert'
  | 'chats.update'
  | 'chats.delete'
  | 'groups.upsert'
  | 'groups.update'
  | 'group-participants.update'
  | 'call'
  | 'typebot.start'
  | 'typebot.change-status'
  | 'comment.received'
  | 'comment.updated'
  | 'comment.removed'
  | 'comment.reply.sent'
  | 'comment.private_reply.sent'
  | 'lead.received'
  | 'lead.updated'

export interface WebhookEnvelope<TEvent extends WebhookEventName, TData> {
  event: TEvent
  instance: string
  data: TData
  /** Oturumun kanalı (`QR`, `META`, `WAFIXER`, `MESSENGER`, `INSTAGRAM`); eski sunucularda yok. */
  channel?: WafixerChannel | null
  destination: string
  date_time: string
  sender: string
  server_url: string
  apikey: string | null
}

// ────────────────── MESSAGE EVENTS ──────────────────

export interface MessageData {
  /** Messenger'da `{PSID}@messenger`, Instagram'da `{IGSID}@instagram`. */
  key: MessageKey
  /** Messenger/Instagram'da profil adı alınamazsa `null`. */
  pushName?: string | null
  status?: string
  message?: {
    conversation?: string
    extendedTextMessage?: { text: string }
    imageMessage?: { url: string; caption?: string; mimetype?: string }
    videoMessage?: { url: string; caption?: string; mimetype?: string }
    audioMessage?: { url: string; ptt?: boolean; mimetype?: string }
    documentMessage?: { url: string; fileName?: string; mimetype?: string }
    stickerMessage?: { url: string; mimetype?: string }
    locationMessage?: { degreesLatitude: number; degreesLongitude: number }
    contactMessage?: { displayName: string; vcard: string }
    reactionMessage?: { key: MessageKey; text: string }
    /** Düğme yanıtı; Messenger/Instagram hızlı yanıt ve postback'leri de bu biçimde gelir. */
    buttonsResponseMessage?: { selectedButtonId: string; selectedDisplayText?: string }
    [key: string]: unknown
  }
  messageType?: string
  messageTimestamp: number
  instanceId: string
  source?: string
  contextInfo?: Record<string, unknown>
  /** Sayfa gelen kutusundan ya da başka bir uygulamadan gönderilen mesaj (`fromMe: true`). */
  origin?: 'external'
  /** `origin: 'external'` ise gönderen Meta uygulamasının kimliği. */
  appId?: string
}

export type MessagesUpsertEvent = WebhookEnvelope<'messages.upsert', MessageData>
export type MessagesUpdateEvent = WebhookEnvelope<'messages.update', MessageData>
export type MessagesDeleteEvent = WebhookEnvelope<
  'messages.delete',
  { id: string; remoteJid: string; fromMe: boolean }
>
export type SendMessageEvent = WebhookEnvelope<'send.message', MessageData>
/** Karşı taraf bir mesajı düzenledi (WhatsApp). */
export type MessagesEditedEvent = WebhookEnvelope<'messages.edited', MessageData>
/** Gönderdiğiniz bir mesaj `chat.updateMessage` ile düzenlendi. */
export type SendMessageUpdateEvent = WebhookEnvelope<'send.message.update', MessageData>

// ────────────────── CONNECTION EVENTS ──────────────────

export interface ConnectionData {
  instance: string
  state: 'open' | 'close' | 'connecting'
  statusReason?: number
  /** Messenger/Instagram: `token_invalid`, `subscription_lost`, `revoked`. */
  reason?: ConnectionUpdateReason
  /** QR oturumu: otomatik yeniden bağlanma durumu; deneme yoksa `null`. */
  reconnect?: SessionReconnect | null
}

export type ConnectionUpdateEvent = WebhookEnvelope<'connection.update', ConnectionData>

/**
 * QR oturumunda yeni QR kodu (`qrcode`) ya da QR deneme sınırı doldu bildirimi
 * (`message` + `statusCode`); ikincisinde oturum `connect` ile yeniden başlatılır.
 */
export type QrCodeData =
  | { qrcode: { instance: string; pairingCode?: string | null; code: string; base64: string } }
  | { message: string; statusCode: number }

export type QrCodeUpdatedEvent = WebhookEnvelope<'qrcode.updated', QrCodeData>

export interface InstanceStatusData {
  instance: string
  status: string
  disconnectionAt?: string
  disconnectionReasonCode?: number
  /** Bağlantı kopma nesnesinin JSON metni. */
  disconnectionObject?: string
}

export type InstanceStatusEvent = WebhookEnvelope<'status.instance', InstanceStatusData>
/** Oturum kapatıldı (`instance/logout` ya da WhatsApp'tan çıkış). */
export type LogoutInstanceEvent = WebhookEnvelope<'logout.instance', null>
/** Oturum silindi. */
export type RemoveInstanceEvent = WebhookEnvelope<'remove.instance', null>

// ────────────────── LABELS (WhatsApp Business) ──────────────────

export interface LabelData {
  instance: string
  id: string
  name: string
  color: number
  deleted?: boolean
  predefinedId?: string
}

export type LabelsEditEvent = WebhookEnvelope<'labels.edit', LabelData>
export type LabelsAssociationEvent = WebhookEnvelope<
  'labels.association',
  { instance: string; type: 'add' | 'remove'; chatId: string; labelId: string }
>

// ────────────────── PRESENCE / TYPING ──────────────────

export interface PresenceData {
  id: string
  presences: Record<string, { lastKnownPresence: string; lastSeen?: number }>
}

export type PresenceUpdateEvent = WebhookEnvelope<'presence.update', PresenceData>

// ────────────────── CONTACTS ──────────────────

export interface ContactData {
  remoteJid: string
  pushName?: string
  profilePicUrl?: string
  instanceId: string
}

export type ContactsUpsertEvent = WebhookEnvelope<'contacts.upsert', ContactData[]>
export type ContactsUpdateEvent = WebhookEnvelope<'contacts.update', ContactData | ContactData[]>

// ────────────────── CHATS ──────────────────

export interface ChatData {
  remoteJid: string
  unreadCount?: number
  archived?: boolean
  pinned?: boolean
  instanceId: string
}

export type ChatsUpsertEvent = WebhookEnvelope<'chats.upsert', ChatData[]>
export type ChatsUpdateEvent = WebhookEnvelope<'chats.update', ChatData | ChatData[]>
export type ChatsDeleteEvent = WebhookEnvelope<'chats.delete', { remoteJid: string }>

// ────────────────── CALL ──────────────────

export interface CallData {
  id: string
  from: string
  status: 'offer' | 'accept' | 'reject' | 'timeout'
  isVideo: boolean
  date: string
}

export type CallEvent = WebhookEnvelope<'call', CallData[]>

// ────────────────── COMMENTS (Facebook / Instagram) ──────────────────

/** Kullanıcının yeni yorumu ya da yanıtı. Sayfanın/hesabın kendi yorumu bu olayla gelmez. */
export type CommentReceivedEvent = WebhookEnvelope<'comment.received', MetaCommentEventData>
/** Düzenlendi, gizlendi ya da gösterildi (`data.change`); gizleme/gösterme API'den de gelir. */
export type CommentUpdatedEvent = WebhookEnvelope<'comment.updated', MetaCommentEventData>
/** Silindi; `data.reason`: `deleted_by_owner` (API ile silindi) ya da `removed_on_meta`. */
export type CommentRemovedEvent = WebhookEnvelope<'comment.removed', MetaCommentEventData>
/** Sayfanın/hesabın yanıtı; `data.comment.sentByApi` API'den mi Meta arayüzünden mi gönderildiğini söyler. */
export type CommentReplySentEvent = WebhookEnvelope<'comment.reply.sent', MetaCommentReplyEventData>
/**
 * Yorum sahibine özel (DM) yanıt gönderildi. Aynı mesaj `send.message` olarak da gelir;
 * tekilleştirme `data.message.id` ile yapılır.
 */
export type CommentPrivateReplySentEvent = WebhookEnvelope<'comment.private_reply.sent', MetaCommentPrivateReplyEventData>

export type CommentWebhookEvent =
  | CommentReceivedEvent
  | CommentUpdatedEvent
  | CommentRemovedEvent
  | CommentReplySentEvent
  | CommentPrivateReplySentEvent

// ────────────────── LEADS (Facebook Lead Ads) ──────────────────

type LeadEnvelope<TEvent extends LeadWebhookEnvelope['event']> = Omit<LeadWebhookEnvelope, 'event'> & {
  event: TEvent
}

/** Lead Meta'dan tam çekildi (webhook ya da içe aktarma; `data.source`). Zarfta oturum anahtarı yok. */
export type LeadReceivedEvent = LeadEnvelope<'lead.received'>
/** Durum, not ya da okundu bilgisi değişti (`data.changes`). */
export type LeadUpdatedEvent = LeadEnvelope<'lead.updated'>

export type LeadWebhookEvent = LeadReceivedEvent | LeadUpdatedEvent

// ────────────────── DISCRIMINATED UNION ──────────────────

export type AnyWebhookEvent =
  | MessagesUpsertEvent
  | MessagesUpdateEvent
  | MessagesDeleteEvent
  | SendMessageEvent
  | MessagesEditedEvent
  | SendMessageUpdateEvent
  | ConnectionUpdateEvent
  | QrCodeUpdatedEvent
  | InstanceStatusEvent
  | LogoutInstanceEvent
  | RemoveInstanceEvent
  | LabelsEditEvent
  | LabelsAssociationEvent
  | PresenceUpdateEvent
  | ContactsUpsertEvent
  | ContactsUpdateEvent
  | ChatsUpsertEvent
  | ChatsUpdateEvent
  | ChatsDeleteEvent
  | CallEvent
  | CommentWebhookEvent
  | LeadWebhookEvent

/**
 * Mesaj içerik metnini herhangi bir mesaj tipinden çıkarır.
 * conversation, extendedTextMessage, düğme/hızlı yanıt, image/video/document caption'larını dener.
 */
export function getMessageText(data: MessageData): string | null {
  const m = data.message
  if (!m) return null
  if (m.conversation) return m.conversation
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text
  if (m.buttonsResponseMessage?.selectedDisplayText) return m.buttonsResponseMessage.selectedDisplayText
  if (m.imageMessage?.caption) return m.imageMessage.caption
  if (m.videoMessage?.caption) return m.videoMessage.caption
  if (m.documentMessage?.fileName) return m.documentMessage.fileName
  return null
}

/**
 * Gönderimde `number` olarak kullanılacak kimlik: WhatsApp'ta telefon, Messenger'da PSID,
 * Instagram'da IGSID (`remoteJid`'in `@` öncesi).
 */
export function getChannelUserId(event: { data: { key: Pick<MessageKey, 'remoteJid'> } }): string {
  return event.data.key.remoteJid.split('@')[0]
}

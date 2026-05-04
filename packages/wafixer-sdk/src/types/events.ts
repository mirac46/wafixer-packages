/**
 * Webhook event payload tipleri.
 * Bu tipler kullanıcının webhook handler'ında (Express, Next.js, n8n)
 * gelen veriyi tip-güvenli işleyebilmesi için tasarlanmıştır.
 */

import type { MessageKey } from './common'

export type WebhookEventName =
  | 'messages.upsert'
  | 'messages.update'
  | 'messages.delete'
  | 'send.message'
  | 'connection.update'
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

export interface WebhookEnvelope<TEvent extends WebhookEventName, TData> {
  event: TEvent
  instance: string
  data: TData
  destination: string
  date_time: string
  sender: string
  server_url: string
  apikey: string | null
}

// ────────────────── MESSAGE EVENTS ──────────────────

export interface MessageData {
  key: MessageKey
  pushName?: string
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
    [key: string]: unknown
  }
  messageType?: string
  messageTimestamp: number
  instanceId: string
  source?: string
  contextInfo?: Record<string, unknown>
}

export type MessagesUpsertEvent = WebhookEnvelope<'messages.upsert', MessageData>
export type MessagesUpdateEvent = WebhookEnvelope<'messages.update', MessageData>
export type MessagesDeleteEvent = WebhookEnvelope<
  'messages.delete',
  { id: string; remoteJid: string; fromMe: boolean }
>
export type SendMessageEvent = WebhookEnvelope<'send.message', MessageData>

// ────────────────── CONNECTION EVENTS ──────────────────

export interface ConnectionData {
  instance: string
  state: 'open' | 'close' | 'connecting'
  statusReason?: number
}

export type ConnectionUpdateEvent = WebhookEnvelope<'connection.update', ConnectionData>

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

// ────────────────── DISCRIMINATED UNION ──────────────────

export type AnyWebhookEvent =
  | MessagesUpsertEvent
  | MessagesUpdateEvent
  | MessagesDeleteEvent
  | SendMessageEvent
  | ConnectionUpdateEvent
  | PresenceUpdateEvent
  | ContactsUpsertEvent
  | ContactsUpdateEvent
  | ChatsUpsertEvent
  | ChatsUpdateEvent
  | ChatsDeleteEvent
  | CallEvent

/**
 * Mesaj içerik metnini herhangi bir mesaj tipinden çıkarır.
 * conversation, extendedTextMessage, image/video/document caption'larını dener.
 */
export function getMessageText(data: MessageData): string | null {
  const m = data.message
  if (!m) return null
  if (m.conversation) return m.conversation
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text
  if (m.imageMessage?.caption) return m.imageMessage.caption
  if (m.videoMessage?.caption) return m.videoMessage.caption
  if (m.documentMessage?.fileName) return m.documentMessage.fileName
  return null
}

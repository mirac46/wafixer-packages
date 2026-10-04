import type {
  BaseSendInput,
  MediaType,
  MessageKey,
  Presence,
} from './common'
import type { QuickReply } from './contracts'

// ────────────────── SEND TEXT ──────────────────
export interface SendTextInput extends BaseSendInput {
  text: string
  /** Messenger/Instagram: en çok 13 hızlı yanıt, `title` en çok 20 karakter. */
  quickReplies?: QuickReply[]
  /**
   * Messenger/Instagram: yanıtı bir insan temsilci elle yazdı. 24 saat penceresi kapalıysa son
   * gelen mesajdan 7 gün içinde `HUMAN_AGENT` etiketiyle gider. Otomasyon ve AI Agent göndermez.
   */
  humanAgent?: boolean
}

// ────────────────── SEND MEDIA ──────────────────
export interface SendMediaInput extends BaseSendInput {
  mediatype: MediaType
  /** URL or base64 string. */
  media: string
  caption?: string
  fileName?: string
  mimetype?: string
}

// ────────────────── SEND AUDIO (PTT) ──────────────────
export interface SendAudioInput extends BaseSendInput {
  /** URL or base64 audio. */
  audio: string
}

// ────────────────── SEND PTV (push-to-video) ──────────────────
export interface SendPtvInput extends BaseSendInput {
  /** URL or base64 video. */
  video: string
}

// ────────────────── SEND STICKER ──────────────────
export interface SendStickerInput extends BaseSendInput {
  /** URL or base64. */
  sticker: string
  notConvertSticker?: boolean
}

// ────────────────── SEND LOCATION ──────────────────
export interface SendLocationInput extends BaseSendInput {
  latitude: number
  longitude: number
  /** Verilmezse boş metin gönderilir; API alanı zorunlu tutar. */
  name?: string
  /** Verilmezse boş metin gönderilir; API alanı zorunlu tutar. */
  address?: string
}

// ────────────────── SEND CONTACT ──────────────────
export interface ContactCard {
  fullName: string
  wuid: string
  phoneNumber: string
  organization?: string
  email?: string
  url?: string
}

export interface SendContactInput extends BaseSendInput {
  contact: ContactCard[]
}

// ────────────────── SEND REACTION ──────────────────
export interface SendReactionInput {
  /** Mesaj key'i (event payload'undan gelir). */
  key: MessageKey
  /** Emoji. Boş string '' reaksiyonu kaldırır. */
  reaction: string
}

// ────────────────── SEND POLL ──────────────────
export interface SendPollInput extends BaseSendInput {
  name: string
  selectableCount: number
  values: string[]
}

// ────────────────── BUTTONS ──────────────────
export type ButtonType = 'reply' | 'copy' | 'url' | 'call' | 'pix'
export type KeyType = 'phone' | 'email' | 'cpf' | 'cnpj' | 'random'

export interface Button {
  type: ButtonType
  displayText?: string
  id?: string
  url?: string
  copyCode?: string
  phoneNumber?: string
  /** PIX (Brezilya) ödeme butonu için. */
  currency?: string
  name?: string
  keyType?: KeyType
  key?: string
}

export interface SendButtonsInput extends BaseSendInput {
  title: string
  description?: string
  footer?: string
  buttons: Button[]
  thumbnailUrl?: string
}

// ────────────────── LIST ──────────────────
export interface ListRow {
  title: string
  description: string
  rowId: string
}

export interface ListSection {
  title: string
  rows: ListRow[]
}

export interface SendListInput extends BaseSendInput {
  title: string
  description?: string
  /** Verilmezse boş metin gönderilir; API alanı zorunlu tutar. */
  footerText?: string
  buttonText: string
  sections: ListSection[]
}

// ────────────────── TEMPLATE (Meta Business) ──────────────────
export interface SendTemplateInput extends BaseSendInput {
  name: string
  language: string
  components: unknown
}

// ────────────────── PRESENCE ──────────────────
export interface SendPresenceInput {
  number: string
  presence: Presence
  /**
   * Göstergenin açık kalacağı süre (ms); süre dolunca 'paused' gönderilir. API alanı zorunlu
   * tutar. Beklemeden gösterge açıp kapatmak için `chat.updatePresence` kullanın.
   */
  delay: number
}

export interface UpdatePresenceInput {
  number: string
  /** Boş bırakılırsa karşı tarafa bildirim gitmez; sadece `subscribe` işletilir. */
  presence?: Presence
  /** Karşı tarafın presence akışına abone ol (PRESENCE_UPDATE eventi için gerekli). */
  subscribe?: boolean
}

// ────────────────── MARK AS READ ──────────────────
export interface MarkMessagesAsReadInput {
  readMessages: MessageKey[]
}

// ────────────────── DELETE FOR EVERYONE ──────────────────
export interface DeleteForEveryoneInput {
  id: string
  remoteJid: string
  fromMe: boolean
  participant?: string
}

// ────────────────── UPDATE MESSAGE ──────────────────
export interface UpdateMessageInput {
  number: string
  key: MessageKey
  text: string
}

// ────────────────── ARCHIVE / UNREAD ──────────────────
export interface ArchiveChatInput {
  chat: string
  lastMessage: { key: MessageKey }
  archive: boolean
}

export interface MarkChatUnreadInput {
  chat: string
  lastMessage: { key: MessageKey }
}

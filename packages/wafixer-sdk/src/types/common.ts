/**
 * SDK genelinde kullanılan ortak tipler.
 */

export type MediaType = 'image' | 'document' | 'video' | 'audio' | 'ptv'

export type Presence =
  | 'unavailable'
  | 'available'
  | 'composing'
  | 'recording'
  | 'paused'

export interface MessageKey {
  remoteJid: string
  fromMe: boolean
  id: string
  participant?: string
}

export interface QuotedMessage {
  key: MessageKey
  message: Record<string, unknown>
}

/**
 * Tüm mesaj gönderim metodlarında kullanılan opsiyonlar.
 */
export interface SendOptions {
  /** Mesajdan önce milisaniye gecikme. */
  delay?: number
  /** Yanıt verilen mesajın referansı. */
  quoted?: QuotedMessage
  /** Link önizleme oluşturulsun mu (URL içeren mesajlar için). */
  linkPreview?: boolean
  /** Tüm grup üyelerini @ olarak etiketle. */
  mentionsEveryOne?: boolean
  /** Belirli numaraları etiketle. */
  mentioned?: string[]
  /** Audio/video kodlama opsiyonu. */
  encoding?: boolean
}

export interface BaseSendInput extends SendOptions {
  /** Hedef telefon numarası — uluslararası kod ile (905...). */
  number: string
}

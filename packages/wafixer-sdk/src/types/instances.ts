import type { ChannelCapabilities, SessionReconnect, WafixerChannel } from './contracts'

export type WafixerInstanceStatus = 'open' | 'connecting' | 'close' | string

export interface WafixerInstanceCounts {
  Message: number
  Contact: number
  Chat: number
}

export interface WafixerInstance {
  id: string
  name: string
  connectionStatus: WafixerInstanceStatus
  ownerJid: string | null
  ownerEmail?: string | null
  profilePicUrl?: string | null
  /** `WHATSAPP-BAILEYS`, `WHATSAPP-BUSINESS`, `WAFIXER`, `MESSENGER`, `INSTAGRAM`. */
  integration: string | null
  /** WhatsApp'ta telefon; Messenger'da Sayfa, Instagram'da hesap kimliği. */
  number: string | null
  clientName?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  profileName?: string | null
  profileStatus?: string | null
  businessId?: string | null
  disconnectionAt?: string | null
  disconnectionReasonCode?: number | null
  /** Kanal kodu; tanınmayan entegrasyonda `null`, eski sunucularda alan yok. */
  channel?: WafixerChannel | null
  /** Kanalın yetenekleri (hızlı yanıt, pencere, medya türleri); istemci sabit yazmaz. */
  capabilities?: ChannelCapabilities | null
  _count?: WafixerInstanceCounts
}

export interface WafixerConnectionStateResponse {
  instance: {
    instanceName: string
    state?: WafixerInstanceStatus
    /** `live`: çalışan oturumdan, `database`: sunucuda yüklü değil, son kayıtlı durum. */
    source?: 'live' | 'database'
    disconnectionReasonCode?: number | null
    disconnectionAt?: string | null
    /** QR oturumunun otomatik yeniden bağlanma durumu; deneme yoksa `null`. */
    reconnect?: SessionReconnect | null
  }
}

export interface WafixerQrCode {
  pairingCode?: string
  code?: string
  base64?: string
  count?: number
}

export type WafixerConnectInstanceResponse =
  | WafixerConnectionStateResponse
  | WafixerQrCode
  | {
      error?: boolean
      message?: string
      instance?: {
        instanceName: string
        status?: WafixerInstanceStatus
      }
      qrcode?: WafixerQrCode
    }

/** `instance/logout` ve `instance/delete` yanıtı. */
export interface WafixerActionResponse {
  status: string
  error: boolean
  response: { message: string }
}

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
  integration: string | null
  number: string | null
  clientName?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  profileName?: string | null
  profileStatus?: string | null
  businessId?: string | null
  disconnectionAt?: string | null
  disconnectionReasonCode?: number | null
  _count?: WafixerInstanceCounts
}

export interface WafixerConnectionStateResponse {
  instance: {
    instanceName: string
    state?: WafixerInstanceStatus
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

import type { Wafixer } from '../client'
import type { WebhookEventConstant } from '../webhook-events'

export interface WebhookSetInput {
  enabled: boolean
  url: string
  /** Boş ya da verilmezse sunucu bütün olayları gönderir. */
  events?: WebhookEventConstant[]
  /** true ise olay adı adrese eklenir (`{url}/messages-upsert`). */
  byEvents?: boolean
  /** Medyayı base64 olarak gövdeye gömer. */
  base64?: boolean
  /** Her teslimde gönderilecek başlıklar (ör. paylaşılan sır). */
  headers?: Record<string, string>
}

/** `webhook/find` yanıtı; ayar yoksa `null`. */
export interface WebhookSettings {
  id?: string
  url: string
  enabled: boolean
  events: string[]
  headers?: Record<string, string> | null
  webhookByEvents?: boolean
  webhookBase64?: boolean
  createdAt?: string
  updatedAt?: string
  instanceId?: string
  /** İmza sırrı tanımlıysa teslimatlar `X-Wafixer-Signature` taşır; sırrın değeri hiç dönmez. */
  hasSigningSecret?: boolean
}

/** `webhook/signingSecret` yanıtı. `secret` yalnız üretildiği yanıtta bir kez gelir. */
export interface WebhookSigningSecret {
  hasSigningSecret: boolean
  secret?: string
}

export class Webhook {
  constructor(private readonly client: Wafixer) {}

  /**
   * Oturumun webhook ayarını yazar. Sunucu `enabled: true` iken boş olay listesini
   * "hepsi" sayar; liste her zaman gönderilir (alan eksikse sunucu isteği işleyemez).
   */
  public async set(instance: string, input: WebhookSetInput): Promise<WebhookSettings> {
    return this.client.request<WebhookSettings>({
      method: 'POST',
      url: `/webhook/set/${encodeURIComponent(instance)}`,
      data: {
        webhook: {
          enabled: input.enabled,
          url: input.url,
          events: input.events ?? [],
          byEvents: input.byEvents ?? false,
          base64: input.base64 ?? false,
          ...(input.headers ? { headers: input.headers } : {}),
        },
      },
    })
  }

  /**
   * İmza sırrını üretir ya da yeniler; eski sır hemen geçersizleşir. Dönen `secret` bir daha
   * okunamaz, alıcı tarafa (ör. n8n kimlik bilgisi) hemen kaydedin.
   */
  public async rotateSigningSecret(instance: string): Promise<Required<WebhookSigningSecret>> {
    return this.client.request<Required<WebhookSigningSecret>>({
      method: 'POST',
      url: `/webhook/signingSecret/${encodeURIComponent(instance)}`,
    })
  }

  /** İmza sırrını kaldırır; teslimatlar yeniden imzasız gider. */
  public async clearSigningSecret(instance: string): Promise<WebhookSigningSecret> {
    return this.client.request<WebhookSigningSecret>({
      method: 'DELETE',
      url: `/webhook/signingSecret/${encodeURIComponent(instance)}`,
    })
  }

  public async find(instance: string): Promise<WebhookSettings | null> {
    return this.client.request<WebhookSettings | null>({
      method: 'GET',
      url: `/webhook/find/${encodeURIComponent(instance)}`,
    })
  }
}

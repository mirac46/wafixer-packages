import axios, { AxiosInstance, AxiosRequestConfig, isAxiosError } from 'axios'
import { toWafixerError } from './errors'
import { Messages } from './resources/messages'
import { Chat } from './resources/chat'
import { Instances } from './resources/instances'
import { Comments } from './resources/comments'
import { Leads } from './resources/leads'
import { Webhook } from './resources/webhook'

export interface WafixerClientConfig {
  /** WAFixer API'nin base URL'i — örn. https://wafixer.com */
  baseUrl: string
  /** Panel API key (apikey header). */
  apiKey: string
  /** İstek timeout, milisaniye. Varsayılan 30000. */
  timeoutMs?: number
  /** Ek header'lar (opsiyonel). */
  defaultHeaders?: Record<string, string>
  /** Axios instance dışarıdan enjekte etmek istersen. */
  http?: AxiosInstance
}

export class Wafixer {
  public readonly http: AxiosInstance
  public readonly messages: Messages
  public readonly chat: Chat
  public readonly instances: Instances
  /** Facebook Sayfa ve Instagram yorumları (Messenger/Instagram oturumlarında). */
  public readonly comment: Comments
  /** Facebook Lead Ads: Sayfa bağlantısı, formlar ve lead'ler. */
  public readonly leads: Leads
  /** Oturumun webhook ayarı (`webhook/set`, `webhook/find`). */
  public readonly webhook: Webhook

  constructor(config: WafixerClientConfig) {
    if (!config.baseUrl) throw new Error('Wafixer: baseUrl gerekli.')
    if (!config.apiKey) throw new Error('Wafixer: apiKey gerekli.')

    this.http =
      config.http ??
      axios.create({
        baseURL: config.baseUrl.replace(/\/+$/, ''),
        timeout: config.timeoutMs ?? 30_000,
        headers: {
          'Content-Type': 'application/json',
          apikey: config.apiKey,
          ...(config.defaultHeaders ?? {}),
        },
      })

    this.messages = new Messages(this)
    this.chat = new Chat(this)
    this.instances = new Instances(this)
    this.comment = new Comments(this)
    this.leads = new Leads(this)
    this.webhook = new Webhook(this)
  }

  /**
   * İçeride kullanılan ham HTTP çağrısı. Hatalar `WafixerError` türevlerine dönüştürülür;
   * `{ error, code, details }` gövdesindeki `code` hata sınıfını seçer (`errors.ts`).
   */
  public async request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.http.request<T>(config)
      return res.data
    } catch (err) {
      if (isAxiosError(err)) {
        throw toWafixerError({
          status: err.response?.status ?? null,
          body: err.response?.data,
          headers: err.response?.headers,
          transportCode: err.code ?? null,
          fallbackMessage: err.message || undefined,
        })
      }
      throw err
    }
  }
}

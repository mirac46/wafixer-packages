import axios, { AxiosInstance, AxiosRequestConfig, isAxiosError } from 'axios'
import {
  WafixerAuthError,
  WafixerError,
  WafixerNotFoundError,
  WafixerValidationError,
} from './errors'
import { Messages } from './resources/messages'
import { Chat } from './resources/chat'

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
  }

  /**
   * İçeride kullanılan ham HTTP çağrısı. Hatalar `WafixerError` türevlerine
   * dönüştürülür.
   */
  public async request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.http.request<T>(config)
      return res.data
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status ?? null
        const data = err.response?.data
        const message =
          (data as { response?: { message?: string }; message?: string })?.response?.message ||
          (data as { message?: string })?.message ||
          err.message ||
          'WAFixer API isteği başarısız.'

        if (status === 401) throw new WafixerAuthError(message)
        if (status === 404) throw new WafixerNotFoundError(message)
        if (status === 400 || status === 422)
          throw new WafixerValidationError(message, data)

        throw new WafixerError(message, {
          status,
          code: err.code ?? null,
          response: data,
        })
      }
      throw err
    }
  }
}

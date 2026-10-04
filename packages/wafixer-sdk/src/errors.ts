import type { ChannelErrorCode, LeadErrorCode } from './types/contracts'

/**
 * Sunucunun `{ error, code, details? }` gövdesindeki kod. Eski WhatsApp uçları bu gövdeyi
 * döndürmez; o durumda `code` sınıfın varsayılanı (`UNAUTHORIZED`, `NOT_FOUND`, `BAD_REQUEST`)
 * ya da ağ hatasının kodudur (`ECONNREFUSED`).
 */
export type WafixerErrorCode = ChannelErrorCode | LeadErrorCode

export interface WafixerErrorOptions {
  status?: number | null
  code?: string | null
  details?: Record<string, unknown> | null
  response?: unknown
}

/**
 * SDK içinde HTTP hatalarını anlamlı bir TS class'ına sarmalar.
 */
export class WafixerError extends Error {
  public readonly status: number | null
  public readonly code: WafixerErrorCode | (string & {}) | null
  public readonly details: Record<string, unknown> | null
  public readonly response: unknown

  constructor(message: string, options: WafixerErrorOptions = {}) {
    super(message)
    this.name = 'WafixerError'
    this.status = options.status ?? null
    this.code = options.code ?? null
    this.details = options.details ?? null
    this.response = options.response
  }
}

export class WafixerAuthError extends WafixerError {
  constructor(message = 'Yetkisiz erişim — apiKey hatalı veya eksik.', options: WafixerErrorOptions = {}) {
    super(message, { ...options, status: 401, code: options.code ?? 'UNAUTHORIZED' })
    this.name = 'WafixerAuthError'
  }
}

/** 403: anahtar bu oturuma yetkili değil ya da bağlantı gereken Meta izinlerini taşımıyor. */
export class WafixerPermissionError extends WafixerError {
  /** `CHANNEL_PERMISSION_DENIED` yanıtındaki eksik Meta izinleri. */
  public readonly missingScopes: string[]

  constructor(message: string, options: WafixerErrorOptions = {}) {
    super(message, { ...options, status: 403, code: options.code ?? 'FORBIDDEN' })
    this.name = 'WafixerPermissionError'
    this.missingScopes = stringList(this.details?.missingScopes)
  }
}

export class WafixerNotFoundError extends WafixerError {
  constructor(message = 'Kaynak bulunamadı.', options: WafixerErrorOptions = {}) {
    super(message, { ...options, status: 404, code: options.code ?? 'NOT_FOUND' })
    this.name = 'WafixerNotFoundError'
  }
}

export class WafixerValidationError extends WafixerError {
  constructor(message: string, response?: unknown, options: WafixerErrorOptions = {}) {
    super(message, { ...options, status: options.status ?? 400, code: options.code ?? 'BAD_REQUEST', response })
    this.name = 'WafixerValidationError'
  }
}

/** 400 `UNSUPPORTED_ON_CHANNEL`: işlem oturumun kanalında yok (ör. Messenger'a liste mesajı). */
export class WafixerUnsupportedChannelError extends WafixerValidationError {
  /** Sunucunun reddettiği işlem (`details.operation`). */
  public readonly operation: string | null

  constructor(message: string, response?: unknown, options: WafixerErrorOptions = {}) {
    super(message, response, { ...options, code: 'UNSUPPORTED_ON_CHANNEL' })
    this.name = 'WafixerUnsupportedChannelError'
    this.operation = stringOrNull(this.details?.operation)
  }
}

/**
 * 422 `WINDOW_CLOSED`: Messenger/Instagram 24 saatlik penceresi kapalı. `humanAgentAvailable`
 * true ise insan temsilci `humanAgent: true` ile `humanAgentExpires` anına kadar yanıt verebilir.
 */
export class WafixerWindowClosedError extends WafixerValidationError {
  public readonly humanAgentAvailable: boolean
  public readonly windowExpires: string | null
  public readonly humanAgentExpires: string | null

  constructor(message: string, response?: unknown, options: WafixerErrorOptions = {}) {
    super(message, response, { ...options, status: options.status ?? 422, code: 'WINDOW_CLOSED' })
    this.name = 'WafixerWindowClosedError'
    this.humanAgentAvailable = this.details?.humanAgentAvailable === true
    this.windowExpires = stringOrNull(this.details?.windowExpires)
    this.humanAgentExpires = stringOrNull(this.details?.humanAgentExpires)
  }
}

/** 409: çakışma (bağlı Sayfa, süren içe aktarma, başka uygulamanın yönettiği konuşma…). */
export class WafixerConflictError extends WafixerError {
  constructor(message: string, options: WafixerErrorOptions = {}) {
    super(message, { ...options, status: options.status ?? 409, code: options.code ?? 'CONFLICT' })
    this.name = 'WafixerConflictError'
  }
}

/** 409 `CHANNEL_TOKEN_INVALID`: Meta bağlantısı geçersiz; oturum yeniden bağlanmalı. */
export class WafixerChannelAuthError extends WafixerConflictError {
  constructor(message: string, options: WafixerErrorOptions = {}) {
    super(message, { ...options, code: 'CHANNEL_TOKEN_INVALID' })
    this.name = 'WafixerChannelAuthError'
  }
}

/** 429 `RATE_LIMITED`: `retryAfter` saniye sonra yeniden denenebilir. */
export class WafixerRateLimitError extends WafixerError {
  public readonly retryAfter: number | null

  constructor(message: string, retryAfter: number | null = null, options: WafixerErrorOptions = {}) {
    super(message, { ...options, status: options.status ?? 429, code: options.code ?? 'RATE_LIMITED' })
    this.name = 'WafixerRateLimitError'
    this.retryAfter = retryAfter
  }
}

/** 503: özellik bu sunucuda henüz etkin değil (`CHANNEL_NOT_CONFIGURED`, `LEADS_UNAVAILABLE`, `APP_NOT_LIVE`). */
export class WafixerUnavailableError extends WafixerError {
  constructor(message: string, options: WafixerErrorOptions = {}) {
    super(message, { ...options, status: 503, code: options.code ?? 'SERVICE_UNAVAILABLE' })
    this.name = 'WafixerUnavailableError'
  }
}

// ────────────────── HTTP yanıtı → tipli hata ──────────────────

export interface ApiErrorInput {
  status: number | null
  body: unknown
  headers?: unknown
  /** Ağ katmanının kodu (axios `err.code`); yanıt yoksa `code` olarak kalır. */
  transportCode?: string | null
  fallbackMessage?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

// Eski uçlar `{ status, error, response: { message } }` döndürür; message dizi ya da nesne dizisi olabilir.
function legacyMessage(value: unknown): string | null {
  if (typeof value === 'string') return value || null
  if (!Array.isArray(value)) return null
  const parts = value
    .map((item) => (typeof item === 'string' ? item : isRecord(item) ? stringOrNull(item.message) : null))
    .filter((item): item is string => Boolean(item))
  return parts.length ? parts.join('; ') : null
}

export function readErrorBody(body: unknown): {
  message: string | null
  code: string | null
  details: Record<string, unknown> | null
} {
  if (!isRecord(body)) return { message: null, code: null, details: null }
  const code = stringOrNull(body.code)
  const details = isRecord(body.details) ? body.details : null
  if (code && typeof body.error === 'string' && body.error) return { message: body.error, code, details }
  const legacy = isRecord(body.response) ? legacyMessage(body.response.message) : null
  const message = legacy ?? legacyMessage(body.message) ?? stringOrNull(body.error)
  return { message: message || null, code, details }
}

function header(headers: unknown, name: string): string | null {
  if (!isRecord(headers)) return null
  const value = headers[name] ?? headers[name.toLowerCase()]
  if (typeof value === 'string') return value
  return typeof value === 'number' ? String(value) : null
}

/** `Retry-After` saniye ya da HTTP tarihi olabilir. */
export function parseRetryAfter(value: string | null, now = Date.now()): number | null {
  if (!value) return null
  const trimmed = value.trim()
  if (/^\d+$/.test(trimmed)) return Number(trimmed)
  const at = Date.parse(trimmed)
  if (Number.isNaN(at)) return null
  return Math.max(0, Math.ceil((at - now) / 1000))
}

export function toWafixerError(input: ApiErrorInput): WafixerError {
  const { status, body } = input
  const parsed = readErrorBody(body)
  const message = parsed.message ?? input.fallbackMessage ?? 'WAFixer API isteği başarısız.'
  const options: WafixerErrorOptions = { status, code: parsed.code, details: parsed.details, response: body }

  switch (parsed.code) {
    case 'WINDOW_CLOSED':
      return new WafixerWindowClosedError(message, body, options)
    case 'UNSUPPORTED_ON_CHANNEL':
      return new WafixerUnsupportedChannelError(message, body, options)
    case 'CHANNEL_TOKEN_INVALID':
      return new WafixerChannelAuthError(message, options)
    case 'RATE_LIMITED':
      return new WafixerRateLimitError(message, parseRetryAfter(header(input.headers, 'Retry-After')), options)
  }

  switch (status) {
    case 401:
      return new WafixerAuthError(message, options)
    case 403:
      return new WafixerPermissionError(message, options)
    case 404:
      return new WafixerNotFoundError(message, options)
    case 409:
      return new WafixerConflictError(message, options)
    case 429:
      return new WafixerRateLimitError(message, parseRetryAfter(header(input.headers, 'Retry-After')), options)
    case 503:
      return new WafixerUnavailableError(message, options)
    case 400:
    case 413:
    case 422:
      return new WafixerValidationError(message, body, options)
  }

  return new WafixerError(message, { ...options, code: parsed.code ?? input.transportCode ?? null })
}

import { createHmac, timingSafeEqual } from 'node:crypto'

/** Başlık adları; HTTP başlıkları büyük/küçük harfe duyarsızdır, karşılaştırma küçük harfle yapılır. */
export const WEBHOOK_SIGNATURE_HEADER = 'x-wafixer-signature'
export const WEBHOOK_TIMESTAMP_HEADER = 'x-wafixer-timestamp'

/** Zaman damgası bundan eski ya da ileri olan istek reddedilir (yeniden oynatma koruması). */
export const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 300

export type WebhookSignatureFailure =
  | 'missing_secret'
  | 'missing_signature'
  | 'missing_timestamp'
  | 'invalid_timestamp'
  | 'timestamp_out_of_range'
  | 'invalid_signature'

export type WebhookSignatureResult =
  | { valid: true; timestamp: number }
  | { valid: false; reason: WebhookSignatureFailure }

/** Node `IncomingHttpHeaders`, düz nesne ya da Fetch `Headers`. */
export type WebhookHeaderSource =
  | { get(name: string): string | null }
  | Record<string, string | string[] | undefined>

export interface VerifyWebhookSignatureOptions {
  toleranceSeconds?: number
  /** Milisaniye; test ve saat kayması denetimi için. */
  now?: () => number
}

type RawBody = string | Uint8Array

function readHeader(headers: WebhookHeaderSource, name: string): string | undefined {
  if (typeof headers.get === 'function') {
    return (headers as { get(name: string): string | null }).get(name) ?? undefined
  }
  const record = headers as Record<string, string | string[] | undefined>
  for (const key of Object.keys(record)) {
    if (key.toLowerCase() !== name) continue
    const value = record[key]
    return Array.isArray(value) ? value[0] : value
  }
  return undefined
}

function hmacHex(secret: string, timestamp: number, rawBody: RawBody): string {
  const body = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : Buffer.from(rawBody)
  return createHmac('sha256', secret).update(`${timestamp}.`, 'utf8').update(body).digest('hex')
}

/** `X-Wafixer-Signature` değerini üretir: `sha256=` + HMAC-SHA256(sır, `timestamp.gövde`). */
export function signWebhookPayload(secret: string, timestamp: number, rawBody: RawBody): string {
  return `sha256=${hmacHex(secret, timestamp, rawBody)}`
}

/**
 * wafixer webhook isteğinin imzasını doğrular. `rawBody` sunucunun gönderdiği baytlar olmalıdır;
 * JSON'u ayrıştırıp yeniden serileştirmek imzayı bozar (Express'te `express.raw` ya da
 * `express.json({ verify })` ile ham gövdeyi saklayın).
 */
export function verifyWebhookSignature(
  rawBody: RawBody,
  headers: WebhookHeaderSource,
  secret: string,
  options: VerifyWebhookSignatureOptions = {},
): WebhookSignatureResult {
  if (!secret) return { valid: false, reason: 'missing_secret' }

  const signature = readHeader(headers, WEBHOOK_SIGNATURE_HEADER)?.trim()
  if (!signature) return { valid: false, reason: 'missing_signature' }

  const timestampText = readHeader(headers, WEBHOOK_TIMESTAMP_HEADER)?.trim()
  if (!timestampText) return { valid: false, reason: 'missing_timestamp' }
  if (!/^\d{1,12}$/.test(timestampText)) return { valid: false, reason: 'invalid_timestamp' }

  const timestamp = Number(timestampText)
  const tolerance = options.toleranceSeconds ?? DEFAULT_WEBHOOK_TOLERANCE_SECONDS
  const nowSeconds = Math.floor((options.now ?? Date.now)() / 1000)
  if (Math.abs(nowSeconds - timestamp) > tolerance) return { valid: false, reason: 'timestamp_out_of_range' }

  const expected = Buffer.from(signWebhookPayload(secret, timestamp, rawBody), 'utf8')
  const given = Buffer.from(signature, 'utf8')
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { valid: false, reason: 'invalid_signature' }
  }
  return { valid: true, timestamp }
}

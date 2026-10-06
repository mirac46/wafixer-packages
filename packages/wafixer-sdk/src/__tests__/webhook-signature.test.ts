import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { Wafixer } from '../client'
import { signWebhookPayload, verifyWebhookSignature } from '../webhook-signature'

const SECRET = 'whsec_test-secret'
const NOW_MS = 1_759_831_200_000
const NOW = NOW_MS / 1000
const BODY = '{"event":"messages.upsert","instance":"Destek","data":{"text":"merhaba ğüşıöç"}}'

function serverSignature(secret: string, timestamp: number, body: string): string {
  return `sha256=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`
}

function headersFor(timestamp: number, body = BODY, secret = SECRET) {
  return { 'x-wafixer-timestamp': String(timestamp), 'x-wafixer-signature': serverSignature(secret, timestamp, body) }
}

const now = () => NOW_MS

describe('verifyWebhookSignature', () => {
  it('accepts the signature the server produces, from string or byte bodies', () => {
    expect(verifyWebhookSignature(BODY, headersFor(NOW), SECRET, { now })).toEqual({ valid: true, timestamp: NOW })
    expect(verifyWebhookSignature(Buffer.from(BODY, 'utf8'), headersFor(NOW), SECRET, { now }).valid).toBe(true)
    expect(signWebhookPayload(SECRET, NOW, BODY)).toBe(serverSignature(SECRET, NOW, BODY))
  })

  it('reads headers case-insensitively from plain objects, arrays and Fetch Headers', () => {
    const signed = headersFor(NOW)
    const upper = { 'X-Wafixer-Timestamp': [signed['x-wafixer-timestamp']], 'X-Wafixer-Signature': signed['x-wafixer-signature'] }
    expect(verifyWebhookSignature(BODY, upper, SECRET, { now }).valid).toBe(true)
    expect(verifyWebhookSignature(BODY, new Headers(signed), SECRET, { now }).valid).toBe(true)
  })

  it('rejects a wrong signature or a different secret', () => {
    const wrong = { ...headersFor(NOW), 'x-wafixer-signature': `sha256=${'0'.repeat(64)}` }
    expect(verifyWebhookSignature(BODY, wrong, SECRET, { now })).toEqual({ valid: false, reason: 'invalid_signature' })
    expect(verifyWebhookSignature(BODY, headersFor(NOW, BODY, 'whsec_other'), SECRET, { now }).valid).toBe(false)
    expect(verifyWebhookSignature(BODY, { ...headersFor(NOW), 'x-wafixer-signature': 'sha256=kisa' }, SECRET, { now }).valid).toBe(false)
  })

  it('rejects a modified body', () => {
    const tampered = BODY.replace('merhaba', 'merhabа')
    expect(verifyWebhookSignature(tampered, headersFor(NOW), SECRET, { now })).toEqual({ valid: false, reason: 'invalid_signature' })
  })

  it('rejects timestamps outside the 5 minute window and a replayed signature with a new timestamp', () => {
    expect(verifyWebhookSignature(BODY, headersFor(NOW - 301), SECRET, { now })).toEqual({ valid: false, reason: 'timestamp_out_of_range' })
    expect(verifyWebhookSignature(BODY, headersFor(NOW + 301), SECRET, { now }).valid).toBe(false)
    expect(verifyWebhookSignature(BODY, headersFor(NOW - 299), SECRET, { now }).valid).toBe(true)
    expect(verifyWebhookSignature(BODY, headersFor(NOW - 3600), SECRET, { now, toleranceSeconds: 7200 }).valid).toBe(true)

    const replayed = { ...headersFor(NOW - 3600), 'x-wafixer-timestamp': String(NOW) }
    expect(verifyWebhookSignature(BODY, replayed, SECRET, { now })).toEqual({ valid: false, reason: 'invalid_signature' })
  })

  it('reports missing pieces', () => {
    expect(verifyWebhookSignature(BODY, {}, SECRET, { now })).toEqual({ valid: false, reason: 'missing_signature' })
    expect(verifyWebhookSignature(BODY, { 'x-wafixer-signature': 'sha256=x' }, SECRET, { now })).toEqual({ valid: false, reason: 'missing_timestamp' })
    expect(verifyWebhookSignature(BODY, { ...headersFor(NOW), 'x-wafixer-timestamp': '12a' }, SECRET, { now })).toEqual({ valid: false, reason: 'invalid_timestamp' })
    expect(verifyWebhookSignature(BODY, headersFor(NOW), '', { now })).toEqual({ valid: false, reason: 'missing_secret' })
  })
})

describe('Webhook signing secret endpoints', () => {
  function makeClient() {
    const requestFn = vi.fn().mockResolvedValue({ data: { hasSigningSecret: true, secret: 'whsec_x' } })
    const http = { request: requestFn, defaults: { baseURL: 'http://test', headers: {} } } as unknown as AxiosInstance
    return { wa: new Wafixer({ baseUrl: 'http://test', apiKey: 'k', http }), requestFn }
  }

  it('rotates and clears the secret on the encoded session path', async () => {
    const { wa, requestFn } = makeClient()
    await expect(wa.webhook.rotateSigningSecret('Satış Hattı')).resolves.toEqual({ hasSigningSecret: true, secret: 'whsec_x' })
    expect(requestFn.mock.calls[0][0]).toEqual({ method: 'POST', url: '/webhook/signingSecret/Sat%C4%B1%C5%9F%20Hatt%C4%B1' })
    await wa.webhook.clearSigningSecret('Destek')
    expect(requestFn.mock.calls[1][0]).toEqual({ method: 'DELETE', url: '/webhook/signingSecret/Destek' })
  })
})

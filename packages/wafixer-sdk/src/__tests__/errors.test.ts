import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Wafixer } from '../client'
import {
  WafixerAuthError,
  WafixerChannelAuthError,
  WafixerConflictError,
  WafixerError,
  WafixerNotFoundError,
  WafixerPermissionError,
  WafixerRateLimitError,
  WafixerUnavailableError,
  WafixerUnsupportedChannelError,
  WafixerValidationError,
  WafixerWindowClosedError,
  parseRetryAfter,
} from '../errors'
import { startFakeServer, type FakeServer } from './support/fake-server'

let server: FakeServer
let wa: Wafixer

beforeAll(async () => {
  server = await startFakeServer()
  wa = new Wafixer({ baseUrl: server.baseUrl, apiKey: 'test-key' })
})
afterAll(() => server.close())
beforeEach(() => server.reset())

async function failure(promise: Promise<unknown>): Promise<WafixerError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof WafixerError) return error
    throw error
  }
  throw new Error('İstek başarılı oldu, hata bekleniyordu')
}

const sendText = () => wa.messages.sendText('TestSayfa', { number: 'PSID_TEST_1', text: 'Merhaba' })

describe('API error body { error, code, details } → typed error', () => {
  it('WINDOW_CLOSED exposes the human agent window', async () => {
    server.on('POST', '/message/sendText/TestSayfa', {
      status: 422,
      body: {
        error: '24 saatlik mesajlaşma penceresi kapalı.',
        code: 'WINDOW_CLOSED',
        details: {
          humanAgentAvailable: true,
          windowExpires: '2026-10-02T22:55:34.000Z',
          humanAgentExpires: '2026-10-08T22:55:34.000Z',
        },
      },
    })
    const error = await failure(sendText())
    expect(error).toBeInstanceOf(WafixerWindowClosedError)
    expect(error).toBeInstanceOf(WafixerValidationError)
    if (!(error instanceof WafixerWindowClosedError)) throw error
    expect(error.status).toBe(422)
    expect(error.code).toBe('WINDOW_CLOSED')
    expect(error.message).toBe('24 saatlik mesajlaşma penceresi kapalı.')
    expect(error.humanAgentAvailable).toBe(true)
    expect(error.windowExpires).toBe('2026-10-02T22:55:34.000Z')
    expect(error.humanAgentExpires).toBe('2026-10-08T22:55:34.000Z')
  })

  it('WINDOW_CLOSED without human agent window', async () => {
    server.on('POST', '/message/sendText/TestSayfa', {
      status: 422,
      body: { error: 'Pencere kapalı', code: 'WINDOW_CLOSED', details: { humanAgentAvailable: false, windowExpires: null, humanAgentExpires: null } },
    })
    const error = await failure(sendText())
    if (!(error instanceof WafixerWindowClosedError)) throw error
    expect(error.humanAgentAvailable).toBe(false)
    expect(error.humanAgentExpires).toBeNull()
  })

  it('UNSUPPORTED_ON_CHANNEL carries the rejected operation', async () => {
    server.on('POST', '/message/sendList/TestSayfa', {
      status: 400,
      body: { error: 'Bu işlem Messenger/Instagram kanalında desteklenmiyor.', code: 'UNSUPPORTED_ON_CHANNEL', details: { operation: 'listMessage' } },
    })
    const error = await failure(
      wa.messages.sendList('TestSayfa', { number: 'PSID', title: 't', buttonText: 'b', sections: [] }),
    )
    expect(error).toBeInstanceOf(WafixerUnsupportedChannelError)
    if (!(error instanceof WafixerUnsupportedChannelError)) throw error
    expect(error.operation).toBe('listMessage')
    expect(error.status).toBe(400)
  })

  it('VALIDATION_ERROR keeps code and details', async () => {
    server.on('POST', '/message/sendText/TestSayfa', {
      status: 400,
      body: { error: 'En çok 13 hızlı yanıt gönderilebilir.', code: 'VALIDATION_ERROR', details: { field: 'quickReplies' } },
    })
    const error = await failure(sendText())
    expect(error).toBeInstanceOf(WafixerValidationError)
    expect(error).not.toBeInstanceOf(WafixerUnsupportedChannelError)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.details).toEqual({ field: 'quickReplies' })
  })

  it('CHANNEL_TOKEN_INVALID → WafixerChannelAuthError (409)', async () => {
    server.on('POST', '/message/sendText/TestSayfa', {
      status: 409,
      body: { error: 'Bağlantı geçersiz, yeniden bağlayın.', code: 'CHANNEL_TOKEN_INVALID' },
    })
    const error = await failure(sendText())
    expect(error).toBeInstanceOf(WafixerChannelAuthError)
    expect(error).toBeInstanceOf(WafixerConflictError)
    expect(error.status).toBe(409)
  })

  it('RATE_LIMITED reads Retry-After seconds', async () => {
    server.on('POST', '/comment/reply/TestSayfa/1_2', {
      status: 429,
      headers: { 'Retry-After': '17' },
      body: { error: 'İstek sınırı aşıldı.', code: 'RATE_LIMITED' },
    })
    const error = await failure(wa.comment.reply('TestSayfa', '1_2', { text: 'x' }))
    expect(error).toBeInstanceOf(WafixerRateLimitError)
    if (!(error instanceof WafixerRateLimitError)) throw error
    expect(error.retryAfter).toBe(17)
  })

  it('CHANNEL_PERMISSION_DENIED lists missing scopes', async () => {
    server.on('POST', '/comment/find/TestSayfa', {
      status: 403,
      body: {
        error: 'Bağlantı yorum izinlerini içermiyor.',
        code: 'CHANNEL_PERMISSION_DENIED',
        details: { missingScopes: ['pages_read_user_content', 'pages_manage_engagement'] },
      },
    })
    const error = await failure(wa.comment.find('TestSayfa'))
    expect(error).toBeInstanceOf(WafixerPermissionError)
    if (!(error instanceof WafixerPermissionError)) throw error
    expect(error.missingScopes).toEqual(['pages_read_user_content', 'pages_manage_engagement'])
  })

  it('LEADS_ACCESS_DENIED → WafixerPermissionError with lead code', async () => {
    server.on('GET', '/leads/items/Klinik', {
      status: 403,
      body: { error: 'Leads Access Manager üzerinden erişim verin.', code: 'LEADS_ACCESS_DENIED' },
    })
    const error = await failure(wa.leads.items('Klinik'))
    expect(error).toBeInstanceOf(WafixerPermissionError)
    expect(error.code).toBe('LEADS_ACCESS_DENIED')
  })

  it('IMPORT_IN_PROGRESS → WafixerConflictError', async () => {
    server.on('POST', '/leads/forms/Klinik/7001/import', {
      status: 409,
      body: { error: 'Bu form için içe aktarma sürüyor.', code: 'IMPORT_IN_PROGRESS' },
    })
    const error = await failure(wa.leads.forms.import('Klinik', '7001'))
    expect(error).toBeInstanceOf(WafixerConflictError)
    expect(error).not.toBeInstanceOf(WafixerChannelAuthError)
    expect(error.code).toBe('IMPORT_IN_PROGRESS')
  })

  it('503 LEADS_UNAVAILABLE / CHANNEL_NOT_CONFIGURED → WafixerUnavailableError', async () => {
    server.on('GET', '/leads/pages/Klinik', { status: 503, body: { error: 'Lead formları etkin değil.', code: 'LEADS_UNAVAILABLE' } })
    server.on('GET', '/comment/status/Klinik', {
      status: 503,
      body: { error: 'Yorum kayıtları etkin değil.', code: 'CHANNEL_NOT_CONFIGURED', details: { missing: 'MetaComment' } },
    })
    const leads = await failure(wa.leads.pages('Klinik'))
    expect(leads).toBeInstanceOf(WafixerUnavailableError)
    expect(leads.code).toBe('LEADS_UNAVAILABLE')
    const comments = await failure(wa.comment.status('Klinik'))
    expect(comments).toBeInstanceOf(WafixerUnavailableError)
    expect(comments.details).toEqual({ missing: 'MetaComment' })
  })

  it('404 NOT_FOUND / CHANNEL_NOT_CONNECTED → WafixerNotFoundError', async () => {
    server.on('GET', '/comment/detail/Klinik/1_2', {
      status: 404,
      body: { error: 'Oturum Facebook/Instagram bağlantısı taşımıyor.', code: 'CHANNEL_NOT_CONNECTED' },
    })
    const error = await failure(wa.comment.detail('Klinik', '1_2'))
    expect(error).toBeInstanceOf(WafixerNotFoundError)
    expect(error.code).toBe('CHANNEL_NOT_CONNECTED')
  })

  it('502 CHANNEL_PROVIDER_ERROR stays a WafixerError with the server code', async () => {
    server.on('POST', '/message/sendText/TestSayfa', {
      status: 502,
      body: { error: 'Meta beklenmeyen bir hata döndürdü.', code: 'CHANNEL_PROVIDER_ERROR' },
    })
    const error = await failure(sendText())
    expect(error.constructor).toBe(WafixerError)
    expect(error).toMatchObject({ status: 502, code: 'CHANNEL_PROVIDER_ERROR' })
  })
})

describe('legacy error bodies', () => {
  it('400 with response.message array joins the messages', async () => {
    server.on('POST', '/message/sendText/Inst', {
      status: 400,
      body: { status: 400, error: 'Bad Request', response: { message: ['number is required', 'text is required'] } },
    })
    const error = await failure(wa.messages.sendText('Inst', { number: '', text: '' }))
    expect(error).toBeInstanceOf(WafixerValidationError)
    expect(error.message).toBe('number is required; text is required')
    expect(error.code).toBe('BAD_REQUEST')
  })

  it('401 legacy body → WafixerAuthError', async () => {
    server.on('GET', '/instance/fetchInstances', {
      status: 401,
      body: { status: 401, error: 'Unauthorized', response: { message: 'Unauthorized' } },
    })
    const error = await failure(wa.instances.list())
    expect(error).toBeInstanceOf(WafixerAuthError)
    expect(error).toMatchObject({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' })
  })

  it('network failure keeps the transport code', async () => {
    const closed = await startFakeServer()
    const offline = new Wafixer({ baseUrl: closed.baseUrl, apiKey: 'k' })
    await closed.close()
    const error = await failure(offline.instances.list())
    expect(error.status).toBeNull()
    expect(error.code).toBe('ECONNREFUSED')
  })
})

describe('parseRetryAfter', () => {
  it('reads seconds and HTTP dates', () => {
    const now = Date.parse('2026-10-04T10:00:00.000Z')
    expect(parseRetryAfter('30', now)).toBe(30)
    expect(parseRetryAfter('Sun, 04 Oct 2026 10:00:45 GMT', now)).toBe(45)
    expect(parseRetryAfter('geçersiz', now)).toBeNull()
    expect(parseRetryAfter(null, now)).toBeNull()
  })
})

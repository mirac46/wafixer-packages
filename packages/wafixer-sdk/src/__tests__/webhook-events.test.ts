import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Wafixer } from '../client'
import { getChannelUserId, getMessageText } from '../types/events'
import {
  COMMENT_EVENTS,
  LEAD_EVENTS,
  WEBHOOK_EVENTS,
  isWafixerWebhookEvent,
  isWebhookEvent,
  parseWebhookEvent,
  webhookEventConstant,
} from '../webhook-events'
import { startFakeServer, type FakeServer } from './support/fake-server'
import { lead, metaComment, metaPost } from './support/fixtures'

const envelope = {
  instance: 'TestSayfa',
  destination: 'https://istemci.example/webhook',
  date_time: '2026-10-04T09:30:01.000Z',
  sender: 'PAGE_ID_TEST@messenger',
  server_url: 'https://wafixer.com',
  apikey: null,
}

describe('parseWebhookEvent', () => {
  it('parses comment.received with comment and post', () => {
    const event = parseWebhookEvent({
      ...envelope,
      event: 'comment.received',
      channel: 'MESSENGER',
      data: { comment: metaComment, post: metaPost },
    })
    expect(event?.event).toBe('comment.received')
    if (event?.event !== 'comment.received') throw new Error('comment.received bekleniyordu')
    expect(event.data.comment.text).toBe('Randevu almak istiyorum')
    expect(event.data.post?.permalink).toBe('https://facebook.com/111_222')
    expect(event.channel).toBe('MESSENGER')
  })

  it('parses comment.updated, comment.removed and comment.reply.sent', () => {
    const updated = parseWebhookEvent({ ...envelope, event: 'comment.updated', data: { comment: metaComment, post: null, change: 'hidden' } })
    if (updated?.event !== 'comment.updated') throw new Error('comment.updated bekleniyordu')
    expect(updated.data.change).toBe('hidden')

    const removed = parseWebhookEvent({
      ...envelope,
      event: 'comment.removed',
      data: { comment: { ...metaComment, status: 'removed', removedAt: '2026-10-04T10:00:00.000Z' }, post: null },
    })
    if (removed?.event !== 'comment.removed') throw new Error('comment.removed bekleniyordu')
    expect(removed.data.comment.status).toBe('removed')

    const reply = parseWebhookEvent({
      ...envelope,
      event: 'comment.reply.sent',
      data: { comment: { ...metaComment, fromOwner: true, sentByApi: true }, inReplyTo: '222_333', post: metaPost },
    })
    if (reply?.event !== 'comment.reply.sent') throw new Error('comment.reply.sent bekleniyordu')
    expect(reply.data.inReplyTo).toBe('222_333')
    expect(reply.data.comment.sentByApi).toBe(true)
  })

  it('parses lead.received and lead.updated (no apikey in the envelope)', () => {
    const received = parseWebhookEvent({
      event: 'lead.received',
      instance: 'Klinik',
      data: { ...lead, instanceId: 'inst_1' },
      destination: 'https://agentfix.com.tr/api/webhooks/wafixer',
      date_time: '2026-10-04T08:00:06.000Z',
      sender: 'PAGE_ID_TEST',
      server_url: 'https://wafixer.com',
    })
    if (received?.event !== 'lead.received') throw new Error('lead.received bekleniyordu')
    expect(received.data.email).toBe('deneme@example.com')
    expect('apikey' in received).toBe(false)

    const updated = parseWebhookEvent({
      event: 'lead.updated',
      instance: 'Klinik',
      data: { ...lead, status: 'contacted', instanceId: 'inst_1', changes: ['status', 'read'] },
      date_time: '2026-10-04T09:00:00.000Z',
    })
    if (updated?.event !== 'lead.updated') throw new Error('lead.updated bekleniyordu')
    expect(updated.data.changes).toEqual(['status', 'read'])
  })

  it('parses Messenger connection.update reasons', () => {
    for (const reason of ['token_invalid', 'subscription_lost', 'revoked'] as const) {
      const event = parseWebhookEvent({
        ...envelope,
        event: 'connection.update',
        channel: 'INSTAGRAM',
        data: { instance: 'TestInstagram', state: 'close', statusReason: 190, reason },
      })
      if (event?.event !== 'connection.update') throw new Error('connection.update bekleniyordu')
      expect(event.data.reason).toBe(reason)
      expect(event.data.state).toBe('close')
    }
  })

  it('accepts JSON text and raw Buffer bodies', () => {
    const body = JSON.stringify({ ...envelope, event: 'comment.received', data: { comment: metaComment, post: null } })
    expect(parseWebhookEvent(body)?.event).toBe('comment.received')
    expect(parseWebhookEvent(Buffer.from(body, 'utf8'))?.event).toBe('comment.received')
  })

  it('returns null for unknown or malformed bodies', () => {
    expect(parseWebhookEvent('{bozuk')).toBeNull()
    expect(parseWebhookEvent(null)).toBeNull()
    expect(parseWebhookEvent([])).toBeNull()
    expect(parseWebhookEvent({ ...envelope, event: 'qrcode.updated', data: {} })).toBeNull()
    expect(parseWebhookEvent({ event: 'lead.received', data: lead })).toBeNull()
    expect(parseWebhookEvent({ event: 'lead.received', instance: 'Klinik', data: null })).toBeNull()
  })

  it('isWebhookEvent narrows to a single event', () => {
    const body: unknown = { ...envelope, event: 'lead.received', data: { ...lead, instanceId: 'inst_1' } }
    expect(isWafixerWebhookEvent(body)).toBe(true)
    expect(isWebhookEvent(body, 'comment.received')).toBe(false)
    if (!isWebhookEvent(body, 'lead.received')) throw new Error('lead.received bekleniyordu')
    expect(body.data.leadgenId).toBe('9001')
  })
})

describe('webhook event constants', () => {
  it('include comment and lead events accepted by webhook/set', () => {
    for (const name of [...COMMENT_EVENTS, ...LEAD_EVENTS]) expect(WEBHOOK_EVENTS).toContain(name)
    expect(COMMENT_EVENTS).toEqual(['COMMENT_RECEIVED', 'COMMENT_UPDATED', 'COMMENT_REMOVED', 'COMMENT_REPLY_SENT'])
    expect(LEAD_EVENTS).toEqual(['LEAD_RECEIVED', 'LEAD_UPDATED'])
  })

  it('maps event names to webhook/set constants', () => {
    expect(webhookEventConstant('comment.reply.sent')).toBe('COMMENT_REPLY_SENT')
    expect(webhookEventConstant('lead.received')).toBe('LEAD_RECEIVED')
    expect(webhookEventConstant('group-participants.update')).toBe('GROUP_PARTICIPANTS_UPDATE')
    expect(webhookEventConstant('groups.update')).toBe('GROUP_UPDATE')
    expect(WEBHOOK_EVENTS).not.toContain('GROUPS_UPDATE')
  })
})

describe('message helpers', () => {
  const base = { key: { remoteJid: 'PSID_TEST_1@messenger', fromMe: false, id: 'm_1' }, messageTimestamp: 1, instanceId: 'i' }

  it('getMessageText reads quick reply / postback text', () => {
    expect(
      getMessageText({ ...base, message: { buttonsResponseMessage: { selectedButtonId: 'fiyat', selectedDisplayText: 'Fiyat bilgisi' } } }),
    ).toBe('Fiyat bilgisi')
  })

  it('getChannelUserId returns the PSID / IGSID / phone', () => {
    expect(getChannelUserId({ data: base })).toBe('PSID_TEST_1')
    expect(getChannelUserId({ data: { key: { remoteJid: 'IGSID_1@instagram' } } })).toBe('IGSID_1')
    expect(getChannelUserId({ data: { key: { remoteJid: '905321788329@s.whatsapp.net' } } })).toBe('905321788329')
  })
})

describe('webhook resource', () => {
  let server: FakeServer
  let wa: Wafixer

  beforeAll(async () => {
    server = await startFakeServer()
    wa = new Wafixer({ baseUrl: server.baseUrl, apiKey: 'test-key' })
  })
  afterAll(() => server.close())
  beforeEach(() => server.reset())

  it('set sends the event list and defaults', async () => {
    server.on('POST', '/webhook/set/Klinik', ({ body }) => ({ status: 201, body }))
    await wa.webhook.set('Klinik', {
      enabled: true,
      url: 'https://n8n.example/webhook/abc',
      events: ['LEAD_RECEIVED', 'COMMENT_RECEIVED'],
      headers: { 'x-shared-secret': 'degil-gercek' },
    })
    expect(server.last().body).toEqual({
      webhook: {
        enabled: true,
        url: 'https://n8n.example/webhook/abc',
        events: ['LEAD_RECEIVED', 'COMMENT_RECEIVED'],
        byEvents: false,
        base64: false,
        headers: { 'x-shared-secret': 'degil-gercek' },
      },
    })
  })

  it('set always sends an events array', async () => {
    server.on('POST', '/webhook/set/Klinik', { status: 201, body: {} })
    await wa.webhook.set('Klinik', { enabled: false, url: '' })
    expect(server.last().body).toEqual({ webhook: { enabled: false, url: '', events: [], byEvents: false, base64: false } })
  })

  it('find returns the stored settings', async () => {
    const settings = { url: 'https://n8n.example/webhook/abc', enabled: true, events: ['LEAD_RECEIVED'] }
    server.on('GET', '/webhook/find/Klinik', { body: settings })
    await expect(wa.webhook.find('Klinik')).resolves.toEqual(settings)
  })
})

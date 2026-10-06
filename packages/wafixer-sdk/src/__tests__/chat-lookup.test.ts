import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Wafixer } from '../client'
import { WafixerValidationError } from '../errors'
import { isWebhookEvent, parseWebhookEvent } from '../webhook-events'
import { startFakeServer, type FakeServer } from './support/fake-server'

const name = 'Satış Hattı'
const encodedName = encodeURIComponent(name)

let server: FakeServer
let wa: Wafixer

beforeAll(async () => {
  server = await startFakeServer()
  wa = new Wafixer({ baseUrl: server.baseUrl, apiKey: 'wfx_test' })
})

beforeEach(() => server.reset())

afterAll(() => server.close())

describe('chat lookups', () => {
  it('checkNumbers posts the number list and returns the results', async () => {
    const results = [{ jid: '905551112233@s.whatsapp.net', exists: true, number: '905551112233' }]
    server.on('POST', `/chat/whatsappNumbers/${encodedName}`, { body: results })

    await expect(wa.chat.checkNumbers(name, { numbers: ['905551112233'] })).resolves.toEqual(results)
    expect(server.last().body).toEqual({ numbers: ['905551112233'] })
    expect(server.last().headers.apikey).toBe('wfx_test')
  })

  it('fetchProfilePictureUrl sends the number', async () => {
    server.on('POST', `/chat/fetchProfilePictureUrl/${encodedName}`, {
      body: { wuid: '905551112233@s.whatsapp.net', profilePictureUrl: null },
    })

    const picture = await wa.chat.fetchProfilePictureUrl(name, '905551112233')
    expect(picture.profilePictureUrl).toBeNull()
    expect(server.last().body).toEqual({ number: '905551112233' })
  })

  it('updateBlockStatus sends number and status', async () => {
    server.on('POST', `/chat/updateBlockStatus/${encodedName}`, { body: { accepted: true } })

    await wa.chat.updateBlockStatus(name, { number: '905551112233', status: 'block' })
    expect(server.last().body).toEqual({ number: '905551112233', status: 'block' })
  })

  it('findMessages, findChats and findContacts post the query', async () => {
    const page = { messages: { total: 1, pages: 1, currentPage: 1, records: [{ id: 'm1' }] } }
    server.on('POST', `/chat/findMessages/${encodedName}`, { body: page })
    server.on('POST', `/chat/findChats/${encodedName}`, { body: [] })
    server.on('POST', `/chat/findContacts/${encodedName}`, { body: [] })

    const query = { where: { key: { remoteJid: '905551112233@s.whatsapp.net' } }, page: 2, offset: 25 }
    await expect(wa.chat.findMessages(name, query)).resolves.toEqual(page)
    expect(server.last().body).toEqual(query)

    await wa.chat.findChats(name)
    expect(server.last().body).toEqual({})

    await wa.chat.findContacts(name, { where: { pushName: 'Ayşe' } })
    expect(server.last().body).toEqual({ where: { pushName: 'Ayşe' } })
  })

  it('findChatByRemoteJid sends remoteJid as query string', async () => {
    server.on('GET', `/chat/findChatByRemoteJid/${encodedName}`, { body: { remoteJid: '1@messenger' } })

    await wa.chat.findChatByRemoteJid(name, '1@messenger')
    expect(server.last().query).toEqual({ remoteJid: '1@messenger' })
  })

  it('maps a 400 from findChatByRemoteJid to a validation error', async () => {
    server.on('GET', `/chat/findChatByRemoteJid/${encodedName}`, {
      status: 400,
      body: { error: 'remoteJid is a required query parameter' },
    })

    await expect(wa.chat.findChatByRemoteJid(name, '')).rejects.toBeInstanceOf(WafixerValidationError)
  })
})

describe('instance restart and status message', () => {
  it('restart posts to /instance/restart/{instance}', async () => {
    server.on('POST', `/instance/restart/${encodedName}`, { body: { instance: { instanceName: name, state: 'connecting' } } })

    await wa.instances.restart(name)
    expect(server.last().method).toBe('POST')
  })

  it('connectionState returns the reconnect snapshot', async () => {
    const reconnect = { phase: 'awaiting_qr', attempt: 3, maxAttempts: 3, nextAttemptAt: null } as const
    server.on('GET', `/instance/connectionState/${encodedName}`, {
      body: { instance: { instanceName: name, state: 'close', source: 'database', reconnect } },
    })

    const state = await wa.instances.connectionState(name)
    expect(state.instance.reconnect).toEqual(reconnect)
  })

  it('sendStatus posts to /message/sendStatus/{instance}', async () => {
    server.on('POST', `/message/sendStatus/${encodedName}`, { body: { key: { id: 's1' } } })

    await wa.messages.sendStatus(name, { type: 'text', content: 'Bugün açığız', allContacts: true })
    expect(server.last().body).toEqual({ type: 'text', content: 'Bugün açığız', allContacts: true })
  })
})

const envelope = {
  instance: name,
  destination: 'https://istemci.example/webhook',
  date_time: '2026-10-06T21:30:00.000Z',
  sender: '905551112233@s.whatsapp.net',
  server_url: 'https://wafixer.com',
  apikey: null,
  channel: 'QR',
}

describe('session webhook events', () => {
  it('parses connection.update with the reconnect snapshot', () => {
    const reconnect = { phase: 'reconnecting', attempt: 2, maxAttempts: null, nextAttemptAt: '2026-10-06T21:32:00.000Z' }
    const event = parseWebhookEvent({
      ...envelope,
      event: 'connection.update',
      data: { instance: name, state: 'connecting', statusReason: 428, reconnect },
    })
    if (!isWebhookEvent(event, 'connection.update')) throw new Error('connection.update bekleniyordu')
    expect(event.data.reconnect?.phase).toBe('reconnecting')
    expect(event.data.reconnect?.maxAttempts).toBeNull()
  })

  it('parses qrcode.updated, status.instance, labels and edited messages', () => {
    const qr = parseWebhookEvent({
      ...envelope,
      event: 'qrcode.updated',
      data: { qrcode: { instance: name, pairingCode: null, code: '2@abc', base64: 'data:image/png;base64,AA' } },
    })
    expect(qr?.event).toBe('qrcode.updated')

    const status = parseWebhookEvent({ ...envelope, event: 'status.instance', data: { instance: name, status: 'closed' } })
    expect(status?.event).toBe('status.instance')

    const label = parseWebhookEvent({
      ...envelope,
      event: 'labels.association',
      data: { instance: name, type: 'add', chatId: '905551112233@s.whatsapp.net', labelId: '3' },
    })
    expect(label?.event).toBe('labels.association')

    const edited = parseWebhookEvent({
      ...envelope,
      event: 'messages.edited',
      data: { key: { remoteJid: '905551112233@s.whatsapp.net', fromMe: false, id: 'm1' }, messageTimestamp: 1, instanceId: 'i1' },
    })
    expect(edited?.event).toBe('messages.edited')
  })

  it('accepts logout.instance and remove.instance with null data', () => {
    expect(parseWebhookEvent({ ...envelope, event: 'logout.instance', data: null })?.event).toBe('logout.instance')
    expect(parseWebhookEvent({ ...envelope, event: 'remove.instance', data: null })?.event).toBe('remove.instance')
    expect(parseWebhookEvent({ ...envelope, event: 'messages.upsert', data: null })).toBeNull()
  })
})

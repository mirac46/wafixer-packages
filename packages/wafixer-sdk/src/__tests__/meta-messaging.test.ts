import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Wafixer } from '../client'
import type { WafixerInstance } from '../types/instances'
import { startFakeServer, type FakeServer } from './support/fake-server'
import { messengerCapabilities, metaMessagingStatus } from './support/fixtures'

let server: FakeServer
let wa: Wafixer

beforeAll(async () => {
  server = await startFakeServer()
  wa = new Wafixer({ baseUrl: server.baseUrl, apiKey: 'test-key' })
})
afterAll(() => server.close())
beforeEach(() => server.reset())

const encodedName = encodeURIComponent('Test Sayfa')

describe('instances.metaMessaging', () => {
  it('config reads the public Facebook Login configuration with apikey header', async () => {
    const config = {
      appId: '123',
      configId: '456',
      graphVersion: 'v25.0',
      scopes: { MESSENGER: ['pages_messaging'], INSTAGRAM: ['instagram_manage_messages'] },
      configured: true,
      session: null,
    }
    server.on('GET', '/instance/metaMessaging/config', { body: config })
    await expect(wa.instances.metaMessaging.config()).resolves.toEqual(config)
    expect(server.last().headers.apikey).toBe('test-key')
  })

  it('discover posts the user token in the body, never in the URL', async () => {
    const response = { selectionRef: 'sel_1', expiresAt: '2026-10-04T10:10:00.000Z', pages: [] }
    server.on('POST', '/instance/metaMessaging/discover', { body: response })
    await expect(wa.instances.metaMessaging.discover({ userToken: 'EAAB-user-token-0123456789' })).resolves.toEqual(
      response,
    )
    expect(server.last().body).toEqual({ userToken: 'EAAB-user-token-0123456789' })
    expect(server.last().query).toEqual({})
  })

  it('connect posts selection and returns the created session', async () => {
    const response = {
      instance: {
        instanceName: 'Test Sayfa',
        instanceId: 'inst_1',
        integration: 'MESSENGER' as const,
        channel: 'MESSENGER' as const,
        pageId: 'PAGE_ID_TEST',
        accountId: 'PAGE_ID_TEST',
        status: 'open',
      },
      hash: 'wfx_hash',
    }
    server.on('POST', '/instance/metaMessaging/connect', { status: 201, body: response })
    const input = { selectionRef: 'sel_1', channel: 'MESSENGER' as const, pageId: 'PAGE_ID_TEST', instanceName: 'Test Sayfa' }
    await expect(wa.instances.metaMessaging.connect(input)).resolves.toEqual(response)
    expect(server.last().body).toEqual(input)
  })

  it('reconnect, status and resubscribe use the encoded instance path', async () => {
    server.on('POST', `/instance/metaMessaging/reconnect/${encodedName}`, { body: metaMessagingStatus })
    server.on('GET', `/instance/metaMessaging/${encodedName}`, { body: metaMessagingStatus })
    server.on('POST', `/instance/metaMessaging/${encodedName}`, { body: { ...metaMessagingStatus, subscribed: true } })

    await expect(wa.instances.metaMessaging.reconnect('Test Sayfa', { selectionRef: 'sel_2' })).resolves.toEqual(
      metaMessagingStatus,
    )
    expect(server.last().body).toEqual({ selectionRef: 'sel_2' })

    const status = await wa.instances.metaMessaging.status('Test Sayfa')
    expect(status.status).toBe('ACTIVE')
    expect(server.last().method).toBe('GET')

    const resubscribed = await wa.instances.metaMessaging.resubscribe('Test Sayfa')
    expect(resubscribed.subscribed).toBe(true)
    expect(server.last()).toMatchObject({ method: 'POST', path: `/instance/metaMessaging/${encodedName}` })
  })

  it('disconnect logs the session out so the Meta subscription is removed', async () => {
    const response = { status: 'SUCCESS', error: false, response: { message: 'Örnek oturumu kapatıldı' } }
    server.on('DELETE', `/instance/logout/${encodedName}`, { body: response })
    await expect(wa.instances.metaMessaging.disconnect('Test Sayfa')).resolves.toEqual(response)
  })

  it('metaMessagingSession returns the hosted connection URL', async () => {
    const response = { url: 'https://wafixer.com/connect/meta?session=abc', expiresAt: '2026-10-04T10:15:00.000Z' }
    server.on('POST', '/instance/metaMessagingSession', { status: 201, body: response })
    const session = await wa.instances.metaMessagingSession({
      channel: 'INSTAGRAM',
      returnUrl: 'https://agentfix.com.tr/entegrasyonlar',
    })
    expect(session.url).toBe(response.url)
    expect(server.last().body).toEqual({ channel: 'INSTAGRAM', returnUrl: 'https://agentfix.com.tr/entegrasyonlar' })
  })

  it('logout and delete call the instance endpoints', async () => {
    const ok = { status: 'SUCCESS', error: false, response: { message: 'ok' } }
    server.on('DELETE', '/instance/logout/Inst', { body: ok })
    server.on('DELETE', '/instance/delete/Inst', { body: ok })
    await wa.instances.logout('Inst')
    await wa.instances.delete('Inst')
    expect(server.requests.map((r) => `${r.method} ${r.path}`)).toEqual([
      'DELETE /instance/logout/Inst',
      'DELETE /instance/delete/Inst',
    ])
  })
})

describe('fetchInstances channel fields', () => {
  it('exposes channel and capabilities from the server', async () => {
    const instance: WafixerInstance = {
      id: 'inst_1',
      name: 'Test Sayfa',
      connectionStatus: 'open',
      ownerJid: 'PAGE_ID_TEST@messenger',
      integration: 'MESSENGER',
      number: 'PAGE_ID_TEST',
      channel: 'MESSENGER',
      capabilities: messengerCapabilities,
    }
    server.on('GET', '/instance/fetchInstances', { body: [instance] })
    const [listed] = await wa.instances.list()
    expect(listed.channel).toBe('MESSENGER')
    expect(listed.capabilities?.window).toEqual({ standardHours: 24, humanAgentDays: 7 })
  })
})

describe('Messenger/Instagram sending', () => {
  const sent = {
    key: { remoteJid: 'PSID_TEST_1@messenger', fromMe: true, id: 'm_OUT_1' },
    message: { conversation: 'Size nasıl yardımcı olabilirim?' },
    messageType: 'conversation',
    messageTimestamp: 1790000100,
    status: 'PENDING',
    channel: 'MESSENGER',
  }

  it('sendText carries quickReplies and humanAgent', async () => {
    server.on('POST', `/message/sendText/${encodedName}`, { status: 201, body: sent })
    const quickReplies = [
      { title: 'Fiyat bilgisi', payload: 'fiyat' },
      { title: 'E-posta', type: 'user_email' as const },
    ]
    await wa.messages.sendText('Test Sayfa', {
      number: 'PSID_TEST_1',
      text: 'Size nasıl yardımcı olabilirim?',
      quickReplies,
      humanAgent: true,
    })
    expect(server.last().body).toEqual({
      number: 'PSID_TEST_1',
      text: 'Size nasıl yardımcı olabilirim?',
      quickReplies,
      humanAgent: true,
    })
  })

  it('replyTo answers a Messenger event with the PSID and passes humanAgent', async () => {
    server.on('POST', '/message/sendText/TestSayfa', { status: 201, body: sent })
    const event = {
      instance: 'TestSayfa',
      data: {
        key: { remoteJid: 'PSID_TEST_1@messenger', fromMe: false, id: 'm_IN_1' },
        message: { conversation: 'Merhaba' },
        messageTimestamp: 1790000000,
        instanceId: 'inst_1',
      },
    }
    await wa.messages.replyTo(event, { text: 'Merhaba, temsilciniz yazıyor', humanAgent: true })
    expect(server.last().body).toMatchObject({
      number: 'PSID_TEST_1',
      text: 'Merhaba, temsilciniz yazıyor',
      humanAgent: true,
      quoted: { key: event.data.key },
    })
  })
})

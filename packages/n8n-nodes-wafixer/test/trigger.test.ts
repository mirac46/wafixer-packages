import type { IDataObject } from 'n8n-workflow'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { wafixerLoadOptions } from '../nodes/shared/instanceOptions'
import { ALL_EVENTS, WafixerTrigger } from '../nodes/WafixerTrigger/WafixerTrigger.node'
import { startFakeServer, type FakeServer } from '../../wafixer-sdk/src/__tests__/support/fake-server'
import { lead, messengerCapabilities, metaComment } from '../../wafixer-sdk/src/__tests__/support/fixtures'
import { hookContext, loadOptionsContext, webhookContext } from './support/context'

const trigger = new WafixerTrigger()
const hooks = trigger.webhookMethods.default
const webhookUrl = 'https://n8n.example/webhook/abc/webhook'

let server: FakeServer
beforeAll(async () => {
  server = await startFakeServer()
})
afterAll(() => server.close())
beforeEach(() => server.reset())

describe('webhook registration', () => {
  it('create registers the selected events, renaming the legacy group event', async () => {
    server.on('POST', '/webhook/set/Klinik', ({ body }) => ({ status: 201, body }))
    await hooks.create.call(
      hookContext(server.baseUrl, { instance: 'Klinik', events: ['COMMENT_RECEIVED', 'LEAD_RECEIVED', 'GROUPS_UPDATE'], options: {} }, webhookUrl),
    )
    expect(server.last().body).toEqual({
      webhook: {
        enabled: true,
        url: webhookUrl,
        events: ['COMMENT_RECEIVED', 'LEAD_RECEIVED', 'GROUP_UPDATE'],
        byEvents: false,
        base64: false,
      },
    })
  })

  it('create without selection registers every event the node offers', async () => {
    server.on('POST', '/webhook/set/Klinik', { status: 201, body: {} })
    await hooks.create.call(hookContext(server.baseUrl, { instance: 'Klinik', events: [], options: { webhookBase64: true } }, webhookUrl))
    const body = server.last().body as { webhook: { events: string[]; base64: boolean } }
    expect(body.webhook.events).toEqual(ALL_EVENTS)
    expect(body.webhook.base64).toBe(true)
  })

  it('checkExists compares the stored URL', async () => {
    server.on('GET', '/webhook/find/Klinik', { body: { enabled: true, url: webhookUrl, events: ['LEAD_RECEIVED'] } })
    await expect(hooks.checkExists.call(hookContext(server.baseUrl, { instance: 'Klinik' }, webhookUrl))).resolves.toBe(true)
    await expect(
      hooks.checkExists.call(hookContext(server.baseUrl, { instance: 'Klinik' }, 'https://n8n.example/other')),
    ).resolves.toBe(false)
  })

  it('delete disables the webhook and never throws', async () => {
    server.on('POST', '/webhook/set/Klinik', { status: 400, body: { error: 'url boş olamaz', code: 'VALIDATION_ERROR' } })
    await expect(hooks.delete.call(hookContext(server.baseUrl, { instance: 'Klinik' }, webhookUrl))).resolves.toBe(true)
    expect(server.last().body).toMatchObject({ webhook: { enabled: false, events: [] } })
  })
})

describe('incoming event filter', () => {
  const envelope = {
    instance: 'Klinik',
    date_time: '2026-10-04T09:30:01.000Z',
    server_url: 'https://wafixer.com',
  }

  async function receive(params: IDataObject, body: IDataObject) {
    const response = await trigger.webhook.call(webhookContext({ options: {}, ...params }, body))
    return response.workflowData?.[0]?.[0]?.json ?? null
  }

  it('passes private reply events', async () => {
    const event = {
      ...envelope,
      event: 'comment.private_reply.sent',
      channel: 'MESSENGER',
      data: { comment: metaComment, post: null, message: { id: 'm_1', remoteJid: 'P@messenger', text: 'x', timestamp: 1 } },
    }
    expect(await receive({ events: ['COMMENT_PRIVATE_REPLY_SENT'] }, event)).toEqual(event)
    expect(await receive({ events: ['COMMENT_REPLY_SENT'] }, event)).toBeNull()
  })

  it('passes selected comment and lead events', async () => {
    const commentEvent = { ...envelope, event: 'comment.received', channel: 'MESSENGER', data: { comment: metaComment, post: null } }
    expect(await receive({ events: ['COMMENT_RECEIVED'] }, commentEvent)).toEqual(commentEvent)

    const replyEvent = { ...envelope, event: 'comment.reply.sent', data: { comment: metaComment, inReplyTo: '1_1', post: null } }
    expect(await receive({ events: ['COMMENT_REPLY_SENT'] }, replyEvent)).toEqual(replyEvent)

    const leadEvent = { ...envelope, event: 'lead.received', data: { ...lead, instanceId: 'inst_1' } }
    expect(await receive({ events: ['LEAD_RECEIVED'] }, leadEvent)).toEqual(leadEvent)
  })

  it('drops events that were not selected', async () => {
    const leadEvent = { ...envelope, event: 'lead.updated', data: { ...lead, instanceId: 'inst_1', changes: ['status'] } }
    expect(await receive({ events: ['LEAD_RECEIVED'] }, leadEvent)).toBeNull()
  })

  it('matches groups.update to the Group Updated option', async () => {
    expect(await receive({ events: ['GROUP_UPDATE'] }, { ...envelope, event: 'groups.update', data: { id: 'g' } })).not.toBeNull()
  })

  it('filters by channel; bodies without channel pass', async () => {
    const message = (channel: string | null) => ({
      ...envelope,
      event: 'messages.upsert',
      channel,
      data: { key: { remoteJid: 'x', fromMe: false, id: 'm' } },
    })
    const params = { events: ['MESSAGES_UPSERT'], options: { channels: ['MESSENGER', 'WHATSAPP'] } }
    expect(await receive(params, message('MESSENGER'))).not.toBeNull()
    expect(await receive(params, message('QR'))).not.toBeNull()
    expect(await receive(params, message('META'))).not.toBeNull()
    expect(await receive(params, message('INSTAGRAM'))).toBeNull()
    expect(await receive(params, message(null))).not.toBeNull()
  })

  it('connection.update with Meta reason passes through', async () => {
    const event = {
      ...envelope,
      event: 'connection.update',
      channel: 'INSTAGRAM',
      data: { instance: 'Klinik', state: 'close', statusReason: 190, reason: 'token_invalid' },
    }
    expect(await receive({ events: ['CONNECTION_UPDATE'] }, event)).toEqual(event)
  })

  it('ignores own messages when asked', async () => {
    const own = { ...envelope, event: 'messages.upsert', data: { key: { remoteJid: 'x', fromMe: true, id: 'm' } } }
    expect(await receive({ events: ['MESSAGES_UPSERT'], options: { ignoreFromMe: true } }, own)).toBeNull()
  })
})

describe('session list', () => {
  it('labels Messenger/Instagram sessions with their channel', async () => {
    server.on('GET', '/instance/fetchInstances', {
      body: [
        { id: '1', name: 'Sayfa', connectionStatus: 'open', ownerJid: 'P@messenger', integration: 'MESSENGER', number: 'P', channel: 'MESSENGER', capabilities: messengerCapabilities },
        { id: '2', name: 'Insta', connectionStatus: 'close', ownerJid: 'I@instagram', integration: 'INSTAGRAM', number: 'I', channel: 'INSTAGRAM' },
        { id: '3', name: 'Satis', connectionStatus: 'open', ownerJid: '905321788329@s.whatsapp.net', integration: 'WHATSAPP-BAILEYS', number: '905321788329' },
      ],
    })
    const options = await wafixerLoadOptions.loadOptions.getInstances.call(loadOptionsContext(server.baseUrl))
    expect(options.map((o) => o.name)).toEqual([
      'Active - Satis (905321788329)',
      'Active - Sayfa (Messenger)',
      'Reconnect Required - Insta (Instagram)',
    ])
  })
})

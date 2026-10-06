import { NodeOperationError } from 'n8n-workflow'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { Wafixer } from '../nodes/Wafixer/Wafixer.node'
import { startFakeServer, type FakeServer } from '../../wafixer-sdk/src/__tests__/support/fake-server'
import { executeContext } from './support/context'

let server: FakeServer
const node = new Wafixer()

beforeAll(async () => {
  server = await startFakeServer()
})
afterAll(() => server.close())
beforeEach(() => server.reset())

function run(params: Record<string, unknown>) {
  return node.execute.call(executeContext(server.baseUrl, { instance: 'Klinik', ...params }))
}

const key = { remoteJid: '905321788329@s.whatsapp.net', fromMe: true, id: 'MSG_1' }

describe('Message resource: new operations', () => {
  it('Send Video Note posts the video', async () => {
    server.on('POST', '/message/sendPtv/Klinik', { status: 201, body: { key: { id: 'p1' } } })
    const [items] = await run({ resource: 'message', operation: 'sendPtv', number: '905321788329', ptvVideo: 'https://x/v.mp4' })
    expect(server.last().body).toEqual({ number: '905321788329', video: 'https://x/v.mp4' })
    expect(items[0].json).toEqual({ key: { id: 'p1' } })
  })

  it('Send Template parses the components JSON', async () => {
    server.on('POST', '/message/sendTemplate/Klinik', { status: 201, body: { key: { id: 't1' } } })
    await run({
      resource: 'message',
      operation: 'sendTemplate',
      number: '905321788329',
      templateName: 'randevu_hatirlatma',
      templateLanguage: 'tr',
      templateComponents: '[{"type":"body","parameters":[{"type":"text","text":"Ayşe"}]}]',
    })
    expect(server.last().body).toEqual({
      number: '905321788329',
      name: 'randevu_hatirlatma',
      language: 'tr',
      components: [{ type: 'body', parameters: [{ type: 'text', text: 'Ayşe' }] }],
    })
  })

  it('Send Template with broken JSON stops before calling the API', async () => {
    const error = await run({
      resource: 'message',
      operation: 'sendTemplate',
      number: '905321788329',
      templateName: 'x',
      templateLanguage: 'tr',
      templateComponents: '[{',
    }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(NodeOperationError)
    expect(server.requests).toHaveLength(0)
  })

  it('Post Status to selected numbers sends the list and text options', async () => {
    server.on('POST', '/message/sendStatus/Klinik', { status: 201, body: { key: { id: 's1' } } })
    await run({
      resource: 'message',
      operation: 'sendStatus',
      statusType: 'text',
      statusContent: 'Bugün 20:00’ye kadar açığız',
      statusAudience: 'list',
      statusNumbers: '905321788329, 905551112233',
      statusOptions: { backgroundColor: '#008000', font: 2 },
    })
    expect(server.last().body).toEqual({
      type: 'text',
      content: 'Bugün 20:00’ye kadar açığız',
      statusJidList: ['905321788329', '905551112233'],
      backgroundColor: '#008000',
      font: 2,
    })
  })

  it('Delete for Everyone sends the key without an empty participant', async () => {
    server.on('DELETE', '/chat/deleteMessageForEveryone/Klinik', { body: { deleted: true } })
    await run({ resource: 'message', operation: 'deleteForEveryone', messageKey: { ...key, participant: '' } })
    expect(server.last().body).toEqual(key)
  })

  it('Edit Message derives the number from the key', async () => {
    server.on('POST', '/chat/updateMessage/Klinik', { body: { edited: true } })
    await run({ resource: 'message', operation: 'editMessage', messageKey: JSON.stringify(key), editText: 'Saat 15:00' })
    expect(server.last().body).toEqual({ number: '905321788329', key, text: 'Saat 15:00' })
  })

  it('Download Media uses the event instance and message', async () => {
    server.on('POST', '/chat/getBase64FromMediaMessage/Sube%202', { body: { base64: 'AA', mimetype: 'image/jpeg' } })
    const message = { imageMessage: { url: 'https://mmg/x' } }
    const [items] = await run({
      resource: 'message',
      operation: 'downloadMedia',
      mediaEvent: { instance: 'Sube 2', data: { key, message } },
    })
    expect(items[0].json).toEqual({ base64: 'AA', mimetype: 'image/jpeg' })
    expect(server.last().body).toEqual({ message: { key, message }, convertToMp4: false })
  })

  it('Download Media on an event without media is rejected', async () => {
    const error = await run({ resource: 'message', operation: 'downloadMedia', mediaEvent: { data: { key } } }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(NodeOperationError)
  })
})

describe('Chat resource', () => {
  it('Check WhatsApp Numbers returns one item per number and drops duplicates and +', async () => {
    server.on('POST', '/chat/whatsappNumbers/Klinik', {
      body: [
        { jid: '905321788329@s.whatsapp.net', exists: true, number: '905321788329' },
        { jid: '905551112233@s.whatsapp.net', exists: false, number: '905551112233' },
      ],
    })
    const [items] = await run({ resource: 'chat', operation: 'checkNumbers', checkNumbers: '+905321788329, 905551112233,905321788329' })
    expect(server.last().body).toEqual({ numbers: ['905321788329', '905551112233'] })
    expect(items.map((item) => item.json.exists)).toEqual([true, false])
  })

  it('Get Many Messages returns records with page info', async () => {
    server.on('POST', '/chat/findMessages/Klinik', {
      body: { messages: { total: 30, pages: 2, currentPage: 2, records: [{ id: 'a' }, { id: 'b' }] } },
    })
    const [items] = await run({
      resource: 'chat',
      operation: 'findMessages',
      remoteJid: key.remoteJid,
      messageLimit: 25,
      messagePage: 2,
    })
    expect(server.last().body).toEqual({ where: { key: { remoteJid: key.remoteJid } }, offset: 25, page: 2 })
    expect(items.map((item) => item.json.id)).toEqual(['a', 'b'])
    expect(items[0].json._page).toEqual({ total: 30, pages: 2, currentPage: 2 })
  })

  it('Get Chat sends remoteJid as query; empty remoteJid stops early', async () => {
    server.on('GET', '/chat/findChatByRemoteJid/Klinik', { body: { remoteJid: key.remoteJid, unreadMessages: 1 } })
    const [items] = await run({ resource: 'chat', operation: 'findChat', remoteJid: key.remoteJid })
    expect(server.last().query).toEqual({ remoteJid: key.remoteJid })
    expect(items[0].json.unreadMessages).toBe(1)

    server.reset()
    await expect(run({ resource: 'chat', operation: 'findChat', remoteJid: '' })).rejects.toBeInstanceOf(NodeOperationError)
    expect(server.requests).toHaveLength(0)
  })

  it('Get Many Contacts sends only filled filters', async () => {
    server.on('POST', '/chat/findContacts/Klinik', { body: [{ remoteJid: key.remoteJid }] })
    await run({ resource: 'chat', operation: 'findContacts', contactFilters: { pushName: ' Ayşe ', remoteJid: '' } })
    expect(server.last().body).toEqual({ where: { pushName: 'Ayşe' } })
  })

  it('Get Many Chats returns one item per chat', async () => {
    server.on('POST', '/chat/findChats/Klinik', { body: [{ remoteJid: 'a' }, { remoteJid: 'b' }] })
    const [items] = await run({ resource: 'chat', operation: 'findChats' })
    expect(items).toHaveLength(2)
  })

  it('Get Profile Picture and Block send the number', async () => {
    server.on('POST', '/chat/fetchProfilePictureUrl/Klinik', { body: { wuid: key.remoteJid, profilePictureUrl: null } })
    server.on('POST', '/chat/updateBlockStatus/Klinik', { body: { accepted: true } })
    const [picture] = await run({ resource: 'chat', operation: 'fetchProfilePicture', chatNumber: '905321788329' })
    expect(picture[0].json.profilePictureUrl).toBeNull()
    await run({ resource: 'chat', operation: 'updateBlockStatus', chatNumber: '905321788329', blockStatus: 'unblock' })
    expect(server.last().body).toEqual({ number: '905321788329', status: 'unblock' })
  })

  it('Archive and Mark as Unread use the last message key', async () => {
    server.on('POST', '/chat/archiveChat/Klinik', { body: { chatId: key.remoteJid, archived: true } })
    server.on('POST', '/chat/markChatUnread/Klinik', { body: { chatId: key.remoteJid, markedChatUnread: true } })
    await run({ resource: 'chat', operation: 'archiveChat', lastMessageKey: key, archive: false })
    expect(server.last().body).toEqual({ chat: key.remoteJid, lastMessage: { key }, archive: false })
    await run({ resource: 'chat', operation: 'markChatUnread', lastMessageKey: key })
    expect(server.last().body).toEqual({ chat: key.remoteJid, lastMessage: { key } })
  })
})

describe('Session resource', () => {
  it('Get Many lists sessions without a selected session', async () => {
    server.on('GET', '/instance/fetchInstances', { body: [{ name: 'Klinik', connectionStatus: 'open' }, { name: 'Sube', connectionStatus: 'close' }] })
    const context = executeContext(server.baseUrl, { resource: 'session', operation: 'listSessions' })
    const [items] = await node.execute.call(context)
    expect(items.map((item) => item.json.name)).toEqual(['Klinik', 'Sube'])
  })

  it('Get Connection State flattens the instance with the reconnect state', async () => {
    const reconnect = { phase: 'awaiting_qr', attempt: 3, maxAttempts: 3, nextAttemptAt: null }
    server.on('GET', '/instance/connectionState/Klinik', {
      body: { instance: { instanceName: 'Klinik', state: 'close', source: 'database', reconnect }, warmup: null },
    })
    const [items] = await run({ resource: 'session', operation: 'getConnectionState' })
    expect(items[0].json).toEqual({ instanceName: 'Klinik', state: 'close', source: 'database', reconnect, warmup: null })
  })

  it('Restart posts to the restart endpoint', async () => {
    server.on('POST', '/instance/restart/Klinik', { body: { instance: { instanceName: 'Klinik', state: 'connecting' } } })
    const [items] = await run({ resource: 'session', operation: 'restart' })
    expect(server.last().method).toBe('POST')
    expect(items[0].json).toEqual({ instance: { instanceName: 'Klinik', state: 'connecting' } })
  })
})

import { NodeApiError, NodeOperationError } from 'n8n-workflow'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { Wafixer } from '../nodes/Wafixer/Wafixer.node'
import { startFakeServer, type FakeServer } from '../../wafixer-sdk/src/__tests__/support/fake-server'
import { lead, leadForm, metaComment, metaPost } from '../../wafixer-sdk/src/__tests__/support/fixtures'
import { executeContext } from './support/context'

let server: FakeServer
const node = new Wafixer()

beforeAll(async () => {
  server = await startFakeServer()
})
afterAll(() => server.close())
beforeEach(() => server.reset())

function run(params: Record<string, unknown>, options: { items?: number; continueOnFail?: boolean } = {}) {
  return node.execute.call(executeContext(server.baseUrl, { instance: 'Klinik', ...params }, options))
}

const comment = (id: string) => ({ ...metaComment, id })

describe('Comment resource', () => {
  it('Get Many pages with the cursor up to the limit and attaches the post', async () => {
    server.on('POST', '/comment/find/Klinik', ({ body }) => {
      const cursor = (body as { cursor?: string }).cursor
      return cursor
        ? { body: { comments: [comment('3_3'), comment('4_4')], posts: [metaPost], nextCursor: null } }
        : { body: { comments: [comment('1_1'), comment('2_2')], posts: [metaPost], nextCursor: 'c_2' } }
    })
    const [items] = await run({
      resource: 'comment',
      operation: 'getAll',
      returnAll: false,
      limit: 3,
      filters: { unread: true, postId: ' 111_222 ' },
    })
    expect(items.map((item) => item.json.id)).toEqual(['1_1', '2_2', '3_3'])
    expect(items[0].json.post).toMatchObject({ permalink: 'https://facebook.com/111_222' })
    expect(items[0].pairedItem).toEqual({ item: 0 })
    expect(server.requests.map((r) => r.body)).toEqual([
      { unread: true, postId: '111_222', limit: 3 },
      { unread: true, postId: '111_222', limit: 1, cursor: 'c_2' },
    ])
  })

  it('Return All follows the cursor to the last page', async () => {
    let calls = 0
    server.on('POST', '/comment/find/Klinik', () => {
      calls += 1
      return { body: { comments: [comment(`${calls}_0`)], posts: [], nextCursor: calls < 3 ? `c_${calls}` : null } }
    })
    const [items] = await run({ resource: 'comment', operation: 'getAll', returnAll: true })
    expect(items).toHaveLength(3)
    expect(server.requests.every((r) => (r.body as { limit: number }).limit === 100)).toBe(true)
  })

  it('Reply posts the text to the comment', async () => {
    server.on('POST', '/comment/reply/Klinik/222_333', {
      status: 201,
      body: { reply: comment('222_999'), inReplyTo: '222_333' },
    })
    const [items] = await run({ resource: 'comment', operation: 'reply', commentId: '222_333', text: 'Teşekkürler' })
    expect(items[0].json.inReplyTo).toBe('222_333')
    expect(server.last().body).toEqual({ text: 'Teşekkürler' })
  })

  it('Reply without a comment id stops before calling the API', async () => {
    await expect(run({ resource: 'comment', operation: 'reply', commentId: '', text: 'x' })).rejects.toBeInstanceOf(
      NodeOperationError,
    )
    expect(server.requests).toHaveLength(0)
  })

  it('Mark as Read sends comment ids, a post or all', async () => {
    server.on('POST', '/comment/markRead/Klinik', { body: { updated: 2 } })
    await run({ resource: 'comment', operation: 'markRead', markTarget: 'commentIds', commentIds: '1_1, 2_2,' })
    expect(server.last().body).toEqual({ commentIds: ['1_1', '2_2'] })
    await run({ resource: 'comment', operation: 'markRead', markTarget: 'post', postId: '111_222' })
    expect(server.last().body).toEqual({ postId: '111_222' })
    await run({ resource: 'comment', operation: 'markRead', markTarget: 'all' })
    expect(server.last().body).toEqual({ all: true })
  })

  it('Import sends post id and limit', async () => {
    server.on('POST', '/comment/import/Klinik', {
      body: { platform: 'FACEBOOK', postId: '111_222', imported: 5, updated: 0, seen: 5, truncated: false, post: metaPost },
    })
    const [items] = await run({ resource: 'comment', operation: 'import', importPostId: '111_222', importLimit: 300 })
    expect(items[0].json.imported).toBe(5)
    expect(server.last().body).toEqual({ postId: '111_222', limit: 300 })
  })
})

describe('Lead resource', () => {
  it('Get Many sends filters as query and returns one item per lead', async () => {
    server.on('GET', '/leads/items/Klinik', { body: { leads: [lead, { ...lead, id: 'lead_2' }], nextCursor: null } })
    const [items] = await run({
      resource: 'lead',
      operation: 'getAll',
      returnAll: true,
      filters: { status: ['new', 'contacted'], unread: true, formId: '7001', updatedSince: '2026-10-01T00:00:00' },
    })
    expect(items.map((item) => item.json.id)).toEqual(['lead_1', 'lead_2'])
    expect(server.last().query).toEqual({
      status: 'new,contacted',
      unread: 'true',
      formId: '7001',
      updatedSince: '2026-10-01T00:00:00',
      limit: '100',
    })
  })

  it('Get reads one lead', async () => {
    server.on('GET', '/leads/items/Klinik/lead_1', { body: lead })
    const [items] = await run({ resource: 'lead', operation: 'get', leadId: 'lead_1' })
    expect(items[0].json.email).toBe('deneme@example.com')
  })

  it('Update sends only the chosen fields; empty note clears it', async () => {
    server.on('PATCH', '/leads/items/Klinik/lead_1', ({ body }) => ({ body: { ...lead, ...(body as object) } }))
    await run({ resource: 'lead', operation: 'update', leadId: 'lead_1', updateFields: { status: 'qualified', note: '' } })
    expect(server.last().body).toEqual({ status: 'qualified', note: null })
  })

  it('Update without fields is rejected before calling the API', async () => {
    await expect(run({ resource: 'lead', operation: 'update', leadId: 'lead_1', updateFields: {} })).rejects.toBeInstanceOf(
      NodeOperationError,
    )
    expect(server.requests).toHaveLength(0)
  })

  it('Get Forms lists stored forms or syncs them from Meta', async () => {
    server.on('GET', '/leads/forms/Klinik', { body: { forms: [leadForm] } })
    server.on('POST', '/leads/forms/Klinik/sync', { body: { forms: [leadForm, { ...leadForm, formId: '7002' }] } })

    const [stored] = await run({ resource: 'lead', operation: 'getForms', formOptions: { pageId: 'PAGE_ID_TEST' } })
    expect(stored).toHaveLength(1)
    expect(server.last()).toMatchObject({ method: 'GET', query: { pageId: 'PAGE_ID_TEST' } })

    const [synced] = await run({ resource: 'lead', operation: 'getForms', formOptions: { sync: true } })
    expect(synced.map((item) => item.json.formId)).toEqual(['7001', '7002'])
    expect(server.last()).toMatchObject({ method: 'POST', body: {} })
  })
})

describe('Message resource with Messenger/Instagram', () => {
  const windowClosed = {
    status: 422,
    body: {
      error: '24 saatlik mesajlaşma penceresi kapalı.',
      code: 'WINDOW_CLOSED',
      details: { humanAgentAvailable: true, windowExpires: '2026-10-02T22:55:34.000Z', humanAgentExpires: '2026-10-08T22:55:34.000Z' },
    },
  }

  it('Send Text without resource parameter still works (existing workflows)', async () => {
    server.on('POST', '/message/sendText/Klinik', { status: 201, body: { key: { id: 'm_1' } } })
    const [items] = await run({ operation: 'sendText', number: '905321788329', text: 'Merhaba' })
    expect(items[0].json).toEqual({ key: { id: 'm_1' } })
    expect(server.last().body).toEqual({ number: '905321788329', text: 'Merhaba' })
  })

  it('Send Text passes human agent and quick replies', async () => {
    server.on('POST', '/message/sendText/Klinik', { status: 201, body: { key: { id: 'm_2' } } })
    await run({
      resource: 'message',
      operation: 'sendText',
      number: 'PSID_TEST_1',
      text: 'Size nasıl yardımcı olabilirim?',
      metaOptions: {
        humanAgent: true,
        quickReplies: {
          reply: [
            { title: 'Fiyat bilgisi', payload: 'fiyat', type: 'text' },
            { title: 'E-posta', payload: '', type: 'user_email' },
            { title: '  ', payload: 'bos' },
          ],
        },
      },
    })
    expect(server.last().body).toEqual({
      number: 'PSID_TEST_1',
      text: 'Size nasıl yardımcı olabilirim?',
      humanAgent: true,
      quickReplies: [
        { title: 'Fiyat bilgisi', payload: 'fiyat' },
        { title: 'E-posta', type: 'user_email' },
      ],
    })
  })

  it('WINDOW_CLOSED becomes a NodeApiError that tells about the human agent window', async () => {
    server.on('POST', '/message/sendText/Klinik', windowClosed)
    const error = await run({ operation: 'sendText', number: 'PSID_TEST_1', text: 'Merhaba' }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(NodeApiError)
    if (!(error instanceof NodeApiError)) throw error
    expect(error.message).toBe('24 saatlik mesajlaşma penceresi kapalı.')
    expect(error.httpCode).toBe('422')
    expect(error.description).toContain('Human Agent')
    expect(error.description).toContain('2026-10-08T22:55:34.000Z')
  })

  it('continueOnFail returns code and details as output', async () => {
    server.on('POST', '/message/sendText/Klinik', windowClosed)
    const [items] = await run({ operation: 'sendText', number: 'PSID_TEST_1', text: 'Merhaba' }, { continueOnFail: true })
    expect(items[0].json).toMatchObject({ error: '24 saatlik mesajlaşma penceresi kapalı.', code: 'WINDOW_CLOSED', status: 422 })
    expect(items[0].json.details).toMatchObject({ humanAgentAvailable: true })
  })

  it('UNSUPPORTED_ON_CHANNEL error names the channel limitation', async () => {
    server.on('POST', '/message/sendList/Klinik', {
      status: 400,
      body: { error: 'Bu işlem Messenger/Instagram kanalında desteklenmiyor.', code: 'UNSUPPORTED_ON_CHANNEL', details: { operation: 'listMessage' } },
    })
    const error = await run({
      operation: 'sendList',
      number: 'PSID_TEST_1',
      listTitle: 't',
      listButtonText: 'b',
      listSections: [],
    }).catch((e: unknown) => e)
    if (!(error instanceof NodeApiError)) throw error
    expect(error.description).toContain('not available on the channel')
  })
})

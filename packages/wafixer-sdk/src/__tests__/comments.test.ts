import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Wafixer } from '../client'
import type { CommentReceivedEvent } from '../types/events'
import { startFakeServer, type FakeServer } from './support/fake-server'
import { metaComment, metaPost } from './support/fixtures'

let server: FakeServer
let wa: Wafixer

beforeAll(async () => {
  server = await startFakeServer()
  wa = new Wafixer({ baseUrl: server.baseUrl, apiKey: 'test-key' })
})
afterAll(() => server.close())
beforeEach(() => server.reset())

describe('comment resource', () => {
  it('status reads permissions and subscription state', async () => {
    const status = {
      platform: 'FACEBOOK',
      accountId: 'PAGE_ID_TEST',
      enabled: false,
      credentialStatus: 'ACTIVE',
      missingScopes: ['pages_manage_engagement'],
      storageReady: true,
      subscription: { object: 'page', field: 'feed', level: 'page', active: false },
    }
    server.on('GET', '/comment/status/TestSayfa', { body: status })
    await expect(wa.comment.status('TestSayfa')).resolves.toEqual(status)
  })

  it('find posts filters in the body so the panel proxy keeps them', async () => {
    const page = { comments: [metaComment], posts: [metaPost], nextCursor: 'c_2' }
    server.on('POST', '/comment/find/TestSayfa', { body: page })
    const filter = { unread: true, postId: '111_222', limit: 20, cursor: 'c_1' }
    await expect(wa.comment.find('TestSayfa', filter)).resolves.toEqual(page)
    expect(server.last()).toMatchObject({ method: 'POST', body: filter, query: {} })
  })

  it('find without filter sends an empty object', async () => {
    server.on('POST', '/comment/find/TestSayfa', { body: { comments: [], posts: [], nextCursor: null } })
    await wa.comment.find('TestSayfa')
    expect(server.last().body).toEqual({})
  })

  it('detail returns the thread', async () => {
    const thread = { comment: metaComment, post: metaPost, parent: null, replies: [] }
    server.on('GET', '/comment/detail/TestSayfa/222_333', { body: thread })
    await expect(wa.comment.detail('TestSayfa', '222_333')).resolves.toEqual(thread)
  })

  it('reply posts the public answer', async () => {
    const reply = { ...metaComment, id: '222_999', parentId: '222_333', fromOwner: true, sentByApi: true }
    server.on('POST', '/comment/reply/TestSayfa/222_333', { status: 201, body: { reply, inReplyTo: '222_333' } })
    const result = await wa.comment.reply('TestSayfa', '222_333', { text: 'Hemen dönüş yapıyoruz' })
    expect(result.reply.sentByApi).toBe(true)
    expect(server.last().body).toEqual({ text: 'Hemen dönüş yapıyoruz' })
  })

  it('replyToEvent answers the comment from a comment.received event', async () => {
    server.on('POST', '/comment/reply/TestSayfa/222_333', {
      status: 201,
      body: { reply: { ...metaComment, id: '222_999' }, inReplyTo: '222_333' },
    })
    const event: CommentReceivedEvent = {
      event: 'comment.received',
      instance: 'TestSayfa',
      channel: 'MESSENGER',
      data: { comment: metaComment, post: metaPost },
      destination: 'https://istemci.example/webhook',
      date_time: '2026-10-04T09:30:01.000Z',
      sender: 'PAGE_ID_TEST@messenger',
      server_url: 'https://wafixer.com',
      apikey: null,
    }
    await wa.comment.replyToEvent(event, { text: 'Teşekkürler' })
    expect(server.last().path).toBe('/comment/reply/TestSayfa/222_333')
  })

  it('markRead and import post their bodies', async () => {
    server.on('POST', '/comment/markRead/TestSayfa', { body: { updated: 3 } })
    server.on('POST', '/comment/import/TestSayfa', {
      body: { platform: 'FACEBOOK', postId: '111_222', imported: 10, updated: 2, seen: 12, truncated: false, post: metaPost },
    })

    await expect(wa.comment.markRead('TestSayfa', { commentIds: ['222_333'] })).resolves.toEqual({ updated: 3 })
    expect(server.last().body).toEqual({ commentIds: ['222_333'] })

    await expect(wa.comment.markRead('TestSayfa', { all: true })).resolves.toEqual({ updated: 3 })
    expect(server.last().body).toEqual({ all: true })

    const imported = await wa.comment.import('TestSayfa', { postId: '111_222', limit: 500 })
    expect(imported.imported).toBe(10)
    expect(server.last().body).toEqual({ postId: '111_222', limit: 500 })
  })

  it('encodes instance and comment ids', async () => {
    const path = `/comment/detail/${encodeURIComponent('Satış Sayfası')}/${encodeURIComponent('1/2')}`
    server.on('GET', path, { body: { comment: metaComment, post: null, parent: null, replies: [] } })
    await wa.comment.detail('Satış Sayfası', '1/2')
    expect(server.last().path).toBe(path)
  })
})

describe('comment moderation', () => {
  it('hide hides or shows a comment', async () => {
    server.on('POST', '/comment/hide/TestSayfa/222_333', ({ body }) => ({
      body: { comment: { ...metaComment, hidden: (body as { hidden: boolean }).hidden }, changed: true },
    }))
    const hidden = await wa.comment.hide('TestSayfa', '222_333', { hidden: true })
    expect(hidden).toMatchObject({ changed: true, comment: { hidden: true } })
    expect(server.last()).toMatchObject({ method: 'POST', body: { hidden: true } })

    const shown = await wa.comment.hide('TestSayfa', '222_333', { hidden: false })
    expect(shown.comment.hidden).toBe(false)
    expect(server.last().body).toEqual({ hidden: false })
  })

  it('delete removes the comment on Meta', async () => {
    const removed = { ...metaComment, status: 'removed' as const, removedAt: '2026-10-04T10:00:00.000Z' }
    server.on('DELETE', '/comment/delete/TestSayfa/222_333', { body: { comment: removed, changed: true } })
    const result = await wa.comment.delete('TestSayfa', '222_333')
    expect(result.comment.status).toBe('removed')
    expect(server.last()).toMatchObject({ method: 'DELETE', path: '/comment/delete/TestSayfa/222_333' })
  })

  it('privateReply sends a DM to the comment author', async () => {
    const message = { id: 'm_PRIVATE_1', remoteJid: 'PSID_TEST_1@messenger', text: 'Detayları buradan iletiyoruz', timestamp: 1790000500 }
    server.on('POST', '/comment/privateReply/TestSayfa/222_333', {
      status: 201,
      body: { comment: { ...metaComment, privateReplyAt: '2026-10-04T10:00:00.000Z' }, message },
    })
    const result = await wa.comment.privateReply('TestSayfa', '222_333', { text: 'Detayları buradan iletiyoruz' })
    expect(result.message).toEqual(message)
    expect(result.comment.privateReplyAt).toBe('2026-10-04T10:00:00.000Z')
    expect(server.last().body).toEqual({ text: 'Detayları buradan iletiyoruz' })
  })

  it('privateReplyToEvent answers the author of a comment event', async () => {
    server.on('POST', '/comment/privateReply/TestSayfa/222_333', {
      status: 201,
      body: { comment: metaComment, message: { id: 'm_2', remoteJid: null, text: 'Merhaba', timestamp: 1790000600 } },
    })
    await wa.comment.privateReplyToEvent({ instance: 'TestSayfa', data: { comment: metaComment } }, { text: 'Merhaba' })
    expect(server.last().path).toBe('/comment/privateReply/TestSayfa/222_333')
  })
})

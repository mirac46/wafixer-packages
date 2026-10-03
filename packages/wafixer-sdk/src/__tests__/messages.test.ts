import { describe, expect, it, vi } from 'vitest'
import axios, { type AxiosInstance } from 'axios'
import { Wafixer } from '../client'

function makeMockHttp() {
  const requestFn = vi.fn()
  const http = {
    request: requestFn,
    defaults: { baseURL: 'http://test', headers: {} },
  } as unknown as AxiosInstance
  return { http, requestFn }
}

function makeClient() {
  const { http, requestFn } = makeMockHttp()
  requestFn.mockResolvedValue({ data: { ok: true } })
  const wa = new Wafixer({ baseUrl: 'http://test', apiKey: 'k', http })
  return { wa, requestFn }
}

describe('Wafixer client', () => {
  it('throws when baseUrl missing', () => {
    expect(() => new Wafixer({ baseUrl: '', apiKey: 'k' })).toThrow(/baseUrl/)
  })

  it('throws when apiKey missing', () => {
    expect(() => new Wafixer({ baseUrl: 'http://x', apiKey: '' })).toThrow(/apiKey/)
  })

  it('strips trailing slash from baseUrl when default http used', () => {
    const wa = new Wafixer({ baseUrl: 'http://test/', apiKey: 'k' })
    expect(wa.http.defaults.baseURL).toBe('http://test')
  })
})

describe('Messages resource', () => {
  it('sendText posts to /message/sendText/{instance}', async () => {
    const { wa, requestFn } = makeClient()
    await wa.messages.sendText('SatisHatti', { number: '905', text: 'hi' })
    expect(requestFn).toHaveBeenCalledOnce()
    const call = requestFn.mock.calls[0][0]
    expect(call.method).toBe('POST')
    expect(call.url).toBe('/message/sendText/SatisHatti')
    expect(call.data).toEqual({ number: '905', text: 'hi' })
  })

  it('sendMedia posts the right payload', async () => {
    const { wa, requestFn } = makeClient()
    await wa.messages.sendMedia('Inst', {
      number: '905',
      mediatype: 'image',
      media: 'https://example.com/x.jpg',
      caption: 'hello',
    })
    const call = requestFn.mock.calls[0][0]
    expect(call.url).toBe('/message/sendMedia/Inst')
    expect(call.data.mediatype).toBe('image')
    expect(call.data.caption).toBe('hello')
  })

  it('sendAudio uses sendWhatsAppAudio endpoint', async () => {
    const { wa, requestFn } = makeClient()
    await wa.messages.sendAudio('Inst', { number: '905', audio: 'https://x' })
    expect(requestFn.mock.calls[0][0].url).toBe('/message/sendWhatsAppAudio/Inst')
  })

  it('encodes instance name in URL', async () => {
    const { wa, requestFn } = makeClient()
    await wa.messages.sendText('Satış Hattı', { number: '905', text: 'a' })
    expect(requestFn.mock.calls[0][0].url).toBe(
      `/message/sendText/${encodeURIComponent('Satış Hattı')}`,
    )
  })

  it('replyTo extracts number from remoteJid and sets quoted', async () => {
    const { wa, requestFn } = makeClient()
    const event = {
      instance: 'Inst',
      data: {
        key: { remoteJid: '905321788329@s.whatsapp.net', fromMe: false, id: 'abc' },
        message: { conversation: 'incoming' },
        messageTimestamp: 1,
        instanceId: 'iid',
      },
    }
    await wa.messages.replyTo(event as never, { text: 'Tamam' })
    const call = requestFn.mock.calls[0][0]
    expect(call.url).toBe('/message/sendText/Inst')
    expect(call.data.number).toBe('905321788329')
    expect(call.data.text).toBe('Tamam')
    expect(call.data.quoted).toEqual({ key: event.data.key, message: event.data.message })
  })

  it('reactTo passes empty string to remove reaction', async () => {
    const { wa, requestFn } = makeClient()
    const event = {
      instance: 'Inst',
      data: {
        key: { remoteJid: '905@s.whatsapp.net', fromMe: false, id: 'abc' },
        messageTimestamp: 1,
        instanceId: 'iid',
      },
    }
    await wa.messages.reactTo(event as never, '')
    expect(requestFn.mock.calls[0][0].data).toEqual({
      key: event.data.key,
      reaction: '',
    })
  })

  it('sendLocation sends empty name and address when omitted', async () => {
    const { wa, requestFn } = makeClient()
    await wa.messages.sendLocation('Inst', { number: '905', latitude: 41.01, longitude: 28.97 })
    expect(requestFn.mock.calls[0][0]).toEqual({
      method: 'POST',
      url: '/message/sendLocation/Inst',
      data: { number: '905', latitude: 41.01, longitude: 28.97, name: '', address: '' },
    })
  })

  it('sendLocation keeps given name and address', async () => {
    const { wa, requestFn } = makeClient()
    await wa.messages.sendLocation('Inst', {
      number: '905',
      latitude: 41.01,
      longitude: 28.97,
      name: 'Ofis',
      address: 'Kadıköy',
    })
    expect(requestFn.mock.calls[0][0].data).toMatchObject({ name: 'Ofis', address: 'Kadıköy' })
  })

  it('sendList sends empty footerText when omitted', async () => {
    const { wa, requestFn } = makeClient()
    const sections = [{ title: 'Menü', rows: [{ title: 'A', description: 'a', rowId: '1' }] }]
    await wa.messages.sendList('Inst', {
      number: '905',
      title: 'Seçim',
      buttonText: 'Aç',
      sections,
    })
    expect(requestFn.mock.calls[0][0]).toEqual({
      method: 'POST',
      url: '/message/sendList/Inst',
      data: { number: '905', title: 'Seçim', buttonText: 'Aç', sections, footerText: '' },
    })
  })
})

describe('Chat resource', () => {
  it('markEventAsRead wraps single key into readMessages array', async () => {
    const { wa, requestFn } = makeClient()
    const event = {
      instance: 'Inst',
      data: {
        key: { remoteJid: '905@s.whatsapp.net', fromMe: false, id: 'msg-1' },
        messageTimestamp: 1,
        instanceId: 'iid',
      },
    }
    await wa.chat.markEventAsRead(event as never)
    const call = requestFn.mock.calls[0][0]
    expect(call.url).toBe('/chat/markMessageAsRead/Inst')
    expect(call.data.readMessages).toHaveLength(1)
    expect(call.data.readMessages[0].id).toBe('msg-1')
  })

  it('sendPresence posts presence payload', async () => {
    const { wa, requestFn } = makeClient()
    await wa.chat.sendPresence('Inst', {
      number: '905',
      presence: 'composing',
      delay: 1500,
    })
    expect(requestFn.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      url: '/chat/sendPresence/Inst',
      data: { number: '905', presence: 'composing', delay: 1500 },
    })
  })

  it('updatePresence posts to updatePresence endpoint without delay', async () => {
    const { wa, requestFn } = makeClient()
    await wa.chat.updatePresence('Satış Hattı', { number: '905', presence: 'composing' })
    expect(requestFn.mock.calls[0][0]).toEqual({
      method: 'POST',
      url: `/chat/updatePresence/${encodeURIComponent('Satış Hattı')}`,
      data: { number: '905', presence: 'composing' },
    })
  })

  it('updatePresence allows subscribe-only payload', async () => {
    const { wa, requestFn } = makeClient()
    await wa.chat.updatePresence('Inst', { number: '905', subscribe: true })
    expect(requestFn.mock.calls[0][0].data).toEqual({ number: '905', subscribe: true })
  })
})

describe('Error mapping', () => {
  it('maps 401 to WafixerAuthError', async () => {
    const { http } = makeMockHttp()
    ;(http.request as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 401, data: { message: 'apikey hatalı' } },
      message: 'Request failed',
    })
    // Force isAxiosError check to pass
    vi.spyOn(axios, 'isAxiosError').mockReturnValueOnce(true)
    const wa = new Wafixer({ baseUrl: 'http://x', apiKey: 'k', http })
    await expect(wa.messages.sendText('a', { number: '1', text: 't' })).rejects.toThrow(
      /apikey hatalı/,
    )
  })
})

describe('Helpers', () => {
  it('getMessageText extracts conversation', async () => {
    const { getMessageText } = await import('../types/events')
    expect(
      getMessageText({
        key: { remoteJid: '', fromMe: false, id: '' },
        message: { conversation: 'hello' },
        messageTimestamp: 0,
        instanceId: '',
      }),
    ).toBe('hello')
  })

  it('getMessageText extracts extendedTextMessage', async () => {
    const { getMessageText } = await import('../types/events')
    expect(
      getMessageText({
        key: { remoteJid: '', fromMe: false, id: '' },
        message: { extendedTextMessage: { text: 'long' } },
        messageTimestamp: 0,
        instanceId: '',
      }),
    ).toBe('long')
  })

  it('getMessageText returns null when no text', async () => {
    const { getMessageText } = await import('../types/events')
    expect(
      getMessageText({
        key: { remoteJid: '', fromMe: false, id: '' },
        message: {},
        messageTimestamp: 0,
        instanceId: '',
      }),
    ).toBe(null)
  })
})

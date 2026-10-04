import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Wafixer } from '../client'
import { startFakeServer, type FakeServer } from './support/fake-server'
import { lead, leadForm, leadPage } from './support/fixtures'

let server: FakeServer
let wa: Wafixer

beforeAll(async () => {
  server = await startFakeServer()
  wa = new Wafixer({ baseUrl: server.baseUrl, apiKey: 'test-key' })
})
afterAll(() => server.close())
beforeEach(() => server.reset())

describe('leads connection', () => {
  it('config, discover and connect', async () => {
    const config = {
      appId: '123',
      configId: '456',
      graphVersion: 'v25.0',
      scopes: { required: ['leads_retrieval'], optional: ['ads_management'] },
      webhookField: 'leadgen',
      configured: true,
    }
    const discovered = {
      selectionRef: 'sel_1',
      expiresAt: '2026-10-04T10:10:00.000Z',
      pages: [{ pageId: 'PAGE_ID_TEST', pageName: 'Test Sayfa', alreadyConnected: false, connectedHere: false }],
    }
    const connected = { page: leadPage, requeued: 0, forms: { synced: true, count: 1, error: null } }
    server.on('GET', '/leads/config/Klinik', { body: config })
    server.on('POST', '/leads/discover/Klinik', { body: discovered })
    server.on('POST', '/leads/connect/Klinik', { status: 201, body: connected })

    await expect(wa.leads.config('Klinik')).resolves.toEqual(config)
    await expect(wa.leads.discover('Klinik', { userToken: 'EAAB-user-token-0123456789' })).resolves.toEqual(discovered)
    expect(server.last().body).toEqual({ userToken: 'EAAB-user-token-0123456789' })
    await expect(wa.leads.connect('Klinik', { pageId: 'PAGE_ID_TEST', selectionRef: 'sel_1' })).resolves.toEqual(
      connected,
    )
    expect(server.last().body).toEqual({ pageId: 'PAGE_ID_TEST', selectionRef: 'sel_1' })
  })

  it('pages lists and disconnects lead pages', async () => {
    server.on('GET', '/leads/pages/Klinik', { body: { pages: [leadPage] } })
    server.on('DELETE', '/leads/pages/Klinik/PAGE_ID_TEST', { body: { ...leadPage, status: 'REVOKED' } })
    await expect(wa.leads.pages('Klinik')).resolves.toEqual({ pages: [leadPage] })
    const removed = await wa.leads.pages.disconnect('Klinik', 'PAGE_ID_TEST')
    expect(removed.status).toBe('REVOKED')
  })
})

describe('lead forms', () => {
  it('lists forms with optional pageId filter', async () => {
    server.on('GET', '/leads/forms/Klinik', { body: { forms: [leadForm] } })
    await wa.leads.forms('Klinik')
    expect(server.last().query).toEqual({})
    await wa.leads.forms('Klinik', { pageId: 'PAGE_ID_TEST' })
    expect(server.last().query).toEqual({ pageId: 'PAGE_ID_TEST' })
  })

  it('sync and import', async () => {
    server.on('POST', '/leads/forms/Klinik/sync', { body: { forms: [leadForm] } })
    server.on('POST', '/leads/forms/Klinik/7001/import', {
      status: 202,
      body: {
        form: { ...leadForm, import: { ...leadForm.import, status: 'running' } },
        range: { since: '2026-07-06T00:00:00.000Z', until: '2026-10-04T00:00:00.000Z' },
      },
    })

    await wa.leads.forms.sync('Klinik')
    expect(server.last().body).toEqual({})
    await wa.leads.forms.sync('Klinik', { pageId: 'PAGE_ID_TEST' })
    expect(server.last().body).toEqual({ pageId: 'PAGE_ID_TEST' })

    const started = await wa.leads.forms.import('Klinik', '7001', { since: '2026-07-06T00:00:00.000Z' })
    expect(started.form.import.status).toBe('running')
    expect(server.last().body).toEqual({ since: '2026-07-06T00:00:00.000Z' })
  })
})

describe('lead items', () => {
  it('serializes list filters: status array joined, booleans as text', async () => {
    server.on('GET', '/leads/items/Klinik', { body: { leads: [lead], nextCursor: null } })
    const page = await wa.leads.items('Klinik', {
      status: ['new', 'contacted'],
      unread: true,
      formId: '7001',
      updatedSince: '2026-10-01T00:00:00.000Z',
      limit: 25,
    })
    expect(page.leads[0].email).toBe('deneme@example.com')
    expect(server.last().query).toEqual({
      status: 'new,contacted',
      unread: 'true',
      formId: '7001',
      updatedSince: '2026-10-01T00:00:00.000Z',
      limit: '25',
    })
  })

  it('list without filters sends no query string', async () => {
    server.on('GET', '/leads/items/Klinik', { body: { leads: [], nextCursor: null } })
    await wa.leads.items('Klinik')
    expect(server.last().query).toEqual({})
  })

  it('get, update, delete and retry', async () => {
    server.on('GET', '/leads/items/Klinik/lead_1', { body: lead })
    server.on('PATCH', '/leads/items/Klinik/lead_1', ({ body }) => ({ body: { ...lead, ...(body as object) } }))
    server.on('DELETE', '/leads/items/Klinik/lead_1', { body: { id: 'lead_1', deleted: true } })
    server.on('POST', '/leads/items/Klinik/lead_1/retry', { status: 202, body: { ...lead, fetchStatus: 'pending' } })

    await expect(wa.leads.items.get('Klinik', 'lead_1')).resolves.toEqual(lead)

    const updated = await wa.leads.items.update('Klinik', 'lead_1', { status: 'contacted', note: 'Arandı', read: true })
    expect(updated).toMatchObject({ status: 'contacted', note: 'Arandı', read: true })
    expect(server.last()).toMatchObject({ method: 'PATCH', body: { status: 'contacted', note: 'Arandı', read: true } })

    await expect(wa.leads.items.delete('Klinik', 'lead_1')).resolves.toEqual({ id: 'lead_1', deleted: true })

    const retried = await wa.leads.items.retry('Klinik', 'lead_1')
    expect(retried.fetchStatus).toBe('pending')
    expect(server.last()).toMatchObject({ method: 'POST', path: '/leads/items/Klinik/lead_1/retry' })
  })

  it('encodes instance and lead ids', async () => {
    const path = `/leads/items/${encodeURIComponent('Diş Kliniği')}/${encodeURIComponent('a/b')}`
    server.on('GET', path, { body: lead })
    await wa.leads.items.get('Diş Kliniği', 'a/b')
    expect(server.last().path).toBe(path)
  })
})

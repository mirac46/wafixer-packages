import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { Wafixer } from '../client'

function makeClient() {
  const requestFn = vi.fn().mockResolvedValue({ data: { ok: true } })
  const http = {
    request: requestFn,
    defaults: { baseURL: 'http://test', headers: {} },
  } as unknown as AxiosInstance
  const wa = new Wafixer({ baseUrl: 'http://test', apiKey: 'k', http })
  return { wa, requestFn }
}

describe('Instances resource', () => {
  it('lists instances from fetchInstances endpoint', async () => {
    const { wa, requestFn } = makeClient()
    await wa.instances.list()
    expect(requestFn.mock.calls[0][0]).toEqual({
      method: 'GET',
      url: '/instance/fetchInstances',
    })
  })

  it('fetches an instance by name', async () => {
    const { wa, requestFn } = makeClient()
    await wa.instances.get({ instanceName: 'SatisHatti' })
    expect(requestFn.mock.calls[0][0]).toEqual({
      method: 'GET',
      url: '/instance/fetchInstances',
      params: { instanceName: 'SatisHatti' },
    })
  })

  it('checks connection state with encoded instance name', async () => {
    const { wa, requestFn } = makeClient()
    await wa.instances.connectionState('Satış Hattı')
    expect(requestFn.mock.calls[0][0].url).toBe(
      `/instance/connectionState/${encodeURIComponent('Satış Hattı')}`,
    )
  })
})

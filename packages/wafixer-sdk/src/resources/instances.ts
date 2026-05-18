import type { Wafixer } from '../client'
import type {
  WafixerConnectionStateResponse,
  WafixerConnectInstanceResponse,
  WafixerInstance,
} from '../types/instances'

export class Instances {
  constructor(private readonly client: Wafixer) {}

  public async list<T = WafixerInstance[]>(): Promise<T> {
    return this.client.request<T>({
      method: 'GET',
      url: '/instance/fetchInstances',
    })
  }

  public async get<T = WafixerInstance[]>(
    params: { instanceName?: string; instanceId?: string; number?: string } = {},
  ): Promise<T> {
    return this.client.request<T>({
      method: 'GET',
      url: '/instance/fetchInstances',
      params,
    })
  }

  public async connectionState<T = WafixerConnectionStateResponse>(
    instance: string,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'GET',
      url: `/instance/connectionState/${encodeURIComponent(instance)}`,
    })
  }

  public async connect<T = WafixerConnectInstanceResponse>(
    instance: string,
    number?: string,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'GET',
      url: `/instance/connect/${encodeURIComponent(instance)}`,
      params: number ? { number } : undefined,
    })
  }
}

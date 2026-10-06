import type { Wafixer } from '../client'
import type {
  MetaMessagingConfig,
  MetaMessagingConnectRequest,
  MetaMessagingConnectResponse,
  MetaMessagingDiscoverRequest,
  MetaMessagingDiscoverResponse,
  MetaMessagingReconnectRequest,
  MetaMessagingSessionRequest,
  MetaMessagingSessionResponse,
  MetaMessagingStatus,
} from '../types/contracts'
import type {
  WafixerActionResponse,
  WafixerConnectionStateResponse,
  WafixerConnectInstanceResponse,
  WafixerInstance,
} from '../types/instances'

const instancePath = (action: string, instance: string): string =>
  `/instance/${action}/${encodeURIComponent(instance)}`

/**
 * Messenger ve Instagram oturumlarının Meta bağlantısı. Sayfa token'ı sunucuda kalır;
 * yanıtlarda token yoktur.
 */
export class MetaMessaging {
  constructor(private readonly client: Wafixer) {}

  /** Facebook Login for Business için herkese açık yapılandırma (`appId`, `configId`, izinler). */
  public async config(): Promise<MetaMessagingConfig> {
    return this.client.request<MetaMessagingConfig>({ method: 'GET', url: '/instance/metaMessaging/config' })
  }

  /** Kısa ömürlü kullanıcı token'ını doğrular; Sayfaları ve tek kullanımlık `selectionRef`'i döndürür. */
  public async discover(input: MetaMessagingDiscoverRequest): Promise<MetaMessagingDiscoverResponse> {
    return this.client.request<MetaMessagingDiscoverResponse>({
      method: 'POST',
      url: '/instance/metaMessaging/discover',
      data: input,
    })
  }

  /** Seçilen Sayfa/Instagram hesabıyla yeni oturum açar ve webhook aboneliğini kurar. */
  public async connect(input: MetaMessagingConnectRequest): Promise<MetaMessagingConnectResponse> {
    return this.client.request<MetaMessagingConnectResponse>({
      method: 'POST',
      url: '/instance/metaMessaging/connect',
      data: input,
    })
  }

  /** Token'ı yerinde yeniler (yeni `discover` sonucuyla); sohbetler korunur. */
  public async reconnect(instance: string, input: MetaMessagingReconnectRequest): Promise<MetaMessagingStatus> {
    return this.client.request<MetaMessagingStatus>({
      method: 'POST',
      url: instancePath('metaMessaging/reconnect', instance),
      data: input,
    })
  }

  /** Bağlantı durumu: `status`, izinler, abone olunan alanlar, son hata. */
  public async status(instance: string): Promise<MetaMessagingStatus> {
    return this.client.request<MetaMessagingStatus>({ method: 'GET', url: instancePath('metaMessaging', instance) })
  }

  /** Webhook aboneliğini yeniden kurar ve doğrular (`SUBSCRIPTION_LOST` sonrası). */
  public async resubscribe(instance: string): Promise<MetaMessagingStatus> {
    return this.client.request<MetaMessagingStatus>({ method: 'POST', url: instancePath('metaMessaging', instance) })
  }

  /**
   * Bağlantıyı ayırır: Sayfayı kullanan son oturumsa Meta aboneliği kaldırılır, bağlantı
   * `REVOKED` olur; oturum ve sohbetler kalır, `reconnect` ile geri bağlanır. Oturumu tümüyle
   * silmek için `instances.delete`.
   */
  public async disconnect(instance: string): Promise<WafixerActionResponse> {
    return this.client.request<WafixerActionResponse>({ method: 'DELETE', url: instancePath('logout', instance) })
  }
}

export class Instances {
  /** Messenger/Instagram bağlantı durumu, yeniden abonelik, ayırma. */
  public readonly metaMessaging: MetaMessaging

  constructor(private readonly client: Wafixer) {
    this.metaMessaging = new MetaMessaging(client)
  }

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

  /**
   * Barındırılan bağlantı adresi: kullanıcı Messenger/Instagram bağlantısını wafixer panelinde
   * tamamlar, sonra `returnUrl`'e döner. Adres kısa ömürlüdür (`expiresAt`).
   */
  public async metaMessagingSession(input: MetaMessagingSessionRequest): Promise<MetaMessagingSessionResponse> {
    return this.client.request<MetaMessagingSessionResponse>({
      method: 'POST',
      url: '/instance/metaMessagingSession',
      data: input,
    })
  }

  /**
   * Oturumu yeniden başlatır: QR oturumunda soket kapanıp açılır, otomatik yeniden bağlanma sayacı
   * sıfırlanır. Eşlenmemiş oturumda yeni QR üretilir (`qrcode.updated`).
   */
  public async restart<T = unknown>(instance: string): Promise<T> {
    return this.client.request<T>({ method: 'POST', url: instancePath('restart', instance) })
  }

  /** Oturumun bağlantısını kapatır; kapalı oturumda sunucu 400 döner. */
  public async logout(instance: string): Promise<WafixerActionResponse> {
    return this.client.request<WafixerActionResponse>({ method: 'DELETE', url: instancePath('logout', instance) })
  }

  /** Oturumu siler; açıksa önce kapatılır (Messenger/Instagram'da Meta aboneliği de kalkar). */
  public async delete(instance: string): Promise<WafixerActionResponse> {
    return this.client.request<WafixerActionResponse>({ method: 'DELETE', url: instancePath('delete', instance) })
  }
}

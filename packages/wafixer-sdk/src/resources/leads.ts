import type { Wafixer } from '../client'
import type {
  Lead,
  LeadDeleteResponse,
  LeadFormListResponse,
  LeadFormsQuery,
  LeadFormsSyncRequest,
  LeadImportRequest,
  LeadImportResponse,
  LeadListQuery,
  LeadListResponse,
  LeadPage,
  LeadPageListResponse,
  LeadUpdateRequest,
  LeadsConfig,
  LeadsConnectRequest,
  LeadsConnectResponse,
  LeadsDiscoverRequest,
  LeadsDiscoverResponse,
} from '../types/contracts'

/** `leads.pages(instance)` ve `leads.pages.disconnect(instance, pageId)`. */
export interface LeadPagesApi {
  (instance: string): Promise<LeadPageListResponse>
  /** Sayfayı ayırır: token silinir, yalnız `leadgen` aboneliği kalkar; toplanmış lead'ler kalır. */
  disconnect(instance: string, pageId: string): Promise<LeadPage>
}

/** `leads.forms(instance, { pageId })`, `leads.forms.sync(...)`, `leads.forms.import(...)`. */
export interface LeadFormsApi {
  (instance: string, query?: LeadFormsQuery): Promise<LeadFormListResponse>
  /** Formları Meta'dan yeniden okur. */
  sync(instance: string, input?: LeadFormsSyncRequest): Promise<LeadFormListResponse>
  /**
   * Geçmiş lead'leri içe aktarır (varsayılan son 90 gün); arka planda sürer, ilerleme
   * `forms()` yanıtındaki `import` alanında. Aynı form için ikinci istek 409 `IMPORT_IN_PROGRESS`.
   */
  import(instance: string, formId: string, input?: LeadImportRequest): Promise<LeadImportResponse>
}

/** `leads.items(instance, query)` ve tek lead işlemleri. */
export interface LeadItemsApi {
  (instance: string, query?: LeadListQuery): Promise<LeadListResponse>
  get(instance: string, leadId: string): Promise<Lead>
  /** Durum, not, okundu; değişiklik varsa `lead.updated` yayınlanır. */
  update(instance: string, leadId: string, input: LeadUpdateRequest): Promise<Lead>
  /** Kalıcı silme (kişisel veri silme talebi). */
  delete(instance: string, leadId: string): Promise<LeadDeleteResponse>
  /** Çekilemeyen (`failed`/`pending`) lead'i yeniden kuyruğa alır. */
  retry(instance: string, leadId: string): Promise<Lead>
}

function serializeListQuery(query: LeadListQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      if (value.length) params[key] = value.join(',')
    } else if (typeof value === 'boolean') {
      params[key] = String(value)
    } else if (typeof value === 'string' || typeof value === 'number') {
      params[key] = value
    }
  }
  return params
}

/**
 * Facebook Lead Ads. Lead Sayfası bir oturuma bağlanır; formlar, lead'ler ve
 * `lead.received` / `lead.updated` olayları o oturuma aittir.
 *
 *   const { leads, nextCursor } = await wa.leads.items('Klinik', { status: 'new', unread: true })
 *   await wa.leads.items.update('Klinik', leads[0].id, { status: 'contacted', read: true })
 */
export class Leads {
  public readonly pages: LeadPagesApi
  public readonly forms: LeadFormsApi
  public readonly items: LeadItemsApi

  constructor(private readonly client: Wafixer) {
    this.pages = Object.assign((instance: string) => this.listPages(instance), {
      disconnect: (instance: string, pageId: string) => this.disconnectPage(instance, pageId),
    })
    this.forms = Object.assign((instance: string, query?: LeadFormsQuery) => this.listForms(instance, query), {
      sync: (instance: string, input?: LeadFormsSyncRequest) => this.syncForms(instance, input),
      import: (instance: string, formId: string, input?: LeadImportRequest) =>
        this.importForm(instance, formId, input),
    })
    this.items = Object.assign((instance: string, query?: LeadListQuery) => this.listItems(instance, query), {
      get: (instance: string, leadId: string) => this.getItem(instance, leadId),
      update: (instance: string, leadId: string, input: LeadUpdateRequest) => this.updateItem(instance, leadId, input),
      delete: (instance: string, leadId: string) => this.deleteItem(instance, leadId),
      retry: (instance: string, leadId: string) => this.retryItem(instance, leadId),
    })
  }

  private path(section: string, instance: string, ...rest: string[]): string {
    const tail = rest.map((part) => `/${encodeURIComponent(part)}`).join('')
    return `/leads/${section}/${encodeURIComponent(instance)}${tail}`
  }

  /** Lead izinleri ve Facebook Login yapılandırması (sır içermez). */
  public async config(instance: string): Promise<LeadsConfig> {
    return this.client.request<LeadsConfig>({ method: 'GET', url: this.path('config', instance) })
  }

  /** Kullanıcı token'ını doğrular; lead erişimi olan Sayfaları ve `selectionRef`'i döndürür. */
  public async discover(instance: string, input: LeadsDiscoverRequest): Promise<LeadsDiscoverResponse> {
    return this.client.request<LeadsDiscoverResponse>({
      method: 'POST',
      url: this.path('discover', instance),
      data: input,
    })
  }

  /**
   * Sayfayı oturuma bağlar, `leadgen` aboneliğini kurar ve formları eşitler. `selectionRef` yoksa
   * aynı oturumun Messenger bağlantısındaki ya da daha önce bağlanmış Sayfanın token'ı kullanılır.
   */
  public async connect(instance: string, input: LeadsConnectRequest): Promise<LeadsConnectResponse> {
    return this.client.request<LeadsConnectResponse>({
      method: 'POST',
      url: this.path('connect', instance),
      data: input,
    })
  }

  private listPages(instance: string): Promise<LeadPageListResponse> {
    return this.client.request<LeadPageListResponse>({ method: 'GET', url: this.path('pages', instance) })
  }

  private disconnectPage(instance: string, pageId: string): Promise<LeadPage> {
    return this.client.request<LeadPage>({ method: 'DELETE', url: this.path('pages', instance, pageId) })
  }

  private listForms(instance: string, query?: LeadFormsQuery): Promise<LeadFormListResponse> {
    return this.client.request<LeadFormListResponse>({
      method: 'GET',
      url: this.path('forms', instance),
      params: query?.pageId ? { pageId: query.pageId } : undefined,
    })
  }

  private syncForms(instance: string, input: LeadFormsSyncRequest = {}): Promise<LeadFormListResponse> {
    return this.client.request<LeadFormListResponse>({
      method: 'POST',
      url: `${this.path('forms', instance)}/sync`,
      data: input,
    })
  }

  private importForm(instance: string, formId: string, input: LeadImportRequest = {}): Promise<LeadImportResponse> {
    return this.client.request<LeadImportResponse>({
      method: 'POST',
      url: `${this.path('forms', instance, formId)}/import`,
      data: input,
    })
  }

  private listItems(instance: string, query: LeadListQuery = {}): Promise<LeadListResponse> {
    const params = serializeListQuery(query)
    return this.client.request<LeadListResponse>({
      method: 'GET',
      url: this.path('items', instance),
      params: Object.keys(params).length ? params : undefined,
    })
  }

  private getItem(instance: string, leadId: string): Promise<Lead> {
    return this.client.request<Lead>({ method: 'GET', url: this.path('items', instance, leadId) })
  }

  private updateItem(instance: string, leadId: string, input: LeadUpdateRequest): Promise<Lead> {
    return this.client.request<Lead>({ method: 'PATCH', url: this.path('items', instance, leadId), data: input })
  }

  private deleteItem(instance: string, leadId: string): Promise<LeadDeleteResponse> {
    return this.client.request<LeadDeleteResponse>({ method: 'DELETE', url: this.path('items', instance, leadId) })
  }

  private retryItem(instance: string, leadId: string): Promise<Lead> {
    return this.client.request<Lead>({ method: 'POST', url: `${this.path('items', instance, leadId)}/retry` })
  }
}

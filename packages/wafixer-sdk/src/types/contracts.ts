/**
 * Kanal sözleşmesinden (channels-v1 OpenAPI) türetilen tipler. Kaynak `src/generated/channels-v1.ts`
 * üretilir; burada yalnız okunur adlar verilir, alan elle kopyalanmaz.
 */
import type { components, operations } from '../generated/channels-v1'

type Schemas = components['schemas']
type JsonBody<T> = T extends { content: { 'application/json': infer B } } ? B : never

// ────────────────── Kanal ──────────────────

/** `QR`, `META` (WhatsApp Cloud API), `WAFIXER`, `MESSENGER`, `INSTAGRAM`. */
export type WafixerChannel = Schemas['ChannelCode']
export type MetaMessagingChannel = Schemas['MetaMessagingChannel']
export type ChannelErrorCode = Schemas['ChannelErrorCode']
export type ChannelErrorBody = Schemas['ChannelError']
export type ChannelCapabilities = Schemas['ChannelCapabilities']
export type QuickReply = Schemas['QuickReply']
export type SendResponse = Schemas['SendResponse']
export type ReplyWindow = Schemas['ReplyWindow']
export type CredentialStatus = Schemas['CredentialStatus']
export type ConnectionUpdateReason = NonNullable<Schemas['ConnectionUpdateData']['reason']>

// ────────────────── Messenger / Instagram bağlantısı ──────────────────

export type MetaMessagingStatus = Schemas['MetaMessagingStatus']
export type MetaMessagingConfig = Schemas['MetaMessagingConfig']
export type MetaMessagingDiscoverRequest = Schemas['MetaMessagingDiscoverRequest']
export type MetaMessagingDiscoverResponse = Schemas['MetaMessagingDiscoverResponse']
export type DiscoveredPage = Schemas['DiscoveredPage']
export type MetaMessagingConnectRequest = Schemas['MetaMessagingConnectRequest']
export type MetaMessagingConnectResponse = Schemas['MetaMessagingConnectResponse']
export type MetaMessagingReconnectRequest = JsonBody<operations['metaMessagingReconnect']['requestBody']>
export type MetaMessagingSessionRequest = Schemas['MetaMessagingSessionRequest']
export type MetaMessagingSessionResponse = Schemas['MetaMessagingSessionResponse']

// ────────────────── Yorumlar ──────────────────

export type MetaCommentPlatform = Schemas['MetaCommentPlatform']
export type MetaComment = Schemas['MetaComment']
export type MetaPost = Schemas['MetaPost']
export type MetaCommentListRequest = Schemas['MetaCommentListRequest']
export type MetaCommentListResponse = Schemas['MetaCommentListResponse']
export type MetaCommentThread = Schemas['MetaCommentThread']
export type MetaCommentReplyRequest = Schemas['MetaCommentReplyRequest']
export type MetaCommentReplyResponse = Schemas['MetaCommentReplyResponse']
export type MetaCommentMarkReadRequest = Schemas['MetaCommentMarkReadRequest']
export type MetaCommentMarkReadResponse = Schemas['MetaCommentMarkReadResponse']
export type MetaCommentImportRequest = Schemas['MetaCommentImportRequest']
export type MetaCommentImportResponse = Schemas['MetaCommentImportResponse']
export type MetaCommentStatus = Schemas['MetaCommentStatus']
export type MetaCommentEventData = Schemas['MetaCommentEventData']
export type MetaCommentReplyEventData = Schemas['MetaCommentReplyEventData']

// ────────────────── Facebook Lead Ads ──────────────────

export type LeadErrorCode = Schemas['LeadErrorCode']
export type LeadStatus = Schemas['LeadStatus']
export type LeadFetchStatus = Schemas['LeadFetchStatus']
export type LeadPageStatus = Schemas['LeadPageStatus']
export type LeadField = Schemas['LeadField']
export type Lead = Schemas['Lead']
export type LeadListResponse = Schemas['LeadListResponse']
export type LeadUpdateRequest = Schemas['LeadUpdateRequest']
export type LeadForm = Schemas['LeadForm']
export type LeadFormListResponse = Schemas['LeadFormListResponse']
export type LeadPage = Schemas['LeadPage']
export type LeadPageListResponse = Schemas['LeadPageListResponse']
export type LeadsConfig = Schemas['LeadsConfig']
export type LeadsDiscoverRequest = Schemas['LeadsDiscoverRequest']
export type LeadsDiscoverResponse = Schemas['LeadsDiscoverResponse']
export type LeadsConnectRequest = Schemas['LeadsConnectRequest']
export type LeadsConnectResponse = Schemas['LeadsConnectResponse']
export type LeadImportRequest = Schemas['LeadImportRequest']
export type LeadImportResponse = Schemas['LeadImportResponse']
export type LeadEventData = Schemas['LeadEventData']
export type LeadWebhookEnvelope = Schemas['LeadWebhookEnvelope']
export type LeadFormsQuery = NonNullable<operations['leadsForms']['parameters']['query']>
export type LeadFormsSyncRequest = JsonBody<NonNullable<operations['leadsFormsSync']['requestBody']>>
export type LeadDeleteResponse = JsonBody<operations['leadsDelete']['responses'][200]>

type GeneratedLeadListQuery = NonNullable<operations['leadsList']['parameters']['query']>

/**
 * `GET /leads/items/{instance}` süzgeçleri. Belgede sorgu dizesi olarak tanımlı alanlar burada
 * tiplidir: `status` dizi olabilir (virgülle birleştirilir), `unread` boolean.
 */
export type LeadListQuery = Omit<GeneratedLeadListQuery, 'status' | 'fetchStatus' | 'unread'> & {
  status?: LeadStatus | LeadStatus[]
  fetchStatus?: LeadFetchStatus
  unread?: boolean
}

/**
 * wafixer-sdk
 *
 *   import { Wafixer } from 'wafixer-sdk'
 *
 *   const wa = new Wafixer({ baseUrl: 'https://wafixer.com', apiKey: '...' })
 *   await wa.messages.sendText('SatisHatti', { number: '905...', text: 'Merhaba' })
 */

// Client
export { Wafixer, type WafixerClientConfig } from './client'

// Resources (sınıf tipleri için)
export { Messages } from './resources/messages'
export { Chat } from './resources/chat'
export { Instances, MetaMessaging } from './resources/instances'
export { Comments } from './resources/comments'
export { Leads, type LeadPagesApi, type LeadFormsApi, type LeadItemsApi } from './resources/leads'
export {
  Webhook,
  type WebhookSetInput,
  type WebhookSettings,
  type WebhookSigningSecret,
} from './resources/webhook'

// Errors
export {
  WafixerError,
  WafixerAuthError,
  WafixerPermissionError,
  WafixerNotFoundError,
  WafixerValidationError,
  WafixerUnsupportedChannelError,
  WafixerWindowClosedError,
  WafixerConflictError,
  WafixerChannelAuthError,
  WafixerRateLimitError,
  WafixerUnavailableError,
  toWafixerError,
  readErrorBody,
  parseRetryAfter,
  type WafixerErrorCode,
  type WafixerErrorOptions,
  type ApiErrorInput,
} from './errors'

// Common types
export type {
  MediaType,
  Presence,
  MessageKey,
  QuotedMessage,
  SendOptions,
  BaseSendInput,
} from './types/common'

// Message input types
export type {
  SendTextInput,
  SendMediaInput,
  SendAudioInput,
  SendPtvInput,
  SendStickerInput,
  SendLocationInput,
  ContactCard,
  SendContactInput,
  SendReactionInput,
  SendPollInput,
  Button,
  ButtonType,
  KeyType,
  SendButtonsInput,
  ListRow,
  ListSection,
  SendListInput,
  SendTemplateInput,
  SendStatusInput,
  SendPresenceInput,
  UpdatePresenceInput,
  MarkMessagesAsReadInput,
  DeleteForEveryoneInput,
  UpdateMessageInput,
  ArchiveChatInput,
  MarkChatUnreadInput,
  CheckNumbersInput,
  WhatsAppNumberResult,
  ProfilePictureResponse,
  UpdateBlockStatusInput,
  FindPagination,
  FindContactsInput,
  FindChatsInput,
  FindMessagesInput,
} from './types/messages'

export type {
  WafixerInstanceStatus,
  WafixerInstanceCounts,
  WafixerInstance,
  WafixerConnectionStateResponse,
  WafixerQrCode,
  WafixerConnectInstanceResponse,
  WafixerActionResponse,
} from './types/instances'

// Kanal sözleşmesinden (channels-v1 OpenAPI) türetilen tipler
export type {
  WafixerChannel,
  MetaMessagingChannel,
  ChannelErrorCode,
  ChannelErrorBody,
  ChannelCapabilities,
  QuickReply,
  SendResponse,
  ReplyWindow,
  CredentialStatus,
  ConnectionUpdateReason,
  SessionReconnect,
  MetaMessagingStatus,
  MetaMessagingConfig,
  MetaMessagingDiscoverRequest,
  MetaMessagingDiscoverResponse,
  DiscoveredPage,
  MetaMessagingConnectRequest,
  MetaMessagingConnectResponse,
  MetaMessagingReconnectRequest,
  MetaMessagingSessionRequest,
  MetaMessagingSessionResponse,
  MetaCommentPlatform,
  MetaComment,
  MetaPost,
  MetaCommentListRequest,
  MetaCommentListResponse,
  MetaCommentThread,
  MetaCommentReplyRequest,
  MetaCommentReplyResponse,
  MetaCommentMarkReadRequest,
  MetaCommentMarkReadResponse,
  MetaCommentImportRequest,
  MetaCommentImportResponse,
  MetaCommentStatus,
  MetaCommentEventData,
  MetaCommentReplyEventData,
  MetaCommentRemovalReason,
  MetaCommentHideRequest,
  MetaCommentModerationResponse,
  MetaCommentPrivateReplyRequest,
  MetaCommentPrivateMessage,
  MetaCommentPrivateReplyResponse,
  MetaCommentPrivateReplyEventData,
  LeadErrorCode,
  LeadStatus,
  LeadFetchStatus,
  LeadPageStatus,
  LeadField,
  Lead,
  LeadListResponse,
  LeadListQuery,
  LeadUpdateRequest,
  LeadForm,
  LeadFormListResponse,
  LeadFormsQuery,
  LeadFormsSyncRequest,
  LeadPage,
  LeadPageListResponse,
  LeadsConfig,
  LeadsDiscoverRequest,
  LeadsDiscoverResponse,
  LeadsConnectRequest,
  LeadsConnectResponse,
  LeadImportRequest,
  LeadImportResponse,
  LeadDeleteResponse,
  LeadEventData,
  LeadWebhookEnvelope,
} from './types/contracts'

// Webhook event types
export {
  getMessageText,
  getChannelUserId,
  type AnyWebhookEvent,
  type WebhookEnvelope,
  type WebhookEventName,
  type MessageData,
  type MessagesUpsertEvent,
  type MessagesUpdateEvent,
  type MessagesDeleteEvent,
  type SendMessageEvent,
  type MessagesEditedEvent,
  type SendMessageUpdateEvent,
  type ConnectionData,
  type ConnectionUpdateEvent,
  type QrCodeData,
  type QrCodeUpdatedEvent,
  type InstanceStatusData,
  type InstanceStatusEvent,
  type LogoutInstanceEvent,
  type RemoveInstanceEvent,
  type LabelData,
  type LabelsEditEvent,
  type LabelsAssociationEvent,
  type PresenceData,
  type PresenceUpdateEvent,
  type ContactData,
  type ContactsUpsertEvent,
  type ContactsUpdateEvent,
  type ChatData,
  type ChatsUpsertEvent,
  type ChatsUpdateEvent,
  type ChatsDeleteEvent,
  type CallData,
  type CallEvent,
  type CommentReceivedEvent,
  type CommentUpdatedEvent,
  type CommentRemovedEvent,
  type CommentReplySentEvent,
  type CommentPrivateReplySentEvent,
  type CommentWebhookEvent,
  type LeadReceivedEvent,
  type LeadUpdatedEvent,
  type LeadWebhookEvent,
} from './types/events'

export {
  WEBHOOK_EVENTS,
  COMMENT_EVENTS,
  LEAD_EVENTS,
  webhookEventConstant,
  isWebhookEventConstant,
  isWafixerWebhookEvent,
  isWebhookEvent,
  parseWebhookEvent,
  type WebhookEventConstant,
} from './webhook-events'

export {
  verifyWebhookSignature,
  signWebhookPayload,
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMESTAMP_HEADER,
  DEFAULT_WEBHOOK_TOLERANCE_SECONDS,
  type WebhookSignatureResult,
  type WebhookSignatureFailure,
  type WebhookHeaderSource,
  type VerifyWebhookSignatureOptions,
} from './webhook-signature'

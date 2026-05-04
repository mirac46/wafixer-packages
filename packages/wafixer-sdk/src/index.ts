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

// Errors
export {
  WafixerError,
  WafixerAuthError,
  WafixerNotFoundError,
  WafixerValidationError,
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
  SendPresenceInput,
  MarkMessagesAsReadInput,
  DeleteForEveryoneInput,
  UpdateMessageInput,
  ArchiveChatInput,
  MarkChatUnreadInput,
} from './types/messages'

// Webhook event types
export {
  getMessageText,
  type AnyWebhookEvent,
  type WebhookEnvelope,
  type WebhookEventName,
  type MessageData,
  type MessagesUpsertEvent,
  type MessagesUpdateEvent,
  type MessagesDeleteEvent,
  type SendMessageEvent,
  type ConnectionData,
  type ConnectionUpdateEvent,
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
} from './types/events'

import type { AnyWebhookEvent, WebhookEventName } from './types/events'

/**
 * `POST /webhook/set` olay listesinin kabul ettiği adlar (sunucudaki `EventController.events`).
 * Boş liste sunucuda "hepsi" demektir.
 */
export const WEBHOOK_EVENTS = [
  'APPLICATION_STARTUP',
  'QRCODE_UPDATED',
  'MESSAGES_SET',
  'MESSAGES_UPSERT',
  'MESSAGES_EDITED',
  'MESSAGES_UPDATE',
  'MESSAGES_DELETE',
  'SEND_MESSAGE',
  'SEND_MESSAGE_UPDATE',
  'CONTACTS_SET',
  'CONTACTS_UPSERT',
  'CONTACTS_UPDATE',
  'PRESENCE_UPDATE',
  'CHATS_SET',
  'CHATS_UPSERT',
  'CHATS_UPDATE',
  'CHATS_DELETE',
  'GROUPS_UPSERT',
  'GROUP_UPDATE',
  'GROUP_PARTICIPANTS_UPDATE',
  'CONNECTION_UPDATE',
  'LABELS_EDIT',
  'LABELS_ASSOCIATION',
  'CALL',
  'TYPEBOT_START',
  'TYPEBOT_CHANGE_STATUS',
  'REMOVE_INSTANCE',
  'LOGOUT_INSTANCE',
  'INSTANCE_CREATE',
  'INSTANCE_DELETE',
  'STATUS_INSTANCE',
  'COMMENT_RECEIVED',
  'COMMENT_UPDATED',
  'COMMENT_REMOVED',
  'COMMENT_REPLY_SENT',
  'LEAD_RECEIVED',
  'LEAD_UPDATED',
] as const

export type WebhookEventConstant = (typeof WEBHOOK_EVENTS)[number]

export const COMMENT_EVENTS = [
  'COMMENT_RECEIVED',
  'COMMENT_UPDATED',
  'COMMENT_REMOVED',
  'COMMENT_REPLY_SENT',
] as const satisfies readonly WebhookEventConstant[]

export const LEAD_EVENTS = ['LEAD_RECEIVED', 'LEAD_UPDATED'] as const satisfies readonly WebhookEventConstant[]

// Sunucunun ayar listesi `groups.update` için tekil `GROUP_UPDATE` adını kullanır.
const CONSTANT_ALIASES: Readonly<Record<string, WebhookEventConstant>> = { GROUPS_UPDATE: 'GROUP_UPDATE' }

/** Olay adını (`comment.reply.sent`) ayar listesindeki ada (`COMMENT_REPLY_SENT`) çevirir. */
export function webhookEventConstant(eventName: string): string {
  const constant = eventName.replace(/[.-]/g, '_').toUpperCase()
  return CONSTANT_ALIASES[constant] ?? constant
}

const WEBHOOK_EVENT_SET: ReadonlySet<string> = new Set(WEBHOOK_EVENTS)

/** `webhook/set` bu adı kabul eder mi; listede olmayan ad isteği 400 ile düşürür. */
export function isWebhookEventConstant(value: string): value is WebhookEventConstant {
  return WEBHOOK_EVENT_SET.has(value)
}

const KNOWN_EVENT_NAMES: ReadonlySet<string> = new Set<WebhookEventName>([
  'messages.upsert',
  'messages.update',
  'messages.delete',
  'send.message',
  'connection.update',
  'presence.update',
  'contacts.upsert',
  'contacts.update',
  'chats.upsert',
  'chats.update',
  'chats.delete',
  'call',
  'comment.received',
  'comment.updated',
  'comment.removed',
  'comment.reply.sent',
  'lead.received',
  'lead.updated',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Gövde SDK'nın tiplediği bir olay mı (`event`, `instance`, `data` alanları ve bilinen olay adı). */
export function isWafixerWebhookEvent(payload: unknown): payload is AnyWebhookEvent {
  return (
    isRecord(payload) &&
    typeof payload.event === 'string' &&
    KNOWN_EVENT_NAMES.has(payload.event) &&
    typeof payload.instance === 'string' &&
    payload.data !== undefined &&
    payload.data !== null
  )
}

/** Belirli bir olayı daraltır: `if (isWebhookEvent(body, 'lead.received')) body.data.email`. */
export function isWebhookEvent<TName extends AnyWebhookEvent['event']>(
  payload: unknown,
  name: TName,
): payload is Extract<AnyWebhookEvent, { event: TName }> {
  return isWafixerWebhookEvent(payload) && payload.event === name
}

/** Webhook gövdesini (nesne, JSON metni ya da ham Buffer) tipli olaya çevirir; tanınmazsa `null`. */
export function parseWebhookEvent(body: unknown): AnyWebhookEvent | null {
  let payload = body
  if (typeof body === 'string' || body instanceof Uint8Array) {
    try {
      payload = JSON.parse(typeof body === 'string' ? body : new TextDecoder().decode(body))
    } catch {
      return null
    }
  }
  return isWafixerWebhookEvent(payload) ? payload : null
}

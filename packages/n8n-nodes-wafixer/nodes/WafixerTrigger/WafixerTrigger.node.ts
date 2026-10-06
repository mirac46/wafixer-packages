import type {
  IHookFunctions,
  ILoadOptionsFunctions,
  INodePropertyOptions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow'

import {
  WEBHOOK_EVENTS,
  Wafixer as WafixerClient,
  isWebhookEventConstant,
  webhookEventConstant,
  type WebhookEventConstant,
} from 'wafixer-sdk'
import { wafixerLoadOptions } from '../shared/instanceOptions'

type WafixerCredentials = { baseUrl: string; apiKey: string }

type EventLabel = { name: string; description: string }

/**
 * Her `webhook/set` olayının etiketi. Tip `WEBHOOK_EVENTS`'in tamamını ister: SDK'ya yeni olay
 * eklenince burada etiket yazılmadan derlenmez.
 */
const EVENT_LABELS: Record<WebhookEventConstant, EventLabel> = {
  APPLICATION_STARTUP: { name: 'Server Started', description: 'Application.startup — the WAFixer server started' },
  QRCODE_UPDATED: {
    name: 'QR Code Updated',
    description: 'Qrcode.updated — new QR code for a QR session, or the QR attempt limit was reached',
  },
  MESSAGES_SET: { name: 'Message History Synced', description: 'Messages.set — message history after pairing (large payload)' },
  MESSAGES_UPSERT: { name: 'New Message', description: 'Messages.upsert' },
  MESSAGES_EDITED: { name: 'Message Edited', description: 'Messages.edited — the contact edited a message' },
  MESSAGES_UPDATE: { name: 'Message Status', description: 'Messages.update' },
  MESSAGES_DELETE: { name: 'Message Deleted', description: 'Messages.delete' },
  SEND_MESSAGE: { name: 'Outgoing Message', description: 'Send.message' },
  SEND_MESSAGE_UPDATE: { name: 'Outgoing Message Edited', description: 'Send.message.update — a sent message was edited' },
  CONTACTS_SET: { name: 'Contacts Synced', description: 'Contacts.set — contact list after pairing (large payload)' },
  CONTACTS_UPSERT: { name: 'New Contact', description: 'Contacts.upsert' },
  CONTACTS_UPDATE: { name: 'Contact Update', description: 'Contacts.update' },
  PRESENCE_UPDATE: { name: 'Presence', description: 'Presence.update' },
  CHATS_SET: { name: 'Chats Synced', description: 'Chats.set — chat list after pairing (large payload)' },
  CHATS_UPSERT: { name: 'New Chat', description: 'Chats.upsert' },
  CHATS_UPDATE: { name: 'Chat Update', description: 'Chats.update' },
  CHATS_DELETE: { name: 'Chat Deleted', description: 'Chats.delete' },
  GROUPS_UPSERT: { name: 'Group Created', description: 'Groups.upsert' },
  GROUP_UPDATE: { name: 'Group Updated', description: 'Groups.update' },
  GROUP_PARTICIPANTS_UPDATE: { name: 'Group Participants', description: 'Group-participants.update' },
  CONNECTION_UPDATE: {
    name: 'Connection State',
    description: 'Connection.update — includes data.reconnect for QR sessions that reconnect automatically',
  },
  LABELS_EDIT: { name: 'Label Changed', description: 'Labels.edit — WhatsApp Business label created, changed or deleted' },
  LABELS_ASSOCIATION: { name: 'Label Assigned', description: 'Labels.association — label added to or removed from a chat' },
  CALL: { name: 'Incoming Call', description: 'Call' },
  TYPEBOT_START: { name: 'Typebot Started', description: 'Typebot.start' },
  TYPEBOT_CHANGE_STATUS: { name: 'Typebot Status', description: 'Typebot.change-status' },
  REMOVE_INSTANCE: { name: 'Session Deleted', description: 'Remove.instance — data is null' },
  LOGOUT_INSTANCE: { name: 'Session Logged Out', description: 'Logout.instance — data is null' },
  INSTANCE_CREATE: { name: 'Session Created', description: 'Instance.create' },
  INSTANCE_DELETE: { name: 'Session Removed', description: 'Instance.delete' },
  STATUS_INSTANCE: { name: 'Session Status', description: 'Status.instance — session closed, with the disconnect reason' },
  COMMENT_RECEIVED: { name: 'Comment Received', description: 'Comment.received — new Facebook or Instagram comment' },
  COMMENT_UPDATED: { name: 'Comment Updated', description: 'Comment.updated — edited, hidden or unhidden' },
  COMMENT_REMOVED: {
    name: 'Comment Removed',
    description: 'Comment.removed — deleted on Meta or through WAFixer (data.reason)',
  },
  COMMENT_REPLY_SENT: { name: 'Comment Reply Sent', description: 'Comment.reply.sent — reply of the Page or account' },
  COMMENT_PRIVATE_REPLY_SENT: {
    name: 'Comment Private Reply Sent',
    description: 'Comment.private_reply.sent — private message sent to a comment author',
  },
  LEAD_RECEIVED: { name: 'Lead Received', description: 'Lead.received — new Facebook Lead Ads lead' },
  LEAD_UPDATED: { name: 'Lead Updated', description: 'Lead.updated — status, note or read flag changed' },
}

/** Seçilebilen olaylar; değerler `webhook/set` olay listesindeki adlardır. */
const EVENT_OPTIONS: Array<INodePropertyOptions & { value: WebhookEventConstant }> = WEBHOOK_EVENTS.map((value) => ({
  value,
  ...EVENT_LABELS[value],
})).sort((a, b) => a.name.localeCompare(b.name, 'en'))

// Eşleme sonrası toplu geçmiş olayları çok büyük gövde taşır; yalnız açıkça seçilince kaydedilir.
const BULK_EVENTS: ReadonlySet<WebhookEventConstant> = new Set(['MESSAGES_SET', 'CONTACTS_SET', 'CHATS_SET'])

/** Hiç olay seçilmezse kaydedilen liste. */
export const ALL_EVENTS: WebhookEventConstant[] = WEBHOOK_EVENTS.filter((event) => !BULK_EVENTS.has(event))

const WHATSAPP_CHANNELS = ['QR', 'META', 'WAFIXER']

// Eski sürümlerde kaydedilmiş adlar (GROUPS_UPDATE) sunucunun kabul ettiği ada çevrilir.
function selectedEvents(value: unknown): WebhookEventConstant[] {
  const names = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  return names.map(webhookEventConstant).filter(isWebhookEventConstant)
}

type TriggerBody = {
  event?: string
  instance?: string
  channel?: string | null
  data?: { key?: { fromMe?: boolean } }
}

/** Kanal süzgeci; `channel` alanı olmayan gövde (eski sunucu, lead olayı) süzülmez. */
function channelAllowed(channel: string | null | undefined, allowed: string[]): boolean {
  if (!allowed.length || !channel) return true
  if (WHATSAPP_CHANNELS.includes(channel)) return allowed.includes('WHATSAPP')
  return allowed.includes(channel)
}

function client(creds: WafixerCredentials): WafixerClient {
  return new WafixerClient({ baseUrl: creds.baseUrl, apiKey: creds.apiKey })
}

/**
 * WAFixer'dan gelen webhook olaylarını dinler. Workflow aktif edildiğinde
 * n8n webhook URL'ini alır ve WAFixer'da o instance için webhook ayarını
 * otomatik yapılandırır. Workflow durdurulunca temizler.
 */
export class WafixerTrigger implements INodeType {
  methods: {
    loadOptions: {
      getInstances(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>
    }
  } = wafixerLoadOptions

  description: INodeTypeDescription = {
    displayName: 'WAFixer Trigger',
    name: 'wafixerTrigger',
    icon: 'file:wafixer.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["instance"]}}',
    description: 'Starts the workflow on WAFixer events: messages, comments, leads and connection changes',
    defaults: {
      name: 'WAFixer Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'wafixerApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Session Name or ID',
        name: 'instance',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getInstances',
        },
        default: '',
        required: true,
        description:
          'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        default: ['MESSAGES_UPSERT'],
        description:
          'Events to listen to. Comment events come from Messenger (Facebook Page) and Instagram sessions; lead events from the session the Facebook Page is connected to for leads. Empty means all events except the history sync events.',
        options: EVENT_OPTIONS,
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Channels',
            name: 'channels',
            type: 'multiOptions',
            default: [],
            description: 'Only events of these channels. Empty means all channels.',
            options: [
              { name: 'Instagram', value: 'INSTAGRAM' },
              { name: 'Messenger', value: 'MESSENGER' },
              { name: 'WhatsApp', value: 'WHATSAPP' },
            ],
          },
          {
            displayName: 'Ignore Outgoing Messages',
            name: 'ignoreFromMe',
            type: 'boolean',
            default: false,
            description: 'Whether to filter out messages sent by you (fromMe = true)',
          },
          {
            displayName: 'Send Media as Base64',
            name: 'webhookBase64',
            type: 'boolean',
            default: false,
            description: 'Whether to embed media files as base64 in the webhook payload (large payloads)',
          },
        ],
      },
    ],
  }

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const creds = (await this.getCredentials('wafixerApi')) as WafixerCredentials
        const instance = this.getNodeParameter('instance') as string
        const webhookUrl = this.getNodeWebhookUrl('default') as string

        try {
          const data = await client(creds).webhook.find(instance)
          return Boolean(data?.enabled && data?.url === webhookUrl)
        } catch {
          return false
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const creds = (await this.getCredentials('wafixerApi')) as WafixerCredentials
        const instance = this.getNodeParameter('instance') as string
        const events = selectedEvents(this.getNodeParameter('events'))
        const options = this.getNodeParameter('options', {}) as {
          webhookBase64?: boolean
        }
        const webhookUrl = this.getNodeWebhookUrl('default') as string

        await client(creds).webhook.set(instance, {
          enabled: true,
          url: webhookUrl,
          events: events.length ? events : ALL_EVENTS,
          byEvents: false,
          base64: options.webhookBase64 ?? false,
        })
        return true
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const creds = (await this.getCredentials('wafixerApi')) as WafixerCredentials
        const instance = this.getNodeParameter('instance') as string

        try {
          await client(creds).webhook.set(instance, { enabled: false, url: '', events: [] })
        } catch {
          // hatayı sessizce yut — n8n bu node'u her durumda silebilmeli
        }
        return true
      },
    },
  }

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const body = this.getBodyData() as TriggerBody
    const events: string[] = selectedEvents(this.getNodeParameter('events'))
    const options = this.getNodeParameter('options', {}) as {
      ignoreFromMe?: boolean
      channels?: string[]
    }

    // Filtre: seçilmeyen event'leri atla (byEvents=false olduğu için backend hepsini gönderir)
    const eventName = webhookEventConstant(body.event ?? '')
    if (events.length && !events.includes(eventName)) {
      return { noWebhookResponse: true }
    }

    if (!channelAllowed(body.channel, options.channels ?? [])) {
      return { noWebhookResponse: true }
    }

    // Filtre: kendi gönderdiğin mesajları atla
    if (
      options.ignoreFromMe &&
      eventName === 'MESSAGES_UPSERT' &&
      body.data?.key?.fromMe === true
    ) {
      return { noWebhookResponse: true }
    }

    return {
      workflowData: [this.helpers.returnJsonArray([body])],
    }
  }
}

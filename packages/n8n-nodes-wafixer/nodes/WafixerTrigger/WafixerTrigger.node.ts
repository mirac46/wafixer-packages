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
  Wafixer as WafixerClient,
  isWebhookEventConstant,
  webhookEventConstant,
  type WebhookEventConstant,
} from 'wafixer-sdk'
import { wafixerLoadOptions } from '../shared/instanceOptions'

type WafixerCredentials = { baseUrl: string; apiKey: string }

/** Seçilebilen olaylar; değerler `webhook/set` olay listesindeki adlardır. */
const EVENT_OPTIONS: Array<INodePropertyOptions & { value: WebhookEventConstant }> = [
  { name: 'Chat Deleted', value: 'CHATS_DELETE', description: 'Chats.delete' },
  { name: 'Chat Update', value: 'CHATS_UPDATE', description: 'Chats.update' },
  { name: 'Comment Received', value: 'COMMENT_RECEIVED', description: 'Comment.received — new Facebook or Instagram comment' },
  { name: 'Comment Removed', value: 'COMMENT_REMOVED', description: 'Comment.removed' },
  { name: 'Comment Reply Sent', value: 'COMMENT_REPLY_SENT', description: 'Comment.reply.sent — reply of the Page or account' },
  { name: 'Comment Updated', value: 'COMMENT_UPDATED', description: 'Comment.updated — edited, hidden or unhidden' },
  { name: 'Connection State', value: 'CONNECTION_UPDATE', description: 'Connection.update' },
  { name: 'Contact Update', value: 'CONTACTS_UPDATE', description: 'Contacts.update' },
  { name: 'Group Created', value: 'GROUPS_UPSERT', description: 'Groups.upsert' },
  { name: 'Group Participants', value: 'GROUP_PARTICIPANTS_UPDATE', description: 'Group-participants.update' },
  { name: 'Group Updated', value: 'GROUP_UPDATE', description: 'Groups.update' },
  { name: 'Incoming Call', value: 'CALL', description: 'Call' },
  { name: 'Lead Received', value: 'LEAD_RECEIVED', description: 'Lead.received — new Facebook Lead Ads lead' },
  { name: 'Lead Updated', value: 'LEAD_UPDATED', description: 'Lead.updated — status, note or read flag changed' },
  { name: 'Message Deleted', value: 'MESSAGES_DELETE', description: 'Messages.delete' },
  { name: 'Message Status', value: 'MESSAGES_UPDATE', description: 'Messages.update' },
  { name: 'New Chat', value: 'CHATS_UPSERT', description: 'Chats.upsert' },
  { name: 'New Contact', value: 'CONTACTS_UPSERT', description: 'Contacts.upsert' },
  { name: 'New Message', value: 'MESSAGES_UPSERT', description: 'Messages.upsert' },
  { name: 'Outgoing Message', value: 'SEND_MESSAGE', description: 'Send.message' },
  { name: 'Presence', value: 'PRESENCE_UPDATE', description: 'Presence.update' },
]

/** Hiç olay seçilmezse kaydedilen liste. */
export const ALL_EVENTS: WebhookEventConstant[] = EVENT_OPTIONS.map((option) => option.value)

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
          'Events to listen to. Comment events come from Messenger (Facebook Page) and Instagram sessions; lead events from the session the Facebook Page is connected to for leads.',
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

import type {
  IHookFunctions,
  ILoadOptionsFunctions,
  INodePropertyOptions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow'

import { Wafixer as WafixerClient } from 'wafixer-sdk'
import { wafixerLoadOptions } from '../shared/instanceOptions'

const ALL_EVENTS = [
  'MESSAGES_UPSERT',
  'MESSAGES_UPDATE',
  'MESSAGES_DELETE',
  'SEND_MESSAGE',
  'CONNECTION_UPDATE',
  'PRESENCE_UPDATE',
  'CONTACTS_UPSERT',
  'CONTACTS_UPDATE',
  'CHATS_UPSERT',
  'CHATS_UPDATE',
  'CHATS_DELETE',
  'GROUPS_UPSERT',
  'GROUP_UPDATE',
  'GROUP_PARTICIPANTS_UPDATE',
  'CALL',
] as const

// Sunucunun ayar listesi groups.update için tekil GROUP_UPDATE adını kullanır; GROUPS_UPDATE isteği 400 ile düşürür.
const LEGACY_EVENT_NAMES: Record<string, string> = { GROUPS_UPDATE: 'GROUP_UPDATE' }

function eventConstant(name: string): string {
  const constant = name.replace(/[.-]/g, '_').toUpperCase()
  return LEGACY_EVENT_NAMES[constant] ?? constant
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
    description: 'WhatsApp olaylarını dinler (yeni mesaj, durum, vb.)',
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
        description: 'Dinlemek istediğin olaylar',
        options: [
          { name: 'Chat Deleted', value: 'CHATS_DELETE', description: 'Chats.delete' },
          { name: 'Chat Update', value: 'CHATS_UPDATE', description: 'Chats.update' },
          { name: 'Connection State', value: 'CONNECTION_UPDATE', description: 'Connection.update' },
          { name: 'Contact Update', value: 'CONTACTS_UPDATE', description: 'Contacts.update' },
          { name: 'Group Created', value: 'GROUPS_UPSERT', description: 'Groups.upsert' },
          { name: 'Group Participants', value: 'GROUP_PARTICIPANTS_UPDATE', description: 'Group-participants.update' },
          { name: 'Group Updated', value: 'GROUP_UPDATE', description: 'Groups.update' },
          { name: 'Incoming Call', value: 'CALL', description: 'Call' },
          { name: 'Message Deleted', value: 'MESSAGES_DELETE', description: 'Messages.delete' },
          { name: 'Message Status', value: 'MESSAGES_UPDATE', description: 'Messages.update' },
          { name: 'New Chat', value: 'CHATS_UPSERT', description: 'Chats.upsert' },
          { name: 'New Contact', value: 'CONTACTS_UPSERT', description: 'Contacts.upsert' },
          { name: 'New Message', value: 'MESSAGES_UPSERT', description: 'Messages.upsert' },
          { name: 'Outgoing Message', value: 'SEND_MESSAGE', description: 'Send.message' },
          { name: 'Presence', value: 'PRESENCE_UPDATE', description: 'Presence.update' },
        ],
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Send Media as Base64',
            name: 'webhookBase64',
            type: 'boolean',
            default: false,
            description: 'Whether to embed media files as base64 in the webhook payload (büyük payload üretir)',
          },
          {
            displayName: 'Ignore Outgoing Messages',
            name: 'ignoreFromMe',
            type: 'boolean',
            default: false,
            description: 'Whether to filter out messages sent by you (fromMe = true)',
          },
        ],
      },
    ],
  }

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const creds = (await this.getCredentials('wafixerApi')) as {
          baseUrl: string
          apiKey: string
        }
        const instance = this.getNodeParameter('instance') as string
        const webhookUrl = this.getNodeWebhookUrl('default') as string

        const wa = new WafixerClient({ baseUrl: creds.baseUrl, apiKey: creds.apiKey })
        try {
          const data = await wa.request<{
            url?: string
            enabled?: boolean
          }>({
            method: 'GET',
            url: `/webhook/find/${encodeURIComponent(instance)}`,
          })
          return Boolean(data?.enabled && data?.url === webhookUrl)
        } catch {
          return false
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const creds = (await this.getCredentials('wafixerApi')) as {
          baseUrl: string
          apiKey: string
        }
        const instance = this.getNodeParameter('instance') as string
        const events = (this.getNodeParameter('events') as string[]).map(eventConstant)
        const options = this.getNodeParameter('options', {}) as {
          webhookBase64?: boolean
        }
        const webhookUrl = this.getNodeWebhookUrl('default') as string

        const wa = new WafixerClient({ baseUrl: creds.baseUrl, apiKey: creds.apiKey })
        await wa.request({
          method: 'POST',
          url: `/webhook/set/${encodeURIComponent(instance)}`,
          data: {
            webhook: {
              enabled: true,
              url: webhookUrl,
              events: events.length ? events : ALL_EVENTS,
              byEvents: false,
              base64: options.webhookBase64 ?? false,
            },
          },
        })
        return true
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const creds = (await this.getCredentials('wafixerApi')) as {
          baseUrl: string
          apiKey: string
        }
        const instance = this.getNodeParameter('instance') as string

        const wa = new WafixerClient({ baseUrl: creds.baseUrl, apiKey: creds.apiKey })
        try {
          await wa.request({
            method: 'POST',
            url: `/webhook/set/${encodeURIComponent(instance)}`,
            data: {
              webhook: {
                enabled: false,
                url: '',
                events: [],
                byEvents: false,
                base64: false,
              },
            },
          })
        } catch {
          // hatayı sessizce yut — n8n bu node'u her durumda silebilmeli
        }
        return true
      },
    },
  }

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const body = this.getBodyData() as {
      event?: string
      instance?: string
      data?: { key?: { fromMe?: boolean } }
    }
    const events = (this.getNodeParameter('events') as string[]).map(eventConstant)
    const options = this.getNodeParameter('options', {}) as {
      ignoreFromMe?: boolean
    }

    // Filtre: seçilmeyen event'leri atla (byEvents=false olduğu için backend hepsini gönderir)
    const eventName = eventConstant(body.event ?? '')
    if (events.length && !events.includes(eventName)) {
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

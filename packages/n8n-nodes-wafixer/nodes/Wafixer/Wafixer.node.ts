import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow'
import { NodeOperationError } from 'n8n-workflow'

import { Wafixer as WafixerClient } from 'wafixer-sdk'
import { wafixerLoadOptions } from '../shared/instanceOptions'

export class Wafixer implements INodeType {
  methods: {
    loadOptions: {
      getInstances(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>
    }
  } = wafixerLoadOptions

  description: INodeTypeDescription = {
    displayName: 'WAFixer',
    name: 'wafixer',
    icon: 'file:wafixer.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'WhatsApp mesajları gönder (WAFixer)',
    defaults: {
      name: 'WAFixer',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'wafixerApi',
        required: true,
      },
    ],
    properties: [
      // ─────────── Instance ───────────
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

      // ─────────── Operation ───────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        default: 'sendText',
        options: [
          { name: 'Mark as Read', value: 'markAsRead', description: 'Mesajları okundu işaretle (mavi tik)', action: 'Mark messages as read' },
          { name: 'Reply to Message', value: 'replyTo', description: 'Webhook event\'inden gelen mesaja alıntılı yanıt ver', action: 'Reply to a message' },
          { name: 'Send Audio (PTT)', value: 'sendAudio', description: 'Sesli mesaj (push-to-talk) gönder', action: 'Send a voice note' },
          { name: 'Send Buttons', value: 'sendButtons', description: 'Butonlu interaktif mesaj', action: 'Send a buttons message' },
          { name: 'Send Contact', value: 'sendContact', description: 'Kişi kartı paylaş', action: 'Send a contact card' },
          { name: 'Send List', value: 'sendList', description: 'Listeli interaktif mesaj', action: 'Send a list message' },
          { name: 'Send Location', value: 'sendLocation', description: 'Konum paylaş', action: 'Send a location' },
          { name: 'Send Media', value: 'sendMedia', description: 'Resim, video, döküman veya audio gönder', action: 'Send a media file' },
          { name: 'Send Poll', value: 'sendPoll', description: 'Anket mesajı', action: 'Send a poll' },
          { name: 'Send Presence', value: 'sendPresence', description: 'Yazıyor / kaydediyor / online göstergesi', action: 'Send a presence indicator' },
          { name: 'Send Reaction', value: 'sendReaction', description: 'Bir mesaja emoji reaksiyon ekle', action: 'Send a reaction' },
          { name: 'Send Sticker', value: 'sendSticker', description: 'Sticker gönder', action: 'Send a sticker' },
          { name: 'Send Text', value: 'sendText', description: 'Düz metin mesajı gönder', action: 'Send a text message' },
        ],
      },

      // ────────────────────────────────────────────────────────────────
      // Common: Number
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Number',
        name: 'number',
        type: 'string',
        default: '',
        required: true,
        placeholder: '905321788329',
        description: 'Hedef telefon numarası (uluslararası kod ile, başında + veya 0 olmadan)',
        displayOptions: {
          show: {
            operation: [
              'sendText',
              'sendMedia',
              'sendAudio',
              'sendSticker',
              'sendLocation',
              'sendContact',
              'sendPoll',
              'sendButtons',
              'sendList',
              'sendPresence',
            ],
          },
        },
      },

      // ────────────────────────────────────────────────────────────────
      // sendText
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        required: true,
        displayOptions: { show: { operation: ['sendText'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // sendMedia
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Media Type',
        name: 'mediatype',
        type: 'options',
        default: 'image',
        options: [
          { name: 'Image', value: 'image' },
          { name: 'Video', value: 'video' },
          { name: 'Document', value: 'document' },
          { name: 'Audio', value: 'audio' },
        ],
        displayOptions: { show: { operation: ['sendMedia'] } },
      },
      {
        displayName: 'Media (URL or Base64)',
        name: 'media',
        type: 'string',
        default: '',
        required: true,
        placeholder: 'https://example.com/photo.jpg',
        displayOptions: { show: { operation: ['sendMedia'] } },
      },
      {
        displayName: 'Caption',
        name: 'caption',
        type: 'string',
        typeOptions: { rows: 2 },
        default: '',
        displayOptions: { show: { operation: ['sendMedia'] } },
      },
      {
        displayName: 'File Name',
        name: 'fileName',
        type: 'string',
        default: '',
        description: 'Sadece document için',
        displayOptions: { show: { operation: ['sendMedia'], mediatype: ['document'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // sendAudio
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Audio (URL or Base64)',
        name: 'audio',
        type: 'string',
        default: '',
        required: true,
        placeholder: 'https://example.com/voice.ogg',
        displayOptions: { show: { operation: ['sendAudio'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // sendSticker
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Sticker (URL or Base64)',
        name: 'sticker',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { operation: ['sendSticker'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // sendLocation
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Latitude',
        name: 'latitude',
        type: 'number',
        default: 41.0082,
        displayOptions: { show: { operation: ['sendLocation'] } },
      },
      {
        displayName: 'Longitude',
        name: 'longitude',
        type: 'number',
        default: 28.9784,
        displayOptions: { show: { operation: ['sendLocation'] } },
      },
      {
        displayName: 'Place Name',
        name: 'locationName',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['sendLocation'] } },
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['sendLocation'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // sendContact
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Contact Full Name',
        name: 'contactFullName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { operation: ['sendContact'] } },
      },
      {
        displayName: 'Contact Phone (with Country Code)',
        name: 'contactPhone',
        type: 'string',
        default: '',
        required: true,
        placeholder: '905321788329',
        displayOptions: { show: { operation: ['sendContact'] } },
      },
      {
        displayName: 'Organization',
        name: 'contactOrg',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['sendContact'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // sendReaction
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Message Key (JSON)',
        name: 'reactionKey',
        type: 'json',
        default:
          '={{ { remoteJid: $json["data"]["key"]["remoteJid"], fromMe: $json["data"]["key"]["fromMe"], id: $json["data"]["key"]["id"] } }}',
        required: true,
        description: 'Reaksiyon eklenecek mesajın key objesi. Trigger node\'undan gelir.',
        displayOptions: { show: { operation: ['sendReaction'] } },
      },
      {
        displayName: 'Emoji',
        name: 'reaction',
        type: 'string',
        default: '👍',
        placeholder: '👍 (boş bırakılırsa kaldırılır)',
        displayOptions: { show: { operation: ['sendReaction'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // sendPoll
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Question',
        name: 'pollName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { operation: ['sendPoll'] } },
      },
      {
        displayName: 'Options (One per Line)',
        name: 'pollValues',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        required: true,
        placeholder: 'Seçenek 1\nSeçenek 2\nSeçenek 3',
        displayOptions: { show: { operation: ['sendPoll'] } },
      },
      {
        displayName: 'Selectable Count',
        name: 'pollSelectableCount',
        type: 'number',
        default: 1,
        description: 'Kullanıcı kaç seçenek seçebilsin (1 = tek seçim)',
        displayOptions: { show: { operation: ['sendPoll'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // sendButtons
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Title',
        name: 'buttonsTitle',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { operation: ['sendButtons'] } },
      },
      {
        displayName: 'Description',
        name: 'buttonsDescription',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['sendButtons'] } },
      },
      {
        displayName: 'Footer',
        name: 'buttonsFooter',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['sendButtons'] } },
      },
      {
        displayName: 'Buttons',
        name: 'buttons',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        default: { button: [] },
        placeholder: 'Add Button',
        options: [
          {
            name: 'button',
            displayName: 'Button',
            values: [
              {
                displayName: 'Type',
                name: 'type',
                type: 'options',
                default: 'reply',
                options: [
                  { name: 'Reply', value: 'reply' },
                  { name: 'URL', value: 'url' },
                  { name: 'Call', value: 'call' },
                  { name: 'Copy', value: 'copy' },
                ],
              },
              { displayName: 'Display Text', name: 'displayText', type: 'string', default: '' },
              { displayName: 'ID (Reply)', name: 'id', type: 'string', default: '' },
              { displayName: 'URL (Url Type)', name: 'url', type: 'string', default: '' },
              { displayName: 'Phone (Call Type)', name: 'phoneNumber', type: 'string', default: '' },
              { displayName: 'Copy Code (Copy Type)', name: 'copyCode', type: 'string', default: '' },
            ],
          },
        ],
        displayOptions: { show: { operation: ['sendButtons'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // sendList
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Title',
        name: 'listTitle',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { operation: ['sendList'] } },
      },
      {
        displayName: 'Description',
        name: 'listDescription',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['sendList'] } },
      },
      {
        displayName: 'Footer Text',
        name: 'listFooter',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['sendList'] } },
      },
      {
        displayName: 'Button Text',
        name: 'listButtonText',
        type: 'string',
        default: 'Seçenekler',
        required: true,
        displayOptions: { show: { operation: ['sendList'] } },
      },
      {
        displayName: 'Sections (JSON)',
        name: 'listSections',
        type: 'json',
        default:
          '[\n  {\n    "title": "Bölüm 1",\n    "rows": [\n      { "title": "Seçenek 1", "description": "açıklama", "rowId": "opt-1" }\n    ]\n  }\n]',
        required: true,
        displayOptions: { show: { operation: ['sendList'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // replyTo
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Webhook Event',
        name: 'replyEvent',
        type: 'json',
        default: '={{ $json }}',
        required: true,
        description: 'Trigger node\'dan gelen tam event payload\'u',
        displayOptions: { show: { operation: ['replyTo'] } },
      },
      {
        displayName: 'Reply Text',
        name: 'replyText',
        type: 'string',
        typeOptions: { rows: 3 },
        default: '',
        required: true,
        displayOptions: { show: { operation: ['replyTo'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // markAsRead
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Read Messages (JSON Array)',
        name: 'readMessages',
        type: 'json',
        default:
          '={{ [ { remoteJid: $json["data"]["key"]["remoteJid"], fromMe: $json["data"]["key"]["fromMe"], id: $json["data"]["key"]["id"] } ] }}',
        required: true,
        description: 'Okundu işaretlenecek mesaj key\'leri',
        displayOptions: { show: { operation: ['markAsRead'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // sendPresence
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Presence',
        name: 'presence',
        type: 'options',
        default: 'composing',
        options: [
          { name: 'Available', value: 'available', description: 'Online göster' },
          { name: 'Composing', value: 'composing', description: '"yazıyor..." göstergesi' },
          { name: 'Paused', value: 'paused', description: 'Yazımı bıraktı' },
          { name: 'Recording', value: 'recording', description: 'Sesli mesaj kaydediyor' },
          { name: 'Unavailable', value: 'unavailable', description: 'Çevrimdışı göster' },
        ],
        displayOptions: { show: { operation: ['sendPresence'] } },
      },
      {
        displayName: 'Delay (Ms)',
        name: 'presenceDelay',
        type: 'number',
        default: 1500,
        displayOptions: { show: { operation: ['sendPresence'] } },
      },

      // ────────────────────────────────────────────────────────────────
      // Common: Additional options
      // ────────────────────────────────────────────────────────────────
      {
        displayName: 'Additional Options',
        name: 'additional',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            operation: [
              'sendText',
              'sendMedia',
              'sendAudio',
              'sendSticker',
              'sendLocation',
              'sendContact',
              'sendPoll',
              'sendButtons',
              'sendList',
            ],
          },
        },
        options: [
          { displayName: 'Delay (Ms)', name: 'delay', type: 'number', default: 0 },
          { displayName: 'Link Preview', name: 'linkPreview', type: 'boolean', default: false },
          {
            displayName: 'Mentioned (Comma-Separated Numbers)',
            name: 'mentioned',
            type: 'string',
            default: '',
          },
        ],
      },
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []

    const creds = (await this.getCredentials('wafixerApi')) as {
      baseUrl: string
      apiKey: string
    }
    const wa = new WafixerClient({
      baseUrl: creds.baseUrl,
      apiKey: creds.apiKey,
    })

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string
        const instance = this.getNodeParameter('instance', i) as string

        const additional = (this.getNodeParameter('additional', i, {}) as {
          delay?: number
          linkPreview?: boolean
          mentioned?: string
        }) ?? {}

        const baseExtras = {
          delay: additional.delay || undefined,
          linkPreview: additional.linkPreview || undefined,
          mentioned: additional.mentioned
            ? additional.mentioned.split(',').map((s) => s.trim()).filter(Boolean)
            : undefined,
        }

        let result: unknown

        switch (operation) {
          case 'sendText': {
            const number = this.getNodeParameter('number', i) as string
            const text = this.getNodeParameter('text', i) as string
            result = await wa.messages.sendText(instance, { number, text, ...baseExtras })
            break
          }

          case 'sendMedia': {
            const number = this.getNodeParameter('number', i) as string
            const mediatype = this.getNodeParameter('mediatype', i) as
              | 'image'
              | 'video'
              | 'document'
              | 'audio'
            const media = this.getNodeParameter('media', i) as string
            const caption = this.getNodeParameter('caption', i, '') as string
            const fileName = this.getNodeParameter('fileName', i, '') as string
            result = await wa.messages.sendMedia(instance, {
              number,
              mediatype,
              media,
              caption: caption || undefined,
              fileName: fileName || undefined,
              ...baseExtras,
            })
            break
          }

          case 'sendAudio': {
            const number = this.getNodeParameter('number', i) as string
            const audio = this.getNodeParameter('audio', i) as string
            result = await wa.messages.sendAudio(instance, { number, audio, ...baseExtras })
            break
          }

          case 'sendSticker': {
            const number = this.getNodeParameter('number', i) as string
            const sticker = this.getNodeParameter('sticker', i) as string
            result = await wa.messages.sendSticker(instance, { number, sticker, ...baseExtras })
            break
          }

          case 'sendLocation': {
            const number = this.getNodeParameter('number', i) as string
            const latitude = this.getNodeParameter('latitude', i) as number
            const longitude = this.getNodeParameter('longitude', i) as number
            const name = this.getNodeParameter('locationName', i, '') as string
            const address = this.getNodeParameter('address', i, '') as string
            result = await wa.messages.sendLocation(instance, {
              number,
              latitude,
              longitude,
              name: name || undefined,
              address: address || undefined,
              ...baseExtras,
            })
            break
          }

          case 'sendContact': {
            const number = this.getNodeParameter('number', i) as string
            const fullName = this.getNodeParameter('contactFullName', i) as string
            const phone = this.getNodeParameter('contactPhone', i) as string
            const org = this.getNodeParameter('contactOrg', i, '') as string
            result = await wa.messages.sendContact(instance, {
              number,
              contact: [
                {
                  fullName,
                  wuid: phone,
                  phoneNumber: phone,
                  organization: org || undefined,
                },
              ],
              ...baseExtras,
            })
            break
          }

          case 'sendReaction': {
            const key = this.getNodeParameter('reactionKey', i) as {
              remoteJid: string
              fromMe: boolean
              id: string
            }
            const reaction = this.getNodeParameter('reaction', i) as string
            result = await wa.messages.sendReaction(instance, { key, reaction })
            break
          }

          case 'sendPoll': {
            const number = this.getNodeParameter('number', i) as string
            const name = this.getNodeParameter('pollName', i) as string
            const valuesRaw = this.getNodeParameter('pollValues', i) as string
            const selectableCount = this.getNodeParameter('pollSelectableCount', i) as number
            const values = valuesRaw
              .split('\n')
              .map((v) => v.trim())
              .filter(Boolean)
            result = await wa.messages.sendPoll(instance, {
              number,
              name,
              values,
              selectableCount,
              ...baseExtras,
            })
            break
          }

          case 'sendButtons': {
            const number = this.getNodeParameter('number', i) as string
            const title = this.getNodeParameter('buttonsTitle', i) as string
            const description = this.getNodeParameter('buttonsDescription', i, '') as string
            const footer = this.getNodeParameter('buttonsFooter', i, '') as string
            const buttonsRaw = this.getNodeParameter('buttons', i, { button: [] }) as {
              button: Array<{
                type: 'reply' | 'url' | 'call' | 'copy'
                displayText?: string
                id?: string
                url?: string
                phoneNumber?: string
                copyCode?: string
              }>
            }
            result = await wa.messages.sendButtons(instance, {
              number,
              title,
              description: description || undefined,
              footer: footer || undefined,
              buttons: buttonsRaw.button.map((b) => ({
                type: b.type,
                displayText: b.displayText,
                id: b.id || undefined,
                url: b.url || undefined,
                phoneNumber: b.phoneNumber || undefined,
                copyCode: b.copyCode || undefined,
              })),
              ...baseExtras,
            })
            break
          }

          case 'sendList': {
            const number = this.getNodeParameter('number', i) as string
            const title = this.getNodeParameter('listTitle', i) as string
            const description = this.getNodeParameter('listDescription', i, '') as string
            const footerText = this.getNodeParameter('listFooter', i, '') as string
            const buttonText = this.getNodeParameter('listButtonText', i) as string
            const sections = this.getNodeParameter('listSections', i) as Array<{
              title: string
              rows: Array<{ title: string; description: string; rowId: string }>
            }>
            result = await wa.messages.sendList(instance, {
              number,
              title,
              description: description || undefined,
              footerText: footerText || undefined,
              buttonText,
              sections,
              ...baseExtras,
            })
            break
          }

          case 'replyTo': {
            const event = this.getNodeParameter('replyEvent', i) as {
              instance: string
              data: {
                key: { remoteJid: string; fromMe: boolean; id: string }
                message?: Record<string, unknown>
              }
            }
            const text = this.getNodeParameter('replyText', i) as string
            const targetInstance = event?.instance ?? instance
            result = await wa.messages.replyTo(
              { instance: targetInstance, data: event.data as never },
              { text },
            )
            break
          }

          case 'markAsRead': {
            const readMessages = this.getNodeParameter('readMessages', i) as Array<{
              remoteJid: string
              fromMe: boolean
              id: string
            }>
            result = await wa.chat.markAsRead(instance, { readMessages })
            break
          }

          case 'sendPresence': {
            const number = this.getNodeParameter('number', i) as string
            const presence = this.getNodeParameter('presence', i) as
              | 'available'
              | 'composing'
              | 'recording'
              | 'paused'
              | 'unavailable'
            const delay = this.getNodeParameter('presenceDelay', i) as number
            result = await wa.chat.sendPresence(instance, { number, presence, delay })
            break
          }

          default:
            throw new NodeOperationError(
              this.getNode(),
              `Bilinmeyen operation: ${operation}`,
              { itemIndex: i },
            )
        }

        returnData.push({ json: (result ?? {}) as INodeExecutionData['json'] })
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
            pairedItem: i,
          })
          continue
        }
        throw error
      }
    }

    return [returnData]
  }
}

import type { INodeProperties } from 'n8n-workflow'

const show = (operation: string[]) => ({ show: { resource: ['message'], operation } })

const KEY_FROM_TRIGGER =
  '={{ { remoteJid: $json["data"]["key"]["remoteJid"], fromMe: $json["data"]["key"]["fromMe"], id: $json["data"]["key"]["id"] } }}'

/** Mesaj kaynağının ana listede olmayan işlemleri; alanlar ana düğüm dosyasını büyütmesin diye burada. */
export const messageExtraOperationOptions = [
  {
    name: 'Delete for Everyone',
    value: 'deleteForEveryone',
    description: 'Delete a sent message for all participants (WhatsApp)',
    action: 'Delete a message for everyone',
  },
  {
    name: 'Download Media',
    value: 'downloadMedia',
    description: 'Download the media of a trigger message as base64',
    action: 'Download media of a message',
  },
  {
    name: 'Edit Message',
    value: 'editMessage',
    description: 'Change the text of a message you sent (WhatsApp, within 15 minutes)',
    action: 'Edit a sent message',
  },
  {
    name: 'Post Status',
    value: 'sendStatus',
    description: 'Post a WhatsApp status (story). QR sessions only.',
    action: 'Post a status',
  },
  {
    name: 'Send Template',
    value: 'sendTemplate',
    description:
      'Send an approved Meta message template. WhatsApp Cloud API sessions only; opens a conversation outside the 24-hour window.',
    action: 'Send a template message',
  },
  {
    name: 'Send Video Note (PTV)',
    value: 'sendPtv',
    description: 'Send a round video note',
    action: 'Send a video note',
  },
]

export const messageExtraFields: INodeProperties[] = [
  // ─────────── sendPtv ───────────
  {
    displayName: 'Video (URL or Base64)',
    name: 'ptvVideo',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'https://example.com/note.mp4',
    displayOptions: show(['sendPtv']),
  },

  // ─────────── sendTemplate ───────────
  {
    displayName: 'Template Name',
    name: 'templateName',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'appointment_reminder',
    description: 'Name of the template approved in Meta Business Manager',
    displayOptions: show(['sendTemplate']),
  },
  {
    displayName: 'Language',
    name: 'templateLanguage',
    type: 'string',
    default: 'tr',
    required: true,
    description: 'Language code of the approved template, e.g. tr or en_US',
    displayOptions: show(['sendTemplate']),
  },
  {
    displayName: 'Components (JSON)',
    name: 'templateComponents',
    type: 'json',
    default: '[]',
    description:
      'Template variables in Meta format, e.g. [{"type":"body","parameters":[{"type":"text","text":"Ayşe"}]}]. Leave [] for templates without variables.',
    displayOptions: show(['sendTemplate']),
  },

  // ─────────── sendStatus ───────────
  {
    displayName: 'Status Type',
    name: 'statusType',
    type: 'options',
    default: 'text',
    options: [
      { name: 'Audio', value: 'audio' },
      { name: 'Image', value: 'image' },
      { name: 'Text', value: 'text' },
      { name: 'Video', value: 'video' },
    ],
    displayOptions: show(['sendStatus']),
  },
  {
    displayName: 'Content',
    name: 'statusContent',
    type: 'string',
    typeOptions: { rows: 3 },
    default: '',
    required: true,
    description: 'Text of a text status, or URL / base64 of the media',
    displayOptions: show(['sendStatus']),
  },
  {
    displayName: 'Audience',
    name: 'statusAudience',
    type: 'options',
    default: 'all',
    options: [
      { name: 'All Contacts', value: 'all' },
      { name: 'Selected Numbers', value: 'list' },
    ],
    displayOptions: show(['sendStatus']),
  },
  {
    displayName: 'Numbers (Comma-Separated)',
    name: 'statusNumbers',
    type: 'string',
    default: '',
    required: true,
    placeholder: '905321788329, 905551112233',
    displayOptions: { show: { resource: ['message'], operation: ['sendStatus'], statusAudience: ['list'] } },
  },
  {
    displayName: 'Status Options',
    name: 'statusOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: show(['sendStatus']),
    options: [
      { displayName: 'Caption', name: 'caption', type: 'string', default: '', description: 'Caption of an image or video status' },
      {
        displayName: 'Background Color',
        name: 'backgroundColor',
        type: 'color',
        default: '#008000',
        description: 'Background of a text status',
      },
      {
        displayName: 'Font',
        name: 'font',
        type: 'number',
        typeOptions: { minValue: 0, maxValue: 5 },
        default: 1,
        description: 'Font of a text status, 0 to 5',
      },
    ],
  },

  // ─────────── deleteForEveryone, editMessage, downloadMedia ───────────
  {
    displayName: 'Message Key (JSON)',
    name: 'messageKey',
    type: 'json',
    default: KEY_FROM_TRIGGER,
    required: true,
    description: 'Key of the message. Comes from the trigger node or from the response of a send operation.',
    displayOptions: show(['deleteForEveryone', 'editMessage']),
  },
  {
    displayName: 'New Text',
    name: 'editText',
    type: 'string',
    typeOptions: { rows: 3 },
    default: '',
    required: true,
    displayOptions: show(['editMessage']),
  },
  {
    displayName: 'Webhook Event',
    name: 'mediaEvent',
    type: 'json',
    default: '={{ $json }}',
    required: true,
    description: 'Full message event from the trigger node (New Message, Outgoing Message)',
    displayOptions: show(['downloadMedia']),
  },
]

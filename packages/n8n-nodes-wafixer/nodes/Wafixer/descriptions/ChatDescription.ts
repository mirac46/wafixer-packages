import type { INodeProperties } from 'n8n-workflow'

const show = (operation: string[]) => ({ show: { resource: ['chat'], operation } })

const KEY_FROM_TRIGGER =
  '={{ { remoteJid: $json["data"]["key"]["remoteJid"], fromMe: $json["data"]["key"]["fromMe"], id: $json["data"]["key"]["id"] } }}'

export const chatOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['chat'] } },
    default: 'checkNumbers',
    options: [
      {
        name: 'Archive or Unarchive',
        value: 'archiveChat',
        description: 'Archive a WhatsApp chat or move it back to the chat list',
        action: 'Archive or unarchive a chat',
      },
      {
        name: 'Block or Unblock',
        value: 'updateBlockStatus',
        description: 'Block a WhatsApp contact or remove the block',
        action: 'Block or unblock a contact',
      },
      {
        name: 'Check WhatsApp Numbers',
        value: 'checkNumbers',
        description: 'Check which phone numbers have a WhatsApp account. One output item per number.',
        action: 'Check whatsapp numbers',
      },
      {
        name: 'Get Chat',
        value: 'findChat',
        description: 'Get one chat by remote JID',
        action: 'Get a chat',
      },
      {
        name: 'Get Many Chats',
        value: 'findChats',
        description: 'List the chats of the session',
        action: 'Get many chats',
      },
      {
        name: 'Get Many Contacts',
        value: 'findContacts',
        description: 'List the contacts stored for the session',
        action: 'Get many contacts',
      },
      {
        name: 'Get Many Messages',
        value: 'findMessages',
        description: 'List stored messages of a chat, page by page',
        action: 'Get many messages',
      },
      {
        name: 'Get Profile Picture',
        value: 'fetchProfilePicture',
        description: 'Get the profile picture URL of a WhatsApp contact',
        action: 'Get a profile picture',
      },
      {
        name: 'Mark as Unread',
        value: 'markChatUnread',
        description: 'Mark a WhatsApp chat as unread',
        action: 'Mark a chat as unread',
      },
    ],
  },
]

export const chatFields: INodeProperties[] = [
  // ─────────── checkNumbers ───────────
  {
    displayName: 'Numbers',
    name: 'checkNumbers',
    type: 'string',
    default: '',
    required: true,
    placeholder: '905321788329, 905551112233',
    description: 'Phone numbers with country code, without + or leading 0, separated by commas',
    displayOptions: show(['checkNumbers']),
  },

  // ─────────── fetchProfilePicture, updateBlockStatus ───────────
  {
    displayName: 'Number',
    name: 'chatNumber',
    type: 'string',
    default: '',
    required: true,
    placeholder: '905321788329',
    description: 'Phone number with country code, without + or leading 0',
    displayOptions: show(['fetchProfilePicture', 'updateBlockStatus']),
  },
  {
    displayName: 'Action',
    name: 'blockStatus',
    type: 'options',
    default: 'block',
    options: [
      { name: 'Block', value: 'block' },
      { name: 'Unblock', value: 'unblock' },
    ],
    displayOptions: show(['updateBlockStatus']),
  },

  // ─────────── findChat, findMessages ───────────
  {
    displayName: 'Remote JID',
    name: 'remoteJid',
    type: 'string',
    default: '={{ $json["data"]?.["key"]?.["remoteJid"] }}',
    required: true,
    placeholder: '905321788329@s.whatsapp.net',
    description:
      'Chat ID: data.key.remoteJid of a trigger event. WhatsApp: number@s.whatsapp.net, Messenger: PSID@messenger, Instagram: IGSID@instagram.',
    displayOptions: show(['findChat', 'findMessages']),
  },
  {
    displayName: 'Limit',
    name: 'messageLimit',
    type: 'number',
    typeOptions: { minValue: 1, maxValue: 100 },
    default: 25,
    description: 'Max number of results to return',
    displayOptions: show(['findMessages']),
  },
  {
    displayName: 'Page',
    name: 'messagePage',
    type: 'number',
    typeOptions: { minValue: 1 },
    default: 1,
    description: 'Page number, starting from 1. The response of each item contains total and pages.',
    displayOptions: show(['findMessages']),
  },

  // ─────────── findContacts ───────────
  {
    displayName: 'Filters',
    name: 'contactFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['findContacts']),
    options: [
      { displayName: 'Name', name: 'pushName', type: 'string', default: '', description: 'Exact WhatsApp profile name' },
      { displayName: 'Remote JID', name: 'remoteJid', type: 'string', default: '', placeholder: '905321788329@s.whatsapp.net' },
    ],
  },

  // ─────────── archiveChat, markChatUnread ───────────
  {
    displayName: 'Last Message Key (JSON)',
    name: 'lastMessageKey',
    type: 'json',
    default: KEY_FROM_TRIGGER,
    required: true,
    description: 'Key of the last message in the chat. WhatsApp needs it to change the chat state; it comes from the trigger node.',
    displayOptions: show(['archiveChat', 'markChatUnread']),
  },
  {
    displayName: 'Archive',
    name: 'archive',
    type: 'boolean',
    default: true,
    description: 'Whether to archive the chat (off moves it back to the chat list)',
    displayOptions: show(['archiveChat']),
  },
]

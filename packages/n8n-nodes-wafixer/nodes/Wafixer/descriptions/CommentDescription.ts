import type { INodeProperties } from 'n8n-workflow'

const show = (operation: string[]) => ({ show: { resource: ['comment'], operation } })

export const commentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['comment'] } },
    default: 'getAll',
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'List Facebook Page or Instagram comments of the session, newest first',
        action: 'Get many comments',
      },
      {
        name: 'Import',
        value: 'import',
        description: 'Import the comment history of a post or media. No events are sent for imported comments.',
        action: 'Import comments of a post',
      },
      {
        name: 'Mark as Read',
        value: 'markRead',
        description: 'Mark comments as read in WAFixer (not sent to Meta)',
        action: 'Mark comments as read',
      },
      {
        name: 'Reply',
        value: 'reply',
        description: 'Publish a public reply to a comment as the Page or Instagram account',
        action: 'Reply to a comment',
      },
    ],
  },
]

export const commentFields: INodeProperties[] = [
  // ─────────── getAll ───────────
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: show(['getAll']),
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: { minValue: 1 },
    default: 50,
    description: 'Max number of results to return',
    displayOptions: { show: { resource: ['comment'], operation: ['getAll'], returnAll: [false] } },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getAll']),
    options: [
      {
        displayName: 'Parent Comment ID',
        name: 'parentId',
        type: 'string',
        default: '',
        description: 'Only replies to this comment',
      },
      {
        displayName: 'Post ID',
        name: 'postId',
        type: 'string',
        default: '',
        description: 'Facebook post ID or Instagram media ID',
      },
      {
        displayName: 'Since',
        name: 'since',
        type: 'dateTime',
        default: '',
        description: 'Only comments created at or after this time',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: 'active',
        options: [
          { name: 'Active', value: 'active' },
          { name: 'All', value: 'all' },
          { name: 'Removed', value: 'removed' },
        ],
      },
      {
        displayName: 'Top-Level Only',
        name: 'topLevelOnly',
        type: 'boolean',
        default: false,
        description: 'Whether to skip replies and return only comments written on the post',
      },
      {
        displayName: 'Unread Only',
        name: 'unread',
        type: 'boolean',
        default: false,
        description: 'Whether to return only unread comments written by other people',
      },
      {
        displayName: 'Until',
        name: 'until',
        type: 'dateTime',
        default: '',
        description: 'Only comments created before this time',
      },
    ],
  },

  // ─────────── reply ───────────
  {
    displayName: 'Comment ID',
    name: 'commentId',
    type: 'string',
    default: '={{ $json.data?.comment?.id ?? $json.id }}',
    required: true,
    description: 'Meta comment ID. The default reads it from a WAFixer Trigger comment event or a listed comment.',
    displayOptions: show(['reply']),
  },
  {
    displayName: 'Text',
    name: 'text',
    type: 'string',
    typeOptions: { rows: 3 },
    default: '',
    required: true,
    description: 'Public reply. Facebook allows 8000 characters, Instagram 2200.',
    displayOptions: show(['reply']),
  },

  // ─────────── markRead ───────────
  {
    displayName: 'Mark',
    name: 'markTarget',
    type: 'options',
    default: 'commentIds',
    options: [
      { name: 'All Comments', value: 'all' },
      { name: 'Comments of a Post', value: 'post' },
      { name: 'Specific Comments', value: 'commentIds' },
    ],
    displayOptions: show(['markRead']),
  },
  {
    displayName: 'Comment IDs',
    name: 'commentIds',
    type: 'string',
    default: '',
    required: true,
    placeholder: '123_456, 123_789',
    description: 'Comma-separated Meta comment IDs (up to 500)',
    displayOptions: { show: { resource: ['comment'], operation: ['markRead'], markTarget: ['commentIds'] } },
  },
  {
    displayName: 'Post ID',
    name: 'postId',
    type: 'string',
    default: '',
    required: true,
    description: 'Facebook post ID or Instagram media ID',
    displayOptions: { show: { resource: ['comment'], operation: ['markRead'], markTarget: ['post'] } },
  },

  // ─────────── import ───────────
  {
    displayName: 'Post ID',
    name: 'importPostId',
    type: 'string',
    default: '',
    required: true,
    description: 'Facebook post ID or Instagram media ID owned by the connected Page or account',
    displayOptions: show(['import']),
  },
  {
    displayName: 'Max Comments',
    name: 'importLimit',
    type: 'number',
    typeOptions: { minValue: 1, maxValue: 1000 },
    default: 200,
    description: 'Max number of comments to import',
    displayOptions: show(['import']),
  },
]

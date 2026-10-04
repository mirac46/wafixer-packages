import type { INodeProperties } from 'n8n-workflow'

const show = (operation: string[]) => ({ show: { resource: ['lead'], operation } })

const leadStatusOptions = [
  { name: 'Contacted', value: 'contacted' },
  { name: 'Discarded', value: 'discarded' },
  { name: 'New', value: 'new' },
  { name: 'Qualified', value: 'qualified' },
]

export const leadOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['lead'] } },
    default: 'getAll',
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get a Facebook lead by its WAFixer ID',
        action: 'Get a lead',
      },
      {
        name: 'Get Forms',
        value: 'getForms',
        description: 'List the lead forms of the connected Pages',
        action: 'Get lead forms',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'List Facebook leads of the session, newest first',
        action: 'Get many leads',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Change the status, note or read flag of a lead',
        action: 'Update a lead',
      },
    ],
  },
]

export const leadFields: INodeProperties[] = [
  // ─────────── get / update ───────────
  {
    displayName: 'Lead ID',
    name: 'leadId',
    type: 'string',
    default: '={{ $json.data?.id ?? $json.id }}',
    required: true,
    description: 'WAFixer lead ID. The default reads it from a WAFixer Trigger lead event or a listed lead.',
    displayOptions: show(['get', 'update']),
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: show(['update']),
    options: [
      {
        displayName: 'Note',
        name: 'note',
        type: 'string',
        typeOptions: { rows: 2 },
        default: '',
        description: 'Internal note, up to 2000 characters. Empty clears the note.',
      },
      {
        displayName: 'Read',
        name: 'read',
        type: 'boolean',
        default: true,
        description: 'Whether the lead is marked as read',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: 'contacted',
        options: leadStatusOptions,
      },
    ],
  },

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
    displayOptions: { show: { resource: ['lead'], operation: ['getAll'], returnAll: [false] } },
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
        displayName: 'Fetch Status',
        name: 'fetchStatus',
        type: 'options',
        default: 'fetched',
        description: 'Failed leads could not be read from Meta after all retries',
        options: [
          { name: 'Failed', value: 'failed' },
          { name: 'Fetched', value: 'fetched' },
          { name: 'Pending', value: 'pending' },
        ],
      },
      {
        displayName: 'Form ID',
        name: 'formId',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Page ID',
        name: 'pageId',
        type: 'string',
        default: '',
        description: 'Facebook Page ID',
      },
      {
        displayName: 'Since',
        name: 'since',
        type: 'dateTime',
        default: '',
        description: 'Only leads submitted at or after this time',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'multiOptions',
        default: [],
        options: leadStatusOptions,
      },
      {
        displayName: 'Unread Only',
        name: 'unread',
        type: 'boolean',
        default: false,
        description: 'Whether to return only unread leads',
      },
      {
        displayName: 'Until',
        name: 'until',
        type: 'dateTime',
        default: '',
        description: 'Only leads submitted before this time',
      },
      {
        displayName: 'Updated Since',
        name: 'updatedSince',
        type: 'dateTime',
        default: '',
        description: 'Only leads changed at or after this time. Use it to catch up on missed events.',
      },
    ],
  },

  // ─────────── getForms ───────────
  {
    displayName: 'Options',
    name: 'formOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: show(['getForms']),
    options: [
      {
        displayName: 'Page ID',
        name: 'pageId',
        type: 'string',
        default: '',
        description: 'Only forms of this Facebook Page',
      },
      {
        displayName: 'Sync From Meta',
        name: 'sync',
        type: 'boolean',
        default: false,
        description: 'Whether to read the forms from Meta again before listing them',
      },
    ],
  },
]

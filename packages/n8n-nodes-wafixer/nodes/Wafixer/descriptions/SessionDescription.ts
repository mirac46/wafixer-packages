import type { INodeProperties } from 'n8n-workflow'

export const sessionOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['session'] } },
    default: 'getConnectionState',
    options: [
      {
        name: 'Get Connection State',
        value: 'getConnectionState',
        description:
          'Get the connection state of the session: open, connecting or close. QR sessions also return the automatic reconnect state.',
        action: 'Get the connection state',
      },
      {
        name: 'Get Many',
        value: 'listSessions',
        description: 'List the sessions the API key can access, with channel and connection status',
        action: 'Get many sessions',
      },
      {
        name: 'Restart',
        value: 'restart',
        description:
          'Restart the session and reset its automatic reconnect counter. A QR session that is not paired produces a new QR code.',
        action: 'Restart a session',
      },
    ],
  },
]

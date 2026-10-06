import type { INodeProperties } from 'n8n-workflow'
import { describe, expect, it } from 'vitest'
import { WEBHOOK_EVENTS } from 'wafixer-sdk'

import { Wafixer } from '../nodes/Wafixer/Wafixer.node'
import { ALL_EVENTS, WafixerTrigger } from '../nodes/WafixerTrigger/WafixerTrigger.node'

const properties = new Wafixer().description.properties

function operationValues(resource: string): string[] {
  const property = properties.find(
    (p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes(resource),
  )
  return (property?.options ?? []).map((option) => ('value' in option ? String(option.value) : ''))
}

function shownFor(property: INodeProperties, key: string): string[] {
  const values = property.displayOptions?.show?.[key]
  return Array.isArray(values) ? values.map(String) : []
}

describe('WAFixer action node description', () => {
  it('has chat, comment, lead, message and session resources with message as default', () => {
    const resource = properties.find((p) => p.name === 'resource')
    expect(resource?.default).toBe('message')
    expect((resource?.options ?? []).map((o) => ('value' in o ? o.value : null))).toEqual([
      'chat',
      'comment',
      'lead',
      'message',
      'session',
    ])
  })

  it('message operations are sorted and include the new operations', () => {
    const operation = properties.find((p) => p.name === 'operation' && shownFor(p, 'resource').includes('message'))
    const names = (operation?.options ?? []).map((o) => ('name' in o ? String(o.name) : ''))
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')))
    for (const value of ['sendPtv', 'sendTemplate', 'sendStatus', 'deleteForEveryone', 'editMessage', 'downloadMedia']) {
      expect(operationValues('message')).toContain(value)
    }
  })

  it('offers chat and session operations', () => {
    expect(operationValues('chat')).toEqual([
      'archiveChat',
      'updateBlockStatus',
      'checkNumbers',
      'findChat',
      'findChats',
      'findContacts',
      'findMessages',
      'fetchProfilePicture',
      'markChatUnread',
    ])
    expect(operationValues('session')).toEqual(['getConnectionState', 'listSessions', 'restart'])
  })

  it('session field is hidden only for the session list', () => {
    const instance = properties.find((p) => p.name === 'instance')
    expect(instance?.displayOptions).toEqual({ hide: { operation: ['listSessions'] } })
    for (const resource of ['message', 'chat', 'comment', 'lead']) expect(operationValues(resource)).not.toContain('listSessions')
  })

  it('keeps message operations and default for existing workflows', () => {
    const operation = properties.find((p) => p.name === 'operation' && shownFor(p, 'resource').includes('message'))
    expect(operation?.default).toBe('sendText')
    expect(operationValues('message')).toContain('replyTo')
  })

  it('offers comment and lead operations', () => {
    expect(operationValues('comment')).toEqual(['delete', 'getAll', 'hide', 'import', 'markRead', 'privateReply', 'reply'])
    expect(operationValues('lead')).toEqual(['get', 'getForms', 'getAll', 'update'])
  })

  it('operation values do not collide between message and the other resources', () => {
    const message = new Set(operationValues('message'))
    for (const value of ['comment', 'lead', 'chat', 'session'].flatMap(operationValues)) expect(message.has(value)).toBe(false)
  })

  it('every field shown for an operation refers to an existing operation of its resource', () => {
    const resources = ['message', 'comment', 'lead', 'chat', 'session']
    for (const property of properties) {
      const operations = shownFor(property, 'operation')
      if (!operations.length) continue
      const scope = shownFor(property, 'resource')
      const allowed = new Set((scope.length ? scope : resources).flatMap(operationValues))
      for (const operation of operations) expect(allowed.has(operation), `${property.name} → ${operation}`).toBe(true)
    }
  })

  it('sendText has Messenger/Instagram options (human agent, quick replies)', () => {
    const meta = properties.find((p) => p.name === 'metaOptions')
    expect(meta?.displayOptions?.show?.operation).toEqual(['sendText', 'replyTo'])
    expect((meta?.options ?? []).map((o) => ('name' in o ? o.name : ''))).toEqual(['humanAgent', 'quickReplies'])
  })
})

describe('WAFixer Trigger description', () => {
  const trigger = new WafixerTrigger().description
  const events = trigger.properties.find((p) => p.name === 'events')
  const values = (events?.options ?? []).map((o) => ('value' in o ? String(o.value) : ''))

  it('offers comment and lead events', () => {
    for (const name of [
      'COMMENT_RECEIVED',
      'COMMENT_UPDATED',
      'COMMENT_REMOVED',
      'COMMENT_REPLY_SENT',
      'COMMENT_PRIVATE_REPLY_SENT',
      'LEAD_RECEIVED',
      'LEAD_UPDATED',
    ]) {
      expect(values).toContain(name)
    }
  })

  it('offers every event accepted by webhook/set', () => {
    expect([...values].sort()).toEqual([...WEBHOOK_EVENTS].sort())
  })

  it('selecting nothing registers all events except the history sync events', () => {
    expect(ALL_EVENTS).not.toContain('MESSAGES_SET')
    expect(ALL_EVENTS).not.toContain('CONTACTS_SET')
    expect(ALL_EVENTS).not.toContain('CHATS_SET')
    expect(ALL_EVENTS).toContain('QRCODE_UPDATED')
    expect(ALL_EVENTS.length).toBe(WEBHOOK_EVENTS.length - 3)
  })

  it('every selectable event is accepted by webhook/set', () => {
    const accepted = new Set<string>(WEBHOOK_EVENTS)
    for (const value of [...values, ...ALL_EVENTS]) expect(accepted.has(value), value).toBe(true)
    expect(values).not.toContain('GROUPS_UPDATE')
  })

  it('has a channel filter option', () => {
    const options = trigger.properties.find((p) => p.name === 'options')
    const channels = (options?.options ?? []).find((o) => 'name' in o && o.name === 'channels')
    expect(channels).toBeDefined()
  })
})

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
  it('has message, comment and lead resources with message as default', () => {
    const resource = properties.find((p) => p.name === 'resource')
    expect(resource?.default).toBe('message')
    expect((resource?.options ?? []).map((o) => ('value' in o ? o.value : null))).toEqual(['comment', 'lead', 'message'])
  })

  it('keeps message operations and default for existing workflows', () => {
    const operation = properties.find((p) => p.name === 'operation' && shownFor(p, 'resource').includes('message'))
    expect(operation?.default).toBe('sendText')
    expect(operationValues('message')).toContain('replyTo')
  })

  it('offers comment and lead operations', () => {
    expect(operationValues('comment')).toEqual(['getAll', 'import', 'markRead', 'reply'])
    expect(operationValues('lead')).toEqual(['get', 'getForms', 'getAll', 'update'])
  })

  it('operation values do not collide between message and the new resources', () => {
    const message = new Set(operationValues('message'))
    for (const value of [...operationValues('comment'), ...operationValues('lead')]) expect(message.has(value)).toBe(false)
  })

  it('every field shown for an operation refers to an existing operation of its resource', () => {
    const resources = ['message', 'comment', 'lead']
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
    for (const name of ['COMMENT_RECEIVED', 'COMMENT_UPDATED', 'COMMENT_REMOVED', 'COMMENT_REPLY_SENT', 'LEAD_RECEIVED', 'LEAD_UPDATED']) {
      expect(values).toContain(name)
    }
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

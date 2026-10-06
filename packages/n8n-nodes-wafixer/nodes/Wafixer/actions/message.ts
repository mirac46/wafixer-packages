import { NodeOperationError, type IDataObject, type IExecuteFunctions } from 'n8n-workflow'
import type { SendStatusInput, Wafixer } from 'wafixer-sdk'

import { jsonParameter, messageKeyParameter, requiredText } from './parameters'

export const MESSAGE_EXTRA_OPERATIONS = [
  'sendPtv',
  'sendTemplate',
  'sendStatus',
  'deleteForEveryone',
  'editMessage',
  'downloadMedia',
] as const

type StatusOptions = { caption?: string; backgroundColor?: string; font?: number }

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function statusInput(ctx: IExecuteFunctions, i: number): SendStatusInput {
  const type = ctx.getNodeParameter('statusType', i) as SendStatusInput['type']
  const content = requiredText(ctx, 'statusContent', i, 'Status content is required')
  const audience = ctx.getNodeParameter('statusAudience', i, 'all') as 'all' | 'list'
  const options = ctx.getNodeParameter('statusOptions', i, {}) as StatusOptions
  const input: SendStatusInput = { type, content }
  if (audience === 'all') {
    input.allContacts = true
  } else {
    input.statusJidList = splitList(ctx.getNodeParameter('statusNumbers', i, '') as string)
    if (!input.statusJidList.length) {
      throw new NodeOperationError(ctx.getNode(), 'Enter at least one number', { itemIndex: i })
    }
  }
  if (options.caption) input.caption = options.caption
  if (type === 'text' && options.backgroundColor) input.backgroundColor = options.backgroundColor
  if (type === 'text' && options.font !== undefined) input.font = options.font
  return input
}

type MediaEvent = { instance?: string; data?: { key?: unknown; message?: unknown } }

export async function executeMessageExtraOperation(
  ctx: IExecuteFunctions,
  wa: Wafixer,
  instance: string,
  operation: string,
  i: number,
): Promise<IDataObject> {
  switch (operation) {
    case 'sendPtv': {
      const number = requiredText(ctx, 'number', i, 'Number is required')
      const video = requiredText(ctx, 'ptvVideo', i, 'Video is required')
      return wa.messages.sendPtv<IDataObject>(instance, { number, video })
    }
    case 'sendTemplate': {
      const number = requiredText(ctx, 'number', i, 'Number is required')
      const name = requiredText(ctx, 'templateName', i, 'Template name is required')
      const language = requiredText(ctx, 'templateLanguage', i, 'Template language is required')
      const components = jsonParameter(ctx, 'templateComponents', i) ?? []
      return wa.messages.sendTemplate<IDataObject>(instance, { number, name, language, components })
    }
    case 'sendStatus':
      return wa.messages.sendStatus<IDataObject>(instance, statusInput(ctx, i))
    case 'deleteForEveryone':
      return wa.messages.deleteForEveryone<IDataObject>(instance, messageKeyParameter(ctx, 'messageKey', i))
    case 'editMessage': {
      const key = messageKeyParameter(ctx, 'messageKey', i)
      const text = requiredText(ctx, 'editText', i, 'New text is required')
      return wa.messages.updateMessage<IDataObject>(instance, { number: key.remoteJid.replace(/@.+$/, ''), key, text })
    }
    case 'downloadMedia': {
      const event = jsonParameter(ctx, 'mediaEvent', i) as MediaEvent | null
      if (!event?.data?.key || !event.data.message) {
        throw new NodeOperationError(ctx.getNode(), 'The input is not a message event with media', { itemIndex: i })
      }
      return wa.messages.downloadMedia<IDataObject>({
        instance: event.instance ?? instance,
        data: { key: event.data.key, message: event.data.message },
      })
    }
    default:
      throw new NodeOperationError(ctx.getNode(), `Unknown message operation: ${operation}`, { itemIndex: i })
  }
}

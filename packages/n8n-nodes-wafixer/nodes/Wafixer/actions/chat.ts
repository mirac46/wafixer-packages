import { NodeOperationError, type IDataObject, type IExecuteFunctions } from 'n8n-workflow'
import type { FindContactsInput, Wafixer } from 'wafixer-sdk'

import { messageKeyParameter, requiredText } from './parameters'

type ContactFilters = { pushName?: string; remoteJid?: string }
type MessagePage = { messages?: { total?: number; pages?: number; currentPage?: number; records?: IDataObject[] } }

function asItems(value: unknown): IDataObject[] {
  return Array.isArray(value) ? (value as IDataObject[]) : [(value ?? {}) as IDataObject]
}

/** Her mesaj ayrı öğe olur; sayfa bilgisi her öğede kalır ki sonraki sayfa ifadeyle istenebilsin. */
async function findMessages(ctx: IExecuteFunctions, wa: Wafixer, instance: string, i: number): Promise<IDataObject[]> {
  const remoteJid = requiredText(ctx, 'remoteJid', i, 'Remote JID is required')
  const offset = ctx.getNodeParameter('messageLimit', i, 25) as number
  const page = ctx.getNodeParameter('messagePage', i, 1) as number
  const response = await wa.chat.findMessages<MessagePage>(instance, { where: { key: { remoteJid } }, offset, page })
  const { records = [], ...meta } = response.messages ?? {}
  return records.map((record) => ({ ...record, _page: meta }))
}

export async function executeChatOperation(
  ctx: IExecuteFunctions,
  wa: Wafixer,
  instance: string,
  operation: string,
  i: number,
): Promise<IDataObject[]> {
  switch (operation) {
    case 'checkNumbers': {
      const numbers = (ctx.getNodeParameter('checkNumbers', i) as string)
        .split(',')
        .map((number) => number.trim().replace(/^\+/, ''))
        .filter(Boolean)
      if (!numbers.length) throw new NodeOperationError(ctx.getNode(), 'Enter at least one number', { itemIndex: i })
      return asItems(await wa.chat.checkNumbers(instance, { numbers: [...new Set(numbers)] }))
    }
    case 'fetchProfilePicture': {
      const number = requiredText(ctx, 'chatNumber', i, 'Number is required')
      return [{ ...(await wa.chat.fetchProfilePictureUrl(instance, number)) }]
    }
    case 'updateBlockStatus': {
      const number = requiredText(ctx, 'chatNumber', i, 'Number is required')
      const status = ctx.getNodeParameter('blockStatus', i) as 'block' | 'unblock'
      return asItems(await wa.chat.updateBlockStatus(instance, { number, status }))
    }
    case 'findChat': {
      const remoteJid = requiredText(ctx, 'remoteJid', i, 'Remote JID is required')
      return asItems(await wa.chat.findChatByRemoteJid(instance, remoteJid))
    }
    case 'findChats':
      return asItems(await wa.chat.findChats(instance))
    case 'findContacts': {
      const filters = ctx.getNodeParameter('contactFilters', i, {}) as ContactFilters
      const where: FindContactsInput['where'] = {}
      if (filters.pushName?.trim()) where.pushName = filters.pushName.trim()
      if (filters.remoteJid?.trim()) where.remoteJid = filters.remoteJid.trim()
      return asItems(await wa.chat.findContacts(instance, Object.keys(where).length ? { where } : {}))
    }
    case 'findMessages':
      return findMessages(ctx, wa, instance, i)
    case 'archiveChat': {
      const key = messageKeyParameter(ctx, 'lastMessageKey', i)
      const archive = ctx.getNodeParameter('archive', i, true) as boolean
      return asItems(await wa.chat.archiveChat(instance, { chat: key.remoteJid, lastMessage: { key }, archive }))
    }
    case 'markChatUnread': {
      const key = messageKeyParameter(ctx, 'lastMessageKey', i)
      return asItems(await wa.chat.markChatUnread(instance, { chat: key.remoteJid, lastMessage: { key } }))
    }
    default:
      throw new NodeOperationError(ctx.getNode(), `Unknown chat operation: ${operation}`, { itemIndex: i })
  }
}

import { NodeOperationError, type IExecuteFunctions } from 'n8n-workflow'
import type { MessageKey } from 'wafixer-sdk'

/**
 * Kimlik alanları ifadeyle dolar (`$json.data?.comment?.id`); girdide alan yoksa boş kalır ve
 * istek yanlış adrese gitmeden burada durur.
 */
export function requiredText(ctx: IExecuteFunctions, name: string, i: number, message: string): string {
  const value = ctx.getNodeParameter(name, i, '')
  const text = typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
  if (!text) throw new NodeOperationError(ctx.getNode(), message, { itemIndex: i })
  return text
}

/** JSON alanı ifadeyle nesne, elle yazılınca metin olarak gelir. */
export function jsonParameter(ctx: IExecuteFunctions, name: string, i: number): unknown {
  const value = ctx.getNodeParameter(name, i)
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    throw new NodeOperationError(ctx.getNode(), `${name} is not valid JSON`, { itemIndex: i })
  }
}

/** Tetikleyiciden gelen mesaj anahtarı; sunucu boş `participant` alanını reddettiği için yalnız doluysa eklenir. */
export function messageKeyParameter(ctx: IExecuteFunctions, name: string, i: number): MessageKey {
  const key = jsonParameter(ctx, name, i) as Partial<MessageKey> | null
  if (!key?.id || !key.remoteJid || typeof key.fromMe !== 'boolean') {
    throw new NodeOperationError(ctx.getNode(), 'Message key needs id, remoteJid and fromMe', { itemIndex: i })
  }
  return {
    id: key.id,
    remoteJid: key.remoteJid,
    fromMe: key.fromMe,
    ...(key.participant ? { participant: key.participant } : {}),
  }
}

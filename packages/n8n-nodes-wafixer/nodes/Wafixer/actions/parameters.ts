import { NodeOperationError, type IExecuteFunctions } from 'n8n-workflow'

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

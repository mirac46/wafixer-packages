import { NodeApiError, type IDataObject, type INode, type JsonObject } from 'n8n-workflow'
import {
  WafixerChannelAuthError,
  WafixerError,
  WafixerPermissionError,
  WafixerRateLimitError,
  WafixerUnavailableError,
  WafixerUnsupportedChannelError,
  WafixerWindowClosedError,
} from 'wafixer-sdk'

/** Kullanıcının yapabileceği bir sonraki adımı anlatır; n8n hata panelinde açıklama olarak görünür. */
export function describeWafixerError(error: WafixerError): string | undefined {
  if (error instanceof WafixerWindowClosedError) {
    return error.humanAgentAvailable
      ? `The 24-hour messaging window is closed. A person can still reply with "Human Agent" enabled until ${error.humanAgentExpires ?? 'the human agent window ends'}`
      : 'The 24-hour messaging window is closed. The contact has to write again before the next reply'
  }
  if (error instanceof WafixerUnsupportedChannelError) {
    return `This operation is not available on the channel of this session${error.operation ? ` (${error.operation})` : ''}`
  }
  if (error instanceof WafixerPermissionError && error.missingScopes.length) {
    return `The Meta connection is missing permissions: ${error.missingScopes.join(', ')}. Reconnect the session in WAFixer`
  }
  if (error instanceof WafixerChannelAuthError) {
    return 'The Meta connection of this session is no longer valid. Reconnect it in WAFixer'
  }
  if (error instanceof WafixerRateLimitError && error.retryAfter !== null) {
    return `Rate limited by WAFixer. Retry after ${error.retryAfter} seconds`
  }
  if (error instanceof WafixerUnavailableError) {
    return 'This feature is not enabled on the WAFixer server yet'
  }
  return undefined
}

/** `continueOnFail` çıktısı: mesaj, sunucu kodu ve ayrıntı. */
export function errorOutput(error: unknown): IDataObject {
  if (error instanceof WafixerError) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...(error.details ? { details: error.details as IDataObject } : {}),
    }
  }
  return { error: error instanceof Error ? error.message : String(error) }
}

/** SDK hatasını n8n'in API hatasına çevirir; diğer hatalar olduğu gibi döner. */
export function toNodeError(node: INode, error: unknown, itemIndex: number): Error {
  if (!(error instanceof WafixerError)) return error instanceof Error ? error : new Error(String(error))
  const body: JsonObject = {
    message: error.message,
    code: error.code,
    ...(error.details ? { details: error.details as JsonObject } : {}),
  }
  return new NodeApiError(node, body, {
    message: error.message,
    description: describeWafixerError(error),
    httpCode: error.status === null ? undefined : String(error.status),
    itemIndex,
  })
}

import { NodeApiError, type IDataObject, type INode, type JsonObject } from 'n8n-workflow'
import {
  WafixerChannelAuthError,
  WafixerConflictError,
  WafixerError,
  WafixerPermissionError,
  WafixerRateLimitError,
  WafixerUnavailableError,
  WafixerUnsupportedChannelError,
  WafixerWindowClosedError,
} from 'wafixer-sdk'

// Yorum moderasyonunda 409 yanıtının `details.reason` değerleri.
const CONFLICT_REASONS: Record<string, string> = {
  private_reply_already_sent: 'A private reply was already sent to this comment. Meta allows one per comment',
  private_reply_not_allowed: 'Meta does not allow a private reply to this comment',
  comment_removed: 'The comment was deleted',
  own_comment: 'This is a comment of the Page or account itself',
}

/** Kullanıcının yapabileceği bir sonraki adımı anlatır; n8n hata panelinde açıklama olarak görünür. */
export function describeWafixerError(error: WafixerError): string | undefined {
  if (error instanceof WafixerWindowClosedError && error.window === 'private_reply') {
    return 'Private replies are only possible within 7 days after the comment'
  }
  if (error instanceof WafixerConflictError && error.reason && CONFLICT_REASONS[error.reason]) {
    return CONFLICT_REASONS[error.reason]
  }
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

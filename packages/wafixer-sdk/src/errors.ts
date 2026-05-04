/**
 * SDK içinde HTTP hatalarını anlamlı bir TS class'ına sarmalar.
 */
export class WafixerError extends Error {
  public readonly status: number | null
  public readonly code: string | null
  public readonly response: unknown

  constructor(
    message: string,
    options: {
      status?: number | null
      code?: string | null
      response?: unknown
    } = {},
  ) {
    super(message)
    this.name = 'WafixerError'
    this.status = options.status ?? null
    this.code = options.code ?? null
    this.response = options.response
  }
}

export class WafixerAuthError extends WafixerError {
  constructor(message = 'Yetkisiz erişim — apiKey hatalı veya eksik.') {
    super(message, { status: 401, code: 'UNAUTHORIZED' })
    this.name = 'WafixerAuthError'
  }
}

export class WafixerNotFoundError extends WafixerError {
  constructor(message = 'Kaynak bulunamadı.') {
    super(message, { status: 404, code: 'NOT_FOUND' })
    this.name = 'WafixerNotFoundError'
  }
}

export class WafixerValidationError extends WafixerError {
  constructor(message: string, response?: unknown) {
    super(message, { status: 400, code: 'BAD_REQUEST', response })
    this.name = 'WafixerValidationError'
  }
}

import type { IncomingHttpHeaders } from 'node:http'
import type {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  INode,
  INodeExecutionData,
  IWebhookFunctions,
} from 'n8n-workflow'

export const testNode: INode = {
  id: 'node-1',
  name: 'WAFixer',
  type: 'n8n-nodes-wafixer.wafixer',
  typeVersion: 1,
  position: [0, 0],
  parameters: {},
}

type Params = Record<string, unknown>

// n8n bağlamları onlarca üye taşır; sahte bağlam yalnız düğümün çağırdıklarını sağlar ve
// her üye kendi tipine daraltılır (aşırı yüklü getNodeParameter tek gövdeyle yazılamaz).

function readParameter(params: Params, name: string, fallback?: unknown): unknown {
  if (name in params) return params[name]
  if (fallback !== undefined) return fallback
  throw new Error(`Test parametresi yok: ${name}`)
}

function credentials(baseUrl: string) {
  return async (_type: string) => ({ baseUrl, apiKey: 'test-key' })
}

const returnJsonArray = (data: IDataObject | IDataObject[]): INodeExecutionData[] =>
  (Array.isArray(data) ? data : [data]).map((json) => ({ json }))

/** n8n'in yürütme bağlamından düğümün kullandığı kadarı; her öğe aynı parametreleri okur. */
export function executeContext(
  baseUrl: string,
  params: Params,
  options: { items?: number; continueOnFail?: boolean } = {},
): IExecuteFunctions {
  const getNodeParameter = (name: string, _itemIndex: number, fallback?: unknown) => readParameter(params, name, fallback)
  const context: Partial<IExecuteFunctions> = {
    getInputData: () => Array.from({ length: options.items ?? 1 }, () => ({ json: {} })),
    getNodeParameter: getNodeParameter as IExecuteFunctions['getNodeParameter'],
    getCredentials: credentials(baseUrl) as IExecuteFunctions['getCredentials'],
    getNode: () => testNode,
    continueOnFail: () => options.continueOnFail ?? false,
    helpers: { returnJsonArray } as IExecuteFunctions['helpers'],
  }
  return context as IExecuteFunctions
}

export function hookContext(baseUrl: string, params: Params, webhookUrl: string): IHookFunctions {
  const getNodeParameter = (name: string, fallback?: unknown) => readParameter(params, name, fallback)
  const context: Partial<IHookFunctions> = {
    getNodeParameter: getNodeParameter as IHookFunctions['getNodeParameter'],
    getCredentials: credentials(baseUrl) as IHookFunctions['getCredentials'],
    getNodeWebhookUrl: () => webhookUrl,
    getNode: () => testNode,
  }
  return context as IHookFunctions
}

type FakeRequest = { headers: IncomingHttpHeaders; rawBody: Buffer | undefined }
type FakeResponse = { status(code: number): FakeResponse; json(payload?: unknown): FakeResponse }

export type WebhookRequest = {
  headers?: IncomingHttpHeaders
  rawBody?: Buffer
  signingSecret?: string
  /** Düğümün kendisi yanıt verirse durum kodu buraya yazılır. */
  response?: { status?: number; body?: unknown }
}

export function webhookContext(params: Params, body: IDataObject, request: WebhookRequest = {}): IWebhookFunctions {
  const getNodeParameter = (name: string, fallback?: unknown) => readParameter(params, name, fallback)
  const response: FakeResponse = {
    status(code) {
      if (request.response) request.response.status = code
      return response
    },
    json(payload) {
      if (request.response) request.response.body = payload
      return response
    },
  }
  const requestObject = (): FakeRequest => ({ headers: request.headers ?? {}, rawBody: request.rawBody })
  const responseObject = (): FakeResponse => response
  const context: Partial<IWebhookFunctions> = {
    getBodyData: () => body,
    getCredentials: (async () => ({
      baseUrl: 'http://unused',
      apiKey: 'test-key',
      ...(request.signingSecret === undefined ? {} : { webhookSigningSecret: request.signingSecret }),
    })) as IWebhookFunctions['getCredentials'],
    getRequestObject: requestObject as IWebhookFunctions['getRequestObject'],
    getResponseObject: responseObject as IWebhookFunctions['getResponseObject'],
    getNodeParameter: getNodeParameter as IWebhookFunctions['getNodeParameter'],
    getNode: () => testNode,
    helpers: { returnJsonArray } as IWebhookFunctions['helpers'],
  }
  return context as IWebhookFunctions
}

export function loadOptionsContext(baseUrl: string): ILoadOptionsFunctions {
  const context: Partial<ILoadOptionsFunctions> = {
    getCredentials: credentials(baseUrl) as ILoadOptionsFunctions['getCredentials'],
    getNode: () => testNode,
  }
  return context as ILoadOptionsFunctions
}

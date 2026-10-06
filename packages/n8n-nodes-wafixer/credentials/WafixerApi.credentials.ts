import type {
  ICredentialTestRequest,
  ICredentialType,
  IAuthenticateGeneric,
  INodeProperties,
} from 'n8n-workflow'

export class WafixerApi implements ICredentialType {
  name = 'wafixerApi'
  displayName = 'WAFixer API'
  documentationUrl = 'https://github.com/mirac46/wafixer-packages#readme'

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://wafixer.com',
      placeholder: 'https://wafixer.com',
      description:
        'Base URL of the WAFixer API, without a trailing slash. Keep https://wafixer.com unless WAFixer gave you another address.',
      required: true,
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description: 'API key from WAFixer panel → Settings → API Keys (starts with wfx_)',
      required: true,
    },
    {
      displayName: 'Webhook Signing Secret',
      name: 'webhookSigningSecret',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description:
        'Optional. When set, WAFixer Trigger rejects events without a valid X-Wafixer-Signature (HTTP 401). Create it with POST /webhook/signingSecret/{session} (starts with whsec_) and set the same value here. Leave empty to accept unsigned events.',
    },
  ]

  /**
   * Tüm HTTP isteklerine `apikey` header'ını otomatik ekler.
   */
  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        apikey: '={{$credentials.apiKey}}',
      },
    },
  }

  /**
   * "Test" butonu için doğrulama: instance listesini çekmeyi dener.
   */
  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl.replace(/\\/+$/, "")}}',
      url: '/instance/fetchInstances',
      method: 'GET',
    },
  }
}

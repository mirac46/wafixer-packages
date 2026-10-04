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
      description: 'Base URL of the WAFixer installation, without a trailing slash',
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

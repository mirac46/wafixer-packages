import type {
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from 'n8n-workflow'

import { Wafixer as WafixerClient, type WafixerInstance } from 'wafixer-sdk'

type WafixerCredentials = {
  baseUrl: string
  apiKey: string
}

const META_CHANNEL_LABELS: Record<string, string> = { MESSENGER: 'Messenger', INSTAGRAM: 'Instagram' }

// Eski sunucular `channel` alanını döndürmez; o durumda entegrasyon adına bakılır.
function metaChannelLabel(instance: WafixerInstance): string | null {
  return META_CHANNEL_LABELS[instance.channel ?? instance.integration ?? ''] ?? null
}

function normalizePhone(instance: WafixerInstance): string | null {
  return instance.number ?? instance.ownerJid?.replace(/@.+$/, '') ?? null
}

function statusLabel(instance: WafixerInstance): string {
  if (instance.connectionStatus === 'open') return 'Active'
  if (instance.integration === 'WHATSAPP-BAILEYS') return 'QR Required'
  if (metaChannelLabel(instance)) return 'Reconnect Required'
  if (instance.connectionStatus === 'connecting') return 'Connecting'
  return 'Not Active'
}

function sortInstances(a: WafixerInstance, b: WafixerInstance): number {
  const rank = (instance: WafixerInstance) => (instance.connectionStatus === 'open' ? 0 : 1)
  return rank(a) - rank(b) || a.name.localeCompare(b.name)
}

function toOption(instance: WafixerInstance): INodePropertyOptions {
  const label = statusLabel(instance)
  // Messenger/Instagram'da telefon yok; ad yanında kanal gösterilir.
  const suffix = metaChannelLabel(instance) ?? normalizePhone(instance)
  const profile = instance.profileName ? `${instance.profileName} / ` : ''
  const detail = suffix ? ` (${suffix})` : ''

  return {
    name: `${label} - ${profile}${instance.name}${detail}`,
    value: instance.name,
    description:
      instance.connectionStatus === 'open'
        ? 'Connected session. Ready for n8n actions and triggers'
        : 'This session must be reconnected from WAFixer before it can send or trigger messages',
  }
}

export const wafixerLoadOptions = {
  loadOptions: {
    async getInstances(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
      const creds = (await this.getCredentials('wafixerApi')) as WafixerCredentials
      const wa = new WafixerClient({
        baseUrl: creds.baseUrl,
        apiKey: creds.apiKey,
      })

      const instances = await wa.instances.list()
      if (!Array.isArray(instances) || instances.length === 0) {
        return [
          {
            name: 'No WAFixer Sessions Found',
            value: '',
            description: 'Create or connect a session in WAFixer first',
          },
        ]
      }

      return instances.sort(sortInstances).map(toOption)
    },
  },
}

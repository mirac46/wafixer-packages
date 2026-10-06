import type { Wafixer } from '../client'
import type {
  ArchiveChatInput,
  CheckNumbersInput,
  FindChatsInput,
  FindContactsInput,
  FindMessagesInput,
  MarkChatUnreadInput,
  MarkMessagesAsReadInput,
  ProfilePictureResponse,
  SendPresenceInput,
  UpdateBlockStatusInput,
  UpdatePresenceInput,
  WhatsAppNumberResult,
} from '../types/messages'
import type { MessageData } from '../types/events'

/**
 * Sohbet (chat) seviyesinde mesaj davranışları:
 *  - Mesajları okundu olarak işaretle
 *  - Yazıyor / kaydediyor / online göstergesi (presence)
 *  - Sohbet arşivle
 *  - Sohbeti okunmamış işaretle
 *  - Numara kontrolü, profil resmi, engelleme
 *  - Kayıtlı kişi, sohbet ve mesajları arama
 */
export class Chat {
  constructor(private readonly client: Wafixer) {}

  private path(instance: string, action: string): string {
    return `/chat/${action}/${encodeURIComponent(instance)}`
  }

  /**
   * Bir veya birden fazla mesajı **okundu** olarak işaretler.
   * Mavi tik atılır.
   */
  public async markAsRead<T = unknown>(
    instance: string,
    input: MarkMessagesAsReadInput,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'markMessageAsRead'),
      data: input,
    })
  }

  /**
   * Webhook'tan gelen mesajı doğrudan okundu olarak işaretler.
   */
  public async markEventAsRead<T = unknown>(event: {
    instance: string
    data: MessageData
  }): Promise<T> {
    return this.markAsRead<T>(event.instance, {
      readMessages: [event.data.key],
    })
  }

  /**
   * "Yazıyor / kaydediyor / online" durumunu gösterir.
   *
   *   presence: 'composing' → "yazıyor..."
   *   presence: 'recording' → "ses kaydediyor..."
   *   presence: 'available' → online
   *   presence: 'paused'    → yazımı bıraktı
   */
  public async sendPresence<T = unknown>(
    instance: string,
    input: SendPresenceInput,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendPresence'),
      data: input,
    })
  }

  /**
   * Anlık presence — `sendPresence`'ın aksine beklemez, çağrıyı bloklamaz.
   * Canlı gelen kutusu için: kullanıcı yazdıkça 'composing', bırakınca 'paused'
   * gönderirsiniz. Göstergeyi kapatmak çağıranın sorumluluğunda.
   *
   * `presence` boş + `subscribe: true` → sadece abone olur, karşı tarafa
   * hiçbir bildirim gitmez.
   */
  public async updatePresence<T = unknown>(
    instance: string,
    input: UpdatePresenceInput,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'updatePresence'),
      data: input,
    })
  }

  /** Sohbeti arşivle / arşivden çıkar. */
  public async archiveChat<T = unknown>(
    instance: string,
    input: ArchiveChatInput,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'archiveChat'),
      data: input,
    })
  }

  /**
   * Numaraların WhatsApp'ta kayıtlı olup olmadığını sorar; yalnız WhatsApp oturumlarında anlamlıdır.
   */
  public async checkNumbers(instance: string, input: CheckNumbersInput): Promise<WhatsAppNumberResult[]> {
    return this.client.request<WhatsAppNumberResult[]>({
      method: 'POST',
      url: this.path(instance, 'whatsappNumbers'),
      data: input,
    })
  }

  /** Kişinin profil resmi adresi; gizli ya da yoksa `profilePictureUrl: null`. */
  public async fetchProfilePictureUrl(instance: string, number: string): Promise<ProfilePictureResponse> {
    return this.client.request<ProfilePictureResponse>({
      method: 'POST',
      url: this.path(instance, 'fetchProfilePictureUrl'),
      data: { number },
    })
  }

  /** Kişiyi engeller ya da engelini kaldırır. */
  public async updateBlockStatus<T = unknown>(instance: string, input: UpdateBlockStatusInput): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'updateBlockStatus'),
      data: input,
    })
  }

  /** Oturumun kayıtlı kişileri; `where` boşsa hepsi. */
  public async findContacts<T = unknown[]>(instance: string, input: FindContactsInput = {}): Promise<T> {
    return this.client.request<T>({ method: 'POST', url: this.path(instance, 'findContacts'), data: input })
  }

  /** Oturumun sohbetleri, son mesaja göre sıralı. */
  public async findChats<T = unknown[]>(instance: string, input: FindChatsInput = {}): Promise<T> {
    return this.client.request<T>({ method: 'POST', url: this.path(instance, 'findChats'), data: input })
  }

  /** Tek sohbet; `remoteJid` webhook olayındaki `data.key.remoteJid` değeridir. */
  public async findChatByRemoteJid<T = unknown>(instance: string, remoteJid: string): Promise<T> {
    return this.client.request<T>({
      method: 'GET',
      url: this.path(instance, 'findChatByRemoteJid'),
      params: { remoteJid },
    })
  }

  /**
   * Kayıtlı mesajlar, sayfalı. Bir sohbetin geçmişi için `where.key.remoteJid` verin.
   * Yanıt `{ messages: { total, pages, currentPage, records } }` biçimindedir.
   */
  public async findMessages<T = unknown>(instance: string, input: FindMessagesInput = {}): Promise<T> {
    return this.client.request<T>({ method: 'POST', url: this.path(instance, 'findMessages'), data: input })
  }

  /** Sohbeti okunmamış olarak işaretle. */
  public async markChatUnread<T = unknown>(
    instance: string,
    input: MarkChatUnreadInput,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'markChatUnread'),
      data: input,
    })
  }
}

import type { Wafixer } from '../client'
import type {
  ArchiveChatInput,
  MarkChatUnreadInput,
  MarkMessagesAsReadInput,
  SendPresenceInput,
} from '../types/messages'
import type { MessageData } from '../types/events'

/**
 * Sohbet (chat) seviyesinde mesaj davranışları:
 *  - Mesajları okundu olarak işaretle
 *  - Yazıyor / kaydediyor / online göstergesi (presence)
 *  - Sohbet arşivle
 *  - Sohbeti okunmamış işaretle
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

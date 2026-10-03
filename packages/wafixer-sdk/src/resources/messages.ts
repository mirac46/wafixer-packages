import type { Wafixer } from '../client'
import type { MessageData } from '../types/events'
import type {
  SendButtonsInput,
  SendContactInput,
  SendListInput,
  SendLocationInput,
  SendMediaInput,
  SendPollInput,
  SendPtvInput,
  SendReactionInput,
  SendStickerInput,
  SendTemplateInput,
  SendTextInput,
  SendAudioInput,
  DeleteForEveryoneInput,
  UpdateMessageInput,
} from '../types/messages'

/**
 * Tüm mesaj gönderim ve mesaj-üzeri işlemleri.
 *
 *   client.messages.sendText('SatisHatti', { number, text })
 *   client.messages.sendMedia('SatisHatti', { number, mediatype, media })
 *   client.messages.replyTo(eventPayload, { text: 'tamam' })
 */
export class Messages {
  constructor(private readonly client: Wafixer) {}

  // ── helpers ─────────────────────────────────────────────────────────────
  private path(instance: string, action: string): string {
    return `/message/${action}/${encodeURIComponent(instance)}`
  }

  // ── TEXT ────────────────────────────────────────────────────────────────
  /** Düz metin mesajı gönder. */
  public async sendText<T = unknown>(instance: string, input: SendTextInput): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendText'),
      data: input,
    })
  }

  // ── MEDIA (image / video / document / audio) ────────────────────────────
  /**
   * Resim, video, döküman veya ses dosyası gönderir.
   * `media` alanı bir URL ya da base64 string olabilir.
   */
  public async sendMedia<T = unknown>(instance: string, input: SendMediaInput): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendMedia'),
      data: input,
    })
  }

  /** Sesli mesaj (PTT — push-to-talk) gönderir. */
  public async sendAudio<T = unknown>(instance: string, input: SendAudioInput): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendWhatsAppAudio'),
      data: input,
    })
  }

  /** Push-to-video kısa mesaj. */
  public async sendPtv<T = unknown>(instance: string, input: SendPtvInput): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendPtv'),
      data: input,
    })
  }

  /** Sticker gönder. */
  public async sendSticker<T = unknown>(instance: string, input: SendStickerInput): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendSticker'),
      data: input,
    })
  }

  // ── INTERACTIVE ─────────────────────────────────────────────────────────
  /** Butonlu interaktif mesaj. */
  public async sendButtons<T = unknown>(instance: string, input: SendButtonsInput): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendButtons'),
      data: input,
    })
  }

  /** Listeli interaktif mesaj. */
  public async sendList<T = unknown>(instance: string, input: SendListInput): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendList'),
      // API şeması footerText'i zorunlu tutar; alan eksikse istek 400 ile döner.
      data: { ...input, footerText: input.footerText ?? '' },
    })
  }

  /** Anket mesajı. */
  public async sendPoll<T = unknown>(instance: string, input: SendPollInput): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendPoll'),
      data: input,
    })
  }

  // ── SPECIAL ─────────────────────────────────────────────────────────────
  /** Konum paylaş. */
  public async sendLocation<T = unknown>(
    instance: string,
    input: SendLocationInput,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendLocation'),
      // API şeması name ve address alanlarını zorunlu tutar; boş metin kabul edilir.
      data: { ...input, name: input.name ?? '', address: input.address ?? '' },
    })
  }

  /** Kişi kartı paylaş. */
  public async sendContact<T = unknown>(instance: string, input: SendContactInput): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendContact'),
      data: input,
    })
  }

  /** Bir mesaja reaksiyon (emoji) ekler. Boş string `''` reaksiyonu kaldırır. */
  public async sendReaction<T = unknown>(
    instance: string,
    input: SendReactionInput,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendReaction'),
      data: input,
    })
  }

  /** Meta Business API template mesajı (Cloud API instance'ları için). */
  public async sendTemplate<T = unknown>(
    instance: string,
    input: SendTemplateInput,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: this.path(instance, 'sendTemplate'),
      data: input,
    })
  }

  // ── DELETE / UPDATE ─────────────────────────────────────────────────────
  /** Bir mesajı herkesten siler. */
  public async deleteForEveryone<T = unknown>(
    instance: string,
    input: DeleteForEveryoneInput,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'DELETE',
      url: `/chat/deleteMessageForEveryone/${encodeURIComponent(instance)}`,
      data: input,
    })
  }

  /** Bir mesajın metnini düzenler. */
  public async updateMessage<T = unknown>(
    instance: string,
    input: UpdateMessageInput,
  ): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: `/chat/updateMessage/${encodeURIComponent(instance)}`,
      data: input,
    })
  }

  // ── DOWNLOAD MEDIA ──────────────────────────────────────────────────────
  /**
   * Bir webhook event'inde gelen mesajın medyasını base64 olarak indirir.
   *
   * @example
   * const { base64, mimetype, fileName } = await wa.messages.downloadMedia(event)
   */
  public async downloadMedia<
    T = { base64: string; mimetype?: string; fileName?: string },
  >(event: { instance: string; data: { message?: unknown; key: unknown } }): Promise<T> {
    return this.client.request<T>({
      method: 'POST',
      url: `/chat/getBase64FromMediaMessage/${encodeURIComponent(event.instance)}`,
      data: {
        message: { key: event.data.key, message: event.data.message },
        convertToMp4: false,
      },
    })
  }

  // ── REPLY HELPERS ───────────────────────────────────────────────────────
  /**
   * Webhook'tan gelen bir mesaja düz metin yanıt verir. n8n iş akışında
   * gelen event'i doğrudan bu metoda geçirebilirsin.
   *
   * @example
   * await wa.messages.replyTo(event, { text: 'Sipariş alındı 🎉' })
   */
  public async replyTo<T = unknown>(
    event: { instance: string; data: MessageData },
    input: { text: string; mentioned?: string[]; delay?: number },
  ): Promise<T> {
    const remoteJid = event.data.key.remoteJid
    const number = remoteJid.split('@')[0]
    return this.sendText<T>(event.instance, {
      number,
      text: input.text,
      mentioned: input.mentioned,
      delay: input.delay,
      quoted: {
        key: event.data.key,
        message: event.data.message ?? {},
      },
    })
  }

  /**
   * Webhook'tan gelen bir mesaja medya yanıt verir.
   */
  public async replyWithMedia<T = unknown>(
    event: { instance: string; data: MessageData },
    input: Omit<SendMediaInput, 'number'>,
  ): Promise<T> {
    const number = event.data.key.remoteJid.split('@')[0]
    return this.sendMedia<T>(event.instance, {
      ...input,
      number,
      quoted: input.quoted ?? {
        key: event.data.key,
        message: event.data.message ?? {},
      },
    })
  }

  /**
   * Webhook'tan gelen bir mesaja reaksiyon ekler.
   */
  public async reactTo<T = unknown>(
    event: { instance: string; data: MessageData },
    emoji: string,
  ): Promise<T> {
    return this.sendReaction<T>(event.instance, {
      key: event.data.key,
      reaction: emoji,
    })
  }
}

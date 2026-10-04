import type { Wafixer } from '../client'
import type {
  MetaCommentImportRequest,
  MetaCommentImportResponse,
  MetaCommentListRequest,
  MetaCommentListResponse,
  MetaCommentMarkReadRequest,
  MetaCommentMarkReadResponse,
  MetaCommentReplyRequest,
  MetaCommentReplyResponse,
  MetaCommentStatus,
  MetaCommentThread,
} from '../types/contracts'

/**
 * Facebook Sayfa gönderisi ve Instagram medyası yorumları. Facebook yorumları Sayfanın Messenger
 * oturumunda, Instagram yorumları Instagram oturumunda okunur; kimlikler Meta kimlikleridir.
 *
 *   const { comments, nextCursor } = await wa.comment.find('TestSayfa', { unread: true })
 *   await wa.comment.reply('TestSayfa', comments[0].id, { text: 'Teşekkürler!' })
 */
export class Comments {
  constructor(private readonly client: Wafixer) {}

  private path(action: string, instance: string, commentId?: string): string {
    const base = `/comment/${action}/${encodeURIComponent(instance)}`
    return commentId === undefined ? base : `${base}/${encodeURIComponent(commentId)}`
  }

  /** Özelliğin durumu: eksik izinler, depolama, webhook alanı aboneliği. */
  public async status(instance: string): Promise<MetaCommentStatus> {
    return this.client.request<MetaCommentStatus>({ method: 'GET', url: this.path('status', instance) })
  }

  /**
   * Yorumlar yeniden eskiye, imleçle sayfalı (`nextCursor`). Süzgeçler gövdede gider; panel
   * vekili GET sorgu dizesini iletmediği için POST biçimi kullanılır.
   */
  public async find(instance: string, filter: MetaCommentListRequest = {}): Promise<MetaCommentListResponse> {
    return this.client.request<MetaCommentListResponse>({
      method: 'POST',
      url: this.path('find', instance),
      data: filter,
    })
  }

  /** Yorum, gönderisi, üst düzey yorumu ve yanıtları. */
  public async detail(instance: string, commentId: string): Promise<MetaCommentThread> {
    return this.client.request<MetaCommentThread>({ method: 'GET', url: this.path('detail', instance, commentId) })
  }

  /**
   * Herkese açık yanıt; hedef bir yanıtsa üst düzey yoruma yazılır. Facebook 8000,
   * Instagram 2200 karakter.
   */
  public async reply(
    instance: string,
    commentId: string,
    input: MetaCommentReplyRequest,
  ): Promise<MetaCommentReplyResponse> {
    return this.client.request<MetaCommentReplyResponse>({
      method: 'POST',
      url: this.path('reply', instance, commentId),
      data: input,
    })
  }

  /** `comment.received` olayına yanıt verir. */
  public async replyToEvent(
    event: { instance: string; data: { comment: { id: string } } },
    input: MetaCommentReplyRequest,
  ): Promise<MetaCommentReplyResponse> {
    return this.reply(event.instance, event.data.comment.id, input)
  }

  /** Okundu işaretler (yalnız wafixer içinde): `commentIds`, `postId` ya da `all: true`'dan biri. */
  public async markRead(
    instance: string,
    input: MetaCommentMarkReadRequest,
  ): Promise<MetaCommentMarkReadResponse> {
    return this.client.request<MetaCommentMarkReadResponse>({
      method: 'POST',
      url: this.path('markRead', instance),
      data: input,
    })
  }

  /** Bir gönderinin/medyanın yorum geçmişini içe aktarır; içe aktarılan yorumlar için olay yayınlanmaz. */
  public async import(instance: string, input: MetaCommentImportRequest): Promise<MetaCommentImportResponse> {
    return this.client.request<MetaCommentImportResponse>({
      method: 'POST',
      url: this.path('import', instance),
      data: input,
    })
  }
}

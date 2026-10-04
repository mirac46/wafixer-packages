import { NodeOperationError, type IDataObject, type IExecuteFunctions } from 'n8n-workflow'
import type { MetaCommentListRequest, MetaCommentMarkReadRequest, MetaPost, Wafixer } from 'wafixer-sdk'

import { collectPages } from './pagination'
import { requiredText } from './parameters'

interface CommentFilters {
  postId?: string
  parentId?: string
  status?: 'active' | 'removed' | 'all'
  topLevelOnly?: boolean
  unread?: boolean
  since?: string
  until?: string
}

function listRequest(filters: CommentFilters): MetaCommentListRequest {
  const request: MetaCommentListRequest = {}
  if (filters.postId) request.postId = filters.postId.trim()
  if (filters.parentId) request.parentId = filters.parentId.trim()
  if (filters.status) request.status = filters.status
  if (filters.topLevelOnly) request.topLevelOnly = true
  if (filters.unread) request.unread = true
  if (filters.since) request.since = filters.since
  if (filters.until) request.until = filters.until
  return request
}

function splitIds(value: string): string[] {
  return value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

async function getAll(ctx: IExecuteFunctions, wa: Wafixer, instance: string, i: number): Promise<IDataObject[]> {
  const returnAll = ctx.getNodeParameter('returnAll', i, false) as boolean
  const limit = returnAll ? Number.POSITIVE_INFINITY : (ctx.getNodeParameter('limit', i, 50) as number)
  const filter = listRequest(ctx.getNodeParameter('filters', i, {}) as CommentFilters)
  const posts = new Map<string, MetaPost>()
  const comments = await collectPages(async (cursor, pageSize) => {
    const page = await wa.comment.find(instance, { ...filter, limit: pageSize, ...(cursor ? { cursor } : {}) })
    for (const post of page.posts) posts.set(post.id, post)
    return { items: page.comments, nextCursor: page.nextCursor }
  }, limit)
  // Her yorum kendi gönderi özetiyle tek öğe olur; akışta ayrıca gönderi aramak gerekmez.
  return comments.map((comment) => ({ ...comment, post: posts.get(comment.postId) ?? null }))
}

function markReadRequest(ctx: IExecuteFunctions, i: number): MetaCommentMarkReadRequest {
  const target = ctx.getNodeParameter('markTarget', i) as 'commentIds' | 'post' | 'all'
  if (target === 'all') return { all: true }
  if (target === 'post') return { postId: requiredText(ctx, 'postId', i, 'Post ID is required') }
  const commentIds = splitIds(ctx.getNodeParameter('commentIds', i) as string)
  if (!commentIds.length) throw new NodeOperationError(ctx.getNode(), 'Enter at least one comment ID', { itemIndex: i })
  return { commentIds }
}

export async function executeCommentOperation(
  ctx: IExecuteFunctions,
  wa: Wafixer,
  instance: string,
  operation: string,
  i: number,
): Promise<IDataObject[]> {
  switch (operation) {
    case 'getAll':
      return getAll(ctx, wa, instance, i)
    case 'reply': {
      const commentId = requiredText(ctx, 'commentId', i, 'Comment ID is required')
      const text = ctx.getNodeParameter('text', i) as string
      return [await wa.comment.reply(instance, commentId, { text })]
    }
    case 'privateReply': {
      const commentId = requiredText(ctx, 'commentId', i, 'Comment ID is required')
      const text = ctx.getNodeParameter('privateText', i) as string
      return [await wa.comment.privateReply(instance, commentId, { text })]
    }
    case 'hide': {
      const commentId = requiredText(ctx, 'commentId', i, 'Comment ID is required')
      const hidden = ctx.getNodeParameter('hidden', i, true) as boolean
      return [await wa.comment.hide(instance, commentId, { hidden })]
    }
    case 'delete': {
      const commentId = requiredText(ctx, 'commentId', i, 'Comment ID is required')
      return [await wa.comment.delete(instance, commentId)]
    }
    case 'markRead':
      return [await wa.comment.markRead(instance, markReadRequest(ctx, i))]
    case 'import': {
      const postId = requiredText(ctx, 'importPostId', i, 'Post ID is required')
      const limit = ctx.getNodeParameter('importLimit', i, 200) as number
      return [await wa.comment.import(instance, { postId, limit })]
    }
    default:
      throw new NodeOperationError(ctx.getNode(), `Unknown comment operation: ${operation}`, { itemIndex: i })
  }
}

import { NodeOperationError, type IDataObject, type IExecuteFunctions } from 'n8n-workflow'
import type { LeadFetchStatus, LeadListQuery, LeadStatus, LeadUpdateRequest, Wafixer } from 'wafixer-sdk'

import { collectPages } from './pagination'
import { requiredText } from './parameters'

interface LeadFilters {
  formId?: string
  pageId?: string
  status?: LeadStatus[]
  fetchStatus?: LeadFetchStatus
  unread?: boolean
  since?: string
  until?: string
  updatedSince?: string
}

function listQuery(filters: LeadFilters): LeadListQuery {
  const query: LeadListQuery = {}
  if (filters.formId) query.formId = filters.formId.trim()
  if (filters.pageId) query.pageId = filters.pageId.trim()
  if (filters.status?.length) query.status = filters.status
  if (filters.fetchStatus) query.fetchStatus = filters.fetchStatus
  if (filters.unread) query.unread = true
  if (filters.since) query.since = filters.since
  if (filters.until) query.until = filters.until
  if (filters.updatedSince) query.updatedSince = filters.updatedSince
  return query
}

async function getAll(ctx: IExecuteFunctions, wa: Wafixer, instance: string, i: number): Promise<IDataObject[]> {
  const returnAll = ctx.getNodeParameter('returnAll', i, false) as boolean
  const limit = returnAll ? Number.POSITIVE_INFINITY : (ctx.getNodeParameter('limit', i, 50) as number)
  const query = listQuery(ctx.getNodeParameter('filters', i, {}) as LeadFilters)
  return collectPages(async (cursor, pageSize) => {
    const page = await wa.leads.items(instance, { ...query, limit: pageSize, ...(cursor ? { cursor } : {}) })
    return { items: page.leads, nextCursor: page.nextCursor }
  }, limit)
}

function updateRequest(ctx: IExecuteFunctions, i: number): LeadUpdateRequest {
  const fields = ctx.getNodeParameter('updateFields', i, {}) as { status?: LeadStatus; note?: string; read?: boolean }
  const request: LeadUpdateRequest = {}
  if (fields.status !== undefined) request.status = fields.status
  // Boş not alanı notu temizler.
  if (fields.note !== undefined) request.note = fields.note === '' ? null : fields.note
  if (fields.read !== undefined) request.read = fields.read
  if (!Object.keys(request).length) {
    throw new NodeOperationError(ctx.getNode(), 'Add at least one field to update', { itemIndex: i })
  }
  return request
}

export async function executeLeadOperation(
  ctx: IExecuteFunctions,
  wa: Wafixer,
  instance: string,
  operation: string,
  i: number,
): Promise<IDataObject[]> {
  switch (operation) {
    case 'getAll':
      return getAll(ctx, wa, instance, i)
    case 'get': {
      const leadId = requiredText(ctx, 'leadId', i, 'Lead ID is required')
      return [await wa.leads.items.get(instance, leadId)]
    }
    case 'update': {
      const leadId = requiredText(ctx, 'leadId', i, 'Lead ID is required')
      return [await wa.leads.items.update(instance, leadId, updateRequest(ctx, i))]
    }
    case 'getForms': {
      const options = ctx.getNodeParameter('formOptions', i, {}) as { pageId?: string; sync?: boolean }
      const pageId = options.pageId?.trim() || undefined
      const result = options.sync
        ? await wa.leads.forms.sync(instance, pageId ? { pageId } : {})
        : await wa.leads.forms(instance, pageId ? { pageId } : undefined)
      return result.forms
    }
    default:
      throw new NodeOperationError(ctx.getNode(), `Unknown lead operation: ${operation}`, { itemIndex: i })
  }
}

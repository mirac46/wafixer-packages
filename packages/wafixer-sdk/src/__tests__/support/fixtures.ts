// Sentetik kimlikler; Meta yükleri belgedeki örneklerle aynı biçimde.
import type {
  ChannelCapabilities,
  Lead,
  LeadForm,
  LeadPage,
  MetaComment,
  MetaMessagingStatus,
  MetaPost,
} from '../../types/contracts'

export const messengerCapabilities: ChannelCapabilities = {
  quickReplies: true,
  reactions: true,
  typing: true,
  history: false,
  templates: false,
  proactive: false,
  media: ['image', 'video', 'audio', 'document'],
  window: { standardHours: 24, humanAgentDays: 7 },
}

export const metaMessagingStatus: MetaMessagingStatus = {
  channel: 'MESSENGER',
  pageId: 'PAGE_ID_TEST',
  accountId: 'PAGE_ID_TEST',
  pageName: 'Test Sayfa',
  igUsername: null,
  status: 'ACTIVE',
  scopes: ['pages_messaging', 'pages_manage_metadata'],
  subscribedFields: ['messages', 'messaging_postbacks'],
  subscribed: true,
  lastError: null,
  lastCheckedAt: '2026-10-04T10:00:00.000Z',
  humanAgentEnabled: true,
}

export const metaPost: MetaPost = {
  id: '111_222',
  platform: 'FACEBOOK',
  accountId: 'PAGE_ID_TEST',
  permalink: 'https://facebook.com/111_222',
  messagePreview: 'Yeni şubemiz açıldı',
  mediaType: null,
  postedAt: '2026-10-01T09:00:00.000Z',
  lastCommentAt: '2026-10-04T09:30:00.000Z',
}

export const metaComment: MetaComment = {
  id: '222_333',
  platform: 'FACEBOOK',
  accountId: 'PAGE_ID_TEST',
  postId: '111_222',
  parentId: null,
  author: { id: '444', name: 'Deneme Kullanıcı' },
  text: 'Randevu almak istiyorum',
  status: 'active',
  hidden: false,
  fromOwner: false,
  sentByApi: false,
  read: false,
  readAt: null,
  privateReplyAt: null,
  createdAt: '2026-10-04T09:30:00.000Z',
  editedAt: null,
  removedAt: null,
}

export const lead: Lead = {
  id: 'lead_1',
  leadgenId: '9001',
  pageId: 'PAGE_ID_TEST',
  formId: '7001',
  adId: null,
  adName: null,
  adsetId: null,
  adsetName: null,
  campaignId: null,
  campaignName: null,
  platform: 'fb',
  isOrganic: false,
  createdTime: '2026-10-04T08:00:00.000Z',
  email: 'deneme@example.com',
  phone: '+905000000000',
  fullName: 'Deneme Kullanıcı',
  fields: [{ name: 'full_name', values: ['Deneme Kullanıcı'] }],
  status: 'new',
  note: null,
  read: false,
  readAt: null,
  source: 'webhook',
  fetchStatus: 'fetched',
  fetchAttempts: 1,
  lastFetchError: null,
  createdAt: '2026-10-04T08:00:05.000Z',
  updatedAt: '2026-10-04T08:00:05.000Z',
}

export const leadForm: LeadForm = {
  formId: '7001',
  pageId: 'PAGE_ID_TEST',
  name: 'Randevu formu',
  status: 'ACTIVE',
  locale: 'tr_TR',
  questions: [],
  createdTime: '2026-09-01T00:00:00.000Z',
  syncedAt: '2026-10-04T08:00:00.000Z',
  import: { status: null, startedAt: null, finishedAt: null, importedCount: 0, error: null },
}

export const leadPage: LeadPage = {
  pageId: 'PAGE_ID_TEST',
  pageName: 'Test Sayfa',
  status: 'ACTIVE',
  scopes: ['leads_retrieval', 'pages_manage_ads'],
  subscribedAt: '2026-10-04T07:00:00.000Z',
  lastLeadAt: null,
  lastError: null,
  connectedAt: '2026-10-04T07:00:00.000Z',
}

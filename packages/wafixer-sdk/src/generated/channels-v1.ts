// Bu dosya üretilir, elle düzenlenmez: npm run generate:types -w wafixer-sdk
// Kaynak: openapi/channels-v1.openapi.json (WaFixer Channels API 1.1.0)

export interface paths {
    "/message/sendText/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Metin gönder (quickReplies ve humanAgent Messenger/Instagram için ekleyicidir) */
        post: operations["sendText"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/message/sendMedia/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Ek gönder; Instagram sınırları: PNG/JPEG 8 MB, video/ses/PDF 25 MB */
        post: operations["sendMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/instance/metaMessaging/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Facebook Login için herkese açık yapılandırma */
        get: operations["metaMessagingConfig"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/instance/metaMessaging/discover": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Kısa ömürlü kullanıcı token’ını doğrular, Sayfaları listeler; Sayfa token’ları sunucuda kalır */
        post: operations["metaMessagingDiscover"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/instance/metaMessaging/connect": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Seçilen Sayfa/Instagram hesabıyla oturum açar ve webhook aboneliği kurar */
        post: operations["metaMessagingConnect"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/instance/metaMessaging/reconnect/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Token’ı yerinde yeniler; sohbetler korunur */
        post: operations["metaMessagingReconnect"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/instance/metaMessaging/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Bağlantı durumu (token içermez) */
        get: operations["metaMessagingStatus"];
        put?: never;
        /** Webhook aboneliğini yeniden kurar ve doğrular */
        post: operations["metaMessagingResubscribe"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/instance/metaMessagingSession": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Dış istemci için barındırılan bağlantı oturumu; kullanıcı wafixer panelinde akışı tamamlar */
        post: operations["metaMessagingSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/webhook/meta-messaging": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Meta abonelik doğrulaması (hub.challenge) */
        get: operations["metaMessagingWebhookVerify"];
        put?: never;
        /** Meta bildirimleri; X-Hub-Signature-256 ham gövde üzerinden doğrulanır */
        post: operations["metaMessagingWebhook"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/comment/status/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Yorum özelliğinin durumu: izinler, depolama, webhook alanı */
        get: operations["commentStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/comment/find/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Yorum listesi (yeniden eskiye, imleçle sayfalı) */
        get: operations["commentFind"];
        put?: never;
        /** Yorum listesi; süzgeçler gövdede */
        post: operations["commentFindPost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/comment/detail/{instance}/{commentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Yorum, gönderisi ve konuşması (üst düzey yorum ve yanıtları) */
        get: operations["commentDetail"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/comment/reply/{instance}/{commentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Herkese açık yanıt; hedef bir yanıtsa üst düzey yoruma yazılır */
        post: operations["commentReply"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/comment/markRead/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Yorumları okundu işaretler (yalnız wafixer içinde; Meta’ya gitmez) */
        post: operations["commentMarkRead"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/comment/import/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Bir gönderinin/medyanın yorum geçmişini içe aktarır; içe aktarılan yorumlar için olay yayınlanmaz */
        post: operations["commentImport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/leads/config/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Facebook Login için lead izinleri ve yapılandırma (sır içermez) */
        get: operations["leadsConfig"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/leads/discover/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Kullanıcı token’ını doğrular (lead izinleri), lead erişimi olan Sayfaları listeler; Sayfa token’ları sunucuda kalır */
        post: operations["leadsDiscover"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/leads/connect/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sayfayı oturuma lead için bağlar, leadgen aboneliğini kurar (diğer abonelik alanları korunur), formları eşitler */
        post: operations["leadsConnect"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/leads/pages/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Oturumun lead Sayfaları (token içermez) */
        get: operations["leadsPages"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/leads/pages/{instance}/{pageId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Sayfayı ayırır: token silinir, yalnız leadgen aboneliği kalkar; toplanmış lead’ler kalır */
        delete: operations["leadsDisconnect"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/leads/forms/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Saklanan form listesi ve içe aktarma durumu */
        get: operations["leadsForms"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/leads/forms/{instance}/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Formları Meta’dan yeniden okur (GET /{page-id}/leadgen_forms) */
        post: operations["leadsFormsSync"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/leads/forms/{instance}/{formId}/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Geçmiş lead’leri içe aktarır (GET /{form-id}/leads, time_created süzgeci); arka planda sürer */
        post: operations["leadsImport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/leads/items/{instance}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lead listesi; createdTime’a göre yeniden eskiye, imleçli sayfalama */
        get: operations["leadsList"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/leads/items/{instance}/{leadId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lead ayrıntısı */
        get: operations["leadsGet"];
        put?: never;
        post?: never;
        /** Lead’i kalıcı olarak siler (kişisel veri silme talebi) */
        delete: operations["leadsDelete"];
        options?: never;
        head?: never;
        /** Durum, not ve okundu bilgisi; değişiklik varsa lead.updated yayınlanır */
        patch: operations["leadsUpdate"];
        trace?: never;
    };
    "/leads/items/{instance}/{leadId}/retry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Çekilememiş (failed/pending) lead’i yeniden kuyruğa alır */
        post: operations["leadsRetry"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export interface webhooks {
    "messages.upsert": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Gelen mesaj, postback, tepki, dış echo */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["WebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "messages.update": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Teslim/okundu/medya tamamlandı */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["WebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "messages.delete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Kullanıcı mesajı geri aldı */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["WebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "send.message": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Kendi gönderimimiz */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["WebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "connection.update": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Token geçersiz / abonelik kaybı / yeniden bağlandı */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["WebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "comment.received": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Kullanıcının yeni yorumu ya da yanıtı; data: MetaCommentEventData */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["WebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "comment.updated": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Yorum düzenlendi, gizlendi ya da gösterildi (data.change); data: MetaCommentEventData */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["WebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "comment.removed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Yorum silindi; data: MetaCommentEventData */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["WebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "comment.reply.sent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sayfanın/hesabın yanıtı (sentByApi: API ya da Meta arayüzü); data: MetaCommentReplyEventData */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["WebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "lead.received": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Yeni lead Meta’dan çekildi (webhook ya da içe aktarma); oturum webhook olay listesinde LEAD_RECEIVED */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["LeadWebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "lead.updated": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Lead durumu, notu ya da okundu bilgisi değişti; oturum webhook olay listesinde LEAD_UPDATED */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["LeadWebhookEnvelope"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export interface components {
    schemas: {
        /** @enum {string} */
        ChannelCode: "QR" | "META" | "WAFIXER" | "MESSENGER" | "INSTAGRAM";
        /** @enum {string} */
        MetaMessagingChannel: "MESSENGER" | "INSTAGRAM";
        /** @enum {string} */
        ChannelErrorCode: "WINDOW_CLOSED" | "RECIPIENT_UNAVAILABLE" | "RECIPIENT_OPTED_OUT" | "INVALID_RECIPIENT" | "INSTAGRAM_MESSAGES_DISABLED" | "THREAD_CONTROLLED_BY_OTHER_APP" | "CHANNEL_TOKEN_INVALID" | "APP_NOT_LIVE" | "CHANNEL_PERMISSION_DENIED" | "ATTACHMENT_TOO_LARGE" | "ATTACHMENT_FETCH_FAILED" | "RATE_LIMITED" | "INVALID_REQUEST" | "CHANNEL_PROVIDER_ERROR" | "UNSUPPORTED_ON_CHANNEL" | "OAUTH_REQUIRED" | "CHANNEL_ALREADY_CONNECTED" | "CHANNEL_NOT_CONFIGURED" | "CHANNEL_NOT_CONNECTED" | "INVALID_SIGNATURE" | "SELECTION_EXPIRED" | "LOGIN_TOKEN_INVALID" | "PAGE_NOT_AVAILABLE" | "SUBSCRIPTION_FAILED" | "VALIDATION_ERROR" | "RETURN_URL_NOT_ALLOWED" | "NOT_FOUND";
        ChannelError: {
            error: string;
            /** @enum {string} */
            code: "WINDOW_CLOSED" | "RECIPIENT_UNAVAILABLE" | "RECIPIENT_OPTED_OUT" | "INVALID_RECIPIENT" | "INSTAGRAM_MESSAGES_DISABLED" | "THREAD_CONTROLLED_BY_OTHER_APP" | "CHANNEL_TOKEN_INVALID" | "APP_NOT_LIVE" | "CHANNEL_PERMISSION_DENIED" | "ATTACHMENT_TOO_LARGE" | "ATTACHMENT_FETCH_FAILED" | "RATE_LIMITED" | "INVALID_REQUEST" | "CHANNEL_PROVIDER_ERROR" | "UNSUPPORTED_ON_CHANNEL" | "OAUTH_REQUIRED" | "CHANNEL_ALREADY_CONNECTED" | "CHANNEL_NOT_CONFIGURED" | "CHANNEL_NOT_CONNECTED" | "INVALID_SIGNATURE" | "SELECTION_EXPIRED" | "LOGIN_TOKEN_INVALID" | "PAGE_NOT_AVAILABLE" | "SUBSCRIPTION_FAILED" | "VALIDATION_ERROR" | "RETURN_URL_NOT_ALLOWED" | "NOT_FOUND";
            details?: {
                [key: string]: unknown;
            };
        };
        QuickReply: {
            title: string;
            payload?: string;
            /** @enum {string} */
            type?: "text" | "user_phone_number" | "user_email";
            /** Format: uri */
            imageUrl?: string;
        };
        MessageKey: {
            remoteJid: string;
            fromMe: boolean;
            id: string;
        };
        SendTextRequest: {
            /** @description PSID/IGSID ya da {id}@messenger / {id}@instagram */
            number: string;
            text: string;
            quickReplies?: {
                title: string;
                payload?: string;
                /** @enum {string} */
                type?: "text" | "user_phone_number" | "user_email";
                /** Format: uri */
                imageUrl?: string;
            }[];
            /** @description Yalnız insan temsilcinin elle yazdığı yanıt; otomasyon göndermez */
            humanAgent?: boolean;
            quoted?: {
                key: {
                    id: string;
                } & {
                    [key: string]: unknown;
                };
            } & {
                [key: string]: unknown;
            };
        };
        SendMediaRequest: {
            number: string;
            /** @enum {string} */
            mediatype: "image" | "video" | "audio" | "document";
            /** @description URL ya da base64 */
            media: string;
            mimetype?: string;
            caption?: string;
            fileName?: string;
        };
        SendResponse: {
            key: {
                remoteJid: string;
                fromMe: boolean;
                id: string;
            };
            message: {
                [key: string]: unknown;
            };
            messageType: string;
            messageTimestamp: number;
            /** @enum {string} */
            status: "PENDING" | "SENT" | "DELIVERED" | "READ";
            /** @enum {string} */
            channel: "QR" | "META" | "WAFIXER" | "MESSENGER" | "INSTAGRAM";
        };
        ReplyWindow: {
            windowRequired: boolean;
            windowActive: boolean;
            windowStart: string | null;
            windowExpires: string | null;
            lastInboundAt: string | null;
            humanAgentActive?: boolean;
            humanAgentExpires?: string | null;
        };
        ChannelCapabilities: {
            quickReplies: boolean;
            reactions: boolean;
            typing: boolean;
            history: boolean;
            templates: boolean;
            proactive: boolean;
            media: string[];
            window: {
                standardHours: number;
                humanAgentDays: number;
            } | null;
        };
        /** @enum {string} */
        CredentialStatus: "ACTIVE" | "TOKEN_INVALID" | "SUBSCRIPTION_LOST" | "REVOKED";
        MetaMessagingStatus: {
            /** @enum {string} */
            channel: "MESSENGER" | "INSTAGRAM";
            pageId: string;
            accountId: string;
            pageName: string | null;
            igUsername: string | null;
            /** @enum {string} */
            status: "ACTIVE" | "TOKEN_INVALID" | "SUBSCRIPTION_LOST" | "REVOKED";
            scopes: string[];
            subscribedFields: string[];
            subscribed: boolean | null;
            lastError: {
                code: string;
                at: string;
            } | null;
            lastCheckedAt: string | null;
            humanAgentEnabled: boolean;
        };
        MetaMessagingConfig: {
            appId: string | null;
            configId: string | null;
            graphVersion: string;
            scopes: {
                MESSENGER: string[];
                INSTAGRAM: string[];
            };
            configured: boolean;
            session: {
                /** @enum {string} */
                channel: "MESSENGER" | "INSTAGRAM";
                returnUrl: string;
            } | null;
        };
        MetaMessagingDiscoverRequest: {
            userToken: string;
        };
        DiscoveredPage: {
            pageId: string;
            pageName: string;
            instagram: {
                id: string;
                username: string | null;
            } | null;
            alreadyConnected: {
                messenger: boolean;
                instagram: boolean;
            };
        };
        MetaMessagingDiscoverResponse: {
            selectionRef: string;
            expiresAt: string;
            pages: {
                pageId: string;
                pageName: string;
                instagram: {
                    id: string;
                    username: string | null;
                } | null;
                alreadyConnected: {
                    messenger: boolean;
                    instagram: boolean;
                };
            }[];
        };
        MetaMessagingConnectRequest: {
            selectionRef: string;
            /** @enum {string} */
            channel: "MESSENGER" | "INSTAGRAM";
            pageId: string;
            instanceName: string;
        };
        MetaMessagingConnectResponse: {
            instance: {
                instanceName: string;
                instanceId: string;
                /** @enum {string} */
                integration: "MESSENGER" | "INSTAGRAM";
                /** @enum {string} */
                channel: "MESSENGER" | "INSTAGRAM";
                pageId: string;
                accountId: string;
                status: string;
            };
            hash: string;
        };
        MetaMessagingSessionRequest: {
            /** @enum {string} */
            channel: "MESSENGER" | "INSTAGRAM";
            /** Format: uri */
            returnUrl: string;
        };
        MetaMessagingSessionResponse: {
            /** Format: uri */
            url: string;
            expiresAt: string;
        };
        WebhookEnvelope: {
            event: string;
            instance: string;
            channel?: ("QR" | "META" | "WAFIXER" | "MESSENGER" | "INSTAGRAM") | null;
            data: {
                [key: string]: unknown;
            };
            destination?: string;
            date_time: string;
            sender?: string | null;
            server_url?: string;
            apikey?: string | null;
        };
        InboundMessageData: {
            key: {
                remoteJid: string;
                fromMe: boolean;
                id: string;
            };
            pushName?: string | null;
            message: {
                [key: string]: unknown;
            };
            messageType: string;
            messageTimestamp: number;
            instanceId: string;
            source: string;
            /** @constant */
            origin?: "external";
            appId?: string;
        };
        MessageUpdateData: {
            messageId: string;
            keyId: string;
            remoteJid: string;
            fromMe: boolean;
            status?: string;
            instanceId: string;
            mediaUrl?: string | null;
            /** @enum {string} */
            mediaStatus?: "stored" | "unavailable";
        };
        ConnectionUpdateData: {
            instance: string;
            /** @enum {string} */
            state: "open" | "close" | "connecting";
            statusReason?: number;
            /** @enum {string} */
            reason?: "token_invalid" | "subscription_lost" | "revoked";
        };
        /** @enum {string} */
        MetaCommentPlatform: "FACEBOOK" | "INSTAGRAM";
        MetaComment: {
            /** @description Meta yorum kimliği */
            id: string;
            /** @enum {string} */
            platform: "FACEBOOK" | "INSTAGRAM";
            /** @description Facebook Sayfa kimliği ya da Instagram profesyonel hesap kimliği */
            accountId: string;
            /** @description Facebook gönderi kimliği ya da Instagram medya kimliği */
            postId: string;
            /** @description Yanıtın bağlı olduğu üst düzey yorum; gönderiye yazılan yorumda null */
            parentId: string | null;
            author: {
                id: string | null;
                name: string | null;
            } | null;
            text: string | null;
            /** @enum {string} */
            status: "active" | "removed";
            hidden: boolean;
            /** @description Yazar bağlı Sayfa ya da Instagram hesabının kendisi; otomatik yanıt verilmez */
            fromOwner: boolean;
            /** @description Yanıt wafixer API üzerinden gönderildi */
            sentByApi: boolean;
            read: boolean;
            readAt: string | null;
            createdAt: string;
            editedAt: string | null;
            removedAt: string | null;
        };
        MetaPost: {
            id: string;
            /** @enum {string} */
            platform: "FACEBOOK" | "INSTAGRAM";
            accountId: string;
            permalink: string | null;
            messagePreview: string | null;
            mediaType: string | null;
            postedAt: string | null;
            lastCommentAt: string | null;
        };
        MetaCommentListRequest: {
            postId?: string;
            parentId?: string;
            topLevelOnly?: boolean;
            /**
             * @description Varsayılan active
             * @enum {string}
             */
            status?: "active" | "removed" | "all";
            /** @description Yalnız okunmamış ve Sayfa/hesap dışından gelen yorumlar */
            unread?: boolean;
            /** @description ISO 8601, dahil */
            since?: string;
            /** @description ISO 8601, hariç */
            until?: string;
            /** @description Varsayılan 50 */
            limit?: number;
            /** @description Önceki yanıttaki nextCursor */
            cursor?: string;
        };
        MetaCommentListResponse: {
            comments: {
                /** @description Meta yorum kimliği */
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                /** @description Facebook Sayfa kimliği ya da Instagram profesyonel hesap kimliği */
                accountId: string;
                /** @description Facebook gönderi kimliği ya da Instagram medya kimliği */
                postId: string;
                /** @description Yanıtın bağlı olduğu üst düzey yorum; gönderiye yazılan yorumda null */
                parentId: string | null;
                author: {
                    id: string | null;
                    name: string | null;
                } | null;
                text: string | null;
                /** @enum {string} */
                status: "active" | "removed";
                hidden: boolean;
                /** @description Yazar bağlı Sayfa ya da Instagram hesabının kendisi; otomatik yanıt verilmez */
                fromOwner: boolean;
                /** @description Yanıt wafixer API üzerinden gönderildi */
                sentByApi: boolean;
                read: boolean;
                readAt: string | null;
                createdAt: string;
                editedAt: string | null;
                removedAt: string | null;
            }[];
            posts: {
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                accountId: string;
                permalink: string | null;
                messagePreview: string | null;
                mediaType: string | null;
                postedAt: string | null;
                lastCommentAt: string | null;
            }[];
            nextCursor: string | null;
        };
        MetaCommentThread: {
            comment: {
                /** @description Meta yorum kimliği */
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                /** @description Facebook Sayfa kimliği ya da Instagram profesyonel hesap kimliği */
                accountId: string;
                /** @description Facebook gönderi kimliği ya da Instagram medya kimliği */
                postId: string;
                /** @description Yanıtın bağlı olduğu üst düzey yorum; gönderiye yazılan yorumda null */
                parentId: string | null;
                author: {
                    id: string | null;
                    name: string | null;
                } | null;
                text: string | null;
                /** @enum {string} */
                status: "active" | "removed";
                hidden: boolean;
                /** @description Yazar bağlı Sayfa ya da Instagram hesabının kendisi; otomatik yanıt verilmez */
                fromOwner: boolean;
                /** @description Yanıt wafixer API üzerinden gönderildi */
                sentByApi: boolean;
                read: boolean;
                readAt: string | null;
                createdAt: string;
                editedAt: string | null;
                removedAt: string | null;
            };
            post: {
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                accountId: string;
                permalink: string | null;
                messagePreview: string | null;
                mediaType: string | null;
                postedAt: string | null;
                lastCommentAt: string | null;
            } | null;
            parent: {
                /** @description Meta yorum kimliği */
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                /** @description Facebook Sayfa kimliği ya da Instagram profesyonel hesap kimliği */
                accountId: string;
                /** @description Facebook gönderi kimliği ya da Instagram medya kimliği */
                postId: string;
                /** @description Yanıtın bağlı olduğu üst düzey yorum; gönderiye yazılan yorumda null */
                parentId: string | null;
                author: {
                    id: string | null;
                    name: string | null;
                } | null;
                text: string | null;
                /** @enum {string} */
                status: "active" | "removed";
                hidden: boolean;
                /** @description Yazar bağlı Sayfa ya da Instagram hesabının kendisi; otomatik yanıt verilmez */
                fromOwner: boolean;
                /** @description Yanıt wafixer API üzerinden gönderildi */
                sentByApi: boolean;
                read: boolean;
                readAt: string | null;
                createdAt: string;
                editedAt: string | null;
                removedAt: string | null;
            } | null;
            replies: {
                /** @description Meta yorum kimliği */
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                /** @description Facebook Sayfa kimliği ya da Instagram profesyonel hesap kimliği */
                accountId: string;
                /** @description Facebook gönderi kimliği ya da Instagram medya kimliği */
                postId: string;
                /** @description Yanıtın bağlı olduğu üst düzey yorum; gönderiye yazılan yorumda null */
                parentId: string | null;
                author: {
                    id: string | null;
                    name: string | null;
                } | null;
                text: string | null;
                /** @enum {string} */
                status: "active" | "removed";
                hidden: boolean;
                /** @description Yazar bağlı Sayfa ya da Instagram hesabının kendisi; otomatik yanıt verilmez */
                fromOwner: boolean;
                /** @description Yanıt wafixer API üzerinden gönderildi */
                sentByApi: boolean;
                read: boolean;
                readAt: string | null;
                createdAt: string;
                editedAt: string | null;
                removedAt: string | null;
            }[];
        };
        MetaCommentReplyRequest: {
            /** @description Instagram en çok 2200 karakter */
            text: string;
        };
        MetaCommentReplyResponse: {
            reply: {
                /** @description Meta yorum kimliği */
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                /** @description Facebook Sayfa kimliği ya da Instagram profesyonel hesap kimliği */
                accountId: string;
                /** @description Facebook gönderi kimliği ya da Instagram medya kimliği */
                postId: string;
                /** @description Yanıtın bağlı olduğu üst düzey yorum; gönderiye yazılan yorumda null */
                parentId: string | null;
                author: {
                    id: string | null;
                    name: string | null;
                } | null;
                text: string | null;
                /** @enum {string} */
                status: "active" | "removed";
                hidden: boolean;
                /** @description Yazar bağlı Sayfa ya da Instagram hesabının kendisi; otomatik yanıt verilmez */
                fromOwner: boolean;
                /** @description Yanıt wafixer API üzerinden gönderildi */
                sentByApi: boolean;
                read: boolean;
                readAt: string | null;
                createdAt: string;
                editedAt: string | null;
                removedAt: string | null;
            };
            inReplyTo: string;
        };
        /** @description commentIds, postId ya da all alanlarından yalnız biri */
        MetaCommentMarkReadRequest: {
            commentIds?: string[];
            postId?: string;
            /** @constant */
            all?: true;
        };
        MetaCommentMarkReadResponse: {
            updated: number;
        };
        MetaCommentImportRequest: {
            postId: string;
            /** @description Varsayılan 200 */
            limit?: number;
        };
        MetaCommentImportResponse: {
            /** @enum {string} */
            platform: "FACEBOOK" | "INSTAGRAM";
            postId: string;
            imported: number;
            updated: number;
            seen: number;
            truncated: boolean;
            post: {
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                accountId: string;
                permalink: string | null;
                messagePreview: string | null;
                mediaType: string | null;
                postedAt: string | null;
                lastCommentAt: string | null;
            };
        };
        MetaCommentStatus: {
            /** @enum {string} */
            platform: "FACEBOOK" | "INSTAGRAM";
            accountId: string;
            enabled: boolean;
            credentialStatus: string;
            missingScopes: string[];
            storageReady: boolean;
            subscription: {
                /** @enum {string} */
                object: "page" | "instagram";
                field: string;
                /** @enum {string} */
                level: "page" | "app";
                active: boolean | null;
            };
        };
        MetaCommentEventData: {
            comment: {
                /** @description Meta yorum kimliği */
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                /** @description Facebook Sayfa kimliği ya da Instagram profesyonel hesap kimliği */
                accountId: string;
                /** @description Facebook gönderi kimliği ya da Instagram medya kimliği */
                postId: string;
                /** @description Yanıtın bağlı olduğu üst düzey yorum; gönderiye yazılan yorumda null */
                parentId: string | null;
                author: {
                    id: string | null;
                    name: string | null;
                } | null;
                text: string | null;
                /** @enum {string} */
                status: "active" | "removed";
                hidden: boolean;
                /** @description Yazar bağlı Sayfa ya da Instagram hesabının kendisi; otomatik yanıt verilmez */
                fromOwner: boolean;
                /** @description Yanıt wafixer API üzerinden gönderildi */
                sentByApi: boolean;
                read: boolean;
                readAt: string | null;
                createdAt: string;
                editedAt: string | null;
                removedAt: string | null;
            };
            post: {
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                accountId: string;
                permalink: string | null;
                messagePreview: string | null;
                mediaType: string | null;
                postedAt: string | null;
                lastCommentAt: string | null;
            } | null;
            /** @enum {string} */
            change?: "edited" | "hidden" | "unhidden";
        };
        MetaCommentReplyEventData: {
            comment: {
                /** @description Meta yorum kimliği */
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                /** @description Facebook Sayfa kimliği ya da Instagram profesyonel hesap kimliği */
                accountId: string;
                /** @description Facebook gönderi kimliği ya da Instagram medya kimliği */
                postId: string;
                /** @description Yanıtın bağlı olduğu üst düzey yorum; gönderiye yazılan yorumda null */
                parentId: string | null;
                author: {
                    id: string | null;
                    name: string | null;
                } | null;
                text: string | null;
                /** @enum {string} */
                status: "active" | "removed";
                hidden: boolean;
                /** @description Yazar bağlı Sayfa ya da Instagram hesabının kendisi; otomatik yanıt verilmez */
                fromOwner: boolean;
                /** @description Yanıt wafixer API üzerinden gönderildi */
                sentByApi: boolean;
                read: boolean;
                readAt: string | null;
                createdAt: string;
                editedAt: string | null;
                removedAt: string | null;
            };
            inReplyTo: string | null;
            post: {
                id: string;
                /** @enum {string} */
                platform: "FACEBOOK" | "INSTAGRAM";
                accountId: string;
                permalink: string | null;
                messagePreview: string | null;
                mediaType: string | null;
                postedAt: string | null;
                lastCommentAt: string | null;
            } | null;
        };
        /** @enum {string} */
        LeadStatus: "new" | "contacted" | "qualified" | "discarded";
        /**
         * @description pending: Meta’dan çekilecek; fetched: tamam; failed: denemeler tükendi (ölü mektup)
         * @enum {string}
         */
        LeadFetchStatus: "pending" | "fetched" | "failed";
        /** @enum {string} */
        LeadPageStatus: "ACTIVE" | "TOKEN_INVALID" | "ACCESS_DENIED" | "SUBSCRIPTION_LOST" | "REVOKED";
        /** @enum {string} */
        LeadErrorCode: "VALIDATION_ERROR" | "NOT_FOUND" | "CHANNEL_NOT_CONFIGURED" | "LEADS_UNAVAILABLE" | "LOGIN_TOKEN_INVALID" | "SELECTION_EXPIRED" | "PAGE_NOT_AVAILABLE" | "CHANNEL_ALREADY_CONNECTED" | "LEADS_NOT_CONNECTED" | "LEADS_ACCESS_DENIED" | "CHANNEL_TOKEN_INVALID" | "SUBSCRIPTION_FAILED" | "RATE_LIMITED" | "INVALID_REQUEST" | "CHANNEL_PROVIDER_ERROR" | "IMPORT_IN_PROGRESS";
        LeadError: {
            error: string;
            /** @enum {string} */
            code: "VALIDATION_ERROR" | "NOT_FOUND" | "CHANNEL_NOT_CONFIGURED" | "LEADS_UNAVAILABLE" | "LOGIN_TOKEN_INVALID" | "SELECTION_EXPIRED" | "PAGE_NOT_AVAILABLE" | "CHANNEL_ALREADY_CONNECTED" | "LEADS_NOT_CONNECTED" | "LEADS_ACCESS_DENIED" | "CHANNEL_TOKEN_INVALID" | "SUBSCRIPTION_FAILED" | "RATE_LIMITED" | "INVALID_REQUEST" | "CHANNEL_PROVIDER_ERROR" | "IMPORT_IN_PROGRESS";
            details?: {
                [key: string]: unknown;
            };
        };
        LeadField: {
            name: string;
            values: string[];
        };
        Lead: {
            /** @description wafixer lead kimliği */
            id: string;
            /** @description Meta leadgen_id */
            leadgenId: string;
            pageId: string;
            formId: string | null;
            adId: string | null;
            adName: string | null;
            adsetId: string | null;
            adsetName: string | null;
            campaignId: string | null;
            campaignName: string | null;
            /** @description fb | ig */
            platform: string | null;
            isOrganic: boolean | null;
            /** @description Formun Meta’da gönderildiği an (ISO 8601) */
            createdTime: string | null;
            email: string | null;
            phone: string | null;
            fullName: string | null;
            /** @description Meta field_data; özel sorular dahil */
            fields: {
                name: string;
                values: string[];
            }[];
            /** @enum {string} */
            status: "new" | "contacted" | "qualified" | "discarded";
            note: string | null;
            read: boolean;
            readAt: string | null;
            /** @enum {string} */
            source: "webhook" | "import";
            /**
             * @description pending: Meta’dan çekilecek; fetched: tamam; failed: denemeler tükendi (ölü mektup)
             * @enum {string}
             */
            fetchStatus: "pending" | "fetched" | "failed";
            fetchAttempts: number;
            lastFetchError: string | null;
            createdAt: string;
            updatedAt: string;
        };
        LeadListResponse: {
            leads: {
                /** @description wafixer lead kimliği */
                id: string;
                /** @description Meta leadgen_id */
                leadgenId: string;
                pageId: string;
                formId: string | null;
                adId: string | null;
                adName: string | null;
                adsetId: string | null;
                adsetName: string | null;
                campaignId: string | null;
                campaignName: string | null;
                /** @description fb | ig */
                platform: string | null;
                isOrganic: boolean | null;
                /** @description Formun Meta’da gönderildiği an (ISO 8601) */
                createdTime: string | null;
                email: string | null;
                phone: string | null;
                fullName: string | null;
                /** @description Meta field_data; özel sorular dahil */
                fields: {
                    name: string;
                    values: string[];
                }[];
                /** @enum {string} */
                status: "new" | "contacted" | "qualified" | "discarded";
                note: string | null;
                read: boolean;
                readAt: string | null;
                /** @enum {string} */
                source: "webhook" | "import";
                /**
                 * @description pending: Meta’dan çekilecek; fetched: tamam; failed: denemeler tükendi (ölü mektup)
                 * @enum {string}
                 */
                fetchStatus: "pending" | "fetched" | "failed";
                fetchAttempts: number;
                lastFetchError: string | null;
                createdAt: string;
                updatedAt: string;
            }[];
            nextCursor: string | null;
        };
        LeadUpdateRequest: {
            /** @enum {string} */
            status?: "new" | "contacted" | "qualified" | "discarded";
            note?: string | null;
            read?: boolean;
        };
        LeadForm: {
            formId: string;
            pageId: string;
            name: string | null;
            /** @description Meta form durumu: ACTIVE, PAUSED, ARCHIVED… */
            status: string | null;
            locale: string | null;
            questions: unknown[];
            createdTime: string | null;
            syncedAt: string | null;
            import: {
                status: ("running" | "done" | "failed") | null;
                startedAt: string | null;
                finishedAt: string | null;
                importedCount: number;
                error: string | null;
            };
        };
        LeadFormListResponse: {
            forms: {
                formId: string;
                pageId: string;
                name: string | null;
                /** @description Meta form durumu: ACTIVE, PAUSED, ARCHIVED… */
                status: string | null;
                locale: string | null;
                questions: unknown[];
                createdTime: string | null;
                syncedAt: string | null;
                import: {
                    status: ("running" | "done" | "failed") | null;
                    startedAt: string | null;
                    finishedAt: string | null;
                    importedCount: number;
                    error: string | null;
                };
            }[];
        };
        LeadPage: {
            pageId: string;
            pageName: string | null;
            /** @enum {string} */
            status: "ACTIVE" | "TOKEN_INVALID" | "ACCESS_DENIED" | "SUBSCRIPTION_LOST" | "REVOKED";
            scopes: string[];
            subscribedAt: string | null;
            lastLeadAt: string | null;
            lastError: {
                code: string;
                at: string;
            } | null;
            connectedAt: string;
        };
        LeadPageListResponse: {
            pages: {
                pageId: string;
                pageName: string | null;
                /** @enum {string} */
                status: "ACTIVE" | "TOKEN_INVALID" | "ACCESS_DENIED" | "SUBSCRIPTION_LOST" | "REVOKED";
                scopes: string[];
                subscribedAt: string | null;
                lastLeadAt: string | null;
                lastError: {
                    code: string;
                    at: string;
                } | null;
                connectedAt: string;
            }[];
        };
        LeadsConfig: {
            appId: string | null;
            /** @description Facebook Login for Business yapılandırması */
            configId: string | null;
            graphVersion: string;
            scopes: {
                required: string[];
                optional: string[];
            };
            /** @constant */
            webhookField: "leadgen";
            configured: boolean;
        };
        LeadsDiscoverRequest: {
            userToken: string;
        };
        LeadsDiscoverResponse: {
            selectionRef: string;
            expiresAt: string;
            pages: {
                pageId: string;
                pageName: string;
                alreadyConnected: boolean;
                connectedHere: boolean;
            }[];
        };
        LeadsConnectRequest: {
            pageId: string;
            /** @description Yoksa aynı oturumun Messenger bağlantısındaki ya da daha önce bağlanmış lead Sayfasının token’ı kullanılır */
            selectionRef?: string;
        };
        LeadsConnectResponse: {
            page: {
                pageId: string;
                pageName: string | null;
                /** @enum {string} */
                status: "ACTIVE" | "TOKEN_INVALID" | "ACCESS_DENIED" | "SUBSCRIPTION_LOST" | "REVOKED";
                scopes: string[];
                subscribedAt: string | null;
                lastLeadAt: string | null;
                lastError: {
                    code: string;
                    at: string;
                } | null;
                connectedAt: string;
            };
            /** @description Yeniden kuyruğa alınan, çekilememiş lead sayısı */
            requeued: number;
            /** @description Bağlantı sonrası form eşitlemesi; hata bağlantıyı geri almaz */
            forms: {
                synced: boolean;
                count: number;
                error: string | null;
            };
        };
        LeadImportRequest: {
            /** @description ISO 8601 ya da Unix saniyesi; varsayılan until − 90 gün */
            since?: string;
            /** @description ISO 8601 ya da Unix saniyesi; varsayılan şimdi */
            until?: string;
        };
        LeadImportResponse: {
            form: {
                formId: string;
                pageId: string;
                name: string | null;
                /** @description Meta form durumu: ACTIVE, PAUSED, ARCHIVED… */
                status: string | null;
                locale: string | null;
                questions: unknown[];
                createdTime: string | null;
                syncedAt: string | null;
                import: {
                    status: ("running" | "done" | "failed") | null;
                    startedAt: string | null;
                    finishedAt: string | null;
                    importedCount: number;
                    error: string | null;
                };
            };
            range: {
                since: string;
                until: string;
            };
        };
        LeadEventData: {
            /** @description wafixer lead kimliği */
            id: string;
            /** @description Meta leadgen_id */
            leadgenId: string;
            pageId: string;
            formId: string | null;
            adId: string | null;
            adName: string | null;
            adsetId: string | null;
            adsetName: string | null;
            campaignId: string | null;
            campaignName: string | null;
            /** @description fb | ig */
            platform: string | null;
            isOrganic: boolean | null;
            /** @description Formun Meta’da gönderildiği an (ISO 8601) */
            createdTime: string | null;
            email: string | null;
            phone: string | null;
            fullName: string | null;
            /** @description Meta field_data; özel sorular dahil */
            fields: {
                name: string;
                values: string[];
            }[];
            /** @enum {string} */
            status: "new" | "contacted" | "qualified" | "discarded";
            note: string | null;
            read: boolean;
            readAt: string | null;
            /** @enum {string} */
            source: "webhook" | "import";
            /**
             * @description pending: Meta’dan çekilecek; fetched: tamam; failed: denemeler tükendi (ölü mektup)
             * @enum {string}
             */
            fetchStatus: "pending" | "fetched" | "failed";
            fetchAttempts: number;
            lastFetchError: string | null;
            createdAt: string;
            updatedAt: string;
            instanceId: string;
            /** @description Yalnız lead.updated */
            changes?: ("status" | "note" | "read")[];
        };
        LeadWebhookEnvelope: {
            /** @enum {string} */
            event: "lead.received" | "lead.updated";
            instance: string;
            data: {
                /** @description wafixer lead kimliği */
                id: string;
                /** @description Meta leadgen_id */
                leadgenId: string;
                pageId: string;
                formId: string | null;
                adId: string | null;
                adName: string | null;
                adsetId: string | null;
                adsetName: string | null;
                campaignId: string | null;
                campaignName: string | null;
                /** @description fb | ig */
                platform: string | null;
                isOrganic: boolean | null;
                /** @description Formun Meta’da gönderildiği an (ISO 8601) */
                createdTime: string | null;
                email: string | null;
                phone: string | null;
                fullName: string | null;
                /** @description Meta field_data; özel sorular dahil */
                fields: {
                    name: string;
                    values: string[];
                }[];
                /** @enum {string} */
                status: "new" | "contacted" | "qualified" | "discarded";
                note: string | null;
                read: boolean;
                readAt: string | null;
                /** @enum {string} */
                source: "webhook" | "import";
                /**
                 * @description pending: Meta’dan çekilecek; fetched: tamam; failed: denemeler tükendi (ölü mektup)
                 * @enum {string}
                 */
                fetchStatus: "pending" | "fetched" | "failed";
                fetchAttempts: number;
                lastFetchError: string | null;
                createdAt: string;
                updatedAt: string;
                instanceId: string;
                /** @description Yalnız lead.updated */
                changes?: ("status" | "note" | "read")[];
            };
            destination?: string;
            date_time: string;
            /** @description Facebook Sayfa kimliği */
            sender?: string | null;
            server_url?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    sendText: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendTextRequest"];
            };
        };
        responses: {
            /** @description Mesaj Meta tarafından kabul edildi */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SendResponse"];
                };
            };
            /** @description Doğrulama hatası ya da kanalda desteklenmeyen işlem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kanal bağlantısı geçersiz ya da çakışma */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Mesajlaşma penceresi kapalı ya da alıcı erişilemez */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Hız sınırı; Retry-After başlığı */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    sendMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendMediaRequest"];
            };
        };
        responses: {
            /** @description Ek Meta tarafından kabul edildi */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SendResponse"];
                };
            };
            /** @description Doğrulama hatası ya da kanalda desteklenmeyen işlem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kanal bağlantısı geçersiz ya da çakışma */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Mesajlaşma penceresi kapalı ya da alıcı erişilemez */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Hız sınırı; Retry-After başlığı */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    metaMessagingConfig: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Yapılandırma */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaMessagingConfig"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    metaMessagingDiscover: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MetaMessagingDiscoverRequest"];
            };
        };
        responses: {
            /** @description Sayfa listesi ve selectionRef */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaMessagingDiscoverResponse"];
                };
            };
            /** @description Doğrulama hatası ya da kanalda desteklenmeyen işlem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kanal bağlantısı geçersiz ya da çakışma */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Mesajlaşma penceresi kapalı ya da alıcı erişilemez */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Hız sınırı; Retry-After başlığı */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    metaMessagingConnect: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MetaMessagingConnectRequest"];
            };
        };
        responses: {
            /** @description Oturum oluşturuldu */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaMessagingConnectResponse"];
                };
            };
            /** @description Doğrulama hatası ya da kanalda desteklenmeyen işlem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kanal bağlantısı geçersiz ya da çakışma */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Mesajlaşma penceresi kapalı ya da alıcı erişilemez */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Hız sınırı; Retry-After başlığı */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    metaMessagingReconnect: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    selectionRef: string;
                };
            };
        };
        responses: {
            /** @description Durum */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaMessagingStatus"];
                };
            };
            /** @description Doğrulama hatası ya da kanalda desteklenmeyen işlem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kanal bağlantısı geçersiz ya da çakışma */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Mesajlaşma penceresi kapalı ya da alıcı erişilemez */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Hız sınırı; Retry-After başlığı */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    metaMessagingStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Durum */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaMessagingStatus"];
                };
            };
            /** @description Doğrulama hatası ya da kanalda desteklenmeyen işlem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kanal bağlantısı geçersiz ya da çakışma */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Mesajlaşma penceresi kapalı ya da alıcı erişilemez */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Hız sınırı; Retry-After başlığı */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    metaMessagingResubscribe: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Durum */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaMessagingStatus"];
                };
            };
            /** @description Doğrulama hatası ya da kanalda desteklenmeyen işlem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kanal bağlantısı geçersiz ya da çakışma */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Mesajlaşma penceresi kapalı ya da alıcı erişilemez */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Hız sınırı; Retry-After başlığı */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    metaMessagingSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MetaMessagingSessionRequest"];
            };
        };
        responses: {
            /** @description Bağlantı adresi */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaMessagingSessionResponse"];
                };
            };
            /** @description Doğrulama hatası ya da kanalda desteklenmeyen işlem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kanal bağlantısı geçersiz ya da çakışma */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Mesajlaşma penceresi kapalı ya da alıcı erişilemez */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Hız sınırı; Retry-After başlığı */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    metaMessagingWebhookVerify: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Challenge */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Reddedildi */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Doğrulama token’ı tanımlı değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    metaMessagingWebhook: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Alındı */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description İmza geçersiz */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Geçici hata; Meta yeniden dener */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    commentStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Durum */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaCommentStatus"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Anahtar bu oturum için yetkili değil */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Oturum Facebook/Instagram bağlantısı taşımıyor ya da yorum yok */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Yorum kayıtları bu sunucuda etkin değil (CHANNEL_NOT_CONFIGURED) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    commentFind: {
        parameters: {
            query?: {
                postId?: string;
                parentId?: string;
                topLevelOnly?: boolean;
                status?: "active" | "removed" | "all";
                unread?: boolean;
                since?: string;
                until?: string;
                limit?: number;
                cursor?: string;
            };
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Yorumlar ve gönderi özetleri */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaCommentListResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Anahtar bu oturum için yetkili değil */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Oturum Facebook/Instagram bağlantısı taşımıyor ya da yorum yok */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Yorum kayıtları bu sunucuda etkin değil (CHANNEL_NOT_CONFIGURED) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    commentFindPost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["MetaCommentListRequest"];
            };
        };
        responses: {
            /** @description Yorumlar ve gönderi özetleri */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaCommentListResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Anahtar bu oturum için yetkili değil */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Oturum Facebook/Instagram bağlantısı taşımıyor ya da yorum yok */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Yorum kayıtları bu sunucuda etkin değil (CHANNEL_NOT_CONFIGURED) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    commentDetail: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
                commentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Konuşma */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaCommentThread"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Anahtar bu oturum için yetkili değil */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Oturum Facebook/Instagram bağlantısı taşımıyor ya da yorum yok */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Yorum kayıtları bu sunucuda etkin değil (CHANNEL_NOT_CONFIGURED) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    commentReply: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
                commentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MetaCommentReplyRequest"];
            };
        };
        responses: {
            /** @description Yanıt yayımlandı */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaCommentReplyResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Bağlantı yorum izinlerini içermiyor (CHANNEL_PERMISSION_DENIED, details.missingScopes) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Oturum Facebook/Instagram bağlantısı taşımıyor ya da yorum yok */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Bağlantı geçersiz ya da yorum silinmiş */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description İstek sınırı; Retry-After başlığı */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Yorum kayıtları bu sunucuda etkin değil (CHANNEL_NOT_CONFIGURED) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    commentMarkRead: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MetaCommentMarkReadRequest"];
            };
        };
        responses: {
            /** @description Güncellenen yorum sayısı */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaCommentMarkReadResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Anahtar bu oturum için yetkili değil */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Oturum Facebook/Instagram bağlantısı taşımıyor ya da yorum yok */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Yorum kayıtları bu sunucuda etkin değil (CHANNEL_NOT_CONFIGURED) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    commentImport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MetaCommentImportRequest"];
            };
        };
        responses: {
            /** @description İçe aktarma özeti */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MetaCommentImportResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Bağlantı yorum izinlerini içermiyor (CHANNEL_PERMISSION_DENIED, details.missingScopes) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Oturum Facebook/Instagram bağlantısı taşımıyor ya da yorum yok */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Bağlantı geçersiz ya da yorum silinmiş */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description İstek sınırı; Retry-After başlığı */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
            /** @description Yorum kayıtları bu sunucuda etkin değil (CHANNEL_NOT_CONFIGURED) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChannelError"];
                };
            };
        };
    };
    leadsConfig: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Yapılandırma */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadsConfig"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsDiscover: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LeadsDiscoverRequest"];
            };
        };
        responses: {
            /** @description Sayfa listesi ve selectionRef */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadsDiscoverResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsConnect: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LeadsConnectRequest"];
            };
        };
        responses: {
            /** @description Bağlandı */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadsConnectResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsPages: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Sayfalar */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadPageListResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsDisconnect: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
                /** @description Facebook Sayfa kimliği */
                pageId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Ayrıldı */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadPage"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsForms: {
        parameters: {
            query?: {
                /** @description Yalnız bu Sayfanın formları */
                pageId?: string;
            };
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Formlar */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadFormListResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsFormsSync: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    pageId?: string;
                };
            };
        };
        responses: {
            /** @description Formlar */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadFormListResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsImport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
                /** @description Meta form kimliği */
                formId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["LeadImportRequest"];
            };
        };
        responses: {
            /** @description Başladı; ilerleme form görünümündeki import alanında */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadImportResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bu form için içe aktarma sürüyor (IMPORT_IN_PROGRESS) ya da Sayfa bağlı değil */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsList: {
        parameters: {
            query?: {
                /** @description Form kimliği */
                formId?: string;
                /** @description Sayfa kimliği */
                pageId?: string;
                /** @description Virgülle ayrılmış: new, contacted, qualified, discarded */
                status?: string;
                /** @description pending | fetched | failed */
                fetchStatus?: string;
                /** @description createdTime ≥ (ISO 8601 ya da Unix saniyesi) */
                since?: string;
                /** @description createdTime < (ISO 8601 ya da Unix saniyesi) */
                until?: string;
                /** @description updatedAt ≥; eşitleme için */
                updatedSince?: string;
                /** @description true ise yalnız okunmamışlar */
                unread?: string;
                /** @description 1–100, varsayılan 50 */
                limit?: number;
                /** @description Önceki yanıttaki nextCursor */
                cursor?: string;
            };
            header?: never;
            path: {
                instance: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lead’ler */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadListResponse"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsGet: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
                leadId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lead */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Lead"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsDelete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
                leadId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Silindi */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        id: string;
                        /** @constant */
                        deleted: true;
                    };
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsUpdate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
                leadId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LeadUpdateRequest"];
            };
        };
        responses: {
            /** @description Güncel lead */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Lead"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
    leadsRetry: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                instance: string;
                leadId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Kuyruğa alındı */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Lead"];
                };
            };
            /** @description Doğrulama hatası */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Kimlik doğrulanamadı */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Anahtar bu oturum için yetkili değil ya da Sayfanın lead erişimi yok (LEADS_ACCESS_DENIED) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Bulunamadı */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Sayfa bağlı değil, başka oturuma bağlı ya da token geçersiz */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Meta beklenmeyen bir hata döndürdü */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
            /** @description Lead formları bu sunucuda etkin değil */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LeadError"];
                };
            };
        };
    };
}

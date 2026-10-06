# Değişiklik günlüğü — n8n-nodes-wafixer

Etiketler `n8n-nodes-wafixer@x.y.z`; GitHub Releases notları commit mesajlarından üretilir.

## 0.3.0

Gereken: `wafixer-sdk` `^0.3.0`, wafixer.com 2.3.24.

### Yeni

- **Chat** kaynağı: Check WhatsApp Numbers, Get Many Messages (sayfalı), Get Chat, Get Many Chats, Get Many Contacts,
  Get Profile Picture, Block or Unblock, Archive or Unarchive, Mark as Unread.
- **Session** kaynağı: Get Many (oturum listesi), Get Connection State (QR oturumunda otomatik yeniden bağlanma
  durumu), Restart.
- **Message:** Send Video Note (PTV), Send Template (WhatsApp Cloud API), Post Status, Edit Message, Delete for
  Everyone, Download Media.
- **WAFixer Trigger:** sunucunun kabul ettiği bütün olaylar seçilebilir; yeni olanlar QR Code Updated, Message
  Edited, Outgoing Message Edited, Session Status / Logged Out / Deleted, Label Changed / Assigned, Typebot, Server
  Started, Session Created / Removed ve geçmiş eşitleme olayları. Liste SDK'daki `WEBHOOK_EVENTS`'ten türetilir.

### Değişiklikler

- Hiç olay seçilmezse geçmiş eşitleme olayları (Message History Synced, Contacts Synced, Chats Synced) dışındaki
  bütün olaylar kaydedilir.
- Message işlemleri ada göre sıralı.
- Kimlik bilgisinde Base URL açıklaması: varsayılan `https://wafixer.com`.

## 0.2.0

Gereken: `wafixer-sdk` `^0.2.0`, wafixer.com 2.3.12.

### Yeni

- **WAFixer** düğümüne **Resource** seçimi: Message (varsayılan; mevcut akışlar değişmeden çalışır), Comment, Lead.
- **Comment:** Get Many (imleçli, Return All / Limit, filtreler; her yorum gönderi özetiyle), Reply, Mark as Read
  (yorum kimlikleri, gönderi ya da hepsi), Import, Hide or Show, Delete, Private Reply (yorum sahibine DM).
- **Lead:** Get Many (Status çoklu seçim, Fetch Status, Form/Page ID, Unread Only, Since/Until, Updated Since),
  Get, Update (Status, Note, Read), Get Forms (isteğe bağlı Meta'dan eşitleme).
- **Send Text** ve **Reply to Message** için Messenger / Instagram seçenekleri: Quick Replies, Human Agent.
- **WAFixer Trigger:** Comment Received / Updated / Removed / Reply Sent / Private Reply Sent, Lead Received /
  Updated olayları; **Channels** seçeneği (WhatsApp, Messenger, Instagram).
- Oturum listesinde Messenger/Instagram oturumları kanal adıyla, bağlantısı düşmüş olanlar `Reconnect Required`
  olarak görünür.
- API hataları `NodeApiError` olarak gelir; pencere kapalı, kanalda olmayan işlem, eksik Meta izni, geçersiz
  bağlantı, hız sınırı, 7 günü geçmiş ya da ikinci kez gönderilen özel yanıt için açıklama yazılır. Continue On
  Fail çıktısında `code`, `status`, `details` var.

### Düzeltmeler

- **Group Updated** olayı sunucunun kabul ettiği `GROUP_UPDATE` adıyla kaydedilir; önceden seçildiğinde (ya da hiç olay
  seçilmediğinde) webhook kaydı 400 ile düşüyordu. Eski adla kaydedilmiş akışlar da etkinleştirilirken düzeltilir.

### Değişiklikler

- Düğüm açıklamaları İngilizce; **Number** alanı Messenger/Instagram için PSID/IGSID'yi anlatır.

## 0.1.2

- **Session** alanı listeden seçilir (`Active`, `QR Required`, `Connecting`, `Not Active`); ifadeyle ad vermek
  mümkün. Action ve Trigger düğümlerinde aynı.
- `wafixer-sdk` `^0.1.2`: **Send Location** yer adı / adres, **Send List** footer boş bırakıldığında istek 400
  dönmüyor.

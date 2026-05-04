# n8n-nodes-wafixer

WAFixer için **n8n community nodes** — gelen WhatsApp mesajlarını dinle, otomatik mesaj/medya gönder. Trigger ve action node'larıyla iki tıklamada akış kur.

## Kurulum

### Yöntem 1 — n8n GUI üzerinden (önerilen)

1. n8n'i aç → **Settings** → **Community Nodes**
2. **Install a community node** butonuna bas
3. Paket adına yaz: `n8n-nodes-wafixer`
4. **Install**

### Yöntem 2 — npm üzerinden manuel (self-hosted)

```bash
cd ~/.n8n/custom
npm install n8n-nodes-wafixer
```

n8n'i yeniden başlat. Node panelinde "WAFixer" ve "WAFixer Trigger" görünecek.

## Credential ekleme

1. n8n → **Credentials** → **New** → **WAFixer API**
2. **Base URL:** `https://wafixer.com` (kendi WAFixer URL'in)
3. **API Key:** Panel → **Ayarlar → API Anahtarları** sekmesinden **Yeni Anahtar Oluştur** ile üretilen `wfx_...` ile başlayan anahtar
4. **Test** butonuyla doğrula → ✓ yeşil
5. **Save**

> **Not:** Panel `wfx_` ön ekli kullanıcı anahtarlarını otomatik tanır. Anahtar bir kez gösterilir, kaybedersen yenisini üret.

## Node 1: WAFixer (Action)

Bir akışın içinde WhatsApp mesajı gönderir. **12 operation:**

| Operation | Ne yapar |
|---|---|
| **Send Text** | Düz metin |
| **Send Media** | Resim / video / döküman / audio (URL veya base64) |
| **Send Audio (PTT)** | Sesli mesaj |
| **Send Sticker** | Sticker |
| **Send Location** | Konum |
| **Send Contact** | Kişi kartı |
| **Send Reaction** | Mesaja emoji reaksiyon |
| **Send Poll** | Anket |
| **Send Buttons** | Butonlu interaktif mesaj |
| **Send List** | Listeli interaktif mesaj |
| **Reply to Message** | Trigger event'inden gelen mesaja alıntılı yanıt (en sık kullanım) |
| **Mark as Read** | Mesajları okundu işaretle |
| **Send Presence** | "Yazıyor / kaydediyor / online" |

**Instance Name** → panelde bağlı numaranın ismi (`SatisHatti`, `Deneme2` vb.)

## Node 2: WAFixer Trigger

Bir WAFixer instance'ında belirli olaylar gerçekleştiğinde akışı **otomatik tetikler**. Workflow aktif edildiğinde n8n webhook URL'ini WAFixer'a otomatik kaydeder, durdurulunca temizler.

**Dinlenebilir olaylar:**
- New Message (`messages.upsert`) — gelen mesaj
- Outgoing Message (`send.message`) — senin gönderdiğin mesaj
- Message Status (`messages.update`) — okundu / teslim edildi
- Connection State — bağlandı / koptu
- Yeni kişi, yeni grup, üye ekle/çıkar, çağrı, vb.

**Options:**
- **Send Media as Base64** — medyayı payload içine gömer (büyük payload, ama harici URL gerekmez)
- **Ignore Outgoing Messages** — kendi gönderdiğin mesajları filtreler

## Tipik Akış: Otomatik Yanıt Botu

```
[WAFixer Trigger]
   ↓ (yeni mesaj geldi)
[IF: text == "merhaba"]
   ↓
[WAFixer: Reply to Message]
   ↓ ("Merhaba, size nasıl yardımcı olabilirim?")
[WAFixer: Send Presence — composing 1500ms]
   ↓
[WAFixer: Mark as Read]
```

## Reply to Message — Önemli detay

Trigger node'un çıktısı ile Reply node'u sıralı bağlandığında, **Webhook Event** alanı otomatik olarak `={{ $json }}` ile dolar. Yani trigger'dan gelen tam payload'ı alır, alıntı (quoted) ve hedef numarayı kendisi çıkarır. Sen sadece **Reply Text** alanına yazdığın metni girersin.

## Versiyonlama

İlk versiyon: `0.1.0` (alpha). API yüzeyi stabilleşince `1.0.0`'a geçilir.

## Sorun giderme

**"Bu kanalda yetkin yok"**: API key panel'in global key'i mi, yoksa instance-specific token mu? Global olmalı.

**Trigger çalışmıyor**: Workflow'un **active** olması gerek (sağ üst toggle). Ayrıca WAFixer panelinden o instance'ın webhook ayarı el ile değiştirilmemeli — Trigger node otomatik yönetir.

**"Etkinliğe göre URL" konfüzyonu**: Trigger node `byEvents=false` set eder, kafa karışmasın diye.

## Lisans

MIT

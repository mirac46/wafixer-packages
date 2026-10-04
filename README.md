# wafixer-packages

[![Sürüm](https://img.shields.io/github/v/release/mirac46/wafixer-packages?label=s%C3%BCr%C3%BCm)](https://github.com/mirac46/wafixer-packages/releases)
[![CI](https://github.com/mirac46/wafixer-packages/actions/workflows/ci.yml/badge.svg)](https://github.com/mirac46/wafixer-packages/actions/workflows/ci.yml)
[![Release](https://github.com/mirac46/wafixer-packages/actions/workflows/release.yml/badge.svg)](https://github.com/mirac46/wafixer-packages/actions/workflows/release.yml)
[![npm wafixer-sdk](https://img.shields.io/npm/v/wafixer-sdk?label=wafixer-sdk)](https://www.npmjs.com/package/wafixer-sdk)
[![npm n8n-nodes-wafixer](https://img.shields.io/npm/v/n8n-nodes-wafixer?label=n8n-nodes-wafixer)](https://www.npmjs.com/package/n8n-nodes-wafixer)

WAFixer ekosistemi için resmi paket monorepo'su. Sürüm geçmişi ve yayın notları:
[Releases](https://github.com/mirac46/wafixer-packages/releases).

## Paketler

| Paket | Versiyon | Ne işe yarar |
|---|---|---|
| [`wafixer-sdk`](./packages/wafixer-sdk) | 0.2.0 | TypeScript SDK — WhatsApp, Messenger ve Instagram mesajları, Facebook/Instagram yorumları, Facebook Lead Ads, webhook olay tipleri |
| [`n8n-nodes-wafixer`](./packages/n8n-nodes-wafixer) | 0.2.0 | n8n community nodes — mesaj, yorum ve lead işlemleri; mesaj, yorum, lead ve bağlantı olaylarıyla tetikleyici |

## Sürümler

Her paketin sürümü kendi `package.json`'ındadır ve etiketi paket başınadır: `wafixer-sdk@0.2.0`,
`n8n-nodes-wafixer@0.2.0`. Ayrıntı: [RELEASING.md](./RELEASING.md).

`main`'e gelen her push'ta [`release.yml`](.github/workflows/release.yml) iki paketin sürümünü okur. Etiketi
olmayan paketi npm'e yayınlar (önce `wafixer-sdk`), `<paket>@<sürüm>` etiketini ve Türkçe yayın notlu GitHub
Release'i üretir. Sürüm değişmediyse bir şey yapmadan başarıyla biter. Elle etiket push'lanmaz.

```bash
npm version patch -w wafixer-sdk --no-git-tag-version
git add packages/wafixer-sdk/package.json package-lock.json
git commit -m "chore: wafixer-sdk 0.1.2"
git push origin main
```

Yayın notu, paketin önceki etiketinden bu yana yalnız o paketin klasörüne dokunan commit mesajlarından üretilir
(`feat` → Yeni, `fix` → Düzeltmeler, `refactor`/`perf` → Değişiklikler, `docs`/`chore`/`test`/`ci` → Belge ve
bakım, öneksiz → Diğer). Yerelde önizleme: `node scripts/release-notes.mjs --package wafixer-sdk`.

## Geliştirme

```bash
# kurulum
npm install

# tek seferde tüm paketleri build et
npm run build

# sadece SDK
npm run build -w wafixer-sdk

# sadece n8n nodes
npm run build -w n8n-nodes-wafixer
```

## Lokal n8n'e bağlama (yayın öncesi test)

```bash
# 1. SDK'yı global link yap
cd packages/wafixer-sdk
npm link

# 2. n8n nodes paketini SDK'ya link'le ve kendisini link et
cd ../n8n-nodes-wafixer
npm link wafixer-sdk
npm link

# 3. n8n custom dizininde link et
cd ~/.n8n/custom
npm link n8n-nodes-wafixer

# 4. n8n'i yeniden başlat
n8n start
```

## Elle yayın

Normal yol `main` push'udur (yukarıdaki "Sürümler"). İş akışı yarıda kalırsa elle yayın adımları
[RELEASING.md](./RELEASING.md) "Hata durumunda" bölümündedir. SDK sürümü artınca `n8n-nodes-wafixer`
içindeki `dependencies.wafixer-sdk` aralığını da güncelle.

## Lisans

MIT

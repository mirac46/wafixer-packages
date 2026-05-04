# wafixer-packages

[![CI](https://github.com/mirac46/wafixer-packages/actions/workflows/ci.yml/badge.svg)](https://github.com/mirac46/wafixer-packages/actions/workflows/ci.yml)
[![Release](https://github.com/mirac46/wafixer-packages/actions/workflows/release.yml/badge.svg)](https://github.com/mirac46/wafixer-packages/actions/workflows/release.yml)
[![npm wafixer-sdk](https://img.shields.io/npm/v/wafixer-sdk?label=wafixer-sdk)](https://www.npmjs.com/package/wafixer-sdk)
[![npm n8n-nodes-wafixer](https://img.shields.io/npm/v/n8n-nodes-wafixer?label=n8n-nodes-wafixer)](https://www.npmjs.com/package/n8n-nodes-wafixer)

WAFixer ekosistemi için resmi paket monorepo'su.

## Paketler

| Paket | Versiyon | Ne işe yarar |
|---|---|---|
| [`wafixer-sdk`](./packages/wafixer-sdk) | 0.1.0 | TypeScript SDK — herhangi bir Node.js projesinden mesaj gönderme |
| [`n8n-nodes-wafixer`](./packages/n8n-nodes-wafixer) | 0.1.0 | n8n community nodes — drag-and-drop entegrasyon |

## Yayın

Tag bazlı **otomatik npm publish** — detaylar: [RELEASING.md](./RELEASING.md)

```bash
# yeni sürüm yayınlamak için:
npm version patch -w wafixer-sdk
npm version patch -w n8n-nodes-wafixer
git add packages/*/package.json
git commit -m "chore: release v0.1.1"
git tag v0.1.1
git push origin main --tags
# → GitHub Actions npm'e otomatik publish eder
```

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

## Yayın akışı

Önce SDK, sonra n8n-nodes (n8n-nodes SDK'ya bağımlı):

```bash
# SDK
cd packages/wafixer-sdk
npm run build
npm publish

# n8n nodes
cd ../n8n-nodes-wafixer
npm run build
npm publish
```

İlk yayında `npm login` ile (npm kullanıcı adın: `wafixer`) hesabına giriş yap.

## Sürüm artırma

```bash
# semver bump (her iki paket için)
npm version patch -w wafixer-sdk
npm version patch -w n8n-nodes-wafixer
```

n8n nodes paketinde `dependencies.wafixer-sdk` versiyonunu yeni SDK sürümüne güncellemeyi unutma.

## Lisans

MIT

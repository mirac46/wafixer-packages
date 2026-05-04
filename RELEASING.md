# Yayın Rehberi (Releasing)

Bu paketler **GitHub Actions ile otomatik** olarak npm'e yayınlanıyor. Manuel `npm publish` çalıştırmana gerek yok — sadece git tag pushlamak yeterli.

## Tek seferlik kurulum

### 1. npm Access Token al

1. https://www.npmjs.com/ → giriş yap (kullanıcı adın `wafixer`)
2. Sağ üstteki avatar → **Access Tokens** → **Generate New Token** → **Classic Token**
3. **Type: Automation** (CI için tasarlanmış, 2FA atlatır)
4. Oluşturulan token'ı kopyala (sadece bir kez gösterilir)

### 2. Token'ı GitHub repo'ya ekle

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. **Name:** `NPM_TOKEN`
4. **Secret:** kopyaladığın token'ı yapıştır
5. **Add secret**

Bu token GitHub Actions'ın npm'e push yapabilmesi için gerekli — başka bir yerde görünmez.

## Yayın akışı

### A) Sürüm artırma (otomatik)

Yarı-otomatik: tek komutla iki paketi de bump edersin.

```bash
# Patch sürümü artır (0.1.0 → 0.1.1)
npm version patch -w wafixer-sdk
npm version patch -w n8n-nodes-wafixer

# Minor (0.1.0 → 0.2.0)
npm version minor -w wafixer-sdk
npm version minor -w n8n-nodes-wafixer

# Major (0.1.0 → 1.0.0)
npm version major -w wafixer-sdk
npm version major -w n8n-nodes-wafixer
```

**Önemli:** n8n-nodes-wafixer içindeki `dependencies.wafixer-sdk` versiyonunu da güncelle:

```bash
# package.json'da: "wafixer-sdk": "^0.1.1" → "^0.1.2" gibi
```

### B) Commit + tag + push

```bash
git add packages/*/package.json
git commit -m "chore: release v0.1.1"
git tag v0.1.1
git push origin main --tags
```

### C) GitHub Actions devreyi devralır

`v*` tag'i push edilince [`.github/workflows/release.yml`](.github/workflows/release.yml) tetiklenir:

1. ✅ `npm ci` — bağımlılıkları kur
2. ✅ `npm run build` — iki paketi de derle
3. ✅ `npm run lint` — n8n linter
4. ✅ `npm run test` — vitest
5. ✅ `npm publish` (wafixer-sdk) — provenance ile
6. ⏱ 30 saniye bekle (SDK npm registry'de yansısın)
7. ✅ `npm publish` (n8n-nodes-wafixer) — SDK'yı dependency olarak çeker
8. ✅ GitHub Release oluştur — otomatik changelog ile

Süreç **GitHub repo → Actions sekmesinden** canlı izlenebilir.

## Yayın sonrası kontrol

```bash
npm view wafixer-sdk version
npm view n8n-nodes-wafixer version
```

İkisi de yeni sürümü göstermeli.

n8n cloud / self-hosted'da:

- Settings → Community Nodes → "Update available" görünmeli
- Mevcut yüklemeler için: **Update**

## Hata durumunda

### Yayın yarıda kaldı (sadece SDK yayınlandı, n8n-nodes patladı)

```bash
# n8n-nodes paketinin manuel publish'i:
cd packages/n8n-nodes-wafixer
npm publish --access public
```

### Yanlış sürüm yayınladım

npm'de bir sürümü **silmek** mümkün ama **72 saatlik pencere** var ve kullanılan bir paketse sınırlamalar var. Genelde:

```bash
# 72 saat içinde:
npm unpublish wafixer-sdk@0.1.1

# Sonrası deprecate etmek daha iyi:
npm deprecate wafixer-sdk@0.1.1 "0.1.2 kullanın, 0.1.1 hatalı"
```

Yeni bir patch (`0.1.2`) ile düzeltmek her zaman daha temiz.

## Pre-release sürümler (alpha/beta)

```bash
# Beta tag'i ile yayınla — kullanıcılar @beta ile çekecek
npm version 0.2.0-beta.1 -w wafixer-sdk
git tag v0.2.0-beta.1
git push --tags
```

Workflow buna göre bir küçük güncelleme isteyebilir (`npm publish --tag beta`); şu anki workflow latest tag'e push ediyor.

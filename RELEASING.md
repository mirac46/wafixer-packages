# Yayın Rehberi (Releasing)

Bu paketler **GitHub Actions ile otomatik** olarak npm'e yayınlanır. Elle `npm publish` ya da etiket push'u
gerekmez: paketin sürümünü artırıp `main`'e push etmek yeterlidir.

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

### A) Sürüm artırma

İki paket bağımsız sürümlenir; yalnız değişen paketin sürümünü artır.

```bash
# Patch (0.1.1 → 0.1.2)
npm version patch -w wafixer-sdk --no-git-tag-version

# Minor (0.1.1 → 0.2.0) ya da Major (0.1.1 → 1.0.0)
npm version minor -w n8n-nodes-wafixer --no-git-tag-version
npm version major -w wafixer-sdk --no-git-tag-version
```

**Önemli:** SDK sürümü artınca n8n-nodes-wafixer içindeki `dependencies.wafixer-sdk` aralığını da güncelle
(`"wafixer-sdk": "^0.1.1"` → `"^0.1.2"` gibi).

### B) Commit + push

```bash
git add packages/wafixer-sdk/package.json package-lock.json
git commit -m "chore: wafixer-sdk 0.1.2"
git push origin main
```

Etiketi elle oluşturma; iş akışı oluşturur.

### C) GitHub Actions devreyi devralır

`main` push'u [`.github/workflows/release.yml`](.github/workflows/release.yml) iş akışını tetikler:

1. Her paketin sürümü okunur. `<paket>@<sürüm>` etiketi varsa ya da sürüm eski `vX.Y.Z` etiketiyle yayınlandıysa
   o paket atlanır.
2. Yayınlanacak paket varsa `npm ci`, `npm run build`, `npm run lint`, `npm run test`.
3. `wafixer-sdk`: bu sürüm npm'de yoksa `npm publish --provenance`; ardından `wafixer-sdk@<sürüm>` etiketi ve
   GitHub Release.
4. İki paket birlikte yayınlanıyorsa 30 saniye beklenir (SDK npm kayıt defterinde görünsün).
5. `n8n-nodes-wafixer`: aynı adımlar, `n8n-nodes-wafixer@<sürüm>` etiketi.

Yayın notu, paketin önceki etiketinden bu yana o paketin klasörüne dokunan commit mesajlarından Türkçe gruplarla
üretilir (`scripts/release-notes.mjs`). Süreç **GitHub repo → Actions sekmesinden** canlı izlenebilir.

## Yayın sonrası kontrol

```bash
npm view wafixer-sdk version
npm view n8n-nodes-wafixer version
```

İkisi de yeni sürümü göstermeli; Releases sayfasında `<paket>@<sürüm>` başlıklı yayın görünmeli.

n8n cloud / self-hosted'da:

- Settings → Community Nodes → "Update available" görünmeli
- Mevcut yüklemeler için: **Update**

## Hata durumunda

### Yayın yarıda kaldı

Actions'ta iş akışını yeniden çalıştır (**Re-run jobs**). npm'de zaten olan sürüm yeniden yayınlanmaz; eksik
etiket ve Release tamamlanır. Etiket oluştu ama Release oluşmadıysa Release'i Releases sayfasından elle aç.

Son çare elle yayın:

```bash
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

İş akışı her sürümü npm'de `latest` etiketiyle yayınlar; `0.2.0-beta.1` gibi bir sürümü `main`'e göndermek onu
herkesin varsayılan sürümü yapar. Beta yayını için iş akışına `npm publish --tag beta` desteği eklenene kadar
beta sürümleri `main` dışında elle yayınla:

```bash
npm version 0.2.0-beta.1 -w wafixer-sdk --no-git-tag-version
cd packages/wafixer-sdk
npm publish --tag beta --access public
```

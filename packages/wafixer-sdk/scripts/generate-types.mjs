#!/usr/bin/env node
// Kanal sözleşmesinin OpenAPI belgesinden src/generated/channels-v1.ts dosyasını üretir.
// Belgenin kaynağı wafixer.com deposudur (packages/contracts → backend/openapi/channels-v1.openapi.json);
// buradaki kopya sürümlenir ki tip üretimi ağ ya da komşu depo olmadan tekrarlanabilsin.
//
//   node scripts/generate-types.mjs                  üretir
//   node scripts/generate-types.mjs --check          üretilen dosya belgeyle uyuşmuyorsa çıkış kodu 1
//   node scripts/generate-types.mjs --source <yol>   önce belgeyi bu yoldan kopyalar, sonra üretir

import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

import openapiTS, { astToString } from 'openapi-typescript'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SPEC = join(ROOT, 'openapi', 'channels-v1.openapi.json')
const OUTPUT = join(ROOT, 'src', 'generated', 'channels-v1.ts')

function header(spec) {
  return [
    '// Bu dosya üretilir, elle düzenlenmez: npm run generate:types -w wafixer-sdk',
    `// Kaynak: openapi/channels-v1.openapi.json (${spec.info.title} ${spec.info.version})`,
    '',
  ].join('\n')
}

export async function render() {
  const spec = JSON.parse(readFileSync(SPEC, 'utf8'))
  const ast = await openapiTS(spec)
  return `${header(spec)}\n${astToString(ast)}`
}

const normalize = (text) => text.replace(/\r\n/g, '\n')

async function main() {
  const { values } = parseArgs({ options: { check: { type: 'boolean' }, source: { type: 'string' } } })
  if (values.source) copyFileSync(values.source, SPEC)
  const contents = await render()
  if (values.check) {
    const current = normalize(readFileSync(OUTPUT, 'utf8'))
    if (current !== normalize(contents)) {
      console.error('src/generated/channels-v1.ts OpenAPI belgesiyle uyuşmuyor; npm run generate:types -w wafixer-sdk')
      process.exit(1)
    }
    console.log('src/generated/channels-v1.ts güncel')
    return
  }
  writeFileSync(OUTPUT, contents)
  console.log(`üretildi: ${OUTPUT}`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}

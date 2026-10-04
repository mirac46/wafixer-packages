import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('generated contract types', () => {
  it('src/generated/channels-v1.ts matches openapi/channels-v1.openapi.json', () => {
    const script = join(__dirname, '..', '..', 'scripts', 'generate-types.mjs')
    const result = spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' })
    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  }, 30_000)
})

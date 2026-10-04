import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// Testler SDK'nın kaynağıyla çalışır; SDK'yı önce derlemek gerekmez.
export default defineConfig({
  resolve: { alias: { 'wafixer-sdk': resolve(__dirname, '../wafixer-sdk/src/index.ts') } },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
})

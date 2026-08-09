import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'webkit',
    include: ['tests/browser/**/*.test.js'],
    browser: { enabled: true, provider: playwright(), instances: [{ browser: 'webkit' }] },
  },
})

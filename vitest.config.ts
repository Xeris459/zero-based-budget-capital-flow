import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': resolve(__dirname, './app'),
      '#imports': resolve(__dirname, './test/nuxt-stubs.ts')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 15000,
    hookTimeout: 15000,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.ts'],
    css: false,
    coverage: {
      include: [
        'app/components/**/*.{vue,ts}',
        'app/stores/**/*.ts',
        'src-tauri/src/**/*.rs'
      ],
      exclude: [
        '**/app/pages/**',
        '**/app/app.vue'
      ]
    }
  }
})

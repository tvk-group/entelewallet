import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/**/src/**/*.test.ts', 'apps/web/src/**/*.test.ts'],
    passWithNoTests: false,
    coverage: {
      reporter: ['text', 'json-summary'],
    },
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web/src'),
      '@entelewallet/config': path.resolve(__dirname, 'packages/config/src'),
      '@entelewallet/wallet-core': path.resolve(__dirname, 'packages/wallet-core/src'),
      '@entelewallet/utils': path.resolve(__dirname, 'packages/utils/src'),
      '@entelewallet/security': path.resolve(__dirname, 'packages/security/src'),
      '@entelewallet/types': path.resolve(__dirname, 'packages/types/src'),
    },
  },
});

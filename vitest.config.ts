import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, 'src').replaceAll('\\', '/');

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      exclude: [
        'dist/**',
        '*.*.cjs',
        'src/*.ts',
        'src/common/**',
        'src/**/entities/**',
        '**/*.d.ts',
        '**/*.config.{ts,js,cjs}',
        'src/**/index.ts',
      ],
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: [
      // Support TS path alias used in the codebase
      { find: /^@\/(.*)\.js$/, replacement: `${srcDir}/$1` },
      { find: /^@\/(.*)$/, replacement: `${srcDir}/$1` },

      // Support imports that end with `.js` while running TS tests
      { find: /^(\.{1,2}\/.*)\.js$/, replacement: '$1' },
    ],
  },
});

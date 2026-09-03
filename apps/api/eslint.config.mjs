// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Derived from import.meta.url rather than import.meta.dirname: the latter
// needs Node >= 20.11, and editor ESLint runs inside the editor's bundled
// Node, not the terminal's. When it is undefined, tsconfigRootDir falls back
// to process.cwd(), tsconfig.json is never found, and every import resolves
// to TypeScript's error type -- surfacing as "Unsafe call of a type that
// could not be resolved" on lines the CLI reports as clean.
const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'node_modules', '.husky/_'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // The no-unsafe-* family fires on values TypeScript could not type, or
      // typed as any. Joi, Nest's config/Swagger builders and helmet surface
      // enough of both that these rules cost more noise than they catch, and
      // they misfire wholesale whenever type resolution hiccups in an editor.
      // Disabled centrally so no source file needs its own eslint-disable
      // header. Genuine type errors are still caught by tsc --noEmit, which
      // runs in the pre-push hook.
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    // Root config files (eslint.config.mjs, commitlint.config.js) sit outside
    // tsconfig's project, so type-aware rules cannot run on them. Without this
    // they fail to parse the moment an editor lints an open config file.
    // Must stay last so it overrides the type-aware rules enabled above.
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
);

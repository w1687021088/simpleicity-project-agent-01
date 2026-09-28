import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // ---------- React Hooks ----------
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',

      // ---------- 代码错误 ----------
      'no-console': 0,
      'no-debugger': 0,

      // ---------- 最佳实践 ----------
      eqeqeq: 2,
      'default-case': 2,
      'no-else-return': 2,
      'no-empty-function': 0, // 允许空函数（保留箭头占位）
      'no-multi-spaces': 2,
      radix: 1,

      // ---------- 风格（与 Prettier 不冲突的） ----------
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'spaced-comment': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],

      // ---------- ES6+ ----------
      'no-var': 2,
      'object-shorthand': 2,
      'prefer-arrow-callback': 2,
      'prefer-const': 2,
      'prefer-rest-params': 2,

      // ---------- TypeScript ----------
      '@typescript-eslint/no-unused-vars': [
        1,
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-var-requires': 0,
    },
  },
  prettierConfig,
]);

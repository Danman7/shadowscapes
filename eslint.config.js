import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'storybook-static/**',
      '**/*.min.*',
      '**/node_modules/**',
    ],
  },

  // JS recommended rules for plain JS files (repo is mostly TS/TSX).
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // TypeScript rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Core JS rules that conflict with TS
      'no-unused-vars': 'off',

      // TS equivalents
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // React + hooks + import sorting
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSortPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // Import sorting (auto-fixable)
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 3rd party + side-effect imports
            ['^\\u0000', '^@?\\w'],
            // Internal imports (alias + relative)
            ['^@/', '^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  // Enforce @/ imports within src (TS/TSX only).
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./**', '../**'],
              message: 'Use @/… absolute imports within src/.',
            },
          ],
        },
      ],
    },
  },

  // Allow Bun's HTML entry import.
  {
    files: ['src/index.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },

  // Disable rules that would conflict with Prettier.
  prettierConfig,
]

import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

const absoluteSrcImportsOnly = {
  group: ['./**', '../**'],
  message: 'Use src/… absolute imports within src/.',
}

const noRestrictedImports = (patterns = []) => [
  'error',
  {
    patterns: [absoluteSrcImportsOnly, ...patterns],
  },
]

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
      'no-unused-vars': 'off',
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
      'react/prop-types': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000', '^@?\\w'],
            ['^\\.', '^src/'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': noRestrictedImports(),
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/components/Card/**',
      'src/components/DuelView/**',
      'src/game-engine/cards/**',
      'src/game-engine/constants/**',
      'src/game-engine/duel/**',
      'src/game-engine/mocks/**',
      'src/game-engine/testing.ts',
      'src/game-engine/utils/**',
    ],
    rules: {
      'no-restricted-imports': noRestrictedImports([
        {
          group: [
            'src/components/Card/*',
            'src/components/DuelView/*',
            'src/game-engine/cards/*',
            'src/game-engine/constants/*',
            'src/game-engine/duel/*',
            'src/game-engine/duel/reducers/*',
            'src/game-engine/mocks',
            'src/game-engine/mocks/*',
            'src/game-engine/utils/*',
          ],
          message: 'Import from the owning module barrel instead.',
        },
      ]),
    },
  },
  {
    files: ['src/index.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  prettierConfig,
]

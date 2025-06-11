import eslint from '@eslint/js'
import * as eslintPluginImport from 'eslint-plugin-import'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  { ignores: ['coverage', 'node-modules'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  reactRefresh.configs.vite,
  reactHooks.configs['recommended-latest'],
  reactPlugin.configs.flat['jsx-runtime'],
  {
    name: 'import/order',
    plugins: { import: eslintPluginImport },
    rules: {
      'import/order': [
        'error',
        {
          groups: ['external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: 'src/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
)

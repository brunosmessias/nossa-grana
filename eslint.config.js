import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    ignores: ['node_modules', '.next', 'dist', 'drizzle', '*.config.{js,mjs,cjs}', '.eslintrc*'],
  },
  {
    files: ['**/seed/legacy/**', '**/sidebar.tsx'],
    rules: { 'max-lines': 'off' },
  },
];

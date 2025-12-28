module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Allow using `any` in select places during rapid prototyping
    '@typescript-eslint/no-explicit-any': 'off',
    // These can be tightened later as needed
    '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-ignore': 'allow-with-description' }],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}

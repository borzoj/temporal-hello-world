module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: ['standard'],
  extends: [
    'standard-with-typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],

  rules: {
    'object-shorthand': ['error', 'always'],
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-throw-literal': 'off'
  }
};

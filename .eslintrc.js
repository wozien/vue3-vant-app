const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      tsx: true, // Allows for the parsing of JSX
      jsx: true
    }
  },
  rules: {
    'no-console': isProd ?  'error' : 'off',
    'no-debugger': isProd ?  'error' : 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'no-restricted-syntax': [
      'warn',
      {
        selector:
          'CallExpression[callee.object.name=\'console\'][callee.property.name!=/^(log|warn|error|info|trace)$/]',
        message: 'Unexpected property on console object was called'
      }
    ],
    // 闭合标签
    'vue/html-self-closing': 'off',
    'vue/no-parsing-error': [2, {
      'x-invalid-end-tag': false
    }],
    'quotes': [2, 'single'],
    'no-case-declarations': 'off'
  }
}